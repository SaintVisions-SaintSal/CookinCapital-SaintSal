import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  Home,
  Briefcase,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Star
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Chat',
    description: 'Multi-model support with GPT-4, Claude, Gemini, and Grok',
  },
  {
    icon: Home,
    title: 'Property Scoring',
    description: 'Instant AI-powered investment analysis for real estate',
  },
  {
    icon: Briefcase,
    title: 'Deal Pipeline',
    description: 'Full lending portal with CRM integration',
  },
  {
    icon: TrendingUp,
    title: 'Trading Platform',
    description: 'Execute trades via Alpaca integration',
  },
  {
    icon: Users,
    title: 'Affiliate Program',
    description: '30% recurring commissions with instant payouts',
  },
  {
    icon: Zap,
    title: 'GHL Integration',
    description: 'Full CRM and marketing automation',
  },
];

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['50 AI queries', '5 property scores', 'Basic support'],
  },
  {
    name: 'Starter',
    price: '$27',
    period: '/month',
    features: ['500 AI queries', '50 property scores', 'Voice chat', 'Email support'],
  },
  {
    name: 'Pro',
    price: '$97',
    period: '/month',
    popular: true,
    features: ['Unlimited queries', 'Unlimited scores', 'War Room access', 'Coding agent', 'Priority support'],
  },
  {
    name: 'Teams',
    price: '$297',
    period: '/month',
    features: ['Everything in Pro', 'Trading platform', 'Unlimited team', 'Admin dashboard'],
  },
  {
    name: 'Enterprise',
    price: '$497',
    period: '/month',
    features: ['Everything in Teams', 'API access', 'White-label option', 'Custom AI training', 'Dedicated support'],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gold-gradient flex items-center justify-center">
              <span className="font-bold text-black">S</span>
            </div>
            <span className="font-bold text-xl">SaintSal</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/signup">
              <Button variant="gold" size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm mb-6">
          <Shield className="h-4 w-4 text-primary" />
          <span>US Patent #10,290,222 - HACP Technology</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          The <span className="text-gold-gradient">Everything</span> Platform
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          AI-powered business intelligence combining chat, property analysis, deal management,
          trading, and affiliate tools in one powerful interface.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button variant="gold" size="lg" className="w-full sm:w-auto">
              Start Free Trial
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          By Saint Vision Technologies LLC
        </p>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            One platform to power your entire business operation
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg gold-gradient flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-black" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works for you
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative ${tier.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full gold-gradient px-3 py-1 text-xs font-semibold text-black">
                    <Star className="h-3 w-3" />
                    Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block mt-6">
                  <Button
                    variant={tier.popular ? 'gold' : 'outline'}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <Card className="gold-gradient text-black">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of professionals using SaintSal to grow their business
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-black text-white hover:bg-black/80">
                Start Your Free Trial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gold-gradient flex items-center justify-center">
                <span className="font-bold text-black">S</span>
              </div>
              <span className="font-bold">SaintSal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Saint Vision Technologies LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="mailto:support@cookinbiz.com" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
