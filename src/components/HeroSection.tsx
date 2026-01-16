import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Circle } from 'lucide-react';
import { useRecruitment } from '@/contexts/RecruitmentContext';

const HeroSection: React.FC = () => {
  const { isRecruitmentOpen } = useRecruitment();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 lg:px-8 overflow-hidden pt-20">
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Main Title with integrated image */}
        <div className="relative">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-foreground leading-none">
            <span className="block">LS Custom's</span>
            <span className="block relative inline-flex items-center">
              <span className="relative z-10">is</span>
              <span className="relative z-10 ml-4">Support</span>
              {/* Image ovale intégrée dans le texte - partiellement superposée */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[20%] w-56 h-40 md:w-72 md:h-52 lg:w-80 lg:h-60 rounded-full overflow-hidden z-20 mix-blend-multiply">
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  {/* Placeholder pour l'image - à remplacer par une vraie image */}
                  <div className="w-full h-full bg-muted/40 flex items-center justify-center">
                    <span className="text-4xl md:text-5xl">🚗</span>
                  </div>
                </div>
              </div>
            </span>
          </h1>
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
          {/* Badge Recrutement ouvert/fermé */}
          {isRecruitmentOpen ? (
            <Link
              to="/candidature"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium bg-[#90EE90] hover:bg-[#7ED87E] text-foreground transition-colors shadow-sm"
            >
              <Circle className="w-2 h-2 fill-current" />
              Recrutement ouvert
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm">
              <Circle className="w-2 h-2 fill-current" />
              Recrutement fermé
            </div>
          )}
          
          {/* Bouton TARIFS avec flèche */}
          <Link
            to="/tarifs"
            className="flex items-center gap-2 text-base font-medium text-foreground hover:text-foreground/80 transition-colors group"
          >
            <span>TARIFS</span>
            <div className="w-8 h-8 rounded-full bg-foreground/5 group-hover:bg-foreground/10 flex items-center justify-center transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
