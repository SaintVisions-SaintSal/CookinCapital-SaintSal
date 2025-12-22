import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    queries: 50,
    propertyScores: 5,
    features: ['Basic AI Chat', '5 Property Scores/mo'],
  },
  starter: {
    name: 'Starter',
    price: 27,
    queries: 500,
    propertyScores: 50,
    features: ['500 AI Queries/mo', '50 Property Scores/mo', 'Voice Chat', 'Email Support'],
  },
  pro: {
    name: 'Pro',
    price: 97,
    queries: -1, // unlimited
    propertyScores: -1,
    features: ['Unlimited Queries', 'Unlimited Scores', 'War Room Access', 'Coding Agent', 'Priority Support'],
  },
  teams: {
    name: 'Teams',
    price: 297,
    queries: -1,
    propertyScores: -1,
    features: ['Everything in Pro', 'Trading Platform', 'Unlimited Team Members', 'Admin Dashboard'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 497,
    queries: -1,
    propertyScores: -1,
    features: ['Everything in Teams', 'API Access', 'White-label Option', 'Custom AI Training', 'Dedicated Support'],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
