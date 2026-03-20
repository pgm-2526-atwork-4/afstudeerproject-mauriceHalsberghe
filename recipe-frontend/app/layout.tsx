import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mealio",
  description: "Browse recipes based on your ingredients!",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mealio" />
      </head>

      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
