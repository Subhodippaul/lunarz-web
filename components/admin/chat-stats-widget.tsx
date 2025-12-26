"use client";
import { useState, useEffect } from "react";
import { ChatService } from "@/lib/chat-services";
import { MessageCircle, Clock, CheckCircle, Users } from "lucide-react";
import Link from "next/link";

interface ChatStats {
  totalSessions: number;
  activeSessions: number;
  waitingSessions: number;
  totalUnreadMessages: number;
}

export default function ChatStatsWidget() {
  const [stats, setStats] = useState<ChatStats>({
    totalSessions: 0,
    activeSessions: 0,
    waitingSessions: 0,
    totalUnreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatStats();
    
    // Set up real-time updates
    const unsubscribe = ChatService.subscribeToAdminChatSessions((sessions) => {
      const activeSessions = sessions.filter(s => s.status === 'active').length;
      const waitingSessions = sessions.filter(s => s.status === 'waiting').length;
      const totalUnreadMessages = sessions.reduce((sum, s) => sum + (s.unreadCount || 0), 0);
      
      setStats({
        totalSessions: sessions.length,
        activeSessions,
        waitingSessions,
        totalUnreadMessages,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchChatStats = async () => {
    try {
      const sessions = await ChatService.getAdminChatSessions();
      const activeSessions = sessions.filter(s => s.status === 'active').length;
      const waitingSessions = sessions.filter(s => s.status === 'waiting').length;
      const totalUnreadMessages = sessions.reduce((sum, s) => sum + (s.unreadCount || 0), 0);
      
      setStats({
        totalSessions: sessions.length,
        activeSessions,
        waitingSessions,
        totalUnreadMessages,
      });
    } catch (error) {
      console.error("Error fetching chat stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Support Chat</h3>
        <Link
          href="/admin/support"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Chats</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalSessions}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-xl font-bold text-gray-900">{stats.activeSessions}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Waiting</p>
            <p className="text-xl font-bold text-gray-900">{stats.waitingSessions}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Users className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Unread</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalUnreadMessages}</p>
          </div>
        </div>
      </div>

      {stats.waitingSessions > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>{stats.waitingSessions}</strong> customer{stats.waitingSessions > 1 ? 's' : ''} waiting for response
          </p>
        </div>
      )}

      {stats.totalUnreadMessages > 0 && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>{stats.totalUnreadMessages}</strong> unread message{stats.totalUnreadMessages > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}