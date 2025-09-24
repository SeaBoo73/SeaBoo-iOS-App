import { Card, CardContent } from "@/components/ui/card";
import { Anchor, Users, Star, TrendingUp } from "lucide-react";

export function QuickStatsCard() {
  const stats = [
    {
      icon: Anchor,
      label: "Barche disponibili",
      value: "500+",
      trend: "+12% questo mese",
      color: "text-blue-600"
    },
    {
      icon: Users,
      label: "Utenti attivi",
      value: "2.5K",
      trend: "+18% questo mese", 
      color: "text-green-600"
    },
    {
      icon: Star,
      label: "Valutazione media",
      value: "4.8/5",
      trend: "Sempre eccellente",
      color: "text-yellow-600"
    },
    {
      icon: TrendingUp,
      label: "Prenotazioni",
      value: "1.2K",
      trend: "+24% questo mese",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-6 w-6 ${stat.color}`} />
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">{stat.label}</p>
              <p className="text-xs text-green-600">{stat.trend}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}