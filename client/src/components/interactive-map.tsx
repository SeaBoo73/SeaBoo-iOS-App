import { useState, useRef, useEffect } from 'react';

// Porti reali del Lazio con coordinate GPS precise
const realPorts = [
  {
    id: 'porto-badino',
    name: 'Porto Badino',
    lat: 41.27454,
    lng: 13.05234,
    boats: 3,
    address: 'Via del Porto, Terracina LT',
    description: 'Porto turistico moderno',
    region: 'Lazio Sud'
  },
  {
    id: 'porto-ponza',
    name: 'Porto di Ponza',
    lat: 40.89919,
    lng: 12.96194,
    boats: 4,
    address: 'Via Roma, Ponza LT',
    description: 'Porto principale isola di Ponza',
    region: 'Isole Pontine'
  },
  {
    id: 'porto-ercole',
    name: 'Porto Ercole',
    lat: 42.39236,
    lng: 11.21139,
    boats: 2,
    address: 'Porto Ercole, Monte Argentario GR',
    description: 'Porto storico toscano',
    region: 'Confine Toscana'
  },
  {
    id: 'civitavecchia',
    name: 'Porto di Civitavecchia',
    lat: 42.09422,
    lng: 11.79391,
    boats: 5,
    address: 'Molo Vespucci, Civitavecchia RM',
    description: 'Porto principale del Lazio',
    region: 'Lazio Nord'
  },
  {
    id: 'gaeta',
    name: 'Porto di Gaeta',
    lat: 41.20581,
    lng: 13.56963,
    boats: 3,
    address: 'Via del Porto, Gaeta LT',
    description: 'Porto turistico del golfo',
    region: 'Golfo di Gaeta'
  },
  {
    id: 'anzio',
    name: 'Marina di Anzio',
    lat: 41.44711,
    lng: 12.62208,
    boats: 4,
    address: 'Porto Innocenziano, Anzio RM',
    description: 'Marina moderna vicino Roma',
    region: 'Lazio Centro'
  },
  {
    id: 'formia',
    name: 'Porto di Formia',
    lat: 41.25651,
    lng: 13.60578,
    boats: 2,
    address: 'Molo Turistico, Formia LT',
    description: 'Porto del golfo di Gaeta',
    region: 'Golfo di Gaeta'
  },
  {
    id: 'terracina',
    name: 'Porto di Terracina',
    lat: 41.28572,
    lng: 13.24431,
    boats: 3,
    address: 'Via del Porto Canale, Terracina LT',
    description: 'Porto storico del Lazio',
    region: 'Lazio Sud'
  }
];

