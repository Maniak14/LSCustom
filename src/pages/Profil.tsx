import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { User, LogOut, ArrowLeft, Phone } from 'lucide-react';

const Profil: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser, isUserLoggedIn } = useRecruitment();

  if (!isUserLoggedIn || !currentUser) {
    navigate('/inscription');
    return null;
  }

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Mon profil</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez vos informations personnelles
            </p>
          </div>

          {/* Profile Card */}
          <div className="glass-card mb-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  ID
                </label>
                <p className="text-lg font-medium">{currentUser.idPersonnel}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Numéro de téléphone
                </label>
                <p className="text-lg font-medium">{currentUser.telephone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Date d'inscription
                </label>
                <p className="text-lg font-medium">
                  {new Date(currentUser.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLogout}
              className="btn-ghost flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>

            <Link
              to="/"
              className="btn-primary flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profil;
