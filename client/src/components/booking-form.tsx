import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { 
  CreditCard, 
  Shield, 
  Users, 
  Calendar, 
  MapPin, 
  Ship, 
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const bookingFormSchema = z.object({
  guestName: z.string().min(2, "Nome richiesto"),
  guestEmail: z.string().email("Email non valida"),
  numberOfGuests: z.string().min(1, "Numero di ospiti richiesto"),
  notes: z.string().optional(),
  skipperRequired: z.boolean().default(false),
  fuelIncluded: z.boolean().default(false),
  acceptTerms: z.boolean().refine(val => val === true, "Devi accettare i termini e condizioni"),
  acceptCancellation: z.boolean().refine(val => val === true, "Devi accettare la politica di cancellazione")
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  boat: {
    id: number;
    name: string;
    port: string;
    pricePerDay: number;
    maxPersons: number;
    type: string;
    images?: string[];
    skipperRequired?: boolean;
    fuelIncluded?: boolean;
  };
  booking: {
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    days: number;
  };
  onBookingComplete: (bookingId: number) => void;
}

export function BookingForm({ boat, booking, onBookingComplete }: BookingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guestName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : '',
      guestEmail: user?.email || '',
      numberOfGuests: '1',
      notes: '',
      skipperRequired: boat.skipperRequired || false,
      fuelIncluded: boat.type === "charter" ? true : false,
      acceptTerms: false,
      acceptCancellation: false
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const skipperCost = data.skipperRequired ? booking.days * 120 : 0; // 120€ per day for skipper
      const fuelCost = data.fuelIncluded ? booking.days * 80 : 0; // 80€ per day for fuel
      const finalTotalPrice = booking.totalPrice + skipperCost + fuelCost;

      return apiRequest("POST", "/api/bookings", {
        boatId: boat.id,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalPrice: finalTotalPrice.toString(),
        numberOfGuests: parseInt(data.numberOfGuests),
        guestName: data.guestName,
        guestEmail: data.guestEmail,

        notes: data.notes,
        skipperRequired: data.skipperRequired,
        fuelIncluded: data.fuelIncluded
      });
    },
    onSuccess: (response: any) => {
      const newBooking = response;
      toast({
        title: "Prenotazione creata",
        description: "La tua prenotazione è stata registrata. Procedi al pagamento."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      onBookingComplete(newBooking?.id || Date.now());
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la creazione della prenotazione",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per prenotare",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createBookingMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipperCost = form.watch("skipperRequired") ? booking.days * 120 : 0;
  const fuelCost = form.watch("fuelIncluded") ? booking.days * 80 : 0;
  const finalTotalPrice = booking.totalPrice + skipperCost + fuelCost;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-ocean-blue" />
            Riepilogo prenotazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={boat.images?.[0] || "/attached_assets/luxury_yacht_charter_boat_7d39103e.png"}
                  alt={boat.name}
                  className="w-20 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{boat.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {boat.port}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {format(booking.startDate, "dd MMM", { locale: it })} - {format(booking.endDate, "dd MMM yyyy", { locale: it })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Durata:</span>
                <span className="font-medium">{booking.days} {booking.days === 1 ? 'giorno' : 'giorni'}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-600">Prezzo base:</span>
                <span className="font-medium">€{booking.totalPrice}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dettagli prenotazione</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Guest Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informazioni ospite principale</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestName">Nome completo *</Label>
                  <Input
                    id="guestName"
                    {...form.register("guestName")}
                  />
                  {form.formState.errors.guestName && (
                    <p className="text-sm text-red-600">{form.formState.errors.guestName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="guestEmail">Email *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    {...form.register("guestEmail")}
                  />
                  {form.formState.errors.guestEmail && (
                    <p className="text-sm text-red-600">{form.formState.errors.guestEmail.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="numberOfGuests">Numero di ospiti *</Label>
                <Select 
                  value={form.watch("numberOfGuests")} 
                  onValueChange={(value) => form.setValue("numberOfGuests", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {Array.from({ length: boat.maxPersons }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()} className="text-black hover:bg-gray-100">
                        <span className="text-black font-medium">{i + 1} {i + 1 === 1 ? 'ospite' : 'ospiti'}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Servizi aggiuntivi</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipperRequired"
                    checked={form.watch("skipperRequired")}
                    onCheckedChange={(checked) => form.setValue("skipperRequired", checked as boolean)}
                  />
                  <Label htmlFor="skipperRequired" className="flex items-center gap-2">
                    Skipper professionale
                    <Badge variant="outline">+€120/giorno</Badge>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fuelIncluded"
                    checked={form.watch("fuelIncluded")}
                    onCheckedChange={(checked) => form.setValue("fuelIncluded", checked as boolean)}
                  />
                  <Label htmlFor="fuelIncluded" className="flex items-center gap-2">
                    Carburante {boat.type === "charter" ? "(incluso)" : "(escluso)"}
                    {boat.type !== "charter" && <Badge variant="outline">+€80/giorno</Badge>}
                  </Label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Note aggiuntive (opzionale)</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Richieste speciali, note per il proprietario..."
                rows={3}
              />
            </div>

            {/* Price Breakdown */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Riepilogo prezzi</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Noleggio base ({booking.days} {booking.days === 1 ? 'giorno' : 'giorni'}):</span>
                    <span>€{booking.totalPrice}</span>
                  </div>
                  
                  {skipperCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Skipper ({booking.days} {booking.days === 1 ? 'giorno' : 'giorni'}):</span>
                      <span>€{skipperCost}</span>
                    </div>
                  )}
                  
                  {fuelCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Carburante ({booking.days} {booking.days === 1 ? 'giorno' : 'giorni'}):</span>
                      <span>€{fuelCost}</span>
                    </div>
                  )}
                  
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Totale:</span>
                    <span className="text-ocean-blue">€{finalTotalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={form.watch("acceptTerms")}
                  onCheckedChange={(checked) => form.setValue("acceptTerms", checked as boolean)}
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  Accetto i <a href="/termini" className="text-ocean-blue hover:underline">termini e condizioni</a> di SeaBoo *
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptCancellation"
                  checked={form.watch("acceptCancellation")}
                  onCheckedChange={(checked) => form.setValue("acceptCancellation", checked as boolean)}
                />
                <Label htmlFor="acceptCancellation" className="text-sm">
                  Accetto la <a href="/cancellazione" className="text-ocean-blue hover:underline">politica di cancellazione</a> *
                </Label>
              </div>
            </div>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Pagamento sicuro:</strong> I tuoi dati di pagamento sono protetti da crittografia SSL. 
                Non addebiteremo nulla fino alla conferma del proprietario.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full bg-ocean-blue hover:bg-blue-600 h-12"
              disabled={isSubmitting || createBookingMutation.isPending}
            >
              {isSubmitting ? (
                "Creazione prenotazione..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Procedi al pagamento - €{finalTotalPrice}
                </>
              )}
            </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}