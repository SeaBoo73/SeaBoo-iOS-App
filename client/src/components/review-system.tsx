import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, StarHalf, ThumbsUp, Camera, Check, MessageSquare, User, Calendar, Verified } from "lucide-react";

interface ReviewSystemProps {
  boatId: number;
  bookingId?: number;
  canReview?: boolean;
}

interface Review {
  id: number;
  bookingId: number;
  boatId: number;
  reviewerId: number;
  reviewer: {
    id: number;
    firstName: string;
    lastName: string;
    customerLevel: string;
    totalBookings: number;
  };
  rating: number;
  cleanlinessRating?: number;
  communicationRating?: number;
  locationRating?: number;
  valueRating?: number;
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  photos?: string[];
  verified: boolean;
  helpful: number;
  response?: string;
  responseDate?: string;
  createdAt: string;
}

export function ReviewSystem({ boatId, bookingId, canReview = false }: ReviewSystemProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    cleanlinessRating: 5,
    communicationRating: 5,
    locationRating: 5,
    valueRating: 5,
    title: '',
    comment: '',
    pros: [''],
    cons: [''],
    photos: [] as File[]
  });

  const { toast } = useToast();

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ['/api/reviews/boat', boatId],
    enabled: !!boatId
  });

  const { data: boatStats } = useQuery({
    queryKey: ['/api/reviews/stats', boatId],
    enabled: !!boatId
  });

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const res = await apiRequest('POST', '/api/reviews', reviewData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/boat', boatId] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/stats', boatId] });
      setShowReviewForm(false);
      setReviewForm({
        rating: 5,
        cleanlinessRating: 5,
        communicationRating: 5,
        locationRating: 5,
        valueRating: 5,
        title: '',
        comment: '',
        pros: [''],
        cons: [''],
        photos: []
      });
      toast({
        title: "Recensione pubblicata",
        description: "La tua recensione è stata pubblicata con successo"
      });
    }
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const res = await apiRequest('POST', `/api/reviews/${reviewId}/helpful`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/boat', boatId] });
    }
  });

  const renderStars = (rating: number, size = "w-4 h-4") => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className={`${size} text-yellow-400 fill-current`} />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className={`${size} text-yellow-400 fill-current`} />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className={`${size} text-gray-300`} />);
    }
    
    return stars;
  };

  const renderInteractiveStars = (currentRating: number, onChange: (rating: number) => void, name: string) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= currentRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleSubmitReview = () => {
    const reviewData = {
      boatId,
      bookingId,
      ...reviewForm
    };
    
    createReviewMutation.mutate(reviewData);
  };

  const addPro = () => {
    setReviewForm(prev => ({
      ...prev,
      pros: [...prev.pros, '']
    }));
  };

  const addCon = () => {
    setReviewForm(prev => ({
      ...prev,
      cons: [...prev.cons, '']
    }));
  };

  const updatePro = (index: number, value: string) => {
    setReviewForm(prev => ({
      ...prev,
      pros: prev.pros.map((pro, i) => i === index ? value : pro)
    }));
  };

  const updateCon = (index: number, value: string) => {
    setReviewForm(prev => ({
      ...prev,
      cons: prev.cons.map((con, i) => i === index ? value : con)
    }));
  };

  const getCustomerLevelColor = (level: string) => {
    switch (level) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const avgRating = (boatStats as any)?.averageRating || 0;
  const totalReviews = reviews?.length || 0;

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span>Recensioni e Valutazioni</span>
              </CardTitle>
              <CardDescription>
                {totalReviews} recensioni verificate dai nostri utenti
              </CardDescription>
            </div>
            {canReview && (
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Star className="mr-2 h-4 w-4" />
                    Scrivi Recensione
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Scrivi una Recensione</DialogTitle>
                    <DialogDescription>
                      Condividi la tua esperienza per aiutare altri utenti
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Overall Rating */}
                    <div>
                      <Label className="text-base font-medium">Valutazione Generale</Label>
                      {renderInteractiveStars(reviewForm.rating, (rating) => 
                        setReviewForm(prev => ({ ...prev, rating })), 'rating'
                      )}
                    </div>

                    {/* Detailed Ratings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Pulizia</Label>
                        {renderInteractiveStars(reviewForm.cleanlinessRating, (rating) => 
                          setReviewForm(prev => ({ ...prev, cleanlinessRating: rating })), 'cleanliness'
                        )}
                      </div>
                      <div>
                        <Label>Comunicazione</Label>
                        {renderInteractiveStars(reviewForm.communicationRating, (rating) => 
                          setReviewForm(prev => ({ ...prev, communicationRating: rating })), 'communication'
                        )}
                      </div>
                      <div>
                        <Label>Posizione</Label>
                        {renderInteractiveStars(reviewForm.locationRating, (rating) => 
                          setReviewForm(prev => ({ ...prev, locationRating: rating })), 'location'
                        )}
                      </div>
                      <div>
                        <Label>Rapporto Qualità/Prezzo</Label>
                        {renderInteractiveStars(reviewForm.valueRating, (rating) => 
                          setReviewForm(prev => ({ ...prev, valueRating: rating })), 'value'
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <Label htmlFor="title">Titolo della Recensione</Label>
                      <Input
                        id="title"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Riassumi la tua esperienza"
                      />
                    </div>

                    {/* Comment */}
                    <div>
                      <Label htmlFor="comment">Descrizione Dettagliata</Label>
                      <Textarea
                        id="comment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Descrivi la tua esperienza in dettaglio..."
                        rows={4}
                      />
                    </div>

                    {/* Pros */}
                    <div>
                      <Label>Aspetti Positivi</Label>
                      {reviewForm.pros.map((pro, index) => (
                        <div key={index} className="flex items-center space-x-2 mt-2">
                          <Input
                            value={pro}
                            onChange={(e) => updatePro(index, e.target.value)}
                            placeholder="Cosa ti è piaciuto?"
                          />
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addPro} className="mt-2">
                        + Aggiungi Aspetto Positivo
                      </Button>
                    </div>

                    {/* Cons */}
                    <div>
                      <Label>Aspetti da Migliorare</Label>
                      {reviewForm.cons.map((con, index) => (
                        <div key={index} className="flex items-center space-x-2 mt-2">
                          <Input
                            value={con}
                            onChange={(e) => updateCon(index, e.target.value)}
                            placeholder="Cosa potrebbe essere migliorato?"
                          />
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addCon} className="mt-2">
                        + Aggiungi Aspetto da Migliorare
                      </Button>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                        Annulla
                      </Button>
                      <Button 
                        onClick={handleSubmitReview}
                        disabled={createReviewMutation.isPending}
                      >
                        {createReviewMutation.isPending ? 'Pubblicando...' : 'Pubblica Recensione'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {renderStars(avgRating, "w-5 h-5")}
              </div>
              <div className="text-sm text-gray-600">{totalReviews} recensioni</div>
            </div>

            {/* Detailed Ratings */}
            <div className="col-span-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pulizia</span>
                  <div className="flex items-center space-x-2">
                    {renderStars((boatStats as any)?.cleanlinessAvg || 0)}
                    <span className="text-sm text-gray-600">{((boatStats as any)?.cleanlinessAvg || 0).toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Comunicazione</span>
                  <div className="flex items-center space-x-2">
                    {renderStars((boatStats as any)?.communicationAvg || 0)}
                    <span className="text-sm text-gray-600">{((boatStats as any)?.communicationAvg || 0).toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Posizione</span>
                  <div className="flex items-center space-x-2">
                    {renderStars((boatStats as any)?.locationAvg || 0)}
                    <span className="text-sm text-gray-600">{((boatStats as any)?.locationAvg || 0).toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rapporto Qualità/Prezzo</span>
                  <div className="flex items-center space-x-2">
                    {renderStars((boatStats as any)?.valueAvg || 0)}
                    <span className="text-sm text-gray-600">{((boatStats as any)?.valueAvg || 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {review.reviewer.firstName} {review.reviewer.lastName.charAt(0)}.
                            </span>
                            {review.verified && (
                              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                <Verified className="h-3 w-3 mr-1" />
                                Verificata
                              </Badge>
                            )}
                            <Badge className={getCustomerLevelColor(review.reviewer.customerLevel)}>
                              {review.reviewer.customerLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center space-x-2">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            <span>• {review.reviewer.totalBookings} prenotazioni</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">{review.rating}/5</span>
                      </div>
                    </div>

                    {/* Title */}
                    {review.title && (
                      <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                    )}

                    {/* Comment */}
                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    {/* Pros and Cons */}
                    {(review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {review.pros && review.pros.length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-700 mb-2">👍 Aspetti Positivi</h5>
                            <ul className="space-y-1">
                              {review.pros.filter(pro => pro.trim()).map((pro, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-center">
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {review.cons && review.cons.length > 0 && (
                          <div>
                            <h5 className="font-medium text-orange-700 mb-2">⚠️ Da Migliorare</h5>
                            <ul className="space-y-1">
                              {review.cons.filter(con => con.trim()).map((con, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  • {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Photos */}
                    {review.photos && review.photos.length > 0 && (
                      <div className="mb-4">
                        <div className="flex space-x-2">
                          {review.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Foto recensione ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detailed Ratings */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Pulizia</div>
                        <div className="flex justify-center">
                          {renderStars(review.cleanlinessRating || review.rating, "w-3 h-3")}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Comunicazione</div>
                        <div className="flex justify-center">
                          {renderStars(review.communicationRating || review.rating, "w-3 h-3")}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Posizione</div>
                        <div className="flex justify-center">
                          {renderStars(review.locationRating || review.rating, "w-3 h-3")}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Valore</div>
                        <div className="flex justify-center">
                          {renderStars(review.valueRating || review.rating, "w-3 h-3")}
                        </div>
                      </div>
                    </div>

                    {/* Owner Response */}
                    {review.response && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-center mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-900">Risposta del Proprietario</span>
                          {review.responseDate && (
                            <span className="text-sm text-blue-600 ml-2">
                              • {new Date(review.responseDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-blue-800">{review.response}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markHelpfulMutation.mutate(review.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Utile ({review.helpful})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna recensione ancora</h3>
              <p className="text-gray-600">Sii il primo a recensire questa imbarcazione!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}