import React from 'react';
import type { ProductStatus } from '../../data/products';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

const STATUS_STYLE: Record<ProductStatus, { pill: string; dot: string; label: string }> = {
  available: {
    pill: 'bg-cyber-emerald/10 border-cyber-emerald/25 text-cyber-emerald',
    dot: 'bg-cyber-emerald animate-pulse',
    label: 'Disponível',
  },
  beta: {
    pill: 'bg-sky-400/10 border-sky-400/25 text-sky-300',
    dot: 'bg-sky-300 animate-pulse',
    label: 'Beta aberto',
  },
  soon: {
    pill: 'bg-amber-400/10 border-amber-400/25 text-amber-300',
    dot: 'bg-amber-300 animate-ping',
    label: 'Em breve',
  },
};

/** Small pill that signals whether a product is live, in open beta or coming soon. */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const style = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap',
        style.pill,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  );
};

export default StatusBadge;
