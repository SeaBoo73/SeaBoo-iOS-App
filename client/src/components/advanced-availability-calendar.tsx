import { useState, useEffect } from "react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar, CalendarDays, Euro, TrendingUp, TrendingDown, Clock, Tag, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AvailabilityDay {
  id: number;
  date: string;
  available: boolean;
  price: number;
  seasonType: 'high' | 'medium' | 'low';
  priceMultiplier: number;
  blockReason?: string;
  notes?: string;
}

interface BookingRule {
  id: number;
  ruleType: 'multiple_days' | 'last_minute' | 'early_bird' | 'seasonal';
  name: string;
  description?: string;
  discountPercentage: number;
  minimumDays?: number;
  maximumDays?: number;
  advanceBookingDays?: number;
  validFrom?: string;
  validTo?: string;
  active: boolean;
  priority: number;
}

interface PricingInfo {
  basePrice: number;
  finalPrice: number;
  seasonMultiplier: number;
  demandMultiplier: number;
  appliedDiscounts: Array<{
    name: string;
    percentage: number;
    description?: string;
  }>;
  savings: number;
}

interface AdvancedAvailabilityCalendarProps {
  boatId: number;
  isOwner?: boolean;
  onDateSelect?: (startDate: Date, endDate: Date) => void;
}

