import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import { 
  Calendar, 
  Plus, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Tag,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdvancedAvailabilityCalendar } from "./advanced-availability-calendar";

const bookingRuleSchema = z.object({
  ruleType: z.enum(['multiple_days', 'last_minute', 'early_bird', 'seasonal']),
  name: z.string().min(1, "Nome obbligatorio"),
  description: z.string().optional(),
  discountPercentage: z.number().min(0).max(100),
  minimumDays: z.number().optional(),
  maximumDays: z.number().optional(),
  advanceBookingDays: z.number().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  active: z.boolean().default(true),
  priority: z.number().default(1)
});

const bulkAvailabilitySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  seasonType: z.enum(['high', 'medium', 'low']),
  priceMultiplier: z.number().min(0.1).max(10),
  available: z.boolean(),
  blockReason: z.string().optional(),
  notes: z.string().optional()
});

interface OwnerAvailabilityManagerProps {
  boatId: number;
}

export function OwnerAvailabilityManager({ boatId }: OwnerAvailabilityManagerProps) {
  const [selectedView, setSelectedView] = useState<'calendar' | 'rules' | 'bulk' | 'analytics'>('calendar');
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Forms
  const ruleForm = useForm({
    resolver: zodResolver(bookingRuleSchema),
    defaultValues: {
      ruleType: 'multiple_days' as const,
      name: '',
      description: '',
      discountPercentage: 0,
      active: true,
      priority: 1
    }
  });

  const bulkForm = useForm({
    resolver: zodResolver(bulkAvailabilitySchema),
    defaultValues: {
      seasonType: 'medium' as const,
      priceMultiplier: 1.0,
      available: true
    }
  });

  // Queries
  const { data: boat } = useQuery({
    queryKey: ['/api/boats', boatId],
    queryFn: () => apiRequest(`/api/boats/${boatId}`)
  });

  const { data: bookingRules = [] } = useQuery({
    queryKey: ['/api/boats', boatId, 'booking-rules'],
    queryFn: () => apiRequest(`/api/boats/${boatId}/booking-rules`)
  });

  const { data: pricingHistory = [] } = useQuery({
    queryKey: ['/api/boats', boatId, 'pricing-history'],
    queryFn: () => apiRequest(`/api/boats/${boatId}/pricing-history`)
  });

  // Mutations
  const createRuleMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest(`/api/boats/${boatId}/booking-rules`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({
        title: "Regola creata",
        description: "La nuova regola di prenotazione è stata creata con successo."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/boats', boatId, 'booking-rules'] });
      setShowCreateRule(false);
      ruleForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nella creazione della regola.",
        variant: "destructive"
      });
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest(`/api/boats/${boatId}/availability/bulk`, {
        method: 'PATCH',
        body: JSON.stringify({
          dateRanges: [{
            startDate: data.startDate,
            endDate: data.endDate
          }],
          seasonType: data.seasonType,
          priceMultiplier: data.priceMultiplier,
          blockReason: data.available ? null : data.blockReason
        })
      }),
    onSuccess: () => {
      toast({
        title: "Disponibilità aggiornata",
        description: "La disponibilità è stata aggiornata per il periodo selezionato."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/boats', boatId, 'availability'] });
      setShowBulkUpdate(false);
      bulkForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nell'aggiornamento della disponibilità.",
        variant: "destructive"
      });
    }
  });

  const onCreateRule = (data: any) => {
    createRuleMutation.mutate(data);
  };

  const onBulkUpdate = (data: any) => {
    bulkUpdateMutation.mutate(data);
  };

  const getRuleTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_days': return 'Soggiorni lunghi';
      case 'last_minute': return 'Last minute';
      case 'early_bird': return 'Prenotazione anticipata';
      case 'seasonal': return 'Stagionale';
      default: return type;
    }
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'multiple_days': return <Calendar className="w-4 h-4" />;
      case 'last_minute': return <Clock className="w-4 h-4" />;
      case 'early_bird': return <TrendingUp className="w-4 h-4" />;
      case 'seasonal': return <TrendingDown className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestione Disponibilità Avanzata</h2>
          <p className="text-gray-600">
            {boat?.name} - Calendario sincronizzato e prezzi dinamici
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showCreateRule} onOpenChange={setShowCreateRule}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuova Regola
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crea Regola di Prenotazione</DialogTitle>
              </DialogHeader>
              <Form {...ruleForm}>
                <form onSubmit={ruleForm.handleSubmit(onCreateRule)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={ruleForm.control}
                      name="ruleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Regola</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="multiple_days">Soggiorni lunghi</SelectItem>
                              <SelectItem value="last_minute">Last minute</SelectItem>
                              <SelectItem value="early_bird">Prenotazione anticipata</SelectItem>
                              <SelectItem value="seasonal">Stagionale</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ruleForm.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sconto (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={ruleForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Regola</FormLabel>
                        <FormControl>
                          <Input placeholder="Sconto soggiorni lunghi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ruleForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrizione (opzionale)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Sconto applicato per prenotazioni di almeno 7 giorni"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={ruleForm.control}
                      name="minimumDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giorni minimi</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="7" 
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ruleForm.control}
                      name="maximumDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giorni massimi</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ruleForm.control}
                      name="advanceBookingDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giorni anticipo</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={ruleForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priorità</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ruleForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 mt-6">
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Regola attiva</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateRule(false)}
                    >
                      Annulla
                    </Button>
                    <Button type="submit" disabled={createRuleMutation.isPending}>
                      {createRuleMutation.isPending ? "Creazione..." : "Crea Regola"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={showBulkUpdate} onOpenChange={setShowBulkUpdate}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Aggiornamento Blocco
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiornamento Disponibilità</DialogTitle>
              </DialogHeader>
              <Form {...bulkForm}>
                <form onSubmit={bulkForm.handleSubmit(onBulkUpdate)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bulkForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data inizio</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bulkForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data fine</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bulkForm.control}
                      name="seasonType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Stagione</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Bassa stagione</SelectItem>
                              <SelectItem value="medium">Media stagione</SelectItem>
                              <SelectItem value="high">Alta stagione</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bulkForm.control}
                      name="priceMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moltiplicatore Prezzo</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="1.0" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 1.0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={bulkForm.control}
                    name="available"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Disponibile</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBulkUpdate(false)}
                    >
                      Annulla
                    </Button>
                    <Button type="submit" disabled={bulkUpdateMutation.isPending}>
                      {bulkUpdateMutation.isPending ? "Aggiornamento..." : "Aggiorna"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="rules">Regole ({bookingRules.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="bulk">Gestione Blocco</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <AdvancedAvailabilityCalendar boatId={boatId} isOwner={true} />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {bookingRules.map((rule: any) => (
              <Card key={rule.id} className={!rule.active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getRuleIcon(rule.ruleType)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge variant="secondary">-{rule.discountPercentage}%</Badge>
                          {rule.active ? (
                            <Badge variant="default">
                              <Eye className="w-3 h-3 mr-1" />
                              Attiva
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inattiva
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {getRuleTypeLabel(rule.ruleType)}
                        </p>
                        {rule.description && (
                          <p className="text-sm text-gray-500 mt-2">{rule.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                          {rule.minimumDays && (
                            <span>Min. {rule.minimumDays} giorni</span>
                          )}
                          {rule.maximumDays && (
                            <span>Max. {rule.maximumDays} giorni</span>
                          )}
                          {rule.advanceBookingDays && (
                            <span>{rule.advanceBookingDays} giorni anticipo</span>
                          )}
                          <span>Priorità {rule.priority}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Modifica
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prezzo Medio</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{boat?.pricePerDay || 0}/giorno</div>
                <p className="text-xs text-muted-foreground">Prezzo base corrente</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regole Attive</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bookingRules.filter((rule: any) => rule.active).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Su {bookingRules.length} totali
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sconto Massimo</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bookingRules.length > 0 
                    ? Math.max(...bookingRules.map((r: any) => r.discountPercentage))
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Sconto massimo applicabile</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Storico Prezzi</CardTitle>
            </CardHeader>
            <CardContent>
              {pricingHistory.length > 0 ? (
                <div className="space-y-2">
                  {pricingHistory.slice(0, 10).map((history: any) => (
                    <div key={history.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <div className="font-medium">
                          {format(new Date(history.date), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          Stagione: {history.seasonMultiplier}x | Domanda: {history.demandMultiplier}x
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">€{history.finalPrice}</div>
                        <div className="text-sm text-gray-500">
                          (base: €{history.basePrice})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nessun dato di pricing disponibile
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Disponibilità a Blocchi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Utilizza questa sezione per aggiornare la disponibilità e i prezzi per periodi estesi.
                Puoi impostare stagioni, moltiplicatori di prezzo e bloccare date per manutenzione.
              </p>
              <Button onClick={() => setShowBulkUpdate(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Avvia Aggiornamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}