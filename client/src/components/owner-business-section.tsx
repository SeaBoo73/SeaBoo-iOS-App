import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Anchor, 
  Euro, 
  TrendingUp, 
  MapPin,
  Calendar,
  Users,
  Shield,
  ArrowRight,
  DollarSign,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Link } from 'wouter';

export function OwnerBusinessSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="bg-blue-600 text-white px-4 py-2 mb-4">
            Servizi Ormeggio
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ormeggi Sicuri per Tutti
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Trova il posto barca perfetto nei migliori porti del Lazio, con servizi completi e sicurezza garantita
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Ormeggi Disponibili */}
          <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Anchor className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Posti Barca Disponibili</h3>
                  <p className="text-gray-600">Ormeggi sicuri in tutta la regione</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Porti disponibili</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">5</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Anchor className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Posti barca totali</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">120+</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Euro className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Prezzi da</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">€25/m</span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">🏠 Porti Partner</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>Marina di Civitavecchia</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>Porto di Gaeta</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>Marina di Anzio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>Porto di Terracina</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Servizi Inclusi */}
          <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Servizi Inclusi</h3>
                  <p className="text-gray-600">Tutto quello che serve per la tua barca</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Sicurezza H24</span>
                  </div>
                  <p className="text-sm text-gray-600">Videosorveglianza e accesso controllato</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-lg font-bold text-gray-900">Check-in</div>
                    <div className="text-xs text-gray-600">Assistito</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-lg font-bold text-gray-900">24/7</div>
                    <div className="text-xs text-gray-600">Assistenza portuale</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">⚓ Servizi Inclusi</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Sicurezza H24 nei porti partner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Check-in/out assistito per clienti</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>Tracciamento GPS in tempo reale</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Gestione automatica calendario</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">⚓ Trova il Tuo Ormeggio Ideale</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Scopri i migliori posti barca del Lazio con servizi completi e sicurezza garantita. Prenota online in pochi click.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold" asChild>
                <Link href="/ormeggio">
                  <Anchor className="h-5 w-5 mr-2" />
                  Esplora Ormeggi
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold" asChild>
                <Link href="/external-services">
                  <MapPin className="h-5 w-5 mr-2" />
                  Servizi Portuali
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}