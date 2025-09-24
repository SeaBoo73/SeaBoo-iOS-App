import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, MessageSquare, Users, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

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
  lastMessage?: {
    content: string;
    senderName: string;
  };
  unreadCount?: number;
  booking?: {
    id: number;
    boatId: number;
    startDate: string;
    endDate: string;
  };
}

interface ConversationListProps {
  onSelectConversation: (conversationId: number) => void;
  currentUserId: number;
  selectedConversationId?: number;
}

export function ConversationList({ 
  onSelectConversation, 
  currentUserId, 
  selectedConversationId 
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  // Query per ottenere le conversazioni dell'utente
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', currentUserId],
    queryFn: async () => {
      const response = await fetch('/api/messaging/conversations');
      if (!response.ok) throw new Error('Errore nel caricamento conversazioni');
      return response.json();
    },
    refetchInterval: 30000, // Aggiorna ogni 30 secondi
  });

  // Query per notifiche non lette
  const { data: notifications } = useQuery({
    queryKey: ['notifications', currentUserId],
    queryFn: async () => {
      const response = await fetch('/api/messaging/notifications');
      if (!response.ok) throw new Error('Errore nel caricamento notifiche');
      return response.json();
    },
    refetchInterval: 10000, // Aggiorna ogni 10 secondi
  });

  // Filtra conversazioni in base al termine di ricerca
  const filteredConversations = conversations?.filter((conv: Conversation) =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const getTotalUnreadCount = () => {
    return notifications?.filter((n: any) => !n.read).length || 0;
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    if (conversation.isGroup) return 'Chat di Gruppo';
    
    // Per chat dirette, mostra il nome dell'altro partecipante
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Chat';
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.booking) {
      return `Prenotazione #${conversation.booking.id}`;
    }
    if (conversation.lastMessage) {
      return `${conversation.lastMessage.senderName}: ${conversation.lastMessage.content.substring(0, 50)}...`;
    }
    return 'Nessun messaggio';
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Messaggi</span>
            {getTotalUnreadCount() > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {getTotalUnreadCount()}
              </Badge>
            )}
          </CardTitle>
          <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Nuova Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuova Conversazione</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Cerca utenti..." />
                <div className="text-sm text-muted-foreground">
                  Funzionalità in sviluppo
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Cerca conversazioni..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna conversazione trovata</p>
              <p className="text-sm">Inizia una nuova chat per comunicare</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation: Conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedConversationId === conversation.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>
                          {conversation.isGroup ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            <MessageSquare className="w-4 h-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          {getConversationTitle(conversation)}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {conversation.type === 'support' && (
                            <Badge variant="outline" className="text-xs">
                              <Phone className="w-3 h-3 mr-1" />
                              Supporto
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), { 
                              addSuffix: true, 
                              locale: it 
                            })}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {getConversationSubtitle(conversation)}
                      </p>

                      {conversation.booking && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {new Date(conversation.booking.startDate).toLocaleDateString('it-IT')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">→</span>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(conversation.booking.endDate).toLocaleDateString('it-IT')}
                          </Badge>
                        </div>
                      )}

                      {conversation.isGroup && (
                        <div className="flex items-center space-x-1 mt-2">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {conversation.participants.length} partecipanti
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}