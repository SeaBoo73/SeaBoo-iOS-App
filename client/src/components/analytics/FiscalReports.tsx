import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, Calculator, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface FiscalData {
  totalIncome: number;
  platformCommission: number;
  netIncome: number;
  taxableIncome: number;
  estimatedTaxes: number;
  deductibleExpenses: number;
  vatAmount: number;
  quarterlyTaxes: Array<{
    quarter: string;
    amount: number;
    dueDate: string;
    paid: boolean;
  }>;
  yearlyProjection: {
    estimatedAnnualIncome: number;
    estimatedAnnualTaxes: number;
    nextPaymentDate: string;
    recommendedReserve: number;
  };
}

interface FiscalReportsProps {
  data: FiscalData;
  period: { from: Date; to: Date };
}

export default function FiscalReports({ data, period }: FiscalReportsProps) {
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: it });
  };

  const handleExport = async (type: string) => {
    setExportLoading(type);
    try {
      const params = new URLSearchParams({
        from: format(period.from, 'yyyy-MM-dd'),
        to: format(period.to, 'yyyy-MM-dd'),
        type: type === 'pdf' ? 'pdf' : 'excel',
        report: 'fiscal'
      });
      
      const response = await fetch(`/api/analytics/export?${params}`);
      if (!response.ok) throw new Error('Errore export');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-fiscale-${format(new Date(), 'yyyy-MM-dd')}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore export:', error);
    } finally {
      setExportLoading(null);
    }
  };

  const getTaxEfficiency = () => {
    const efficiency = (data.netIncome / data.totalIncome) * 100;
    return efficiency;
  };

  const FiscalSummaryCard = ({ title, amount, description, trend, positive = true }: any) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          {trend && (
            <TrendingUp className={`h-4 w-4 ${positive ? 'text-green-500' : 'text-red-500'}`} />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(amount)}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Fiscal Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FiscalSummaryCard
          title="Ricavi Lordi"
          amount={data.totalIncome}
          description="Totale fatturato del periodo"
          trend={true}
          positive={true}
        />
        
        <FiscalSummaryCard
          title="Commissioni Piattaforma"
          amount={data.platformCommission}
          description="15% sui ricavi totali"
          positive={false}
        />
        
        <FiscalSummaryCard
          title="Ricavi Netti"
          amount={data.netIncome}
          description="Dopo commissioni"
          trend={true}
          positive={true}
        />
        
        <FiscalSummaryCard
          title="Tasse Stimate"
          amount={data.estimatedTaxes}
          description="22% su reddito imponibile"
          positive={false}
        />
      </div>

      {/* Main Fiscal Tabs */}
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Riepilogo</TabsTrigger>
          <TabsTrigger value="quarterly">Trimestrale</TabsTrigger>
          <TabsTrigger value="annual">Annuale</TabsTrigger>
          <TabsTrigger value="documents">Documenti</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calcolo Fiscale Dettagliato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Ricavi Lordi</span>
                    <span className="font-medium">{formatCurrency(data.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-red-600">- Commissioni Piattaforma (15%)</span>
                    <span className="font-medium text-red-600">-{formatCurrency(data.platformCommission)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-green-600">= Ricavi Netti</span>
                    <span className="font-bold text-green-600">{formatCurrency(data.netIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-blue-600">- Spese Deducibili (15%)</span>
                    <span className="font-medium text-blue-600">-{formatCurrency(data.deductibleExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-double border-2">
                    <span className="font-bold">= Reddito Imponibile</span>
                    <span className="font-bold">{formatCurrency(data.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-orange-600">IRPEF (22%)</span>
                    <span className="font-bold text-orange-600">{formatCurrency(data.estimatedTaxes)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficienza Fiscale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Ricavi Netti vs Lordi</span>
                    <span className="text-sm font-bold">{getTaxEfficiency().toFixed(1)}%</span>
                  </div>
                  <Progress value={getTaxEfficiency()} className="h-2" />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Consiglio Fiscale:</strong> Considera di registrare tutte le spese deducibili 
                    come manutenzione, assicurazione, ormeggio e carburante per ottimizzare il carico fiscale.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">Spese Deducibili Tipiche:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Manutenzione e riparazioni</li>
                    <li>• Assicurazione natante</li>
                    <li>• Tasse di ormeggio</li>
                    <li>• Carburante e lubrifcanti</li>
                    <li>• Attrezzature di sicurezza</li>
                    <li>• Commissioni bancarie</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quarterly Tab */}
        <TabsContent value="quarterly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pagamenti Trimestrali IRPEF</CardTitle>
              <p className="text-sm text-muted-foreground">
                Calendario dei versamenti per l'anno fiscale corrente
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.quarterlyTaxes.map((quarter, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${quarter.paid ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <div>
                        <div className="font-medium">{quarter.quarter}</div>
                        <div className="text-sm text-muted-foreground">
                          Scadenza: {formatDate(quarter.dueDate)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(quarter.amount)}</div>
                      <Badge variant={quarter.paid ? 'default' : 'secondary'}>
                        {quarter.paid ? 'Pagato' : 'Da pagare'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annual Tab */}
        <TabsContent value="annual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proiezione Annuale</CardTitle>
              <p className="text-sm text-muted-foreground">
                Stima basata sui dati del periodo corrente
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Ricavi Stimati Anno</h4>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(data.yearlyProjection.estimatedAnnualIncome)}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tasse Stimate Anno</h4>
                    <div className="text-3xl font-bold text-orange-600">
                      {formatCurrency(data.yearlyProjection.estimatedAnnualTaxes)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Riserva Consigliata:</strong><br />
                      Mantieni {formatCurrency(data.yearlyProjection.recommendedReserve)} 
                      come riserva per i pagamenti fiscali.
                    </AlertDescription>
                  </Alert>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      💡 Prossimo Versamento
                    </h4>
                    <p className="text-sm text-blue-800">
                      {formatDate(data.yearlyProjection.nextPaymentDate)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documenti Fiscali</CardTitle>
              <p className="text-sm text-muted-foreground">
                Genera e scarica i documenti necessari per il commercialista
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 justify-start flex-col items-start"
                  onClick={() => handleExport('pdf')}
                  disabled={exportLoading === 'pdf'}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Quadro RW</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Redditi da locazione di natanti per dichiarazione dei redditi
                  </p>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 justify-start flex-col items-start"
                  onClick={() => handleExport('excel')}
                  disabled={exportLoading === 'excel'}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="h-5 w-5" />
                    <span className="font-medium">Registro Entrate</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Cronologico delle entrate per contabilità semplificata
                  </p>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 justify-start flex-col items-start"
                  onClick={() => handleExport('pdf')}
                  disabled={exportLoading === 'pdf'}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Fatture Emesse</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Elenco completo delle fatture del periodo
                  </p>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 justify-start flex-col items-start"
                  onClick={() => handleExport('pdf')}
                  disabled={exportLoading === 'pdf'}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-5 w-5" />
                    <span className="font-medium">F24 Precompilato</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Modello F24 con importi calcolati automaticamente
                  </p>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">
                  ⚠️ Disclaimer Fiscale
                </h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>• I calcoli sono stime basate su aliquote standard</p>
                  <p>• Consultare sempre un commercialista qualificato</p>
                  <p>• Le normative fiscali possono variare nel tempo</p>
                  <p>• Verificare deduzioni e agevolazioni applicabili</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}