import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import Services from '@/components/Services';
import Companions from '@/components/Companions';
import FAQ from '@/components/FAQ';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Esperamos un poco para asegurar que el DOM esté montado
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <Services />
      <Companions />
      <FAQ />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;

