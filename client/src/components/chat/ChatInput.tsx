import { useState, useRef, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip, Image, Smile, Send, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import EmojiPicker from "./EmojiPicker";
import { MessageWithRelations } from "@shared/schema";

interface ChatInputProps {
  conversationId: number;
  currentUserId: number;
  replyToMessage?: MessageWithRelations | null;
  onCancelReply?: () => void;
}

export default function ChatInput({ 
  conversationId, 
  currentUserId,
  replyToMessage,
  onCancelReply
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/messages', {
        conversationId,
        senderId: currentUserId,
        content,
        hasAttachment: false,
        replyToId: replyToMessage?.id || null
      });
      return response.json();
    },
    onSuccess: () => {
      // Clear input
      setMessage("");
      // Clear reply if any
      if (replyToMessage && onCancelReply) {
        onCancelReply();
      }
      // Invalidate query to refresh messages
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/current'] });
    }
  });

  // Handle send message
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Handle click outside emoji picker
  const handleClickOutside = (e: MouseEvent) => {
    if (
      emojiButtonRef.current && 
      !emojiButtonRef.current.contains(e.target as Node) &&
      !document.querySelector('.emoji-picker')?.contains(e.target as Node)
    ) {
      setShowEmojiPicker(false);
    }
  };

  // Add click outside listener
  useState(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <div className="border-t border-neutral-200 p-3 bg-white sticky bottom-0">
      <form onSubmit={handleSendMessage}>
        {/* Reply preview */}
        {replyToMessage && (
          <div className="mb-2 px-4 py-2 bg-gray-100 rounded-lg flex items-center justify-between">
            <div className="flex flex-col">
              <div className="text-xs text-neutral-500 font-medium mb-1">
                Replying to {replyToMessage.sender?.displayName || 'User'}
              </div>
              <div className="text-sm text-neutral-800 truncate max-w-[250px]">
                {replyToMessage.content.length > 50 
                  ? `${replyToMessage.content.substring(0, 50)}...` 
                  : replyToMessage.content
                }
              </div>
            </div>
            {onCancelReply && (
              <button 
                type="button"
                onClick={onCancelReply}
                className="p-1 rounded-full hover:bg-neutral-200 transition-colors text-neutral-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        
        <div className="flex items-center bg-neutral-100 rounded-full pr-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Message"
              className="w-full bg-transparent py-2 px-4 focus:outline-none text-neutral-800"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              ref={inputRef}
            />
          </div>
          <div className="flex items-center">
            <button 
              type="button"
              className="p-2 rounded-full hover:bg-neutral-200 transition-colors text-neutral-500"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button 
              type="button"
              className="p-2 rounded-full hover:bg-neutral-200 transition-colors text-neutral-500"
            >
              <Image className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-neutral-200 transition-colors text-neutral-500"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                ref={emojiButtonRef}
              >
                <Smile className="h-5 w-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 z-10">
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className={`ml-1 w-10 h-10 rounded-full flex items-center justify-center text-white ${
                message.trim() && !sendMessageMutation.isPending
                  ? "bg-primary hover:bg-opacity-90"
                  : "bg-neutral-400"
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
