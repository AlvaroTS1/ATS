import React from 'react';
import { cn } from '../../lib/utils';
import { useReveal } from '../../hooks/useReveal';
import { REVEAL_DORMANT } from '../../lib/reveal';

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
 * one component is why converting it to `.animate-reveal` (the same
 * focus-pull every other piece of ATS interface uses) rewrites how the
 * entire page appears in a single place: no Framer Motion fade/slide
 * anywhere a section begins, and nothing that grows or travels into
 * position.
 */
const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = 'center',
  className,
}) => {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.15, rootMargin: '-80px' });

  return (
    <div
      ref={ref}
      className={cn(
        align === 'center' ? 'text-center mx-auto' : 'text-left',
        'max-w-2xl',
        align === 'center' && 'max-w-3xl',
        visible ? 'animate-reveal' : REVEAL_DORMANT,
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
