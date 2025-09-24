import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Gift, Crown, Award } from "lucide-react";

interface LoyaltySystemProps {
  user: {
    customerLevel: string;
    totalBookings: number;
    totalSpent: string;
    loyaltyPoints: number;
  };
}

export function LoyaltySystem({ user }: LoyaltySystemProps) {
  const getLevelInfo = (level: string) => {
    switch (level) {
      case "bronze":
        return {
          name: "Bronze",
          icon: <Award className="h-5 w-5 text-amber-600" />,
          color: "bg-amber-100 text-amber-800 border-amber-200",
          nextLevel: "Silver",
          benefits: ["5% di sconto su prenotazioni multiple", "Punti fedeltà base"],
          requirement: "0-5 prenotazioni",
          progress: Math.min((user.totalBookings / 5) * 100, 100)
        };
      case "silver":
        return {
          name: "Silver",
          icon: <Star className="h-5 w-5 text-gray-600" />,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          nextLevel: "Gold",
          benefits: ["10% di sconto", "Check-in prioritario", "Punti fedeltà x1.5"],
          requirement: "6-15 prenotazioni",
          progress: Math.min(((user.totalBookings - 5) / 10) * 100, 100)
        };
      case "gold":
        return {
          name: "Gold",
          icon: <Trophy className="h-5 w-5 text-yellow-600" />,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          nextLevel: "Platinum",
          benefits: ["15% di sconto", "Upgrade gratuiti", "Cancellazione flessibile", "Punti fedeltà x2"],
          requirement: "16-30 prenotazioni",
          progress: Math.min(((user.totalBookings - 15) / 15) * 100, 100)
        };
      case "platinum":
        return {
          name: "Platinum",
          icon: <Crown className="h-5 w-5 text-purple-600" />,
          color: "bg-purple-100 text-purple-800 border-purple-200",
          nextLevel: null,
          benefits: ["20% di sconto", "Servizio concierge", "Accesso barche esclusive", "Punti fedeltà x3"],
          requirement: "30+ prenotazioni",
          progress: 100
        };
      default:
        return getLevelInfo("bronze");
    }
  };

  const levelInfo = getLevelInfo(user.customerLevel);

  return (
    <div className="space-y-6">
      {/* Livello Corrente */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {levelInfo.icon}
            <span>Livello {levelInfo.name}</span>
            <Badge className={`${levelInfo.color} font-semibold`}>
              {levelInfo.requirement}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-ocean-blue">{user.totalBookings}</p>
              <p className="text-sm text-gray-600">Prenotazioni totali</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">€{parseFloat(user.totalSpent).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Spesi totali</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{user.loyaltyPoints}</p>
              <p className="text-sm text-gray-600">Punti fedeltà</p>
            </div>
          </div>

          {/* Progresso verso il prossimo livello */}
          {levelInfo.nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso verso {levelInfo.nextLevel}</span>
                <span>{Math.round(levelInfo.progress)}%</span>
              </div>
              <Progress value={levelInfo.progress} className="h-2" />
            </div>
          )}

          {/* Benefici del livello */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Gift className="h-4 w-4" />
              I tuoi benefici
            </h4>
            <ul className="space-y-1">
              {levelInfo.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-1 h-1 bg-ocean-blue rounded-full"></span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Punti Fedeltà */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Come funzionano i punti fedeltà
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900">Guadagna punti:</p>
              <ul className="space-y-1 text-gray-700">
                <li>• 1 punto per ogni €1 speso</li>
                <li>• Bonus livello (Bronze: x1, Silver: x1.5, Gold: x2, Platinum: x3)</li>
                <li>• 100 punti bonus per ogni recensione</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Usa punti:</p>
              <ul className="space-y-1 text-gray-700">
                <li>• 100 punti = €10 di sconto</li>
                <li>• 500 punti = upgrade gratuito</li>
                <li>• 1000 punti = giornata gratis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}