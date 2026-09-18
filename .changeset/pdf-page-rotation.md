---
'@axah/react-svg-editor': patch
---

Respect a PDF page's declared `/Rotate` when rendering the background. `BackgroundSource` no longer forces `rotation: 0`, so pages with `/Rotate 90` or `270` load upright like every other viewer instead of sideways.
