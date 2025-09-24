import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertBookingSchema, Boat } from "@shared/schema";
import { z } from "zod";
import { format, differenceInDays, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Users, 
  UserCheck, 
  CreditCard, 
  Shield,
  AlertCircle,
  X
} from "lucide-react";
import { useLocation } from "wouter";

interface BookingModalProps {
  boat: Boat;
  onClose: () => void;
}

const bookingFormSchema = insertBookingSchema.extend({
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().optional(),
  skipperRequested: z.boolean().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "La data di fine deve essere successiva alla data di inizio",
  path: ["endDate"],
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export function BookingModal({ boat, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"dates" | "details" | "payment">("dates");

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      boatId: boat.id,
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      skipperRequested: boat.skipperRequired || false,
      notes: "",
    },
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const skipperRequested = form.watch("skipperRequested");

  const days = startDate && endDate ? differenceInDays(endDate, startDate) : 1;
  const basePrice = Number(boat.pricePerDay) * days;
  const skipperPrice = skipperRequested ? 50 * days : 0; // €50/day for skipper
  const platformFee = Math.round((basePrice + skipperPrice) * 0.15); // 15% commission
  const totalPrice = basePrice + skipperPrice + platformFee;

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const bookingData = {
        ...data,
        totalPrice: totalPrice.toString(),
      };
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Prenotazione creata",
        description: "Ora procedi con il pagamento",
      });
      setLocation(`/checkout?bookingId=${booking.id}`);
    },
    onError: (error) => {
      toast({
        title: "Errore nella prenotazione",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    if (step === "dates") {
      setStep("details");
    } else if (step === "details") {
      if (!user) {
        toast({
          title: "Accesso richiesto",
          description: "Devi effettuare l'accesso per completare la prenotazione",
          variant: "destructive",
        });
        setLocation("/auth");
        return;
      }
      createBookingMutation.mutate(data);
    }
  };

  const goBack = () => {
    if (step === "details") {
      setStep("dates");
    } else if (step === "payment") {
      setStep("details");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Prenota {boat.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === "dates" ? "text-ocean-blue" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "dates" ? "bg-ocean-blue text-white" : "bg-gray-200"}`}>
                1
              </div>
              <span className="ml-2 text-sm">Date</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step === "details" ? "text-ocean-blue" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "details" ? "bg-ocean-blue text-white" : "bg-gray-200"}`}>
                2
              </div>
              <span className="ml-2 text-sm">Dettagli</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step === "payment" ? "text-ocean-blue" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "payment" ? "bg-ocean-blue text-white" : "bg-gray-200"}`}>
                3
              </div>
              <span className="ml-2 text-sm">Pagamento</span>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === "dates" && (
              <Card>
                <CardHeader>
                  <CardTitle>Seleziona le date</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label>Data di inizio</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP", { locale: it }) : "Seleziona data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => form.setValue("startDate", date!)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <Label>Data di fine</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP", { locale: it }) : "Seleziona data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => form.setValue("endDate", date!)}
                            disabled={(date) => date <= startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {form.formState.errors.endDate && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {form.formState.errors.endDate.message}
                    </div>
                  )}

                  {days > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Durata: {days} {days === 1 ? "giorno" : "giorni"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === "details" && (
              <Card>
                <CardHeader>
                  <CardTitle>Dettagli prenotazione</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Skipper */}
                  {boat.skipperRequired ? (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <UserCheck className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-800">Skipper obbligatorio</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Questa imbarcazione richiede uno skipper professionale (€50/giorno)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="skipperRequested"
                        checked={skipperRequested}
                        onCheckedChange={(checked) => form.setValue("skipperRequested", !!checked)}
                      />
                      <Label htmlFor="skipperRequested" className="text-sm">
                        Richiedi skipper professionale (+€50/giorno)
                      </Label>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Note aggiuntive (opzionale)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Richieste speciali, allergie, preferenze..."
                      {...form.register("notes")}
                    />
                  </div>

                  {/* Important Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-gray-600 mr-2 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Informazioni importanti:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Il carburante è sempre escluso dal prezzo</li>
                          <li>• Cancellazione gratuita fino a 24 ore prima</li>
                          <li>• Documento di identità richiesto al ritiro</li>
                          {boat.licenseRequired && <li>• Patente nautica obbligatoria</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Riepilogo prezzo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>€{boat.pricePerDay} x {days} {days === 1 ? "giorno" : "giorni"}</span>
                    <span>€{basePrice.toFixed(2)}</span>
                  </div>
                  {skipperRequested && (
                    <div className="flex justify-between">
                      <span>Skipper x {days} {days === 1 ? "giorno" : "giorni"}</span>
                      <span>€{skipperPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Commissione SeaBoo (15%)</span>
                    <span>€{platformFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Totale</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {step !== "dates" && (
                <Button variant="outline" onClick={goBack} className="flex-1">
                  Indietro
                </Button>
              )}
              <Button 
                type="submit" 
                className="flex-1 bg-coral hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:hover:scale-100"
                disabled={createBookingMutation.isPending}
              >
                {step === "dates" && "Continua"}
                {step === "details" && (createBookingMutation.isPending ? "Creazione..." : "Procedi al pagamento")}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
