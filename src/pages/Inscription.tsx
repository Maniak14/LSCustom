import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { UserPlus, LogIn, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

const Inscription: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser, loginUser, isUserLoggedIn } = useRecruitment();
  
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    idPersonnel: '',
    password: '',
    telephone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
    setSuccess('');
  };

  // Fonction pour capitaliser la première lettre de chaque mot
  const capitalizeName = (name: string) => {
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLogin) {
      // Connexion
      if (!formData.idPersonnel || !formData.password) {
        setError('Veuillez remplir tous les champs.');
        setLoading(false);
        return;
      }

      const success = await loginUser(formData.idPersonnel, formData.password);
      if (success) {
        navigate('/profil');
      } else {
        setError('Identifiant ou mot de passe incorrect.');
      }
    } else {
      // Inscription
      if (!formData.prenom || !formData.nom || !formData.idPersonnel || !formData.password || !formData.telephone) {
        setError('Veuillez remplir tous les champs.');
        setLoading(false);
        return;
      }

      // Capitaliser le prénom et le nom
      const capitalizedPrenom = capitalizeName(formData.prenom);
      const capitalizedNom = capitalizeName(formData.nom);

      const result = await registerUser(formData.idPersonnel, formData.password, formData.telephone, 'client', capitalizedPrenom, capitalizedNom);
      if (result && 'error' in result) {
        // Erreur de doublon
        if (result.error === 'id') {
          setError('Cet identifiant est déjà utilisé.');
        } else if (result.error === 'telephone') {
          setError('Ce numéro de téléphone est déjà utilisé.');
        }
        setLoading(false);
      } else if (result) {
        // Inscription réussie
        // Connecter automatiquement après inscription
        // Utiliser loginUser qui va chercher l'utilisateur dans le tableau users
        // Attendre un peu pour que le state soit mis à jour
        setTimeout(async () => {
          const loginSuccess = await loginUser(formData.idPersonnel, formData.password);
          if (loginSuccess) {
            navigate('/profil');
          } else {
            // Inscription réussie, basculer vers l'onglet connexion
            setSuccess('Inscription réussie ! Veuillez vous connecter.');
            setIsLogin(true);
            setLoading(false);
          }
        }, 100);
      } else {
        setError('Une erreur est survenue lors de l\'inscription.');
        setLoading(false);
      }
    }

    setLoading(false);
  };

  if (isUserLoggedIn) {
    navigate('/profil');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              {isLogin ? (
                <LogIn className="w-7 h-7 text-muted-foreground" />
              ) : (
                <UserPlus className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {isLogin ? 'Connexion' : 'Inscription'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin 
                ? 'Connectez-vous à votre compte' 
                : 'Créez votre compte pour accéder à votre profil'}
            </p>
          </div>

          {/* Toggle Inscription/Connexion */}
          <div className="flex gap-2 mb-6 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
                setFormData({ prenom: '', nom: '', idPersonnel: '', password: '', telephone: '' });
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inscription
            </button>
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setSuccess('');
                setFormData({ prenom: '', nom: '', idPersonnel: '', password: '', telephone: '' });
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Connexion
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-card">
            {success && (
              <div className="mb-4 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <p className="text-sm text-success">{success}</p>
              </div>
            )}
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prénom *</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="Votre prénom"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="Votre nom"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ID *</label>
              <input
                type="text"
                name="idPersonnel"
                value={formData.idPersonnel}
                onChange={handleChange}
                className="input-modern"
                placeholder="Votre identifiant"
                required
              />
            </div>

            {!isLogin && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Numéro de téléphone *</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="input-modern"
                  placeholder="Votre numéro de téléphone"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Mot de passe *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-modern"
                placeholder="Votre mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Traitement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
            </button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              * Champs obligatoires
            </p>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Inscription;
