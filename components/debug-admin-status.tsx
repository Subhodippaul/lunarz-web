"use client";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { refreshUserData, checkAdminStatus } from "@/lib/auth-utils";

export default function DebugAdminStatus() {
  const { state, dispatch } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleRefreshUserData = async () => {
    setChecking(true);
    try {
      const userData = await refreshUserData();
      dispatch({ type: "SET_USER", payload: userData });
      alert(`User data refreshed! Admin status: ${userData.isAdmin}`);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setChecking(false);
    }
  };

  const handleCheckAdminStatus = async () => {
    setChecking(true);
    try {
      const isAdmin = await checkAdminStatus();
      alert(`Admin status check: ${isAdmin}`);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setChecking(false);
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p>Please log in to check admin status</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded space-y-4">
      <h3 className="font-bold">Debug: Admin Status</h3>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {state.user?.id}</p>
        <p><strong>Email:</strong> {state.user?.email}</p>
        <p><strong>Name:</strong> {state.user?.name}</p>
        <p><strong>Is Admin:</strong> {state.user?.isAdmin ? "✅ Yes" : "❌ No"}</p>
      </div>
      <div className="space-x-2">
        <button
          onClick={handleRefreshUserData}
          disabled={checking}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {checking ? "Refreshing..." : "Refresh User Data"}
        </button>
        <button
          onClick={handleCheckAdminStatus}
          disabled={checking}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {checking ? "Checking..." : "Check Admin Status"}
        </button>
      </div>
    </div>
  );
}