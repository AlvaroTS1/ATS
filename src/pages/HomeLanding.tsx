import React from 'react';
import Header from '../components/Header';
import CinematicScrollSection from '../components/CinematicScrollSection';
import HeroSection from '../components/HeroSection';
import SolutionsSection from '../components/SolutionsSection';
import ServicesSection from '../components/ServicesSection';
import AppsDevSection from '../components/AppsDevSection';
import RoadmapSection from '../components/RoadmapSection';
import AboutSection from '../components/AboutSection';
import FaqSection from '../components/FaqSection';
import FinalCTASection from '../components/FinalCTASection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import GuardianBackgroundVideo from '../components/GuardianBackgroundVideo';

/** The full one-page marketing landing at "/". */
const HomeLanding: React.FC = () => {
  return (
    <div className="min-h-screen text-white selection:bg-neon-cyan selection:text-space-black relative overflow-x-hidden">
      <GuardianBackgroundVideo />
      <Header />
      <main className="relative z-10">
        <CinematicScrollSection />
        <HeroSection />
        <SolutionsSection />
        <ServicesSection />
        <AppsDevSection />
        <RoadmapSection />
        <AboutSection />
        <FaqSection />
        <FinalCTASection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomeLanding;
