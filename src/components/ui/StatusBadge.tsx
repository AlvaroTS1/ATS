import React from 'react';
import type { ProductStatus } from '../../data/products';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

/** Small pill that signals whether a product is live or coming soon. */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const isAvailable = status === 'available';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
        isAvailable
          ? 'bg-cyber-emerald/10 border-cyber-emerald/25 text-cyber-emerald'
          : 'bg-amber-400/10 border-amber-400/25 text-amber-300',
        className,
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isAvailable
            ? 'bg-cyber-emerald animate-pulse'
            : 'bg-amber-300 animate-ping',
        )}
      />
      {isAvailable ? 'Disponível' : 'Em breve'}
    </span>
  );
};

export default StatusBadge;
