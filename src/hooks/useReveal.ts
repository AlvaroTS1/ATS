import { useEffect, useRef, useState } from 'react';

/**
 * The one way any piece of ATS interface is allowed to appear: resolved
 * into focus (`.animate-reveal` in `index.css`, `lib/reveal.ts` — the
 * same choreography `HoloPanel.tsx` uses inside the cinematic
 * experience), never a plain Framer Motion fade/slide, and never born.
 * Fires once, the first time the element enters the viewport —
 * `prefers-reduced-motion` is already handled globally (see `index.css`),
 * so this hook doesn't need its own reduced-motion branch.
 */
export function useReveal<T extends HTMLElement>(options?: {
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: options?.threshold ?? 0.15, rootMargin: options?.rootMargin ?? '0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options are meant to be stable across the component's lifetime
  }, []);

  return { ref, visible };
}
