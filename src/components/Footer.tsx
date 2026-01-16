import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">LS</span>
            </div>
            <div>
              <p className="font-semibold">LS Custom's</p>
              <p className="text-sm text-muted-foreground">Est. 1987</p>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Los Santos, SA</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Lun-Sam · 8h-22h</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link to="/tarifs" className="text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
            <Link to="/candidature" className="text-muted-foreground hover:text-foreground transition-colors">
              Carrières
            </Link>
            <Link to="/panel" className="text-muted-foreground hover:text-foreground transition-colors">
              Panel
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 LS Custom's · Site RP GTA V
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
