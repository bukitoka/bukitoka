# PDF fonts

Fixel WOFF files are converted copies of the existing Fixel WOFF2 assets in `app/fonts/`, using fontTools. JetBrains Mono is the Latin regular WOFF from the installed `@fontsource/jetbrains-mono` package.

These files are embedded in generated PDFs and included in the `/resume/pdf` deployment trace. PDF rendering does not fetch fonts from the network.
