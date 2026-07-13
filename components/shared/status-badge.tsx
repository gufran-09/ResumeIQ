import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CandidateStatus } from '@/types';

const styles: Record<CandidateStatus, string> = {
  shortlisted: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

const labels: Record<CandidateStatus, string> = {
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  pending: 'Pending',
};

export function StatusBadge({ status, className }: { status: CandidateStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn(styles[status], 'font-medium', className)}>
      {labels[status]}
    </Badge>
  );
}
