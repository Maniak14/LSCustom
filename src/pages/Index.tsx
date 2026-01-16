import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import LocalisationSection from '@/components/LocalisationSection';
import ServicesSection from '@/components/ServicesSection';
import Footer from '@/components/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <LocalisationSection />
      <ServicesSection />
      <Footer />
    </div>
  );
};

export default Index;
