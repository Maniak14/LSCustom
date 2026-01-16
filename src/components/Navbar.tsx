import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'QUI SOMMES-NOUS' },
    { href: '/tarifs', label: 'SERVICES' },
    { href: '/candidature', label: 'ACTUALITÉS' },
    { href: '/candidature', label: 'REJOINDRE' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo avec trois cercles interconnectés */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              {/* Trois cercles interconnectés */}
              <div className="absolute top-0 left-0 w-5 h-5 rounded-full bg-foreground"></div>
              <div className="absolute top-0 right-0 w-5 h-5 rounded-full bg-foreground"></div>
              <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-foreground"></div>
              {/* Lignes de connexion */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 40">
                <line x1="10" y1="10" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
                <line x1="30" y1="10" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              LS CUSTOM'S
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-foreground'
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Bouton téléphone circulaire */}
            <button
              className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors"
              aria-label="Appeler"
            >
              <Phone className="w-5 h-5 text-foreground" />
            </button>

            {/* Bouton DONATE */}
            <Link
              to="/tarifs"
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
            >
              CONTACT
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-full hover:bg-foreground/5 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-fade-up border-t border-foreground/10 pt-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-foreground'
                      : 'text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-2">
                <button
                  className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center"
                  aria-label="Appeler"
                >
                  <Phone className="w-5 h-5 text-foreground" />
                </button>
                <Link
                  to="/tarifs"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-foreground/5 text-foreground"
                >
                  CONTACT
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
