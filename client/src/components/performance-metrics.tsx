import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Star, Clock, Shield, Award } from "lucide-react";

export function PerformanceMetrics() {
  const metrics = [
    {
      title: "Tasso di Soddisfazione",
      value: "98.4%",
      progress: 98,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Clienti completamente soddisfatti"
    },
    {
      title: "Tempo di Risposta",
      value: "< 2 ore",
      progress: 95,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Risposta media alle richieste"
    },
    {
      title: "Prenotazioni Confermate",
      value: "99.7%",
      progress: 99,
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Prenotazioni senza problemi"
    },
    {
      title: "Crescita Mensile",
      value: "+24%",
      progress: 75,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Nuovi clienti ogni mese"
    }
  ];

  const achievements = [
    { label: "Miglior Piattaforma Nautica 2024", type: "award" },
    { label: "5000+ Navigatori Felici", type: "users" },
    { label: "Certificato Sicurezza ISO", type: "security" },
    { label: "Partner Ufficiale Porti Lazio", type: "partner" }
  ];

  return (
    <div className="space-y-8">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    LIVE
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Progress value={metric.progress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achievements Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-gold" />
            <span>I nostri Riconoscimenti</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {achievement.type === "award" && <Award className="w-5 h-5 text-yellow-600" />}
                  {achievement.type === "users" && <Users className="w-5 h-5 text-blue-600" />}
                  {achievement.type === "security" && <Shield className="w-5 h-5 text-green-600" />}
                  {achievement.type === "partner" && <TrendingUp className="w-5 h-5 text-purple-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {achievement.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="text-center bg-gradient-to-r from-ocean-blue to-deep-navy text-white rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-4">
          Qualità garantita dal 2024
        </h3>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          SeaBoo mantiene i più alti standard di qualità e sicurezza nel settore del noleggio nautico, 
          con oltre 5000 clienti soddisfatti e partnership consolidate.
        </p>
        <div className="flex justify-center space-x-8 text-center">
          <div>
            <p className="text-3xl font-bold">5000+</p>
            <p className="text-blue-200 text-sm">Clienti Felici</p>
          </div>
          <div>
            <p className="text-3xl font-bold">99.7%</p>
            <p className="text-blue-200 text-sm">Affidabilità</p>
          </div>
          <div>
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-blue-200 text-sm">Supporto</p>
          </div>
        </div>
      </div>
    </div>
  );
}