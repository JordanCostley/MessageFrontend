import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { MessageWithRelations } from "@shared/schema";
import MessageActions from "./MessageActions";
import AttachmentPreview from "./AttachmentPreview";
import EmojiPicker from "./EmojiPicker";

interface MessageItemProps {
  message: MessageWithRelations;
  isCurrentUser: boolean;
  previousMessage?: MessageWithRelations;
  onReply?: () => void;
}

export default function MessageItem({ 
  message, 
  isCurrentUser, 
  previousMessage,
  onReply
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Determine if we should show the sender's avatar
  // (only show for first message in a sequence from same sender)
  const showAvatar = !previousMessage || previousMessage.senderId !== message.senderId;

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      const response = await apiRequest('POST', `/api/messages/${message.id}/reactions`, {
        userId: isCurrentUser ? message.senderId : 2, // Use current user or other user
        emoji
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refresh messages
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/current'] });
      setShowEmojiPicker(false);
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/messages/${message.id}`);
    },
    onSuccess: () => {
      // Invalidate query to refresh messages
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/current'] });
      setShowMenu(false);
    }
  });

  // Handle click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowActions(false);
        setShowEmojiPicker(false);
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format time for display
  const formatTime = (date: Date) => {
    return format(new Date(date), "h:mm a");
  };

  // Count reactions by emoji
  const reactionCounts = message.reactions?.reduce<Record<string, number>>((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {}) || {};

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    addReactionMutation.mutate(emoji);
  };

  // Handle copy text
  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  // Handle delete message
  const handleDeleteMessage = () => {
    deleteMessageMutation.mutate();
  };

  return (
    <div 
      className={`space-y-2 ${isCurrentUser ? 'flex flex-col items-end' : ''}`}
      ref={messageRef}
    >
      <div 
        className={`flex items-end max-w-[85%] ${isCurrentUser ? 'ml-auto' : ''} group relative`}
      >
        {!isCurrentUser && showAvatar && (
          <Avatar className="h-8 w-8 mr-2 mb-1">
            <AvatarFallback>
              {message.sender?.displayName.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="message-container">
          {/* Image attachments outside the container */}
          {message.hasAttachment && message.attachment && 
           /\.(jpg|jpeg|png|gif|webp)$/i.test(message.attachment.fileName) && (
            <div className={`${isCurrentUser ? 'ml-auto' : 'mr-auto'} max-w-[240px]`}>
              <AttachmentPreview attachment={message.attachment} containerless={true} />
            </div>
          )}
          
          <div 
            className={`p-3 rounded-t-lg ${
              isCurrentUser 
                ? 'bg-primary text-white rounded-bl-lg' 
                : 'bg-gray-100 text-neutral-800 rounded-br-lg'
            } shadow-sm relative`}
          >
            {/* Message actions on hover */}
            <MessageActions 
              isCurrentUser={isCurrentUser} 
              onReply={onReply || (() => {})}
              onEmojiClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowMenu(false);
              }}
              onMenuClick={() => {
                setShowMenu(!showMenu);
                setShowEmojiPicker(false);
              }}
              showEmojiPicker={showEmojiPicker}
              showMenu={showMenu}
              onEmojiSelect={handleEmojiSelect}
              onCopyText={handleCopyText}
              onDeleteMessage={handleDeleteMessage}
            />
            
            {/* Reply preview */}
            {message.replyTo && (
              <div className={`mb-2 p-2 rounded ${
                isCurrentUser ? 'bg-indigo-600 text-xs border-l-2 border-white' : 'bg-gray-200 text-xs border-l-2 border-gray-400'
              }`}>
                <p className={`${isCurrentUser ? 'opacity-80' : 'text-gray-600'} italic truncate`}>
                  {message.replyTo.content.length > 50 
                    ? `${message.replyTo.content.substring(0, 50)}...` 
                    : message.replyTo.content
                  }
                </p>
              </div>
            )}
            
            {/* Attachment preview - non-image attachments */}
            {message.hasAttachment && message.attachment && 
             !/\.(jpg|jpeg|png|gif|webp)$/i.test(message.attachment.fileName) && (
              <AttachmentPreview attachment={message.attachment} />
            )}
            
            {/* Message content */}
            <p>{message.content}</p>
            
            {/* Message timestamp and status */}
            <div className={`flex items-center justify-end mt-1 space-x-1 ${
              isCurrentUser ? 'text-indigo-200' : 'text-neutral-400'
            }`}>
              <span className="text-xs">{formatTime(new Date(message.timestamp))}</span>
              {isCurrentUser && (
                <span className="text-xs">
                  {message.status === 'read' 
                    ? <span>✓✓</span> 
                    : <span>✓</span>}
                </span>
              )}
            </div>
          </div>
          
          {/* Reactions */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className={`flex ${isCurrentUser ? 'justify-end -mt-1 mr-1' : 'justify-start -mt-1 ml-1'}`}>
              <div className="bg-white rounded-full shadow-sm py-0.5 px-1 flex items-center text-xs">
                {Object.entries(reactionCounts).map(([emoji, count], index) => (
                  <div key={index} className="flex items-center mr-1 last:mr-0">
                    <span className="mr-1">{emoji}</span>
                    <span className="text-neutral-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
