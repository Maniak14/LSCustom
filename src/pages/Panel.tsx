import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment, TeamMember } from '@/contexts/RecruitmentContext';
import { Lock, LogOut, Check, X, Clock, Users, Circle, Plus, Filter, UserPlus, Trash2, Edit, User } from 'lucide-react';

const Panel: React.FC = () => {
  const {
    isEmployeeLoggedIn,
    loginEmployee,
    logoutEmployee,
    isRecruitmentOpen,
    handleSetRecruitmentOpen,
    applications,
    sessions,
    currentSession,
    teamMembers,
    updateApplicationStatus,
    createSession,
    closeSession,
    getApplicationsBySession,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
  } = useRecruitment();

  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  
  // Team management
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [teamFormData, setTeamFormData] = useState({
    prenom: '',
    nom: '',
    role: '',
    photo: '',
  });

  // Filtrer les candidatures selon la session sélectionnée
  const filteredApplications = selectedSessionId === null 
    ? applications 
    : getApplicationsBySession(selectedSessionId);

  const pendingCount = filteredApplications.filter(a => a.status === 'pending').length;
  const acceptedCount = filteredApplications.filter(a => a.status === 'accepted').length;
  const rejectedCount = filteredApplications.filter(a => a.status === 'rejected').length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginEmployee(password);
    if (!success) {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 3000);
    }
    setPassword('');
  };

  if (!isEmployeeLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 pb-24 px-4">
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
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
                {currentSession && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Session active : {currentSession.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleSetRecruitmentOpen(!isRecruitmentOpen)}
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

          {/* Sessions Management */}
          <div className="glass-card mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="font-semibold mb-1">Sessions de recrutement</h2>
                <p className="text-sm text-muted-foreground">
                  Gérez les sessions de recrutement
                </p>
              </div>
              <button
                onClick={() => setShowNewSessionForm(!showNewSessionForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle session
              </button>
            </div>

            {/* Formulaire nouvelle session */}
            {showNewSessionForm && (
              <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Nom de la session (ex: Recrutement Janvier 2024)"
                    className="input-modern flex-1"
                  />
                  <button
                    onClick={() => {
                      if (newSessionName.trim()) {
                        createSession(newSessionName.trim());
                        setNewSessionName('');
                        setShowNewSessionForm(false);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Créer
                  </button>
                  <button
                    onClick={() => {
                      setShowNewSessionForm(false);
                      setNewSessionName('');
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des sessions */}
            {sessions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filtrer par session :</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSessionId(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedSessionId === null
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Toutes ({applications.length})
                  </button>
                  {sessions.map((session) => {
                    const sessionApps = getApplicationsBySession(session.id);
                    return (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSessionId(session.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedSessionId === session.id
                            ? 'bg-primary text-primary-foreground'
                            : session.isActive
                            ? 'bg-[#90EE90]/20 text-[#4CAF50] hover:bg-[#90EE90]/30'
                            : 'bg-muted text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        {session.name} ({sessionApps.length})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Applications */}
          <div className="glass-card !p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">
                Candidatures
                {selectedSessionId && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredApplications.length} candidature{filteredApplications.length > 1 ? 's' : ''})
                  </span>
                )}
              </h2>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  {selectedSessionId ? 'Aucune candidature pour cette session' : 'Aucune candidature'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredApplications.map((app) => {
                  const session = sessions.find(s => s.id === app.sessionId);
                  return (
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
                        {session && (
                          <p className="text-xs text-muted-foreground mb-1">
                            Session: {session.name}
                          </p>
                        )}
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
                  );
                })}
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
