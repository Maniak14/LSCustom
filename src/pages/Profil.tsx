import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { User, LogOut, ArrowLeft, Phone, Edit, Save, X, AlertCircle, Lock, Calendar, Upload, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

const Profil: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser, isUserLoggedIn, updateUser, updateUserPhoto } = useRecruitment();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image.');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setError('');
    setSuccess('');

    try {
      // Upload vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Si le bucket n'existe pas, créer l'URL de base64 temporairement
        // Ou utiliser une URL publique
        console.error('Error uploading photo:', uploadError);
        
        // Fallback: convertir en base64 et stocker dans la DB
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          await updateUserPhoto(currentUser.id, base64);
          setSuccess('Photo de profil mise à jour avec succès.');
          setUploadingPhoto(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Supprimer l'ancienne photo si elle existe et n'est pas base64
      if (currentUser.photoUrl && !currentUser.photoUrl.startsWith('data:')) {
        try {
          const oldPath = currentUser.photoUrl.split('/').pop();
          if (oldPath) {
            await supabase.storage.from('avatars').remove([`profiles/${oldPath}`]);
          }
        } catch (err) {
          console.warn('Error removing old photo:', err);
        }
      }

      // Mettre à jour l'URL de la photo dans la base de données
      await updateUserPhoto(currentUser.id, publicUrl);
      setSuccess('Photo de profil mise à jour avec succès.');
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Erreur lors de l\'upload de la photo.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <Avatar className="w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity" onClick={handlePhotoClick}>
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
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                title="Changer la photo de profil"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            {uploadingPhoto && (
              <p className="text-sm text-muted-foreground mb-2">Upload en cours...</p>
            )}
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
    </div>
  );
};

export default Profil;
