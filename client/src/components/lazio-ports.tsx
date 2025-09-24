import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin } from "lucide-react";
import seabooLogo from "@assets/ChatGPT Image 7 ago 2025, 07_13_19_1754546696908.png";

const lazioPortsData = [
  {
    name: "Gaeta",
    type: "Porto Principale",
    description: "Il porto più importante del Lazio meridionale",
    features: ["250 posti barca", "Imbarcazioni fino a 60m", "Servizi completi"]
  },
  {
    name: "Terracina",
    type: "Porto Commerciale",
    description: "Collegamenti con Ponza e Ventotene",
    features: ["Collegamenti isole", "Traghetti e aliscafi", "2h 30min per Ponza"]
  },
  {
    name: "San Felice Circeo",
    type: "Porto Turistico",
    description: "340 posti barca nel cuore del Parco Nazionale",
    features: ["340 posti barca", "Lunghezza max 22m", "1h per Ponza"]
  },
  {
    name: "Ponza",
    type: "Isola Pontina",
    description: "Destinazione principale dell'arcipelago pontino",
    features: ["Collegamenti tutto l'anno", "Multiple compagnie", "Prezzi da 23€"]
  },
  {
    name: "Formia",
    type: "Porto Commerciale",
    description: "Collegamenti attivi tutto l'anno per le isole",
    features: ["Servizio annuale", "Traghetti e aliscafi", "Multiple rotte"]
  },
  {
    name: "Anzio",
    type: "Porto Storico",
    description: "Collegamenti estivi per Ponza e Ventotene",
    features: ["Servizio estivo", "Giugno-Settembre", "Rotte turistiche"]
  },
  {
    name: "Ventotene",
    type: "Isola Pontina",
    description: "Seconda isola dell'arcipelago pontino",
    features: ["Servizio regolare", "Ambiente incontaminato", "Riserva marina"]
  },
  {
    name: "Sperlonga",
    type: "Porto Turistico",
    description: "Borgo marinaro con spiagge cristalline",
    features: ["Piccolo porto", "Spiagge premiate", "Centro storico"]
  }
];

interface LazioPortsProps {
  onPortSelect?: (port: string) => void;
  selectedPort?: string;
}

export function LazioPorts({ onPortSelect, selectedPort }: LazioPortsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-ocean-blue/10 rounded-full">
              <MapPin className="h-5 w-5 text-ocean-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Porti del Lazio</h3>
              <p className="text-sm text-gray-600">
                {selectedPort ? `Selezionato: ${selectedPort}` : "Esplora per località"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <img src={seabooLogo} alt="SeaBoo" className="h-4 w-4 object-contain" />
            <span className="text-sm font-medium text-ocean-blue">
              {isExpanded ? "Nascondi" : "Mostra"}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <ScrollArea className="h-64">
            <div className="p-4 space-y-3">
              <Button
                variant={selectedPort === "tutti" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onPortSelect?.("tutti")}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Tutti i porti
              </Button>
              
              {lazioPortsData.map((port) => (
                <div
                  key={port.name}
                  className={`p-3 rounded-lg border border-gray-200 hover:border-ocean-blue transition-colors cursor-pointer ${
                    selectedPort === port.name ? "bg-ocean-blue/5 border-ocean-blue" : "hover:bg-gray-50"
                  }`}
                  onClick={() => onPortSelect?.(port.name)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{port.name}</h4>
                      <p className="text-xs text-ocean-blue font-medium">{port.type}</p>
                      <p className="text-sm text-gray-600 mt-1">{port.description}</p>
                    </div>
                    <div className="ml-3">
                      <MapPin className={`h-4 w-4 ${selectedPort === port.name ? "text-ocean-blue" : "text-gray-400"}`} />
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {port.features.slice(0, 2).map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}