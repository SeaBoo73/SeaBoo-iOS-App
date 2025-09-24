import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Phone, MapPin, Clock, User, Shield } from "lucide-react";

interface EmergencySystemProps {
  bookingId?: number;
  userId?: number;
}

export function EmergencySystem({ bookingId, userId }: EmergencySystemProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [emergencyType, setEmergencyType] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emergencies, isLoading } = useQuery({
    queryKey: ['/api/emergencies', bookingId ? `?bookingId=${bookingId}` : ''],
    enabled: !!bookingId
  });

  const createEmergencyMutation = useMutation({
    mutationFn: async (emergencyData: any) => {
      const res = await apiRequest('POST', '/api/emergencies', emergencyData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergenza Segnalata",
        description: "La tua emergenza è stata segnalata con successo. Ti contatteremo al più presto.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emergencies'] });
      setIsReporting(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile segnalare l'emergenza. Riprova o chiama direttamente il 1530.",
        variant: "destructive",
      });
    }
  });

  const hotlineEmergencyMutation = useMutation({
    mutationFn: async (emergencyData: any) => {
      const res = await apiRequest('POST', '/api/emergencies/hotline', emergencyData);
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "🆘 EMERGENZA CRITICA SEGNALATA",
        description: `${data.message} Numero Guardia Costiera: ${data.hotlineNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emergencies'] });
    }
  });

  const resetForm = () => {
    setEmergencyType("");
    setSeverity("");
    setDescription("");
    setLocation("");
  };

  const handleEmergencyReport = () => {
    if (!emergencyType || !severity || !description) {
      toast({
        title: "Campi obbligatori",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    const emergencyData = {
      bookingId,
      reportedBy: userId,
      type: emergencyType,
      severity,
      description,
      location
    };

    if (severity === "critical") {
      hotlineEmergencyMutation.mutate(emergencyData);
    } else {
      createEmergencyMutation.mutate(emergencyData);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude}, ${longitude}`);
        toast({
          title: "Posizione acquisita",
          description: "La tua posizione GPS è stata aggiunta alla segnalazione",
        });
      }, (error) => {
        toast({
          title: "Errore GPS",
          description: "Impossibile ottenere la posizione. Inserisci manualmente.",
          variant: "destructive",
        });
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "open": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Hotline Card */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <Phone className="h-5 w-5" />
            <span>Emergenza in Mare</span>
          </CardTitle>
          <CardDescription className="text-red-600">
            Per emergenze immediate chiama la Guardia Costiera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-red-700">📞 1530</p>
              <p className="text-sm text-red-600">Numero di emergenza Guardia Costiera</p>
            </div>
            <Button 
              variant="destructive" 
              size="lg"
              onClick={() => hotlineEmergencyMutation.mutate({
                bookingId,
                reportedBy: userId,
                type: "hotline_call",
                severity: "critical",
                description: "Chiamata diretta hotline emergenza",
                location: "GPS da acquisire"
              })}
              disabled={hotlineEmergencyMutation.isPending}
            >
              <Shield className="mr-2 h-4 w-4" />
              Segnala Emergenza Critica
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Emergency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Segnala Problema</span>
          </CardTitle>
          <CardDescription>
            Segnala problemi non critici o richiedi assistenza
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isReporting} onOpenChange={setIsReporting}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Segnala Problema
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Segnala Problema</DialogTitle>
                <DialogDescription>
                  Compila il modulo per segnalare un problema o richiedere assistenza
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tipo di Problema *</label>
                  <Select value={emergencyType} onValueChange={setEmergencyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mechanical">Problema Meccanico</SelectItem>
                      <SelectItem value="medical">Emergenza Medica</SelectItem>
                      <SelectItem value="weather">Condizioni Meteo</SelectItem>
                      <SelectItem value="accident">Incidente</SelectItem>
                      <SelectItem value="assistance">Richiesta Assistenza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Gravità *</label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona la gravità" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bassa - Non urgente</SelectItem>
                      <SelectItem value="medium">Media - Serve assistenza</SelectItem>
                      <SelectItem value="high">Alta - Situazione seria</SelectItem>
                      <SelectItem value="critical">Critica - Emergenza immediata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Descrizione *</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrivi dettagliatamente il problema..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Posizione</label>
                  <div className="flex space-x-2">
                    <Textarea
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Inserisci la tua posizione o coordinate GPS..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={getCurrentLocation}>
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleEmergencyReport}
                    disabled={createEmergencyMutation.isPending || hotlineEmergencyMutation.isPending}
                    className="flex-1"
                  >
                    {createEmergencyMutation.isPending ? "Segnalazione..." : "Invia Segnalazione"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsReporting(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Emergency History */}
      {bookingId && (
        <Card>
          <CardHeader>
            <CardTitle>Segnalazioni per questa Prenotazione</CardTitle>
            <CardDescription>
              Storico delle segnalazioni e stato assistenza
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 h-20 rounded"></div>
                ))}
              </div>
            ) : emergencies && Array.isArray(emergencies) && emergencies.length > 0 ? (
              <div className="space-y-4">
                {emergencies.map((emergency: any) => (
                  <div key={emergency.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getSeverityColor(emergency.severity)}>
                            {emergency.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(emergency.status || 'open')}>
                            {emergency.status || 'APERTO'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {emergency.type}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{emergency.description}</p>
                        {emergency.location && (
                          <p className="text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {emergency.location}
                          </p>
                        )}
                        {emergency.resolution && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                            <strong>Risoluzione:</strong> {emergency.resolution}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(emergency.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nessuna segnalazione per questa prenotazione
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Safety Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700">💡 Consigli di Sicurezza</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Prima della partenza:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Controlla le condizioni meteo</li>
                <li>• Verifica l'equipaggiamento di sicurezza</li>
                <li>• Comunica il piano di navigazione</li>
                <li>• Assicurati che il telefono sia carico</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">In caso di emergenza:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Mantieni la calma</li>
                <li>• Usa questo sistema per segnalazioni non critiche</li>
                <li>• Chiama 1530 per emergenze immediate</li>
                <li>• Fornisci sempre la tua posizione precisa</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}