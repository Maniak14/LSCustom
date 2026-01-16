import React from 'react';

const LocalisationSection: React.FC = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
            LOCALISATION
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Nous trouver
          </h2>
        </div>

        {/* Map Container */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-border/50 shadow-lg">
          {/* Placeholder pour la carte - à remplacer par une vraie carte embed */}
          <div className="relative w-full aspect-video bg-muted/30 flex items-center justify-center">
            {/* Carte embed - remplacer par votre iframe de carte */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184132191574!2d-73.98811768459398!3d40.74844097932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sfr!2sfr!4v1234567890123!5m2!1sfr!2sfr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
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
