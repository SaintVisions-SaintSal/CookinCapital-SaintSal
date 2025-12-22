import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SUBSCRIPTION_TIERS } from '@/lib/utils';
import {
  MessageSquare,
  Home,
  Briefcase,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  const tier = profile?.subscription_tier || 'free';
  const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  const queriesUsed = profile?.queries_used || 0;
  const scoresUsed = profile?.property_scores_used || 0;
  const queriesLimit = tierConfig.queries === -1 ? Infinity : tierConfig.queries;
  const scoresLimit = tierConfig.propertyScores === -1 ? Infinity : tierConfig.propertyScores;

  // Get stats
  const { count: conversationsCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id);

  const { count: propertiesCount } = await supabase
    .from('property_scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id);

  const { count: dealsCount } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id);

  const { count: referralsCount } = await supabase
    .from('affiliate_referrals')
    .select('*', { count: 'exact', head: true })
    .eq('affiliate_id', user?.id);

  const stats = [
    { name: 'Conversations', value: conversationsCount || 0, icon: MessageSquare, href: '/dashboard/chat' },
    { name: 'Properties Scored', value: propertiesCount || 0, icon: Home, href: '/dashboard/properties' },
    { name: 'Active Deals', value: dealsCount || 0, icon: Briefcase, href: '/dashboard/deals' },
    { name: 'Referrals', value: referralsCount || 0, icon: Users, href: '/dashboard/affiliates' },
  ];

  const quickActions = [
    { name: 'New Chat', description: 'Start a conversation with AI', icon: MessageSquare, href: '/dashboard/chat' },
    { name: 'Score Property', description: 'Analyze a new property', icon: Home, href: '/dashboard/properties' },
    { name: 'Add Deal', description: 'Create a new deal', icon: Briefcase, href: '/dashboard/deals' },
    { name: 'Trading', description: 'Access trading platform', icon: TrendingUp, href: '/dashboard/trading' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your SaintSal activity
        </p>
      </div>

      {/* Usage section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Queries Used</CardTitle>
            <CardDescription>
              {queriesUsed} / {queriesLimit === Infinity ? 'Unlimited' : queriesLimit} this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress
              value={queriesLimit === Infinity ? 0 : (queriesUsed / queriesLimit) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Property Scores Used</CardTitle>
            <CardDescription>
              {scoresUsed} / {scoresLimit === Infinity ? 'Unlimited' : scoresLimit} this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress
              value={scoresLimit === Infinity ? 0 : (scoresUsed / scoresLimit) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg gold-gradient flex items-center justify-center mb-2">
                    <action.icon className="h-5 w-5 text-black" />
                  </div>
                  <CardTitle className="text-base">{action.name}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Subscription info */}
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {tierConfig.name} Plan
              </CardTitle>
              <CardDescription>
                {tier === 'free' ? 'Upgrade to unlock more features' : 'Your current subscription'}
              </CardDescription>
            </div>
            {tier === 'free' && (
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium gold-gradient text-black h-9 px-4 hover:opacity-90 transition-opacity"
              >
                Upgrade
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tierConfig.features.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
