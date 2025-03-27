import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMessageSchema, 
  insertReactionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  
  // Get current conversation (for demo, we'll just use the first conversation)
  app.get("/api/conversations/current", async (req, res) => {
    const conversation = await storage.getConversationWithUsers(1);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    res.json(conversation);
  });
  
  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    const { id } = req.params;
    const conversationId = parseInt(id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }
    
    const messages = await storage.getMessagesByConversation(conversationId);
    res.json(messages);
  });
  
  // Add a new message
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      // If message has attachment, process it
      if (messageData.hasAttachment && req.body.attachment) {
        await storage.createAttachment({
          messageId: message.id,
          fileName: req.body.attachment.fileName,
          fileSize: req.body.attachment.fileSize,
          fileType: req.body.attachment.fileType,
          url: req.body.attachment.url
        });
      }
      
      const messageWithRelations = await storage.getMessageWithRelations(message.id);
      res.status(201).json(messageWithRelations);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  
  // Delete a message
  app.delete("/api/messages/:id", async (req, res) => {
    const { id } = req.params;
    const messageId = parseInt(id);
    
    if (isNaN(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }
    
    const message = await storage.getMessage(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    const success = await storage.deleteMessage(messageId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });
  
  // Add a reaction to a message
  app.post("/api/messages/:id/reactions", async (req, res) => {
    const { id } = req.params;
    const messageId = parseInt(id);
    
    if (isNaN(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }
    
    try {
      const reactionData = insertReactionSchema.parse({
        ...req.body,
        messageId
      });
      
      const reaction = await storage.createReaction(reactionData);
      const reactions = await storage.getReactionsByMessage(messageId);
      
      res.status(201).json(reactions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });
  
  // Delete a reaction
  app.delete("/api/reactions/:id", async (req, res) => {
    const { id } = req.params;
    const reactionId = parseInt(id);
    
    if (isNaN(reactionId)) {
      return res.status(400).json({ message: "Invalid reaction ID" });
    }
    
    const success = await storage.deleteReaction(reactionId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Failed to delete reaction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
