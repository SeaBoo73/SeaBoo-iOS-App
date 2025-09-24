import { useEffect, useRef, useState } from 'react';

// Porti reali con coordinate GPS precise
const realPorts = [
  {
    id: 'porto-badino',
    name: 'Porto Badino',
    lat: 41.27454,
    lng: 13.05234,
    boats: 3,
    address: 'Via del Porto, Terracina LT',
    description: 'Porto turistico moderno con servizi completi'
  },
  {
    id: 'porto-ponza',
    name: 'Porto di Ponza',
    lat: 40.89919,
    lng: 12.96194,
    boats: 4,
    address: 'Via Roma, Ponza LT',
    description: 'Porto principale dell\'isola di Ponza'
  },
  {
    id: 'porto-ercole',
    name: 'Porto Ercole',
    lat: 42.39236,
    lng: 11.21139,
    boats: 2,
    address: 'Porto Ercole, Monte Argentario GR',
    description: 'Porto storico della costa toscana'
  },
  {
    id: 'civitavecchia',
    name: 'Porto di Civitavecchia',
    lat: 42.09422,
    lng: 11.79391,
    boats: 5,
    address: 'Molo Vespucci, Civitavecchia RM',
    description: 'Porto principale del Lazio settentrionale'
  },
  {
    id: 'gaeta',
    name: 'Porto di Gaeta',
    lat: 41.20581,
    lng: 13.56963,
    boats: 3,
    address: 'Via del Porto, Gaeta LT',
    description: 'Porto turistico nel golfo di Gaeta'
  },
  {
    id: 'anzio',
    name: 'Marina di Anzio',
    lat: 41.44711,
    lng: 12.62208,
    boats: 4,
    address: 'Porto Innocenziano, Anzio RM',
    description: 'Marina moderna vicino a Roma'
  },
  {
    id: 'formia',
    name: 'Porto di Formia',
    lat: 41.25651,
    lng: 13.60578,
    boats: 2,
    address: 'Molo Turistico, Formia LT',
    description: 'Porto del golfo di Gaeta'
  },
  {
    id: 'terracina',
    name: 'Porto di Terracina',
    lat: 41.28572,
    lng: 13.24431,
    boats: 3,
    address: 'Via del Porto Canale, Terracina LT',
    description: 'Porto storico del Lazio meridionale'
  }
];

interface MapViewProps {
  height?: string;
  initialZoom?: number;
  onPortSelect?: (port: any) => void;
}

declare global {
  interface Window {
    google: any;
    initSeaBooMap: () => void;
  }
}

export function MapView({ 
  height = "600px", 
  initialZoom = 7,
  onPortSelect 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [selectedPort, setSelectedPort] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) {
        console.error('Map container or Google Maps not available');
        return;
      }

      try {
        // Configura mappa con tutti i controlli di Google Maps
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: initialZoom,
          center: { lat: 41.8, lng: 12.5 }, // Centro Italia
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          gestureHandling: 'greedy',
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true,
          restriction: undefined, // Navigazione mondiale libera
        });

        setMapInstance(map);
        setIsLoading(false);

        // InfoWindow riutilizzabile
        const infoWindow = new window.google.maps.InfoWindow();

        // Aggiungi marker per ogni porto
        realPorts.forEach(port => {
          const marker = new window.google.maps.Marker({
            position: { lat: port.lat, lng: port.lng },
            map: map,
            title: port.name,
            icon: {
              url: "data:image/svg+xml;charset=UTF-8,%3csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' fill='%23dc2626'/%3e%3c/svg%3e",
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32)
            },
            animation: window.google.maps.Animation.DROP
          });

          // Click listener per marker
          marker.addListener('click', () => {
            const content = `
              <div style="max-width: 320px; padding: 16px; font-family: system-ui;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="font-size: 24px; margin-right: 8px;">⚓</span>
                  <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: bold;">
                    ${port.name}
                  </h3>
                </div>
                
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                  📍 ${port.address}
                </p>
                
                <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.4;">
                  ${port.description}
                </p>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                  <div style="display: flex; align-items: center;">
                    <span style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                      🚢 ${port.boats} barche disponibili
                    </span>
                  </div>
                  <button 
                    onclick="window.handlePortClick('${port.id}')"
                    style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background-color 0.2s;"
                    onmouseover="this.style.backgroundColor='#047857'"
                    onmouseout="this.style.backgroundColor='#059669'"
                  >
                    Vedi barche →
                  </button>
                </div>
              </div>
            `;
            
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
            setSelectedPort(port);
            
            // Callback opzionale
            if (onPortSelect) {
              onPortSelect(port);
            }
          });

          // Hover effect
          marker.addListener('mouseover', () => {
            marker.setAnimation(window.google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 700);
          });
        });

        // Gestione click sui bottoni InfoWindow
        window.handlePortClick = (portId: string) => {
          const port = realPorts.find(p => p.id === portId);
          if (port) {
            alert(`Apertura lista barche per ${port.name}\n${port.boats} imbarcazioni disponibili`);
          }
        };

        console.log('Google Maps inizializzata con successo!', realPorts.length, 'porti aggiunti');

      } catch (error) {
        console.error('Errore inizializzazione mappa:', error);
        setMapError('Errore nel caricamento della mappa');
        setIsLoading(false);
      }
    };

    // Carica Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || window.ENV?.GOOGLE_MAPS_API_KEY}&callback=initSeaBooMap&libraries=places`;
      script.async = true;
      script.defer = true;
      
      window.initSeaBooMap = initMap;
      
      script.addEventListener('error', () => {
        console.error('Errore caricamento Google Maps');
        setMapError('Impossibile caricare Google Maps');
        setIsLoading(false);
      });
      
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      // Cleanup
      if (window.handlePortClick) {
        delete window.handlePortClick;
      }
    };
  }, [initialZoom, onPortSelect]);

  if (isLoading) {
    return (
      <div 
        style={{ height }}
        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center border border-blue-200"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">Caricamento Google Maps</h3>
          <p className="text-blue-700">Preparando {realPorts.length} porti del Lazio...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div 
        style={{ height }}
        className="bg-red-50 rounded-xl flex items-center justify-center border border-red-200"
      >
        <div className="text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Errore Google Maps</h3>
          <p className="text-red-700">{mapError}</p>
          <p className="text-sm text-red-600 mt-2">Verifica la configurazione API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-xl border border-gray-200 shadow-lg"
      />
      
      {/* Overlay info */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs">
        <h4 className="font-bold text-gray-900 text-sm mb-1">🗺️ SeaBoo Maps</h4>
        <p className="text-xs text-gray-600 mb-2">
          Navigazione mondiale come Google Maps
        </p>
        <div className="flex items-center text-xs text-gray-500">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          <span>{realPorts.length} porti attivi</span>
        </div>
      </div>

      {/* Pannello dettagli porto */}
      {selectedPort && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">⚓ {selectedPort.name}</h4>
              <p className="text-sm text-gray-600">{selectedPort.description}</p>
            </div>
            <button 
              onClick={() => setSelectedPort(null)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              📍 {selectedPort.address}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              🚢 {selectedPort.boats} barche
            </span>
          </div>
        </div>
      )}
    </div>
  );
}