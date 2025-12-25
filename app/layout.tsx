import "./globals.css";
import { ReactNode } from "react";
import { Poppins } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { CouponProvider } from "@/lib/coupon-context";
import { ToastProvider } from "@/components/ui/toast";
import ConditionalLayout from "@/components/conditional-layout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen flex flex-col ${poppins.className}`}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <CouponProvider>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
              </CouponProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
