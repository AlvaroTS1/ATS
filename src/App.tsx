import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeLanding from './pages/HomeLanding';
import ScrollToHash from './components/ScrollToHash';
import { WaitlistProvider } from './components/WaitlistProvider';

// A different ROUTE, never rendered alongside HomeLanding — these have no
// business being in the same bundle the Hero needs to reach first paint.
// Before this they were static imports pulled in through App.tsx, which
// every visitor's browser had to include in the critical-path bundle
// whether they were headed to "/" or not.
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));

function App() {
  return (
    <WaitlistProvider>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomeLanding />} />
        <Route
          path="/privacidade"
          element={
            <Suspense fallback={null}>
              <PrivacyPolicy />
            </Suspense>
          }
        />
        <Route
          path="/termos"
          element={
            <Suspense fallback={null}>
              <TermsOfUse />
            </Suspense>
          }
        />
        <Route path="*" element={<HomeLanding />} />
      </Routes>
    </WaitlistProvider>
  );
}

export default App;
