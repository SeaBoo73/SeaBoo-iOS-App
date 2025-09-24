import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Image, FileText, Phone, Video, MoreVertical, Users, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  type: 'text' | 'image' | 'document' | 'system';
  attachments?: string[];
  createdAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  reactions?: Array<{
    emoji: string;
    userId: number;
    userName: string;
  }>;
  readBy?: Array<{
    userId: number;
    readAt: string;
  }>;
}

interface Conversation {
  id: number;
  type: 'direct' | 'group' | 'support';
  title?: string;
  isGroup: boolean;
  lastMessageAt: string;
  participants: Array<{
    id: number;
    firstName: string;
    lastName: string;
    role: string;
  }>;
  unreadCount?: number;
}

interface ChatInterfaceProps {
  conversationId: number;
  currentUserId: number;
  onClose?: () => void;
}

export function ChatInterface({ conversationId, currentUserId, onClose }: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();

  // Connessione WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connesso al WebSocket');
      ws.send(JSON.stringify({
        type: 'join_conversation',
        conversationId,
        userId: currentUserId
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          scrollToBottom();
          break;
        case 'typing':
          if (data.userId !== currentUserId) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
          }
          break;
        case 'message_read':
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          break;
        case 'reaction_added':
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          break;
      }
    };

    ws.onclose = () => {
      console.log('Disconnesso dal WebSocket');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [conversationId, currentUserId, queryClient]);

  // Query per ottenere i messaggi
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await fetch(`/api/messaging/conversations/${conversationId}/messages`);
      if (!response.ok) throw new Error('Errore nel caricamento messaggi');
      return response.json();
    },
    refetchInterval: 30000, // Ricarica ogni 30 secondi come fallback
  });

  // Query per informazioni conversazione
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const response = await fetch(`/api/messaging/conversations/${conversationId}`);
      if (!response.ok) throw new Error('Errore nel caricamento conversazione');
      return response.json();
    },
  });

  // Mutation per inviare messaggio
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; type?: string }) => {
      const response = await fetch(`/api/messaging/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Errore nell\'invio del messaggio');
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      scrollToBottom();
    },
  });

  // Scroll automatico ai nuovi messaggi
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gestione invio messaggio
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Invia via WebSocket per real-time
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'message',
        conversationId,
        content: newMessage,
        userId: currentUserId
      }));
    }

    // Invia anche via HTTP come fallback
    sendMessageMutation.mutate({ content: newMessage, type: 'text' });
  };

  // Gestione typing indicator
  const handleTyping = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'typing',
        conversationId,
        userId: currentUserId
      }));
    }
  };

  // Gestione upload file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', '0'); // Verrà aggiornato dal server

    fetch(`/api/messaging/conversations/${conversationId}/attachments`, {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    })
    .catch(error => {
      console.error('Errore nell\'upload:', error);
    });
  };

  // Gestione reazioni
  const handleReaction = (messageId: number, emoji: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'reaction',
        messageId,
        emoji,
        userId: currentUserId
      }));
    }
  };

  // Gestione segna come letto
  const markAsRead = (messageId: number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'read',
        messageId,
        userId: currentUserId
      }));
    }
  };

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                {conversation?.isGroup ? <Users className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {conversation?.title || 'Chat Prenotazione'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {conversation?.isGroup ? `${conversation.participants?.length} partecipanti` : 'Chat diretta'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Partecipanti Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {conversation?.participants?.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarInitials>{participant.firstName?.[0]}{participant.lastName?.[0]}</AvatarInitials>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.firstName} {participant.lastName}</p>
                          <Badge variant="secondary" className="text-xs">{participant.role}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages?.map((message: Message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => markAsRead(message.id)}
              >
                <div className={`flex space-x-2 max-w-[70%] ${message.senderId === currentUserId ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {message.sender.firstName?.[0]}{message.sender.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className={`rounded-lg p-3 ${
                      message.senderId === currentUserId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs">
                              <FileText className="w-3 h-3" />
                              <span>Allegato {index + 1}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { 
                          addSuffix: true, 
                          locale: it 
                        })}
                      </p>
                      <div className="flex items-center space-x-1">
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex space-x-1">
                            {message.reactions.map((reaction, index) => (
                              <Badge key={index} variant="outline" className="text-xs p-1">
                                {reaction.emoji}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => handleReaction(message.id, '👍')}
                            className="text-xs hover:bg-muted rounded p-1"
                          >
                            👍
                          </button>
                          <button 
                            onClick={() => handleReaction(message.id, '❤️')}
                            className="text-xs hover:bg-muted rounded p-1"
                          >
                            ❤️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>...</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Scrivi un messaggio..."
                className="resize-none"
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}