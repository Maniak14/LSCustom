import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { User, LogOut, ArrowLeft, Phone, Edit, Save, X, AlertCircle, Lock, Calendar, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Profil: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser, isUserLoggedIn, updateUser, updateUserPhoto } = useRecruitment();
  
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
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoError, setPhotoError] = useState('');

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

  const handlePhotoModalOpen = () => {
    setPhotoUrl(currentUser?.photoUrl || '');
    setPhotoError('');
    setShowPhotoModal(true);
  };

  const handlePhotoSave = async () => {
    if (!currentUser) return;

    setPhotoError('');

    // Valider l'URL (optionnel : vérifier que c'est une URL valide)
    if (photoUrl && !photoUrl.match(/^https?:\/\/.+/)) {
      setPhotoError('Veuillez entrer une URL valide (commençant par http:// ou https://)');
      return;
    }

    try {
      await updateUserPhoto(currentUser.id, photoUrl || '');
      setSuccess('Photo de profil mise à jour avec succès.');
      setShowPhotoModal(false);
      setPhotoUrl('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating photo:', err);
      setPhotoError('Erreur lors de la mise à jour de la photo.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <Avatar className="w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity" onClick={handlePhotoModalOpen}>
                <AvatarImage src={currentUser.photoUrl} alt={`${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim() || 'Profil'} />
                <AvatarFallback className="bg-muted">
                  {currentUser.prenom || currentUser.nom ? (
                    <span className="text-2xl font-medium text-muted-foreground">
                      {currentUser.prenom?.charAt(0).toUpperCase() || ''}{currentUser.nom?.charAt(0).toUpperCase() || ''}
                    </span>
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={handlePhotoModalOpen}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                title="Changer la photo de profil"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
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

              {(currentUser.prenom || currentUser.nom) && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nom complet
                  </label>
                  <p className="text-lg font-medium">
                    {currentUser.prenom && currentUser.nom
                      ? `${currentUser.prenom} ${currentUser.nom}`
                      : currentUser.prenom || currentUser.nom || '-'}
                  </p>
                </div>
              )}

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

                  {(currentUser.prenom || currentUser.nom) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentUser.prenom && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Prénom
                          </label>
                          <input
                            type="text"
                            value={currentUser.prenom}
                            className="input-modern disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled
                          />
                        </div>
                      )}
                      {currentUser.nom && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Nom
                          </label>
                          <input
                            type="text"
                            value={currentUser.nom}
                            className="input-modern disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled
                          />
                        </div>
                      )}
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

      {/* Modal pour modifier la photo de profil */}
      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la photo de profil</DialogTitle>
            <DialogDescription>
              Entrez l'URL de votre photo de profil
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {photoError && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{photoError}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">
                URL de la photo
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setPhotoError('');
                }}
                className="input-modern w-full"
                placeholder="https://exemple.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Laissez vide pour supprimer la photo de profil
              </p>
            </div>
            {photoUrl && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                <Avatar className="w-16 h-16 flex-shrink-0">
                  <AvatarImage src={photoUrl} alt="Aperçu" />
                  <AvatarFallback>
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1">Aperçu</p>
                  <p className="text-xs text-muted-foreground truncate">{photoUrl}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPhotoModal(false);
                setPhotoUrl('');
                setPhotoError('');
              }}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handlePhotoSave}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Enregistrer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profil;
