import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { type User } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHeaderProps {
  participant: User;
}

export default function ChatHeader({ participant }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex items-center p-4 border-b border-neutral-200 bg-white sticky top-0 z-10">
      {isMobile && (
        <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors mr-2">
          <ArrowLeft className="h-5 w-5 text-neutral-500" />
        </button>
      )}
      <div className="relative">
        <Avatar className="h-10 w-10">
          {participant.avatarUrl ? (
            <AvatarImage src={participant.avatarUrl} alt={participant.displayName} />
          ) : (
            <AvatarFallback>{getInitials(participant.displayName)}</AvatarFallback>
          )}
        </Avatar>
      </div>
      <div className="ml-3 flex-1">
        <h1 className="font-medium text-neutral-800">{participant.displayName}</h1>
      </div>
    </div>
  );
}
