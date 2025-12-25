"use client";
import { useState, useEffect, useRef } from "react";
import { ChatService, ChatSession, ChatMessage } from "@/lib/chat-services";
import { useAuth } from "@/lib/auth-context";
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Mail,
  User,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "" });
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  
  const { state } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (currentSession) {
      // Subscribe to real-time messages
      unsubscribeRef.current = ChatService.subscribeToChatMessages(
        currentSession.id,
        (newMessages) => {
          setMessages(newMessages);
          
          // Update unread count
          const unreadMessages = newMessages.filter(
            msg => !msg.isRead && msg.senderType === 'admin'
          );
          setUnreadCount(unreadMessages.length);
          
          // Mark messages as read when chat is open
          if (isOpen && !isMinimized) {
            ChatService.markMessagesAsRead(currentSession.id, 'user');
            setUnreadCount(0);
          }
        }
      );

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }
  }, [currentSession, isOpen, isMinimized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load existing session for logged-in users
    if (state.user && !currentSession) {
      loadUserSession();
    }
  }, [state.user]);

  useEffect(() => {
    // Mark messages as read when chat is opened
    if (isOpen && !isMinimized && currentSession && unreadCount > 0) {
      ChatService.markMessagesAsRead(currentSession.id, 'user');
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized, currentSession, unreadCount]);

  const loadUserSession = async () => {
    if (!state.user) return;
    
    try {
      const sessions = await ChatService.getUserChatSessions(state.user.id);
      if (sessions.length > 0) {
        const activeSession = sessions.find(s => s.status === 'active') || sessions[0];
        setCurrentSession(activeSession);
        
        const sessionMessages = await ChatService.getChatMessages(activeSession.id);
        setMessages(sessionMessages);
        
        // Count unread messages
        const unreadMessages = sessionMessages.filter(
          msg => !msg.isRead && msg.senderType === 'admin'
        );
        setUnreadCount(unreadMessages.length);
      }
    } catch (error) {
      console.error("Error loading user session:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartChat = async () => {
    if (state.user) {
      // Logged-in user
      try {
        setLoading(true);
        const sessionId = await ChatService.createChatSession(
          state.user.id,
          undefined,
          state.user.name
        );
        
        const newSession: ChatSession = {
          id: sessionId,
          userId: state.user.id,
          status: 'waiting',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
          userUnreadCount: 0,
        };
        
        setCurrentSession(newSession);
        setShowGuestForm(false);
      } catch (error: any) {
        console.error("Error starting chat:", error);
        addToast({
          title: "Error",
          description: "Failed to start chat session. Please try again or email us at lunarz.info@gmail.com",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Guest user
      setShowGuestForm(true);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestInfo.name || !guestInfo.email) return;

    try {
      setLoading(true);
      
      // Check if guest already has a session
      const existingSession = await ChatService.getGuestChatSession(guestInfo.email);
      
      if (existingSession) {
        setCurrentSession(existingSession);
        const sessionMessages = await ChatService.getChatMessages(existingSession.id);
        setMessages(sessionMessages);
      } else {
        const sessionId = await ChatService.createChatSession(
          undefined,
          guestInfo.email,
          guestInfo.name
        );
        
        const newSession: ChatSession = {
          id: sessionId,
          guestEmail: guestInfo.email,
          guestName: guestInfo.name,
          status: 'waiting',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
          userUnreadCount: 0,
        };
        
        setCurrentSession(newSession);
      }
      
      setShowGuestForm(false);
    } catch (error: any) {
      console.error("Error starting guest chat:", error);
      addToast({
        title: "Error",
        description: "Failed to start chat session. Please try again or email us at lunarz.info@gmail.com",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentSession) return;

    try {
      const senderName = state.user?.name || guestInfo.name || 'Guest';
      const senderId = state.user?.id || guestInfo.email || 'guest';
      
      await ChatService.sendMessage(
        currentSession.id,
        senderId,
        'user',
        senderName,
        newMessage.trim()
      );
      
      setNewMessage("");
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to send message",
        type: "error",
      });
    }
  };

  const handleToggleChat = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'waiting':
        return 'text-yellow-600';
      case 'closed':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'waiting':
        return 'Waiting for admin';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 ${
            isOpen ? 'scale-0' : 'scale-100'
          }`}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-96'
        } w-80 sm:w-96`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Lunarz Support</h3>
                {currentSession && (
                  <p className={`text-xs ${getStatusColor(currentSession.status)}`}>
                    {getStatusText(currentSession.status)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleChat}
                className="text-white hover:text-gray-200"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleCloseChat}
                className="text-white hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col h-80">
              {!currentSession ? (
                <div className="flex-1 p-4">
                  {!showGuestForm ? (
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">
                        Need help?
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Start a conversation with our support team or email us at{' '}
                        <a 
                          href="mailto:lunarz.info@gmail.com" 
                          className="text-blue-600 hover:underline"
                        >
                          lunarz.info@gmail.com
                        </a>
                      </p>
                      <button
                        onClick={handleStartChat}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? "Starting..." : "Start Chat"}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleGuestSubmit} className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Start a conversation
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Please provide your details to continue
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          value={guestInfo.name}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={guestInfo.email}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowGuestForm(false)}
                          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? "Starting..." : "Start Chat"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderType === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.senderType === 'user'
                              ? 'bg-blue-600 text-white'
                              : message.senderType === 'system'
                              ? 'bg-gray-100 text-gray-700 border'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.senderType !== 'user' && message.senderType !== 'system' && (
                            <p className="text-xs font-medium mb-1">
                              {message.senderName}
                            </p>
                          )}
                          <p>{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderType === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Or email us at lunarz.info@gmail.com</span>
                      {currentSession.status === 'active' && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Admin online</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}