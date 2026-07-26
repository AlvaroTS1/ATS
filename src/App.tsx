import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeLanding from './pages/HomeLanding';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import ScrollToHash from './components/ScrollToHash';
import { WaitlistProvider } from './components/WaitlistProvider';

function App() {
  return (
    <WaitlistProvider>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomeLanding />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsOfUse />} />
        <Route path="*" element={<HomeLanding />} />
      </Routes>
    </WaitlistProvider>
  );
}

export default App;
