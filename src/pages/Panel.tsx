import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment, TeamMember, User, Application, ClientReview, Appointment, Partenaire } from '@/contexts/RecruitmentContext';
import { useTheme } from '@/hooks/use-theme';
import { Lock, LogOut, Check, X, Clock, Users, Circle, Plus, Filter, UserPlus, Trash2, Edit, User as UserIcon, AlertTriangle, Eye, ChevronLeft, ChevronRight, Search, ChevronUp, ChevronDown, Star, Calendar, MessageSquare, Phone, Building2, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    deleteApplication,
    createSession,
    closeSession,
    deleteSession,
    getApplicationsBySession,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    updateTeamMemberOrder,
    isUserLoggedIn,
    currentUser,
    logoutUser,
    users,
    updateUserByAdmin,
    deleteUser,
    clientReviews,
    addClientReview,
    updateReviewStatus,
    deleteReview,
    appointments,
    addAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    hasPendingAppointment,
    partenaires,
    addPartenaire,
    updatePartenaire,
    deletePartenaire,
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

  // Filtrer les utilisateurs direction et RH qui ne sont pas déjà dans l'équipe
  const availableDirectionUsers = users.filter(user => {
    if (user.grade !== 'direction' && user.grade !== 'rh') return false;
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
  const [userFormData, setUserFormData] = useState<{
    prenom: string;
    nom: string;
    telephone: string;
    grade: 'direction' | 'client' | 'dev' | 'rh' | 'employee';
  }>({
    prenom: '',
    nom: '',
    telephone: '',
    grade: 'client',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userFormError, setUserFormError] = useState(''); // Added for error handling
  const [showDeleteAppDialog, setShowDeleteAppDialog] = useState(false);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);
  const [showDeleteTeamDialog, setShowDeleteTeamDialog] = useState(false);
  const [teamMemberToDelete, setTeamMemberToDelete] = useState<TeamMember | null>(null);
  const [showAppDetailDialog, setShowAppDetailDialog] = useState(false);
  const [appToView, setAppToView] = useState<Application | null>(null);
  const [showAppointmentDetailDialog, setShowAppointmentDetailDialog] = useState(false);
  const [appointmentToView, setAppointmentToView] = useState<Appointment | null>(null);
  const [showReviewDetailDialog, setShowReviewDetailDialog] = useState(false);
  const [reviewToView, setReviewToView] = useState<ClientReview | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 10;
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const usersPerPage = 10;
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState('');
  const [currentAppointmentPage, setCurrentAppointmentPage] = useState(1);
  const appointmentsPerPage = 10;
  const [showDeleteAppointmentDialog, setShowDeleteAppointmentDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [showPartenaireForm, setShowPartenaireForm] = useState(false);
  const [partenaireFormData, setPartenaireFormData] = useState({
    nom: '',
    logoUrl: '',
  });
  const [showDeletePartenaireDialog, setShowDeletePartenaireDialog] = useState(false);
  const [partenaireToDelete, setPartenaireToDelete] = useState<Partenaire | null>(null);
  const [editingPartenaire, setEditingPartenaire] = useState<Partenaire | null>(null);
  const [showDeleteSessionDialog, setShowDeleteSessionDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [deleteSessionError, setDeleteSessionError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // Filtrer les candidatures selon la session sélectionnée (pour les stats)
  const sessionFilteredApplications = selectedSessionId === null 
    ? applications 
    : getApplicationsBySession(selectedSessionId);
  
  // Calculer les statistiques sur les candidatures filtrées par session uniquement
  // "En attente" inclut 'pending' et 'interview_waiting'
  const pendingCount = sessionFilteredApplications.filter(a => a.status === 'pending' || a.status === 'interview_waiting').length;
  const acceptedCount = sessionFilteredApplications.filter(a => a.status === 'accepted').length;
  const rejectedCount = sessionFilteredApplications.filter(a => a.status === 'rejected').length;

  // Appliquer le filtre de statut pour l'affichage
  let filteredApplications = sessionFilteredApplications;
  if (statusFilter !== 'all') {
    if (statusFilter === 'pending') {
      // Le filtre "En attente" inclut 'pending' et 'interview_waiting'
      filteredApplications = filteredApplications.filter(app => app.status === 'pending' || app.status === 'interview_waiting');
    } else {
      filteredApplications = filteredApplications.filter(app => app.status === statusFilter);
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);
  const startIndex = (currentPage - 1) * applicationsPerPage;
  const endIndex = startIndex + applicationsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  // Réinitialiser la page si elle dépasse le nombre total de pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Réinitialiser la page quand on change de session, de recherche ou de statut
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSessionId, appSearchQuery, statusFilter]);

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = userSearchQuery.trim()
    ? users.filter(user => {
        const query = userSearchQuery.toLowerCase().trim();
        const fullName = user.prenom && user.nom 
          ? `${user.prenom} ${user.nom}`.toLowerCase()
          : (user.prenom || user.nom || '').toLowerCase();
        return (
          fullName.includes(query) ||
          user.idPersonnel.toLowerCase().includes(query) ||
          (user.prenom && user.prenom.toLowerCase().includes(query)) ||
          (user.nom && user.nom.toLowerCase().includes(query))
        );
      })
    : users;

  // Pagination pour les utilisateurs
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
  const userStartIndex = (currentUserPage - 1) * usersPerPage;
  const userEndIndex = userStartIndex + usersPerPage;
  const paginatedUsers = filteredUsers.slice(userStartIndex, userEndIndex);

  // Réinitialiser la page utilisateur quand on change de recherche
  useEffect(() => {
    setCurrentUserPage(1);
  }, [userSearchQuery]);

  // Filtrer les rendez-vous selon la recherche et le rôle
  // Si l'utilisateur est RH, il ne voit que ses propres rendez-vous
  let baseAppointments = appointments;
  if (currentUser?.grade === 'rh') {
    baseAppointments = appointments.filter(appointment => appointment.directionUserId === currentUser.id);
  }

  const filteredAppointments = appointmentSearchQuery.trim()
    ? baseAppointments.filter(appointment => {
        const query = appointmentSearchQuery.toLowerCase().trim();
        const fullName = appointment.prenom && appointment.nom 
          ? `${appointment.prenom} ${appointment.nom}`.toLowerCase()
          : (appointment.prenom || appointment.nom || '').toLowerCase();
        return (
          fullName.includes(query) ||
          appointment.idPersonnel.toLowerCase().includes(query) ||
          appointment.telephone.toLowerCase().includes(query) ||
          appointment.reason.toLowerCase().includes(query) ||
          (appointment.prenom && appointment.prenom.toLowerCase().includes(query)) ||
          (appointment.nom && appointment.nom.toLowerCase().includes(query))
        );
      })
    : baseAppointments;

  // Pagination pour les rendez-vous
  const totalAppointmentPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const appointmentStartIndex = (currentAppointmentPage - 1) * appointmentsPerPage;
  const appointmentEndIndex = appointmentStartIndex + appointmentsPerPage;
  const paginatedAppointments = filteredAppointments
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(appointmentStartIndex, appointmentEndIndex);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginEmployee(password);
    if (!success) {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 3000);
    }
    setPassword('');
  };

  // Vérifier si l'utilisateur connecté a le grade "direction", "dev" ou "rh"
  const hasDirectionAccess = isUserLoggedIn && (currentUser?.grade === 'direction' || currentUser?.grade === 'dev' || currentUser?.grade === 'rh');
  const canAccessPanel = isEmployeeLoggedIn || hasDirectionAccess;
  
  // Vérifier si l'utilisateur est uniquement RH (accès limité)
  const isRH = isUserLoggedIn && currentUser?.grade === 'rh';

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
            <button
              onClick={() => setStatusFilter('all')}
              className={`glass-card text-center !p-4 transition-all hover:scale-105 focus:outline-none active:scale-105 ${
                statusFilter === 'all' ? 'ring-2 ring-primary hover:ring-2 hover:ring-primary' : ''
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Users className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`glass-card text-center !p-4 transition-all hover:scale-105 focus:outline-none active:scale-105 ${
                statusFilter === 'pending' ? 'ring-2 ring-accent hover:ring-2 hover:ring-accent' : ''
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Clock className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-accent">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </button>
            <button
              onClick={() => setStatusFilter('accepted')}
              className={`glass-card text-center !p-4 transition-all hover:scale-105 focus:outline-none active:scale-105 ${
                statusFilter === 'accepted' ? 'ring-2 ring-success hover:ring-2 hover:ring-success' : ''
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Check className="w-5 h-5 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">{acceptedCount}</p>
              <p className="text-xs text-muted-foreground">Acceptées</p>
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`glass-card text-center !p-4 transition-all hover:scale-105 focus:outline-none active:scale-105 ${
                statusFilter === 'rejected' ? 'ring-2 ring-destructive hover:ring-2 hover:ring-destructive' : ''
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <X className="w-5 h-5 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Refusées</p>
            </button>
          </div>

          {/* Recruitment Toggle - Masqué pour RH */}
          {!isRH && (
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
          )}

          {/* État du recrutement - Version lecture seule pour RH */}
          {isRH && (
            <div className="glass-card mb-8">
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
            </div>
          )}

          {/* Sessions Management */}
          <div className="glass-card mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="font-semibold mb-1">Sessions de recrutement</h2>
                <p className="text-sm text-muted-foreground">
                  {isRH ? 'Sessions de recrutement' : 'Gérez les sessions de recrutement'}
                </p>
              </div>
              {!isRH && (
                <button
                  onClick={() => setShowNewSessionForm(!showNewSessionForm)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle session
                </button>
              )}
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
                      <div key={session.id} className="relative inline-flex items-center group">
                        <button
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
                        {!isRH && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDelete(session.id);
                              setShowDeleteSessionDialog(true);
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive transition-opacity text-[10px]"
                            title="Supprimer la session"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Applications */}
          <div className="glass-card !p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h2 className="font-semibold mb-1">
                    Candidatures
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    ({filteredApplications.length} candidature{filteredApplications.length > 1 ? 's' : ''})
                  </p>
                </div>
                {/* Recherche candidatures */}
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={appSearchQuery}
                      onChange={(e) => setAppSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom, prénom ou ID..."
                      className="input-modern pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  {selectedSessionId ? 'Aucune candidature pour cette session' : 'Aucune candidature'}
                </p>
              </div>
            ) : (
              <>
              <div className="divide-y divide-border">
                  {paginatedApplications.map((app) => {
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
                              : app.status === 'interview_waiting'
                              ? 'bg-blue-500/20 text-blue-500'
                              : app.status === 'accepted'
                              ? 'bg-success/20 text-success'
                              : 'bg-destructive/20 text-destructive'
                          }`}>
                            {app.status === 'pending' && 'En attente'}
                            {app.status === 'interview_waiting' && 'En attente d\'entretien'}
                            {app.status === 'accepted' && 'Acceptée'}
                            {app.status === 'rejected' && 'Refusée'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">ID: {app.idJoueur}</p>
                        {app.telephone && (
                          <p className="text-xs text-muted-foreground mb-1">Téléphone: {app.telephone}</p>
                        )}
                        {session && (
                          <p className="text-xs text-muted-foreground mb-1">
                            Session: {session.name}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">{app.motivation}</p>
                      </div>

                      <div className="flex gap-2 shrink-0 lg:flex-row flex-col sm:flex-row">
                        <button
                          onClick={() => {
                            setAppToView(app);
                            setShowAppDetailDialog(true);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      {app.status === 'pending' && (
                          <>
                            <button
                              onClick={async () => await updateApplicationStatus(app.id, 'interview_waiting')}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors whitespace-nowrap"
                            >
                              <Check className="w-4 h-4" />
                              Mise en attente
                            </button>
                            <button
                              onClick={async () => await updateApplicationStatus(app.id, 'rejected')}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors whitespace-nowrap"
                            >
                              <X className="w-4 h-4" />
                              Refuser
                            </button>
                          </>
                        )}
                        {app.status === 'interview_waiting' && (
                          <>
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
                          </>
                        )}
                        {!isRH && (
                          <button
                            onClick={() => {
                              setAppToDelete(app);
                              setShowDeleteAppDialog(true);
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({filteredApplications.length} candidature{filteredApplications.length > 1 ? 's' : ''})
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Page précédente"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Page suivante"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Team Management - Masqué pour RH */}
          {!isRH && (
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
                      <label className="block text-sm font-medium mb-2">Sélectionner un membre de la direction ou un RH *</label>
                      <Select
                        value={teamFormData.userId || undefined}
                        onValueChange={(value) => {
                          const selectedUser = users.find(u => u.id === value);
                          if (selectedUser) {
                            setTeamFormData({
                              ...teamFormData,
                              userId: selectedUser.id,
                              prenom: selectedUser.prenom || '',
                              nom: selectedUser.nom || '',
                              photo: selectedUser.photoUrl || '', // Utiliser la photo de profil par défaut
                            });
                          }
                        }}
                        required={!editingMember}
                      >
                        <SelectTrigger className="input-modern h-auto py-3.5">
                          <SelectValue placeholder="-- Sélectionner un utilisateur --" />
                        </SelectTrigger>
                        <SelectContent className="scrollbar-hide">
                          {availableDirectionUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.prenom && user.nom
                                ? `${user.prenom} ${user.nom} (${user.idPersonnel})`
                                : user.prenom || user.nom || user.idPersonnel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableDirectionUsers.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Aucun utilisateur avec le grade "direction" ou "rh" disponible. Tous les membres sont déjà dans l'équipe.
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
                  {(() => {
                    const selectedUser = teamFormData.userId ? users.find(u => u.id === teamFormData.userId) : null;
                    const hasPhotoUrl = selectedUser?.photoUrl;
                    // Afficher le champ photo seulement si l'utilisateur n'a pas de photo de profil ou en mode édition
                    if (!hasPhotoUrl || editingMember) {
                      return (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Photo (URL) {!editingMember && !hasPhotoUrl && '*'}
                          </label>
                          <input
                            type="text"
                            value={teamFormData.photo}
                            onChange={(e) => setTeamFormData({ ...teamFormData, photo: e.target.value })}
                            className="input-modern"
                            placeholder="https://..."
                            required={!editingMember && !hasPhotoUrl}
                          />
                          {hasPhotoUrl && (
                            <p className="text-xs text-muted-foreground mt-2">
                              L'utilisateur a déjà une photo de profil. Laissez vide pour l'utiliser, ou entrez une URL personnalisée.
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
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
                        if (teamFormData.userId && teamFormData.prenom && teamFormData.nom && teamFormData.role) {
                          // Utiliser la photo du formulaire si elle existe, sinon utiliser la photoUrl de l'utilisateur
                          const selectedUser = users.find(u => u.id === teamFormData.userId);
                          const photoToUse = teamFormData.photo || selectedUser?.photoUrl;
                          
                          await addTeamMember({
                            userId: teamFormData.userId,
                            prenom: teamFormData.prenom,
                            nom: teamFormData.nom,
                            role: teamFormData.role,
                            photo: photoToUse || undefined,
                          });
                          setShowTeamForm(false);
                          setTeamFormData({ userId: '', prenom: '', nom: '', role: '', photo: '' });
                          setEditingMember(null);
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={editingMember ? !teamFormData.role : !teamFormData.userId || !teamFormData.role || (!teamFormData.photo && !users.find(u => u.id === teamFormData.userId)?.photoUrl)}
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
                {teamMembers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((member, index) => {
                  const sortedMembers = [...teamMembers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                  const isFirst = index === 0;
                  const isLast = index === sortedMembers.length - 1;
                  return (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {(() => {
                          // Chercher l'utilisateur correspondant au membre
                          const memberUser = member.userId 
                            ? users.find(u => u.id === member.userId)
                            : users.find(u => u.prenom === member.prenom && u.nom === member.nom);
                          
                          // Utiliser la photo du membre si elle existe, sinon utiliser la photoUrl de l'utilisateur
                          const photoToDisplay = member.photo || memberUser?.photoUrl;
                          
                          return photoToDisplay ? (
                            <img
                              src={photoToDisplay}
                              alt={`${member.prenom} ${member.nom}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-8 h-8 text-muted-foreground" />
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">
                          {member.prenom} {member.nom}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {member.role}
                          {isFirst && <span className="ml-2 text-xs text-primary font-medium">(Premier)</span>}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {/* Boutons ordre */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateTeamMemberOrder(member.id, 'up')}
                              disabled={isFirst}
                              className="flex items-center justify-center p-1.5 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Monter"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => updateTeamMemberOrder(member.id, 'down')}
                              disabled={isLast}
                              className="flex items-center justify-center p-1.5 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Descendre"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              // Chercher l'utilisateur correspondant au membre
                              const memberUser = member.userId 
                                ? users.find(u => u.id === member.userId)
                                : users.find(u => u.prenom === member.prenom && u.nom === member.nom);
                              
                              setEditingMember(member);
                              setTeamFormData({
                                userId: '',
                                prenom: member.prenom,
                                nom: member.nom,
                                role: member.role,
                                // Utiliser la photo du membre si elle existe, sinon utiliser la photoUrl de l'utilisateur
                                photo: member.photo || memberUser?.photoUrl || '',
                              });
                              setShowTeamForm(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              setTeamMemberToDelete(member);
                              setShowDeleteTeamDialog(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Retirer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* User Management - Masqué pour RH */}
          {!isRH && (
          <div className="glass-card !p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h2 className="font-semibold mb-1">Gestion des utilisateurs</h2>
                  <p className="text-sm text-muted-foreground">
                    ({filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''})
                  </p>
                </div>
                {/* Recherche utilisateurs */}
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom ou ID..."
                      className="input-modern pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
            </div>

            {showUserForm && editingUser && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setUserFormError('');
                  const result = await updateUserByAdmin(editingUser.id, {
                    prenom: userFormData.prenom || undefined,
                    nom: userFormData.nom || undefined,
                    telephone: userFormData.telephone,
                    grade: userFormData.grade,
                  });
                  if (result && typeof result === 'object' && 'error' in result) {
                    if (result.error === 'telephone') {
                      setUserFormError('Ce numéro de téléphone est déjà utilisé par un autre utilisateur.');
                    } else if (result.error === 'protected') {
                      setUserFormError('Vous n\'avez pas les permissions pour modifier cet utilisateur ou ce grade.');
                    }
                  } else if (result === true) {
                    setShowUserForm(false);
                    setEditingUser(null);
                    setUserFormData({ prenom: '', nom: '', telephone: '', grade: 'client' });
                    setUserFormError('');
                  }
                }}
                className="p-4 border-b border-border animate-fade-up"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Modifier un utilisateur
                </h3>
                {userFormError && (
                  <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{userFormError}</p>
                  </div>
                )}
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
                    <Select
                      value={userFormData.grade}
                      onValueChange={(value) => setUserFormData(prev => ({ ...prev, grade: value as 'direction' | 'client' | 'dev' | 'rh' | 'employee' }))}
                      required
                    >
                      <SelectTrigger className="input-modern h-auto py-3.5">
                        <SelectValue placeholder="Sélectionner un grade" />
                      </SelectTrigger>
                      <SelectContent className="scrollbar-hide">
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="employee">Employé</SelectItem>
                        <SelectItem value="direction">Direction</SelectItem>
                        {/* Protection : Seuls les "dev" peuvent attribuer le grade "dev" */}
                        {currentUser?.grade === 'dev' && (
                          <SelectItem value="dev">Dev</SelectItem>
                        )}
                        <SelectItem value="rh">RH</SelectItem>
                      </SelectContent>
                    </Select>
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
                      setUserFormError('');
                    }}
                    className="btn-ghost flex-1"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  {userSearchQuery.trim() ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur enregistré'}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {paginatedUsers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.photoUrl} alt={`${user.prenom || ''} ${user.nom || ''}`.trim() || user.idPersonnel} />
                        <AvatarFallback className="bg-muted">
                          {user.prenom || user.nom ? (
                            <span className="text-sm font-medium text-muted-foreground">
                              {user.prenom?.charAt(0).toUpperCase() || ''}{user.nom?.charAt(0).toUpperCase() || ''}
                            </span>
                          ) : (
                            <UserIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">
                            {user.prenom && user.nom
                              ? `${user.prenom} ${user.nom}`
                              : user.prenom || user.nom || user.idPersonnel}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.grade === 'dev'
                              ? 'bg-destructive/20 text-destructive'
                              : user.grade === 'direction' || user.grade === 'rh'
                              ? 'bg-primary/20 text-primary'
                              : user.grade === 'employee'
                              ? 'bg-success/20 text-success' // Vert pour l'employé
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {user.grade === 'direction' ? 'Direction' : user.grade === 'dev' ? 'Dev' : user.grade === 'rh' ? 'RH' : user.grade === 'employee' ? 'Employé' : 'Client'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">ID: {user.idPersonnel}</p>
                        <p className="text-xs text-muted-foreground">Tél: {user.telephone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {/* Protection : Les utilisateurs "dev" ne peuvent être modifiés que par un autre "dev" */}
                      {(currentUser?.grade === 'dev' || user.grade !== 'dev') && (
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
                      )}
                      {/* Protection : Les utilisateurs "dev" ne peuvent être supprimés que par un autre "dev" */}
                      {(currentUser?.grade === 'dev' || user.grade !== 'dev') && (
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
                      )}
                    </div>
                  </div>
                ))}
              </div>

                {/* Pagination utilisateurs */}
                {totalUserPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Page {currentUserPage} sur {totalUserPages} ({filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''})
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentUserPage(prev => Math.max(1, prev - 1))}
                        disabled={currentUserPage === 1}
                        className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Page précédente"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentUserPage(prev => Math.min(totalUserPages, prev + 1))}
                        disabled={currentUserPage === totalUserPages}
                        className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Page suivante"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          )}

          {/* Gestion des avis clients - Masqué pour RH */}
          {!isRH && (
          <div className="glass-card mb-8 mt-12">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="font-semibold mb-1">Gestion des avis clients</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Approuvez ou refusez les avis clients
            </p>
            {clientReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun avis client en attente
              </p>
            ) : (
              <div className="divide-y divide-border">
                {clientReviews
                  .filter(review => review.status === 'pending')
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((review) => (
                    <div
                      key={review.id}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-accent text-accent'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {review.prenom} {review.nom} ({review.idPersonnel})
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                        </div>

                        <div className="flex gap-2 shrink-0 lg:flex-row flex-col sm:flex-row">
                          <button
                            onClick={() => {
                              setReviewToView(review);
                              setShowReviewDetailDialog(true);
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (currentUser) {
                                await updateReviewStatus(review.id, 'approved', currentUser.id);
                              }
                            }}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-success/10 text-success hover:bg-success/20 transition-colors whitespace-nowrap"
                          >
                            <Check className="w-4 h-4" />
                            Accepter
                          </button>
                          <button
                            onClick={async () => {
                              if (currentUser) {
                                await updateReviewStatus(review.id, 'rejected', currentUser.id);
                              }
                            }}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors whitespace-nowrap"
                          >
                            <X className="w-4 h-4" />
                            Refuser
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          )}

          {/* Gestion des rendez-vous - Visible pour direction/dev/rh */}
          {(currentUser?.grade === 'direction' || currentUser?.grade === 'dev' || currentUser?.grade === 'rh') && (
          <div className="glass-card mb-8 mt-8 !p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold">Gestion des rendez-vous</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ({filteredAppointments.length} rendez-vous{filteredAppointments.length > 1 ? 's' : ''})
                  </p>
                </div>
                {/* Recherche rendez-vous */}
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={appointmentSearchQuery}
                      onChange={(e) => setAppointmentSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom, ID, téléphone..."
                      className="input-modern pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  {appointmentSearchQuery.trim() ? 'Aucun rendez-vous trouvé' : 'Aucun rendez-vous'}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {paginatedAppointments.map((appointment) => {
                    const statusColors = {
                      pending: 'bg-accent/20 text-accent',
                      accepted: 'bg-success/20 text-success',
                      rejected: 'bg-destructive/20 text-destructive',
                      completed: 'bg-primary/20 text-primary',
                      cancelled: 'bg-muted text-muted-foreground',
                    };
                    const statusLabels = {
                      pending: 'En attente',
                      accepted: 'Accepté',
                      rejected: 'Refusé',
                      completed: 'Terminé',
                      cancelled: 'Annulé',
                    };
                    const directionUser = users.find(u => u.id === appointment.directionUserId);
                    return (
                      <div
                        key={appointment.id}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">
                                {appointment.prenom} {appointment.nom}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                                {statusLabels[appointment.status]}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">ID: {appointment.idPersonnel}</p>
                            {directionUser && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {directionUser.grade === 'rh' 
                                  ? `${directionUser.prenom || ''} ${directionUser.nom || ''}`.trim() + ' - RH'
                                  : `Direction: ${directionUser.prenom} ${directionUser.nom}`
                                }
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mb-1">
                              Tél: {appointment.telephone}
                            </p>
                            <p className="text-xs text-muted-foreground mb-1">
                              {new Date(appointment.dateTime).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{appointment.reason}</p>
                          </div>

                          <div className="flex gap-2 shrink-0 lg:flex-row flex-col sm:flex-row">
                            <button
                              onClick={() => {
                                setAppointmentToView(appointment);
                                setShowAppointmentDetailDialog(true);
                              }}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {appointment.status === 'pending' && (
                              <>
                                <button
                                  onClick={async () => {
                                    if (currentUser) {
                                      await updateAppointmentStatus(appointment.id, 'accepted', currentUser.id);
                                    }
                                  }}
                                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-success/10 text-success hover:bg-success/20 transition-colors whitespace-nowrap"
                                >
                                  <Check className="w-4 h-4" />
                                  Accepter
                                </button>
                                <button
                                  onClick={async () => {
                                    if (currentUser) {
                                      await updateAppointmentStatus(appointment.id, 'rejected', currentUser.id);
                                    }
                                  }}
                                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors whitespace-nowrap"
                                >
                                  <X className="w-4 h-4" />
                                  Refuser
                                </button>
                              </>
                            )}
                            {appointment.status === 'accepted' && (
                              <button
                                onClick={async () => {
                                  if (currentUser) {
                                    await updateAppointmentStatus(appointment.id, 'completed', currentUser.id);
                                  }
                                }}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                              >
                                <Check className="w-4 h-4" />
                                Terminer
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setAppointmentToDelete(appointment);
                                setShowDeleteAppointmentDialog(true);
                              }}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors whitespace-nowrap"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination rendez-vous */}
                {totalAppointmentPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Page {currentAppointmentPage} sur {totalAppointmentPages} ({filteredAppointments.length} rendez-vous{filteredAppointments.length > 1 ? 's' : ''})
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentAppointmentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentAppointmentPage === 1}
                        className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Page précédente"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentAppointmentPage(prev => Math.min(totalAppointmentPages, prev + 1))}
                        disabled={currentAppointmentPage === totalAppointmentPages}
                        className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Page suivante"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          )}

          {/* Gestion des partenaires - Masqué pour RH */}
          {!isRH && (
          <div className="glass-card mb-8 mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Gestion des partenaires</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gérez les partenaires affichés sur le site
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingPartenaire(null);
                  setShowPartenaireForm(true);
                  setPartenaireFormData({ nom: '', logoUrl: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter un partenaire
              </button>
            </div>

            {/* Formulaire ajout/édition partenaire */}
            {showPartenaireForm && (
              <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border">
                <h3 className="font-semibold mb-4">{editingPartenaire ? 'Modifier le partenaire' : 'Nouveau partenaire'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      value={partenaireFormData.nom}
                      onChange={(e) => setPartenaireFormData({ ...partenaireFormData, nom: e.target.value })}
                      className="input-modern"
                      placeholder="Nom de l'entreprise"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">URL du logo *</label>
                    <input
                      type="url"
                      value={partenaireFormData.logoUrl}
                      onChange={(e) => setPartenaireFormData({ ...partenaireFormData, logoUrl: e.target.value })}
                      className="input-modern"
                      placeholder="https://exemple.com/logo.png"
                      required
                    />
                  </div>
                </div>
                {partenaireFormData.logoUrl && (
                  <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border flex items-center justify-center max-w-xs">
                    <img
                      src={partenaireFormData.logoUrl}
                      alt={partenaireFormData.nom || 'Aperçu'}
                      className="max-w-full max-h-24 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (partenaireFormData.nom && partenaireFormData.logoUrl) {
                        if (editingPartenaire) {
                          // Mode édition
                          await updatePartenaire(editingPartenaire.id, {
                            nom: partenaireFormData.nom,
                            logoUrl: partenaireFormData.logoUrl,
                          });
                        } else {
                          // Mode ajout
                          await addPartenaire({
                            nom: partenaireFormData.nom,
                            logoUrl: partenaireFormData.logoUrl,
                          });
                        }
                        setShowPartenaireForm(false);
                        setPartenaireFormData({ nom: '', logoUrl: '' });
                        setEditingPartenaire(null);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!partenaireFormData.nom || !partenaireFormData.logoUrl}
                  >
                    {editingPartenaire ? 'Enregistrer' : 'Ajouter'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPartenaireForm(false);
                      setPartenaireFormData({ nom: '', logoUrl: '' });
                      setEditingPartenaire(null);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des partenaires */}
            {partenaires.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun partenaire enregistré
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {partenaires.map((partenaire) => (
                  <div
                    key={partenaire.id}
                    className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col items-center justify-center aspect-square"
                  >
                    {partenaire.logoUrl ? (
                      <img
                        src={partenaire.logoUrl}
                        alt={partenaire.nom}
                        className="max-w-full max-h-24 object-contain mb-3"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-muted-foreground mb-3" />
                    )}
                    <p className="text-sm font-medium text-center mb-3">{partenaire.nom}</p>
                    <div className="flex items-center gap-1 w-full justify-center">
                      <button
                        onClick={() => {
                          setEditingPartenaire(partenaire);
                          setPartenaireFormData({
                            nom: partenaire.nom,
                            logoUrl: partenaire.logoUrl,
                          });
                          setShowPartenaireForm(true);
                        }}
                        className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap flex-shrink"
                      >
                        <Edit className="w-3 h-3 flex-shrink-0" />
                        <span className="hidden sm:inline">Modifier</span>
                      </button>
                      <button
                        onClick={() => {
                          setPartenaireToDelete(partenaire);
                          setShowDeletePartenaireDialog(true);
                        }}
                        className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors whitespace-nowrap flex-shrink"
                      >
                        <Trash2 className="w-3 h-3 flex-shrink-0" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Modal de confirmation de suppression de rendez-vous */}
          <Dialog open={showDeleteAppointmentDialog} onOpenChange={setShowDeleteAppointmentDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader className="text-center sm:text-left">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <DialogTitle className="text-lg sm:text-xl font-bold mb-2">
                      Supprimer le rendez-vous
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base break-words">
                      Êtes-vous sûr de vouloir supprimer le rendez-vous de{' '}
                      <span className="font-semibold text-foreground">
                        {appointmentToDelete?.prenom} {appointmentToDelete?.nom}
                      </span>
                      ?
                    </DialogDescription>
                  </div>
                </div>
                <div className="mt-4 p-3 sm:p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-xs sm:text-sm text-destructive font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="break-words">Cette action est irréversible et supprimera définitivement le rendez-vous.</span>
                  </p>
                </div>
              </DialogHeader>
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setShowDeleteAppointmentDialog(false);
                    setAppointmentToDelete(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (appointmentToDelete) {
                      try {
                        await deleteAppointment(appointmentToDelete.id);
                        setShowDeleteAppointmentDialog(false);
                        setAppointmentToDelete(null);
                      } catch (error) {
                        console.error('Erreur lors de la suppression du rendez-vous:', error);
                      }
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm order-1 sm:order-2"
                >
                  Supprimer définitivement
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de confirmation de suppression de session */}
          <Dialog open={showDeleteSessionDialog} onOpenChange={setShowDeleteSessionDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader className="text-center sm:text-left">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <DialogTitle className="text-lg sm:text-xl font-bold mb-2">
                      Supprimer la session
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base break-words">
                      Êtes-vous sûr de vouloir supprimer la session{' '}
                      <span className="font-semibold text-foreground">
                        {sessionToDelete && sessions.find(s => s.id === sessionToDelete)?.name}
                      </span>
                      ?
                    </DialogDescription>
                  </div>
                </div>
                <div className="mt-4 p-3 sm:p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-xs sm:text-sm text-destructive font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="break-words">Cette action est irréversible et supprimera définitivement la session. Les candidatures associées ne seront pas supprimées.</span>
                  </p>
                </div>
                {deleteSessionError && (
                  <div className="mt-4 p-3 sm:p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-xs sm:text-sm text-destructive font-medium flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="break-words">{deleteSessionError}</span>
                    </p>
                  </div>
                )}
              </DialogHeader>
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setShowDeleteSessionDialog(false);
                    setSessionToDelete(null);
                    setDeleteSessionError(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (sessionToDelete) {
                      setDeleteSessionError(null);
                      try {
                        await deleteSession(sessionToDelete);
                        setShowDeleteSessionDialog(false);
                        setSessionToDelete(null);
                        // Si la session supprimée était sélectionnée, réinitialiser la sélection
                        if (selectedSessionId === sessionToDelete) {
                          setSelectedSessionId(null);
                        }
                      } catch (error: any) {
                        console.error('Erreur lors de la suppression de la session:', error);
                        setDeleteSessionError(
                          error?.message || 'Erreur lors de la suppression. Vérifiez que la politique DELETE est configurée dans Supabase.'
                        );
                      }
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm order-1 sm:order-2"
                >
                  Supprimer définitivement
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de confirmation de suppression */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader className="text-center sm:text-left">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <DialogTitle className="text-lg sm:text-xl font-bold mb-2">
                      Supprimer l'utilisateur
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base break-words">
                      Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
                      <span className="font-semibold text-foreground">
                        {userToDelete?.prenom && userToDelete?.nom
                          ? `${userToDelete.prenom} ${userToDelete.nom}`
                          : userToDelete?.prenom || userToDelete?.nom || userToDelete?.idPersonnel}
                      </span>
                      ?
                    </DialogDescription>
                  </div>
                </div>
                <div className="mt-4 p-3 sm:p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-xs sm:text-sm text-destructive font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="break-words">Cette action est irréversible et supprimera définitivement toutes les données de l'utilisateur.</span>
                  </p>
                </div>
              </DialogHeader>
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setUserToDelete(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors order-2 sm:order-1"
                >
                  Annuler
                </button>
                        <button
                          onClick={async () => {
                            if (userToDelete) {
                              const success = await deleteUser(userToDelete.id);
                              if (success) {
                                setShowDeleteDialog(false);
                                setUserToDelete(null);
                              } else {
                                // Erreur lors de la suppression - peut-être afficher un message
                                console.error('Erreur lors de la suppression de l\'utilisateur');
                              }
                            }
                          }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm order-1 sm:order-2"
                >
                  Supprimer définitivement
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de confirmation de suppression de candidature */}
          <Dialog open={showDeleteAppDialog} onOpenChange={setShowDeleteAppDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader className="text-center sm:text-left">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <DialogTitle className="text-lg sm:text-xl font-bold mb-2">
                      Supprimer la candidature
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base break-words">
                      Êtes-vous sûr de vouloir supprimer la candidature de{' '}
                      <span className="font-semibold text-foreground">
                        {appToDelete?.prenomRP} {appToDelete?.nomRP}
                      </span>
                      ?
                    </DialogDescription>
                  </div>
                </div>
                <div className="mt-4 p-3 sm:p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-xs sm:text-sm text-destructive font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="break-words">Cette action est irréversible et supprimera définitivement la candidature.</span>
                  </p>
                </div>
              </DialogHeader>
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setShowDeleteAppDialog(false);
                    setAppToDelete(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (appToDelete) {
                      try {
                        await deleteApplication(appToDelete.id);
                        setShowDeleteAppDialog(false);
                        setAppToDelete(null);
                      } catch (error) {
                        // Erreur lors de la suppression - peut-être afficher un message
                        console.error('Erreur lors de la suppression de la candidature:', error);
                      }
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm order-1 sm:order-2"
                >
                  Supprimer définitivement
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de confirmation de suppression de membre d'équipe */}
          <Dialog open={showDeleteTeamDialog} onOpenChange={setShowDeleteTeamDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader className="text-center sm:text-left">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <DialogTitle className="text-lg sm:text-xl font-bold mb-2">
                      Retirer le membre
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base break-words">
                      Êtes-vous sûr de vouloir retirer{' '}
                      <span className="font-semibold text-foreground">
                        {teamMemberToDelete?.prenom} {teamMemberToDelete?.nom}
                      </span>
                      {' '}de l'équipe de direction ?
                    </DialogDescription>
                  </div>
                </div>
                <div className="mt-4 p-3 sm:p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-xs sm:text-sm text-destructive font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="break-words">Cette action est irréversible et retirera définitivement ce membre de l'équipe affichée sur le site.</span>
                  </p>
                </div>
              </DialogHeader>
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setShowDeleteTeamDialog(false);
                    setTeamMemberToDelete(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (teamMemberToDelete) {
                      await removeTeamMember(teamMemberToDelete.id);
                      setShowDeleteTeamDialog(false);
                      setTeamMemberToDelete(null);
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm order-1 sm:order-2"
                >
                  Retirer définitivement
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de détail de candidature */}
          <Dialog open={showAppDetailDialog} onOpenChange={setShowAppDetailDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold mb-4">
                  Détails de la candidature
                </DialogTitle>
              </DialogHeader>
              {appToView && (() => {
                const session = sessions.find(s => s.id === appToView.sessionId);
                return (
                  <div className="space-y-4">
                    {/* Statut */}
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appToView.status === 'pending'
                          ? 'bg-accent/20 text-accent'
                          : appToView.status === 'interview_waiting'
                          ? 'bg-blue-500/20 text-blue-500'
                          : appToView.status === 'accepted'
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {appToView.status === 'pending' && 'En attente'}
                        {appToView.status === 'interview_waiting' && 'En attente d\'entretien'}
                        {appToView.status === 'accepted' && 'Acceptée'}
                        {appToView.status === 'rejected' && 'Refusée'}
                      </span>
                      {session && (
                        <span className="text-sm text-muted-foreground">
                          Session: {session.name}
                        </span>
                      )}
                    </div>

                    {/* Informations personnelles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Prénom
                        </label>
                        <p className="text-base font-medium">{appToView.prenomRP}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Nom
                        </label>
                        <p className="text-base font-medium">{appToView.nomRP}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Identifiant
                        </label>
                        <p className="text-base font-medium">{appToView.idJoueur}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Âge
                        </label>
                        <p className="text-base font-medium">{appToView.age ?? 'Non renseigné'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Téléphone
                        </label>
                        <p className="text-base font-medium">{appToView.telephone ?? 'Non renseigné'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Date de candidature
                        </label>
                        <p className="text-base font-medium">
                          {new Date(appToView.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Motivation */}
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Motivation
                      </label>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-48 overflow-y-auto break-words break-all">
                        <p className="text-sm whitespace-pre-wrap break-all">{appToView.motivation}</p>
                      </div>
                    </div>

                    {/* Expérience */}
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Expérience professionnelle
                      </label>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-48 overflow-y-auto break-words break-all">
                        <p className="text-sm whitespace-pre-wrap break-all">{appToView.experience || 'Non renseignée'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Qualités
                        </label>
                        <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-48 overflow-y-auto break-words break-all">
                          <p className="text-sm whitespace-pre-wrap break-all">{appToView.qualites || 'Non renseignées'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Défauts
                        </label>
                        <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-48 overflow-y-auto break-words break-all">
                          <p className="text-sm whitespace-pre-wrap break-all">{appToView.defauts || 'Non renseignés'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Vos disponibilités (uniquement celles où vous serez susceptibles de travailler)
                      </label>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-48 overflow-y-auto break-words break-all">
                        <p className="text-sm whitespace-pre-wrap break-all">{appToView.disponibilites || 'Non renseignées'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Pourquoi le LS plutôt qu’un autre ?
                      </label>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-48 overflow-y-auto break-words break-all">
                        <p className="text-sm whitespace-pre-wrap break-all">{appToView.whyLS || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              <DialogFooter className="flex gap-2">
                {appToView?.status === 'pending' ? (
                  <>
                    <button
                      onClick={async () => {
                        if (appToView) {
                          await updateApplicationStatus(appToView.id, 'interview_waiting');
                          setShowAppDetailDialog(false);
                          setAppToView(null);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Mise en attente
                    </button>
                    <button
                      onClick={async () => {
                        if (appToView) {
                          await updateApplicationStatus(appToView.id, 'rejected');
                          setShowAppDetailDialog(false);
                          setAppToView(null);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Refuser
                    </button>
                    <button
                      onClick={() => {
                        setShowAppDetailDialog(false);
                        setAppToView(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Fermer
                    </button>
                  </>
                ) : appToView?.status === 'interview_waiting' ? (
                  <>
                    <button
                      onClick={async () => {
                        if (appToView) {
                          await updateApplicationStatus(appToView.id, 'accepted');
                          setShowAppDetailDialog(false);
                          setAppToView(null);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Accepter
                    </button>
                    <button
                      onClick={async () => {
                        if (appToView) {
                          await updateApplicationStatus(appToView.id, 'rejected');
                          setShowAppDetailDialog(false);
                          setAppToView(null);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Refuser
                    </button>
                    <button
                      onClick={() => {
                        setShowAppDetailDialog(false);
                        setAppToView(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Fermer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowAppDetailDialog(false);
                      setAppToView(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Fermer
                  </button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de détail de rendez-vous */}
          <Dialog open={showAppointmentDetailDialog} onOpenChange={setShowAppointmentDetailDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold mb-4">
                  Détails du rendez-vous
                </DialogTitle>
              </DialogHeader>
              {appointmentToView && (() => {
                const directionUser = users.find(u => u.id === appointmentToView.directionUserId);
                const statusColors = {
                  pending: 'bg-accent/20 text-accent',
                  accepted: 'bg-success/20 text-success',
                  rejected: 'bg-destructive/20 text-destructive',
                  completed: 'bg-primary/20 text-primary',
                  cancelled: 'bg-muted text-muted-foreground',
                };
                const statusLabels = {
                  pending: 'En attente',
                  accepted: 'Accepté',
                  rejected: 'Refusé',
                  completed: 'Terminé',
                  cancelled: 'Annulé',
                };
                return (
                  <div className="space-y-4">
                    {/* Statut */}
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[appointmentToView.status]}`}>
                        {statusLabels[appointmentToView.status]}
                      </span>
                    </div>

                    {/* Informations personnelles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Prénom
                        </label>
                        <p className="text-base font-medium">{appointmentToView.prenom}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Nom
                        </label>
                        <p className="text-base font-medium">{appointmentToView.nom}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Identifiant
                        </label>
                        <p className="text-base font-medium">{appointmentToView.idPersonnel}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          Téléphone
                        </label>
                        <p className="text-base font-medium">{appointmentToView.telephone}</p>
                      </div>
                      {directionUser && (
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Membre de la direction
                          </label>
                          <p className="text-base font-medium">
                            {directionUser.prenom} {directionUser.nom} ({directionUser.idPersonnel})
                          </p>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Date et heure du rendez-vous
                        </label>
                        <p className="text-base font-medium">
                          {new Date(appointmentToView.dateTime).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Date de demande
                        </label>
                        <p className="text-base font-medium">
                          {new Date(appointmentToView.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Raison */}
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Raison du rendez-vous
                      </label>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-48 overflow-y-auto break-words break-all">
                        <p className="text-sm whitespace-pre-wrap break-all">{appointmentToView.reason}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              <DialogFooter className="flex gap-2">
                {appointmentToView?.status === 'pending' ? (
                  <>
                    <button
                      onClick={async () => {
                        if (currentUser && appointmentToView) {
                          await updateAppointmentStatus(appointmentToView.id, 'accepted', currentUser.id);
                          setShowAppointmentDetailDialog(false);
                          setAppointmentToView(null);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Accepter
                    </button>
                    <button
                      onClick={async () => {
                        if (currentUser && appointmentToView) {
                          await updateAppointmentStatus(appointmentToView.id, 'rejected', currentUser.id);
                          setShowAppointmentDetailDialog(false);
                          setAppointmentToView(null);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Refuser
                    </button>
                    <button
                      onClick={() => {
                        setShowAppointmentDetailDialog(false);
                        setAppointmentToView(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Fermer
                    </button>
                  </>
                ) : appointmentToView?.status === 'accepted' ? (
                  <>
                    <button
                      onClick={async () => {
                        if (currentUser && appointmentToView) {
                          await updateAppointmentStatus(appointmentToView.id, 'completed', currentUser.id);
                          setShowAppointmentDetailDialog(false);
                          setAppointmentToView(null);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Terminer
                    </button>
                    <button
                      onClick={() => {
                        setShowAppointmentDetailDialog(false);
                        setAppointmentToView(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Fermer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowAppointmentDetailDialog(false);
                      setAppointmentToView(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Fermer
                  </button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de confirmation de suppression de partenaire */}
          <Dialog open={showDeletePartenaireDialog} onOpenChange={setShowDeletePartenaireDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader className="text-center sm:text-left">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <DialogTitle className="text-lg sm:text-xl font-bold mb-2">
                      Supprimer le partenaire
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base break-words">
                      Êtes-vous sûr de vouloir supprimer le partenaire{' '}
                      <span className="font-semibold text-foreground">
                        {partenaireToDelete?.nom}
                      </span>
                      ?
                    </DialogDescription>
                  </div>
                </div>
                <div className="mt-4 p-3 sm:p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-xs sm:text-sm text-destructive font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="break-words">Cette action est irréversible et supprimera définitivement le partenaire.</span>
                  </p>
                </div>
              </DialogHeader>
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setShowDeletePartenaireDialog(false);
                    setPartenaireToDelete(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (partenaireToDelete) {
                      try {
                        await deletePartenaire(partenaireToDelete.id);
                        setShowDeletePartenaireDialog(false);
                        setPartenaireToDelete(null);
                      } catch (error) {
                        console.error('Erreur lors de la suppression du partenaire:', error);
                      }
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm order-1 sm:order-2"
                >
                  Supprimer définitivement
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de détail d'avis client */}
          <Dialog open={showReviewDetailDialog} onOpenChange={setShowReviewDetailDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold mb-4">
                  Détails de l'avis client
                </DialogTitle>
              </DialogHeader>
              {reviewToView && (
                <div className="space-y-4">
                  {/* Statut */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reviewToView.status === 'pending'
                        ? 'bg-accent/20 text-accent'
                        : reviewToView.status === 'approved'
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {reviewToView.status === 'pending' && 'En attente'}
                      {reviewToView.status === 'approved' && 'Approuvé'}
                      {reviewToView.status === 'rejected' && 'Refusé'}
                    </span>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Note
                    </label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < reviewToView.rating
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        ({reviewToView.rating}/5)
                      </span>
                    </div>
                  </div>

                  {/* Informations personnelles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Prénom
                      </label>
                      <p className="text-base font-medium">{reviewToView.prenom}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Nom
                      </label>
                      <p className="text-base font-medium">{reviewToView.nom}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Identifiant
                      </label>
                      <p className="text-base font-medium">{reviewToView.idPersonnel}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Date de l'avis
                      </label>
                      <p className="text-base font-medium">
                        {new Date(reviewToView.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Commentaire */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Commentaire
                    </label>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-48 overflow-y-auto break-words break-all">
                      <p className="text-sm whitespace-pre-wrap break-all">{reviewToView.comment}</p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="flex gap-2">
                {reviewToView?.status === 'pending' ? (
                  <>
                    <button
                      onClick={async () => {
                        if (currentUser && reviewToView) {
                          await updateReviewStatus(reviewToView.id, 'approved', currentUser.id);
                          setShowReviewDetailDialog(false);
                          setReviewToView(null);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Accepter
                    </button>
                    <button
                      onClick={async () => {
                        if (currentUser && reviewToView) {
                          await updateReviewStatus(reviewToView.id, 'rejected', currentUser.id);
                          setShowReviewDetailDialog(false);
                          setReviewToView(null);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Refuser
                    </button>
                    <button
                      onClick={() => {
                        setShowReviewDetailDialog(false);
                        setReviewToView(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Fermer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowReviewDetailDialog(false);
                      setReviewToView(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Fermer
                  </button>
                )}
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
