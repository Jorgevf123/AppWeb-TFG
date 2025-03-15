
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import Services from '@/components/Services';
import Companions from '@/components/Companions';
import FAQ from '@/components/FAQ';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index = () => {
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
