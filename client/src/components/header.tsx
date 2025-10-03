import { useAuth } from "@/hooks/use-auth";
import { NotificationsCenter } from "@/components/notifications-center";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ServicesNavButton } from "./services-nav-button";
import { Link, useLocation } from "wouter";
import { Anchor, Menu, User, Bot, X, Sunset, Sparkles, Ship } from "lucide-react";
import { useState } from "react";
// Logo SeaBoo da public folder

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center h-10 w-10 bg-blue-600 rounded-lg">
                <span className="text-white font-bold text-lg">⚓</span>
              </div>
              <span className="text-xl font-bold" style={{ color: '#022237' }}>SeaBoo</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center space-x-1">
              <Link 
                href="/" 
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                  location === "/" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Ship className="h-4 w-4" />
                Esplora
              </Link>
              <Link 
                href="/esperienze" 
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                  location === "/esperienze" || location === "/charter"
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Esperienze
              </Link>
              <Link 
                href="/ormeggio" 
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                  location === "/ormeggio" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Anchor className="h-4 w-4" />
                Ormeggio
              </Link>
              <Link 
                href="/ia" 
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                  location === "/ia" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Bot className="h-4 w-4" />
                IA
              </Link>
              <ServicesNavButton />
              <Link 
                href="/aiuto" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location === "/aiuto" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Aiuto
              </Link>
              {user?.role === "owner" && (
                <Link 
                  href="/owner-dashboard" 
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location === "/owner-dashboard" 
                      ? "text-blue-600 border-b-2 border-blue-600" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Dashboard Sea Host
                </Link>
              )}
              {user?.role === "customer" && (
                <Button variant="ghost" asChild className="px-2 py-1 text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100">
                  <Link href="/diventa-noleggiatore">
                    Diventa noleggiatore
                  </Link>
                </Button>
              )}
            </div>
          </nav>

          {/* Right Side - Auth & Notifications */}
          <div className="flex items-center space-x-3">
            {user && <NotificationsCenter />}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link 
                      href={user.role === "owner" ? "/owner-dashboard?tab=profile" : "/customer-dashboard?tab=profile"} 
                      className="flex items-center gap-2 w-full"
                    >
                      <User className="h-4 w-4" />
                      Il mio profilo
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href={user.role === "owner" ? "/owner-dashboard?tab=bookings" : "/customer-dashboard"} 
                      className="flex items-center gap-2 w-full"
                    >
                      <Sunset className="h-4 w-4" />
                      Le mie prenotazioni
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    Disconnetti
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth">Accedi</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth">Registrati</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              <Link 
                href="/" 
                className={`block px-3 py-2 rounded-md font-medium ${
                  location === "/" 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Esplora
                </div>
              </Link>
              
              <Link 
                href="/esperienze" 
                className={`block px-3 py-2 rounded-md font-medium ${
                  location === "/esperienze" || location === "/charter"
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Esperienze
                </div>
              </Link>
              
              <Link 
                href="/ormeggio" 
                className={`block px-3 py-2 rounded-md font-medium ${
                  location === "/ormeggio" 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Anchor className="h-4 w-4" />
                  Ormeggio
                </div>
              </Link>
              
              <Link 
                href="/ia" 
                className={`block px-3 py-2 rounded-md font-medium ${
                  location === "/ia" 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  IA
                </div>
              </Link>
              
              <Link 
                href="/external-services" 
                className={`block px-3 py-2 rounded-md font-medium ${
                  location === "/external-services" 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Servizi
              </Link>
              
              <Link 
                href="/aiuto" 
                className={`block px-3 py-2 rounded-md font-medium ${
                  location === "/aiuto" 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Aiuto
              </Link>
            </div>

            {/* Mobile User Section */}
            {user ? (
              <div className="mt-4 pt-4 border-t space-y-2">
                {user.role === "owner" && (
                  <Link 
                    href="/owner-dashboard" 
                    className="block px-3 py-2 rounded-md font-medium text-sea-gray hover:text-deep-navy hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard Sea Host
                  </Link>
                )}
                {user.role === "customer" && (
                  <Link 
                    href="/customer-dashboard" 
                    className="block px-3 py-2 rounded-md font-medium text-sea-gray hover:text-deep-navy hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Area Clienti
                  </Link>
                )}
                {user.role === "customer" && (
                  <Button variant="ghost" asChild className="w-full justify-start text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100">
                    <Link href="/diventa-noleggiatore" onClick={() => setIsMobileMenuOpen(false)}>
                      Diventa noleggiatore
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 hover:text-red-800"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Disconnetti
                </Button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t space-y-2">
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    Accedi
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    Registrati
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}