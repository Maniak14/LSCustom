import React from 'react';
import { Link } from 'react-router-dom';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { ArrowRight, Circle } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { isRecruitmentOpen } = useRecruitment();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center pt-20">
        {/* Badge */}
        <div className="animate-fade-up">
          {isRecruitmentOpen ? (
            <Link to="/candidature" className="recruitment-open">
              <Circle className="w-2 h-2 fill-current" />
              Recrutement ouvert
            </Link>
          ) : (
            <span className="recruitment-closed">
              <Circle className="w-2 h-2" />
              Recrutement fermé
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance animate-fade-up-1">
          <span className="text-foreground">LS</span>{' '}
          <span className="text-gradient-primary">Custom's</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-xl sm:text-2xl text-muted-foreground font-light tracking-wide animate-fade-up-2">
          Auto Repairs & Customs
        </p>

        {/* Description */}
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-up-3">
          Le garage de référence à Los Santos. 
          Réparations, customisation et performances depuis 1987.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-4">
          <Link to="/tarifs" className="btn-primary group">
            Découvrir nos services
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link to="/candidature" className="btn-ghost">
            Rejoindre l'équipe
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
