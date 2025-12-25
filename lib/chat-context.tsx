"use client";
import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { ChatSession, ChatMessage, ChatService } from "./chat-services";
import { useAuth } from "./auth-context";

interface ChatState {
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

type ChatAction =
  | { type: "SET_SESSION"; payload: ChatSession | null }
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_UNREAD_COUNT"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" };

const initialState: ChatState = {
  currentSession: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_SESSION":
      return { ...state, currentSession: action.payload };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_UNREAD_COUNT":
      return { ...state, unreadCount: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  createSession: (guestEmail?: string, guestName?: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  markAsRead: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { state: authState } = useAuth();

  // Load existing session on auth state change
  useEffect(() => {
    if (authState.user && !state.currentSession) {
      loadUserSession();
    }
  }, [authState.user]);

  const loadUserSession = async () => {
    if (!authState.user) return;
    
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const sessions = await ChatService.getUserChatSessions(authState.user.id);
      
      if (sessions.length > 0) {
        const activeSession = sessions.find(s => s.status === 'active') || sessions[0];
        dispatch({ type: "SET_SESSION", payload: activeSession });
        
        const messages = await ChatService.getChatMessages(activeSession.id);
        dispatch({ type: "SET_MESSAGES", payload: messages });
        
        // Count unread messages
        const unreadMessages = messages.filter(
          msg => !msg.isRead && msg.senderType === 'admin'
        );
        dispatch({ type: "SET_UNREAD_COUNT", payload: unreadMessages.length });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load chat session" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createSession = async (guestEmail?: string, guestName?: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });
      
      let sessionId: string;
      
      if (authState.user) {
        // Logged-in user
        sessionId = await ChatService.createChatSession(
          authState.user.id,
          undefined,
          authState.user.name
        );
      } else if (guestEmail && guestName) {
        // Guest user
        const existingSession = await ChatService.getGuestChatSession(guestEmail);
        
        if (existingSession) {
          dispatch({ type: "SET_SESSION", payload: existingSession });
          const messages = await ChatService.getChatMessages(existingSession.id);
          dispatch({ type: "SET_MESSAGES", payload: messages });
          return;
        }
        
        sessionId = await ChatService.createChatSession(
          undefined,
          guestEmail,
          guestName
        );
      } else {
        throw new Error("Invalid session parameters");
      }
      
      const newSession: ChatSession = {
        id: sessionId,
        userId: authState.user?.id,
        guestEmail,
        guestName,
        status: 'waiting',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        unreadCount: 0,
        userUnreadCount: 0,
      };
      
      dispatch({ type: "SET_SESSION", payload: newSession });
      dispatch({ type: "SET_MESSAGES", payload: [] });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const sendMessage = async (message: string) => {
    if (!state.currentSession) {
      dispatch({ type: "SET_ERROR", payload: "No active chat session" });
      return;
    }

    try {
      const senderName = authState.user?.name || state.currentSession.guestName || 'Guest';
      const senderId = authState.user?.id || state.currentSession.guestEmail || 'guest';
      
      await ChatService.sendMessage(
        state.currentSession.id,
        senderId,
        'user',
        senderName,
        message
      );
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const markAsRead = async () => {
    if (!state.currentSession) return;
    
    try {
      await ChatService.markMessagesAsRead(state.currentSession.id, 'user');
      dispatch({ type: "SET_UNREAD_COUNT", payload: 0 });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        state,
        dispatch,
        createSession,
        sendMessage,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}