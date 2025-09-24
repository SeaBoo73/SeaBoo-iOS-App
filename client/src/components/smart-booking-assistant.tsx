import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Sparkles, Calendar, MapPin, Users, Euro } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  boatRecommendations?: Array<{
    name: string;
    price: string;
    location: string;
    rating: number;
  }>;
}

export function SmartBookingAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Ciao! Sono il tuo assistente di prenotazione intelligente. Come posso aiutarti a trovare la barca perfetta per la tua prossima avventura? 🚤",
      timestamp: new Date(),
      suggestions: [
        "Cerca barche per 4 persone",
        "Weekend a Ponza",
        "Barche senza patente",
        "Charter con skipper"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickSuggestions = [
    {
      icon: Calendar,
      text: "Questo weekend",
      query: "Barche disponibili questo weekend"
    },
    {
      icon: MapPin,
      text: "Lazio",
      query: "Barche nel Lazio"
    },
    {
      icon: Users,
      text: "Famiglia",
      query: "Barche per famiglia con bambini"
    },
    {
      icon: Euro,
      text: "Budget 200€",
      query: "Barche sotto i 200€ al giorno"
    }
  ];

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateResponse(message),
        timestamp: new Date(),
        suggestions: generateSuggestions(message),
        boatRecommendations: generateBoatRecommendations(message)
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes("weekend") || msg.includes("sabato") || msg.includes("domenica")) {
      return "Perfetto! Per il weekend ti consiglio di prenotare in anticipo. Ho trovato alcune barche disponibili con ottimi sconti per prenotazioni last-minute. Che tipo di esperienza stai cercando?";
    }
    
    if (msg.includes("famiglia") || msg.includes("bambini")) {
      return "Ottima scelta per una gita in famiglia! Ti suggerisco barche con ampi spazi, sicurezza extra per i bambini e servizi come frigorifero e tendalino. Quante persone siete?";
    }
    
    if (msg.includes("budget") || msg.includes("prezzo") || msg.includes("€")) {
      return "Capisco che il budget sia importante. Posso aiutarti a trovare le migliori offerte! Ci sono anche barche con sconti per soggiorni di più giorni. Quando vorresti partire?";
    }
    
    if (msg.includes("ponza") || msg.includes("gaeta") || msg.includes("civitavecchia")) {
      return "Destinazione fantastica! Conosco bene quella zona e posso consigliarti le barche migliori e gli ormeggi più belli. Hai già esperienza di navigazione?";
    }
    
    return "Interessante! Dimmi di più sui tuoi piani così posso consigliarti al meglio. Sono qui per aiutarti a trovare l'esperienza perfetta in base alle tue esigenze.";
  };

  const generateSuggestions = (userMessage: string): string[] => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes("weekend")) {
      return ["Barche disponibili sabato", "Offerte last-minute", "Charter giornalieri"];
    }
    
    if (msg.includes("famiglia")) {
      return ["Barche famiglia-friendly", "Sicurezza bambini", "Servizi extra"];
    }
    
    return ["Mostra disponibilità", "Confronta prezzi", "Leggi recensioni"];
  };

  const generateBoatRecommendations = (userMessage: string) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes("weekend") || msg.includes("famiglia") || msg.includes("ponza")) {
      return [
        {
          name: "Beneteau Oceanis 46",
          price: "€280/giorno",
          location: "Civitavecchia",
          rating: 4.9
        },
        {
          name: "Jeanneau Cap Camarat",
          price: "€150/giorno", 
          location: "Gaeta",
          rating: 4.7
        },
        {
          name: "Bavaria Cruiser 37",
          price: "€220/giorno",
          location: "Anzio",
          rating: 4.8
        }
      ];
    }
    
    return undefined;
  };

  return (
    <Card className="h-[600px] flex flex-col border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          Assistente di Prenotazione IA
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Suggestions */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(suggestion.query)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Icon className="h-3 w-3" />
                  {suggestion.text}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSend(suggestion)}
                          className="text-xs h-6 px-2 text-blue-600 hover:bg-blue-50"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Boat Recommendations */}
                  {message.boatRecommendations && (
                    <div className="grid gap-2 mt-3">
                      {message.boatRecommendations.map((boat, index) => (
                        <div key={index} className="p-3 bg-white border rounded-lg text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{boat.name}</p>
                              <p className="text-gray-600">{boat.location}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">{boat.price}</p>
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="text-gray-600">{boat.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.type === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi il tuo messaggio..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
            />
            <Button onClick={() => handleSend(input)} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}