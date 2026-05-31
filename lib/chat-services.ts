import { supabase } from './supabase';

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
        unread_count: 0,
        user_unread_count: 0,
      };

      if (userId) sessionData.user_id = userId;
      if (guestEmail) sessionData.guest_email = guestEmail;
      if (guestName) sessionData.guest_name = guestName;
      if (subject) sessionData.subject = subject;

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      // Send welcome message
      await this.sendMessage(
        data.id,
        'system',
        'system',
        'System',
        'Hello! Thank you for contacting Lunarz support. An admin will be with you shortly. You can also reach us at lunarz.info@gmail.com for urgent matters.',
        'system'
      );

      return data.id;
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
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          sender_id: senderId,
          sender_type: senderType,
          sender_name: senderName,
          message,
          message_type: messageType,
          is_read: false,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Update session with last message and unread count
      const updateData: any = {
        last_message: message,
        status: senderType === 'system' ? 'waiting' : 'active',
      };

      // Increment unread count for the recipient
      if (senderType === 'user') {
        const unreadCount = await this.getUnreadCount(sessionId, 'admin');
        updateData.unread_count = unreadCount + 1;
      } else if (senderType === 'admin') {
        const userUnreadCount = await this.getUnreadCount(sessionId, 'user');
        updateData.user_unread_count = userUnreadCount + 1;
      }

      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (updateError) throw updateError;

      return messageData.id;
    } catch (error: any) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Get chat sessions for admin
  static async getAdminChatSessions(): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => this.mapToChatSession(row));
    } catch (error) {
      console.error("Error fetching admin chat sessions:", error);
      return [];
    }
  }

  // Get user's chat sessions
  static async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => this.mapToChatSession(row));
    } catch (error) {
      console.error("Error fetching user chat sessions:", error);
      return [];
    }
  }

  // Get guest chat session by email
  static async getGuestChatSession(email: string): Promise<ChatSession | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('guest_email', email)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return this.mapToChatSession(data);
    } catch (error) {
      console.error("Error fetching guest chat session:", error);
      return null;
    }
  }

  // Get messages for a chat session
  static async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        sessionId: row.session_id,
        senderId: row.sender_id,
        senderType: row.sender_type,
        senderName: row.sender_name,
        message: row.message,
        timestamp: row.timestamp,
        isRead: row.is_read,
        messageType: row.message_type,
      }));
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(sessionId: string, readerType: 'user' | 'admin'): Promise<void> {
    try {
      const updateData = readerType === 'user' 
        ? { user_unread_count: 0 }
        : { unread_count: 0 };

      const { error } = await supabase
        .from('chat_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  // Get unread count
  static async getUnreadCount(sessionId: string, readerType: 'user' | 'admin'): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(readerType === 'user' ? 'user_unread_count' : 'unread_count')
        .eq('id', sessionId)
        .single();

      if (error || !data) return 0;
      return readerType === 'user' ? (data.user_unread_count || 0) : (data.unread_count || 0);
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  // Update chat session status
  static async updateChatStatus(sessionId: string, status: ChatSession['status'], assignedTo?: string): Promise<void> {
    try {
      const updateData: any = { status };
      if (assignedTo) updateData.assigned_to = assignedTo;

      const { error } = await supabase
        .from('chat_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(`Failed to update chat status: ${error.message}`);
    }
  }

  // Subscribe to chat messages (real-time)
  static subscribeToChatMessages(
    sessionId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const channel = supabase
      .channel(`chat_messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          // Fetch all messages when any change occurs
          const messages = await this.getChatMessages(sessionId);
          callback(messages);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Subscribe to admin chat sessions (real-time)
  static subscribeToAdminChatSessions(
    callback: (sessions: ChatSession[]) => void
  ): () => void {
    const channel = supabase
      .channel('admin_chat_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
        },
        async () => {
          // Fetch all sessions when any change occurs
          const sessions = await this.getAdminChatSessions();
          callback(sessions);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
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

  // Helper method to map database row to ChatSession
  private static mapToChatSession(row: any): ChatSession {
    return {
      id: row.id,
      userId: row.user_id,
      guestEmail: row.guest_email,
      guestName: row.guest_name,
      status: row.status,
      subject: row.subject,
      priority: row.priority,
      assignedTo: row.assigned_to,
      lastMessage: row.last_message,
      unreadCount: row.unread_count,
      userUnreadCount: row.user_unread_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
