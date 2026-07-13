'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ChartCard({ title, description, icon: Icon, className, children, action }: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}
