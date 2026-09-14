import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import UserProfile from "./components/UserProfile";
import { SocketProvider } from "@/context/SocketContext";
import { CallProvider } from "@/context/CallContext";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/context/ThemeContext";
import CallModal from "@/components/CallModal";
import AppToaster from "@/components/ui/AppToaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChatVerse — Real-time Chat & Video Platform",
  description:
    "A modern real-time chat and video calling platform. Connect with friends instantly through text, voice, and video with end-to-end privacy.",
  keywords: "chat, messaging, video call, real-time, communication",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays available — capping it would fail WCAG 1.4.4.
  maximumScale: 5,
  viewportFit: "cover",
  // Matches the light/dark app background so the browser chrome blends in.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F8" },
    { media: "(prefers-color-scheme: dark)", color: "#141112" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Stamps the saved theme on <html> before first paint, so a dark-mode
            user never sees a white flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <AppToaster />
          <Providers>
            <SocketProvider>
              <CallProvider>
                {children}
                {/* Mounted globally so a call can ring in from any page */}
                <CallModal />
              </CallProvider>
            </SocketProvider>
            <UserProfile />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
