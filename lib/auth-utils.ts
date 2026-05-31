import { supabase } from "./supabase";
import { getUserById } from "./supabase-services";

/**
 * Refresh current user data from Supabase
 * Useful after admin status changes
 */
export async function refreshUserData() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("No user is currently logged in");
  }

  try {
    const userData = await getUserById(user.id);
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
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  try {
    const userData = await getUserById(user.id);
    console.log("Current user admin status:", userData?.is_admin);
    return userData?.is_admin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
