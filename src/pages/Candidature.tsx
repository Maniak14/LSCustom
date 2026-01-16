import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { AlertCircle, CheckCircle, XCircle, ArrowLeft, Clock, History, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Candidature: React.FC = () => {
  const navigate = useNavigate();
  const { isRecruitmentOpen, addApplication, hasActiveApplication, applications, isUserLoggedIn, currentUser, sessions } = useRecruitment();
  
  const [formData, setFormData] = useState({
    nomRP: '',
    prenomRP: '',
    idJoueur: '',
    motivation: '',
    experience: '',
  });
  
  const [status, setStatus] = useState<'idle' | 'checking' | 'error' | 'success' | 'existing'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [showAppDetailDialog, setShowAppDetailDialog] = useState(false);
  const [appToView, setAppToView] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 10;

  // Pré-remplir les champs depuis le compte connecté
  useEffect(() => {
    if (isUserLoggedIn && currentUser) {
      setFormData(prev => ({
        ...prev,
        idJoueur: currentUser.idPersonnel,
        prenomRP: currentUser.prenom || '',
        nomRP: currentUser.nom || '',
      }));
    }
  }, [isUserLoggedIn, currentUser]);

  // Vérifier au chargement si l'utilisateur a déjà une candidature en cours
  useEffect(() => {
    if (isUserLoggedIn && currentUser) {
      const hasActive = hasActiveApplication(currentUser.idPersonnel);
      if (hasActive) {
        setHasExistingApplication(true);
        setStatus('existing');
      }
    } else {
      // Fallback pour les utilisateurs non connectés (ancien système)
      const savedId = localStorage.getItem('ls_customs_candidate_id');
      if (savedId) {
        const hasActive = hasActiveApplication(savedId);
        if (hasActive) {
          setHasExistingApplication(true);
          setStatus('existing');
          setFormData(prev => ({ ...prev, idJoueur: savedId }));
        }
      }
    }
  }, [applications, hasActiveApplication, isUserLoggedIn, currentUser]);

  // Vérifier quand l'identifiant change (seulement si l'utilisateur n'est pas connecté)
  useEffect(() => {
    if (!isUserLoggedIn && formData.idJoueur) {
      const hasActive = hasActiveApplication(formData.idJoueur);
      if (hasActive) {
        setHasExistingApplication(true);
        setStatus('existing');
      } else if (status === 'existing') {
        setHasExistingApplication(false);
        setStatus('idle');
      }
    }
  }, [formData.idJoueur, applications, status, hasActiveApplication, isUserLoggedIn]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('checking');

    // Utiliser l'ID de l'utilisateur connecté si disponible
    const userIdToCheck = isUserLoggedIn && currentUser ? currentUser.idPersonnel : formData.idJoueur;

    if (!formData.nomRP || !formData.prenomRP || !formData.idJoueur || !formData.motivation) {
      setStatus('error');
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (hasActiveApplication(userIdToCheck)) {
      setStatus('error');
      setErrorMessage('Votre candidature est déjà en traitement. Merci de patienter.');
      return;
    }

    try {
      const success = await addApplication(formData);
      
      if (success) {
        // Sauvegarder l'identifiant dans localStorage (pour compatibilité avec ancien système)
        if (!isUserLoggedIn) {
          localStorage.setItem('ls_customs_candidate_id', formData.idJoueur);
        }
        setStatus('success');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setStatus('error');
        setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      console.error('Error submitting application:', error);
    }
  };

  // Vérifier si l'utilisateur est connecté
  if (!isUserLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 pb-24 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="glass-card">
              <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Connexion requise</h1>
              <p className="text-muted-foreground mb-4">
                Vous devez être connecté pour postuler.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Veuillez vous inscrire ou vous connecter pour accéder au formulaire de candidature.
              </p>
              <Link to="/inscription" className="btn-primary">
                S'inscrire / Se connecter
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isRecruitmentOpen) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 pb-24 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="glass-card">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Recrutement fermé</h1>
              <p className="text-muted-foreground mb-4">
                Il n'est actuellement pas possible de nous rejoindre.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Le recrutement est temporairement fermé. Revenez plus tard pour postuler.
              </p>
              <Link to="/" className="btn-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 pb-24 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="glass-card">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Candidature envoyée</h1>
              <p className="text-muted-foreground">
                Nous examinerons votre candidature rapidement.
              </p>
            </div>
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
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4 animate-fade-up">
              Recrutement
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight animate-fade-up-1">
              Rejoins l'équipe
            </h1>
            <p className="mt-4 text-muted-foreground animate-fade-up-2">
              Deviens mécanicien chez LS Custom's
            </p>
          </div>

          {/* Historique des candidatures */}
          {isUserLoggedIn && currentUser && (
            <div className="glass-card mb-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Historique de mes candidatures</h2>
              </div>
              {(() => {
                const userApplications = applications
                  .filter(app => app.idJoueur === currentUser.idPersonnel)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
                if (userApplications.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune candidature enregistrée
                    </p>
                  );
                }

                // Pagination
                const totalPages = Math.ceil(userApplications.length / applicationsPerPage);
                const startIndex = (currentPage - 1) * applicationsPerPage;
                const endIndex = startIndex + applicationsPerPage;
                const paginatedApplications = userApplications.slice(startIndex, endIndex);

                return (
                  <>
                    <div className="space-y-3">
                      {paginatedApplications.map((app) => {
                        const session = sessions.find(s => s.id === app.sessionId);
                        return (
                          <div
                            key={app.id}
                            className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                                  {session && (
                                    <span className="text-xs text-muted-foreground">
                                      {session.name}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {new Date(app.createdAt).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {app.motivation && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {app.motivation}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setAppToView(app);
                                    setShowAppDetailDialog(true);
                                  }}
                                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                  title="Voir les détails"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {app.status === 'pending' && (
                                  <AlertCircle className="w-5 h-5 text-accent" />
                                )}
                                {app.status === 'accepted' && (
                                  <CheckCircle className="w-5 h-5 text-success" />
                                )}
                                {app.status === 'rejected' && (
                                  <XCircle className="w-5 h-5 text-destructive" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          Page {currentPage} sur {totalPages} ({userApplications.length} candidature{userApplications.length > 1 ? 's' : ''})
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
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Message candidature existante - Affiche seulement le message, pas le formulaire */}
          {status === 'existing' ? (
            <div className="glass-card animate-fade-up">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Candidature en cours</h2>
                <p className="text-muted-foreground mb-6">
                  Vous avez déjà une candidature en traitement. Nous examinerons votre dossier rapidement.
                </p>
                <Link to="/" className="btn-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Error */}
              {status === 'error' && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-fade-up">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="glass-card animate-fade-up-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prénom *</label>
                <input
                  type="text"
                  name="prenomRP"
                  value={formData.prenomRP}
                  onChange={handleChange}
                  className="input-modern disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Carlos"
                  disabled={isUserLoggedIn && !!currentUser}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <input
                  type="text"
                  name="nomRP"
                  value={formData.nomRP}
                  onChange={handleChange}
                  className="input-modern disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Martinez"
                  disabled={isUserLoggedIn && !!currentUser}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Identifiant *</label>
              <input
                type="text"
                name="idJoueur"
                value={formData.idJoueur}
                onChange={handleChange}
                className="input-modern disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Votre identifiant"
                disabled={isUserLoggedIn && !!currentUser}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Motivation *</label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                className="input-modern min-h-[120px] resize-none"
                placeholder="Pourquoi souhaitez-vous rejoindre LS Custom's ?"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Expérience</label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="input-modern min-h-[80px] resize-none"
                placeholder="Expérience en mécanique (optionnel)"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'checking' || status === 'existing'}
              className="btn-accent w-full disabled:opacity-50"
            >
              {status === 'checking' ? 'Envoi...' : status === 'existing' ? 'Candidature en cours' : 'Envoyer ma candidature'}
            </button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              * Champs obligatoires · Une candidature par personne
            </p>
          </form>
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal de détail de candidature */}
      <Dialog open={showAppDetailDialog} onOpenChange={setShowAppDetailDialog}>
        <DialogContent className="sm:max-w-[600px] mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto scrollbar-hide">
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
                      : appToView.status === 'accepted'
                      ? 'bg-success/20 text-success'
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {appToView.status === 'pending' && 'En attente'}
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
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm whitespace-pre-wrap">{appToView.motivation}</p>
                  </div>
                </div>

                {/* Expérience */}
                {appToView.experience && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Expérience
                    </label>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-sm whitespace-pre-wrap">{appToView.experience}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <button
              onClick={() => {
                setShowAppDetailDialog(false);
                setAppToView(null);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
            >
              Fermer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Candidature;
