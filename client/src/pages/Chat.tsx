import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";
import { type ConversationWithUsers } from "@shared/schema";

export default function Chat() {
  // Fetch conversation data
  const { data: conversation, isLoading, isError } = useQuery<ConversationWithUsers>({
    queryKey: ['/api/conversations/current'],
  });

  // Set page title based on conversation
  useEffect(() => {
    if (conversation) {
      // Use first participant that's not the current user as title
      const otherParticipant = conversation.participants.find(
        p => p.user.username !== "currentuser"
      );
      
      if (otherParticipant) {
        document.title = `Chat with ${otherParticipant.user.displayName}`;
      } else {
        document.title = "Chat";
      }
    }
  }, [conversation]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg">
        <div className="h-16 border-b border-neutral-200 animate-pulse bg-neutral-100" />
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2/3 h-16 bg-neutral-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-20 border-t border-neutral-200 animate-pulse bg-neutral-100" />
      </div>
    );
  }

  if (isError || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-100">
        <div className="text-2xl font-semibold text-neutral-800">Failed to load conversation</div>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Get the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    p => p.user.username !== "currentuser"
  );

  // Current user
  const currentUser = conversation.participants.find(
    p => p.user.username === "currentuser"
  )?.user;

  if (!otherParticipant || !currentUser) {
    return <div>Invalid conversation participants</div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg">
      <ChatHeader participant={otherParticipant.user} />
      <MessageList 
        messages={conversation.messages} 
        currentUserId={currentUser.id} 
      />
      <ChatInput 
        conversationId={conversation.id} 
        currentUserId={currentUser.id} 
      />
    </div>
  );
}
