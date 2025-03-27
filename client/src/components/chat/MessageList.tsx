import { useEffect, useRef } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import MessageItem from "./MessageItem";
import DateSeparator from "./DateSeparator";
import { type MessageWithRelations } from "@shared/schema";

interface MessageListProps {
  messages: MessageWithRelations[];
  currentUserId: number;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: Date; messages: MessageWithRelations[] }[]>(
    (groups, message) => {
      const messageDate = new Date(message.timestamp);
      const existingGroup = groups.find(group => 
        isSameDay(group.date, messageDate)
      );

      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }

      return groups;
    },
    []
  );

  // Format the date for display
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6" id="messagesContainer">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-6">
          <DateSeparator date={formatDate(group.date)} />
          
          {group.messages.map((message, messageIndex) => (
            <MessageItem
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === currentUserId}
              previousMessage={messageIndex > 0 ? group.messages[messageIndex - 1] : undefined}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
