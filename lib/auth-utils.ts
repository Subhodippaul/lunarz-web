import { AuthService } from "./firebase-services";
import { auth } from "./firebase";

/**
 * Refresh current user data from Firestore
 * Useful after admin status changes
 */
export async function refreshUserData() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No user is currently logged in");
  }

  try {
    const userData = await AuthService.getUserByUid(currentUser.uid);
    console.log("Refreshed user data:", userData);
    return userData;
  } catch (error) {
    console.error("Error refreshing user data:", error);
    throw error;
  }
}

/**
 * Check if current user is admin
 */
export async function checkAdminStatus() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return false;
  }

  try {
    const userData = await AuthService.getUserByUid(currentUser.uid);
    console.log("Current user admin status:", userData.isAdmin);
    return userData.isAdmin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}