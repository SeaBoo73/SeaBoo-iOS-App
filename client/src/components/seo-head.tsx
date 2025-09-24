import { useLocation } from "wouter";
import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  canonical?: string;
}

export function SEOHead({ 
  title, 
  description, 
  keywords, 
  image,
  type = "website",
  canonical 
}: SEOHeadProps) {
  const [location] = useLocation();
  
  // Default SEO values for maritime platform
  const defaultTitle = "SeaBoo - Piattaforma Marittima per Noleggio Barche e Servizi Nautici in Italia";
  const defaultDescription = "Scopri la migliore piattaforma per noleggio barche, charter nautici e ormeggi in Italia. Esperienze maritime uniche, servizi professionali e la più ampia selezione di imbarcazioni.";
  const defaultKeywords = "noleggio barche Italia, charter nautico, ormeggi marittimi, barche a noleggio, servizi nautici, esperienze maritime, yacht charter, boat rental Italy";
  const defaultImage = "/attached_assets/ChatGPT Image 7 ago 2025, 07_13_19_1754546696908.png";
  
  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalImage = image || defaultImage;
  const finalCanonical = canonical || `https://seaboorentalboat.com${location}`;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateOrCreateMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic SEO meta tags
    updateOrCreateMeta('description', finalDescription);
    updateOrCreateMeta('keywords', finalKeywords);
    updateOrCreateMeta('robots', 'index, follow');
    updateOrCreateMeta('author', 'SeaBoo - Piattaforma Marittima');
    updateOrCreateMeta('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph tags for social sharing
    updateOrCreateMeta('og:title', finalTitle, true);
    updateOrCreateMeta('og:description', finalDescription, true);
    updateOrCreateMeta('og:image', finalImage, true);
    updateOrCreateMeta('og:url', finalCanonical, true);
    updateOrCreateMeta('og:type', type, true);
    updateOrCreateMeta('og:site_name', 'SeaBoo', true);
    updateOrCreateMeta('og:locale', 'it_IT', true);

    // Twitter Card tags
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', finalTitle);
    updateOrCreateMeta('twitter:description', finalDescription);
    updateOrCreateMeta('twitter:image', finalImage);

    // Maritime/Business specific tags
    updateOrCreateMeta('geo.region', 'IT');
    updateOrCreateMeta('geo.placename', 'Italia');
    updateOrCreateMeta('business.contact_data.country_name', 'Italy');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', finalCanonical);

  }, [finalTitle, finalDescription, finalKeywords, finalImage, finalCanonical, type, location]);

  return null;
}

// Page-specific SEO configurations
export const seoConfigs = {
  home: {
    title: "SeaBoo - Noleggio Barche e Charter Nautici in Italia | Piattaforma Marittima",
    description: "Scopri SeaBoo, la piattaforma leader per noleggio barche, charter nautici e servizi marittimi in Italia. Oltre 1000 imbarcazioni disponibili, esperienze uniche sul mare.",
    keywords: "noleggio barche Italia, charter nautico, boat rental, yacht charter Italia, barche a noleggio, servizi nautici, mare Italia"
  },
  esperienze: {
    title: "Esperienze Maritime Uniche in Italia | SeaBoo",
    description: "Vivi esperienze maritime indimenticabili con SeaBoo. Tramonti sul mare, pesca sportiva, cene a bordo, escursioni nautiche e molto altro lungo le coste italiane.",
    keywords: "esperienze maritime, escursioni in barca, pesca sportiva, tramonti sul mare, cene a bordo, attività nautiche Italia"
  },
  charter: {
    title: "Charter Nautico Professionale in Italia | SeaBoo",
    description: "Servizi di charter nautico professionale con skipper esperti. Yacht di lusso, barche a vela e motoscafi per le tue vacanze maritime in Italia.",
    keywords: "charter nautico Italia, yacht charter, charter con skipper, noleggio barche lusso, vacanze in barca Italia"
  },
  ormeggio: {
    title: "Ormeggi e Porti Turistici in Italia | SeaBoo",
    description: "Trova e prenota ormeggi sicuri nei migliori porti turistici d'Italia. Servizi portuali completi, assistenza 24/7 e posizioni strategiche lungo la costa.",
    keywords: "ormeggi Italia, porti turistici, ormeggi sicuri, servizi portuali, marina Italia, posto barca"
  },
  aiuto: {
    title: "Assistenza e Supporto Clienti | SeaBoo",
    description: "Centro assistenza SeaBoo: guide, FAQ, supporto clienti per noleggio barche e servizi nautici. Assistenza professionale per la tua esperienza marittima.",
    keywords: "assistenza nautica, supporto clienti, FAQ noleggio barche, aiuto servizi marittimi"
  }
};