import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { User, LogOut, ArrowLeft, Phone, Edit, Save, X, AlertCircle, Lock } from 'lucide-react';

const Profil: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser, isUserLoggedIn, updateUser } = useRecruitment();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    newTelephone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isUserLoggedIn || !currentUser) {
    navigate('/inscription');
    return null;
  }

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
    setSuccess('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      newTelephone: currentUser?.telephone || '',
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      newTelephone: '',
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Vérifier que l'ancien mot de passe est fourni
    if (!formData.oldPassword) {
      setError('Veuillez entrer votre mot de passe actuel.');
      setLoading(false);
      return;
    }

    // Vérifier que le nouveau mot de passe correspond à la confirmation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    // Vérifier que au moins un champ est modifié
    if (!formData.newPassword && formData.newTelephone === currentUser?.telephone) {
      setError('Aucune modification à apporter.');
      setLoading(false);
      return;
    }

    const success = await updateUser(
      formData.oldPassword,
      formData.newPassword || undefined,
      formData.newTelephone !== currentUser?.telephone ? formData.newTelephone : undefined
    );

    if (success) {
      setSuccess('Modifications enregistrées avec succès.');
      setTimeout(() => {
        setIsEditing(false);
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
          newTelephone: '',
        });
        setSuccess('');
      }, 2000);
    } else {
      setError('Mot de passe actuel incorrect.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Mon profil</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez vos informations personnelles
            </p>
          </div>

          {/* Profile Card */}
          <div className="glass-card mb-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  ID
                </label>
                <p className="text-lg font-medium">{currentUser.idPersonnel}</p>
              </div>

              {!isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Numéro de téléphone
                    </label>
                    <p className="text-lg font-medium">{currentUser.telephone}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Date d'inscription
                    </label>
                    <p className="text-lg font-medium">
                      {new Date(currentUser.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <button
                      onClick={handleEdit}
                      className="btn-primary flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier mes informations
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3">
                      <Save className="w-5 h-5 text-success flex-shrink-0" />
                      <p className="text-sm text-success">{success}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Mot de passe actuel *
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      className="input-modern"
                      placeholder="Votre mot de passe actuel"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nouveau mot de passe (optionnel)
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="input-modern"
                      placeholder="Laissez vide pour ne pas changer"
                    />
                  </div>

                  {formData.newPassword && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input-modern"
                        placeholder="Confirmez le nouveau mot de passe"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      name="newTelephone"
                      value={formData.newTelephone}
                      onChange={handleChange}
                      className="input-modern"
                      placeholder="Votre numéro de téléphone"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center gap-2 flex-1 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-ghost flex items-center gap-2 flex-1"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLogout}
              className="btn-ghost flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>

            <Link
              to="/"
              className="btn-primary flex items-center justify-center gap-2"
            >
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

export default Profil;
