import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

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

    // Validate
    if (!formData.nomRP || !formData.prenomRP || !formData.idJoueur || !formData.motivation) {
      setStatus('error');
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Check for existing application
    if (hasActiveApplication(formData.idJoueur)) {
      setStatus('error');
      setErrorMessage('Votre candidature est déjà en traitement. Merci de patienter.');
      return;
    }

    // Submit
    const success = addApplication(formData);
    
    if (success) {
      setStatus('success');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } else {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  if (!isRecruitmentOpen) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto bg-card rounded-xl p-8 border border-border">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-4 text-foreground">
                Recrutement Fermé
              </h1>
              <p className="text-muted-foreground mb-6">
                Nous ne recrutons pas actuellement. Revenez plus tard !
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn-blue px-6 py-3 rounded-lg"
              >
                Retour à l'accueil
              </button>
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
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto bg-card rounded-xl p-8 border border-success/30">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-4 text-foreground">
                Candidature Envoyée !
              </h1>
              <p className="text-muted-foreground mb-6">
                Votre candidature a été reçue. Notre équipe l'examinera dans les plus brefs délais.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirection automatique...
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
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
                <span className="text-gradient-blue">Rejoins</span> l'équipe
              </h1>
              <p className="text-muted-foreground animate-fade-in-up-delay-1">
                Deviens mécanicien chez LS Custom's
              </p>
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="card-gradient rounded-xl p-6 md:p-8 animate-fade-in-up-delay-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Nom RP */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom RP *
                  </label>
                  <input
                    type="text"
                    name="nomRP"
                    value={formData.nomRP}
                    onChange={handleChange}
                    className="input-ls"
                    placeholder="Ex: Martinez"
                    required
                  />
                </div>

                {/* Prénom RP */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Prénom RP *
                  </label>
                  <input
                    type="text"
                    name="prenomRP"
                    value={formData.prenomRP}
                    onChange={handleChange}
                    className="input-ls"
                    placeholder="Ex: Carlos"
                    required
                  />
                </div>
              </div>

              {/* ID Joueur */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID Joueur *
                </label>
                <input
                  type="text"
                  name="idJoueur"
                  value={formData.idJoueur}
                  onChange={handleChange}
                  className="input-ls"
                  placeholder="Votre ID en jeu"
                  required
                />
              </div>

              {/* Motivation */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Motivation RP *
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  className="input-ls min-h-[120px] resize-none"
                  placeholder="Pourquoi voulez-vous rejoindre LS Custom's ? (Répondez en RP)"
                  required
                />
              </div>

              {/* Expérience */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expérience mécanique RP
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="input-ls min-h-[100px] resize-none"
                  placeholder="Décrivez votre expérience en mécanique (optionnel)"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'checking'}
                className="btn-gold w-full py-4 rounded-lg text-lg disabled:opacity-50"
              >
                {status === 'checking' ? 'Envoi en cours...' : 'Envoyer ma candidature'}
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                * Champs obligatoires • Une seule candidature active par joueur
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Candidature;
