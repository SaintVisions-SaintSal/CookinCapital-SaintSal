'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  DollarSign,
  Copy,
  Check,
  TrendingUp,
  ExternalLink,
  Loader2,
  Gift,
} from 'lucide-react';

interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  monthlyEarnings: number;
  referralCode: string;
  affiliateStatus: 'none' | 'junior' | 'vp';
  stripeConnected: boolean;
}

interface Referral {
  id: string;
  referred_user_id: string;
  status: 'pending' | 'active' | 'cancelled';
  commission_rate: number;
  total_paid: number;
  created_at: string;
  user?: {
    email: string;
    subscription_tier: string;
  };
}

export default function AffiliatesPage() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch('/api/affiliates');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error('Failed to fetch affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${stats.referralCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const connectStripe = async () => {
    setConnectingStripe(true);
    try {
      const response = await fetch('/api/affiliates/connect', {
        method: 'POST',
      });
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to connect Stripe:', error);
    } finally {
      setConnectingStripe(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const referralLink = stats?.referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${stats.referralCode}`
    : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Program</h1>
        <p className="text-muted-foreground">
          Earn 30% recurring commissions for every referral
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeReferrals || 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingEarnings ? `${formatCurrency(stats.pendingEarnings)} pending` : 'No pending'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {stats?.affiliateStatus === 'vp' ? 'VP Partner' : stats?.affiliateStatus || 'Junior'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.affiliateStatus === 'vp' ? '30% + 15% override' : '30% commission'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link to earn commissions on every signup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={copyReferralLink}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Share your unique referral link</li>
                <li>When someone signs up and subscribes, you earn 30%</li>
                <li>Commissions are recurring as long as they stay subscribed</li>
                <li>Payouts are processed same-day via Stripe Connect</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Stripe Connect */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
            <CardDescription>
              Connect your Stripe account to receive instant payouts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.stripeConnected ? (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Stripe Connected</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  You&apos;re all set to receive payouts!
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-900">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Connect your Stripe account to receive affiliate commissions
                  </p>
                </div>
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={connectStripe}
                  disabled={connectingStripe}
                >
                  {connectingStripe ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect Stripe Account
                    </>
                  )}
                </Button>
              </>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Commission Structure</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Junior Affiliate</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>VP Partner</span>
                    <span className="font-medium">30% + 15% override</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Become a VP Partner by referring 10+ active subscribers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>
            Track your referrals and their subscription status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground">
                Share your referral link to start earning
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{referral.user?.email || 'User'}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          referral.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : referral.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {referral.status}
                      </span>
                      <span>{referral.user?.subscription_tier || 'Free'} plan</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(referral.total_paid)}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(referral.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
