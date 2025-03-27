import {
  users, type User, type InsertUser,
  messages, type Message, type InsertMessage,
  attachments, type Attachment, type InsertAttachment,
  reactions, type Reaction, type InsertReaction,
  conversations, type Conversation, type InsertConversation,
  participants, type Participant, type InsertParticipant,
  type MessageWithRelations, type ConversationWithUsers
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessageWithRelations(id: number): Promise<MessageWithRelations | undefined>;
  getMessagesByConversation(conversationId: number): Promise<MessageWithRelations[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Attachment operations
  getAttachment(id: number): Promise<Attachment | undefined>;
  getAttachmentByMessage(messageId: number): Promise<Attachment | undefined>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  
  // Reaction operations
  getReactionsByMessage(messageId: number): Promise<(Reaction & { user?: User })[]>;
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  deleteReaction(id: number): Promise<boolean>;
  
  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationWithUsers(id: number): Promise<ConversationWithUsers | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Participant operations
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipants(conversationId: number): Promise<(Participant & { user: User })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private attachments: Map<number, Attachment>;
  private reactions: Map<number, Reaction>;
  private conversations: Map<number, Conversation>;
  private participants: Map<number, Participant>;
  
  private userId: number;
  private messageId: number;
  private attachmentId: number;
  private reactionId: number;
  private conversationId: number;
  private participantId: number;
  
  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.attachments = new Map();
    this.reactions = new Map();
    this.conversations = new Map();
    this.participants = new Map();
    
    this.userId = 1;
    this.messageId = 1;
    this.attachmentId = 1;
    this.reactionId = 1;
    this.conversationId = 1;
    this.participantId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Create users
    const user1: User = {
      id: this.userId++,
      username: "sarah",
      password: "password",
      displayName: "Sarah Johnson",
      status: "online",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=64&h=64&q=80"
    };
    
    const user2: User = {
      id: this.userId++,
      username: "currentuser",
      password: "password",
      displayName: "You",
      status: "online"
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    
    // Create conversation
    const conversation: Conversation = {
      id: this.conversationId++,
      name: undefined,
      lastMessageAt: new Date()
    };
    this.conversations.set(conversation.id, conversation);
    
    // Add participants
    const participant1: Participant = {
      id: this.participantId++,
      conversationId: conversation.id,
      userId: user1.id
    };
    
    const participant2: Participant = {
      id: this.participantId++,
      conversationId: conversation.id,
      userId: user2.id
    };
    
    this.participants.set(participant1.id, participant1);
    this.participants.set(participant2.id, participant2);
    
    // Yesterday's date for older messages
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Create messages
    const message1: Message = {
      id: this.messageId++,
      conversationId: conversation.id,
      senderId: user1.id,
      content: "Hi! How's your day going? Just checking in to see if you've had a chance to look at the project proposal I sent yesterday.",
      timestamp: new Date(yesterday.setHours(10, 32, 0, 0)),
      status: "read",
      replyToId: null,
      hasAttachment: false
    };
    
    const message2: Message = {
      id: this.messageId++,
      conversationId: conversation.id,
      senderId: user1.id,
      content: "Here's the full document with all the details.",
      timestamp: new Date(yesterday.setHours(10, 33, 0, 0)),
      status: "read",
      replyToId: null,
      hasAttachment: true
    };
    
    const message3: Message = {
      id: this.messageId++,
      conversationId: conversation.id,
      senderId: user2.id,
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco labori",
      timestamp: new Date(yesterday.setHours(11, 25, 0, 0)),
      status: "read",
      replyToId: null,
      hasAttachment: false
    };
    
    // Today's messages
    const today = new Date();
    
    const message4: Message = {
      id: this.messageId++,
      conversationId: conversation.id,
      senderId: user2.id,
      content: "Do androids truly dream of electric sheep?",
      timestamp: new Date(today.setHours(12, 25, 0, 0)),
      status: "sent",
      replyToId: message1.id,
      hasAttachment: false
    };
    
    this.messages.set(message1.id, message1);
    this.messages.set(message2.id, message2);
    this.messages.set(message3.id, message3);
    this.messages.set(message4.id, message4);
    
    // Create attachment
    const attachment: Attachment = {
      id: this.attachmentId++,
      messageId: message2.id,
      fileName: "Design_project_2025.docx",
      fileSize: "2.5gb",
      fileType: "docx",
      url: "/files/design_project.docx"
    };
    this.attachments.set(attachment.id, attachment);
    
    // Create reaction
    const reaction: Reaction = {
      id: this.reactionId++,
      messageId: message3.id,
      userId: user1.id,
      emoji: "👍"
    };
    this.reactions.set(reaction.id, reaction);
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessageWithRelations(id: number): Promise<MessageWithRelations | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const sender = await this.getUser(message.senderId);
    const reactions = await this.getReactionsByMessage(id);
    const attachment = await this.getAttachmentByMessage(id);
    let replyTo: Message | undefined;
    
    if (message.replyToId) {
      replyTo = await this.getMessage(message.replyToId);
    }
    
    return {
      ...message,
      sender,
      reactions,
      attachment,
      replyTo
    };
  }
  
  async getMessagesByConversation(conversationId: number): Promise<MessageWithRelations[]> {
    const messages = Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    const messagesWithRelations: MessageWithRelations[] = [];
    
    for (const message of messages) {
      const messageWithRelations = await this.getMessageWithRelations(message.id);
      if (messageWithRelations) {
        messagesWithRelations.push(messageWithRelations);
      }
    }
    
    return messagesWithRelations;
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date(), 
      status: "sent" 
    };
    
    this.messages.set(id, message);
    
    // Update conversation lastMessageAt
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      conversation.lastMessageAt = message.timestamp;
      this.conversations.set(conversation.id, conversation);
    }
    
    return message;
  }
  
  async deleteMessage(id: number): Promise<boolean> {
    // Delete associated reactions and attachments
    Array.from(this.reactions.values())
      .filter(reaction => reaction.messageId === id)
      .forEach(reaction => this.reactions.delete(reaction.id));
      
    Array.from(this.attachments.values())
      .filter(attachment => attachment.messageId === id)
      .forEach(attachment => this.attachments.delete(attachment.id));
    
    return this.messages.delete(id);
  }
  
  // Attachment operations
  async getAttachment(id: number): Promise<Attachment | undefined> {
    return this.attachments.get(id);
  }
  
  async getAttachmentByMessage(messageId: number): Promise<Attachment | undefined> {
    return Array.from(this.attachments.values())
      .find(attachment => attachment.messageId === messageId);
  }
  
  async createAttachment(insertAttachment: InsertAttachment): Promise<Attachment> {
    const id = this.attachmentId++;
    const attachment: Attachment = { ...insertAttachment, id };
    this.attachments.set(id, attachment);
    return attachment;
  }
  
  // Reaction operations
  async getReactionsByMessage(messageId: number): Promise<(Reaction & { user?: User })[]> {
    const reactions = Array.from(this.reactions.values())
      .filter(reaction => reaction.messageId === messageId);
    
    return Promise.all(reactions.map(async reaction => {
      const user = await this.getUser(reaction.userId);
      return { ...reaction, user };
    }));
  }
  
  async createReaction(insertReaction: InsertReaction): Promise<Reaction> {
    // Remove existing reaction by same user on same message
    const existingReaction = Array.from(this.reactions.values())
      .find(r => r.messageId === insertReaction.messageId && r.userId === insertReaction.userId);
      
    if (existingReaction) {
      this.reactions.delete(existingReaction.id);
    }
    
    const id = this.reactionId++;
    const reaction: Reaction = { ...insertReaction, id };
    this.reactions.set(id, reaction);
    return reaction;
  }
  
  async deleteReaction(id: number): Promise<boolean> {
    return this.reactions.delete(id);
  }
  
  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async getConversationWithUsers(id: number): Promise<ConversationWithUsers | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const participants = await this.getParticipants(id);
    const messages = await this.getMessagesByConversation(id);
    
    return {
      ...conversation,
      participants,
      messages
    };
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationId++;
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      lastMessageAt: new Date() 
    };
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  // Participant operations
  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.participantId++;
    const participant: Participant = { ...insertParticipant, id };
    this.participants.set(id, participant);
    return participant;
  }
  
  async getParticipants(conversationId: number): Promise<(Participant & { user: User })[]> {
    const participants = Array.from(this.participants.values())
      .filter(participant => participant.conversationId === conversationId);
    
    return Promise.all(participants.map(async participant => {
      const user = await this.getUser(participant.userId);
      return { ...participant, user: user! };
    }));
  }
}

export const storage = new MemStorage();
