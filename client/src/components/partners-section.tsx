import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PartnersSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
            🤝 Partner Ufficiali
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Unisciti alla Rete SeaBoo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stiamo costruendo una rete esclusiva di partner qualificati nel settore nautico. 
            Fai parte della rivoluzione digitale del mare.
          </p>
        </div>

        {/* Call to Action per nuovi partner */}
        <div className="text-center">
          <Card className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4">Diventa Partner SeaBoo</h3>
              <p className="mb-6 text-blue-100 text-lg max-w-md mx-auto">
                Unisciti alla nostra rete di partner qualificati e fai crescere il tuo business nel settore nautico. 
                Opportunità esclusive ti aspettano.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center text-blue-100">
                  <span className="mr-2">✓</span>
                  <span>Visibilità su migliaia di utenti marittimi</span>
                </div>
                <div className="flex items-center justify-center text-blue-100">
                  <span className="mr-2">✓</span>
                  <span>Sistema di prenotazioni integrato</span>
                </div>
                <div className="flex items-center justify-center text-blue-100">
                  <span className="mr-2">✓</span>
                  <span>Supporto marketing dedicato</span>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
              >
                Candidati Come Partner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}