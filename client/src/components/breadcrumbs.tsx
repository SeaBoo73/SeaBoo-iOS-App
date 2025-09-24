import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const [location] = useLocation();
  
  // Auto-generate breadcrumbs based on current location if not provided
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;
    
    const pathSegments = location.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
    
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = getSegmentLabel(segment);
      breadcrumbs.push({ label, href });
    });
    
    return breadcrumbs;
  };
  
  const getSegmentLabel = (segment: string): string => {
    const labels: Record<string, string> = {
      'esperienze': 'Esperienze',
      'charter': 'Charter',
      'ormeggio': 'Ormeggio',
      'external-services': 'Servizi',
      'aiuto': 'Aiuto',
      'search': 'Ricerca',
      'boat': 'Dettaglio Barca',
      'booking': 'Prenotazione',
      'dashboard': 'Dashboard',
      'owner-dashboard': 'Dashboard Proprietario',
      'customer-dashboard': 'Dashboard Cliente',
      'register': 'Registrazione',
      'login': 'Accesso'
    };
    
    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  if (breadcrumbs.length <= 1) return null;
  
  // Generate structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://seaboo.replit.app${item.href}` : undefined
    }))
  };
  
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* Breadcrumb Navigation */}
      <nav 
        className="bg-white border-b border-gray-200 py-3" 
        aria-label="Breadcrumb"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
                
                {index === 0 ? (
                  <Link href={item.href || '/'} className="flex items-center text-gray-500 hover:text-ocean-blue">
                    <Home className="h-4 w-4 mr-1" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                ) : index === breadcrumbs.length - 1 ? (
                  <span 
                    className="text-gray-900 font-medium"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href || '#'} className="text-gray-500 hover:text-ocean-blue">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}