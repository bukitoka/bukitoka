"use client"

import { RotateCcw } from "lucide-react"
import { useEffect } from "react"
import { StatusPage } from "@/components/status-page"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <title>Something went wrong · Kusuma</title>
      <StatusPage
        code="500"
        title="That didn’t go to plan."
        description="Something stopped this page from loading. Try again, or head home for a fresh start."
        action={
          <Button onClick={() => retry()}>
            Try again <RotateCcw size={16} aria-hidden="true" />
          </Button>
        }
      />
    </>
  )
}
