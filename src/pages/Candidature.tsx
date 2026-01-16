import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { AlertCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Candidature: React.FC = () => {
  const navigate = useNavigate();
  const { isRecruitmentOpen, addApplication, hasActiveApplication, applications } = useRecruitment();
  
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

  // Vérifier au chargement si l'utilisateur a déjà une candidature en cours
  useEffect(() => {
    const savedId = localStorage.getItem('ls_customs_candidate_id');
    if (savedId) {
      const hasActive = hasActiveApplication(savedId);
      if (hasActive) {
        setHasExistingApplication(true);
        setStatus('existing');
        setFormData(prev => ({ ...prev, idJoueur: savedId }));
      }
    }
  }, [applications, hasActiveApplication]);

  // Vérifier quand l'identifiant change
  useEffect(() => {
    if (formData.idJoueur) {
      const hasActive = hasActiveApplication(formData.idJoueur);
      if (hasActive) {
        setHasExistingApplication(true);
        setStatus('existing');
      } else if (status === 'existing') {
        setHasExistingApplication(false);
        setStatus('idle');
      }
    }
  }, [formData.idJoueur, applications, status, hasActiveApplication]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('checking');

    if (!formData.nomRP || !formData.prenomRP || !formData.idJoueur || !formData.motivation) {
      setStatus('error');
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (hasActiveApplication(formData.idJoueur)) {
      setStatus('error');
      setErrorMessage('Votre candidature est déjà en traitement. Merci de patienter.');
      return;
    }

    const success = addApplication(formData);
    
    if (success) {
      // Sauvegarder l'identifiant dans localStorage
      localStorage.setItem('ls_customs_candidate_id', formData.idJoueur);
      setStatus('success');
      setTimeout(() => navigate('/'), 3000);
    } else {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  if (!isRecruitmentOpen) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-24 px-4">
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-24 px-4">
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24 px-4">
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
                  className="input-modern"
                  placeholder="Carlos"
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
                  className="input-modern"
                  placeholder="Martinez"
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
                className="input-modern"
                placeholder="Votre identifiant"
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
    </div>
  );
};

export default Candidature;
