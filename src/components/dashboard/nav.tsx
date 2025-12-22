'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';
import {
  MessageSquare,
  Home,
  Briefcase,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Properties', href: '/dashboard/properties', icon: Home },
  { name: 'Deal Pipeline', href: '/dashboard/deals', icon: Briefcase },
  { name: 'Trading', href: '/dashboard/trading', icon: TrendingUp },
  { name: 'Affiliates', href: '/dashboard/affiliates', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface DashboardNavProps {
  user: User;
  profile: Profile | null;
}

export function DashboardNav({ user, profile }: DashboardNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-muted-foreground lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex flex-1 items-center justify-between">
          <Logo href="/dashboard" size="sm" />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background p-6">
            <div className="flex items-center justify-between mb-6">
              <Logo href="/dashboard" showTagline size="sm" />
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Logo href="/dashboard" showTagline size="md" />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User menu */}
          <div className="relative border-t pt-4">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(profile?.full_name, user.email || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium truncate">{profile?.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile?.subscription_tier || 'Free'} Plan
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border bg-background p-2 shadow-lg">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
