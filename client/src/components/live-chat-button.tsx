import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Bot, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AiChat } from "./ai-chat";

export function LiveChatButton() {
  const [showOptions, setShowOptions] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);



  const handleEmailSupport = () => {
    window.open('mailto:assistenza@seaboo.it?subject=Richiesta Assistenza SeaBoo', '_self');
    setShowOptions(false);
  };

  const handleAiChat = () => {
    setShowOptions(false);
    setShowAiChat(true);
  };

  return (
    <TooltipProvider>
      {/* Chat Button - Fixed position, adjusted for mobile bottom nav */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setShowOptions(true)}
            className="fixed bottom-24 md:bottom-6 right-6 z-40 bg-gradient-to-r from-ocean-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full w-16 h-16 shadow-xl border-2 border-white transition-all flex items-center justify-center group"
            size="lg"
            data-testid="button-live-chat"
          >
            <div className="relative">
              <MessageCircle className="h-7 w-7 fill-white stroke-ocean-blue group-hover:animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-gray-900 text-white">
          <p>Chat con Assistenza SeaBoo</p>
        </TooltipContent>
      </Tooltip>

      {/* Chat Options Modal - Positioned above mobile bottom nav */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 pb-24 md:pb-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                Assistenza SeaBoo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Scegli il tipo di assistenza:
              </p>
              
              {/* AI Chat - Primary Option */}
              <Button
                onClick={handleAiChat}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white justify-start"
              >
                <Bot className="h-4 w-4 mr-2" />
                Chat con AI
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">Consigliato</span>
              </Button>



              {/* Email */}
              <Button
                onClick={handleEmailSupport}
                variant="outline"
                className="w-full justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Email Assistenza
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>

              {/* Chiudi */}
              <Button
                onClick={() => setShowOptions(false)}
                variant="ghost"
                className="w-full mt-4"
              >
                Chiudi
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Chat Component */}
      <AiChat 
        isOpen={showAiChat} 
        onClose={() => setShowAiChat(false)} 
      />
    </TooltipProvider>
  );
}