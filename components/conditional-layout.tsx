"use client";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  const isAdminRoute = pathname?.startsWith('/admin');
  const isInvoiceMakerRoute = pathname === '/invoice-maker';
  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

  if (isAdminRoute || isInvoiceMakerRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1" key={pathname}>{children}</main>
      <Footer />
    </>
  );
}