import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { ChatWindow } from "./chat-window";

interface ChatButtonProps {
  bookingId: number;
  className?: string;
}

export function ChatButton({ bookingId, className }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className={`border-ocean-blue text-ocean-blue hover:bg-ocean-blue hover:text-white ${className}`}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Messaggio
      </Button>

      <ChatWindow
        bookingId={bookingId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}