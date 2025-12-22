import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createConnectAccount, createConnectAccountLink } from '@/lib/stripe';

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_id, email')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let accountId = profile.stripe_connect_id;

    // Create Stripe Connect account if not exists
    if (!accountId) {
      const account = await createConnectAccount({
        email: profile.email || user.email!,
        metadata: {
          user_id: user.id,
        },
      });

      accountId = account.id;

      // Save to profile
      await supabase
        .from('profiles')
        .update({ stripe_connect_id: accountId })
        .eq('id', user.id);
    }

    // Create account link for onboarding
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accountLink = await createConnectAccountLink({
      accountId,
      refreshUrl: `${origin}/dashboard/affiliates?refresh=true`,
      returnUrl: `${origin}/dashboard/affiliates?connected=true`,
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Affiliate connect error:', error);
    return NextResponse.json({ error: 'Failed to create Stripe connection' }, { status: 500 });
  }
}
