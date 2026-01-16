import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import logoImage from '@/components/ui/0f4c0073c58cda701de3ecc0e6153a3f.png';
import { useTheme } from '@/hooks/use-theme';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: '/', label: 'QUI SOMMES-NOUS' },
    { href: '/tarifs', label: 'SERVICES' },
    { href: '/candidature', label: 'REJOINDRE' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      {/* Conteneur avec fond sombre */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-b border-border/50" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Los Santos Customs */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoImage} 
              alt="LS Custom's Logo" 
              className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0"
            />
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
            {/* Bouton Dark/Light mode */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Bouton DASHBOARD */}
            <Link
              to="/panel"
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
            >
              DASHBOARD
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
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-foreground" />
                  ) : (
                    <Moon className="w-5 h-5 text-foreground" />
                  )}
                </button>
                <Link
                  to="/panel"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-foreground/5 text-foreground"
                >
                  DASHBOARD
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
