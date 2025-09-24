import { useState, useEffect } from "react";
import { MapPin, Navigation, Anchor, Star, Euro } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Boat } from "@shared/schema";

interface MapIntegrationProps {
  boats: Boat[];
  selectedBoat?: Boat | null;
  onBoatSelect?: (boat: Boat) => void;
}

export function MapIntegration({ boats, selectedBoat, onBoatSelect }: MapIntegrationProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 41.9028, lng: 12.4964 }); // Roma default

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  }, []);

  // Italian coastal locations for demo
  const italianPorts = [
    { name: "Roma", lat: 41.9028, lng: 12.4964 },
    { name: "Napoli", lat: 40.8518, lng: 14.2681 },
    { name: "Palermo", lat: 38.1157, lng: 13.3613 },
    { name: "Venezia", lat: 45.4408, lng: 12.3155 },
    { name: "Genova", lat: 44.4056, lng: 8.9463 },
    { name: "Bari", lat: 41.1171, lng: 16.8719 },
    { name: "Cagliari", lat: 39.2238, lng: 9.1217 },
    { name: "Olbia", lat: 40.9267, lng: 9.4986 },
    { name: "La Spezia", lat: 44.1026, lng: 9.8242 },
    { name: "Amalfi", lat: 40.6340, lng: 14.6026 }
  ];

  const getPortLocation = (portName: string) => {
    const port = italianPorts.find(p => 
      p.name.toLowerCase().includes(portName.toLowerCase()) ||
      portName.toLowerCase().includes(p.name.toLowerCase())
    );
    return port || italianPorts[0]; // Default to Roma
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const boatsWithLocation = boats.map(boat => {
    const location = getPortLocation(boat.port);
    const distance = userLocation 
      ? calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng)
      : 0;
    
    return {
      ...boat,
      location,
      distance
    };
  });

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mappa Interattiva Barche
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {userLocation ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="h-4 w-4" />
              Posizione rilevata: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Mappa centrata su Roma (attiva geolocalizzazione per vedere la tua posizione)
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area (Simplified visual representation) */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="relative h-96 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 rounded-lg overflow-hidden">
                {/* Map background */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 400 300" className="w-full h-full">
                    {/* Simplified Italy coastline */}
                    <path 
                      d="M120 50 L140 60 L160 80 L180 120 L200 180 L190 220 L160 240 L140 260 L120 280 L100 260 L80 240 L60 220 L50 180 L60 120 L80 80 L100 60 Z" 
                      fill="rgba(34, 197, 94, 0.3)" 
                      stroke="rgba(34, 197, 94, 0.6)" 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                
                {/* Boat markers */}
                {boatsWithLocation.slice(0, 8).map((boat, index) => {
                  const x = 50 + (index % 4) * 80;
                  const y = 50 + Math.floor(index / 4) * 100;
                  
                  return (
                    <div
                      key={boat.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                        selectedBoat?.id === boat.id 
                          ? 'scale-125 z-10' 
                          : 'hover:scale-110'
                      }`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onClick={() => onBoatSelect?.(boat)}
                    >
                      <div className={`p-2 rounded-full shadow-lg ${
                        selectedBoat?.id === boat.id 
                          ? 'bg-orange-500' 
                          : 'bg-white hover:bg-blue-50'
                      }`}>
                        <Anchor className={`h-5 w-5 ${
                          selectedBoat?.id === boat.id 
                            ? 'text-white' 
                            : 'text-blue-600'
                        }`} />
                      </div>
                      
                      {/* Price tag */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-white text-blue-600 border border-blue-200 whitespace-nowrap">
                          €{boat.pricePerDay}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                
                {/* User location marker */}
                {userLocation && (
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '50%', top: '50%' }}
                  >
                    <div className="p-2 bg-red-500 rounded-full shadow-lg animate-pulse">
                      <Navigation className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                
                {/* Map controls */}
                <div className="absolute top-4 right-4 space-y-2">
                  <Button size="sm" variant="secondary" className="bg-white/90">
                    Zoom +
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/90">
                    Zoom -
                  </Button>
                </div>
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span>Barche disponibili</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Barca selezionata</span>
                    </div>
                    {userLocation && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>La tua posizione</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Boat List Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Barche Vicine</CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {boatsWithLocation
                  .sort((a, b) => a.distance - b.distance)
                  .slice(0, 10)
                  .map((boat) => (
                    <div
                      key={boat.id}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedBoat?.id === boat.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => onBoatSelect?.(boat)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{boat.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {boat.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{boat.port}</span>
                          {userLocation && (
                            <span>• {boat.distance.toFixed(1)} km</span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">4.6</span>
                            <span className="text-xs text-muted-foreground">
                              ({Math.floor(Math.random() * 50) + 5} recensioni)
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium text-sm">€{boat.pricePerDay}</div>
                            <div className="text-xs text-muted-foreground">/giorno</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Selected Boat Details */}
          {selectedBoat && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Barca Selezionata</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedBoat.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedBoat.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ospiti:</span>
                    <div className="font-medium">{selectedBoat.maxPersons}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Porto:</span>
                    <div className="font-medium">{selectedBoat.port}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prezzo:</span>
                    <div className="font-medium">€{selectedBoat.pricePerDay}/giorno</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <div className="font-medium">{selectedBoat.type}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full" size="sm">
                    Vedi Dettagli
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    Prenota Ora
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}