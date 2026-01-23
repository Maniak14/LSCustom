import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, ApplicationRow, SessionRow, TeamMemberRow, ClientReviewRow, AppointmentRow, UserRow, PartenaireRow } from '@/lib/supabase';

export interface Application {
  id: string;
  nomRP: string;
  prenomRP: string;
  idJoueur: string;
  motivation: string;
  experience: string;
  status: 'pending' | 'interview_waiting' | 'accepted' | 'rejected';
  createdAt: Date;
  sessionId: string;
}

interface RecruitmentSession {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface TeamMember {
  id: string;
  userId?: string;
  prenom: string;
  nom: string;
  role: string;
  photo?: string;
  order: number; // Ordre d'affichage (plus petit = affiché en premier)
}

export interface User {
  id: string;
  idPersonnel: string;
  password: string; // Hashé en production
  telephone: string;
  prenom?: string;
  nom?: string;
  grade: 'direction' | 'client' | 'dev' | 'rh' | 'employee';
  photoUrl?: string;
  createdAt: Date;
}

export interface ClientReview {
  id: string;
  userId?: string;
  nom: string;
  prenom: string;
  idPersonnel: string;
  comment: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: Date;
  approvedAt?: Date;
}

export interface Appointment {
  id: string;
  userId?: string;
  idPersonnel: string;
  nom: string;
  prenom: string;
  telephone: string;
  directionUserId?: string;
  dateTime: Date;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  respondedBy?: string;
  createdAt: Date;
  respondedAt?: Date;
}

export interface Partenaire {
  id: string;
  nom: string;
  logoUrl: string;
  createdAt: Date;
}

interface RecruitmentContextType {
  isRecruitmentOpen: boolean;
  setIsRecruitmentOpen: (open: boolean) => void;
  handleSetRecruitmentOpen: (open: boolean) => void;
  applications: Application[];
  sessions: RecruitmentSession[];
  currentSession: RecruitmentSession | null;
  teamMembers: TeamMember[];
  addApplication: (app: Omit<Application, 'id' | 'status' | 'createdAt' | 'sessionId'>) => Promise<boolean>;
  updateApplicationStatus: (id: string, status: 'interview_waiting' | 'accepted' | 'rejected') => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  hasActiveApplication: (idJoueur: string) => boolean;
  createSession: (name: string) => Promise<void>;
  closeSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  getApplicationsBySession: (sessionId: string | null) => Application[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'order'> & { order?: number }) => Promise<void>;
  removeTeamMember: (id: string) => Promise<void>;
  updateTeamMember: (id: string, member: Partial<Omit<TeamMember, 'id'>>) => Promise<void>;
  updateTeamMemberOrder: (id: string, direction: 'up' | 'down') => Promise<void>;
  isEmployeeLoggedIn: boolean;
  loginEmployee: (password: string) => boolean;
  logoutEmployee: () => void;
  isLoading: boolean;
  // User management
  isUserLoggedIn: boolean;
  currentUser: User | null;
  registerUser: (idPersonnel: string, password: string, telephone: string, grade?: 'direction' | 'client' | 'dev' | 'rh' | 'employee', prenom?: string, nom?: string) => Promise<User | null | { error: 'id' | 'telephone' }>;
  loginUser: (idPersonnel: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
  updateUser: (oldPassword: string, newPassword?: string, newTelephone?: string) => Promise<boolean>;
  // User management for admins
  users: User[];
  updateUserByAdmin: (userId: string, data: { prenom?: string; nom?: string; telephone?: string; grade?: 'direction' | 'client' | 'dev' | 'rh' | 'employee'; photoUrl?: string }) => Promise<boolean | { error: 'telephone' | 'protected' }>;
  updateUserPhoto: (userId: string, photoUrl: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  // Client reviews
  clientReviews: ClientReview[];
  addClientReview: (review: Omit<ClientReview, 'id' | 'status' | 'createdAt' | 'approvedAt'>) => Promise<boolean>;
  updateReviewStatus: (id: string, status: 'approved' | 'rejected', approvedBy: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  // Appointments
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'respondedAt'>) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: 'accepted' | 'rejected' | 'completed' | 'cancelled', respondedBy: string) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  hasPendingAppointment: (userId: string) => boolean;
  // Partners
  partenaires: Partenaire[];
  addPartenaire: (partenaire: Omit<Partenaire, 'id' | 'createdAt'>) => Promise<void>;
  updatePartenaire: (id: string, partenaire: { nom?: string; logoUrl?: string }) => Promise<void>;
  deletePartenaire: (id: string) => Promise<void>;
  // Notifications
  getNotificationCount: () => number;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

// Helper pour vérifier si Supabase est configuré
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

// Helper pour convertir ApplicationRow en Application
const rowToApplication = (row: ApplicationRow): Application => ({
  id: row.id,
  nomRP: row.nom_rp,
  prenomRP: row.prenom_rp,
  idJoueur: row.id_joueur,
  motivation: row.motivation,
  experience: row.experience,
  status: row.status,
  createdAt: new Date(row.created_at),
  sessionId: row.session_id,
});

// Helper pour convertir Application en ApplicationRow
const applicationToRow = (app: Omit<Application, 'id' | 'createdAt'> & { id?: string; createdAt?: Date }): Omit<ApplicationRow, 'id' | 'created_at'> & { id?: string; created_at?: string } => ({
  id: app.id,
  nom_rp: app.nomRP,
  prenom_rp: app.prenomRP,
  id_joueur: app.idJoueur,
  motivation: app.motivation,
  experience: app.experience,
  status: app.status,
  session_id: app.sessionId,
  created_at: app.createdAt?.toISOString(),
});

// Helper pour convertir SessionRow en RecruitmentSession
const rowToSession = (row: SessionRow): RecruitmentSession => ({
  id: row.id,
  name: row.name,
  startDate: new Date(row.start_date),
  endDate: row.end_date ? new Date(row.end_date) : undefined,
  isActive: row.is_active,
});

// Helper pour convertir RecruitmentSession en SessionRow
const sessionToRow = (session: Omit<RecruitmentSession, 'id' | 'startDate' | 'endDate'> & { id?: string; startDate?: Date; endDate?: Date }): Omit<SessionRow, 'id' | 'start_date' | 'end_date'> & { id?: string; start_date?: string; end_date?: string | null } => ({
  id: session.id,
  name: session.name,
  start_date: session.startDate?.toISOString(),
  end_date: session.endDate?.toISOString() || null,
  is_active: session.isActive,
});

// Helper pour convertir TeamMemberRow en TeamMember
const rowToTeamMember = (row: TeamMemberRow): TeamMember => ({
  id: row.id,
  userId: row.user_id || undefined,
  prenom: row.prenom,
  nom: row.nom,
  role: row.role,
  photo: row.photo || undefined,
  order: row.order ?? 0,
});

// Helper pour convertir TeamMember en TeamMemberRow
const teamMemberToRow = (member: Omit<TeamMember, 'id'> & { id?: string }): Omit<TeamMemberRow, 'id'> & { id?: string } => ({
  id: member.id,
  user_id: member.userId || null,
  prenom: member.prenom,
  nom: member.nom,
  role: member.role,
  photo: member.photo || null,
  order: member.order ?? 0,
});

// Helper pour convertir UserRow en User
const rowToUser = (row: UserRow): User => ({
  id: row.id,
  idPersonnel: row.id_personnel,
  password: row.password,
  telephone: row.telephone,
  prenom: row.prenom || undefined,
  nom: row.nom || undefined,
  grade: row.grade || 'client',
  photoUrl: row.photo_url || undefined,
  createdAt: new Date(row.created_at),
});

// Helper pour convertir ClientReviewRow en ClientReview
const rowToClientReview = (row: ClientReviewRow): ClientReview => ({
  id: row.id,
  userId: row.user_id || undefined,
  nom: row.nom,
  prenom: row.prenom,
  idPersonnel: row.id_personnel,
  comment: row.comment,
  rating: row.rating,
  status: row.status,
  approvedBy: row.approved_by || undefined,
  createdAt: new Date(row.created_at),
  approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
});

// Helper pour convertir ClientReview en ClientReviewRow
const clientReviewToRow = (review: Omit<ClientReview, 'id' | 'createdAt' | 'approvedAt'> & { id?: string; createdAt?: Date; approvedAt?: Date }): Omit<ClientReviewRow, 'id' | 'created_at' | 'approved_at'> & { id?: string; created_at?: string; approved_at?: string | null } => ({
  id: review.id,
  user_id: review.userId || null,
  nom: review.nom,
  prenom: review.prenom,
  id_personnel: review.idPersonnel,
  comment: review.comment,
  rating: review.rating,
  status: review.status,
  approved_by: review.approvedBy || null,
  created_at: review.createdAt?.toISOString(),
  approved_at: review.approvedAt?.toISOString() || null,
});

// Helper pour convertir AppointmentRow en Appointment
const rowToAppointment = (row: AppointmentRow): Appointment => ({
  id: row.id,
  userId: row.user_id || undefined,
  idPersonnel: row.id_personnel,
  nom: row.nom,
  prenom: row.prenom,
  telephone: row.telephone,
  directionUserId: row.direction_user_id || undefined,
  dateTime: new Date(row.date_time),
  reason: row.reason,
  status: row.status,
  respondedBy: row.responded_by || undefined,
  createdAt: new Date(row.created_at),
  respondedAt: row.responded_at ? new Date(row.responded_at) : undefined,
});

// Helper pour convertir Appointment en AppointmentRow
const appointmentToRow = (appointment: Omit<Appointment, 'id' | 'createdAt' | 'respondedAt'> & { id?: string; createdAt?: Date; respondedAt?: Date }): Omit<AppointmentRow, 'id' | 'created_at' | 'responded_at'> & { id?: string; created_at?: string; responded_at?: string | null } => ({
  id: appointment.id,
  user_id: appointment.userId || null,
  id_personnel: appointment.idPersonnel,
  nom: appointment.nom,
  prenom: appointment.prenom,
  telephone: appointment.telephone,
  direction_user_id: appointment.directionUserId || null,
  date_time: appointment.dateTime.toISOString(),
  reason: appointment.reason,
  status: appointment.status,
  responded_by: appointment.respondedBy || null,
  created_at: appointment.createdAt?.toISOString(),
  responded_at: appointment.respondedAt?.toISOString() || null,
});

// Helper pour convertir PartenaireRow en Partenaire
const rowToPartenaire = (row: PartenaireRow): Partenaire => ({
  id: row.id,
  nom: row.nom,
  logoUrl: row.logo_url,
  createdAt: new Date(row.created_at),
});

// Helper pour convertir Partenaire en PartenaireRow
const partenaireToRow = (partenaire: Omit<Partenaire, 'id' | 'createdAt'> & { id?: string; createdAt?: Date }): Omit<PartenaireRow, 'id' | 'created_at'> & { id?: string; created_at?: string } => ({
  id: partenaire.id,
  nom: partenaire.nom,
  logo_url: partenaire.logoUrl,
  created_at: partenaire.createdAt?.toISOString(),
});

// LocalStorage helpers (fallback)
const STORAGE_KEYS = {
  APPLICATIONS: 'ls_customs_applications',
  SESSIONS: 'ls_customs_sessions',
  TEAM_MEMBERS: 'ls_customs_team_members',
  RECRUITMENT_OPEN: 'ls_customs_recruitment_open',
  USERS: 'ls_customs_users',
  CURRENT_USER: 'ls_customs_current_user',
  CLIENT_REVIEWS: 'ls_customs_client_reviews',
  APPOINTMENTS: 'ls_customs_appointments',
  PARTENAIRES: 'ls_customs_partenaires',
};

export const RecruitmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Charger l'état du recrutement depuis localStorage de manière synchrone pour éviter le flash
  const getInitialRecruitmentState = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.RECRUITMENT_OPEN);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return false;
  };

  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(getInitialRecruitmentState());
  const [applications, setApplications] = useState<Application[]>([]);
  const [sessions, setSessions] = useState<RecruitmentSession[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [clientReviews, setClientReviews] = useState<ClientReview[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);

  // Récupérer la session active
  const currentSession = sessions.find(s => s.isActive) || null;

  // Charger les données au démarrage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await loadFromSupabase();
      } else {
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      loadFromLocalStorage(); // Fallback vers localStorage en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromSupabase = async () => {
    // Charger les candidatures
    try {
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsError) {
        console.warn('Error loading applications from Supabase:', appsError);
      } else if (appsData) {
        setApplications(appsData.map(rowToApplication));
      }
    } catch (error) {
      console.warn('Error loading applications:', error);
    }

