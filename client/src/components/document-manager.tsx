import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard, 
  User, 
  Shield,
  Download,
  Eye
} from "lucide-react";

interface DocumentManagerProps {
  bookingId: number;
  userRole: "customer" | "owner";
}

export function DocumentManager({ bookingId, userRole }: DocumentManagerProps) {
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents } = useQuery({
    queryKey: ["/api/bookings", bookingId, "documents"],
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("bookingId", bookingId.toString());

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Errore durante l'upload");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento caricato",
        description: "Il documento è stato caricato con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "documents"] });
      setUploadingType(null);
    },
    onError: (error: any) => {
      toast({
        title: "Errore upload",
        description: error.message,
        variant: "destructive",
      });
      setUploadingType(null);
    },
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ documentId, verified }: { documentId: number; verified: boolean }) => {
      const response = await apiRequest("PATCH", `/api/documents/${documentId}/verify`, {
        verified,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento verificato",
        description: "Lo stato del documento è stato aggiornato",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "documents"] });
    },
  });

  const documentTypes = [
    {
      type: "contract",
      name: "Contratto di Noleggio",
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      description: "Contratto firmato digitalmente",
      required: true,
      allowedRoles: ["owner", "customer"]
    },
    {
      type: "identity",
      name: "Documento d'Identità",
      icon: <User className="h-5 w-5 text-green-600" />,
      description: "Carta d'identità o passaporto",
      required: true,
      allowedRoles: ["customer"]
    },
    {
      type: "license",
      name: "Patente Nautica",
      icon: <Shield className="h-5 w-5 text-purple-600" />,
      description: "Patente nautica (se richiesta)",
      required: false,
      allowedRoles: ["customer"]
    },
    {
      type: "deposit_receipt",
      name: "Ricevuta Cauzione",
      icon: <CreditCard className="h-5 w-5 text-orange-600" />,
      description: "Prova del pagamento cauzione",
      required: true,
      allowedRoles: ["customer", "owner"]
    }
  ];

  const getDocumentStatus = (type: string) => {
    const doc = documents?.find((d: any) => d.type === type);
    if (!doc) return "missing";
    if (doc.verified) return "verified";
    return "pending";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verificato</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />In attesa</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Mancante</Badge>;
    }
  };

  const handleFileUpload = (type: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadingType(type);
        uploadDocumentMutation.mutate({ file, type });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-ocean-blue" />
            Gestione Documenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {userRole === "customer" 
              ? "Carica i documenti richiesti per completare la prenotazione"
              : "Verifica e gestisci i documenti del cliente"
            }
          </p>

          <div className="space-y-4">
            {documentTypes.map((docType) => {
              if (!docType.allowedRoles.includes(userRole)) return null;
              
              const status = getDocumentStatus(docType.type);
              const document = documents?.find((d: any) => d.type === docType.type);

              return (
                <div key={docType.type} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {docType.icon}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{docType.name}</h3>
                          {docType.required && (
                            <Badge variant="outline" className="text-xs">Obbligatorio</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{docType.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(status)}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {status === "missing" && userRole === "customer" && (
                        <Button
                          size="sm"
                          onClick={() => handleFileUpload(docType.type)}
                          disabled={uploadingType === docType.type}
                          className="bg-ocean-blue hover:bg-blue-600"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          {uploadingType === docType.type ? "Caricamento..." : "Carica"}
                        </Button>
                      )}

                      {document && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Visualizza
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Scarica
                          </Button>
                        </div>
                      )}
                    </div>

                    {userRole === "owner" && document && status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200"
                          onClick={() => verifyDocumentMutation.mutate({ 
                            documentId: document.id, 
                            verified: false 
                          })}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rifiuta
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => verifyDocumentMutation.mutate({ 
                            documentId: document.id, 
                            verified: true 
                          })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approva
                        </Button>
                      </div>
                    )}
                  </div>

                  {document && (
                    <div className="mt-2 text-xs text-gray-500">
                      Caricato il {new Date(document.createdAt).toLocaleDateString()} 
                      {document.verifiedBy && ` • Verificato da ${document.verifiedBy}`}
                      {document.notes && ` • Note: ${document.notes}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {userRole === "customer" && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Processo di Verifica</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <p className="text-sm">
              📋 <strong>Step 1:</strong> Carica tutti i documenti richiesti
            </p>
            <p className="text-sm">
              🔍 <strong>Step 2:</strong> Il proprietario verificherà i documenti (entro 24h)
            </p>
            <p className="text-sm">
              ✅ <strong>Step 3:</strong> Una volta approvati, la prenotazione sarà confermata
            </p>
            <p className="text-sm">
              🚤 <strong>Step 4:</strong> Presentati al check-in con i documenti originali
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}