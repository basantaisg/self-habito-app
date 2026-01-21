import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className={cn(
              'text-sm',
              trend === 'up' && 'text-success',
              trend === 'down' && 'text-destructive',
              !trend && 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-muted/50">
          {icon}
        </div>
      </div>
    </div>
  );
}
