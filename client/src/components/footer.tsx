import { Link } from "wouter";
import { Anchor, Instagram, Globe } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import seabooLogo from "@assets/WhatsApp Image 2025-08-19 at 12.38.33_1757318764148.jpeg";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <img 
                src={seabooLogo} 
                alt="SeaBoo Logo" 
                className="h-8 w-8 rounded object-cover"
              />
              <h3 className="text-2xl font-bold leading-none -mt-1 text-white">
                SeaBoo
              </h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              La piattaforma leader per il noleggio barche e servizi ormeggi. 
              Scopri il mare come mai prima d'ora.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/seaboo_italia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://tiktok.com/@seaboo_italia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <SiTiktok size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Servizi</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Prenota una barca</Link></li>
              <li><Link to="/diventa-noleggiatore" className="hover:text-white transition-colors">Diventa Sea Host</Link></li>
              <li><Link to="/assicurazione" className="hover:text-white transition-colors">Assicurazione</Link></li>
              <li><Link to="/recensioni-user" className="hover:text-white transition-colors">Recensioni</Link></li>
            </ul>
          </div>

          {/* Prenotazioni */}
          <div>
            <h4 className="font-semibold mb-4">Prenotazioni</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/come-prenotare" className="hover:text-white transition-colors">Come prenotare</Link></li>
              <li><Link to="/modifica-prenotazione" className="hover:text-white transition-colors">Modifica prenotazione</Link></li>
              <li><Link to="/politiche-cancellazione" className="hover:text-white transition-colors">Politiche di cancellazione</Link></li>
              <li><Link to="/documenti" className="hover:text-white transition-colors">Documenti richiesti</Link></li>
            </ul>
          </div>

          {/* Pagamenti */}
          <div>
            <h4 className="font-semibold mb-4">Pagamenti</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/metodi-pagamento" className="hover:text-white transition-colors">Metodi di pagamento</Link></li>
              <li><Link to="/sicurezza-pagamenti" className="hover:text-white transition-colors">Sicurezza pagamenti</Link></li>
              <li><Link to="/rimborsi" className="hover:text-white transition-colors">Rimborsi</Link></li>
              <li><Link to="/fatturazione" className="hover:text-white transition-colors">Fatturazione</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Supporto</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/aiuto" className="hover:text-white transition-colors">Centro assistenza</Link></li>
              <li><Link to="/contatti" className="hover:text-white transition-colors">Contatti</Link></li>
              <li><Link to="/emergency-system" className="hover:text-white transition-colors">Emergenze</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © 2025 SeaBoo. Tutti i diritti riservati.
              </p>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/termini" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Termini di Servizio
                </Link>
                <Link to="/cookie" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Anchor className="h-4 w-4" />
              <span>Prezzi in € EUR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}