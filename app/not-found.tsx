import type { Metadata } from "next"
import { StatusPage } from "@/components/status-page"

export const metadata: Metadata = {
  title: "Page not found · Kusuma",
}

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="This page took a detour."
      description="There’s no page at this address. Head home or take a look at what I’ve been building."
    />
  )
}
