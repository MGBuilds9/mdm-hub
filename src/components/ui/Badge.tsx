import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-500 text-white hover:bg-primary-600',
        secondary:
          'border-transparent bg-charcoal-100 text-charcoal-900 hover:bg-charcoal-200',
        destructive:
          'border-transparent bg-error-500 text-white hover:bg-error-600',
        success:
          'border-transparent bg-success-500 text-white hover:bg-success-600',
        warning:
          'border-transparent bg-warning-500 text-white hover:bg-warning-600',
        outline: 'text-charcoal-950 border-charcoal-300',
        // Status variants
        active: 'border-transparent bg-success-100 text-success-800',
        completed: 'border-transparent bg-success-100 text-success-800',
        planning: 'border-transparent bg-warning-100 text-warning-800',
        'on-hold': 'border-transparent bg-warning-100 text-warning-800',
        cancelled: 'border-transparent bg-error-100 text-error-800',
        draft: 'border-transparent bg-charcoal-100 text-charcoal-800',
        pending_approval: 'border-transparent bg-warning-100 text-warning-800',
        approved: 'border-transparent bg-success-100 text-success-800',
        rejected: 'border-transparent bg-error-100 text-error-800',
        implemented: 'border-transparent bg-success-100 text-success-800',
        // Role variants
        admin: 'border-transparent bg-error-100 text-error-800',
        manager: 'border-transparent bg-primary-100 text-primary-800',
        supervisor: 'border-transparent bg-warning-100 text-warning-800',
        worker: 'border-transparent bg-success-100 text-success-800',
        viewer: 'border-transparent bg-charcoal-100 text-charcoal-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
