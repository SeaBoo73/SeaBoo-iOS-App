import { useState } from 'react';

interface Port {
  id: string;
  name: string;
  lat: number;
  lng: number;
  boats: number;
  priceRange: string;
  description: string;
  icon: string;
}

const lazioCoastPorts: Port[] = [
  {
    id: 'civitavecchia',
    name: 'Porto di Civitavecchia',
    lat: 42.0942,
    lng: 11.7939,
    boats: 4,
    priceRange: '€280 - €1200',
    description: 'Porto principale del Lazio',
    icon: '⚓'
  },
  {
    id: 'gaeta',
    name: 'Porto di Gaeta',
    lat: 41.2058,
    lng: 13.5696,
    boats: 2,
    priceRange: '€280 - €850',
    description: 'Località turistica rinomata',
    icon: '⚓'
  },
  {
    id: 'ponza',
    name: 'Porto di Ponza',
    lat: 40.8992,
    lng: 12.9619,
    boats: 2,
    priceRange: '€550 - €950',
    description: 'Isola paradisiaca',
    icon: '🏝️'
  },
  {
    id: 'terracina',
    name: 'Porto di Terracina',
    lat: 41.2857,
    lng: 13.2443,
    boats: 2,
    priceRange: '€320 - €580',
    description: 'Costa laziale storica',
    icon: '🏛️'
  },
  {
    id: 'anzio',
    name: 'Marina di Anzio',
    lat: 41.4471,
    lng: 12.6221,
    boats: 3,
    priceRange: '€200 - €750',
    description: 'Porto turistico moderno',
    icon: '🏖️'
  },
  {
    id: 'formia',
    name: 'Porto di Formia',
    lat: 41.2565,
    lng: 13.6058,
    boats: 2,
    priceRange: '€300 - €600',
    description: 'Golfo di Gaeta',
    icon: '🌊'
  }
];

export function LazioInteractiveMap() {
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [hoveredPort, setHoveredPort] = useState<string | null>(null);

  // Calcola posizione relativa sulla mappa del Lazio
  const getPosition = (lat: number, lng: number) => {
    // Boundaries approssimativi del Lazio costiero
    const minLat = 40.8;
    const maxLat = 42.2;
    const minLng = 11.6;
    const maxLng = 13.8;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    
    return { x: Math.min(Math.max(x, 5), 95), y: Math.min(Math.max(y, 5), 95) };
  };

  return (
    <div className="w-full h-96 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-200 rounded-xl overflow-hidden border-2 border-blue-200 relative">
      {/* Sfondo Mare */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-cyan-300/20 to-blue-500/20"></div>
      
      {/* Contenuto Mappa */}
      <div className="relative w-full h-full">
        {/* Titolo */}
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-1">🗺️ Mappa Interattiva del Lazio</h3>
            <p className="text-sm text-gray-600">Clicca sui porti per vedere dettagli e barche disponibili</p>
          </div>
        </div>

        {/* Porti sulla mappa */}
        {lazioCoastPorts.map((port) => {
          const position = getPosition(port.lat, port.lng);
          const isHovered = hoveredPort === port.id;
          const isSelected = selectedPort?.id === port.id;

          return (
            <div
              key={port.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10 ${
                isHovered || isSelected ? 'scale-125' : 'scale-100'
              }`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
              onMouseEnter={() => setHoveredPort(port.id)}
              onMouseLeave={() => setHoveredPort(null)}
              onClick={() => setSelectedPort(selectedPort?.id === port.id ? null : port)}
            >
              {/* Marker del porto */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border-2 transition-all
                ${isSelected ? 'bg-red-500 border-red-600 text-white' : 
                  isHovered ? 'bg-blue-500 border-blue-600 text-white' : 
                  'bg-white border-blue-400 text-blue-600'}
              `}>
                {port.icon}
              </div>
              
              {/* Label del porto */}
              <div className={`
                absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-all
                ${isHovered || isSelected ? 'opacity-100' : 'opacity-80'}
              `}>
                <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-800 shadow-md">
                  {port.name.replace('Porto di ', '').replace('Marina di ', '')}
                </div>
              </div>
            </div>
          );
        })}

        {/* Dettagli porto selezionato */}
        {selectedPort && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-blue-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{selectedPort.name}</h4>
                  <p className="text-sm text-gray-600">{selectedPort.description}</p>
                </div>
                <button
                  onClick={() => setSelectedPort(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">📍 Coordinate GPS</p>
                  <p className="font-medium">{selectedPort.lat.toFixed(4)}°N, {selectedPort.lng.toFixed(4)}°E</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">🚢 Barche disponibili</p>
                  <p className="font-medium text-blue-600">{selectedPort.boats} imbarcazioni</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-1">💰 Range prezzi giornalieri</p>
                <p className="font-bold text-green-600 text-lg">{selectedPort.priceRange}</p>
              </div>
            </div>
          </div>
        )}

        {/* Legenda */}
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">Legenda</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Porto attivo</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Selezionato</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}