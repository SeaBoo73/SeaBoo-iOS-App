import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, Sparkles, MapPin, DollarSign, Cloud } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AIAssistantProps {
  context?: {
    boatId?: number;
    location?: string;
    dates?: { start: string; end: string };
    budget?: number;
  };
}

type AIFeature = 'recommendations' | 'pricing' | 'weather' | 'itinerary';

export function AIAssistant({ context }: AIAssistantProps) {
  const [activeFeature, setActiveFeature] = useState<AIFeature | null>(null);
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    feature?: AIFeature;
  }>>([]);

  const aiMutation = useMutation({
    mutationFn: async (request: {
      feature: AIFeature;
      input: string;
      context?: any;
    }) => {
      const response = await fetch(`/api/ai/${request.feature}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: request.input,
          context: request.context
        })
      });
      return await response.json();
    },
    onSuccess: (response, variables) => {
      setConversation(prev => [
        ...prev,
        { type: 'user', content: variables.input, feature: variables.feature },
        { type: 'ai', content: response.response, feature: variables.feature }
      ]);
      setUserInput("");
    },
    onError: (error) => {
      toast({
        title: "Errore IA",
        description: "Impossibile elaborare la richiesta. Riprova.",
        variant: "destructive"
      });
    }
  });

  const features = [
    {
      id: 'recommendations' as AIFeature,
      title: 'Raccomandazioni Barche',
      description: 'Trova la barca perfetta per te',
      icon: Sparkles,
      color: 'bg-blue-500'
    },
    {
      id: 'pricing' as AIFeature,
      title: 'Analisi Prezzi',
      description: 'Verifica se il prezzo è giusto',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      id: 'weather' as AIFeature,
      title: 'Consigli Meteo',
      description: 'Condizioni perfette per navigare',
      icon: Cloud,
      color: 'bg-orange-500'
    },
    {
      id: 'itinerary' as AIFeature,
      title: 'Pianifica Itinerario',
      description: 'Crea il viaggio dei tuoi sogni',
      icon: MapPin,
      color: 'bg-purple-500'
    }
  ];

  const handleSendMessage = () => {
    if (!userInput.trim() || !activeFeature) return;
    
    aiMutation.mutate({
      feature: activeFeature,
      input: userInput,
      context
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Bot className="h-8 w-8 text-blue-500" />
          <CardTitle className="text-2xl">Assistente IA SeaBoo</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Il tuo esperto nautici personale powered by AI
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Feature Selection */}
        {!activeFeature && (
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => (
              <Button
                key={feature.id}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => setActiveFeature(feature.id)}
              >
                <div className={`p-2 rounded-full ${feature.color} text-white`}>
                  <feature.icon className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <div className="font-medium">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {feature.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Active Feature */}
        {activeFeature && (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                {(() => {
                  const feature = features.find(f => f.id === activeFeature);
                  const Icon = feature?.icon || Bot;
                  return (
                    <>
                      <Icon className="h-3 w-3" />
                      {feature?.title}
                    </>
                  );
                })()}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveFeature(null);
                  setConversation([]);
                }}
              >
                Cambia Funzione
              </Button>
            </div>

            {/* Conversation */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              
              {aiMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>L'IA sta pensando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={getPlaceholderText(activeFeature)}
                className="min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || aiMutation.isPending}
                size="sm"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function getPlaceholderText(feature: AIFeature): string {
  switch (feature) {
    case 'recommendations':
      return 'Descrivi che tipo di barca stai cercando, budget, destinazione...';
    case 'pricing':
      return 'Chiedi informazioni sui prezzi di una barca specifica...';
    case 'weather':
      return 'Inserisci destinazione e date per consigli meteo...';
    case 'itinerary':
      return 'Descrivi la tua vacanza ideale: durata, destinazioni, interessi...';
    default:
      return 'Scrivi la tua domanda...';
  }
}