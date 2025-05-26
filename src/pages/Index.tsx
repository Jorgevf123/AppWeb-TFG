import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import Companions from '@/components/Companions';
import FAQ from '@/components/FAQ';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';


type IndexProps = {
  authRefresh: number;
};
const Index = ({ authRefresh }: IndexProps) => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
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
      <Navbar authRefresh={authRefresh} />
      <HeroSection />
      <HowItWorks />
      <Companions />
      <FAQ />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;

