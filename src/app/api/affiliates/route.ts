import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateId } from '@/lib/utils';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Generate referral code if not exists
    if (!profile?.referral_code) {
      const referralCode = generateId();
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({
          referral_code: referralCode,
          affiliate_status: profile?.affiliate_status || 'junior',
        })
        .eq('id', user.id)
        .select()
        .single();
      profile = updatedProfile;
    }

    // Get referrals
    const { data: referrals } = await supabase
      .from('affiliate_referrals')
      .select(`
        *,
        user:referred_user_id (
          email,
          subscription_tier
        )
      `)
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false });

    // Calculate stats
    const activeReferrals = referrals?.filter((r) => r.status === 'active') || [];
    const totalPaid = referrals?.reduce((sum, r) => sum + (r.total_paid || 0), 0) || 0;

    // Get this month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyPayouts } = await supabase
      .from('affiliate_payouts')
      .select('amount')
      .eq('affiliate_id', user.id)
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    const monthlyEarnings = monthlyPayouts?.reduce((sum, p) => sum + p.amount, 0) || 0;

    const { data: pendingPayouts } = await supabase
      .from('affiliate_payouts')
      .select('amount')
      .eq('affiliate_id', user.id)
      .eq('status', 'pending');

    const pendingEarnings = pendingPayouts?.reduce((sum, p) => sum + p.amount, 0) || 0;

    const stats = {
      totalReferrals: referrals?.length || 0,
      activeReferrals: activeReferrals.length,
      totalEarnings: profile?.total_earnings || totalPaid,
      pendingEarnings,
      monthlyEarnings,
      referralCode: profile?.referral_code,
      affiliateStatus: profile?.affiliate_status || 'junior',
      stripeConnected: !!profile?.stripe_connect_id,
    };

    return NextResponse.json({ stats, referrals: referrals || [] });
  } catch (error) {
    console.error('Affiliates GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliate data' }, { status: 500 });
  }
}
