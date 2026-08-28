import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import UserProfile from "./components/UserProfile";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ChatVerse — Real-time Chat & Video Platform",
  description:
    "A modern real-time chat and video calling platform. Connect with friends instantly through text, voice, and video with end-to-end privacy.",
  keywords: "chat, messaging, video call, real-time, communication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1c28',
              color: '#f0f0f5',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: "'Inter', system-ui, sans-serif",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f0f0f5',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f0f0f5',
              },
            },
          }}
        />
        <Providers>
          <SocketProvider>
            {children}
          </SocketProvider>
          <UserProfile />
        </Providers>
      </body>
    </html>
  );
}
