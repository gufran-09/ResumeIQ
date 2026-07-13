import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const colorPalette = [
  'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
];

export function CandidateAvatar({
  name,
  size = 'default',
  className,
}: {
  name: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const initials = getInitials(name);
  const colorIndex = name.charCodeAt(0) % colorPalette.length;
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-16 w-16 text-lg' : 'h-10 w-10 text-sm';

  return (
    <Avatar className={cn(sizeClass, className)}>
      <AvatarFallback className={cn('font-semibold', colorPalette[colorIndex])}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