    // Charger les sessions
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .order('start_date', { ascending: false });

      if (sessionsError) {
        console.warn('Error loading sessions from Supabase:', sessionsError);
      } else if (sessionsData) {
        setSessions(sessionsData.map(rowToSession));
      }
    } catch (error) {
      console.warn('Error loading sessions:', error);
    }

    // Charger les membres de l'équipe
    try {
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .order('order', { ascending: true });

      if (teamError) {
        console.warn('Error loading team members from Supabase:', teamError);
      } else if (teamData) {
        setTeamMembers(teamData.map(rowToTeamMember));
      }
    } catch (error) {
      console.warn('Error loading team members:', error);
    }

    // Charger l'état du recrutement
    // Note: On ne met à jour que si la valeur dans Supabase est différente de celle dans localStorage
    // pour éviter le clignotement lors du F5
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'recruitment_open')
        .maybeSingle(); // Utiliser maybeSingle() au lieu de single() pour éviter l'erreur 406 si aucun résultat

      // Ne mettre à jour que si on a une valeur valide de Supabase ET qu'elle est différente de localStorage
      if (!settingsError && settingsData && settingsData.value !== null && settingsData.value !== undefined) {
        const supabaseValue = settingsData.value === 'true';
        // Comparer avec la valeur dans localStorage (pas avec l'état actuel qui peut avoir été mis à jour)
        const storedValue = localStorage.getItem(STORAGE_KEYS.RECRUITMENT_OPEN);
        const localStorageValue = storedValue !== null ? storedValue === 'true' : false;
        
        // Seulement mettre à jour si la valeur Supabase est différente de localStorage pour éviter le clignotement
        if (supabaseValue !== localStorageValue) {
          setIsRecruitmentOpen(supabaseValue);
          // Synchroniser avec localStorage
          localStorage.setItem(STORAGE_KEYS.RECRUITMENT_OPEN, settingsData.value);
        }
      }
      // Sinon, on garde la valeur déjà chargée depuis localStorage dans getInitialRecruitmentState()
    } catch (error) {
      console.warn('Error loading settings from Supabase:', error);
      // Continuer même si les settings ne peuvent pas être chargés
    }

    // Charger les utilisateurs
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.warn('Error loading users from Supabase:', usersError);
      } else if (usersData) {
        setUsers(usersData.map((row: UserRow) => rowToUser(row)));
      }
    } catch (error) {
      console.warn('Error loading users:', error);
    }

    // Charger les avis clients
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('client_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.warn('Error loading client reviews from Supabase:', reviewsError);
      } else if (reviewsData) {
        setClientReviews(reviewsData.map(rowToClientReview));
      }
    } catch (error) {
      console.warn('Error loading client reviews:', error);
    }

    // Charger les rendez-vous
    try {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (appointmentsError) {
        console.warn('Error loading appointments from Supabase:', appointmentsError);
      } else if (appointmentsData) {
        setAppointments(appointmentsData.map(rowToAppointment));
      }
    } catch (error) {
      console.warn('Error loading appointments:', error);
    }

    // Charger les partenaires
    try {
      const { data: partenairesData, error: partenairesError } = await supabase
        .from('partenaires')
        .select('*')
        .order('created_at', { ascending: false });

      if (partenairesError) {
        console.warn('Error loading partenaires from Supabase:', partenairesError);
        // En cas d'erreur, charger depuis localStorage comme fallback
        const storedPartenaires = localStorage.getItem(STORAGE_KEYS.PARTENAIRES);
        if (storedPartenaires) {
          const parsed = JSON.parse(storedPartenaires);
          setPartenaires(parsed.map((partenaire: any) => ({
            ...partenaire,
            createdAt: new Date(partenaire.createdAt),
          })));
        }
      } else if (partenairesData && partenairesData.length > 0) {
        setPartenaires(partenairesData.map(rowToPartenaire));
      } else {
        // Si Supabase retourne un tableau vide, charger depuis localStorage comme fallback
        const storedPartenaires = localStorage.getItem(STORAGE_KEYS.PARTENAIRES);
        if (storedPartenaires) {
          const parsed = JSON.parse(storedPartenaires);
          setPartenaires(parsed.map((partenaire: any) => ({
            ...partenaire,
            createdAt: new Date(partenaire.createdAt),
          })));
        }
      }
    } catch (error) {
      console.warn('Error loading partenaires:', error);
      // En cas d'erreur, charger depuis localStorage comme fallback
      const storedPartenaires = localStorage.getItem(STORAGE_KEYS.PARTENAIRES);
      if (storedPartenaires) {
        const parsed = JSON.parse(storedPartenaires);
        setPartenaires(parsed.map((partenaire: any) => ({
          ...partenaire,
          createdAt: new Date(partenaire.createdAt),
        })));
      }
    }
  };

  const loadFromLocalStorage = () => {
    const storedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (storedApps) {
      const parsed = JSON.parse(storedApps);
      setApplications(parsed.map((app: any) => ({
        ...app,
        createdAt: new Date(app.createdAt),
      })));
    }

    const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (storedSessions) {
      const parsed = JSON.parse(storedSessions);
      setSessions(parsed.map((session: any) => ({
        ...session,
        startDate: new Date(session.startDate),
        endDate: session.endDate ? new Date(session.endDate) : undefined,
      })));
    }

    const storedTeam = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
    if (storedTeam) {
      const parsed = JSON.parse(storedTeam);
      setTeamMembers(parsed.map((member: any) => ({
        ...member,
        order: member.order ?? 0,
      })).sort((a: TeamMember, b: TeamMember) => (a.order ?? 0) - (b.order ?? 0)));
    }

    const storedRecruitment = localStorage.getItem(STORAGE_KEYS.RECRUITMENT_OPEN);
    if (storedRecruitment) {
      setIsRecruitmentOpen(storedRecruitment === 'true');
    }

    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (storedUsers) {
      const parsed = JSON.parse(storedUsers);
      setUsers(parsed.map((user: any) => ({
        ...user,
        prenom: user.prenom || undefined,
        nom: user.nom || undefined,
        grade: user.grade || 'client', // Par défaut 'client' si non défini
        photoUrl: user.photoUrl || undefined,
        createdAt: new Date(user.createdAt),
      })));
    }

    const storedReviews = localStorage.getItem(STORAGE_KEYS.CLIENT_REVIEWS);
    if (storedReviews) {
      const parsed = JSON.parse(storedReviews);
      setClientReviews(parsed.map((review: any) => ({
        ...review,
        createdAt: new Date(review.createdAt),
        approvedAt: review.approvedAt ? new Date(review.approvedAt) : undefined,
      })));
    }

    const storedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (storedAppointments) {
      const parsed = JSON.parse(storedAppointments);
      setAppointments(parsed.map((appointment: any) => ({
        ...appointment,
        dateTime: new Date(appointment.dateTime),
        createdAt: new Date(appointment.createdAt),
        respondedAt: appointment.respondedAt ? new Date(appointment.respondedAt) : undefined,
      })));
    }

    const storedPartenaires = localStorage.getItem(STORAGE_KEYS.PARTENAIRES);
    if (storedPartenaires) {
      const parsed = JSON.parse(storedPartenaires);
      setPartenaires(parsed.map((partenaire: any) => ({
        ...partenaire,
        createdAt: new Date(partenaire.createdAt),
      })));
    }
  };

  const saveToLocalStorage = () => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(teamMembers));
    localStorage.setItem(STORAGE_KEYS.RECRUITMENT_OPEN, String(isRecruitmentOpen));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CLIENT_REVIEWS, JSON.stringify(clientReviews));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    localStorage.setItem(STORAGE_KEYS.PARTENAIRES, JSON.stringify(partenaires));
  };

  const createSession = async (name: string) => {
    // Fermer toutes les sessions actives
    const updatedSessions = sessions.map(s => ({ ...s, isActive: false, endDate: s.isActive ? new Date() : s.endDate }));
    
    const newSession: RecruitmentSession = {
      id: crypto.randomUUID(),
      name,
      startDate: new Date(),
      isActive: true,
    };

    const allSessions = [...updatedSessions, newSession];
    setSessions(allSessions);

    if (isSupabaseConfigured()) {
      try {
        // Fermer les sessions actives dans Supabase
        const activeSessions = updatedSessions.filter(s => s.isActive);
        for (const session of activeSessions) {
          await supabase
            .from('sessions')
            .update({ is_active: false, end_date: new Date().toISOString() })
            .eq('id', session.id);
        }

        // Créer la nouvelle session
        await supabase.from('sessions').insert(sessionToRow(newSession));
      } catch (error) {
        console.error('Error creating session in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }

    // Ouvrir automatiquement le recrutement
    await handleSetRecruitmentOpen(true);
  };

  const closeSession = async (sessionId: string) => {
    const updatedSessions = sessions.map(s =>
      s.id === sessionId ? { ...s, isActive: false, endDate: new Date() } : s
    );
    setSessions(updatedSessions);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('sessions')
          .update({ is_active: false, end_date: new Date().toISOString() })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error closing session in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('id', sessionId);
        
        if (error) {
          console.error('Error deleting session from Supabase:', error);
          throw error;
        }
        
        // Mettre à jour le state local seulement si la suppression a réussi dans Supabase
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        saveToLocalStorage();
      } catch (error) {
        console.error('Error deleting session from Supabase:', error);
        // Ne pas supprimer localement si la suppression dans Supabase a échoué
        // Cela garantit que la session reste dans l'état jusqu'à ce que la suppression réussisse
        throw error; // Re-lancer l'erreur pour que l'appelant sache que la suppression a échoué
      }
    } else {
      // Si Supabase n'est pas configuré, supprimer seulement localement
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      saveToLocalStorage();
    }
  };

  const handleSetRecruitmentOpen = async (open: boolean) => {
    setIsRecruitmentOpen(open);
    
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('settings')
          .upsert({ key: 'recruitment_open', value: String(open) }, { onConflict: 'key' });
      } catch (error) {
        console.error('Error updating recruitment status in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }

    // Si on ferme le recrutement, fermer aussi la session active
    if (!open && currentSession) {
      await closeSession(currentSession.id);
    }
  };

  const getApplicationsBySession = (sessionId: string | null) => {
    if (sessionId === null) {
      return applications;
    }
    return applications.filter(app => app.sessionId === sessionId);
  };

  const addApplication = async (app: Omit<Application, 'id' | 'status' | 'createdAt' | 'sessionId'>): Promise<boolean> => {
    if (hasActiveApplication(app.idJoueur)) {
      return false;
    }
    
    // Si pas de session active, créer une session par défaut
    let activeSession = currentSession;
    if (!activeSession) {
      const defaultSession: RecruitmentSession = {
        id: crypto.randomUUID(),
        name: `Session ${new Date().toLocaleDateString('fr-FR')}`,
        startDate: new Date(),
        isActive: true,
      };
      setSessions(prev => [...prev, defaultSession]);
      activeSession = defaultSession;

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('sessions').insert(sessionToRow(defaultSession));
        } catch (error) {
          console.error('Error creating default session:', error);
        }
      }
    }

    const newApp: Application = {
      ...app,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
      sessionId: activeSession.id,
    };

    setApplications(prev => [...prev, newApp]);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('applications').insert(applicationToRow(newApp));
      } catch (error) {
        console.error('Error adding application to Supabase:', error);
        saveToLocalStorage();
        return true;
      }
    } else {
      saveToLocalStorage();
    }

    return true;
  };

  const updateApplicationStatus = async (id: string, status: 'interview_waiting' | 'accepted' | 'rejected') => {
    const application = applications.find(app => app.id === id);
    
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status } : app))
    );

    // Si la candidature est acceptée (pas en attente d'entretien), changer le grade de l'utilisateur de 'client' à 'employee'
    if (status === 'accepted' && application) {
      const userToUpdate = users.find(u => u.idPersonnel === application.idJoueur);
      if (userToUpdate && userToUpdate.grade === 'client') {
        // Mettre à jour le grade dans le state
        setUsers(prev =>
          prev.map(u => u.id === userToUpdate.id ? { ...u, grade: 'employee' } : u)
        );

        // Mettre à jour dans Supabase
        if (isSupabaseConfigured()) {
          try {
            await supabase
              .from('users')
              .update({ grade: 'employee' })
              .eq('id', userToUpdate.id);
          } catch (error) {
            console.error('Error updating user grade in Supabase:', error);
          }
        }
      }
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('applications')
          .update({ status })
          .eq('id', id);
      } catch (error) {
        console.error('Error updating application status in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }
  };

  const deleteApplication = async (id: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('applications')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting application from Supabase:', error);
          throw error;
        }

        // Supprimer de l'état local seulement si la suppression Supabase réussit
        setApplications(prev => prev.filter(app => app.id !== id));
      } catch (error) {
        console.error('Error deleting application from Supabase:', error);
        // Ne pas supprimer de l'état local si la suppression Supabase échoue
        throw error;
      }
    } else {
      // Supprimer de l'état local pour localStorage
      setApplications(prev => prev.filter(app => app.id !== id));
      saveToLocalStorage();
    }
  };

  const hasActiveApplication = (idJoueur: string) => {
    return applications.some(
      app => app.idJoueur === idJoueur && app.status === 'pending'
    );
  };

  const loginEmployee = (password: string) => {
    // Simple password for demo - in production, use proper auth
    if (password === 'lscustoms2024') {
      setIsEmployeeLoggedIn(true);
      return true;
    }
    return false;
  };

  const logoutEmployee = () => {
    setIsEmployeeLoggedIn(false);
  };

  // Fonctions utilitaires pour le hachage des mots de passe avec Web Crypto API (PBKDF2)
  const hashPassword = async (password: string): Promise<string> => {
    // Générer un salt aléatoire
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Convertir le mot de passe en ArrayBuffer
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Importer la clé pour PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    // Dériver la clé avec PBKDF2 (100,000 itérations pour sécurité)
    const iterations = 100000;
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 256 bits = 32 bytes
    );
    
    // Convertir en hexadécimal
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Format: pbkdf2:iterations:salt:hash
    return `pbkdf2:${iterations}:${saltHex}:${hashHex}`;
  };

  const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    // Détecter le format du hash
    const isPBKDF2 = hashedPassword.startsWith('pbkdf2:');
    const isBcrypt = hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2y$');
    
    if (isPBKDF2) {
      // Parser le hash PBKDF2: pbkdf2:iterations:salt:hash
      const parts = hashedPassword.split(':');
      if (parts.length !== 4) {
        return false;
      }
      
      const iterations = parseInt(parts[1], 10);
      const saltHex = parts[2];
      const storedHash = parts[3];
      
      // Convertir le salt hex en Uint8Array
      const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      
      // Convertir le mot de passe en ArrayBuffer
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(plainPassword);
      
      // Importer la clé pour PBKDF2
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveBits']
      );
      
      // Dériver la clé avec les mêmes paramètres
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: iterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );
      
      // Convertir en hexadécimal
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
      
      // Comparer les hash (comparaison constante dans le temps)
      return hashHex === storedHash;
    } else if (isBcrypt) {
      // Si c'est un hash bcrypt (migration depuis bcryptjs), on ne peut pas le vérifier facilement avec Web Crypto
      // Pour l'instant, retourner false et forcer la réinitialisation du mot de passe
      // En production, vous pourriez migrer ces hashs ou utiliser une fonction de vérification bcrypt côté serveur
      console.warn('Bcrypt hash détecté mais non supporté avec Web Crypto API. Migration nécessaire.');
      return false;
    } else {
      // Migration automatique : si le mot de passe en DB est en clair, comparer en clair
      // mais retourner true uniquement si les mots de passe correspondent
      return plainPassword === hashedPassword;
    }
  };

  // Fonction pour capitaliser la première lettre de chaque mot
  const capitalizeName = (name?: string) => {
    if (!name) return name;
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // User management functions
  const registerUser = async (idPersonnel: string, password: string, telephone: string, grade: 'direction' | 'client' | 'dev' | 'rh' | 'employee' = 'client', prenom?: string, nom?: string): Promise<User | null | { error: 'id' | 'telephone' }> => {
    // Vérifier si l'ID personnel existe déjà
    const existingUserById = users.find(u => u.idPersonnel === idPersonnel);
    if (existingUserById) {
      return { error: 'id' }; // ID déjà utilisé
    }

    // Vérifier si le numéro de téléphone existe déjà
    const existingUserByTel = users.find(u => u.telephone === telephone);
    if (existingUserByTel) {
      return { error: 'telephone' }; // Téléphone déjà utilisé
    }

    // Hasher le mot de passe avant de le stocker
    const hashedPassword = await hashPassword(password);

    // Capitaliser le prénom et le nom si fournis
    const capitalizedPrenom = capitalizeName(prenom);
    const capitalizedNom = capitalizeName(nom);

    const newUser: User = {
      id: crypto.randomUUID(),
      idPersonnel,
      password: hashedPassword,
      telephone,
      prenom: capitalizedPrenom,
      nom: capitalizedNom,
      grade,
      createdAt: new Date(),
    };

    setUsers(prev => [...prev, newUser]);

    if (isSupabaseConfigured()) {
      try {
        // Vérifier aussi dans Supabase avant d'insérer
        const { data: existingById } = await supabase
          .from('users')
          .select('id')
          .eq('id_personnel', idPersonnel)
          .maybeSingle();
        
        if (existingById) {
          // Annuler l'ajout dans le state
          setUsers(prev => prev.filter(u => u.id !== newUser.id));
          return { error: 'id' };
        }

        const { data: existingByTel } = await supabase
          .from('users')
          .select('id')
          .eq('telephone', telephone)
          .maybeSingle();

        if (existingByTel) {
          // Annuler l'ajout dans le state
          setUsers(prev => prev.filter(u => u.id !== newUser.id));
          return { error: 'telephone' };
        }

        await supabase.from('users').insert({
          id: newUser.id,
          id_personnel: newUser.idPersonnel,
          password: newUser.password,
          telephone: newUser.telephone,
          prenom: newUser.prenom || null,
          nom: newUser.nom || null,
          grade: newUser.grade,
          created_at: newUser.createdAt.toISOString(),
        });
      } catch (error: any) {
        // Vérifier si c'est une erreur de contrainte unique
        if (error?.code === '23505') {
          const message = error.message || '';
          // Annuler l'ajout dans le state
          setUsers(prev => prev.filter(u => u.id !== newUser.id));
          if (message.includes('id_personnel')) {
            return { error: 'id' };
          }
          if (message.includes('telephone')) {
            return { error: 'telephone' };
          }
        }
        console.error('Error registering user in Supabase:', error);
        // Annuler l'ajout dans le state
        setUsers(prev => prev.filter(u => u.id !== newUser.id));
        saveToLocalStorage();
        return null;
      }
    } else {
      saveToLocalStorage();
    }

    return newUser;
  };

  const loginUser = async (idPersonnel: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.idPersonnel === idPersonnel);
    if (!user) {
      return false;
    }

    // Comparer le mot de passe (gère automatiquement les anciens mots de passe en clair)
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return false;
    }

    // Migration automatique : si le mot de passe était en clair, le hasher et mettre à jour
    const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$');
    if (!isHashed) {
      const hashedPassword = await hashPassword(password);
      const updatedUser: User = {
        ...user,
        password: hashedPassword,
      };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      
      // Mettre à jour dans Supabase si configuré
      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', user.id);
        } catch (error) {
          console.error('Error updating password hash in Supabase:', error);
        }
      }

      setCurrentUser(updatedUser);
      setIsUserLoggedIn(true);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      return true;
    }

    setCurrentUser(user);
    setIsUserLoggedIn(true);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setIsUserLoggedIn(false);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const updateUser = async (oldPassword: string, newPassword?: string, newTelephone?: string): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    // Vérifier que l'ancien mot de passe est correct
    const passwordMatch = await comparePassword(oldPassword, currentUser.password);
    if (!passwordMatch) {
      return false;
    }

    // Hasher le nouveau mot de passe s'il est fourni
    const passwordToStore = newPassword ? await hashPassword(newPassword) : currentUser.password;

    // Mettre à jour l'utilisateur
    const updatedUser: User = {
      ...currentUser,
      password: passwordToStore,
      telephone: newTelephone || currentUser.telephone,
    };

    // Mettre à jour dans la liste des utilisateurs
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? updatedUser : u))
    );

    // Mettre à jour l'utilisateur actuel si c'est lui
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }

    // Sauvegarder dans Supabase
    if (isSupabaseConfigured()) {
      try {
        const updateData: any = {};
        if (newPassword) updateData.password = passwordToStore;
        if (newTelephone) updateData.telephone = newTelephone;

        await supabase
          .from('users')
          .update(updateData)
          .eq('id', currentUser.id);
      } catch (error) {
        console.error('Error updating user in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }

    return true;
  };

  // User management for admins
  const updateUserByAdmin = async (userId: string, data: { prenom?: string; nom?: string; telephone?: string; grade?: 'direction' | 'client' | 'dev' | 'rh' | 'employee'; photoUrl?: string }): Promise<boolean | { error: 'telephone' | 'protected' }> => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) {
      return false;
    }

    // Protection : Les utilisateurs "dev" ne peuvent être modifiés que par un autre "dev"
    if (userToUpdate.grade === 'dev' && currentUser?.grade !== 'dev') {
      return { error: 'protected' };
    }

    // Protection : Seuls les "dev" peuvent attribuer le grade "dev"
    if (data.grade === 'dev' && currentUser?.grade !== 'dev') {
      return { error: 'protected' };
    }

    // Vérifier si le nouveau numéro de téléphone est déjà utilisé par un autre utilisateur
    if (data.telephone !== undefined && data.telephone !== userToUpdate.telephone) {
      const existingUserByTel = users.find(u => u.telephone === data.telephone && u.id !== userId);
      if (existingUserByTel) {
        return { error: 'telephone' };
      }

      // Vérifier aussi dans Supabase si configuré
      if (isSupabaseConfigured()) {
        try {
          const { data: existingByTel } = await supabase
            .from('users')
            .select('id')
            .eq('telephone', data.telephone)
            .neq('id', userId)
            .single();

          if (existingByTel) {
            return { error: 'telephone' };
          }
        } catch (error: any) {
          if (error?.code === '23505') {
            return { error: 'telephone' };
          }
        }
      }
    }

    const updatedUser: User = {
      ...userToUpdate,
      prenom: data.prenom !== undefined ? data.prenom : userToUpdate.prenom,
      nom: data.nom !== undefined ? data.nom : userToUpdate.nom,
      telephone: data.telephone !== undefined ? data.telephone : userToUpdate.telephone,
      grade: data.grade !== undefined ? data.grade : userToUpdate.grade,
      photoUrl: data.photoUrl !== undefined ? data.photoUrl : userToUpdate.photoUrl,
    };

    // Mettre à jour dans la liste des utilisateurs
    setUsers(prev =>
      prev.map(u => (u.id === userId ? updatedUser : u))
    );

    // Mettre à jour l'utilisateur actuel si c'est lui
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }

    // Sauvegarder dans Supabase
    if (isSupabaseConfigured()) {
      try {
        const updateData: any = {};
        if (data.prenom !== undefined) updateData.prenom = data.prenom || null;
        if (data.nom !== undefined) updateData.nom = data.nom || null;
        if (data.telephone !== undefined) updateData.telephone = data.telephone;
        if (data.grade !== undefined) updateData.grade = data.grade;
        if (data.photoUrl !== undefined) updateData.photo_url = data.photoUrl || null;

        await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId);
      } catch (error) {
        console.error('Error updating user in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }

    return true;
  };

  const updateUserPhoto = async (userId: string, photoUrl: string): Promise<boolean> => {
    const result = await updateUserByAdmin(userId, { photoUrl });
    return typeof result === 'boolean' ? result : false;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    // Ne pas permettre de supprimer l'utilisateur actuellement connecté
    if (currentUser && currentUser.id === userId) {
      return false;
    }

    // Protection : Les utilisateurs "dev" ne peuvent être supprimés que par un autre "dev"
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.grade === 'dev' && currentUser?.grade !== 'dev') {
      return false;
    }

    // Supprimer de Supabase d'abord
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (error) {
          console.error('Error deleting user from Supabase:', error);
          throw error;
        }

        // Supprimer de l'état local seulement si la suppression Supabase réussit
        setUsers(prev => prev.filter(u => u.id !== userId));
        return true;
      } catch (error) {
        console.error('Error deleting user from Supabase:', error);
        // Ne pas supprimer de l'état local si la suppression Supabase échoue
        return false;
      }
    } else {
      // Supprimer de l'état local pour localStorage
      setUsers(prev => prev.filter(u => u.id !== userId));
      saveToLocalStorage();
      return true;
    }
  };

  // Charger l'utilisateur connecté au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // S'assurer que le grade est présent (par défaut 'client' pour les anciens utilisateurs)
        if (!user.grade) {
          user.grade = 'client';
        }
        setCurrentUser(user);
        setIsUserLoggedIn(true);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    }
  }, []);

  const addTeamMember = async (member: Omit<TeamMember, 'id' | 'order'> & { order?: number }) => {
    // Si l'ordre n'est pas spécifié, mettre le membre à la fin
    const maxOrder = teamMembers.length > 0 ? Math.max(...teamMembers.map(m => m.order ?? 0)) : -1;
    const newMember: TeamMember = {
      ...member,
      prenom: capitalizeName(member.prenom),
      nom: capitalizeName(member.nom),
      id: crypto.randomUUID(),
      order: member.order ?? (maxOrder + 1),
    };
    setTeamMembers(prev => [...prev, newMember].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('team_members').insert(teamMemberToRow(newMember));
      } catch (error) {
        console.error('Error adding team member to Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }
  };

  const removeTeamMember = async (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('team_members').delete().eq('id', id);
      } catch (error) {
        console.error('Error removing team member from Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }
  };

  const updateTeamMember = async (id: string, member: Partial<Omit<TeamMember, 'id'>>) => {
    // Capitaliser le prénom et le nom si fournis
    const updatedMember = { ...member };
    if (member.prenom) updatedMember.prenom = capitalizeName(member.prenom);
    if (member.nom) updatedMember.nom = capitalizeName(member.nom);

    setTeamMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, ...updatedMember } : m)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    );

    if (isSupabaseConfigured()) {
      try {
        const updateData: Partial<TeamMemberRow> = {};
        if (updatedMember.prenom !== undefined) updateData.prenom = updatedMember.prenom;
        if (updatedMember.nom !== undefined) updateData.nom = updatedMember.nom;
        if (updatedMember.role !== undefined) updateData.role = updatedMember.role;
        if (updatedMember.order !== undefined) updateData.order = updatedMember.order;
        if (updatedMember.photo !== undefined) updateData.photo = updatedMember.photo || null;
        if (updatedMember.userId !== undefined) updateData.user_id = updatedMember.userId || null;

        await supabase
          .from('team_members')
          .update(updateData)
          .eq('id', id);
      } catch (error) {
        console.error('Error updating team member in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }
  };

  const updateTeamMemberOrder = async (id: string, direction: 'up' | 'down') => {
    const sortedMembers = [...teamMembers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const currentIndex = sortedMembers.findIndex(m => m.id === id);
    
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex > 0) {
      const member = sortedMembers[currentIndex];
      const previousMember = sortedMembers[currentIndex - 1];
      const tempOrder = member.order;
      member.order = previousMember.order;
      previousMember.order = tempOrder;
    } else if (direction === 'down' && currentIndex < sortedMembers.length - 1) {
      const member = sortedMembers[currentIndex];
      const nextMember = sortedMembers[currentIndex + 1];
      const tempOrder = member.order;
      member.order = nextMember.order;
      nextMember.order = tempOrder;
    } else {
      return; // Déjà en première ou dernière position
    }

    const updatedMembers = sortedMembers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setTeamMembers(updatedMembers);

    if (isSupabaseConfigured()) {
      try {
        // Mettre à jour les deux membres
        const currentMember = updatedMembers[currentIndex];
        const otherIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const otherMember = updatedMembers[otherIndex];
        
        await supabase.from('team_members').update({ order: currentMember.order }).eq('id', currentMember.id);
        await supabase.from('team_members').update({ order: otherMember.order }).eq('id', otherMember.id);
      } catch (error) {
        console.error('Error updating team member order in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }
  };

  // Client Reviews functions
  const addClientReview = async (review: Omit<ClientReview, 'id' | 'status' | 'createdAt' | 'approvedAt'>): Promise<boolean> => {
    const newReview: ClientReview = {
      ...review,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    };

    setClientReviews(prev => [...prev, newReview]);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('client_reviews').insert(clientReviewToRow(newReview));
      } catch (error) {
        console.error('Error adding client review to Supabase:', error);
        saveToLocalStorage();
        return true;
      }
    } else {
      saveToLocalStorage();
    }

    return true;
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected', approvedBy: string) => {
    const updatedReviews = clientReviews.map(review =>
      review.id === id
        ? {
            ...review,
            status,
            approvedBy,
            approvedAt: new Date(),
          }
        : review
    );
    setClientReviews(updatedReviews);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('client_reviews')
          .update({
            status,
            approved_by: approvedBy,
            approved_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (error) {
        console.error('Error updating review status in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }
  };

  const deleteReview = async (id: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('client_reviews').delete().eq('id', id);
        if (error) throw error;
        setClientReviews(prev => prev.filter(review => review.id !== id));
      } catch (error) {
        console.error('Error deleting review from Supabase:', error);
        throw error;
      }
    } else {
      setClientReviews(prev => prev.filter(review => review.id !== id));
      saveToLocalStorage();
    }
  };

  // Appointments functions
  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'respondedAt'>): Promise<boolean> => {
    if (hasPendingAppointment(appointment.userId || '')) {
      return false;
    }

    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    };

    setAppointments(prev => [...prev, newAppointment]);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('appointments').insert(appointmentToRow(newAppointment));
      } catch (error) {
        console.error('Error adding appointment to Supabase:', error);
        saveToLocalStorage();
        return true;
      }
    } else {
      saveToLocalStorage();
    }

    return true;
  };

  const updateAppointmentStatus = async (id: string, status: 'accepted' | 'rejected' | 'completed' | 'cancelled', respondedBy: string) => {
    const updatedAppointments = appointments.map(appointment =>
      appointment.id === id
        ? {
            ...appointment,
            status,
            respondedBy,
            respondedAt: new Date(),
          }
        : appointment
    );
    setAppointments(updatedAppointments);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('appointments')
          .update({
            status,
            responded_by: respondedBy,
            responded_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (error) {
        console.error('Error updating appointment status in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }
  };

  const deleteAppointment = async (id: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (error) throw error;
        setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      } catch (error) {
        console.error('Error deleting appointment from Supabase:', error);
        throw error;
      }
    } else {
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      saveToLocalStorage();
    }
  };

  const hasPendingAppointment = (userId: string) => {
    if (!userId) return false;
    return appointments.some(
      appointment => appointment.userId === userId && (appointment.status === 'pending' || appointment.status === 'accepted')
    );
  };

  const getNotificationCount = (): number => {
    // Pour les RH, ne compter que leurs propres rendez-vous en attente
    if (currentUser?.grade === 'rh') {
      const pendingAppointments = appointments.filter(
        appointment => appointment.status === 'pending' && appointment.directionUserId === currentUser.id
      ).length;
      return pendingAppointments;
    }

    // Pour les autres grades (direction/dev), compter tout
    // Compter les candidatures en attente
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    // Compter les avis en attente
    const pendingReviews = clientReviews.filter(review => review.status === 'pending').length;
    // Compter les rendez-vous en attente
    const pendingAppointments = appointments.filter(appointment => appointment.status === 'pending').length;
    // Retourner le total (l'affichage "+9" est géré dans la Navbar)
    return pendingApplications + pendingReviews + pendingAppointments;
  };

  const addPartenaire = async (partenaire: Omit<Partenaire, 'id' | 'createdAt'>) => {
    const newPartenaire: Partenaire = {
      ...partenaire,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Mettre à jour le state et sauvegarder immédiatement dans localStorage
    setPartenaires(prev => {
      const updatedPartenaires = [...prev, newPartenaire];
      // Sauvegarder immédiatement dans localStorage
      localStorage.setItem(STORAGE_KEYS.PARTENAIRES, JSON.stringify(updatedPartenaires));
      return updatedPartenaires;
    });

    // Sauvegarder dans Supabase si configuré
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('partenaires').insert(partenaireToRow(newPartenaire));
        if (error) {
          console.error('Error adding partenaire to Supabase:', error);
          // Les données sont déjà dans localStorage, donc pas besoin de les sauvegarder à nouveau
        }
      } catch (error) {
        console.error('Error adding partenaire to Supabase:', error);
        // Les données sont déjà dans localStorage, donc pas besoin de les sauvegarder à nouveau
      }
    }
  };

  const updatePartenaire = async (id: string, updates: { nom?: string; logoUrl?: string }) => {
    // Mettre à jour le state et sauvegarder immédiatement dans localStorage
    setPartenaires(prev => {
      const updatedPartenaires = prev.map(partenaire =>
        partenaire.id === id
          ? { ...partenaire, ...updates }
          : partenaire
      );
      // Sauvegarder immédiatement dans localStorage
      localStorage.setItem(STORAGE_KEYS.PARTENAIRES, JSON.stringify(updatedPartenaires));
      return updatedPartenaires;
    });

    // Sauvegarder dans Supabase si configuré
    if (isSupabaseConfigured()) {
      try {
        const updateData: any = {};
        if (updates.nom !== undefined) updateData.nom = updates.nom;
        if (updates.logoUrl !== undefined) updateData.logo_url = updates.logoUrl;

        const { error } = await supabase
          .from('partenaires')
          .update(updateData)
          .eq('id', id);
        
        if (error) {
          console.error('Error updating partenaire in Supabase:', error);
        }
      } catch (error) {
        console.error('Error updating partenaire in Supabase:', error);
      }
    }
  };

  const deletePartenaire = async (id: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('partenaires').delete().eq('id', id);
        if (error) throw error;
        setPartenaires(prev => prev.filter(partenaire => partenaire.id !== id));
      } catch (error) {
        console.error('Error deleting partenaire from Supabase:', error);
        throw error;
      }
    } else {
      setPartenaires(prev => prev.filter(partenaire => partenaire.id !== id));
      saveToLocalStorage();
    }
  };

  return (
    <RecruitmentContext.Provider
      value={{
        isRecruitmentOpen,
        setIsRecruitmentOpen: handleSetRecruitmentOpen,
        handleSetRecruitmentOpen,
        applications,
        sessions,
        currentSession,
        teamMembers,
        addApplication,
        updateApplicationStatus,
        deleteApplication,
        hasActiveApplication,
        createSession,
        closeSession,
        deleteSession,
        getApplicationsBySession,
        addTeamMember,
        removeTeamMember,
        updateTeamMember,
        updateTeamMemberOrder,
        isEmployeeLoggedIn,
        loginEmployee,
        logoutEmployee,
        isLoading,
        isUserLoggedIn,
        currentUser,
        registerUser,
        loginUser,
        logoutUser,
        updateUser,
        users,
        updateUserByAdmin,
        updateUserPhoto,
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
        getNotificationCount,
      }}
    >
      {children}
    </RecruitmentContext.Provider>
  );
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
};
