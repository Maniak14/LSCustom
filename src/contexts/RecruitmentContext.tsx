import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, ApplicationRow, SessionRow, TeamMemberRow } from '@/lib/supabase';

interface Application {
  id: string;
  nomRP: string;
  prenomRP: string;
  idJoueur: string;
  motivation: string;
  experience: string;
  status: 'pending' | 'accepted' | 'rejected';
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
  prenom: string;
  nom: string;
  role: string;
  photo?: string;
}

export interface User {
  id: string;
  idPersonnel: string;
  password: string; // Hashé en production
  telephone: string;
  prenom?: string;
  nom?: string;
  grade: 'direction' | 'client';
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
  updateApplicationStatus: (id: string, status: 'accepted' | 'rejected') => Promise<void>;
  hasActiveApplication: (idJoueur: string) => boolean;
  createSession: (name: string) => Promise<void>;
  closeSession: (sessionId: string) => Promise<void>;
  getApplicationsBySession: (sessionId: string | null) => Application[];
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  removeTeamMember: (id: string) => Promise<void>;
  updateTeamMember: (id: string, member: Partial<Omit<TeamMember, 'id'>>) => Promise<void>;
  isEmployeeLoggedIn: boolean;
  loginEmployee: (password: string) => boolean;
  logoutEmployee: () => void;
  isLoading: boolean;
  // User management
  isUserLoggedIn: boolean;
  currentUser: User | null;
  registerUser: (idPersonnel: string, password: string, telephone: string, grade?: 'direction' | 'client') => Promise<boolean>;
  loginUser: (idPersonnel: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
  updateUser: (oldPassword: string, newPassword?: string, newTelephone?: string) => Promise<boolean>;
  // User management for admins
  users: User[];
  updateUserByAdmin: (userId: string, data: { prenom?: string; nom?: string; telephone?: string; grade?: 'direction' | 'client' }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
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
  prenom: row.prenom,
  nom: row.nom,
  role: row.role,
  photo: row.photo || undefined,
});

// Helper pour convertir TeamMember en TeamMemberRow
const teamMemberToRow = (member: Omit<TeamMember, 'id'> & { id?: string }): Omit<TeamMemberRow, 'id'> & { id?: string } => ({
  id: member.id,
  prenom: member.prenom,
  nom: member.nom,
  role: member.role,
  photo: member.photo || null,
});

// LocalStorage helpers (fallback)
const STORAGE_KEYS = {
  APPLICATIONS: 'ls_customs_applications',
  SESSIONS: 'ls_customs_sessions',
  TEAM_MEMBERS: 'ls_customs_team_members',
  RECRUITMENT_OPEN: 'ls_customs_recruitment_open',
  USERS: 'ls_customs_users',
  CURRENT_USER: 'ls_customs_current_user',
};

export const RecruitmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [sessions, setSessions] = useState<RecruitmentSession[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

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
    const { data: appsData, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (appsError) throw appsError;
    if (appsData) {
      setApplications(appsData.map(rowToApplication));
    }

    // Charger les sessions
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .order('start_date', { ascending: false });

    if (sessionsError) throw sessionsError;
    if (sessionsData) {
      setSessions(sessionsData.map(rowToSession));
    }

    // Charger les membres de l'équipe
    const { data: teamData, error: teamError } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (teamError) throw teamError;
    if (teamData) {
      setTeamMembers(teamData.map(rowToTeamMember));
    }

    // Charger l'état du recrutement
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'recruitment_open')
      .single();

    if (!settingsError && settingsData) {
      setIsRecruitmentOpen(settingsData.value === 'true');
    }

    // Charger les utilisateurs
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!usersError && usersData) {
      setUsers(usersData.map((row: any) => ({
        id: row.id,
        idPersonnel: row.id_personnel,
        password: row.password,
        telephone: row.telephone,
        grade: row.grade || 'client', // Par défaut 'client' si non défini
        createdAt: new Date(row.created_at),
      })));
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
      setTeamMembers(JSON.parse(storedTeam));
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
        grade: user.grade || 'client', // Par défaut 'client' si non défini
        createdAt: new Date(user.createdAt),
      })));
    }
  };

  const saveToLocalStorage = () => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(teamMembers));
    localStorage.setItem(STORAGE_KEYS.RECRUITMENT_OPEN, String(isRecruitmentOpen));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
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

  const updateApplicationStatus = async (id: string, status: 'accepted' | 'rejected') => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status } : app))
    );

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

  // User management functions
  const registerUser = async (idPersonnel: string, password: string, telephone: string, grade: 'direction' | 'client' = 'client'): Promise<boolean> => {
    // Vérifier si l'ID personnel existe déjà
    const existingUser = users.find(u => u.idPersonnel === idPersonnel);
    if (existingUser) {
      return false; // Utilisateur déjà existant
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      idPersonnel,
      password, // En production, hash le mot de passe
      telephone,
      grade,
      createdAt: new Date(),
    };

    setUsers(prev => [...prev, newUser]);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').insert({
          id: newUser.id,
          id_personnel: newUser.idPersonnel,
          password: newUser.password,
          telephone: newUser.telephone,
          grade: newUser.grade,
          created_at: newUser.createdAt.toISOString(),
        });
      } catch (error) {
        console.error('Error registering user in Supabase:', error);
        saveToLocalStorage();
      }
    } else {
      saveToLocalStorage();
    }

    return true;
  };

  const loginUser = async (idPersonnel: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.idPersonnel === idPersonnel && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsUserLoggedIn(true);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return true;
    }
    return false;
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
    if (currentUser.password !== oldPassword) {
      return false;
    }

    // Mettre à jour l'utilisateur
    const updatedUser: User = {
      ...currentUser,
      password: newPassword || currentUser.password,
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
        if (newPassword) updateData.password = newPassword;
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

  const addTeamMember = async (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: crypto.randomUUID(),
    };
    setTeamMembers(prev => [...prev, newMember]);

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
    setTeamMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, ...member } : m))
    );

    if (isSupabaseConfigured()) {
      try {
        const updateData: Partial<TeamMemberRow> = {};
        if (member.prenom !== undefined) updateData.prenom = member.prenom;
        if (member.nom !== undefined) updateData.nom = member.nom;
        if (member.role !== undefined) updateData.role = member.role;
        if (member.photo !== undefined) updateData.photo = member.photo || null;

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
        hasActiveApplication,
        createSession,
        closeSession,
        getApplicationsBySession,
        addTeamMember,
        removeTeamMember,
        updateTeamMember,
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
