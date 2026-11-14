import localFont from "next/font/local"

export const fixel = localFont({
  src: [
    { path: "./fonts/FixelText-Regular.woff2", weight: "400" },
    { path: "./fonts/FixelText-Medium.woff2", weight: "500" },
    { path: "./fonts/FixelText-SemiBold.woff2", weight: "600" },
  ],
  variable: "--font-fixel",
  display: "swap",
})

export const display = localFont({
  src: "./fonts/FixelDisplay-Medium.woff2",
  variable: "--font-display",
  display: "swap",
})
