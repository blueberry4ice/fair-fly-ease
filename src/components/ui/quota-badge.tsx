import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface QuotaBadgeProps {
  used: number;
  total: number;
  showProgress?: boolean;
  className?: string;
}

export function QuotaBadge({ used, total, showProgress = false, className }: QuotaBadgeProps) {
  const remaining = total - used;
  const percentage = (used / total) * 100;
  
  const getStatus = () => {
    if (remaining <= 0) return 'empty';
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'warning';
    return 'healthy';
  };

  const status = getStatus();

  const statusConfig = {
    healthy: {
      bg: 'bg-success/10',
      text: 'text-success',
      progress: 'bg-success',
      icon: CheckCircle2,
    },
    warning: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      progress: 'bg-warning',
      icon: AlertTriangle,
    },
    critical: {
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      progress: 'bg-destructive',
      icon: AlertTriangle,
    },
    empty: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      progress: 'bg-muted-foreground',
      icon: XCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium', config.bg, config.text)}>
        <Icon className="w-4 h-4" />
        <span>{remaining} / {total} remaining</span>
      </div>
      
      {showProgress && (
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn('h-full rounded-full transition-all duration-500', config.progress)}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
