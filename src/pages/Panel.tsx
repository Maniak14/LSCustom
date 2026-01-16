import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { Lock, LogOut, Check, X, Clock, Users, Circle } from 'lucide-react';

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
        <main className="pt-32 pb-24 px-4">
          <div className="max-w-sm mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Accès réservé
              </p>
            </div>

            <form onSubmit={handleLogin} className="glass-card">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-modern ${loginError ? 'ring-2 ring-destructive/50' : ''}`}
                  placeholder="••••••••"
                />
                {loginError && (
                  <p className="text-sm text-destructive mt-2">Mot de passe incorrect</p>
                )}
              </div>
              <button type="submit" className="btn-primary w-full">
                Connexion
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Gestion du recrutement</p>
            </div>
            <button
              onClick={logoutEmployee}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-muted text-muted-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card text-center !p-4">
              <Users className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="glass-card text-center !p-4">
              <Clock className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-accent">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
            <div className="glass-card text-center !p-4">
              <Check className="w-5 h-5 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">{acceptedCount}</p>
              <p className="text-xs text-muted-foreground">Acceptées</p>
            </div>
            <div className="glass-card text-center !p-4">
              <X className="w-5 h-5 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Refusées</p>
            </div>
          </div>

          {/* Recruitment Toggle */}
          <div className="glass-card mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-semibold mb-1">État du recrutement</h2>
                <p className="text-sm text-muted-foreground">
                  {isRecruitmentOpen ? 'Ouvert aux candidatures' : 'Fermé temporairement'}
                </p>
              </div>
              <button
                onClick={() => setIsRecruitmentOpen(!isRecruitmentOpen)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isRecruitmentOpen
                    ? 'bg-[#90EE90] hover:bg-[#7ED87E] text-foreground'
                    : 'bg-[#FFB3B3] hover:bg-[#FF9999] text-foreground'
                }`}
              >
                <Circle className={`w-2 h-2 ${isRecruitmentOpen ? 'fill-current' : 'fill-current'}`} />
                {isRecruitmentOpen ? 'Ouvert' : 'Fermé'}
              </button>
            </div>
          </div>

          {/* Applications */}
          <div className="glass-card !p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Candidatures</h2>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Aucune candidature</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">
                            {app.prenomRP} {app.nomRP}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                        <p className="text-xs text-muted-foreground mb-1">ID: {app.idJoueur}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{app.motivation}</p>
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'accepted')}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm bg-success/10 text-success hover:bg-success/20 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Accepter
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
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
