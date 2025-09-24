import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Ticket, Clock, Star, Zap, Gift, AlertCircle } from "lucide-react";

interface DiscountSystemProps {
  totalPrice: number;
  customerLevel: string;
  onDiscountApplied: (discount: { code: string; amount: number; finalPrice: number }) => void;
}

export function DiscountSystem({ totalPrice, customerLevel, onDiscountApplied }: DiscountSystemProps) {
  const [discountCode, setDiscountCode] = useState("");
  const { toast } = useToast();

  // Fetch available discounts for user level
  const { data: availableDiscounts } = useQuery({
    queryKey: ["/api/discounts/available", customerLevel],
  });

  const applyDiscountMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/discounts/apply", {
        code,
        totalPrice,
        customerLevel
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sconto applicato!",
        description: `Hai risparmiato €${data.discountAmount}`,
      });
      onDiscountApplied({
        code: data.code,
        amount: data.discountAmount,
        finalPrice: data.finalPrice
      });
    },
    onError: (error: any) => {
      toast({
        title: "Codice sconto non valido",
        description: error.message || "Verifica il codice e riprova",
        variant: "destructive",
      });
    },
  });

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case "loyalty":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "early_bird":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "last_minute":
        return <Zap className="h-4 w-4 text-red-500" />;
      default:
        return <Gift className="h-4 w-4 text-green-500" />;
    }
  };

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case "loyalty":
        return "Fedeltà";
      case "early_bird":
        return "Prenotazione anticipata";
      case "last_minute":
        return "Last minute";
      case "percentage":
        return "Percentuale";
      case "fixed":
        return "Importo fisso";
      default:
        return type;
    }
  };

  const calculateDiscountAmount = (discount: any) => {
    if (discount.type === "percentage") {
      const amount = (totalPrice * parseFloat(discount.value)) / 100;
      return Math.min(amount, parseFloat(discount.maxDiscount || amount));
    }
    return parseFloat(discount.value);
  };

  return (
    <div className="space-y-4">
      {/* Applica codice sconto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ticket className="h-5 w-5 text-ocean-blue" />
            Codice Sconto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Inserisci codice sconto"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="uppercase"
            />
            <Button
              onClick={() => applyDiscountMutation.mutate(discountCode)}
              disabled={!discountCode || applyDiscountMutation.isPending}
              className="bg-ocean-blue hover:bg-blue-600"
            >
              {applyDiscountMutation.isPending ? "Verifica..." : "Applica"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sconti disponibili */}
      {availableDiscounts && availableDiscounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="h-5 w-5 text-green-600" />
              Sconti Disponibili
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableDiscounts.map((discount: any) => {
              const discountAmount = calculateDiscountAmount(discount);
              const canUse = parseFloat(discount.minSpent) <= totalPrice;
              
              return (
                <div
                  key={discount.id}
                  className={`p-3 border rounded-lg ${
                    canUse ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDiscountTypeIcon(discount.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{discount.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {discount.code}
                          </Badge>
                          <Badge className={`text-xs ${
                            canUse ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                          }`}>
                            {getDiscountTypeLabel(discount.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{discount.description}</p>
                        {!canUse && (
                          <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            Spesa minima: €{discount.minSpent}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        -{discount.type === "percentage" ? `${discount.value}%` : `€${discount.value}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Risparmi €{discountAmount.toFixed(2)}
                      </p>
                      {canUse && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1"
                          onClick={() => applyDiscountMutation.mutate(discount.code)}
                          disabled={applyDiscountMutation.isPending}
                        >
                          Usa
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Sconti livello fedeltà */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
            <Star className="h-5 w-5 text-blue-600" />
            Sconto Livello {customerLevel.charAt(0).toUpperCase() + customerLevel.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-800">
            {customerLevel === "bronze" && (
              <p>🥉 Livello Bronze: 5% di sconto automatico su prenotazioni multiple</p>
            )}
            {customerLevel === "silver" && (
              <p>🥈 Livello Silver: 10% di sconto automatico già applicato!</p>
            )}
            {customerLevel === "gold" && (
              <p>🥇 Livello Gold: 15% di sconto automatico già applicato!</p>
            )}
            {customerLevel === "platinum" && (
              <p>💎 Livello Platinum: 20% di sconto automatico già applicato!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}