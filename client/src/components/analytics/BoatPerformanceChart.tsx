import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Star, Calendar, Euro, Anchor } from 'lucide-react';

interface BoatPerformance {
  boatId: number;
  boatName: string;
  revenue: number;
  bookings: number;
  rating: number;
  occupancyRate: number;
  avgDailyRate: number;
  revenueGrowth: number;
  lastBookingDate: string;
}

interface BoatPerformanceChartProps {
  data: BoatPerformance[];
  onBoatSelect?: (boatId: number) => void;
}

export default function BoatPerformanceChart({ data, onBoatSelect }: BoatPerformanceChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPerformanceLevel = (occupancyRate: number) => {
    if (occupancyRate >= 80) return { level: 'Eccellente', color: 'green', bgColor: 'bg-green-100' };
    if (occupancyRate >= 60) return { level: 'Buono', color: 'blue', bgColor: 'bg-blue-100' };
    if (occupancyRate >= 40) return { level: 'Medio', color: 'yellow', bgColor: 'bg-yellow-100' };
    return { level: 'Da migliorare', color: 'red', bgColor: 'bg-red-100' };
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Prepare chart data
  const chartData = data.map(boat => ({
    name: boat.boatName.length > 15 ? boat.boatName.substring(0, 12) + '...' : boat.boatName,
    revenue: boat.revenue,
    bookings: boat.bookings,
    occupancy: boat.occupancyRate,
    rating: boat.rating
  }));

  const PerformanceCard = ({ boat }: { boat: BoatPerformance }) => {
    const performance = getPerformanceLevel(boat.occupancyRate);
    
    return (
      <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${performance.bgColor}`}
           onClick={() => onBoatSelect?.(boat.boatId)}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{boat.boatName}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1">
                <Anchor className="h-3 w-3" />
                ID: {boat.boatId}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(boat.lastBookingDate).toLocaleDateString('it-IT')}
              </span>
            </div>
          </div>
          <Badge 
            variant={performance.color === 'green' ? 'default' : 
                    performance.color === 'blue' ? 'secondary' : 
                    performance.color === 'yellow' ? 'outline' : 'destructive'}
            className="ml-2"
          >
            {performance.level}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Ricavi</div>
            <div className="text-lg font-bold text-green-600 flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {formatCurrency(boat.revenue)}
            </div>
            <div className="flex items-center text-xs">
              {boat.revenueGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={boat.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                {boat.revenueGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Prenotazioni</div>
            <div className="text-lg font-bold text-blue-600">{boat.bookings}</div>
            <div className="text-xs text-gray-500">
              Avg: {formatCurrency(boat.avgDailyRate)}/gg
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Valutazione</div>
            <div className={`text-lg font-bold flex items-center gap-1 ${getRatingColor(boat.rating)}`}>
              <Star className="h-4 w-4 fill-current" />
              {boat.rating.toFixed(1)}
            </div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= boat.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Occupazione</div>
            <div className="text-lg font-bold text-gray-900">{boat.occupancyRate.toFixed(1)}%</div>
            <div className="mt-1">
              <Progress value={boat.occupancyRate} className="h-2" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Performance vs media: 
            <span className={boat.occupancyRate > 65 ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
              {boat.occupancyRate > 65 ? ' Sopra media' : ' Sotto media'}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBoatSelect?.(boat.boatId);
            }}
          >
            Dettagli
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Revenue Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Ricavi per Imbarcazione</CardTitle>
          <p className="text-sm text-muted-foreground">
            Confronto ricavi e prenotazioni delle tue imbarcazioni
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis yAxisId="revenue" orientation="left" />
              <YAxis yAxisId="bookings" orientation="right" />
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
              />
              <Bar
                yAxisId="bookings"
                dataKey="bookings"
                fill="#FF9800"
                name="Prenotazioni"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Occupancy Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tasso di Occupazione e Rating</CardTitle>
          <p className="text-sm text-muted-foreground">
            Relazione tra occupazione e soddisfazione clienti
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis yAxisId="occupancy" domain={[0, 100]} />
              <YAxis yAxisId="rating" orientation="right" domain={[0, 5]} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'occupancy' ? `${value}%` : `${value} ⭐`,
                  name === 'occupancy' ? 'Occupazione' : 'Rating'
                ]}
              />
              <Legend />
              <Line
                yAxisId="occupancy"
                type="monotone"
                dataKey="occupancy"
                stroke="#4CAF50"
                strokeWidth={3}
                name="Occupazione (%)"
                dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
              />
              <Line
                yAxisId="rating"
                type="monotone"
                dataKey="rating"
                stroke="#FFD700"
                strokeWidth={3}
                name="Rating (⭐)"
                dot={{ fill: '#FFD700', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Performance Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Dettagliata Imbarcazioni</CardTitle>
          <p className="text-sm text-muted-foreground">
            Analisi individuale delle performance di ogni imbarcazione
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.map((boat) => (
              <PerformanceCard key={boat.boatId} boat={boat} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.filter(b => b.occupancyRate >= 80).length}
              </div>
              <div className="text-sm text-green-700">Imbarcazioni Eccellenti</div>
              <div className="text-xs text-green-600 mt-1">≥80% occupazione</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.filter(b => b.occupancyRate >= 60 && b.occupancyRate < 80).length}
              </div>
              <div className="text-sm text-blue-700">Performance Buone</div>
              <div className="text-xs text-blue-600 mt-1">60-79% occupazione</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {data.filter(b => b.occupancyRate < 60).length}
              </div>
              <div className="text-sm text-orange-700">Da Migliorare</div>
              <div className="text-xs text-orange-600 mt-1">&lt;60% occupazione</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}