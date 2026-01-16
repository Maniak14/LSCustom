import React from 'react';
import { Link } from 'react-router-dom';
import mapImage from '@/components/ui/map.png';

const LocalisationSection: React.FC = () => {
  return (
    <section className="pt-0 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
            LOCALISATION
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Nous trouver
          </h2>
        </div>

        {/* Map Container */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-border/50 shadow-lg">
          <div className="relative w-full aspect-video bg-muted/30">
            {/* Image de la carte */}
            <img
              src={mapImage}
              alt="Carte de localisation - Los Santos"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay avec bouton Réserver */}
            <div className="absolute bottom-4 right-4 z-10">
              <button className="px-6 py-3 rounded-lg text-sm font-medium bg-background/90 hover:bg-background text-foreground transition-colors shadow-lg flex items-center gap-2">
                <span>Réserver</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-up"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalisationSection;
