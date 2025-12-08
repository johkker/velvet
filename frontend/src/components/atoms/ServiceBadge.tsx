'use client';

import { getServiceDisplay } from '@/lib/services';

interface ServiceBadgeProps {
  service: string;
  variant?: 'default' | 'compact';
}

export function ServiceBadge({ service, variant = 'default' }: ServiceBadgeProps) {
  const display = getServiceDisplay(service);
  
  if (variant === 'compact') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2.5 py-1.5 text-xs font-medium text-secondary-foreground border border-border/50">
        {display.icon && <span className="text-sm">{display.icon}</span>}
        <span>{display.isCustom ? service : display.value}</span>
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-medium text-secondary-foreground border border-border/50 transition-all hover:bg-secondary/70 hover:border-border">
      {display.icon && <span className="text-lg">{display.icon}</span>}
      <span>{display.isCustom ? service : display.value}</span>
    </span>
  );
}
