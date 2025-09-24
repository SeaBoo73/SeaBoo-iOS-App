import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  Fuel, 
  Anchor, 
  ArrowRight,
  MapPin,
  Euro
} from 'lucide-react';
import { Link } from 'wouter';

export function ExternalServicesQuickAccess() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Weather Card */}
      <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Meteo Marino</h3>
              <p className="text-sm text-gray-600">Condizioni in tempo reale</p>
            </div>
          </div>
          <ul className="text-sm text-gray-700 space-y-1 mb-4">
            <li>• Previsioni onde e vento</li>
            <li>• Raccomandazioni navigazione</li>
            <li>• Visibilità e temperatura</li>
          </ul>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/external-services?tab=weather">
              Controlla meteo
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Fuel Prices Card */}
      <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Fuel className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Prezzi Carburante</h3>
              <p className="text-sm text-gray-600">Distributori nautici</p>
            </div>
          </div>
          <ul className="text-sm text-gray-700 space-y-1 mb-4">
            <li>• Benzina da €1.68/L</li>
            <li>• Gasolio da €1.58/L</li>
            <li>• Servizi e ormeggi</li>
          </ul>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/external-services?tab=fuel">
              Trova carburante
              <Euro className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Port Services Card */}
      <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Anchor className="h-8 w-8 text-teal-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Servizi Portuali</h3>
              <p className="text-sm text-gray-600">Marina del Lazio</p>
            </div>
          </div>
          <ul className="text-sm text-gray-700 space-y-1 mb-4">
            <li>• 5 porti principali</li>
            <li>• Disponibilità ormeggi</li>
            <li>• Contatti VHF diretti</li>
          </ul>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/external-services?tab=ports">
              Trova porto
              <MapPin className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}