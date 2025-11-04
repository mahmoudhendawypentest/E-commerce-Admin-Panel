import type { Metadata } from "next";
import "./globals.css";
import RootLayoutClient from "./layout-client";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "E-commerce Admin Panel",
  description: "Admin dashboard for managing e-commerce store",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body className="antialiased h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
