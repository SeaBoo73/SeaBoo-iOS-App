import { useEffect, useRef, useState } from 'react';

// Porti reali del Lazio con coordinate GPS precise
const realPorts = [
  {
    id: 'porto-badino',
    name: 'Porto Badino',
    lat: 41.27454,
    lng: 13.05234,
    boats: 3,
    address: 'Via del Porto, Terracina LT',
    description: 'Porto turistico moderno'
  },
  {
    id: 'porto-ponza',
    name: 'Porto di Ponza',
    lat: 40.89919,
    lng: 12.96194,
    boats: 4,
    address: 'Via Roma, Ponza LT',
    description: 'Porto principale isola di Ponza'
  },
  {
    id: 'porto-ercole',
    name: 'Porto Ercole',
    lat: 42.39236,
    lng: 11.21139,
    boats: 2,
    address: 'Porto Ercole, Monte Argentario GR',
    description: 'Porto storico toscano'
  },
  {
    id: 'civitavecchia',
    name: 'Porto di Civitavecchia',
    lat: 42.09422,
    lng: 11.79391,
    boats: 5,
    address: 'Molo Vespucci, Civitavecchia RM',
    description: 'Porto principale del Lazio'
  },
  {
    id: 'gaeta',
    name: 'Porto di Gaeta',
    lat: 41.20581,
    lng: 13.56963,
    boats: 3,
    address: 'Via del Porto, Gaeta LT',
    description: 'Porto turistico del golfo'
  },
  {
    id: 'anzio',
    name: 'Marina di Anzio',
    lat: 41.44711,
    lng: 12.62208,
    boats: 4,
    address: 'Porto Innocenziano, Anzio RM',
    description: 'Marina moderna vicino Roma'
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
    description: 'Porto storico del Lazio'
  }
];

interface GoogleMapCleanProps {
  height?: string;
  initialZoom?: number;
  centerLat?: number;
  centerLng?: number;
}

declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

export function GoogleMapClean({ 
  height = "500px", 
  initialZoom = 7,
  centerLat = 41.8,
  centerLng = 12.5
}: GoogleMapCleanProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [selectedPort, setSelectedPort] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
        // Configura mappa con controlli completi come Google Maps
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: initialZoom,
          center: { lat: centerLat, lng: centerLng },
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          gestureHandling: 'greedy', // Permette zoom e drag liberi
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true,
          restriction: undefined, // Nessuna restrizione = mondo intero navigabile
        });

        setMapInstance(map);
        setIsLoading(false);

        // Crea InfoWindow riutilizzabile
        const infoWindow = new window.google.maps.InfoWindow();

        // Aggiungi marker per ogni porto reale
        realPorts.forEach(port => {
          const marker = new window.google.maps.Marker({
            position: { lat: port.lat, lng: port.lng },
            map: map,
            title: port.name,
            icon: {
              url: "data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' fill='%232563eb'/%3e%3c/svg%3e",
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32)
            }
          });

          // Click sul marker apre dettagli porto
          marker.addListener('click', () => {
            const content = `
              <div style="max-width: 300px; padding: 12px;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: bold;">
                  ⚓ ${port.name}
                </h3>
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                  📍 ${port.address}
                </p>
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
                  ${port.description}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    🚢 ${port.boats} barche disponibili
                  </span>
                  <button onclick="alert('Apertura lista barche per ${port.name}')" style="background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                    Vedi barche
                  </button>
                </div>
              </div>
            `;
            
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
            setSelectedPort(port);
          });
        });

        console.log('Google Maps caricata con successo!', realPorts.length, 'porti aggiunti');

      } catch (error) {
        console.error('Errore inizializzazione mappa:', error);
        setIsLoading(false);
      }
    };

    // Carica Google Maps API se non è già caricata
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initGoogleMap&libraries=marker`;
      script.async = true;
      script.defer = true;
      
      window.initGoogleMap = initMap;
      
      script.addEventListener('load', () => {
        console.log('Script Google Maps caricato');
      });
      
      script.addEventListener('error', (e) => {
        console.error('Errore caricamento script Google Maps:', e);
        setIsLoading(false);
      });
      
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      // Cleanup se necessario
    };
  }, [initialZoom, centerLat, centerLng]);

  if (isLoading) {
    return (
      <div 
        style={{ height }}
        className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center border-2 border-blue-300"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-blue-800 font-medium">Caricamento Google Maps...</p>
          <p className="text-blue-600 text-sm mt-2">Preparando {realPorts.length} porti del Lazio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg border-2 border-gray-200 shadow-lg"
      />
      
      {/* Pannello informazioni in overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs">
        <h4 className="font-bold text-gray-900 text-sm mb-2">🧭 Mappa Navigabile SeaBoo</h4>
        <p className="text-xs text-gray-600 mb-2">
          Esplora liberamente il mondo come Google Maps
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span>{realPorts.length} porti reali del Lazio</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span>Zoom mondiale abilitato</span>
          </div>
        </div>
      </div>

      {/* Pannello dettagli porto selezionato */}
      {selectedPort && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-900">{selectedPort.name}</h4>
            <button 
              onClick={() => setSelectedPort(null)}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">{selectedPort.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              📍 {selectedPort.address}
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              🚢 {selectedPort.boats} barche
            </span>
          </div>
        </div>
      )}
    </div>
  );
}