export function InteractiveMap() {
  const [selectedPort, setSelectedPort] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Calcola posizione relativa sulla mappa
  const getPortPosition = (lat: number, lng: number) => {
    // Coordinate Italia: lat 35-47, lng 6-19
    const minLat = 35, maxLat = 47;
    const minLng = 6, maxLng = 19;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    
    // Applica zoom e centro mappa
    const zoomedX = (x - mapCenter.x) * zoomLevel + 50;
    const zoomedY = (y - mapCenter.y) * zoomLevel + 50;
    
    return { x: zoomedX, y: zoomedY };
  };

  // Gestione mouse per pan e zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = (e.clientX - dragStart.x) / 5;
    const deltaY = (e.clientY - dragStart.y) / 5;
    
    setMapCenter(prev => ({
      x: Math.max(-50, Math.min(150, prev.x - deltaX)),
      y: Math.max(-50, Math.min(150, prev.y - deltaY))
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(5, prev + delta)));
  };

  const resetView = () => {
    setZoomLevel(1);
    setMapCenter({ x: 50, y: 50 });
    setSelectedPort(null);
  };

  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 rounded-xl border-2 border-blue-200 relative overflow-hidden shadow-lg">
      
      {/* Sfondo mappa base */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-gradient-to-br from-blue-200/40 via-green-100/30 to-blue-300/50 relative transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) translate(${(mapCenter.x - 50) * -2}px, ${(mapCenter.y - 50) * -2}px)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Contorni Italia stilizzati */}
          <div className="absolute inset-0">
            <svg viewBox="0 0 400 400" className="w-full h-full opacity-30">
              <path
                d="M120 50 Q150 40 180 60 Q200 80 190 120 Q185 160 175 200 Q170 240 160 280 Q150 320 140 350 Q130 360 120 350 Q100 340 90 320 Q80 300 85 280 Q90 260 95 240 Q100 220 105 200 Q110 180 115 160 Q118 140 120 120 Q115 100 110 80 Q112 60 120 50 Z"
                fill="rgba(34, 197, 94, 0.2)"
                stroke="rgba(34, 197, 94, 0.4)"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Marker dei porti */}
          {realPorts.map((port) => {
            const position = getPortPosition(port.lat, port.lng);
            const isVisible = position.x >= -20 && position.x <= 120 && position.y >= -20 && position.y <= 120;
            
            if (!isVisible) return null;

            return (
              <div
                key={port.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-20 ${
                  selectedPort?.id === port.id ? 'scale-150' : 'scale-100 hover:scale-125'
                }`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPort(selectedPort?.id === port.id ? null : port);
                }}
              >
                {/* Marker principale */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 transition-all
                  ${selectedPort?.id === port.id 
                    ? 'bg-red-500 border-red-600 text-white shadow-red-200' 
                    : 'bg-blue-500 border-blue-600 text-white shadow-blue-200 hover:bg-blue-600'
                  }
                `}>
                  ⚓
                </div>
                
                {/* Label porto */}
                <div className={`
                  absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-all
                  ${selectedPort?.id === port.id || zoomLevel > 2 ? 'opacity-100' : 'opacity-0'}
                `}>
                  <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-800 shadow-md border">
                    {port.name.replace('Porto di ', '').replace('Marina di ', '')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controlli mappa */}
      <div className="absolute top-4 right-4 z-30 flex flex-col space-y-2">
        <button
          onClick={() => handleZoom(0.5)}
          className="w-10 h-10 bg-white/90 hover:bg-white rounded-lg shadow-lg flex items-center justify-center text-xl font-bold text-gray-700 hover:text-gray-900 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => handleZoom(-0.5)}
          className="w-10 h-10 bg-white/90 hover:bg-white rounded-lg shadow-lg flex items-center justify-center text-xl font-bold text-gray-700 hover:text-gray-900 transition-colors"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-white/90 hover:bg-white rounded-lg shadow-lg flex items-center justify-center text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors"
        >
          🏠
        </button>
      </div>

      {/* Info pannello */}
      <div className="absolute top-4 left-4 z-30 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs">
        <h4 className="font-bold text-gray-900 text-sm mb-2">🗺️ Mappa Interattiva SeaBoo</h4>
        <p className="text-xs text-gray-600 mb-2">
          Trascina per navigare • Zoom con + / −
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span>{realPorts.length} porti del Lazio</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span>Zoom: {zoomLevel.toFixed(1)}x</span>
          </div>
        </div>
      </div>

      {/* Dettagli porto selezionato */}
      {selectedPort && (
        <div className="absolute bottom-4 left-4 right-4 z-30 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">⚓ {selectedPort.name}</h4>
              <p className="text-sm text-gray-600">{selectedPort.description}</p>
              <p className="text-xs text-blue-600 font-medium mt-1">{selectedPort.region}</p>
            </div>
            <button
              onClick={() => setSelectedPort(null)}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <p className="text-gray-600 mb-1">📍 Coordinate GPS</p>
              <p className="font-medium">{selectedPort.lat.toFixed(4)}°N, {selectedPort.lng.toFixed(4)}°E</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">🚢 Barche disponibili</p>
              <p className="font-medium text-blue-600">{selectedPort.boats} imbarcazioni</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              📍 {selectedPort.address}
            </span>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Vedi barche disponibili
            </button>
          </div>
        </div>
      )}
    </div>
  );
}