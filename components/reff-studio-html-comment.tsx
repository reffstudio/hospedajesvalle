const REFF_STUDIO_HTML_COMMENT = `<!--
  ==============================================================
  R E F F   S T U D I O
  Worldwide Creativity
  ==============================================================
  Intentional Design  •  Functional Logic

  "Design. Code. Systems. One Studio. Globally."

  Web: https://reff.studio
  Contact: hello@reff.studio
  ==============================================================
-->`

export function ReffStudioHtmlComment() {
  return (
    <div
      hidden
      aria-hidden="true"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: REFF_STUDIO_HTML_COMMENT }}
    />
  )
}
