import React, { useState } from 'react';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { Star, MessageSquare, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ReviewsSection: React.FC = () => {
  const { clientReviews, addClientReview, isUserLoggedIn, currentUser } = useRecruitment();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    comment: '',
    rating: 5,
  });
  const MAX_COMMENT_LENGTH = 500;

  // Filtrer seulement les avis approuvés
  const approvedReviews = clientReviews.filter(review => review.status === 'approved');

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
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Avis Clients
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez ce que nos clients disent de nos services
          </p>
        </div>

        {approvedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {approvedReviews.slice(0, 6).map((review) => (
            <div
              key={review.id}
              className="glass-card p-6 animate-fade-up"
            >
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
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {review.prenom.charAt(0).toUpperCase()}{review.nom.charAt(0).toUpperCase()}
                  </span>
                </div>
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
        ) : (
          <div className="text-center py-8 mb-8">
            <p className="text-muted-foreground">Aucun avis pour le moment.</p>
          </div>
        )}

        {isUserLoggedIn && currentUser && (
          <div className="text-center">
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Laisser un avis
            </button>
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
                <label className="block text-sm font-medium mb-2">
                  Votre avis *
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  className="input-modern min-h-[120px] resize-none"
                  placeholder="Décrivez votre expérience..."
                  required
                />
              </div>
              <DialogFooter>
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
      </div>
    </section>
  );
};

export default ReviewsSection;
