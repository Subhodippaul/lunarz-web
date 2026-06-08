import "./globals.css";
import { ReactNode } from "react";
import { Poppins } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { CouponProvider } from "@/lib/coupon-context";
import { ToastProvider } from "@/components/ui/toast";
import ConditionalLayout from "@/components/conditional-layout";
import { headers } from "next/headers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
    const host = headersList.get("host");
  
    const isComingSoon = host === "lunarz.in" || host === "www.lunarz.in";

  return (
    <html lang="en">
      <body className={`min-h-screen flex flex-col ${poppins.className}`}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <CouponProvider>
                {isComingSoon ? (
                  children
                ) : (
                  <ConditionalLayout>{children}</ConditionalLayout>
                )}
              </CouponProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}