export function AdvancedAvailabilityCalendar({ 
  boatId, 
  isOwner = false, 
  onDateSelect 
}: AdvancedAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selectedRule, setSelectedRule] = useState<BookingRule | null>(null);
  const [showPricingDetails, setShowPricingDetails] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch availability data
  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ['/api/boats', boatId, 'availability', currentMonth],
    queryFn: () => {
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      return apiRequest(`/api/boats/${boatId}/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
    }
  });

  // Fetch booking rules
  const { data: bookingRules = [] } = useQuery({
    queryKey: ['/api/boats', boatId, 'booking-rules'],
    queryFn: () => apiRequest(`/api/boats/${boatId}/booking-rules`)
  });

  // Calculate dynamic pricing when dates are selected
  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: ['/api/boats', boatId, 'pricing', selectedStartDate, selectedEndDate],
    queryFn: () => {
      if (!selectedStartDate || !selectedEndDate) return null;
      const days = Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24));
      return apiRequest(`/api/boats/${boatId}/pricing?startDate=${selectedStartDate.toISOString()}&endDate=${selectedEndDate.toISOString()}&days=${days}`);
    },
    enabled: !!(selectedStartDate && selectedEndDate)
  });

  // Create booking lock mutation
  const createBookingLockMutation = useMutation({
    mutationFn: (dates: { startDate: Date; endDate: Date }) =>
      apiRequest(`/api/boats/${boatId}/booking-lock`, {
        method: 'POST',
        body: JSON.stringify({
          startDate: dates.startDate.toISOString(),
          endDate: dates.endDate.toISOString()
        })
      }),
    onSuccess: () => {
      toast({
        title: "Date temporaneamente bloccate",
        description: "Le date selezionate sono state riservate per 15 minuti per completare la prenotazione."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/boats', boatId, 'availability'] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore nel bloccare le date",
        description: error.message || "Le date potrebbero non essere più disponibili.",
        variant: "destructive"
      });
    }
  });

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getAvailabilityForDate = (date: Date): AvailabilityDay | null => {
    return availability.find((item: AvailabilityDay) => 
      isSameDay(parseISO(item.date), date)
    ) || null;
  };

  const getDayClass = (date: Date): string => {
    const availabilityInfo = getAvailabilityForDate(date);
    const isSelected = selectedStartDate && selectedEndDate && 
      !isBefore(date, selectedStartDate) && !isAfter(date, selectedEndDate);
    const isHovered = hoveredDate && selectedStartDate && !selectedEndDate &&
      !isBefore(date, selectedStartDate) && !isAfter(date, hoveredDate);
    
    let baseClass = "min-h-[60px] p-2 border border-gray-200 cursor-pointer relative ";
    
    if (isBefore(date, new Date())) {
      baseClass += "bg-gray-100 text-gray-400 cursor-not-allowed ";
    } else if (!availabilityInfo?.available) {
      baseClass += "bg-red-100 text-red-800 ";
    } else if (isSelected) {
      baseClass += "bg-blue-500 text-white ";
    } else if (isHovered) {
      baseClass += "bg-blue-200 ";
    } else {
      const seasonColor = availabilityInfo?.seasonType === 'high' ? 'bg-orange-50' :
                          availabilityInfo?.seasonType === 'low' ? 'bg-green-50' : 'bg-yellow-50';
      baseClass += seasonColor + " hover:bg-blue-100 ";
    }
    
    return baseClass;
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, new Date())) return;
    
    const availabilityInfo = getAvailabilityForDate(date);
    if (!availabilityInfo?.available) return;

    if (!selectedStartDate) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (!selectedEndDate) {
      if (isBefore(date, selectedStartDate)) {
        setSelectedStartDate(date);
        setSelectedEndDate(null);
      } else {
        setSelectedEndDate(date);
        // Create booking lock for selected dates
        if (!isOwner) {
          createBookingLockMutation.mutate({ startDate: selectedStartDate, endDate: date });
        }
        // Notify parent component
        onDateSelect?.(selectedStartDate, date);
      }
    } else {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    }
  };

  const handleDateHover = (date: Date) => {
    if (selectedStartDate && !selectedEndDate && !isBefore(date, selectedStartDate)) {
      setHoveredDate(date);
    }
  };

  const getSeasonIcon = (seasonType: string) => {
    switch (seasonType) {
      case 'high': return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'low': return <TrendingDown className="w-3 h-3 text-green-500" />;
      default: return <Calendar className="w-3 h-3 text-yellow-500" />;
    }
  };

  const activeRules = bookingRules.filter((rule: BookingRule) => rule.active);
  const selectedDays = selectedStartDate && selectedEndDate ? 
    Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Calendario Disponibilità</h3>
          {selectedDays > 0 && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <CalendarDays className="w-4 h-4" />
              <span>{selectedDays} giorni selezionati</span>
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
          >
            ←
          </Button>
          <span className="font-medium min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: it })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
          >
            →
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="pricing">Prezzi & Sconti</TabsTrigger>
          <TabsTrigger value="rules">Regole di Prenotazione</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-50 border"></div>
              <span>Bassa stagione</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-50 border"></div>
              <span>Media stagione</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-50 border"></div>
              <span>Alta stagione</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-100 border"></div>
              <span>Non disponibile</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 border"></div>
              <span>Selezionato</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
            
            {monthDays.map(date => {
              const availabilityInfo = getAvailabilityForDate(date);
              return (
                <div
                  key={date.toISOString()}
                  className={getDayClass(date)}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => handleDateHover(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  <div className="text-sm font-medium">{format(date, 'd')}</div>
                  {availabilityInfo && (
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-between">
                        {getSeasonIcon(availabilityInfo.seasonType)}
                        {availabilityInfo.price && (
                          <span className="text-xs font-medium">
                            €{Math.round(availabilityInfo.price * availabilityInfo.priceMultiplier)}
                          </span>
                        )}
                      </div>
                      {availabilityInfo.blockReason && (
                        <div className="text-xs text-red-600 capitalize">
                          {availabilityInfo.blockReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          {selectedStartDate && selectedEndDate && pricingData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Euro className="w-5 h-5" />
                  <span>Dettaglio Prezzi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Prezzo base/giorno</div>
                    <div className="text-xl font-semibold">€{pricingData.basePrice}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Prezzo finale</div>
                    <div className="text-xl font-semibold text-green-600">€{pricingData.finalPrice}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Moltiplicatore stagionale</span>
                    <span className="font-medium">{pricingData.seasonMultiplier}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moltiplicatore domanda</span>
                    <span className="font-medium">{pricingData.demandMultiplier}x</span>
                  </div>
                  {pricingData.savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Risparmi totali</span>
                      <span className="font-semibold">€{pricingData.savings}</span>
                    </div>
                  )}
                </div>

                {pricingData.appliedDiscounts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Sconti applicati:</h4>
                    {pricingData.appliedDiscounts.map((discount, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <div>
                          <div className="font-medium">{discount.name}</div>
                          {discount.description && (
                            <div className="text-sm text-gray-600">{discount.description}</div>
                          )}
                        </div>
                        <Badge variant="secondary">-{discount.percentage}%</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Seleziona le date per vedere i prezzi dinamici</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {activeRules.map((rule: BookingRule) => (
              <Card key={rule.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="w-4 h-4" />
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant="outline">-{rule.discountPercentage}%</Badge>
                      </div>
                      {rule.description && (
                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {rule.minimumDays && (
                          <span className="flex items-center space-x-1">
                            <CalendarDays className="w-3 h-3" />
                            <span>Min. {rule.minimumDays} giorni</span>
                          </span>
                        )}
                        {rule.advanceBookingDays && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{rule.advanceBookingDays} giorni anticipo</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Dettagli
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{rule.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <strong>Tipo:</strong> {rule.ruleType}
                          </div>
                          <div>
                            <strong>Sconto:</strong> {rule.discountPercentage}%
                          </div>
                          {rule.description && (
                            <div>
                              <strong>Descrizione:</strong> {rule.description}
                            </div>
                          )}
                          {rule.minimumDays && (
                            <div>
                              <strong>Giorni minimi:</strong> {rule.minimumDays}
                            </div>
                          )}
                          {rule.maximumDays && (
                            <div>
                              <strong>Giorni massimi:</strong> {rule.maximumDays}
                            </div>
                          )}
                          {rule.advanceBookingDays && (
                            <div>
                              <strong>Giorni di anticipo:</strong> {rule.advanceBookingDays}
                            </div>
                          )}
                          <div>
                            <strong>Priorità:</strong> {rule.priority}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {activeRules.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Nessuna regola di sconto attiva</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Real-time availability notice */}
      {selectedStartDate && selectedEndDate && !isOwner && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Date temporaneamente riservate</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Le date selezionate sono state bloccate per 15 minuti per permetterti di completare la prenotazione. 
                  Procedi rapidamente con il pagamento per confermare la prenotazione.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}