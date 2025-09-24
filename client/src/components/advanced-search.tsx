import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Filter, MapPin, Calendar as CalendarIcon, Users, Anchor, Wifi, Shield, Music } from "lucide-react";
import { format } from "date-fns";

export function AdvancedSearch() {
  const [searchParams, setSearchParams] = useState({
    type: "",
    location: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    maxPersons: "",
    features: [] as string[],
    priceRange: [0, 1000],
    equipment: [] as string[]
  });

  const [searchResults, setSearchResults] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (params: any) => {
      const res = await apiRequest('POST', '/api/boats/search/advanced', params);
      return await res.json();
    },
    onSuccess: (data: any) => {
      setSearchResults(data);
      toast({
        title: "Ricerca completata",
        description: `Trovate ${data.boats.length} imbarcazioni corrispondenti ai tuoi criteri`,
      });
    },
    onError: () => {
      toast({
        title: "Errore nella ricerca",
        description: "Impossibile completare la ricerca. Riprova.",
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    const params = {
      ...searchParams,
      startDate: searchParams.startDate?.toISOString(),
      endDate: searchParams.endDate?.toISOString(),
      maxPersons: searchParams.maxPersons ? parseInt(searchParams.maxPersons) : undefined
    };
    searchMutation.mutate(params);
  };

  const toggleFeature = (feature: string) => {
    setSearchParams(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const toggleEquipment = (equipment: string) => {
    setSearchParams(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const availableFeatures = [
    { id: "gps", label: "GPS Navigation", icon: MapPin },
    { id: "wifi", label: "WiFi", icon: Wifi },
    { id: "music", label: "Impianto Audio", icon: Music },
    { id: "fridge", label: "Frigorifero", icon: Shield },
    { id: "shower", label: "Doccia", icon: Shield },
    { id: "toilet", label: "WC", icon: Shield },
    { id: "awning", label: "Tendalino", icon: Shield },
    { id: "snorkel", label: "Attrezzatura Snorkeling", icon: Shield }
  ];

  const safetyEquipment = [
    "Giubbotti Salvagente",
    "Estintore",
    "Kit Primo Soccorso",
    "Razzi di Segnalazione",
    "Radio VHF",
    "Ancora di Emergenza",
    "Boetta Salvagente",
    "Scaletta di Risalita"
  ];

  const boatTypes = [
    { value: "gommone", label: "Gommone" },
    { value: "barche-senza-patente", label: "Barche senza Patente" },
    { value: "yacht", label: "Yacht" },
    { value: "catamarano", label: "Catamarano" },
    { value: "jetski", label: "Moto d'Acqua" },
    { value: "sailboat", label: "Barca a Vela" },
    { value: "charter", label: "Charter" },
    { value: "houseboat", label: "Casa Galleggiante" }
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Ricerca Avanzata Imbarcazioni</span>
          </CardTitle>
          <CardDescription>
            Trova l'imbarcazione perfetta con filtri dettagliati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Boat Type */}
            <div>
              <Label>Tipo di Imbarcazione</Label>
              <Select value={searchParams.type} onValueChange={(value) => 
                setSearchParams(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {boatTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-black hover:bg-gray-100">
                      <span className="text-black font-medium">{type.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label>Località</Label>
              <Input
                placeholder="Es. Civitavecchia, Gaeta..."
                value={searchParams.location}
                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            {/* Start Date */}
            <div>
              <Label>Data Inizio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchParams.startDate ? format(searchParams.startDate, "dd/MM/yyyy") : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={searchParams.startDate}
                    onSelect={(date) => setSearchParams(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div>
              <Label>Data Fine</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchParams.endDate ? format(searchParams.endDate, "dd/MM/yyyy") : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={searchParams.endDate}
                    onSelect={(date) => setSearchParams(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            {/* Max Persons */}
            <div className="flex-1">
              <Label>Numero Persone</Label>
              <Input
                type="number"
                placeholder="Es. 8"
                value={searchParams.maxPersons}
                onChange={(e) => setSearchParams(prev => ({ ...prev, maxPersons: e.target.value }))}
              />
            </div>

            {/* Toggle Advanced Filters */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="mt-6"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtri Avanzati
            </Button>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              disabled={searchMutation.isPending}
              className="mt-6"
            >
              {searchMutation.isPending ? "Ricerca..." : "Cerca"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filtri Avanzati</CardTitle>
            <CardDescription>Personalizza la tua ricerca con criteri specifici</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Range */}
            <div>
              <Label>Fascia di Prezzo (€/giorno)</Label>
              <div className="px-3 py-2">
                <Slider
                  value={searchParams.priceRange}
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, priceRange: value }))}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>€{searchParams.priceRange[0]}</span>
                  <span>€{searchParams.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <Label>Comfort e Servizi</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {availableFeatures.map(feature => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.id}
                      checked={searchParams.features.includes(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                    />
                    <Label htmlFor={feature.id} className="text-sm flex items-center">
                      <feature.icon className="w-3 h-3 mr-1" />
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Equipment */}
            <div>
              <Label>Equipaggiamento di Sicurezza</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {safetyEquipment.map(equipment => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={searchParams.equipment.includes(equipment)}
                      onCheckedChange={() => toggleEquipment(equipment)}
                    />
                    <Label htmlFor={equipment} className="text-sm">
                      {equipment}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      {(searchParams.features.length > 0 || searchParams.equipment.length > 0 || searchParams.type) && (
        <Card>
          <CardHeader>
            <CardTitle>Filtri Attivi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchParams.type && (
                <Badge variant="secondary">
                  Tipo: {boatTypes.find(t => t.value === searchParams.type)?.label}
                </Badge>
              )}
              {searchParams.location && (
                <Badge variant="secondary">
                  <MapPin className="w-3 h-3 mr-1" />
                  {searchParams.location}
                </Badge>
              )}
              {searchParams.maxPersons && (
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {searchParams.maxPersons} persone
                </Badge>
              )}
              {searchParams.features.map(feature => (
                <Badge key={feature} variant="outline">
                  {availableFeatures.find(f => f.id === feature)?.label}
                </Badge>
              ))}
              {searchParams.equipment.map(equipment => (
                <Badge key={equipment} variant="outline">
                  <Shield className="w-3 h-3 mr-1" />
                  {equipment}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Risultati della Ricerca</CardTitle>
            <CardDescription>
              {(searchResults as any).total} imbarcazioni trovate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(searchResults as any).boats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(searchResults as any).boats.map((boat: any) => (
                  <Card key={boat.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{boat.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center space-x-2">
                          <Anchor className="w-4 h-4" />
                          <span>{boat.type}</span>
                          <span>•</span>
                          <MapPin className="w-4 h-4" />
                          <span>{boat.port}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Capacità:</span>
                          <span className="font-medium">{boat.maxPersons} persone</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Prezzo:</span>
                          <span className="font-bold text-green-600">€{boat.pricePerDay}/giorno</span>
                        </div>
                        {boat.length && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Lunghezza:</span>
                            <span className="font-medium">{boat.length}m</span>
                          </div>
                        )}
                        <Button className="w-full mt-4">
                          Visualizza Dettagli
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Anchor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nessuna imbarcazione trovata con questi criteri</p>
                <p className="text-sm text-gray-400 mt-2">
                  Prova a modificare i filtri di ricerca
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}