interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '👎', '😊', '🙏', '🔥', '🎉'];

  return (
    <div className="emoji-picker bg-white shadow-lg rounded-lg p-2 flex flex-wrap justify-center animate-slide-up">
      {commonEmojis.map((emoji, index) => (
        <button
          key={index}
          className="cursor-pointer p-2 hover:bg-neutral-100 rounded text-lg"
          onClick={() => onEmojiSelect(emoji)}
          type="button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
