import React from 'react';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { Building2 } from 'lucide-react';

const PartenairesSection: React.FC = () => {
  const { partenaires } = useRecruitment();

  if (partenaires.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Nos partenaires
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nos partenaires de confiance qui nous accompagnent
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {partenaires.map((partenaire) => (
            <div
              key={partenaire.id}
              className="glass-card p-6 flex flex-col items-center justify-center aspect-square animate-fade-up hover:scale-105 transition-transform"
            >
              {partenaire.logoUrl ? (
                <img
                  src={partenaire.logoUrl}
                  alt={partenaire.nom}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm font-medium text-center">{partenaire.nom}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartenairesSection;
