import React from 'react';
import { Link } from 'react-router-dom';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import GearIcon from './GearIcon';

const HeroSection: React.FC = () => {
  const { isRecruitmentOpen } = useRecruitment();

  return (
    <section className="relative min-h-screen flex items-center justify-center metal-texture overflow-hidden pt-16">
      {/* Decorative Gears */}
      <div className="absolute top-20 left-[-50px] opacity-5">
        <GearIcon size={200} className="animate-gear text-primary" />
      </div>
      <div className="absolute bottom-20 right-[-80px] opacity-5">
        <GearIcon size={300} className="animate-gear text-accent" style={{ animationDirection: 'reverse' }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 border-2 border-primary glow-blue mb-4">
            <GearIcon size={48} className="text-primary animate-float" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-4 animate-fade-in-up-delay-1">
          <span className="text-foreground">LS</span>{' '}
          <span className="text-gradient-gold">Custom's</span>
        </h1>

        {/* Slogan */}
        <p className="font-display text-xl md:text-2xl text-primary uppercase tracking-[0.2em] mb-8 animate-fade-in-up-delay-2">
          Auto Repairs & Customs – Los Santos
        </p>

        {/* Description */}
        <p className="text-muted-foreground max-w-xl mx-auto mb-12 animate-fade-in-up-delay-3">
          Le garage de référence de Los Santos. Réparations, customisation et performances depuis 1987.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-3">
          {isRecruitmentOpen ? (
            <Link
              to="/candidature"
              className="recruitment-open px-8 py-4 rounded-lg font-display text-lg uppercase tracking-wider text-white transition-all hover:scale-105"
            >
              🟢 Recrutement Ouvert
            </Link>
          ) : (
            <button
              disabled
              className="recruitment-closed px-8 py-4 rounded-lg font-display text-lg uppercase tracking-wider text-white"
            >
              🔴 Recrutement Fermé
            </button>
          )}

          <Link
            to="/tarifs"
            className="btn-blue px-8 py-4 rounded-lg text-lg"
          >
            Voir les Tarifs
          </Link>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
