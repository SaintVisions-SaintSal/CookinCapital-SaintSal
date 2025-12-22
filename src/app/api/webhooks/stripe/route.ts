import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, createTransfer } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

const COMMISSION_RATE = 0.30; // 30%
const VP_OVERRIDE_RATE = 0.15; // 15% override for VP partners

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Get user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, referred_by')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          // Update subscription
          await supabase
            .from('profiles')
            .update({
              stripe_subscription_id: subscriptionId,
              subscription_tier: session.metadata?.tier || 'starter',
            })
            .eq('id', profile.id);

          // Handle affiliate commission
          if (profile.referred_by) {
            const { data: affiliateProfile } = await supabase
              .from('profiles')
              .select('id, stripe_connect_id, affiliate_status')
              .eq('referral_code', profile.referred_by)
              .single();

            if (affiliateProfile) {
              // Create or update referral record
              await supabase
                .from('affiliate_referrals')
                .upsert({
                  affiliate_id: affiliateProfile.id,
                  referred_user_id: profile.id,
                  status: 'active',
                  commission_rate: COMMISSION_RATE,
                });
            }
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const amount = invoice.amount_paid;

        // Get user and their referrer
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, referred_by')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile?.referred_by) {
          const { data: affiliateProfile } = await supabase
            .from('profiles')
            .select('id, stripe_connect_id, affiliate_status, referred_by')
            .eq('referral_code', profile.referred_by)
            .single();

          if (affiliateProfile?.stripe_connect_id) {
            // Calculate commission
            const commission = Math.floor(amount * COMMISSION_RATE);

            // Create transfer to affiliate
            try {
              const transfer = await createTransfer({
                amount: commission,
                destinationAccountId: affiliateProfile.stripe_connect_id,
                metadata: {
                  affiliate_id: affiliateProfile.id,
                  referred_user_id: profile.id,
                  invoice_id: invoice.id,
                },
              });

              // Record payout
              await supabase.from('affiliate_payouts').insert({
                affiliate_id: affiliateProfile.id,
                amount: commission / 100, // Convert to dollars
                stripe_transfer_id: transfer.id,
                status: 'completed',
              });

              // Update affiliate earnings
              await supabase.rpc('increment_affiliate_earnings', {
                affiliate_id: affiliateProfile.id,
                amount: commission / 100,
              });

              // Update referral total paid
              await supabase
                .from('affiliate_referrals')
                .update({
                  total_paid: supabase.rpc('increment', { x: commission / 100 }),
                })
                .eq('affiliate_id', affiliateProfile.id)
                .eq('referred_user_id', profile.id);

              // Handle VP override if applicable
              if (affiliateProfile.referred_by) {
                const { data: vpProfile } = await supabase
                  .from('profiles')
                  .select('id, stripe_connect_id, affiliate_status')
                  .eq('referral_code', affiliateProfile.referred_by)
                  .single();

                if (vpProfile?.affiliate_status === 'vp' && vpProfile.stripe_connect_id) {
                  const override = Math.floor(amount * VP_OVERRIDE_RATE);

                  const vpTransfer = await createTransfer({
                    amount: override,
                    destinationAccountId: vpProfile.stripe_connect_id,
                    metadata: {
                      affiliate_id: vpProfile.id,
                      override_from: affiliateProfile.id,
                      invoice_id: invoice.id,
                    },
                  });

                  await supabase.from('affiliate_payouts').insert({
                    affiliate_id: vpProfile.id,
                    amount: override / 100,
                    stripe_transfer_id: vpTransfer.id,
                    status: 'completed',
                  });

                  await supabase.rpc('increment_affiliate_earnings', {
                    affiliate_id: vpProfile.id,
                    amount: override / 100,
                  });
                }
              }
            } catch (transferError) {
              console.error('Transfer failed:', transferError);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const tierMap: Record<string, string> = {
          [process.env.STRIPE_STARTER_PRICE_ID!]: 'starter',
          [process.env.STRIPE_PRO_PRICE_ID!]: 'pro',
          [process.env.STRIPE_TEAMS_PRICE_ID!]: 'teams',
          [process.env.STRIPE_ENTERPRISE_PRICE_ID!]: 'enterprise',
        };

        const priceId = subscription.items.data[0]?.price.id;
        const tier = tierMap[priceId] || 'free';

        await supabase
          .from('profiles')
          .update({ subscription_tier: tier })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId);

        // Update referral status
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase
            .from('affiliate_referrals')
            .update({ status: 'cancelled' })
            .eq('referred_user_id', profile.id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
