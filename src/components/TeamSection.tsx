import React from 'react';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { User } from 'lucide-react';

const TeamSection: React.FC = () => {
  const { teamMembers, users } = useRecruitment();

  if (teamMembers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
            Équipe
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Équipe de direction
          </h2>
          <p className="mt-4 text-lg text-black dark:text-muted-foreground max-w-2xl mx-auto">
            Les professionnels qui font de LS Custom's une référence
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((member) => (
            <div
              key={member.id}
              className="service-card text-center group"
            >
              {/* Photo */}
              {(() => {
                // Chercher l'utilisateur correspondant au membre
                const memberUser = member.userId 
                  ? users.find(u => u.id === member.userId)
                  : users.find(u => u.prenom === member.prenom && u.nom === member.nom);
                
                // Utiliser la photo du membre si elle existe, sinon utiliser la photoUrl de l'utilisateur
                const photoToDisplay = member.photo || memberUser?.photoUrl;
                
                return (
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-muted flex items-center justify-center">
                    {photoToDisplay ? (
                      <img
                        src={photoToDisplay}
                        alt={`${member.prenom} ${member.nom}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                );
              })()}

              {/* Nom et prénom */}
              <h3 className="text-lg font-semibold mb-1">
                {member.prenom} {member.nom}
              </h3>

              {/* Rôle */}
              <p className="text-sm text-muted-foreground">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
