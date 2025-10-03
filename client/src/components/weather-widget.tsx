import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Wind, 
  Thermometer, 
  Eye,
  ArrowRight,
  MapPin
} from 'lucide-react';
import seabooLogo from "@assets/seaboo-logo.png";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  visibility: number;
  waves: {
    height: number;
    direction: number;
    period: number;
  };
}

export function WeatherWidget() {
  const { data: weatherData, isLoading } = useQuery<WeatherData>({
    queryKey: ['weather-widget', 'Roma'],
    queryFn: async () => {
      const response = await fetch('/api/external/weather?location=Roma');
      if (!response.ok) throw new Error('Failed to fetch weather');
      return response.json();
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const getWaveCondition = (height: number) => {
    if (height <= 0.5) return { text: 'Calmo', color: 'bg-green-500' };
    if (height <= 1.0) return { text: 'Leggero', color: 'bg-yellow-500' };
    if (height <= 2.0) return { text: 'Moderato', color: 'bg-orange-500' };
    return { text: 'Mosso', color: 'bg-red-500' };
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Cloud className="h-8 w-8 animate-pulse text-blue-500" />
            <span className="ml-2 text-blue-700">Caricamento meteo...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return null;
  }

  const waveCondition = getWaveCondition(weatherData.waves.height);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Condizioni Marine</h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-blue-700">
            <MapPin className="h-4 w-4" />
            <span>{weatherData.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <Thermometer className="h-6 w-6 mx-auto mb-1 text-orange-500" />
            <div className="text-xl font-bold text-gray-900">{weatherData.temperature}°C</div>
            <div className="text-xs text-gray-600 capitalize">{weatherData.description}</div>
          </div>
          
          <div className="text-center">
            <Wind className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <div className="text-xl font-bold text-gray-900">{weatherData.windSpeed} kn</div>
            <div className="text-xs text-gray-600">
              {getWindDirection(weatherData.windDirection)}
            </div>
          </div>
          
          <div className="text-center">
            <img src={seabooLogo} alt="SeaBoo" className="h-6 w-6 mx-auto mb-1 object-contain" />
            <div className="text-xl font-bold text-gray-900">{weatherData.waves.height} m</div>
            <Badge className={`${waveCondition.color} text-white text-xs`}>
              {waveCondition.text}
            </Badge>
          </div>
          
          <div className="text-center">
            <Eye className="h-6 w-6 mx-auto mb-1 text-purple-500" />
            <div className="text-xl font-bold text-gray-900">{weatherData.visibility} km</div>
            <div className="text-xs text-gray-600">Visibilità</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Navigazione:</span>
            <span className="ml-1">
              {weatherData.waves.height <= 0.5 && weatherData.windSpeed <= 10 
                ? 'Condizioni ottime' 
                : weatherData.waves.height <= 1.5 && weatherData.windSpeed <= 20
                ? 'Condizioni moderate'
                : 'Attenzione richiesta'
              }
            </span>
          </div>
          
          <Button variant="outline" size="sm" asChild className="text-blue-700 hover:text-blue-900">
            <Link href="/external-services">
              Dettagli completi
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}