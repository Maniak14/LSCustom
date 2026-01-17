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
    <div className="min-h-screen flex flex-col relative">
      {/* Image de fond - opacité minimale en light mode, opacité en dark mode */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.80] dark:opacity-50"
        style={{
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'transparent',
        }}
      />
      
      {/* Contenu avec z-index pour être au-dessus */}
      <div className="relative z-10 flex flex-col min-h-screen">
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
    </div>
  );
};

export default Index;
