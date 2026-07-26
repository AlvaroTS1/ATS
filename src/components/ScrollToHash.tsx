import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Keeps scroll behavior sane across client-side routes:
 * - scrolls to the element matching the URL hash (e.g. /#solutions), or
 * - scrolls to top when navigating to a new page without a hash.
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        // Defer so the target route has rendered before scrolling.
        requestAnimationFrame(() =>
          el.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        );
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
