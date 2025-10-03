import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Fuel, 
  Anchor,
  ChevronDown,
  MapPin,
  Users
} from 'lucide-react';
import seabooLogo from "@assets/seaboo-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'wouter';

export function ServicesNavButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sea-gray hover:text-deep-navy transition-colors font-medium">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Servizi
            <ChevronDown className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-blue-700">Servizi per la Navigazione</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/external-services?tab=weather" className="w-full">
            <div className="flex items-center gap-3 w-full">
              <Cloud className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium">Meteo Marino</div>
                <div className="text-xs text-gray-500">Condizioni in tempo reale</div>
              </div>
              <Badge variant="outline" className="text-xs">Live</Badge>
            </div>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/external-services?tab=fuel" className="w-full">
            <div className="flex items-center gap-3 w-full">
              <Fuel className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <div className="font-medium">Prezzi Carburante</div>
                <div className="text-xs text-gray-500">Distributori nautici</div>
              </div>
              <Badge variant="outline" className="text-xs">€1.58+</Badge>
            </div>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/external-services?tab=ports" className="w-full">
            <div className="flex items-center gap-3 w-full">
              <Anchor className="h-5 w-5 text-teal-600" />
              <div className="flex-1">
                <div className="font-medium">Servizi Portuali</div>
                <div className="text-xs text-gray-500">5 marine del Lazio</div>
              </div>
              <Badge variant="outline" className="text-xs">VHF</Badge>
            </div>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/external-services?tab=marine" className="w-full">
            <div className="flex items-center gap-3 w-full">
              <img src={seabooLogo} alt="SeaBoo" className="h-5 w-5 object-contain" />
              <div className="flex-1">
                <div className="font-medium">Condizioni Marine</div>
                <div className="text-xs text-gray-500">Onde, vento, visibilità</div>
              </div>
              <Badge variant="outline" className="text-xs">API</Badge>
            </div>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/external-services?tab=partners" className="w-full">
            <div className="flex items-center gap-3 w-full">
              <Users className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <div className="font-medium">Partner Ufficiali</div>
                <div className="text-xs text-gray-500">Capuano Trasporti e altri</div>
              </div>
              <Badge variant="outline" className="text-xs">Verificato</Badge>
            </div>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/external-services" className="w-full">
            <div className="flex items-center gap-3 w-full">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <div className="font-medium">Tutti i Servizi</div>
                <div className="text-xs text-gray-500">Dashboard completa</div>
              </div>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}