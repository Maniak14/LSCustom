import React, { useState } from 'react';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { Star, MessageSquare, Plus, X, User, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ReviewsSection: React.FC = () => {
  const { clientReviews, addClientReview, deleteReview, isUserLoggedIn, currentUser, users } = useRecruitment();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDeleteReviewDialog, setShowDeleteReviewDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const reviewsPerPage = 6;
  const [formData, setFormData] = useState({
    comment: '',
    rating: 5,
  });
  const MAX_COMMENT_LENGTH = 250;

  // Filtrer seulement les avis approuvés et les trier par date (les plus récents en premier)
  const approvedReviews = clientReviews
    .filter(review => review.status === 'approved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination des avis
  const totalReviewPages = Math.ceil(approvedReviews.length / reviewsPerPage);
  const startIndex = (currentReviewPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const paginatedReviews = approvedReviews.slice(startIndex, endIndex);

  // Réinitialiser la page si elle dépasse le nombre total de pages
  React.useEffect(() => {
    if (currentReviewPage > totalReviewPages && totalReviewPages > 0) {
      setCurrentReviewPage(1);
    }
  }, [currentReviewPage, totalReviewPages, approvedReviews.length]);

  // Vérifier si l'utilisateur a déjà un avis en attente d'approbation
  const hasPendingReview = currentUser
    ? clientReviews.some(review => review.userId === currentUser.id && review.status === 'pending')
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserLoggedIn || !currentUser) return;

    const success = await addClientReview({
      userId: currentUser.id,
      nom: currentUser.nom || '',
      prenom: currentUser.prenom || '',
      idPersonnel: currentUser.idPersonnel,
      comment: formData.comment,
      rating: formData.rating,
    });

    if (success) {
      setFormData({ comment: '', rating: 5 });
      setShowReviewForm(false);
    }
  };

  // Afficher la section même s'il n'y a pas d'avis, mais seulement les avis si connecté
  // Si pas connecté et pas d'avis, ne rien afficher
  if (!isUserLoggedIn && approvedReviews.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Avis clients
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez ce que nos clients disent de nos services
          </p>
        </div>

        {approvedReviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedReviews.map((review) => (
            <div
              key={review.id}
              className="glass-card p-6 animate-fade-up relative group"
            >
              {/* Bouton de suppression pour les utilisateurs direction et dev */}
              {(currentUser?.grade === 'direction' || currentUser?.grade === 'dev') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReviewToDelete(review.id);
                    setShowDeleteReviewDialog(true);
                  }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive transition-opacity text-[10px] z-10"
                  title="Supprimer l'avis"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                "{review.comment}"
              </p>
              <div className="flex items-center gap-2 pt-4 border-t border-border">
                {(() => {
                  const reviewUser = review.userId ? users.find(u => u.id === review.userId) : null;
                  return (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={reviewUser?.photoUrl} alt={`${review.prenom} ${review.nom}`} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {review.prenom.charAt(0).toUpperCase()}{review.nom.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  );
                })()}
                <div>
                  <p className="text-sm font-medium">
                    {review.prenom} {review.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>
            </div>
              ))}
            </div>

            {/* Pagination */}
            {totalReviewPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {currentReviewPage} sur {totalReviewPages} ({approvedReviews.length} avis{approvedReviews.length > 1 ? '' : ''})
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentReviewPage(prev => Math.max(1, prev - 1))}
                    disabled={currentReviewPage === 1}
                    className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Page précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalReviewPages }).map((_, index) => {
                      const page = index + 1;
                      // Afficher seulement la première page, la dernière, la page actuelle et celles adjacentes
                      if (
                        page === 1 ||
                        page === totalReviewPages ||
                        (page >= currentReviewPage - 1 && page <= currentReviewPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentReviewPage(page)}
                            className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                              currentReviewPage === page
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-secondary'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentReviewPage - 2 ||
                        page === currentReviewPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentReviewPage(prev => Math.min(totalReviewPages, prev + 1))}
                    disabled={currentReviewPage === totalReviewPages}
                    className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Page suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 mb-8">
            <p className="text-muted-foreground">Aucun avis pour le moment.</p>
          </div>
        )}

        {isUserLoggedIn && currentUser && !hasPendingReview && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Laisser un avis
            </button>
          </div>
        )}
        {isUserLoggedIn && currentUser && hasPendingReview && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Votre avis est en attente d'approbation
            </p>
          </div>
        )}

        {/* Formulaire d'avis */}
        <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Laisser un avis</DialogTitle>
              <DialogDescription>
                Partagez votre expérience avec LS Custom's
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Note (1-5 étoiles)
                </label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          i < formData.rating
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground/30 hover:text-accent/50'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <span>Votre avis *</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    ({formData.comment.length}/{MAX_COMMENT_LENGTH})
                  </span>
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                      setFormData(prev => ({ ...prev, comment: e.target.value }));
                    }
                  }}
                  className="input-modern min-h-[120px] resize-none"
                  placeholder="Décrivez votre expérience..."
                  required
                  maxLength={MAX_COMMENT_LENGTH}
                />
              </div>
              <DialogFooter className="gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Envoyer
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmation de suppression d'avis */}
        <Dialog open={showDeleteReviewDialog} onOpenChange={setShowDeleteReviewDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader className="text-center sm:text-left">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <DialogTitle className="text-lg sm:text-xl font-bold mb-2">
                    Supprimer l'avis
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base break-words">
                    Êtes-vous sûr de vouloir supprimer cet avis ?
                  </DialogDescription>
                </div>
              </div>
              <div className="mt-4 p-3 sm:p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-xs sm:text-sm text-destructive font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="break-words">Cette action est irréversible et supprimera définitivement l'avis de la page d'accueil.</span>
                </p>
              </div>
            </DialogHeader>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
              <button
                onClick={() => {
                  setShowDeleteReviewDialog(false);
                  setReviewToDelete(null);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors order-2 sm:order-1"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  if (reviewToDelete) {
                    try {
                      await deleteReview(reviewToDelete);
                      setShowDeleteReviewDialog(false);
                      setReviewToDelete(null);
                    } catch (error) {
                      console.error('Erreur lors de la suppression de l\'avis:', error);
                    }
                  }
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm order-1 sm:order-2"
              >
                Supprimer définitivement
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ReviewsSection;
