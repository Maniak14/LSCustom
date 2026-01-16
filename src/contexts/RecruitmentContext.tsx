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

interface RecruitmentContextType {
  isRecruitmentOpen: boolean;
  setIsRecruitmentOpen: (open: boolean) => void;
  applications: Application[];
  sessions: RecruitmentSession[];
  currentSession: RecruitmentSession | null;
  addApplication: (app: Omit<Application, 'id' | 'status' | 'createdAt' | 'sessionId'>) => boolean;
  updateApplicationStatus: (id: string, status: 'accepted' | 'rejected') => void;
  hasActiveApplication: (idJoueur: string) => boolean;
  createSession: (name: string) => void;
  closeSession: (sessionId: string) => void;
  getApplicationsBySession: (sessionId: string | null) => Application[];
  isEmployeeLoggedIn: boolean;
  loginEmployee: (password: string) => boolean;
  logoutEmployee: () => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export const RecruitmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [sessions, setSessions] = useState<RecruitmentSession[]>([]);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);

  // Récupérer la session active
  const currentSession = sessions.find(s => s.isActive) || null;

  const createSession = (name: string) => {
    // Fermer toutes les sessions actives
    setSessions(prev => prev.map(s => ({ ...s, isActive: false })));
    
    const newSession: RecruitmentSession = {
      id: crypto.randomUUID(),
      name,
      startDate: new Date(),
      isActive: true,
    };
    setSessions(prev => [...prev, newSession]);
  };

  const closeSession = (sessionId: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, isActive: false, endDate: new Date() } : s
      )
    );
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

  return (
    <RecruitmentContext.Provider
      value={{
        isRecruitmentOpen,
        setIsRecruitmentOpen,
        applications,
        sessions,
        currentSession,
        addApplication,
        updateApplicationStatus,
        hasActiveApplication,
        createSession,
        closeSession,
        getApplicationsBySession,
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
