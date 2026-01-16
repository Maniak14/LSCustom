import React from 'react';
import { MapPin, Clock, Wrench } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" />
            <span className="font-display text-lg font-bold">
              LS <span className="text-accent">Custom's</span>
            </span>
          </div>

          {/* Info RP */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Los Santos, San Andreas</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-accent" />
              <span>Est. 1987</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Lun-Sam: 8h-22h</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 LS Custom's - Tous droits réservés • Site RP GTA V
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
