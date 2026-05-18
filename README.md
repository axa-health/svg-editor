# @axah/react-svg-editor

A composable React SVG editor library. Supports drawing shapes, freehand paths, text, cropping, zooming, and dragging — all within a scalable SVG canvas backed by a PDF or image source.

## Installation

```bash
pnpm add @axah/react-svg-editor
# or
npm install @axah/react-svg-editor
```

**Peer dependencies** (install separately):

```bash
pnpm add react react-dom pdfjs-dist
```

---

## Quick Example

```tsx
import { useState } from 'react';
import {
  BackgroundSource,
  UncontrolledEditor,
  Artboard,
  Drawables,
  Cropables,
  translateDrawable,
  resizeDrawable,
} from '@axah/react-svg-editor';
import type { Drawable, Crop } from '@axah/react-svg-editor';

const pdfjs = async () => {
  const lib = await import('pdfjs-dist');
  lib.GlobalWorkerOptions.workerSrc = (
    await import('pdfjs-dist/build/pdf.worker?worker&url')
  ).default;
  return lib;
};

export default function App() {
  const [drawMode, setDrawMode] = useState<'rect' | 'pen' | 'ellipse' | 'line' | 'text' | 'crop' | null>(null);
  const [drawables, setDrawables] = useState<ReadonlyArray<Drawable>>([]);
  const [crop, setCrop] = useState<Crop | undefined>();

  return (
    <BackgroundSource source="/document.pdf" pdfjs={pdfjs} hqPdf>
      {(source) => {
        if (source.state !== 'LOADED') return <div>{source.state}</div>;

        return (
          <UncontrolledEditor
            allowDrag={drawMode === null}
            drawMode={drawMode}
            backgroundUrl={source.url}
            width={source.width}
            height={source.height}
            rotate={0}
          >
            <Artboard
              drawMode={drawMode}
              width={source.width}
              height={source.height}
              drawingFill="transparent"
              drawingStroke="#027180"
              drawingStrokeWidth={4}
              text={['Hello', 'World']}
              fontSize={16}
              minWidth={0}
              minHeight={0}
              onDrawStart={() => {}}
              onDrawEnd={(d) => setDrawables((prev) => [...prev, d])}
              onCropStart={() => {}}
              onCropEnd={setCrop}
            >
              <Drawables
                drawables={drawables}
                diStrokeWidth={3}
                width={source.width}
                height={source.height}
                onSelectDrawable={() => {}}
                onDrawableTranslate={(id, x, y) =>
                  setDrawables((prev) =>
                    prev.map((d) => (d.id === id ? translateDrawable(d, x, y) : d)),
                  )
                }
                onResizeDrawable={(_e, id, hX, hY, nX, nY) =>
                  setDrawables((prev) =>
                    prev.map((d) => (d.id === id ? resizeDrawable(d, hX, hY, nX, nY) : d)),
                  )
                }
              />
              <Cropables
                width={source.width}
                height={source.height}
                diStrokeWidth={3}
                crop={crop}
                canTransformCrop={drawMode === 'crop'}
                onCropTranslate={(x, y) =>
                  setCrop((c) => c && { ...c, x: c.x + x, y: c.y + y })
                }
                onResizeCrop={(hX, hY, nX, nY) => {
                  /* resize crop logic */
                }}
                onRemoveCrop={() => setCrop(undefined)}
                onConfirmCrop={() => setDrawMode(null)}
              />
            </Artboard>
          </UncontrolledEditor>
        );
      }}
    </BackgroundSource>
  );
}
```

---

## Key Concepts

| Component | Purpose |
|---|---|
| `BackgroundSource` | Loads a PDF or image URL and provides dimensions + blob URL |
| `Editor` | Controlled SVG canvas with zoom, pan, rotation |
| `UncontrolledEditor` | Wrapper around `Editor` that manages zoom/translate state internally |
| `Artboard` | Routes draw events to the active draw mode (`rect`, `ellipse`, `line`, `pen`, `text`, `crop`) |
| `Drawables` | Renders all drawn shapes with selection and resize handles |
| `Cropables` | Renders and manages the crop region overlay |
| `translateDrawable` | Pure helper to translate a drawable by `(x, y)` |
| `resizeDrawable` | Pure helper to resize a drawable via a handle corner |

---

## Development

```bash
# install dependencies
pnpm install

# start the dev preview app
pnpm start

# type-check
pnpm lint

# build the library
pnpm build

# check package exports compatibility
pnpm check:types
```

The preview app lives in `src/App.tsx` and loads a local PDF from `public/pdf-test.pdf`.

The library source is in `lib/`.

---

## Release

Releases are managed via [Changesets](https://github.com/changesets/changesets).

```bash
# create a changeset
pnpm changeset

# publish (runs lint + type checks + build first)
pnpm release
```
