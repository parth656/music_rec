import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  text?: string;
}

export function LoadingSpinner({ className, size = 24, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={cn('animate-spin text-accent', className)}
        size={size}
        aria-label="Loading..."
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
