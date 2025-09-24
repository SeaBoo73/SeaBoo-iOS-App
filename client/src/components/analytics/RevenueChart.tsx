import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Euro, Calendar, Target } from 'lucide-react';

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
  avgDailyRate: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  period: 'week' | 'month' | 'quarter' | 'year';
  onPeriodChange?: (period: 'week' | 'month' | 'quarter' | 'year') => void;
  totalRevenue: number;
  revenueGrowth: number;
  totalBookings: number;
  bookingGrowth: number;
}

export default function RevenueChart({ 
  data, 
  period, 
  onPeriodChange, 
  totalRevenue, 
  revenueGrowth, 
  totalBookings, 
  bookingGrowth 
}: RevenueChartProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'week':
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
      case 'month':
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
      case 'quarter':
        return date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
      case 'year':
        return date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
      default:
        return dateStr;
    }
  };

  const enhancedData = data.map(item => ({
    ...item,
    formattedDate: formatDate(item.date),
    formattedRevenue: formatCurrency(item.revenue),
    formattedAvgRate: formatCurrency(item.avgDailyRate)
  }));

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const avgRevenue = data.reduce((sum, d) => sum + d.revenue, 0) / data.length;

  const MetricBadge = ({ title, value, growth, format = 'number' }: any) => (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        {format === 'currency' ? <Euro className="h-4 w-4 text-green-600" /> : 
         format === 'bookings' ? <Target className="h-4 w-4 text-blue-600" /> :
         <Calendar className="h-4 w-4 text-purple-600" />}
        <span className="text-sm font-medium text-gray-600">{title}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {format === 'currency' ? formatCurrency(value) : value.toLocaleString()}
      </div>
      <div className="flex items-center gap-1 mt-1">
        {growth > 0 ? (
          <TrendingUp className="h-3 w-3 text-green-500" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-500" />
        )}
        <span className={`text-xs font-medium ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {Math.abs(growth).toFixed(1)}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Andamento Ricavi</h2>
          <p className="text-sm text-gray-600">
            Analisi delle performance finanziarie nel tempo
          </p>
        </div>
        
        {onPeriodChange && (
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Settimanale</SelectItem>
              <SelectItem value="month">Mensile</SelectItem>
              <SelectItem value="quarter">Trimestrale</SelectItem>
              <SelectItem value="year">Annuale</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricBadge
          title="Ricavi Totali"
          value={totalRevenue}
          growth={revenueGrowth}
          format="currency"
        />
        <MetricBadge
          title="Prenotazioni"
          value={totalBookings}
          growth={bookingGrowth}
          format="bookings"
        />
        <MetricBadge
          title="Ricavi Medi"
          value={avgRevenue}
          growth={revenueGrowth * 0.8} // Estimate based on revenue growth
          format="currency"
        />
      </div>

      {/* Main Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ricavi nel Tempo</span>
            <Badge variant="outline">
              Peak: {formatCurrency(maxRevenue)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={enhancedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066CC" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0066CC" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900 mb-2">{label}</p>
                        <p className="text-green-600">
                          Ricavi: {formatCurrency(payload[0].value as number)}
                        </p>
                        <p className="text-blue-600">
                          Prenotazioni: {payload[0].payload.bookings}
                        </p>
                        <p className="text-purple-600">
                          Tariffa media: {formatCurrency(payload[0].payload.avgDailyRate)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0066CC"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={{ fill: '#0066CC', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#0066CC', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue vs Bookings Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Ricavi vs Prenotazioni</CardTitle>
          <p className="text-sm text-gray-600">
            Correlazione tra volume di prenotazioni e ricavi generati
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enhancedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                yAxisId="revenue"
                orientation="left"
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis 
                yAxisId="bookings"
                orientation="right"
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : value,
                  name === 'revenue' ? 'Ricavi' : 'Prenotazioni'
                ]}
              />
              <Legend />
              <Bar
                yAxisId="revenue"
                dataKey="revenue"
                fill="#0066CC"
                name="Ricavi (€)"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Line
                yAxisId="bookings"
                type="monotone"
                dataKey="bookings"
                stroke="#FF9800"
                strokeWidth={3}
                name="Prenotazioni"
                dot={{ fill: '#FF9800', strokeWidth: 2, r: 4 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Daily Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Andamento Tariffa Media Giornaliera</CardTitle>
          <p className="text-sm text-gray-600">
            Evoluzione del prezzo medio per giorno di noleggio
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={enhancedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Tariffa Media']}
              />
              <Line
                type="monotone"
                dataKey="avgDailyRate"
                stroke="#9C27B0"
                strokeWidth={3}
                name="Tariffa Media"
                dot={{ fill: '#9C27B0', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#9C27B0', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {data.filter(d => d.revenue > avgRevenue).length}
              </div>
              <div className="text-sm text-green-700">Periodi Sopra Media</div>
              <div className="text-xs text-green-600 mt-1">
                Su {data.length} periodi totali
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(data.reduce((max, d) => Math.max(max, d.avgDailyRate), 0))}
              </div>
              <div className="text-sm text-blue-700">Tariffa Massima</div>
              <div className="text-xs text-blue-600 mt-1">Picco registrato</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {Math.max(...data.map(d => d.bookings))}
              </div>
              <div className="text-sm text-purple-700">Prenotazioni Max</div>
              <div className="text-xs text-purple-600 mt-1">In un singolo periodo</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {((data.filter(d => d.revenue > 0).length / data.length) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-orange-700">Periodi Attivi</div>
              <div className="text-xs text-orange-600 mt-1">Con ricavi generati</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}