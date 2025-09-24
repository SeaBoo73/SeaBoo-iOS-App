import { useLocation } from "wouter";

interface StructuredDataProps {
  type: 'homepage' | 'esperienze' | 'charter' | 'ormeggio' | 'boat-details' | 'service-page';
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const [location] = useLocation();
  
  const getStructuredData = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 
                   (import.meta.env.VITE_CUSTOM_DOMAIN ? `https://${import.meta.env.VITE_CUSTOM_DOMAIN}` : 'https://seaboorentalboat.com');
    
    switch (type) {
      case 'homepage':
        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${baseUrl}/#organization`,
              "name": "SeaBoo",
              "url": baseUrl,
              "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/attached_assets/ChatGPT Image 7 ago 2025, 07_13_19_1754546696908.png`
              },
              "description": "Piattaforma marittima leader per noleggio barche, charter nautici e servizi marittimi in Italia",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IT"
              },
              "serviceArea": {
                "@type": "Country",
                "name": "Italy"
              }
            },
            {
              "@type": "WebSite",
              "@id": `${baseUrl}/#website`,
              "url": baseUrl,
              "name": "SeaBoo - Piattaforma Marittima",
              "description": "Noleggio barche, charter nautici e servizi marittimi in Italia",
              "publisher": {
                "@id": `${baseUrl}/#organization`
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${baseUrl}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "Service",
              "@id": `${baseUrl}/#service`,
              "name": "Servizi di Noleggio Barche e Charter Nautici",
              "provider": {
                "@id": `${baseUrl}/#organization`
              },
              "serviceType": "Boat Rental and Charter Services",
              "areaServed": {
                "@type": "Country",
                "name": "Italy"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Catalogo Imbarcazioni",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Noleggio Yacht",
                      "category": "Yacht Charter"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Noleggio Barche a Vela",
                      "category": "Sailboat Rental"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Charter con Skipper",
                      "category": "Skippered Charter"
                    }
                  }
                ]
              }
            }
          ]
        };
        
      case 'esperienze':
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${baseUrl}/esperienze`,
          "url": `${baseUrl}/esperienze`,
          "name": "Esperienze Maritime Uniche in Italia | SeaBoo",
          "description": "Vivi esperienze maritime indimenticabili: tramonti sul mare, pesca sportiva, cene a bordo, escursioni nautiche lungo le coste italiane",
          "mainEntity": {
            "@type": "TouristTrip",
            "name": "Esperienze Maritime SeaBoo",
            "description": "Collezione di esperienze nautiche uniche in Italia",
            "provider": {
              "@type": "Organization",
              "name": "SeaBoo"
            },
            "itinerary": [
              {
                "@type": "TouristAttraction",
                "name": "Tramonti in Barca",
                "description": "Gite al tramonto con aperitivo a bordo"
              },
              {
                "@type": "TouristAttraction",
                "name": "Tour delle Isole Nascoste",
                "description": "Esplorazioni di calette e baie accessibili solo via mare"
              },
              {
                "@type": "TouristAttraction",
                "name": "Pesca Sportiva",
                "description": "Escursioni di pesca con attrezzature professionali"
              }
            ]
          }
        };
        
      case 'charter':
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${baseUrl}/charter`,
          "url": `${baseUrl}/charter`,
          "name": "Charter Nautico Professionale in Italia | SeaBoo",
          "description": "Servizi di charter nautico professionale con skipper esperti. Yacht di lusso, barche a vela e motoscafi per le tue vacanze maritime",
          "mainEntity": {
            "@type": "Service",
            "name": "Servizi Charter Nautico",
            "provider": {
              "@type": "Organization",
              "name": "SeaBoo"
            },
            "serviceType": "Nautical Charter Services",
            "areaServed": {
              "@type": "Country",
              "name": "Italy"
            },
            "offers": [
              {
                "@type": "Offer",
                "name": "Charter Settimanale con Skipper",
                "description": "Crociere di una settimana con skipper professionali",
                "priceRange": "€2500-€5000",
                "availability": "https://schema.org/InStock"
              },
              {
                "@type": "Offer", 
                "name": "Weekend in Catamarano",
                "description": "Fughe di fine settimana su catamarani spaziosi",
                "priceRange": "€1200-€2500",
                "availability": "https://schema.org/InStock"
              }
            ]
          }
        };
        
      case 'ormeggio':
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${baseUrl}/ormeggio`,
          "url": `${baseUrl}/ormeggio`,
          "name": "Ormeggi e Porti Turistici in Italia | SeaBoo",
          "description": "Trova e prenota ormeggi sicuri nei migliori porti turistici d'Italia. Servizi portuali completi, assistenza 24/7",
          "mainEntity": {
            "@type": "Service",
            "name": "Servizi di Ormeggio",
            "provider": {
              "@type": "Organization",
              "name": "SeaBoo"
            },
            "serviceType": "Marina and Mooring Services",
            "areaServed": {
              "@type": "Country",
              "name": "Italy"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Catalogo Ormeggi",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Ormeggio Pontile",
                    "description": "Ormeggi su pontile con servizi completi"
                  },
                  "priceRange": "€350-€700"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service", 
                    "name": "Ormeggio su Boa",
                    "description": "Ormeggi su boa economici"
                  },
                  "priceRange": "€120-€200"
                }
              ]
            }
          }
        };
        
      case 'boat-details':
        if (!data) return null;
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${baseUrl}/boat/${data.id}`,
          "name": data.name,
          "description": data.description,
          "category": "Boat Rental",
          "brand": {
            "@type": "Brand",
            "name": data.manufacturer || "SeaBoo"
          },
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "SeaBoo"
            }
          },
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Boat Type",
              "value": data.type
            },
            {
              "@type": "PropertyValue",
              "name": "Capacity",
              "value": data.capacity
            },
            {
              "@type": "PropertyValue",
              "name": "Location",
              "value": data.port
            }
          ]
        };
        
      case 'service-page':
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${baseUrl}/external-services`,
          "url": `${baseUrl}/external-services`,
          "name": "Servizi Nautici Esterni - Meteo, Carburante, Porti | SeaBoo",
          "description": "Servizi marittimi completi: meteo marino, carburante nautico, porti e condizioni marine",
          "mainEntity": {
            "@type": "Service",
            "name": "Servizi Nautici Esterni",
            "provider": {
              "@type": "Organization",
              "name": "SeaBoo"
            },
            "serviceType": "External Maritime Services",
            "areaServed": {
              "@type": "Country",
              "name": "Italy"
            },
            "offers": [
              {
                "@type": "Offer",
                "name": "Servizi Meteo Marino",
                "description": "Previsioni meteo marine in tempo reale"
              },
              {
                "@type": "Offer",
                "name": "Prezzi Carburante Nautico",
                "description": "Prezzi aggiornati del carburante nei porti italiani"
              },
              {
                "@type": "Offer",
                "name": "Servizi Portuali",
                "description": "Informazioni su disponibilità e servizi dei porti"
              }
            ]
          }
        };
        
      default:
        return null;
    }
  };

  const structuredData = getStructuredData();
  
  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}