import React from 'react';
import Header from '../components/Header';
import CinematicExperience from '../components/CinematicExperience';
import SolutionsSection from '../components/SolutionsSection';
import ServicesSection from '../components/ServicesSection';
import AppsDevSection from '../components/AppsDevSection';
import RoadmapSection from '../components/RoadmapSection';
import AboutSection from '../components/AboutSection';
import FaqSection from '../components/FaqSection';
import FinalCTASection from '../components/FinalCTASection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

/** The full one-page marketing landing at "/". */
const HomeLanding: React.FC = () => {
  return (
    <div className="min-h-screen text-white selection:bg-neon-cyan selection:text-space-black relative overflow-x-hidden">
      <Header />
      <main className="relative z-10">
        <CinematicExperience />
        {/*
          The Hero itself now lives inside CinematicExperience as HeroHUD —
          a real DOM panel, but nested under that component's
          `aria-hidden="true"` cinematic wrapper (everything else in there
          is decorative canvas noise, correctly hidden from assistive
          tech). This duplicate is the accessible version of the exact
          same content/links: invisible on screen, but present in the
          accessibility tree and for SEO crawlers, so no one loses the
          page's primary heading and CTAs depending on how they browse.
        */}
        <div className="sr-only">
          <h1>Tecnologia que resolve problemas reais.</h1>
          <p>
            A ATS Sistemas de Automações reúne, em um só ecossistema, produtos
            que resolvem problemas reais — de proteção familiar a assistentes
            de IA.
          </p>
          <a href="#solutions">Explorar soluções</a>
          <a href="#contact">Falar com a ATS</a>
        </div>
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
