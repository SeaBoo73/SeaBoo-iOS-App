import { useEffect, useRef, useState } from 'react';

// Porti reali del Lazio con coordinate GPS precise
const realPorts = [
  {
    id: 'porto-badino',
    name: 'Porto Badino',
    lat: 41.27454,
    lng: 13.05234,
    boats: 3,
    address: 'Via del Porto, Terracina LT'
  },
  {
    id: 'porto-ponza',
    name: 'Porto di Ponza',
    lat: 40.89919,
    lng: 12.96194,
    boats: 4,
    address: 'Via Roma, Ponza LT'
  },
  {
    id: 'porto-ercole', 
    name: 'Porto Ercole',
    lat: 42.39236,
    lng: 11.21139,
    boats: 2,
    address: 'Porto Ercole, Monte Argentario GR'
  },
  {
    id: 'civitavecchia',
    name: 'Porto di Civitavecchia',
    lat: 42.09422,
    lng: 11.79391,
    boats: 5,
    address: 'Molo Vespucci, Civitavecchia RM'
  },
  {
    id: 'gaeta',
    name: 'Porto di Gaeta',
    lat: 41.20581,
    lng: 13.56963,
    boats: 3,
    address: 'Via del Porto, Gaeta LT'
  },
  {
    id: 'anzio',
    name: 'Marina di Anzio',
    lat: 41.44711,
    lng: 12.62208,
    boats: 4,
    address: 'Porto Innocenziano, Anzio RM'
  },
  {
    id: 'formia',
    name: 'Porto di Formia',
    lat: 41.25651,
    lng: 13.60578,
    boats: 2,
    address: 'Molo Turistico, Formia LT'
  },
  {
    id: 'terracina',
    name: 'Porto di Terracina',
    lat: 41.28572,
    lng: 13.24431,
    boats: 3,
    address: 'Via del Porto Canale, Terracina LT'
  }
];

declare global {
  interface Window {
    google: any;
    initSeaGoMap: () => void;
  }
}

export function GoogleMapsFinal() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedPort, setSelectedPort] = useState<any>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Carica la mappa usando fetch per ottenere la chiave API dal server
        const response = await fetch('/api/config');
        const config = await response.json();
        
        if (!config.googleMapsApiKey) {
          console.error('Google Maps API key non trovata');
          return;
        }

        // Carica Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&callback=initSeaGoMap`;
        script.async = true;

        window.initSeaGoMap = () => {
          if (!mapRef.current || !window.google) return;

          const map = new window.google.maps.Map(mapRef.current, {
            zoom: 8,
            center: { lat: 41.8, lng: 12.5 },
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            gestureHandling: 'greedy',
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
          });

          setIsMapLoaded(true);

          // InfoWindow
          const infoWindow = new window.google.maps.InfoWindow();

          // Aggiungi marker per ogni porto
          realPorts.forEach(port => {
            const marker = new window.google.maps.Marker({
              position: { lat: port.lat, lng: port.lng },
              map: map,
              title: port.name,
              icon: {
                url: "data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' fill='%23dc2626'/%3e%3c/svg%3e",
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 24)
              }
            });

            marker.addListener('click', () => {
              const content = `
                <div style="padding: 12px; max-width: 280px;">
                  <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
                    ⚓ ${port.name}
                  </h3>
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                    📍 ${port.address}
                  </p>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                      ${port.boats} barche
                    </span>
                    <button 
                      onclick="alert('Lista barche ${port.name}')"
                      style="background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;"
                    >
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

          console.log('Google Maps caricata!', realPorts.length, 'porti aggiunti');
        };

        document.head.appendChild(script);

      } catch (error) {
        console.error('Errore caricamento mappa:', error);
      }
    };

    if (!window.google) {
      loadGoogleMaps();
    }

  }, []);

  if (!isMapLoaded) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">Caricamento Google Maps</h3>
          <p className="text-blue-700">Inizializzazione in corso...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef}
        className="w-full h-[600px] rounded-xl border border-gray-200 shadow-lg"
      />
      
      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <h4 className="font-bold text-gray-900 text-sm mb-1">🗺️ Google Maps SeaBoo</h4>
        <p className="text-xs text-gray-600 mb-2">
          Navigazione mondiale abilitata
        </p>
        <div className="flex items-center text-xs text-gray-500">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          <span>{realPorts.length} porti del Lazio</span>
        </div>
      </div>

      {/* Dettagli porto */}
      {selectedPort && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-gray-900">⚓ {selectedPort.name}</h4>
              <p className="text-sm text-gray-600">{selectedPort.address}</p>
            </div>
            <button 
              onClick={() => setSelectedPort(null)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              📍 GPS: {selectedPort.lat.toFixed(4)}°, {selectedPort.lng.toFixed(4)}°
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              🚢 {selectedPort.boats} barche
            </span>
          </div>
        </div>
      )}
    </div>
  );
}