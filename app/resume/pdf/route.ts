import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import { ResumeDocument } from "@/components/resume/resume-document"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const buffer = await renderToBuffer(createElement(ResumeDocument))

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Kusuma-Jaya-Resume.pdf"',
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Resume PDF generation failed", error)

    return Response.json(
      {
        error:
          "The PDF could not be generated. Please view the resume at /resume and try again.",
      },
      { status: 500 },
    )
  }
}
