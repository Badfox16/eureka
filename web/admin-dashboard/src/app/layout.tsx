import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import { cn } from "@/lib/utils"
import { AppProviders } from "@/providers/app-providers"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Eureka - Dashboard Administrativo",
  description: "Dashboard administrativo para o sistema Eureka",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" suppressHydrationWarning className="h-screen overflow-hidden">
      <body className={cn(
        "h-screen overflow-hidden bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}