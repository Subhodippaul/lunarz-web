"use client";
import { useState, useEffect, useRef } from "react";
import { ChatService, ChatSession, ChatMessage } from "@/lib/chat-services";
import { useAuth } from "@/lib/auth-context";
import { 
  MessageCircle, 
  Send, 
  Search, 
  Filter,
  Clock,
  User,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical,
  Archive,
  UserCheck
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminSupport() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'waiting' | 'closed'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeSessionsRef = useRef<(() => void) | null>(null);
  const unsubscribeMessagesRef = useRef<(() => void) | null>(null);
  
  const { state } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    // Subscribe to real-time chat sessions
    unsubscribeSessionsRef.current = ChatService.subscribeToAdminChatSessions((newSessions) => {
      setSessions(newSessions);
      setLoading(false);
    });

    return () => {
      if (unsubscribeSessionsRef.current) {
        unsubscribeSessionsRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedSession) {
      // Subscribe to real-time messages for selected session
      unsubscribeMessagesRef.current = ChatService.subscribeToChatMessages(
        selectedSession.id,
        (newMessages) => {
          setMessages(newMessages);
          // Mark messages as read for admin
          ChatService.markMessagesAsRead(selectedSession.id, 'admin');
        }
      );

      return () => {
        if (unsubscribeMessagesRef.current) {
          unsubscribeMessagesRef.current();
        }
      };
    }
  }, [selectedSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSessionSelect = async (session: ChatSession) => {
    setSelectedSession(session);
    
    // Mark session as active if it was waiting
    if (session.status === 'waiting') {
      await ChatService.updateChatStatus(session.id, 'active', state.user?.id);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSession || !state.user) return;

    try {
      await ChatService.sendMessage(
        selectedSession.id,
        state.user.id,
        'admin',
        state.user.name || 'Admin',
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

  const handleStatusChange = async (sessionId: string, status: ChatSession['status']) => {
    try {
      await ChatService.updateChatStatus(sessionId, status, state.user?.id);
      addToast({
        title: "Success",
        description: `Chat status updated to ${status}`,
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update chat status",
        type: "error",
      });
    }
  };

  const handleSendEmail = async (session: ChatSession) => {
    if (!session.guestEmail && !session.userId) return;
    
    const email = session.guestEmail || 'user@example.com'; // Would get from user data
    const subject = `Lunarz Support - Chat Session ${session.id.slice(-6)}`;
    const message = `Thank you for contacting Lunarz support. We've received your message and will get back to you soon. You can also continue our conversation in the chat widget on our website.`;
    
    try {
      await ChatService.sendEmailNotification(session.id, email, subject, message);
      addToast({
        title: "Success",
        description: "Email notification sent",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to send email notification",
        type: "error",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      (session.guestName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.subject?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalUnread = sessions.reduce((sum, session) => sum + (session.unreadCount || 0), 0);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Chat</h1>
          <p className="text-gray-600 mt-1">
            Manage customer support conversations • {totalUnread} unread messages
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Email: <a href="mailto:lunarz.info@gmail.com" className="text-blue-600 hover:underline">
            lunarz.info@gmail.com
          </a>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sessions List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Conversations</option>
                <option value="waiting">Waiting</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Sessions */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations found</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSessionSelect(session)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSession?.id === session.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="shrink-0">
                          {session.userId ? (
                            <User className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                          ) : (
                            <Mail className="h-8 w-8 text-blue-400 bg-blue-100 rounded-full p-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.guestName || session.userId || 'Unknown User'}
                            </p>
                            {session.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {session.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {session.guestEmail || 'Registered User'}
                          </p>
                          {session.lastMessage && (
                            <p className="text-xs text-gray-600 truncate mt-1">
                              {session.lastMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      {selectedSession.userId ? (
                        <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                      ) : (
                        <Mail className="h-10 w-10 text-blue-400 bg-blue-100 rounded-full p-2" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedSession.guestName || selectedSession.userId || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedSession.guestEmail || 'Registered User'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(selectedSession.status)}
                        <span className="text-xs text-gray-600">
                          {selectedSession.status} • Created {new Date(selectedSession.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSendEmail(selectedSession)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Send Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    
                    <select
                      value={selectedSession.status}
                      onChange={(e) => handleStatusChange(selectedSession.id, e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="waiting">Waiting</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderType === 'admin'
                          ? 'bg-blue-600 text-white'
                          : message.senderType === 'system'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {message.senderType !== 'admin' && message.senderType !== 'system' && (
                        <p className="text-xs font-medium mb-1 text-gray-600">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </button>
                </form>
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Reply as {state.user?.name || 'Admin'}</span>
                  <span>Email: lunarz.info@gmail.com</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start chatting with customers
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}