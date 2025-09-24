import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Users, MapPin, Clock, AlertCircle } from "lucide-react";
import { Boat } from "@shared/schema";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BoatCardProps {
  boat: Boat;
}

export function BoatCard({ boat }: BoatCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${boat.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { boatId: boat.id });
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      favoriteMutation.mutate();
    }
  };

  const getBadgeColor = () => {
    switch (boat.type) {
      case "yacht":
        return "bg-coral text-white";
      case "catamarano":
        return "bg-deep-navy text-white";
      case "gommone":
        return "bg-yellow-500 text-white";
      default:
        return "bg-seafoam text-white";
    }
  };

  const getTypeLabel = () => {
    const labels: { [key: string]: string } = {
      gommone: "Gommone",
      yacht: "Yacht",
      catamarano: "Catamarano",
      jetski: "Moto d'acqua",
      sailboat: "Barca a vela",
      kayak: "Kayak",
      charter: "Charter",
      houseboat: "Houseboat",
      "barche-senza-patente": "Barche senza patente",
      "motorboat": "Barche a motore",
      "gulet": "Gulet"
    };
    return labels[boat.type] || boat.type;
  };

  return (
    <Link href={`/boats/${boat.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
        <div className="relative">
          <img
            src={boat.images?.[0] || "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"}
            alt={boat.name}
            className="w-full h-48 object-cover"
          />
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${getBadgeColor()}`}>
            {getTypeLabel()}
          </div>
          {user && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3 w-8 h-8 p-0 bg-white rounded-full hover:scale-110 transition-transform"
              onClick={handleFavoriteClick}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} 
              />
            </Button>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{boat.name}</h3>
            <div className="flex items-center ml-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">4.8</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{boat.port}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <Users className="h-4 w-4 mr-1" />
            <span>Fino a {boat.maxPersons} persone</span>
            {boat.length && (
              <>
                <span className="mx-2">•</span>
                <span>{boat.length}m</span>
              </>
            )}
          </div>

          {/* Orari per barche senza patente e charter */}
          {(boat.type === "barche-senza-patente" || boat.type === "charter" || boat.type === "gommone") && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
              <div className="flex items-center text-blue-800 text-xs mb-1">
                <Clock className="h-3 w-3 mr-1" />
                <span className="font-semibold">Orari di utilizzo</span>
              </div>
              <div className="text-blue-700 text-xs">
                <div>Ritiro: {boat.pickupTime || "09:00"} - Riconsegna: {boat.returnTime || "18:00"}</div>
                {boat.dailyReturnRequired && (
                  <div className="flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>Rientro serale obbligatorio ogni giorno</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-gray-900">€{boat.pricePerDay}</span>
              <span className="text-gray-600 text-sm"> al giorno</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Disponibile
            </Badge>
          </div>
          
          <div className="mt-4 space-y-2">
            <Button 
              className="w-full bg-ocean-blue hover:bg-blue-600" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // If user is logged in, proceed to booking
                if (user) {
                  window.location.href = `/boats/${boat.id}`;
                } else {
                  // Redirect to login with redirect parameter
                  window.location.href = `/auth?redirect=/boats/${boat.id}`;
                }
              }}
              data-testid="button-prenota-now"
            >
              Prenota ora
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
