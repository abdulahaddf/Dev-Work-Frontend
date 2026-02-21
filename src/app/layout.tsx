import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevWork - Role-Based Project Marketplace",
  description: "A production-ready SaaS platform connecting Buyers with Solvers through strict workflow enforcement.",
  keywords: ["project marketplace", "freelance", "saas", "devwork"],
};

import { ChatProvider } from "@/providers/ChatProvider";
import { ChatNotificationPopup } from "@/components/chat/ChatNotificationPopup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Toaster 
          position="top-right"
          // ...
        />
        <ChatProvider>
          {children}
          <ChatNotificationPopup />
        </ChatProvider>
      </body>
    </html>
  );
}
