"use client";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ChatWidget from "@/components/chat-widget";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current path is admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // For admin routes, render children without navbar and footer
    return <>{children}</>;
  }

  // For non-admin routes, render with navbar, footer, and chat widget
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}