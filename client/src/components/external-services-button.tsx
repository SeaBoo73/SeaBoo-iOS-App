import React from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, Fuel, Anchor, ArrowRight } from 'lucide-react';
import seabooLogo from "@assets/seaboo-logo.png";
import { Link } from 'wouter';

interface ExternalServicesButtonProps {
  variant?: "default" | "minimal" | "floating";
  showText?: boolean;
}

export function ExternalServicesButton({ variant = "default", showText = true }: ExternalServicesButtonProps) {
  if (variant === "floating") {
    return (
      <Button
        asChild
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full p-3 md:p-4"
        size="lg"
      >
        <Link href="/external-services">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            {showText && <span className="hidden md:inline font-medium">Servizi</span>}
          </div>
        </Link>
      </Button>
    );
  }

  if (variant === "minimal") {
    return (
      <Button variant="outline" size="sm" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
        <Link href="/external-services">
          <div className="flex items-center gap-2">
            <img src={seabooLogo} alt="SeaBoo" className="h-4 w-4 object-contain" />
            <span>Meteo & Servizi</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
      <Link href="/external-services">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <Cloud className="h-4 w-4" />
            <Fuel className="h-4 w-4" />
            <Anchor className="h-4 w-4" />
          </div>
          {showText && <span>Servizi Esterni</span>}
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </Button>
  );
}