import type { Metadata } from "next"
import localFont from "next/font/local"
import { Providers } from "@/components/theme-picker"
import "@fontsource/jetbrains-mono/400.css"
import "@fontsource/jetbrains-mono/500.css"
import "./globals.css"

const fixel = localFont({
  src: [
    { path: "./fonts/FixelText-Regular.woff2", weight: "400" },
    { path: "./fonts/FixelText-Medium.woff2", weight: "500" },
    { path: "./fonts/FixelText-SemiBold.woff2", weight: "600" },
  ],
  variable: "--font-fixel",
  display: "swap",
})

const display = localFont({
  src: "./fonts/FixelDisplay-Medium.woff2",
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: "Kusuma Jaya · Full-stack Software Engineer",
  description:
    "Customer systems, warehouse software, WineAdore, and AutoCRM. The work and story of software engineer I Ketut Kusumajaya.",
  openGraph: {
    title: "Kusuma Jaya · Software Engineer",
    description:
      "From customer records on paper to warehouse systems, a wine marketplace, and sales automation.",
    images: [
      {
        url: "/portrait.jpeg",
        width: 362,
        height: 429,
        alt: "I Ketut Kusumajaya",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fixel.variable} ${display.variable} dark`}
      suppressHydrationWarning
    >
      <body className="relative isolate">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
