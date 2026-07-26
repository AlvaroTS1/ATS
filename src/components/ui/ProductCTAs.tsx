import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Product } from '../../data/products';
import { useWaitlist } from '../WaitlistProvider';
import { cn } from '../../lib/utils';

interface ProductCTAsProps {
  product: Product;
  size?: 'sm' | 'md';
  className?: string;
}

/** Renders a product's CTA buttons consistently, wiring waitlist + external links. */
const ProductCTAs: React.FC<ProductCTAsProps> = ({
  product,
  size = 'md',
  className,
}) => {
  const { open } = useWaitlist();

  const pad = size === 'sm' ? 'px-4 py-2.5 text-xs' : 'px-5 py-3 text-sm';

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {product.ctas.map((cta) => {
        const isPrimary = cta.variant === 'primary';
        const base = cn(
          'group/cta inline-flex items-center gap-2 rounded-xl font-semibold tracking-wide transition-all duration-300 active:scale-[0.98]',
          pad,
        );

        const primaryStyle: React.CSSProperties = isPrimary
          ? {
              backgroundImage: `linear-gradient(to right, ${product.accent.from}, ${product.accent.to})`,
              color: '#050810',
              boxShadow: `0 8px 24px -8px ${product.accent.glow}`,
            }
          : {};

        const className = cn(
          base,
          isPrimary
            ? 'hover:brightness-110'
            : 'bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.07] hover:border-white/20',
        );

        const content = (
          <>
            {cta.label}
            {cta.external ? (
              <ArrowUpRight className="w-4 h-4 opacity-80 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 opacity-80 group-hover/cta:translate-x-0.5 transition-transform" />
            )}
          </>
        );

        if (cta.waitlist) {
          return (
            <button
              key={cta.label}
              onClick={() => open(product.name)}
              className={className}
              style={primaryStyle}
            >
              {content}
            </button>
          );
        }

        return (
          <a
            key={cta.label}
            href={cta.href}
            target={cta.external ? '_blank' : undefined}
            rel={cta.external ? 'noopener noreferrer' : undefined}
            className={className}
            style={primaryStyle}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
};

export default ProductCTAs;
