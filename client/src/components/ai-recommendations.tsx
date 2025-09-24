import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Anchor, Clock, MapPin } from "lucide-react";

export function AIRecommendations() {
  const recommendations = [
    {
      id: 1,
      type: "Yacht",
      name: "Azimut 55",
      location: "Civitavecchia",
      price: "€850",
      rating: 4.9,
      features: ["Lusso", "Skipper incluso", "Fuel incluso"],
      reason: "Perfetto per il tuo prossimo weekend romantico",
      confidence: 96
    },
    {
      id: 2,
      type: "Barca a vela",
      name: "Bavaria 46",
      location: "Gaeta",
      price: "€320",
      rating: 4.8,
      features: ["Eco-friendly", "Esperienza autentica"],
      reason: "Ideale per la tua esperienza di vela",
      confidence: 89
    },
    {
      id: 3,
      type: "Gommone",
      name: "Zodiac Pro 650",
      location: "Anzio",
      price: "€180",
      rating: 4.7,
      features: ["Facile da guidare", "Senza patente"],
      reason: "Perfetto per esplorare le coste del Lazio",
      confidence: 92
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {recommendations.map((boat) => (
        <Card key={boat.id} className="hover:shadow-lg transition-shadow border-2 border-blue-100">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">{boat.name}</CardTitle>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {boat.location}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {boat.confidence}% match
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-coral">{boat.price}/giorno</span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{boat.rating}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {boat.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">AI suggerisce:</span> {boat.reason}
              </p>
            </div>
            
            <Button className="w-full bg-coral hover:bg-orange-600">
              Prenota ora
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}