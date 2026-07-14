import type { HTMLAttributes, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children: ReactNode;
  variant?: 'default' | 'destructive';
}

export function Alert({ className, title, children, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm',
        variant === 'destructive'
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-border/70 bg-surface-elevated/80 text-foreground',
        className,
      )}
      role="alert"
      {...props}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <div className={variant === 'destructive' ? 'text-destructive/90' : 'text-muted-foreground'}>{children}</div>
      </div>
    </div>
  );
}
