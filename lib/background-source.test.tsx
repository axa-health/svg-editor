// @vitest-environment jsdom
import type * as PdfJs from 'pdfjs-dist';
import { createRoot } from 'react-dom/client';
import { expect, test } from 'vitest';
import BackgroundSource, { type RenderProps } from './background-source';

// Landscape 400x200 media box with /Rotate 90. Mirrors pdfjs: getViewport's rotation defaults
// to page.rotate, and 90/270 swap width and height, so every viewer shows this page portrait.
const rotatedPage = {
  rotate: 90,
  getViewport({ scale, rotation = 90 }: { scale: number; rotation?: number }) {
    const swap = rotation % 180 !== 0;
    return { width: (swap ? 200 : 400) * scale, height: (swap ? 400 : 200) * scale };
  },
  render: () => ({ promise: Promise.resolve() }),
};

const pdfjs = async () =>
  ({
    getDocument: () => ({ promise: Promise.resolve({ getPage: async () => rotatedPage }) }),
  }) as unknown as typeof PdfJs;

test('PDF page with /Rotate 90 loads in its declared (portrait) orientation', async () => {
  // jsdom has neither canvas nor object URLs
  Object.assign(HTMLCanvasElement.prototype, {
    getContext: () => ({}),
    toBlob: (cb: BlobCallback) => cb(new Blob()),
  });
  URL.createObjectURL = () => 'blob:fake';

  const loaded = new Promise<Extract<RenderProps, { state: 'LOADED' }>>((resolve, reject) => {
    createRoot(document.createElement('div')).render(
      <BackgroundSource source={new Blob(['%PDF-1.4'])} pdfjs={pdfjs}>
        {(s) => {
          if (s.state === 'LOADED') resolve(s);
          if (s.state === 'ERROR') reject(s.error);
          return null;
        }}
      </BackgroundSource>,
    );
  });

  const { width, height } = await loaded;
  expect(width).toBeLessThan(height);
});
