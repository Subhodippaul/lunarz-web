"use client";
import { useEffect, useState } from "react";
import { Search, Shield, User, Mail, Calendar, Loader2, AlertTriangle, X } from "lucide-react";
import { UserTableSkeleton } from "@/components/admin/skeleton-loaders";

interface UserData {
  id: string;
  uid: string;
  email: string;
  name: string;
  provider: "email" | "google";
  isAdmin?: boolean;
  hasProfile: boolean;
  createdAt: any;
  lastSignIn: string | null;
}

interface ConfirmModal {
  userId: string;
  userName: string;
  currentAdminStatus: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/get-all-users");
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to fetch users");
      }
      const json = await res.json();
      setUsers(json.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openConfirmModal = (userId: string, currentAdminStatus: boolean) => {
    const user = users.find((u) => u.id === userId);
    setConfirmModal({
      userId,
      userName: user?.name || user?.email || "this user",
      currentAdminStatus,
    });
  };

  const handleConfirm = async () => {
    if (!confirmModal) return;
    const { userId, currentAdminStatus } = confirmModal;
    setConfirmModal(null);
    setUpdatingId(userId);

    try {
      const res = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, is_admin: !currentAdminStatus }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isAdmin: !currentAdminStatus } : u))
      );
      showToast(
        currentAdminStatus ? "Admin role removed successfully." : "User is now an admin.",
        "success"
      );
    } catch (error: any) {
      console.error("Error updating user role:", error);
      showToast(error.message || "Failed to update user role.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <UserTableSkeleton />;
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setConfirmModal(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            {/* Close button */}
            <button
              onClick={() => setConfirmModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className={`flex items-center justify-center h-12 w-12 rounded-full mx-auto mb-4 ${
              confirmModal.currentAdminStatus ? "bg-red-100" : "bg-purple-100"
            }`}>
              {confirmModal.currentAdminStatus ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : (
                <Shield className="h-6 w-6 text-purple-600" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {confirmModal.currentAdminStatus ? "Remove Admin Access" : "Grant Admin Access"}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 text-center mb-6">
              {confirmModal.currentAdminStatus ? (
                <>
                  Are you sure you want to remove admin access from{" "}
                  <span className="font-medium text-gray-700">{confirmModal.userName}</span>?
                  They will lose all admin privileges.
                </>
              ) : (
                <>
                  Are you sure you want to grant admin access to{" "}
                  <span className="font-medium text-gray-700">{confirmModal.userName}</span>?
                  They will have full access to the admin panel.
                </>
              )}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  confirmModal.currentAdminStatus
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {confirmModal.currentAdminStatus ? "Remove Admin" : "Make Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Sign In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600 uppercase">
                            {user.name?.[0] || user.email?.[0] || "?"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          {!user.hasProfile && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">
                              Auth only
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.provider === "google"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.provider === "google" ? "Google" : "Email"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isAdmin
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.isAdmin ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          User
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastSignIn
                      ? new Date(user.lastSignIn).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openConfirmModal(user.id, user.isAdmin || false)}
                      disabled={updatingId === user.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        user.isAdmin
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {updatingId === user.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Shield className="h-3 w-3" />
                      )}
                      {updatingId === user.id
                        ? "Updating..."
                        : user.isAdmin
                        ? "Remove Admin"
                        : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Users will appear here once they register."}
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.isAdmin).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Google Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.provider === "google").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
