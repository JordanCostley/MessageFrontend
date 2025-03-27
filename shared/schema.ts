import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  status: text("status").default("offline"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").default("sent"),
  replyToId: integer("reply_to_id"),
  hasAttachment: boolean("has_attachment").default(false),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size").notNull(),
  fileType: text("file_type").notNull(),
  url: text("url").notNull(),
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  userId: integer("user_id").notNull(),
  emoji: text("emoji").notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  name: text("name"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  userId: integer("user_id").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatarUrl: true,
  status: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  senderId: true,
  content: true,
  replyToId: true,
  hasAttachment: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).pick({
  messageId: true,
  fileName: true,
  fileSize: true,
  fileType: true,
  url: true,
});

export const insertReactionSchema = createInsertSchema(reactions).pick({
  messageId: true,
  userId: true,
  emoji: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  name: true,
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  conversationId: true,
  userId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type Attachment = typeof attachments.$inferSelect;

export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactions.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;

// Message with relational data
export interface MessageWithRelations extends Message {
  sender?: User;
  reactions?: (Reaction & { user?: User })[];
  attachment?: Attachment;
  replyTo?: Message;
}

// Conversation with participants
export interface ConversationWithUsers extends Conversation {
  participants: (Participant & { user: User })[];
  messages: MessageWithRelations[];
}
