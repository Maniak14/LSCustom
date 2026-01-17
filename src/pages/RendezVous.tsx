import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { AlertCircle, CheckCircle, XCircle, ArrowLeft, Clock, Calendar, User, Phone, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RendezVous: React.FC = () => {
  const navigate = useNavigate();
  const {
    isUserLoggedIn,
    currentUser,
    appointments,
    addAppointment,
    hasPendingAppointment,
    users,
  } = useRecruitment();

  const [formData, setFormData] = useState({
    directionUserId: '',
    dateTime: '',
    reason: '',
  });
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  // Synchroniser la date et l'heure avec formData.dateTime
  useEffect(() => {
    if (selectedDate && selectedHour && selectedMinute) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateTimeString = `${year}-${month}-${day}T${selectedHour}:${selectedMinute}`;
      setFormData(prev => ({
        ...prev,
        dateTime: dateTimeString,
      }));
    }
  }, [selectedDate, selectedHour, selectedMinute]);

  // Initialiser depuis formData.dateTime si existe (seulement au montage)
  useEffect(() => {
    if (formData.dateTime) {
      const date = new Date(formData.dateTime);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setSelectedHour(String(date.getHours()).padStart(2, '0'));
        setSelectedMinute(String(date.getMinutes()).padStart(2, '0'));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                Vous devez être connecté pour prendre rendez-vous.
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

  // Obtenir les membres de la direction
  const directionUsers = users.filter(user => user.grade === 'direction');

  // Obtenir les rendez-vous de l'utilisateur connecté
  const userAppointments = appointments
    .filter(appointment => appointment.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const totalPages = Math.ceil(userAppointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const endIndex = startIndex + appointmentsPerPage;
  const paginatedAppointments = userAppointments.slice(startIndex, endIndex);

  const hasPending = hasPendingAppointment(currentUser.id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage('');
  };

  const formatDateTimeDisplay = () => {
    if (selectedDate && selectedHour && selectedMinute) {
      return new Date(`${selectedDate.toISOString().split('T')[0]}T${selectedHour}:${selectedMinute}`).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return 'Sélectionner une date et une heure';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    if (!formData.directionUserId || !formData.dateTime || !formData.reason) {
      setStatus('error');
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!currentUser.telephone) {
      setStatus('error');
      setErrorMessage('Votre numéro de téléphone est requis pour prendre rendez-vous.');
      return;
    }

    if (hasPending) {
      setStatus('error');
      setErrorMessage('Vous avez déjà un rendez-vous en attente ou accepté.');
      return;
    }

    try {
      const success = await addAppointment({
        userId: currentUser.id,
        idPersonnel: currentUser.idPersonnel,
        nom: currentUser.nom || '',
        prenom: currentUser.prenom || '',
        telephone: currentUser.telephone,
        directionUserId: formData.directionUserId,
        dateTime: new Date(formData.dateTime),
        reason: formData.reason,
      });

      if (success) {
        setStatus('success');
        setFormData({
          directionUserId: '',
          dateTime: '',
          reason: '',
        });
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setErrorMessage('Vous avez déjà un rendez-vous en attente ou accepté.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      console.error('Error submitting appointment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente', className: 'bg-accent/20 text-accent', icon: Clock };
      case 'accepted':
        return { label: 'Accepté', className: 'bg-success/20 text-success', icon: CheckCircle };
      case 'rejected':
        return { label: 'Refusé', className: 'bg-destructive/20 text-destructive', icon: XCircle };
      case 'completed':
        return { label: 'Terminé', className: 'bg-primary/20 text-primary', icon: CheckCircle };
      case 'cancelled':
        return { label: 'Annulé', className: 'bg-muted text-muted-foreground', icon: XCircle };
      default:
        return { label: status, className: 'bg-muted text-muted-foreground', icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4 animate-fade-up">
              Rendez-vous
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight animate-fade-up-1">
              Prendre rendez-vous
            </h1>
            <p className="mt-4 text-muted-foreground animate-fade-up-2">
              Réservez un créneau avec un membre de la direction
            </p>
          </div>

          {/* Success Message */}
          {status === 'success' && (
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3 animate-fade-up">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <p className="text-sm text-success">Votre demande de rendez-vous a été envoyée avec succès.</p>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-fade-up">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          {/* Warning si déjà un RDV en attente */}
          {hasPending && (
            <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3 animate-fade-up">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
              <p className="text-sm text-accent">Vous avez déjà un rendez-vous en attente ou accepté. Un seul rendez-vous à la fois.</p>
            </div>
          )}

          {/* Formulaire de rendez-vous */}
          {!hasPending && (
            <form onSubmit={handleSubmit} className="glass-card mb-8 animate-fade-up-3">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Membre de la direction *
                  </label>
                  <Select
                    value={formData.directionUserId || undefined}
                    onValueChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        directionUserId: value,
                      }));
                      setErrorMessage('');
                    }}
                    required
                    disabled={status === 'submitting'}
                  >
                    <SelectTrigger className="input-modern h-auto py-3.5">
                      <SelectValue placeholder="Sélectionner un membre de la direction" />
                    </SelectTrigger>
                    <SelectContent className="scrollbar-hide">
                      {directionUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.prenom && user.nom
                            ? `${user.prenom} ${user.nom}`
                            : user.idPersonnel}
                          {user.telephone && ` - ${user.telephone}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date et heure *
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal input-modern h-auto py-3.5",
                          !selectedDate && "text-muted-foreground"
                        )}
                        disabled={status === 'submitting'}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDateTimeDisplay()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-4">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <label className="block text-xs font-medium mb-2">Heure</label>
                            <Select
                              value={selectedHour}
                              onValueChange={setSelectedHour}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="scrollbar-hide max-h-[200px]">
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem key={i} value={String(i).padStart(2, '0')}>
                                    {String(i).padStart(2, '0')}h
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-2">Minutes</label>
                            <Select
                              value={selectedMinute}
                              onValueChange={setSelectedMinute}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="scrollbar-hide max-h-[200px]">
                                {['00', '15', '30', '45'].map((min) => (
                                  <SelectItem key={min} value={min}>
                                    {min}min
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Raison du rendez-vous *
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="input-modern min-h-[120px] resize-none"
                    placeholder="Décrivez la raison de votre rendez-vous..."
                    required
                    disabled={status === 'submitting'}
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Identifiant:</span>
                      <span className="font-medium">{currentUser.idPersonnel}</span>
                    </div>
                    {currentUser.prenom && currentUser.nom && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Nom:</span>
                        <span className="font-medium">{currentUser.prenom} {currentUser.nom}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Téléphone:</span>
                      <span className="font-medium">{currentUser.telephone}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting' || hasPending}
                  className="btn-accent w-full disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Envoi...' : 'Demander un rendez-vous'}
                </button>

                <p className="text-xs text-center text-muted-foreground">
                  * Champs obligatoires · Un rendez-vous à la fois
                </p>
              </div>
            </form>
          )}

          {/* Historique des rendez-vous */}
          {userAppointments.length > 0 && (
            <div className="glass-card animate-fade-up">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Historique de mes rendez-vous</h2>
              </div>
              <div className="space-y-3">
                {paginatedAppointments.map((appointment) => {
                  const statusBadge = getStatusBadge(appointment.status);
                  const StatusIcon = statusBadge.icon;
                  const directionUser = users.find(u => u.id === appointment.directionUserId);
                  return (
                    <div
                      key={appointment.id}
                      className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.className} flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                          </div>
                          {directionUser && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <User className="w-3 h-3" />
                              <span>
                                {directionUser.prenom && directionUser.nom
                                  ? `${directionUser.prenom} ${directionUser.nom}`
                                  : directionUser.idPersonnel}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(appointment.dateTime).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {appointment.reason && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {appointment.reason}
                            </p>
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
                    Page {currentPage} sur {totalPages} ({userAppointments.length} rendez-vous{userAppointments.length > 1 ? '' : ''})
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
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RendezVous;
