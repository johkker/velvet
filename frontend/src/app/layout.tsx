import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LocationProvider } from "@/lib/location-context";
import { ToastProvider } from "@/lib/toast-context";
import { LocationPermissionModal } from "@/components/organisms/LocationPermissionModal";
import Header from "@/components/organisms/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velvet — Exclusive Connections",
  description: "Exclusive connections for exclusive moments. Discover verified talents for dinner, travel, events, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        <AuthProvider>
          <LocationProvider>
            <ToastProvider>
              <Header />
              {children}
              <LocationPermissionModal />
            </ToastProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
