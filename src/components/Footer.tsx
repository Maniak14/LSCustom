import React from 'react';
import { ChevronDown } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logos de partenaires */}
          <div className="flex items-center gap-8 flex-wrap justify-center">
            {/* Placeholder pour logos partenaires */}
            <div className="text-sm font-semibold text-foreground/60">PARTENAIRE 1</div>
            <div className="text-sm font-semibold text-foreground/60">PARTENAIRE 2</div>
            <div className="text-sm font-semibold text-foreground/60">PARTENAIRE 3</div>
          </div>

          {/* SCROLL DOWN */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors group"
          >
            <span>SCROLL UP</span>
            <div className="w-8 h-8 rounded-full bg-foreground/5 group-hover:bg-foreground/10 flex items-center justify-center transition-colors">
              <ChevronDown className="w-4 h-4 rotate-180" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
