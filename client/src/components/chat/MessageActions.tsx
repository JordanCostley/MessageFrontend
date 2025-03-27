import { Reply, Smile, MoreHorizontal, Copy, Trash2 } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

interface MessageActionsProps {
  isCurrentUser: boolean;
  onReply: () => void;
  onEmojiClick: () => void;
  onMenuClick: () => void;
  showEmojiPicker: boolean;
  showMenu: boolean;
  onEmojiSelect: (emoji: string) => void;
  onCopyText: () => void;
  onDeleteMessage: () => void;
}

export default function MessageActions({
  isCurrentUser,
  onReply,
  onEmojiClick,
  onMenuClick,
  showEmojiPicker,
  showMenu,
  onEmojiSelect,
  onCopyText,
  onDeleteMessage
}: MessageActionsProps) {
  return (
    <div 
      className={`message-actions absolute -top-10 ${
        isCurrentUser ? 'left-0' : 'right-0'
      } flex items-center space-x-1 bg-white p-1 rounded-md shadow-md z-10 animate-fade-in`}
    >
      <button 
        className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
        onClick={onReply}
      >
        <Reply className="h-4 w-4" />
      </button>
      
      <div className="relative">
        <button 
          className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
          onClick={onEmojiClick}
        >
          <Smile className="h-4 w-4" />
        </button>
        
        {showEmojiPicker && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
            <EmojiPicker onEmojiSelect={onEmojiSelect} />
          </div>
        )}
      </div>
      
      <div className="relative">
        <button 
          className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
          onClick={onMenuClick}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        
        {showMenu && (
          <div 
            className="absolute top-8 right-0 bg-white shadow-lg rounded-lg py-1 w-32 z-20 animate-fade-in"
          >
            <button 
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 transition-colors flex items-center"
              onClick={onCopyText}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 transition-colors flex items-center text-red-500"
              onClick={onDeleteMessage}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
