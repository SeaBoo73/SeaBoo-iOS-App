import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, addDays, differenceInDays, isAfter, isBefore, isEqual } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarDays, Users, Euro, Clock } from "lucide-react";

interface BookingCalendarProps {
  boatId: number;
  pricePerDay: number;
  onDateSelect: (startDate: Date, endDate: Date, totalPrice: number, days: number) => void;
}

interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
}

export function BookingCalendar({ boatId, pricePerDay, onDateSelect }: BookingCalendarProps) {
  const [selectedRange, setSelectedRange] = useState<{ from?: Date; to?: Date }>({});
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  // Fetch existing bookings for this boat
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/boats", boatId, "bookings"],
    queryFn: async () => {
      const response = await fetch(`/api/bookings?boatId=${boatId}&status=confirmed`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    }
  });

  // Get disabled dates (already booked)
  const disabledDates = bookings.flatMap(booking => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const dates = [];
    
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      dates.push(new Date(d));
    }
    return dates;
  });

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (isBefore(date, new Date())) return true;
    
    // Disable already booked dates
    return disabledDates.some(disabledDate => 
      isEqual(date.toDateString(), disabledDate.toDateString())
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || isDateDisabled(date)) return;

    if (!selectedRange.from || isSelectingEnd) {
      // Selecting start date or end date
      if (!selectedRange.from) {
        setSelectedRange({ from: date });
        setIsSelectingEnd(true);
      } else {
        // Selecting end date
        const startDate = selectedRange.from;
        const endDate = date;

        if (isBefore(endDate, startDate)) {
          // If end date is before start date, swap them
          setSelectedRange({ from: endDate, to: startDate });
        } else {
          setSelectedRange({ from: startDate, to: endDate });
        }
        setIsSelectingEnd(false);

        // Calculate price and notify parent
        const days = differenceInDays(endDate, startDate) + 1;
        const totalPrice = days * pricePerDay;
        onDateSelect(startDate, endDate, totalPrice, days);
      }
    } else {
      // Reset selection
      setSelectedRange({ from: date });
      setIsSelectingEnd(true);
    }
  };

  const clearSelection = () => {
    setSelectedRange({});
    setIsSelectingEnd(false);
  };

  const totalDays = selectedRange.from && selectedRange.to 
    ? differenceInDays(selectedRange.to, selectedRange.from) + 1 
    : 0;

  const totalPrice = totalDays * pricePerDay;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-ocean-blue" />
          Seleziona le date
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <div className="flex-1">
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={(range) => {
                if (range?.from) {
                  handleDateSelect(range.from);
                  if (range.to && range.to !== range.from) {
                    handleDateSelect(range.to);
                  }
                }
              }}
              disabled={isDateDisabled}
              locale={it}
              numberOfMonths={2}
              className="rounded-md border"
            />
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-200 rounded-full"></div>
                Non disponibile
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                Selezionato
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-200 rounded-full"></div>
                Disponibile
              </Badge>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:w-80">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Riepilogo prenotazione</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRange.from ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">
                          {format(selectedRange.from, "dd MMM yyyy", { locale: it })}
                        </span>
                      </div>
                      
                      {selectedRange.to && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-medium">
                            {format(selectedRange.to, "dd MMM yyyy", { locale: it })}
                          </span>
                        </div>
                      )}
                    </div>

                    {totalDays > 0 && (
                      <>
                        <hr />
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Durata:</span>
                            <span className="font-medium">
                              {totalDays} {totalDays === 1 ? 'giorno' : 'giorni'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Prezzo per giorno:</span>
                            <span className="font-medium">€{pricePerDay}</span>
                          </div>
                          
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Totale:</span>
                            <span className="text-ocean-blue">€{totalPrice}</span>
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-ocean-blue hover:bg-blue-600"
                          onClick={() => onDateSelect(selectedRange.from!, selectedRange.to!, totalPrice, totalDays)}
                        >
                          Continua con la prenotazione
                        </Button>
                      </>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={clearSelection}
                    >
                      Cancella selezione
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Seleziona le date per vedere il prezzo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}