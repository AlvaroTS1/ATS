import React from 'react';

/**
 * The VOTRIX symbol, drawn exactly as in the product's own brand guide
 * (`docs/votrix/marca/votrix-simbolo.svg` in the VOTRIX repository): a V
 * traced by two beams meeting in a node, with a small network between them.
 * Inline SVG so it stays sharp at any size and costs no request.
 */
const VotrixMark: React.FC<{ className?: string; title?: string }> = ({ className, title }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    role={title ? 'img' : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : true}
  >
    <rect width="64" height="64" rx="16" fill="#08132b" />
    <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="#1d3a6b" strokeWidth="2" />
    <g stroke="#5eead4" strokeWidth="1.8" strokeLinecap="round" opacity=".75" fill="none">
      <path d="M15 17L32 24L49 17M32 24L23.5 33M32 24L40.5 33M23.5 33H40.5" />
    </g>
    <path d="M15 17L32 49L49 17" fill="none" stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="15" cy="17" r="3.8" fill="#e0f7ff" />
    <circle cx="49" cy="17" r="3.8" fill="#e0f7ff" />
    <circle cx="32" cy="24" r="3.2" fill="#34d399" />
    <circle cx="23.5" cy="33" r="2.4" fill="#e0f7ff" />
    <circle cx="40.5" cy="33" r="2.4" fill="#e0f7ff" />
    <circle cx="32" cy="49" r="5.2" fill="#34d399" stroke="#08132b" strokeWidth="2" />
  </svg>
);

export default VotrixMark;
