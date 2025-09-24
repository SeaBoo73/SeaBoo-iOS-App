import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export function UnreadMessagesBadge() {
  const { user } = useAuth();

  const { data: unreadCount = { count: 0 } } = useQuery<{ count: number }>({
    queryKey: ["/api/user/unread-messages"],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!user || unreadCount.count === 0) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
    >
      {unreadCount.count > 9 ? "9+" : unreadCount.count}
    </Badge>
  );
}