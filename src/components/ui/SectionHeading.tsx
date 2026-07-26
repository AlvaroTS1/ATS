import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

/** Consistent section header used across every section of the site. */
const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = 'center',
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={cn(
        align === 'center' ? 'text-center mx-auto' : 'text-left',
        'max-w-2xl',
        align === 'center' && 'max-w-3xl',
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
    </motion.div>
  );
};

export default SectionHeading;
