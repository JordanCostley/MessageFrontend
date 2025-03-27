import { format, isToday, isYesterday } from "date-fns";
import { type MessageWithRelations } from "@shared/schema";

/**
 * Format message timestamp for display
 */
export function formatMessageTime(timestamp: Date | string): string {
  const date = new Date(timestamp);
  return format(date, "h:mm a");
}

/**
 * Format date for message group headers
 */
export function formatMessageDate(date: Date | string): string {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return "Today";
  } else if (isYesterday(dateObj)) {
    return "Yesterday";
  } else {
    return format(dateObj, "MMMM d, yyyy");
  }
}

/**
 * Group messages by date for display with separators
 */
export function groupMessagesByDate(messages: MessageWithRelations[]): {
  date: Date;
  formattedDate: string;
  messages: MessageWithRelations[];
}[] {
  const groups: {
    date: Date;
    formattedDate: string;
    messages: MessageWithRelations[];
  }[] = [];
  
  for (const message of messages) {
    const messageDate = new Date(message.timestamp);
    messageDate.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const existingGroup = groups.find(
      group => group.date.getTime() === messageDate.getTime()
    );
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({
        date: messageDate,
        formattedDate: formatMessageDate(messageDate),
        messages: [message],
      });
    }
  }
  
  // Sort groups by date
  groups.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Sort messages within each group
  groups.forEach(group => {
    group.messages.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });
  
  return groups;
}

/**
 * Count reactions by emoji
 */
export function countReactions(reactions?: { emoji: string }[]): Record<string, number> {
  if (!reactions || reactions.length === 0) {
    return {};
  }
  
  return reactions.reduce<Record<string, number>>((counts, reaction) => {
    const emoji = reaction.emoji;
    counts[emoji] = (counts[emoji] || 0) + 1;
    return counts;
  }, {});
}

/**
 * Determine if a message should show sender info (avatar, name)
 * Usually only the first message in a sequence from the same sender shows this
 */
export function shouldShowSender(
  message: MessageWithRelations,
  previousMessage?: MessageWithRelations
): boolean {
  if (!previousMessage) {
    return true;
  }
  
  if (previousMessage.senderId !== message.senderId) {
    return true;
  }
  
  // If more than 5 minutes between messages, show sender again
  const timeDiff = new Date(message.timestamp).getTime() - 
                  new Date(previousMessage.timestamp).getTime();
  const minutesDiff = timeDiff / (1000 * 60);
  
  return minutesDiff > 5;
}
