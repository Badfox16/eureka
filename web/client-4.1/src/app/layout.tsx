import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { QuizProvider } from "@/contexts/QuizContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eureka - Plataforma Estudantil",
  description: "Democratizando o acesso ao conhecimento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <NotificationsProvider>
                <QuizProvider>
                  <main className="flex-1 flex flex-col">
                    {children}
                  </main>
                </QuizProvider>
              </NotificationsProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
