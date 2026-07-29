import React from 'react';
import { cn } from '../../lib/utils';
import { useMaterialize } from '../../hooks/useMaterialize';

interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

/**
 * Consistent section header used across every section of the site — this
 * one component is why converting it to `.animate-materialize` (the same
 * energy-born choreography every other piece of ATS interface uses)
 * rewrites the entrance of the entire page in a single place, no more
 * Framer Motion fade/slide anywhere a section begins.
 */
const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = 'center',
  className,
}) => {
  const { ref, visible } = useMaterialize<HTMLDivElement>({ threshold: 0.15, rootMargin: '-80px' });

  return (
    <div
      ref={ref}
      className={cn(
        align === 'center' ? 'text-center mx-auto' : 'text-left',
        'max-w-2xl',
        align === 'center' && 'max-w-3xl',
        visible ? 'animate-materialize' : 'opacity-0 blur-lg scale-[0.4] brightness-[2.2]',
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300 mb-5',
            align === 'center' ? 'mx-auto' : '',
          )}
        >
          {eyebrowIcon}
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'text-gray-400 text-base md:text-lg leading-relaxed mt-5',
            align === 'center' ? 'mx-auto' : '',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
