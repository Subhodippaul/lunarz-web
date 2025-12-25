"use client";
import { useState } from "react";
import { ChatService } from "@/lib/chat-services";
import { useToast } from "@/components/ui/toast";

export default function ChatTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const { addToast } = useToast();

  const testGuestChat = async () => {
    setLoading(true);
    setResult("");
    
    try {
      // Test creating a guest chat session
      const sessionId = await ChatService.createChatSession(
        undefined, // no userId
        "test@example.com",
        "Test Guest User"
      );
      
      // Test sending a message
      await ChatService.sendMessage(
        sessionId,
        "test@example.com",
        'user',
        "Test Guest User",
        "Hello, this is a test message from a guest user!"
      );
      
      setResult(`✅ Guest chat session created and message sent successfully: ${sessionId}`);
      
      addToast({
        title: "Success",
        description: "Guest chat system is working correctly!",
        type: "success",
      });
    } catch (error: any) {
      console.error("Guest chat test failed:", error);
      setResult(`❌ Guest chat test failed: ${error.message}`);
      
      addToast({
        title: "Error",
        description: "Guest chat system test failed. Check console for details.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testUserChat = async () => {
    setLoading(true);
    setResult("");
    
    try {
      // Test creating a user chat session
      const sessionId = await ChatService.createChatSession(
        "test-user-123", // userId
        undefined, // no guestEmail
        "Test Registered User"
      );
      
      // Test sending a message
      await ChatService.sendMessage(
        sessionId,
        "test-user-123",
        'user',
        "Test Registered User",
        "Hello, this is a test message from a registered user!"
      );
      
      setResult(`✅ User chat session created and message sent successfully: ${sessionId}`);
      
      addToast({
        title: "Success",
        description: "User chat system is working correctly!",
        type: "success",
      });
    } catch (error: any) {
      console.error("User chat test failed:", error);
      setResult(`❌ User chat test failed: ${error.message}`);
      
      addToast({
        title: "Error",
        description: "User chat system test failed. Check console for details.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Chat System Test</h3>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={testGuestChat}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Guest Chat"}
        </button>
        
        <button
          onClick={testUserChat}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test User Chat"}
        </button>
      </div>
      
      {result && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm font-mono">{result}</p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>These tests will:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Guest Chat:</strong> Create session with email/name, send message</li>
          <li><strong>User Chat:</strong> Create session with userId, send message</li>
          <li>Verify Firebase connection and data handling</li>
          <li>Check if collections are accessible</li>
        </ul>
        
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> These tests create actual data in your Firebase database. 
            You can view the created sessions in the Admin → Support page.
          </p>
        </div>
      </div>
    </div>
  );
}