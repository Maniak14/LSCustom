import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { Lock, LogOut, ToggleLeft, ToggleRight, Check, X, Clock, Users } from 'lucide-react';

const Panel: React.FC = () => {
  const {
    isEmployeeLoggedIn,
    loginEmployee,
    logoutEmployee,
    isRecruitmentOpen,
    setIsRecruitmentOpen,
    applications,
    updateApplicationStatus,
  } = useRecruitment();

  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginEmployee(password);
    if (!success) {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 3000);
    }
    setPassword('');
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  if (!isEmployeeLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Panel Employé
                </h1>
                <p className="text-muted-foreground">
                  Accès réservé aux employés LS Custom's
                </p>
              </div>

              <form onSubmit={handleLogin} className="card-gradient rounded-xl p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`input-ls ${loginError ? 'border-destructive' : ''}`}
                    placeholder="••••••••"
                  />
                  {loginError && (
                    <p className="text-sm text-destructive mt-2">
                      Mot de passe incorrect
                    </p>
                  )}
                </div>
                <button type="submit" className="btn-blue w-full py-3 rounded-lg">
                  Connexion
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Panel Employé
              </h1>
              <p className="text-muted-foreground">Gestion du recrutement</p>
            </div>
            <button
              onClick={logoutEmployee}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card-gradient rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-foreground">{applications.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="card-gradient rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-accent">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
            <div className="card-gradient rounded-lg p-4 text-center">
              <Check className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-success">{acceptedCount}</p>
              <p className="text-xs text-muted-foreground">Acceptées</p>
            </div>
            <div className="card-gradient rounded-lg p-4 text-center">
              <X className="w-6 h-6 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-destructive">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Refusées</p>
            </div>
          </div>

          {/* Recruitment Toggle */}
          <div className="card-gradient rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  État du recrutement
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isRecruitmentOpen
                    ? 'Le recrutement est actuellement ouvert'
                    : 'Le recrutement est actuellement fermé'}
                </p>
              </div>
              <button
                onClick={() => setIsRecruitmentOpen(!isRecruitmentOpen)}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-display uppercase tracking-wider transition-all ${
                  isRecruitmentOpen
                    ? 'recruitment-open text-white'
                    : 'bg-destructive/20 text-destructive border border-destructive/30'
                }`}
              >
                {isRecruitmentOpen ? (
                  <>
                    <ToggleRight className="w-6 h-6" />
                    Ouvert
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6" />
                    Fermé
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Applications List */}
          <div className="card-gradient rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Candidatures
              </h2>
            </div>

            {applications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Aucune candidature pour le moment</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {applications.map((app) => (
                  <div key={app.id} className="p-4">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-lg font-semibold text-foreground">
                            {app.prenomRP} {app.nomRP}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            app.status === 'pending'
                              ? 'bg-accent/20 text-accent'
                              : app.status === 'accepted'
                              ? 'bg-success/20 text-success'
                              : 'bg-destructive/20 text-destructive'
                          }`}>
                            {app.status === 'pending' && 'En attente'}
                            {app.status === 'accepted' && 'Acceptée'}
                            {app.status === 'rejected' && 'Refusée'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="text-foreground">ID:</span> {app.idJoueur}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="text-foreground">Motivation:</span> {app.motivation}
                        </p>
                        {app.experience && (
                          <p className="text-sm text-muted-foreground">
                            <span className="text-foreground">Expérience:</span> {app.experience}
                          </p>
                        )}
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex gap-2 lg:flex-col">
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'accepted')}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Accepter
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Panel;
