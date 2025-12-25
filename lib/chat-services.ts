import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Collections
const COLLECTIONS = {
  CHAT_SESSIONS: "chatSessions",
  CHAT_MESSAGES: "chatMessages",
} as const;

export interface ChatSession {
  id: string;
  userId?: string; // Optional for guest users
  guestEmail?: string; // For guest users
  guestName?: string; // For guest users
  status: 'active' | 'closed' | 'waiting';
  subject?: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string; // Admin user ID
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  unreadCount: number; // Unread messages for admin
  userUnreadCount: number; // Unread messages for user
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string; // User ID or 'system' or admin ID
  senderType: 'user' | 'admin' | 'system';
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'system' | 'email_notification';
}

export class ChatService {
  // Create a new chat session
  static async createChatSession(
    userId?: string,
    guestEmail?: string,
    guestName?: string,
    subject?: string
  ): Promise<string> {
    try {
      const sessionData: any = {
        status: 'waiting',
        priority: 'medium',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        unreadCount: 0,
        userUnreadCount: 0,
      };

      // Only add fields that are not undefined
      if (userId) {
        sessionData.userId = userId;
      }
      if (guestEmail) {
        sessionData.guestEmail = guestEmail;
      }
      if (guestName) {
        sessionData.guestName = guestName;
      }
      if (subject) {
        sessionData.subject = subject;
      }

      const docRef = await addDoc(collection(db, COLLECTIONS.CHAT_SESSIONS), sessionData);

      // Send welcome message
      await this.sendMessage(
        docRef.id,
        'system',
        'system',
        'System',
        'Hello! Thank you for contacting Lunarz support. An admin will be with you shortly. You can also reach us at lunarz.info@gmail.com for urgent matters.',
        'system'
      );

      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to create chat session: ${error.message}`);
    }
  }

  // Send a message
  static async sendMessage(
    sessionId: string,
    senderId: string,
    senderType: 'user' | 'admin' | 'system',
    senderName: string,
    message: string,
    messageType: 'text' | 'system' | 'email_notification' = 'text'
  ): Promise<string> {
    try {
      const messageData: any = {
        sessionId,
        senderId,
        senderType,
        senderName,
        message,
        timestamp: Timestamp.now(),
        isRead: false,
        messageType,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.CHAT_MESSAGES), messageData);

      // Update session with last message and unread count
      const sessionRef = doc(db, COLLECTIONS.CHAT_SESSIONS, sessionId);
      const updateData: any = {
        lastMessage: message,
        updatedAt: Timestamp.now(),
        status: senderType === 'system' ? 'waiting' : 'active',
      };

      // Increment unread count for the recipient
      if (senderType === 'user') {
        updateData.unreadCount = await this.getUnreadCount(sessionId, 'admin') + 1;
      } else if (senderType === 'admin') {
        updateData.userUnreadCount = await this.getUnreadCount(sessionId, 'user') + 1;
      }

      await updateDoc(sessionRef, updateData);

      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Get chat sessions for admin
  static async getAdminChatSessions(): Promise<ChatSession[]> {
    try {
      const q = query(collection(db, COLLECTIONS.CHAT_SESSIONS));
      const querySnapshot = await getDocs(q);
      
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      })) as ChatSession[];

      // Sort by updatedAt in JavaScript
      return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error("Error fetching admin chat sessions:", error);
      return [];
    }
  }

  // Get user's chat sessions
  static async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.CHAT_SESSIONS),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      })) as ChatSession[];

      // Sort by updatedAt in JavaScript instead of Firestore
      return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error("Error fetching user chat sessions:", error);
      return [];
    }
  }

  // Get guest chat session by email
  static async getGuestChatSession(email: string): Promise<ChatSession | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.CHAT_SESSIONS),
        where("guestEmail", "==", email)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      // Get the most recent session by sorting in JavaScript
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      })) as ChatSession[];

      // Sort by updatedAt and return the most recent
      sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return sessions[0];
    } catch (error) {
      console.error("Error fetching guest chat session:", error);
      return null;
    }
  }

  // Get messages for a chat session
  static async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.CHAT_MESSAGES),
        where("sessionId", "==", sessionId)
      );
      const querySnapshot = await getDocs(q);
      
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
      })) as ChatMessage[];

      // Sort by timestamp in JavaScript
      return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(sessionId: string, readerType: 'user' | 'admin'): Promise<void> {
    try {
      const sessionRef = doc(db, COLLECTIONS.CHAT_SESSIONS, sessionId);
      
      if (readerType === 'user') {
        await updateDoc(sessionRef, {
          userUnreadCount: 0,
          updatedAt: Timestamp.now(),
        });
      } else {
        await updateDoc(sessionRef, {
          unreadCount: 0,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  // Get unread count
  static async getUnreadCount(sessionId: string, readerType: 'user' | 'admin'): Promise<number> {
    try {
      const sessionRef = doc(db, COLLECTIONS.CHAT_SESSIONS, sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        const data = sessionDoc.data();
        return readerType === 'user' ? (data.userUnreadCount || 0) : (data.unreadCount || 0);
      }
      return 0;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  // Update chat session status
  static async updateChatStatus(sessionId: string, status: ChatSession['status'], assignedTo?: string): Promise<void> {
    try {
      const sessionRef = doc(db, COLLECTIONS.CHAT_SESSIONS, sessionId);
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (assignedTo) {
        updateData.assignedTo = assignedTo;
      }

      await updateDoc(sessionRef, updateData);
    } catch (error: any) {
      throw new Error(`Failed to update chat status: ${error.message}`);
    }
  }

  // Subscribe to chat messages (real-time)
  static subscribeToChatMessages(
    sessionId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const q = query(
      collection(db, COLLECTIONS.CHAT_MESSAGES),
      where("sessionId", "==", sessionId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
      })) as ChatMessage[];
      
      // Sort by timestamp in JavaScript
      messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      callback(messages);
    });
  }

  // Subscribe to admin chat sessions (real-time)
  static subscribeToAdminChatSessions(
    callback: (sessions: ChatSession[]) => void
  ): () => void {
    const q = query(collection(db, COLLECTIONS.CHAT_SESSIONS));

    return onSnapshot(q, (querySnapshot) => {
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      })) as ChatSession[];
      
      // Sort by updatedAt in JavaScript
      sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      callback(sessions);
    });
  }

  // Send email notification (placeholder - would integrate with email service)
  static async sendEmailNotification(
    sessionId: string,
    recipientEmail: string,
    subject: string,
    message: string
  ): Promise<void> {
    try {
      // This would integrate with an email service like SendGrid, Nodemailer, etc.
      // For now, we'll just log and add a system message
      console.log(`Email notification sent to ${recipientEmail}: ${subject}`);
      
      await this.sendMessage(
        sessionId,
        'system',
        'system',
        'System',
        `Email notification sent to ${recipientEmail}: ${subject}`,
        'email_notification'
      );
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }
}