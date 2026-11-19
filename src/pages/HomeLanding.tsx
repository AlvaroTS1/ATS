import React, { Suspense, lazy, useEffect } from 'react';
import Header from '../components/Header';
import CoreExperience from '../components/experience/CoreExperience';

/**
 * Below-the-fold sections, lazy by construction.
 *
 * Before this, `HomeLanding` statically imported every section on the
 * page — including `ContactSection`, `RoadmapSection`, `FaqSection` and
 * the rest — into the SAME bundle as `CinematicExperience`. That bundle
 * (678KB, 159KB gzipped) had to fully download, parse and execute before
 * React could render the first pixel of the Hero, because none of that
 * work could start until the module graph resolved. None of these
 * sections have anything to do with the Hero appearing; they sit past
 * 6900-9200px of pinned cinematic scroll, and the user cannot reach them
 * for many seconds of scrolling under any circumstance.
 *
 * `lazy()` moves each into its own chunk, fetched only when React
 * actually needs to render it — except it never has to wait for that in
 * practice, because `useEffect` below fires the SAME `import()` targets
 * from an idle callback right after mount. By the time scroll could ever
 * reach one of these sections, its chunk has long since resolved and sits
 * in the module cache; the `lazy()` wrapper just reads that
 * already-settled promise. `Suspense fallback={null}` is what that
 * guarantees in practice: no spinner is a real fallback that is
 * essentially never hit, not a fallback that was skipped.
 */
const SolutionsSection = lazy(() => import('../components/SolutionsSection'));
const ServicesSection = lazy(() => import('../components/ServicesSection'));
const AppsDevSection = lazy(() => import('../components/AppsDevSection'));
const RoadmapSection = lazy(() => import('../components/RoadmapSection'));
const AboutSection = lazy(() => import('../components/AboutSection'));
const FaqSection = lazy(() => import('../components/FaqSection'));
const FinalCTASection = lazy(() => import('../components/FinalCTASection'));
const ContactSection = lazy(() => import('../components/ContactSection'));
const Footer = lazy(() => import('../components/Footer'));

/** The full one-page marketing landing at "/". */
const HomeLanding: React.FC = () => {
  useEffect(() => {
    // Same pattern as the Guardian's deferred video fetch
    // (`CinematicExperience.tsx`): idle, but bounded by a timeout so this
    // experience's own continuous rAF loops — which keep the main thread
    // signalling "not idle" indefinitely — can never starve it out.
    // Measured there: with no timeout, `requestIdleCallback` never fired
    // at all in a 6.5s window.
    const scheduleIdle =
      typeof requestIdleCallback === 'function'
        ? (cb: () => void) => requestIdleCallback(cb, { timeout: 1500 })
        : (cb: () => void) => setTimeout(cb, 1500);
    scheduleIdle(() => {
      void import('../components/SolutionsSection');
      void import('../components/ServicesSection');
      void import('../components/AppsDevSection');
      void import('../components/RoadmapSection');
      void import('../components/AboutSection');
      void import('../components/FaqSection');
      void import('../components/FinalCTASection');
      void import('../components/ContactSection');
      void import('../components/Footer');
    });
  }, []);

  return (
    <div className="min-h-screen text-white selection:bg-neon-cyan selection:text-space-black relative overflow-x-clip">
      <Header />
      <main className="relative z-10">
        {/*
          ATS Core Experience: the cinematic opening (5 chapters, one 3D
          world). Its copy is real DOM — the page's H1 lives in it — so no
          screen-reader duplicate is needed any more. The previous opening
          (`components/CinematicExperience.tsx`, the Guardian film) is kept
          intact in the repository and can be restored by swapping this line.
        */}
        <CoreExperience />
        <Suspense fallback={null}>
          <SolutionsSection />
        </Suspense>
        <Suspense fallback={null}>
          <ServicesSection />
        </Suspense>
        <Suspense fallback={null}>
          <AppsDevSection />
        </Suspense>
        <Suspense fallback={null}>
          <RoadmapSection />
        </Suspense>
        <Suspense fallback={null}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={null}>
          <FaqSection />
        </Suspense>
        <Suspense fallback={null}>
          <FinalCTASection />
        </Suspense>
        <Suspense fallback={null}>
          <ContactSection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default HomeLanding;
