// © 2025 Mohammed DAOUDI - My Tooth. All rights reserved.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { SocketProvider } from "@/components/SocketProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/GlobalErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "🦷 My Tooth - Professional Dental Care",
  description: "Modern dental clinic offering professional, compassionate dental care with state-of-the-art technology and experienced dentists.",
  keywords: "dental clinic, dentist, teeth cleaning, dental implants, orthodontics, dental care",
  authors: [{ name: "My Tooth Dental Clinic" }],
  openGraph: {
    title: "🦷 My Tooth - Professional Dental Care",
    description: "Modern dental clinic offering professional, compassionate dental care",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary level="global">
            <AuthProvider>
              <SocketProvider>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
              </SocketProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
