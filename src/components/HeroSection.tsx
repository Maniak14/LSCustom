import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Circle } from 'lucide-react';
import { useRecruitment } from '@/contexts/RecruitmentContext';

const HeroSection: React.FC = () => {
  const { isRecruitmentOpen } = useRecruitment();

  return (
    <section className="relative min-h-screen flex items-end justify-center px-4 lg:px-8 overflow-hidden pt-20 pb-32">
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Badge Recrutement ouvert/fermé */}
          {isRecruitmentOpen ? (
            <Link
              to="/candidature"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium transition-colors shadow-sm dark:bg-[#4CAF50] dark:hover:bg-[#45a049] dark:text-white bg-[#90EE90] hover:bg-[#7ED87E] text-foreground"
            >
              <Circle className="w-2 h-2 fill-current" />
              Recrutement ouvert
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium transition-colors shadow-sm bg-[#D32F2F] hover:bg-[#C62828] text-white">
              <Circle className="w-2 h-2 fill-current" />
              Recrutement fermé
            </div>
          )}
          
          {/* Bouton TARIFS avec flèche */}
          <Link
            to="/tarifs"
            className="flex items-center gap-2 text-base font-medium text-foreground hover:text-foreground/80 transition-colors group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span>TARIFS</span>
            <div className="w-8 h-8 rounded-full bg-foreground/5 group-hover:bg-foreground/10 flex items-center justify-center transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Description de l'entreprise */}
        <div className="mt-10 max-w-2xl mx-auto text-center">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Le garage de référence à Los Santos. Réparations, customisation et performances depuis 2023.
            </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
