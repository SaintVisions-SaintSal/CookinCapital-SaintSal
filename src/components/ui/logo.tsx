'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  href?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeConfig = {
  sm: { image: 32, text: 'text-lg', tagline: 'text-[10px]' },
  md: { image: 40, text: 'text-xl', tagline: 'text-xs' },
  lg: { image: 48, text: 'text-2xl', tagline: 'text-sm' },
  xl: { image: 64, text: 'text-3xl', tagline: 'text-base' },
};

export function Logo({ href = '/', showTagline = false, size = 'md', className }: LogoProps) {
  const config = sizeConfig[size];

  const LogoContent = () => (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo Image - Falls back to styled placeholder if image not available */}
      <div className="relative">
        <Image
          src="/logo.png"
          alt="SaintSal"
          width={config.image}
          height={config.image}
          className="object-contain"
          onError={(e) => {
            // Fallback to placeholder
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        {/* Fallback placeholder */}
        <div
          className="hidden h-full w-full rounded-lg gold-gradient items-center justify-center absolute inset-0"
          style={{ width: config.image, height: config.image }}
        >
          <span className="font-bold text-black" style={{ fontSize: config.image * 0.5 }}>S</span>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span className={cn('font-bold tracking-tight', config.text)}>
          Saint<span className="text-gold-gradient">Sal</span>
          <span className="text-[8px] align-super ml-0.5 text-muted-foreground">™</span>
        </span>
        {showTagline && (
          <span className={cn('text-muted-foreground italic -mt-0.5', config.tagline)}>
            Cookin' Knowledge.
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}

export function LogoIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <Image
        src="/logo.png"
        alt="SaintSal"
        width={size}
        height={size}
        className="object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div
        className="hidden rounded-lg gold-gradient items-center justify-center absolute inset-0"
      >
        <span className="font-bold text-black" style={{ fontSize: size * 0.5 }}>S</span>
      </div>
    </div>
  );
}
