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
  
  // Check if current path is admin route or invoice-maker route
  const isAdminRoute = pathname?.startsWith('/admin');
  const isInvoiceMakerRoute = pathname === '/invoice-maker';

  if (isAdminRoute || isInvoiceMakerRoute) {
    // For admin and invoice-maker routes, render children without navbar, footer, and chat widget
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