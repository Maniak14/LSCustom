import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  photo?: string; // URL de la photo
}

interface RecruitmentContextType {
  isRecruitmentOpen: boolean;
  setIsRecruitmentOpen: (open: boolean) => void;
  handleSetRecruitmentOpen: (open: boolean) => void;
  applications: Application[];
  sessions: RecruitmentSession[];
  currentSession: RecruitmentSession | null;
  teamMembers: TeamMember[];
  addApplication: (app: Omit<Application, 'id' | 'status' | 'createdAt' | 'sessionId'>) => boolean;
  updateApplicationStatus: (id: string, status: 'accepted' | 'rejected') => void;
  hasActiveApplication: (idJoueur: string) => boolean;
  createSession: (name: string) => void;
  closeSession: (sessionId: string) => void;
  getApplicationsBySession: (sessionId: string | null) => Application[];
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  updateTeamMember: (id: string, member: Partial<Omit<TeamMember, 'id'>>) => void;
  isEmployeeLoggedIn: boolean;
  loginEmployee: (password: string) => boolean;
  logoutEmployee: () => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export const RecruitmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [sessions, setSessions] = useState<RecruitmentSession[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);

  // Récupérer la session active
  const currentSession = sessions.find(s => s.isActive) || null;

  const createSession = (name: string) => {
    // Fermer toutes les sessions actives
    setSessions(prev => prev.map(s => ({ ...s, isActive: false, endDate: s.isActive ? new Date() : s.endDate })));
    
    const newSession: RecruitmentSession = {
      id: crypto.randomUUID(),
      name,
      startDate: new Date(),
      isActive: true,
    };
    setSessions(prev => [...prev, newSession]);
    // Ouvrir automatiquement le recrutement lors de la création d'une session
    setIsRecruitmentOpen(true);
  };

  const closeSession = (sessionId: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, isActive: false, endDate: new Date() } : s
      )
    );
  };

  // Fonction wrapper pour setIsRecruitmentOpen qui ferme aussi la session active
  const handleSetRecruitmentOpen = (open: boolean) => {
    setIsRecruitmentOpen(open);
    // Si on ferme le recrutement, fermer aussi la session active
    if (!open && currentSession) {
      closeSession(currentSession.id);
    }
  };

  const getApplicationsBySession = (sessionId: string | null) => {
    if (sessionId === null) {
      return applications;
    }
    return applications.filter(app => app.sessionId === sessionId);
  };

  const addApplication = (app: Omit<Application, 'id' | 'status' | 'createdAt' | 'sessionId'>) => {
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
    }

    const newApp: Application = {
      ...app,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
      sessionId: activeSession.id,
    };
    setApplications(prev => [...prev, newApp]);
    return true;
  };

  const updateApplicationStatus = (id: string, status: 'accepted' | 'rejected') => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status } : app))
    );
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

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: crypto.randomUUID(),
    };
    setTeamMembers(prev => [...prev, newMember]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const updateTeamMember = (id: string, member: Partial<Omit<TeamMember, 'id'>>) => {
    setTeamMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, ...member } : m))
    );
  };

  return (
    <RecruitmentContext.Provider
      value={{
        isRecruitmentOpen,
        setIsRecruitmentOpen,
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
