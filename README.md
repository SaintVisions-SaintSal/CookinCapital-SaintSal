# SaintSal - The Everything Platform

> **AI-powered business intelligence platform by Saint Vision Technologies LLC**
> *US Patent #10,290,222 - HACP (Human-AI Collaborative Processing)*

## Overview

SaintSal is a comprehensive AI platform that combines multiple business tools into one powerful interface:

- **AI Chat** - Multi-model support (GPT-4, Claude, Gemini, Grok)
- **Property Scoring** - Instant AI-powered investment analysis
- **Deal Pipeline** - Full lending portal with CRM integration
- **Trading Platform** - Execute trades via Alpaca
- **Affiliate Program** - 30% recurring commissions with instant payouts
- **GHL Integration** - Full CRM and marketing automation

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (OAuth, Email/Password)
- **Payments**: Stripe (Subscriptions, Connect)
- **CRM**: GoHighLevel
- **AI**: OpenAI, Anthropic, Google, xAI
- **Voice**: Deepgram, ElevenLabs, AssemblyAI
- **Deployment**: Vercel

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/SaintVisions-SaintSal/CookinCapital-SaintSal.git
cd CookinCapital-SaintSal
npm install
```

### 2. Environment Setup

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

### 3. Database Setup

Run the schema in your Supabase SQL editor:

```bash
# Copy contents of supabase/schema.sql to Supabase SQL Editor
```

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
saintsal-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── api/               # API routes
│   │   │   ├── chat/          # AI chat endpoint
│   │   │   ├── properties/    # Property scoring
│   │   │   ├── deals/         # Deal management
│   │   │   ├── affiliates/    # Affiliate program
│   │   │   └── webhooks/      # Stripe webhooks
│   │   └── dashboard/         # Protected dashboard pages
│   │       ├── chat/          # AI chat interface
│   │       ├── affiliates/    # Affiliate program
│   │       ├── deals/         # Deal pipeline
│   │       └── properties/    # Property scoring
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   └── dashboard/        # Dashboard components
│   ├── lib/                   # Utilities & configs
│   │   ├── supabase/         # Supabase clients
│   │   ├── stripe.ts         # Stripe config
│   │   ├── ai.ts             # AI integrations
│   │   └── utils.ts          # Helper functions
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── styles/               # Global styles
├── public/                    # Static assets
│   ├── images/               # Brand assets
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker
├── supabase/
│   └── schema.sql            # Database schema
└── package.json
```

## Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | 50 queries, 5 property scores |
| **Starter** | $27/mo | 500 queries, 50 scores, voice |
| **Pro** | $97/mo | Unlimited, War Room, coding agent |
| **Teams** | $297/mo | + Trading, unlimited team |
| **Enterprise** | $497/mo | + API, white-label, custom AI |

## Affiliate Program

- **Junior Affiliates**: 30% recurring commission
- **VP Partners**: 30% + 15% override on team sales
- **Payouts**: Same-day via Stripe Connect

## Security

- Row Level Security (RLS) on all tables
- Supabase Auth with OAuth providers
- Stripe webhook signature verification
- Environment variables for all secrets

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
vercel --prod
```

### Environment Variables for Production

Add these in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- (See `.env.local.example` for full list)

## Support

- **Email**: support@cookinbiz.com
- **Website**: https://cookinbiz.com
- **Company**: Saint Vision Technologies LLC

## License

Copyright 2025 Saint Vision Technologies LLC. All rights reserved.

---

**Built with by Saint Vision Technologies**

*"The Everything Platform - Because you deserve the best."*
