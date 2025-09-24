import { useState } from "react";
import { Star, ThumbsUp, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Review } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

interface ReviewsSystemProps {
  boatId: number;
  showWriteReview?: boolean;
  bookingId?: number;
}

interface ReviewWithReviewer extends Review {
  reviewer: {
    firstName: string;
    lastName: string;
  };
}

export function ReviewsSystem({ boatId, showWriteReview, bookingId }: ReviewsSystemProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['/api/reviews', boatId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews?boatId=${boatId}`);
      return await response.json();
    }
  });

  const { data: stats = { averageRating: 0, totalReviews: 0, distribution: {}, serviceRating: 0, cleanlinessRating: 0, valueRating: 0 } } = useQuery({
    queryKey: ['/api/reviews/stats', boatId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/stats?boatId=${boatId}`);
      return await response.json();
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string; bookingId: number; boatId: number }) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews', boatId] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/stats', boatId] });
      setIsWriting(false);
      setRating(0);
      setComment("");
      toast({
        title: "Recensione pubblicata",
        description: "Grazie per aver condiviso la tua esperienza!"
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile pubblicare la recensione. Riprova.",
        variant: "destructive"
      });
    }
  });

  const handleSubmitReview = () => {
    if (rating === 0 || !bookingId) return;
    
    submitReviewMutation.mutate({
      rating,
      comment,
      bookingId,
      boatId
    });
  };

  const averageRating = stats?.averageRating || 0;
  const totalReviews = stats?.totalReviews || 0;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recensioni e Valutazioni</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {averageRating.toFixed(1)} ({totalReviews} recensioni)
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= averageRating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Media su {totalReviews} recensioni
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats?.distribution?.[stars] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Servizio</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{(stats?.serviceRating || 0).toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pulizia</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{(stats?.cleanlinessRating || 0).toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Valore</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{(stats?.valueRating || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review */}
      {showWriteReview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Scrivi una Recensione
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {!isWriting ? (
              <Button onClick={() => setIsWriting(true)} className="w-full">
                Lascia una Recensione
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Rating Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Valutazione Generale
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Racconta la tua esperienza
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Descrivi la tua esperienza con questa barca, il servizio del proprietario, la pulizia..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsWriting(false);
                      setRating(0);
                      setComment("");
                    }}
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={rating === 0 || submitReviewMutation.isPending}
                  >
                    {submitReviewMutation.isPending ? 'Invio...' : 'Pubblica Recensione'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review: ReviewWithReviewer) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {review.reviewer.firstName} {review.reviewer.lastName[0]}.
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <span>{new Date(review.createdAt!).toLocaleDateString('it-IT')}</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="h-auto p-1">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm leading-relaxed">{review.comment}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {reviews.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nessuna recensione ancora. Sii il primo a condividere la tua esperienza!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}