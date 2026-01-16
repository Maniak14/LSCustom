import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import LocalisationSection from '@/components/LocalisationSection';
import TeamSection from '@/components/TeamSection';
import ServicesSection from '@/components/ServicesSection';
import ReviewsSection from '@/components/ReviewsSection';
import PartenairesSection from '@/components/PartenairesSection';
import Footer from '@/components/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1">
        <HeroSection />
        <LocalisationSection />
        <TeamSection />
        <ServicesSection />
        <ReviewsSection />
        <PartenairesSection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
