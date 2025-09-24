import { useState } from "react";
import { Gift, Tag, Calendar, Users, Percent, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Promotion } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

interface PromotionsSystemProps {
  onApplyPromotion?: (promotion: Promotion) => void;
  totalAmount?: number;
}

export function PromotionsSystem({ onApplyPromotion, totalAmount }: PromotionsSystemProps) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const queryClient = useQueryClient();

  const { data: activePromotions = [] } = useQuery({
    queryKey: ['/api/promotions/active'],
    queryFn: async () => {
      const response = await fetch('/api/promotions/active');
      return await response.json();
    }
  });

  const applyPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/promotions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, totalAmount })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: (promotion) => {
      setAppliedPromo(promotion);
      onApplyPromotion?.(promotion);
      toast({
        title: "Codice applicato!",
        description: `Sconto del ${promotion.discountType === 'percentage' ? promotion.discountValue + '%' : '€' + promotion.discountValue} applicato`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Codice non valido",
        description: error.message || "Il codice promozionale non è valido o è scaduto",
        variant: "destructive"
      });
    }
  });

  const calculateDiscount = (promotion: Promotion, amount: number) => {
    if (promotion.discountType === 'percentage') {
      return (amount * parseFloat(promotion.discountValue)) / 100;
    } else {
      return Math.min(parseFloat(promotion.discountValue), amount);
    }
  };

  const isPromotionValid = (promotion: Promotion) => {
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validTo = new Date(promotion.validTo);
    
    return now >= validFrom && now <= validTo && 
           promotion.active && 
           (!promotion.maxUses || promotion.currentUses < promotion.maxUses) &&
           (!promotion.minAmount || !totalAmount || totalAmount >= parseFloat(promotion.minAmount));
  };

  return (
    <div className="space-y-6">
      {/* Promo Code Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Codice Promozionale
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Inserisci codice sconto"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button
              onClick={() => applyPromoMutation.mutate(promoCode)}
              disabled={!promoCode.trim() || applyPromoMutation.isPending}
            >
              {applyPromoMutation.isPending ? 'Verifica...' : 'Applica'}
            </Button>
          </div>
          
          {appliedPromo && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    {appliedPromo.title}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {appliedPromo.discountType === 'percentage' 
                    ? `-${appliedPromo.discountValue}%`
                    : `-€${appliedPromo.discountValue}`
                  }
                </Badge>
              </div>
              
              {totalAmount && (
                <div className="mt-2 text-sm text-green-700">
                  Risparmio: €{calculateDiscount(appliedPromo, totalAmount).toFixed(2)}
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-auto p-0 text-green-700 hover:text-green-800"
                onClick={() => {
                  setAppliedPromo(null);
                  setPromoCode("");
                  onApplyPromotion?.(null as any);
                }}
              >
                Rimuovi sconto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Promotions */}
      {activePromotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Offerte Attive
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid gap-4">
              {activePromotions.map((promotion: Promotion) => {
                const isValid = isPromotionValid(promotion);
                const discount = totalAmount ? calculateDiscount(promotion, totalAmount) : 0;
                
                return (
                  <div
                    key={promotion.id}
                    className={`p-4 border rounded-lg transition-all ${
                      isValid 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-green-800">{promotion.title}</h4>
                        <p className="text-sm text-green-600 mt-1">
                          {promotion.description}
                        </p>
                      </div>
                      
                      <Badge 
                        variant={isValid ? "default" : "secondary"}
                        className={isValid ? "bg-green-600" : ""}
                      >
                        {promotion.discountType === 'percentage' ? (
                          <div className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            {promotion.discountValue}%
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            {promotion.discountValue}
                          </div>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-green-700 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Fino al {new Date(promotion.validTo).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      
                      {promotion.minAmount && (
                        <div className="flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          <span>Min. €{promotion.minAmount}</span>
                        </div>
                      )}
                      
                      {promotion.maxUses && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {promotion.maxUses - promotion.currentUses} rimasti
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {promotion.code && isValid && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono bg-white px-2 py-1 border rounded">
                            {promotion.code}
                          </span>
                          {totalAmount && discount > 0 && (
                            <span className="text-sm font-medium text-green-700">
                              Risparmi €{discount.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                          onClick={() => {
                            setPromoCode(promotion.code!);
                            applyPromoMutation.mutate(promotion.code!);
                          }}
                          disabled={appliedPromo?.id === promotion.id}
                        >
                          {appliedPromo?.id === promotion.id ? 'Applicato' : 'Applica'}
                        </Button>
                      </div>
                    )}
                    
                    {!isValid && (
                      <div className="text-xs text-gray-500 mt-2">
                        {!promotion.active && "Offerta non più attiva"}
                        {promotion.maxUses && promotion.currentUses >= promotion.maxUses && "Offerta esaurita"}
                        {promotion.minAmount && totalAmount && totalAmount < parseFloat(promotion.minAmount) && 
                          `Importo minimo: €${promotion.minAmount}`
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}