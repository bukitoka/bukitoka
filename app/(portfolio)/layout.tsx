import type { ReactNode } from "react"
import { GridBackground } from "@/components/grid-background"
import { WhatsAppLink } from "@/components/whatsapp-link"

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GridBackground />
      {children}
      <WhatsAppLink />
    </>
  )
}
