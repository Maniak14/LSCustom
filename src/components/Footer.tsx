import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import logoImage from '@/components/ui/0f4c0073c58cda701de3ecc0e6153a3f.png';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-foreground/10 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo et informations */}
          <div className="flex items-start gap-4">
            <Link to="/" className="flex-shrink-0">
              <img 
                src={logoImage} 
                alt="LS Custom's Logo" 
                className="w-16 h-16 md:w-20 md:h-20"
              />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-foreground">LOS SANTOS</h3>
                <span className="text-xl font-bold text-primary">CUSTOM'S</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Le garage de référence à Los Santos</p>
              <p className="text-xs text-muted-foreground">
                Los Santos Custom's © {currentYear}
              </p>
            </div>
          </div>

          {/* Scroll up button */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors group self-end md:self-center"
          >
            <span className="text-xs">SCROLL UP</span>
            <div className="w-8 h-8 rounded-full bg-foreground/5 group-hover:bg-foreground/10 flex items-center justify-center transition-colors">
              <ChevronUp className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
