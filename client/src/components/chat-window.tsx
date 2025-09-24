import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import io, { Socket } from "socket.io-client";

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  readAt?: string;
  senderName?: string;
  senderEmail?: string;
}

interface Conversation {
  id: number;
  bookingId: number;
  createdAt: string;
  lastMessageAt: string;
}

interface ChatWindowProps {
  bookingId: number;
  onClose: () => void;
  isOpen: boolean;
}

export function ChatWindow({ bookingId, onClose, isOpen }: ChatWindowProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClientRef = useQueryClient();

  // Get conversation
  const { data: conversation } = useQuery<Conversation>({
    queryKey: ["/api/conversations", bookingId],
    enabled: isOpen && !!bookingId,
  });

  // Get messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversation?.id, "messages"],
    enabled: !!conversation?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversation?.id) throw new Error("No conversation");
      return apiRequest("POST", `/api/conversations/${conversation.id}/messages`, { content });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClientRef.invalidateQueries({
        queryKey: ["/api/conversations", conversation?.id, "messages"],
      });
    },
  });

  // Setup WebSocket connection
  useEffect(() => {
    if (!isOpen || !conversation?.id) return;

    const protocol = typeof window !== 'undefined' && window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = typeof window !== 'undefined' ? `${protocol}//${window.location.host}/ws` : 'ws://localhost:5000/ws';
    const newSocket = io(wsUrl, { path: '/ws' });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      newSocket.emit('join-conversation', conversation.id);
    });

    newSocket.on('new-message', (message: Message) => {
      queryClientRef.invalidateQueries({
        queryKey: ["/api/conversations", conversation.id, "messages"],
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-conversation', conversation.id);
      newSocket.disconnect();
    };
  }, [conversation?.id, isOpen, queryClientRef]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const getInitials = (name?: string, email?: string) => {
    if (name && name !== email) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email ? email[0].toUpperCase() : '?';
  };

  const isMyMessage = (message: Message) => message.senderId === user?.id;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-ocean-blue" />
            <CardTitle className="text-lg">Chat - Prenotazione #{bookingId}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-blue"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nessun messaggio ancora.</p>
                  <p className="text-sm">Inizia una conversazione!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[70%] ${
                      isMyMessage(message) ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`text-xs ${
                          isMyMessage(message) 
                            ? 'bg-ocean-blue text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {getInitials(message.senderName, message.senderEmail)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`rounded-lg p-3 ${
                        isMyMessage(message)
                          ? 'bg-ocean-blue text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {!isMyMessage(message) && (
                          <div className="text-xs font-medium mb-1 opacity-75">
                            {message.senderName || message.senderEmail}
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className={`text-xs mt-1 ${
                          isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatDistanceToNow(new Date(message.createdAt), { 
                            addSuffix: true, 
                            locale: it 
                          })}
                          {!message.readAt && isMyMessage(message) && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Non letto
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi un messaggio..."
                disabled={sendMessageMutation.isPending}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="bg-ocean-blue hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}