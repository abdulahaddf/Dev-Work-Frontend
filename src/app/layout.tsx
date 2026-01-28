import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevWork - Role-Based Project Marketplace",
  description: "A production-ready SaaS platform connecting Buyers with Solvers through strict workflow enforcement.",
  keywords: ["project marketplace", "freelance", "saas", "devwork"],
};

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
          toastOptions={{
            duration: 4000, 
            success: {
              duration: 3000, 
            },
            error: {
              duration: 5000, 
            },
            style: {
              background: '#0F172A',
              color: '#E5E7EB',
              border: '1px solid #1E293B',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
