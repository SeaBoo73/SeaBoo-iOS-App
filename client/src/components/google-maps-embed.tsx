import { useEffect, useRef, useState } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface BoatMarker {
  id: number;
  name: string;
  type: string;
  port: string;
  price: string;
  lat: number;
  lng: number;
}

const lazioBoats: BoatMarker[] = [
  { id: 1, name: "Azimut 55 Luxury", type: "Yacht", port: "Civitavecchia", price: "€850", lat: 42.0942, lng: 11.7965 },
  { id: 2, name: "Bavaria 46 Cruiser", type: "Barca a vela", port: "Gaeta", price: "€320", lat: 41.2133, lng: 13.5681 },
  { id: 3, name: "Zodiac Pro 650", type: "Gommone", port: "Anzio", price: "€180", lat: 41.4498, lng: 12.6219 },
  { id: 4, name: "Jeanneau Sun Fast", type: "Barca a vela", port: "Terracina", price: "€280", lat: 41.2906, lng: 13.2434 },
  { id: 5, name: "Catamaran Lagoon", type: "Catamarano", port: "Ponza", price: "€650", lat: 40.9003, lng: 12.9667 },
  { id: 6, name: "Princess V58", type: "Yacht", port: "Formia", price: "€950", lat: 41.2567, lng: 13.6056 }
];

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function GoogleMapsEmbed() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Set up callback
      window.initMap = () => {
        initializeMap();
      };

      script.onerror = () => {
        console.error('Errore nel caricamento di Google Maps');
        setError(true);
      };

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 9,
          center: { lat: 41.5, lng: 12.8 },
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#0C9FE2" }]
            }
          ]
        });

        // Add markers for boats
        lazioBoats.forEach((boat) => {
          const marker = new window.google.maps.Marker({
            position: { lat: boat.lat, lng: boat.lng },
            map: map,
            title: boat.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#0C9FE2" stroke="#ffffff" stroke-width="2"/>
                  <path d="M10 16 L16 12 L22 16 L16 20 Z" fill="#ffffff"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 16)
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 200px; font-family: system-ui;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b; font-size: 16px;">${boat.name}</h3>
                <p style="margin: 0 0 6px 0; color: #64748b; font-size: 14px;">${boat.type} • ${boat.port}</p>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
                  <span style="font-weight: bold; color: #f97316; font-size: 16px;">${boat.price}/giorno</span>
                  <button onclick="window.location.href='/boats/${boat.id}'" 
                          style="background: #0C9FE2; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                    Vedi dettagli
                  </button>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        });

        setIsLoaded(true);
      } catch (error) {
        console.error('Errore nell\'inizializzazione della mappa:', error);
        setError(true);
      }
    };

    loadGoogleMaps();
  }, []);

  if (error) {
    return (
      <div className="h-96 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Errore nel caricamento della mappa</h3>
          <p className="text-gray-600">Si prega di ricaricare la pagina</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-96 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">Caricamento Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-xl overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}