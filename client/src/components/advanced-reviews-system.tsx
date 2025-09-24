import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, ThumbsUp, MessageCircle, Filter, TrendingUp, Verified } from "lucide-react";

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
    verified: boolean;
    trips: number;
  };
  rating: number;
  date: string;
  boatName: string;
  title: string;
  content: string;
  helpful: number;
  photos?: string[];
  categories: {
    cleanliness: number;
    communication: number;
    accuracy: number;
    value: number;
  };
}

export function AdvancedReviewsSystem() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "recent" | "verified" | "photos">("all");

  const reviews: Review[] = [
    {
      id: "1",
      user: {
        name: "Marco Rossi",
        verified: true,
        trips: 12
      },
      rating: 5,
      date: "2025-01-20",
      boatName: "Beneteau Oceanis 46",
      title: "Esperienza fantastica con famiglia",
      content: "Barca perfetta per una settimana in famiglia. Proprietario disponibilissimo, barca pulitissima e ben equipaggiata. Le Pontine sono state indimenticabili! Sicuramente torneremo.",
      helpful: 24,
      photos: ["/attached_assets/review-1.jpg"],
      categories: {
        cleanliness: 5,
        communication: 5,
        accuracy: 5,
        value: 4
      }
    },
    {
      id: "2", 
      user: {
        name: "Giulia Bianchi",
        verified: true,
        trips: 8
      },
      rating: 5,
      date: "2025-01-18",
      boatName: "Jeanneau Cap Camarat",
      title: "Weekend perfetto tra amici",
      content: "Gommone veloce e divertente! Check-in super rapido, tutto come da descrizione. Il proprietario ci ha dato ottimi consigli sui posti da visitare. Consigliato!",
      helpful: 18,
      categories: {
        cleanliness: 5,
        communication: 5,
        accuracy: 5,
        value: 5
      }
    },
    {
      id: "3",
      user: {
        name: "Alessandro Verde",
        verified: false,
        trips: 3
      },
      rating: 4,
      date: "2025-01-15",
      boatName: "Bavaria Cruiser 37",
      title: "Buona esperienza complessiva",
      content: "Barca in buone condizioni, qualche piccolo problema con l'elettronica ma niente di grave. Il proprietario molto cordiale e disponibile per risolvere ogni questione.",
      helpful: 12,
      categories: {
        cleanliness: 4,
        communication: 5,
        accuracy: 4,
        value: 4
      }
    }
  ];

  const averageRating = 4.8;
  const totalReviews = 156;

  const ratingDistribution = [
    { stars: 5, count: 98, percentage: 63 },
    { stars: 4, count: 42, percentage: 27 },
    { stars: 3, count: 12, percentage: 8 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 1, percentage: 1 }
  ];

  const filteredReviews = reviews.filter(review => {
    switch (selectedFilter) {
      case "recent":
        return new Date(review.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      case "verified":
        return review.user.verified;
      case "photos":
        return review.photos && review.photos.length > 0;
      default:
        return true;
    }
  });

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? "text-yellow-500 fill-current" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Valutazioni e Recensioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Overview */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating}</div>
              {renderStars(Math.round(averageRating), "md")}
              <p className="text-sm text-gray-600 mt-2">{totalReviews} recensioni</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-sm w-8">{item.stars}★</span>
                  <Progress value={item.percentage} className="flex-1 h-2" />
                  <span className="text-sm text-gray-600 w-12">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtra per:</span>
        {[
          { key: "all", label: "Tutte", icon: null },
          { key: "recent", label: "Recenti", icon: TrendingUp },
          { key: "verified", label: "Verificate", icon: Verified },
          { key: "photos", label: "Con foto", icon: MessageCircle }
        ].map((filter) => {
          const Icon = filter.icon;
          return (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.key as any)}
              className="flex items-center gap-1"
            >
              {Icon && <Icon className="h-4 w-4" />}
              {filter.label}
            </Button>
          );
        })}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {review.user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                      {review.user.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Verified className="h-3 w-3 mr-1" />
                          Verificato
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{review.user.trips} viaggi • {review.date}</p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                <p className="text-gray-700 leading-relaxed">{review.content}</p>
                <p className="text-sm text-blue-600 mt-2 font-medium">Barca: {review.boatName}</p>
              </div>

              {/* Category Ratings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                {Object.entries(review.categories).map(([category, rating]) => (
                  <div key={category} className="text-center">
                    <p className="text-xs text-gray-600 mb-1 capitalize">
                      {category === "cleanliness" ? "Pulizia" :
                       category === "communication" ? "Comunicazione" :
                       category === "accuracy" ? "Precisione" : "Rapporto qualità/prezzo"}
                    </p>
                    <div className="text-sm font-semibold">{rating}/5</div>
                  </div>
                ))}
              </div>

              {/* Review Actions */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Utile ({review.helpful})
                </Button>
                {review.photos && review.photos.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    📸 {review.photos.length} foto
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="px-8">
          Carica altre recensioni
        </Button>
      </div>
    </div>
  );
}