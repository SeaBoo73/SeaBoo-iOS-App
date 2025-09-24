import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PortSelector } from "@/components/port-selector";
import { MapPin, Calendar as CalendarIcon, Users, Search, Ship, UserCheck, Fuel, SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useLocation } from "wouter";

interface SearchFiltersProps {
  onSearch?: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  location: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  guests: number;
  boatTypes?: string[];
  skipperRequired?: boolean;
  experienceMode?: boolean;
}

export function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    startDate: undefined,
    endDate: undefined,
    guests: 2,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [fuelPolicyOpen, setFuelPolicyOpen] = useState(false);

  const handleSearch = () => {
    console.log("Search with filters:", filters);
    if (onSearch) {
      onSearch(filters);
    } else {
      // Navigate to search results page
      const searchParams = new URLSearchParams();
      
      if (filters.location) searchParams.set("location", filters.location);
      if (filters.startDate) searchParams.set("startDate", filters.startDate.toISOString());
      if (filters.endDate) searchParams.set("endDate", filters.endDate.toISOString());
      if (filters.guests) searchParams.set("guests", filters.guests.toString());
      if (filters.boatTypes && filters.boatTypes.length > 0) {
        searchParams.set("boatTypes", filters.boatTypes.join(","));
      }
      if (filters.skipperRequired) searchParams.set("skipperRequired", "true");
      if (filters.experienceMode) searchParams.set("experienceMode", "true");
      
      setLocation(`/search?${searchParams.toString()}`);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    console.log(`Updating ${key} with value:`, value);
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      console.log('New filters state:', newFilters);
      return newFilters;
    });
  };

  return (
    <div className={onSearch ? "space-y-4" : "bg-white rounded-2xl shadow-2xl p-6 max-w-5xl mx-auto"}>
      <div className={onSearch ? "space-y-4" : "grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4"}>
        {/* Location */}
        <div className="space-y-2">
          <Label className="block text-sm font-semibold text-gray-900">
            {onSearch ? "Porto" : "Dove"}
          </Label>
          <PortSelector
            value={filters.location}
            onChange={(port) => updateFilter("location", port)}
            placeholder={onSearch ? "Tutti i porti" : "Seleziona porto..."}
          />
        </div>

        {/* Check-in */}
        <div className="space-y-2">
          <Label className="block text-sm font-semibold text-gray-900">Dal</Label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal hover:bg-gray-50 text-gray-900"
                onClick={() => {
                  console.log("Start date button clicked");
                  setStartDateOpen(true);
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? (
                  <span className="text-gray-900 font-medium">{format(new Date(filters.startDate), "dd/MM/yyyy")}</span>
                ) : (
                  <span className="text-gray-500">Seleziona data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={filters.startDate ? new Date(filters.startDate) : undefined}
                onSelect={(date) => {
                  console.log("Start date selected:", date);
                  if (date) {
                    updateFilter("startDate", date);
                    // Auto-set end date to same date if not already set (for single day rental)
                    if (!filters.endDate) {
                      updateFilter("endDate", date);
                    }
                    setStartDateOpen(false);
                    console.log("Start date popover closed");
                  }
                }}
                disabled={(date) => date < new Date(Date.now() - 24 * 60 * 60 * 1000)}
                initialFocus
                className="rounded-md border calendar"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div className="space-y-2">
          <Label className="block text-sm font-semibold text-gray-900">Al</Label>
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal hover:bg-gray-50 text-gray-900"
                onClick={() => {
                  console.log("End date button clicked");
                  setEndDateOpen(true);
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? (
                  <span className="text-gray-900 font-medium">{format(new Date(filters.endDate), "dd/MM/yyyy")}</span>
                ) : (
                  <span className="text-gray-500">{filters.startDate ? "Stessa data" : "Seleziona data"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={filters.endDate ? new Date(filters.endDate) : undefined}
                onSelect={(date) => {
                  console.log("End date selected:", date);
                  if (date) {
                    updateFilter("endDate", date);
                    setEndDateOpen(false);
                    console.log("End date popover closed");
                  }
                }}
                disabled={(date) => {
                  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                  if (date < yesterday) return true;
                  if (filters.startDate && date < filters.startDate) return true; // Allow same date
                  return false;
                }}
                initialFocus
                className="rounded-md border calendar"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <Label className="block text-sm font-semibold text-gray-900">Ospiti</Label>
          <Select onValueChange={(value) => updateFilter("guests", parseInt(value))}>
            <SelectTrigger className="text-gray-900">
              <Users className="mr-2 h-4 w-4" />
              <SelectValue placeholder={`${filters.guests} ospiti`} className="text-gray-900" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {Array.from({ length: 29 }, (_, i) => i + 2).map((num) => (
                <SelectItem key={num} value={num.toString()} className="text-black hover:bg-gray-100">
                  <span className="text-black font-medium">{num} ospiti</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Advanced Filters */}
      <div className={onSearch ? "mt-0" : "mt-4"}>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={showAdvanced ? "bg-gray-100 text-gray-900" : "text-gray-900 hover:bg-gray-50"}
          >
            <Ship className="mr-2 h-4 w-4" />
            <span className="text-gray-900">Tipo imbarcazione</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter("skipperRequired", !filters.skipperRequired)}
            className={filters.skipperRequired ? "bg-blue-100 text-blue-700 border-blue-300" : "text-gray-900 hover:bg-gray-50"}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            <span className={filters.skipperRequired ? "text-blue-700" : "text-gray-900"}>Con Skipper</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter("experienceMode", !filters.experienceMode)}
            className={filters.experienceMode ? "bg-orange-100 text-orange-700 border-orange-300" : "text-gray-900 hover:bg-gray-50"}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <span className={filters.experienceMode ? "text-orange-700" : "text-gray-900"}>Esperienze o charter</span>
          </Button>
        </div>

        {showAdvanced && (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">Tipo di imbarcazione</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {[
                    { value: "kayak", label: "Caiacco" },
                    { value: "jetski", label: "Moto d'acqua" },
                    { value: "barche-senza-patente", label: "Barche senza patente" },
                    { value: "gommone", label: "Gommoni" },
                    { value: "motorboat", label: "Barche a motore" },
                    { value: "sailboat", label: "Barche a vela" },
                    { value: "catamarano", label: "Catamarani" },
                    { value: "charter", label: "Charter" },
                    { value: "houseboat", label: "Houseboat" },
                    { value: "gulet", label: "Gulet" },
                    { value: "yacht", label: "Yacht" }
                  ].map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded border border-gray-200 bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={filters.boatTypes?.includes(type.value) || false}
                        onChange={(e) => {
                          const currentTypes = filters.boatTypes || [];
                          if (e.target.checked) {
                            updateFilter("boatTypes", [...currentTypes, type.value]);
                            // Auto-close advanced filters when a type is selected
                            setTimeout(() => setShowAdvanced(false), 300);
                          } else {
                            updateFilter("boatTypes", currentTypes.filter(t => t !== type.value));
                          }
                        }}
                        className="rounded border-gray-300 text-coral focus:ring-coral"
                      />
                      <span className="text-sm text-gray-900 font-medium">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        )}
      
        {/* Selected Boat Types Display - Outside of advanced filters */}
        {filters.boatTypes && filters.boatTypes.length > 0 && (
          <div className="mt-4">
            <Label className="text-sm font-semibold text-gray-900 block mb-2">
              Tipologie selezionate:
            </Label>
            <div className="flex flex-wrap gap-2">
              {filters.boatTypes.map((type) => {
                const typeNames = {
                  "gommone": "Gommoni",
                  "barche-senza-patente": "Barche senza patente", 
                  "yacht": "Yacht",
                  "sailboat": "Barche a vela",
                  "catamarano": "Catamarani",
                  "motorboat": "Barche a motore",
                  "jetski": "Moto d'acqua",
                  "charter": "Charter",
                  "houseboat": "Houseboat",
                  "gulet": "Gulet",
                  "kayak": "Caiacco"
                };
                return (
                  <Badge key={type} variant="secondary" className="mr-2">
                    {typeNames[type as keyof typeof typeNames] || type}
                    <button
                      onClick={() => {
                        const newTypes = filters.boatTypes?.filter(t => t !== type) || [];
                        updateFilter("boatTypes", newTypes.length > 0 ? newTypes : undefined);
                      }}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => updateFilter("boatTypes", undefined)}
              >
                Cancella tutto
              </Badge>
            </div>
          </div>
        )}

        {/* Search Button - After all filters */}
        {!onSearch && (
          <div className="mt-6">
            <Button 
              className="w-full bg-coral hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleSearch}
            >
              <Search className="mr-2 h-4 w-4" />
              Cerca
            </Button>
          </div>
        )}
      </div>

      {/* Fuel Policy Information Section */}
      <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200">
        <Collapsible open={fuelPolicyOpen} onOpenChange={setFuelPolicyOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-4 hover:bg-blue-100/50 text-left text-gray-900"
            >
              <div className="flex items-center">
                <Fuel className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Politiche Carburante</h3>
              </div>
              {fuelPolicyOpen ? (
                <ChevronDown className="h-4 w-4 text-blue-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-blue-600" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
        
        <div className="space-y-4 text-sm">
          {/* Consumo a Parte - Unica opzione */}
          <div className="bg-white rounded-md p-3 border border-blue-100">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">⛽</span>
              <h4 className="font-semibold text-gray-900">Consumo a parte (fatturazione a litri o a ore motore)</h4>
            </div>
            <div className="ml-6 space-y-2">
              <div>
                <span className="text-blue-600 font-medium">🔹 Come funziona:</span>
                <ul className="ml-4 mt-1 space-y-1 text-gray-700">
                  <li>• Il carburante è escluso dal prezzo del noleggio</li>
                  <li>• Si paga separatamente a fine giornata</li>
                  <li>• Misurazione tramite litri consumati (sensori/contalitri)</li>
                  <li>• Oppure ore di navigazione (contatore motore)</li>
                </ul>
              </div>
              <div>
                <span className="text-green-600 font-medium">Tariffe tipiche:</span>
                <ul className="ml-4 mt-1 space-y-1 text-gray-700">
                  <li>• <strong>Litri:</strong> circa 1,80 – 2,20 €/litro per benzina marina</li>
                  <li>• <strong>Ore motore:</strong> 15-20 €/ora (varia per potenza motore)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Suggerimenti */}
          <div className="bg-yellow-50 rounded-md p-3 border border-yellow-200 mt-4">
            <h4 className="font-semibold text-amber-800 mb-2">💡 Suggerimenti per il noleggio:</h4>
            <ul className="space-y-1 text-amber-700 text-sm">
              <li>• Il carburante è sempre escluso dal prezzo del noleggio</li>
              <li>• Pagamento separato a fine giornata in base al consumo effettivo</li>
              <li>• Per una gita media stimare circa 30-50 € di carburante</li>
            </ul>
          </div>
        </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
