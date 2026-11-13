export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-x-4 gap-y-2 px-4 pt-6 pb-28 font-mono text-[10px] sm:px-6 uppercase tracking-widest text-muted-foreground md:px-12">
      <span>© {new Date().getFullYear()} Kusuma Jaya</span>
      <span>Built by Kusuma.</span>
      <a href="#top" className="flex min-h-11 items-center">
        Back to top ↑
      </a>
    </footer>
  )
}
