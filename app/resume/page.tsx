import { ArrowLeft, Download } from "lucide-react"
import type { Metadata } from "next"
import { ResumeSheet } from "@/components/resume/resume-sheet"
import { Button } from "@/components/ui/button"
import { resume } from "@/data/resume"

export const metadata: Metadata = {
  title: `${resume.name} · Résumé`,
  description: `${resume.role}. Experience, selected projects, technical skills, and education.`,
}

export default function ResumePage() {
  return (
    <main
      data-resume
      className="min-h-screen bg-brand-50 px-4 py-5 text-brand-900 sm:px-6 sm:py-8"
    >
      <nav
        aria-label="Resume actions"
        className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3"
      >
        <a href="/" className="inline-flex min-h-11 items-center gap-2 text-sm">
          <ArrowLeft size={16} />
          Back to profile
        </a>
        <Button asChild className="px-4">
          <a href="/resume/pdf" download="Kusuma-Jaya-Resume.pdf">
            Download PDF
            <Download size={16} />
          </a>
        </Button>
      </nav>
      <ResumeSheet />
      <p className="mx-auto mt-5 max-w-4xl text-center text-xs leading-relaxed text-brand-600">
        PDF generated from this résumé, with selectable text and embedded fonts.
      </p>
    </main>
  )
}
