import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LanguageProvider } from "@/hooks/use-language"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Horashtak",
    template: "%s | Horashtak",
  },
  description: "Find the current hora and daily planetary hour schedule. Secure APK distribution for approved users.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" >
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
