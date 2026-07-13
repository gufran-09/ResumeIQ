'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  delay?: number;
}

const variantStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  info: 'text-info',
};

const iconBgStyles = {
  default: 'bg-muted',
  primary: 'bg-primary/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  destructive: 'bg-destructive/10',
  info: 'bg-info/10',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className={cn('text-2xl font-bold tracking-tight', variantStyles[variant])}>
                {value}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div className={cn('rounded-xl p-2.5', iconBgStyles[variant])}>
              <Icon className={cn('h-5 w-5', variantStyles[variant])} />
            </div>
          </div>
          {trend && (
            <div className="mt-3 flex items-center gap-1 text-xs">
              <span className={trend.positive ? 'text-success' : 'text-destructive'}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
