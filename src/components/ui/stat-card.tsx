import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  default: {
    card: 'bg-card',
    icon: 'bg-muted text-muted-foreground',
  },
  primary: {
    card: 'bg-primary/5 border-primary/20',
    icon: 'bg-primary text-primary-foreground',
  },
  success: {
    card: 'bg-success/5 border-success/20',
    icon: 'bg-success text-success-foreground',
  },
  warning: {
    card: 'bg-warning/5 border-warning/20',
    icon: 'bg-warning text-warning-foreground',
  },
  info: {
    card: 'bg-info/5 border-info/20',
    icon: 'bg-info text-info-foreground',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md animate-fade-in',
        styles.card,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-2 text-2xl lg:text-3xl font-display font-bold text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-3', styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
