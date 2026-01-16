import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { AlertCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Candidature: React.FC = () => {
  const navigate = useNavigate();
  const { isRecruitmentOpen, addApplication, hasActiveApplication } = useRecruitment();
  
  const [formData, setFormData] = useState({
    nomRP: '',
    prenomRP: '',
    idJoueur: '',
    motivation: '',
    experience: '',
  });
  
  const [status, setStatus] = useState<'idle' | 'checking' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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
              <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Recrutement fermé</h1>
              <p className="text-muted-foreground mb-6">
                Nous ne recrutons pas actuellement.
              </p>
              <Link to="/" className="btn-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
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
                <label className="block text-sm font-medium mb-2">Prénom RP *</label>
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
                <label className="block text-sm font-medium mb-2">Nom RP *</label>
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
              <label className="block text-sm font-medium mb-2">ID Joueur *</label>
              <input
                type="text"
                name="idJoueur"
                value={formData.idJoueur}
                onChange={handleChange}
                className="input-modern"
                placeholder="Votre ID en jeu"
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
              disabled={status === 'checking'}
              className="btn-accent w-full disabled:opacity-50"
            >
              {status === 'checking' ? 'Envoi...' : 'Envoyer ma candidature'}
            </button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              * Champs obligatoires · Une candidature par joueur
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Candidature;
