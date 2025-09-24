import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Users, Star, Clock } from 'lucide-react';

interface PerformanceMetricsProps {
  data: {
    totalRevenue: number;
    totalBookings: number;
    occupancyRate: number;
    averageRating: number;
    customerRetention: number;
    averageBookingValue: number;
    revenueGrowth: number;
    bookingGrowth: number;
  };
}

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = "blue" 
  }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {trendValue}%
            </span>
            <span className="text-muted-foreground ml-1">vs mese scorso</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'green';
    if (rate >= 60) return 'yellow';
    return 'red';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'green';
    if (rating >= 4.0) return 'yellow';
    return 'red';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Fatturato Totale"
        value={formatCurrency(data.totalRevenue)}
        icon={TrendingUp}
        trend={data.revenueGrowth > 0 ? 'up' : 'down'}
        trendValue={Math.abs(data.revenueGrowth).toFixed(1)}
        color="green"
      />

      <MetricCard
        title="Prenotazioni"
        value={data.totalBookings.toLocaleString()}
        subtitle="Totale confermate"
        icon={Target}
        trend={data.bookingGrowth > 0 ? 'up' : 'down'}
        trendValue={Math.abs(data.bookingGrowth).toFixed(1)}
        color="blue"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasso di Occupazione</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.occupancyRate.toFixed(1)}%</div>
          <Progress 
            value={data.occupancyRate} 
            className="mt-2"
          />
          <Badge 
            variant={getOccupancyColor(data.occupancyRate) === 'green' ? 'default' : 
                    getOccupancyColor(data.occupancyRate) === 'yellow' ? 'secondary' : 'destructive'}
            className="mt-2"
          >
            {data.occupancyRate >= 80 ? 'Eccellente' : 
             data.occupancyRate >= 60 ? 'Buono' : 'Da migliorare'}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valutazione Media</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            {data.averageRating.toFixed(1)}
            <Star className="h-5 w-5 text-yellow-500 ml-1 fill-current" />
          </div>
          <div className="flex items-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= data.averageRating
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              Su 5 stelle
            </span>
          </div>
        </CardContent>
      </Card>

      <MetricCard
        title="Valore Medio Prenotazione"
        value={formatCurrency(data.averageBookingValue)}
        subtitle="Per prenotazione"
        icon={Target}
        color="purple"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retention Clienti</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.customerRetention.toFixed(1)}%</div>
          <Progress value={data.customerRetention} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Clienti che prenotano di nuovo
          </p>
        </CardContent>
      </Card>

      {/* Revenue per category breakdown */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Performance Riepilogo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Obiettivo Mensile</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(data.totalRevenue)} / {formatCurrency(50000)}
              </span>
            </div>
            <Progress value={(data.totalRevenue / 50000) * 100} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-xs text-muted-foreground">Migliore Prestazione</div>
                <div className="font-medium">Tasso Occupazione</div>
                <div className="text-xs text-green-600">
                  {data.occupancyRate.toFixed(1)}% questo mese
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Da Migliorare</div>
                <div className="font-medium">Valore Medio</div>
                <div className="text-xs text-orange-600">
                  +{formatCurrency(50)} vs target
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}