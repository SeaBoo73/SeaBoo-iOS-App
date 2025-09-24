import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, X, Bot, User, Anchor, Cloud, Fuel } from "lucide-react";
import seabooLogo from "@assets/ChatGPT Image 7 ago 2025, 07_13_19_1754544753003.png";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiChat({ isOpen, onClose }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! Sono l\'assistente AI di SeaBoo. Posso aiutarti con informazioni su barche, porti, meteo marino, prezzi e prenotazioni. Come posso assisterti oggi?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick action buttons
  const quickActions = [
    { icon: Anchor, text: "Trova barche vicine", action: "Mostrami le barche disponibili nella zona di Roma" },
    { icon: Cloud, text: "Meteo oggi", action: "Come sono le condizioni meteo marine oggi?" },
    { icon: () => <img src={seabooLogo} alt="SeaBoo" className="h-4 w-4 object-contain" />, text: "Condizioni marine", action: "Le condizioni del mare sono buone per navigare?" },
    { icon: Fuel, text: "Prezzi carburante", action: "Dove posso trovare carburante nautico a buon prezzo?" }
  ];

  // Send message to OpenAI
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/ai/chat", { 
        message: content,
        context: "SeaBoo boat rental platform - Italian maritime services assistant"
      });
    },
    onSuccess: (data: any) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_assistant',
        role: 'assistant',
        content: data.response || 'Mi dispiace, non sono riuscito a elaborare la tua richiesta. Prova a riformulare la domanda.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: 'Mi dispiace, al momento non riesco a rispondere. Il servizio di assistenza AI potrebbe essere temporaneamente non disponibile. Puoi contattarci via email per assistenza immediata.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMessageMutation.isPending) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to AI
    sendMessageMutation.mutate(newMessage.trim());
    setNewMessage("");
  };

  const handleQuickAction = (action: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      role: 'user',
      content: action,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(action);
  };

  const handleEmailSupport = () => {
    window.open('mailto:assistenza@seaboo.it?subject=Richiesta Assistenza SeaBoo', '_self');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pb-24 md:pb-4 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col my-4">
        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6" />
            <div>
              <CardTitle className="text-lg">Assistente AI SeaBoo</CardTitle>
              <p className="text-sm opacity-90">Assistenza marittima intelligente</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Azioni rapide:</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center justify-start text-xs p-2 h-auto"
                    disabled={sendMessageMutation.isPending}
                  >
                    <action.icon className="h-3 w-3 mr-2" />
                    {action.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 min-h-[300px]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900 border'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatDistanceToNow(message.timestamp, { 
                          addSuffix: true, 
                          locale: it 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {sendMessageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Alternative Support Options */}
          <div className="border-t bg-gray-50 p-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Serve assistenza umana?</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEmailSupport}
                  className="text-xs h-7"
                >
                  Email Assistenza
                </Button>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex space-x-2 mb-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi la tua domanda..."
                disabled={sendMessageMutation.isPending}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Close button at bottom for mobile */}
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Chiudi chat
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}