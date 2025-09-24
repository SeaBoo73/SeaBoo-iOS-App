import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Users, DollarSign, Eye, Anchor } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface AnalyticsDashboardProps {
  ownerId: number;
}

export function AnalyticsDashboard({ ownerId }: AnalyticsDashboardProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/analytics/${ownerId}`],
  });

  const { data: revenueData } = useQuery({
    queryKey: [`/api/analytics/revenue/${ownerId}?period=monthly`],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const analyticsArray = Array.isArray(analytics) ? analytics : [];
  const totalViews = analyticsArray.reduce((sum: number, entry: any) => sum + (entry.views || 0), 0);
  const totalBookings = analyticsArray.reduce((sum: number, entry: any) => sum + (entry.bookings || 0), 0);
  const totalRevenue = analyticsArray.reduce((sum: number, entry: any) => sum + parseFloat(entry.revenue || "0"), 0);
  const avgConversionRate = analyticsArray.length ? 
    analyticsArray.reduce((sum: number, entry: any) => sum + parseFloat(entry.conversionRate || "0"), 0) / analyticsArray.length : 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizzazioni Totali</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% dal mese scorso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prenotazioni</CardTitle>
            <Anchor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">+8% dal mese scorso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavi Totali</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% dal mese scorso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso di Conversione</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+2.1% dal mese scorso</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ricavi Mensili</CardTitle>
            <CardDescription>Andamento dei ricavi negli ultimi mesi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Array.isArray(revenueData) ? revenueData : []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`€${value}`, 'Ricavi']}
                  labelFormatter={(label) => `Periodo: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  dot={{ fill: '#0088FE' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Prenotazioni per Periodo</CardTitle>
            <CardDescription>Numero di prenotazioni nel tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Array.isArray(revenueData) ? revenueData : []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Prenotazioni']}
                  labelFormatter={(label) => `Periodo: ${label}`}
                />
                <Bar dataKey="bookings" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo Performance</CardTitle>
          <CardDescription>Analisi delle performance delle tue imbarcazioni</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsArray.slice(0, 5).map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Periodo: {entry.date}</p>
                    <p className="text-sm text-gray-600">
                      {entry.views} visualizzazioni • {entry.bookings} prenotazioni
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">€{parseFloat(entry.revenue || "0").toLocaleString()}</p>
                  <Badge variant={parseFloat(entry.conversionRate || "0") > 5 ? "default" : "secondary"}>
                    {parseFloat(entry.conversionRate || "0").toFixed(1)}% conversione
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips and Insights */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Suggerimenti per Migliorare</CardTitle>
          <CardDescription>Consigli basati sui tuoi dati</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Ottimizza le foto</h4>
              <p className="text-sm text-blue-700 mt-1">
                Le barche con foto di alta qualità hanno il 40% in più di prenotazioni
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Rispondi velocemente</h4>
              <p className="text-sm text-green-700 mt-1">
                Rispondere entro 1 ora aumenta le conversioni del 25%
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900">Prezzi competitivi</h4>
              <p className="text-sm text-orange-700 mt-1">
                I tuoi prezzi sono {avgConversionRate > 5 ? 'ottimali' : 'da rivedere'} per la zona
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Stagionalità</h4>
              <p className="text-sm text-purple-700 mt-1">
                Pianifica promozioni per i periodi di bassa stagione
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}