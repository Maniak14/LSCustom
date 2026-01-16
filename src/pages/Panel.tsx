import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment, TeamMember, User } from '@/contexts/RecruitmentContext';
import { useTheme } from '@/hooks/use-theme';
import { Lock, LogOut, Check, X, Clock, Users, Circle, Plus, Filter, UserPlus, Trash2, Edit, User as UserIcon, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Panel: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
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
    isUserLoggedIn,
    currentUser,
    logoutUser,
    users,
    updateUserByAdmin,
    deleteUser,
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
    userId: '',
    prenom: '',
    nom: '',
    role: '',
    photo: '',
  });

  // Filtrer les utilisateurs direction qui ne sont pas déjà dans l'équipe
  const availableDirectionUsers = users.filter(user => {
    if (user.grade !== 'direction') return false;
    // Si on est en mode édition, on peut garder l'utilisateur actuel
    if (editingMember) {
      // Vérifier si cet utilisateur correspond au membre en cours d'édition
      const memberUser = users.find(u => 
        u.prenom === editingMember.prenom && u.nom === editingMember.nom
      );
      if (memberUser && memberUser.id === user.id) return true;
    }
    // Vérifier si l'utilisateur n'est pas déjà dans l'équipe
    return !teamMembers.some(member => 
      member.prenom === user.prenom && member.nom === user.nom
    );
  });

  // User management
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    grade: 'client' as 'direction' | 'client',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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

  // Vérifier si l'utilisateur connecté a le grade "direction"
  const hasDirectionAccess = isUserLoggedIn && currentUser?.grade === 'direction';
  const canAccessPanel = isEmployeeLoggedIn || hasDirectionAccess;

  if (!canAccessPanel) {
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
                Accès réservé aux membres de la direction
              </p>
            </div>

            {!isUserLoggedIn ? (
              <div className="glass-card text-center">
                <p className="text-muted-foreground mb-4">
                  Vous devez être connecté avec un compte de direction pour accéder au dashboard.
                </p>
                <Link to="/inscription" className="btn-primary w-full">
                  Se connecter
                </Link>
              </div>
            ) : (
              <div className="glass-card text-center">
                <p className="text-muted-foreground">
                  Accès refusé. Seuls les membres de la direction peuvent accéder au dashboard.
                </p>
              </div>
            )}
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
              onClick={() => {
                if (hasDirectionAccess) {
                  logoutUser();
                  navigate('/');
                } else {
                  logoutEmployee();
                }
              }}
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
                onClick={async () => await handleSetRecruitmentOpen(!isRecruitmentOpen)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isRecruitmentOpen
                    ? 'dark:bg-[#4CAF50] dark:hover:bg-[#45a049] dark:text-white bg-[#90EE90] hover:bg-[#7ED87E] text-foreground'
                    : 'dark:bg-[#D32F2F] dark:hover:bg-[#C62828] dark:text-white bg-[#FFB3B3] hover:bg-[#FF9999] text-foreground'
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
                    onClick={async () => {
                      if (newSessionName.trim()) {
                        await createSession(newSessionName.trim());
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
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                        <div className="flex gap-2 shrink-0 lg:flex-row flex-col sm:flex-row">
                          <button
                            onClick={async () => await updateApplicationStatus(app.id, 'accepted')}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-success/10 text-success hover:bg-success/20 transition-colors whitespace-nowrap"
                          >
                            <Check className="w-4 h-4" />
                            Accepter
                          </button>
                          <button
                            onClick={async () => await updateApplicationStatus(app.id, 'rejected')}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors whitespace-nowrap"
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

          {/* Team Management */}
          <div className="glass-card mb-8 mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="font-semibold mb-1">Équipe de direction</h2>
                <p className="text-sm text-muted-foreground">
                  Gérez les membres de l'équipe affichés sur le site
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTeamForm(true);
                  setEditingMember(null);
                  setTeamFormData({ userId: '', prenom: '', nom: '', role: '', photo: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Ajouter un membre
              </button>
            </div>

            {/* Formulaire ajout/édition membre */}
            {showTeamForm && (
              <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border">
                <h3 className="font-semibold mb-4">
                  {editingMember ? 'Modifier le membre' : 'Nouveau membre'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {!editingMember && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">Sélectionner un membre de la direction *</label>
                      <select
                        value={teamFormData.userId}
                        onChange={(e) => {
                          const selectedUser = users.find(u => u.id === e.target.value);
                          if (selectedUser) {
                            setTeamFormData({
                              ...teamFormData,
                              userId: selectedUser.id,
                              prenom: selectedUser.prenom || '',
                              nom: selectedUser.nom || '',
                            });
                          }
                        }}
                        className="input-modern"
                        required={!editingMember}
                      >
                        <option value="">-- Sélectionner un utilisateur --</option>
                        {availableDirectionUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.prenom && user.nom
                              ? `${user.prenom} ${user.nom} (${user.idPersonnel})`
                              : user.prenom || user.nom || user.idPersonnel}
                          </option>
                        ))}
                      </select>
                      {availableDirectionUsers.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Aucun utilisateur avec le grade "direction" disponible. Tous les membres de la direction sont déjà dans l'équipe.
                        </p>
                      )}
                    </div>
                  )}
                  {editingMember && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Prénom</label>
                        <input
                          type="text"
                          value={teamFormData.prenom}
                          className="input-modern"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Nom</label>
                        <input
                          type="text"
                          value={teamFormData.nom}
                          className="input-modern"
                          disabled
                        />
                      </div>
                    </>
                  )}
                  {!editingMember && teamFormData.userId && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Prénom</label>
                        <input
                          type="text"
                          value={teamFormData.prenom}
                          className="input-modern"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Nom</label>
                        <input
                          type="text"
                          value={teamFormData.nom}
                          className="input-modern"
                          disabled
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">Rôle *</label>
                    <input
                      type="text"
                      value={teamFormData.role}
                      onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}
                      className="input-modern"
                      placeholder="Directeur"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Photo (URL) *</label>
                    <input
                      type="text"
                      value={teamFormData.photo}
                      onChange={(e) => setTeamFormData({ ...teamFormData, photo: e.target.value })}
                      className="input-modern"
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (editingMember) {
                        // En mode édition, on peut modifier le rôle et la photo
                        if (teamFormData.role) {
                          await updateTeamMember(editingMember.id, {
                            role: teamFormData.role,
                            photo: teamFormData.photo || undefined,
                          });
                          setShowTeamForm(false);
                          setTeamFormData({ userId: '', prenom: '', nom: '', role: '', photo: '' });
                          setEditingMember(null);
                        }
                      } else {
                        // En mode ajout, on doit avoir sélectionné un utilisateur
                        if (teamFormData.userId && teamFormData.prenom && teamFormData.nom && teamFormData.role && teamFormData.photo) {
                          await addTeamMember({
                            prenom: teamFormData.prenom,
                            nom: teamFormData.nom,
                            role: teamFormData.role,
                            photo: teamFormData.photo,
                          });
                          setShowTeamForm(false);
                          setTeamFormData({ userId: '', prenom: '', nom: '', role: '', photo: '' });
                          setEditingMember(null);
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={editingMember ? !teamFormData.role : !teamFormData.userId || !teamFormData.role || !teamFormData.photo}
                  >
                    {editingMember ? 'Modifier' : 'Ajouter'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTeamForm(false);
                      setTeamFormData({ userId: '', prenom: '', nom: '', role: '', photo: '' });
                      setEditingMember(null);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des membres */}
            {teamMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun membre dans l'équipe
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={`${member.prenom} ${member.nom}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">
                          {member.prenom} {member.nom}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {member.role}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setTeamFormData({
                                userId: '',
                                prenom: member.prenom,
                                nom: member.nom,
                                role: member.role,
                                photo: member.photo || '',
                              });
                              setShowTeamForm(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Modifier
                          </button>
                          <button
                            onClick={async () => await removeTeamMember(member.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Retirer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Management */}
          <div className="glass-card !p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="font-semibold">Gestion des utilisateurs</h2>
            </div>

            {showUserForm && editingUser && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await updateUserByAdmin(editingUser.id, {
                    prenom: userFormData.prenom || undefined,
                    nom: userFormData.nom || undefined,
                    telephone: userFormData.telephone,
                    grade: userFormData.grade,
                  });
                  setShowUserForm(false);
                  setEditingUser(null);
                  setUserFormData({ prenom: '', nom: '', telephone: '', grade: 'client' });
                }}
                className="p-4 border-b border-border animate-fade-up"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Modifier un utilisateur
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prénom</label>
                    <input
                      type="text"
                      value={userFormData.prenom}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, prenom: e.target.value }))}
                      className="input-modern"
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom</label>
                    <input
                      type="text"
                      value={userFormData.nom}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, nom: e.target.value }))}
                      className="input-modern"
                      placeholder="Nom"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={userFormData.telephone}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, telephone: e.target.value }))}
                      className="input-modern"
                      placeholder="Numéro de téléphone"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Grade *</label>
                    <select
                      value={userFormData.grade}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, grade: e.target.value as 'direction' | 'client' }))}
                      className="input-modern"
                      required
                    >
                      <option value="client">Client</option>
                      <option value="direction">Direction</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false);
                      setUserFormData({ prenom: '', nom: '', telephone: '', grade: 'client' });
                      setEditingUser(null);
                    }}
                    className="btn-ghost flex-1"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {users.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Aucun utilisateur enregistré</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {users.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">
                            {user.prenom && user.nom
                              ? `${user.prenom} ${user.nom}`
                              : user.prenom || user.nom || user.idPersonnel}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.grade === 'direction'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {user.grade === 'direction' ? 'Direction' : 'Client'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">ID: {user.idPersonnel}</p>
                        <p className="text-xs text-muted-foreground">Tél: {user.telephone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setUserFormData({
                            prenom: user.prenom || '',
                            nom: user.nom || '',
                            telephone: user.telephone,
                            grade: user.grade,
                          });
                          setShowUserForm(true);
                        }}
                        className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteDialog(true);
                        }}
                        className="p-2 rounded-full text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Supprimer"
                        disabled={currentUser?.id === user.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal de confirmation de suppression */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <DialogTitle>Supprimer l'utilisateur</DialogTitle>
                </div>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
                  <strong>
                    {userToDelete?.prenom && userToDelete?.nom
                      ? `${userToDelete.prenom} ${userToDelete.nom}`
                      : userToDelete?.prenom || userToDelete?.nom || userToDelete?.idPersonnel}
                  </strong>
                  ?
                  <br />
                  <span className="text-xs text-muted-foreground mt-2 block">
                    Cette action est irréversible.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setUserToDelete(null);
                  }}
                  className="btn-ghost"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (userToDelete) {
                      await deleteUser(userToDelete.id);
                      setShowDeleteDialog(false);
                      setUserToDelete(null);
                    }
                  }}
                  className="btn-primary bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Supprimer
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Panel;
