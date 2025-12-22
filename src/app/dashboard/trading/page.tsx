'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Lock } from 'lucide-react';
import Link from 'next/link';

export default function TradingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trading Platform</h1>
        <p className="text-muted-foreground">
          Execute trades via Alpaca integration
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">Teams Plan Required</CardTitle>
          <CardDescription className="text-center max-w-md mb-6">
            The trading platform is available for Teams and Enterprise subscribers.
            Upgrade your plan to access real-time trading, portfolio management, and automated strategies.
          </CardDescription>
          <Link href="/dashboard/settings">
            <Button variant="gold">
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade to Teams
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real-time Trading</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Execute buy and sell orders directly through our Alpaca integration with real-time market data.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your positions, view performance analytics, and manage your entire portfolio in one place.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get AI-driven market analysis, trade recommendations, and risk assessments for your investments.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
