import { cn } from '@/lib/utils';

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const color =
    score >= 75
      ? 'bg-success/10 text-success border-success/20'
      : score >= 50
      ? 'bg-warning/10 text-warning border-warning/20'
      : 'bg-destructive/10 text-destructive border-destructive/20';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-sm font-bold tabular-nums',
        color,
        className
      )}
    >
      {score}
    </span>
  );
}
