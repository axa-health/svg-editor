import type { FunctionComponent, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { FileTypeResult } from 'file-type';
import { fromBlob } from 'file-type/browser';
import type * as PdfJs from 'pdfjs-dist';

type Source = string | Blob | URL;

export type RenderProps =
  | {
      state: 'LOADING';
    }
  | {
      state: 'ERROR';
      error: {
        code: string;
        details?: Error;
      };
    }
  | {
      state: 'LOADED';
      url: string;
      width: number;
      height: number;
    };

export type RenderPropFunc = (source: RenderProps) => ReactNode;

type Props = {
  source: Source;
  hqPdf?: boolean;
  children: RenderPropFunc;
  fetcher?: (url: string) => Promise<Blob>;
  pdfjs: () => Promise<typeof PdfJs>;
};

const toBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    });
  });

const defaultFetcher = async (url: string): Promise<Blob> => {
  let res = await fetch(url);
  return res.blob();
};

const BackgroundSource: FunctionComponent<Props> = ({
  fetcher = defaultFetcher,
  source,
  pdfjs,
  hqPdf,
  children,
}) => {
  const [sourceState, setSourceState] = useState<RenderProps>({ state: 'LOADING' });

  const pdfToPng = useCallback(
    async (blob: Blob, zoom: number) => {
      if (!pdfjs) {
        throw new Error('Missing pdfjs prop in BackgroundSource');
      }

      const pdfjsToUse = await pdfjs();
      const pdfDocumentProxy = await pdfjsToUse.getDocument(URL.createObjectURL(blob)).promise;
      const pdfPageProxy = await pdfDocumentProxy.getPage(1);
      const viewport = pdfPageProxy.getViewport({ scale: zoom, rotation: 0 });
      const canvas = document.createElement('canvas');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Missing CanvasContext 2d');
      }

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      await pdfPageProxy.render(renderContext).promise;

      const height = viewport.height / zoom;
      const width = viewport.width / zoom;

      if (typeof canvas.toBlob === 'function') {
        const blobToUse = await toBlob(canvas);
        const png = (URL || window.webkitURL).createObjectURL(blobToUse);

        return { png, width, height };
      }

      return {
        png: canvas.toDataURL(),
        width,
        height,
      };
    },
    [pdfjs],
  );

  const updateSource = useCallback(
    async (sourceToUse: Source, initialSource: Source) => {
      if (typeof window !== 'undefined' && sourceToUse instanceof window.URL) {
        await updateSource(sourceToUse, initialSource);
      }

      if (typeof sourceToUse === 'string') {
        setSourceState({ state: 'LOADING' });
        try {
          const blob = await fetcher(sourceToUse);
          if (source !== initialSource) {
            return;
          }

          await updateSource(blob, initialSource);
        } catch (e) {
          setSourceState({
            state: 'ERROR',
            error: { code: 'FETCHER_THREW_ERROR', details: e as Error },
          });
        }
      }

      if (sourceToUse instanceof Blob) {
        setSourceState({ state: 'LOADING' });
        let fileType: FileTypeResult | undefined;
        try {
          fileType = await fromBlob(sourceToUse);
        } catch (e) {
          setSourceState({
            state: 'ERROR',
            error: { code: 'DETERMINE_FILE_TYPE_FAILED', details: e as Error },
          });
        }

        if (source !== initialSource) {
          return;
        }

        if (!fileType) {
          setSourceState({ state: 'ERROR', error: { code: 'UNKNOWN_FILE_TYPE' } });
          return;
        }

        if (fileType.mime === 'application/pdf') {
          try {
            const imageToUse = await pdfToPng(sourceToUse, 1);

            if (source !== initialSource) {
              return;
            }

            setSourceState({
              state: 'LOADED',
              url: imageToUse.png,
              width: imageToUse.width,
              height: imageToUse.height,
            });
          } catch (e) {
            if (source !== initialSource) {
              return;
            }
            setSourceState({
              state: 'ERROR',
              error: { code: 'PDF_TO_PNG_FAILED', details: e as Error },
            });
          }

          if (hqPdf) {
            try {
              const hqImageToUse = await pdfToPng(sourceToUse, 5);

              if (source !== initialSource) {
                return;
              }

              setSourceState({
                state: 'LOADED',
                url: hqImageToUse.png,
                width: hqImageToUse.width,
                height: hqImageToUse.height,
              });
            } catch (e) {
              console.error('Failed to render PDF in higher quality', e);
            }
          }
        } else {
          try {
            const url = (URL || window.webkitURL).createObjectURL(sourceToUse);

            const img = document.createElement('img');
            const imageElementPromise = new Promise<HTMLImageElement>((res, rej) => {
              img.onload = () => {
                res(img);
              };
              img.onerror = rej;
            });
            img.src = url;

            const { height, width } = await imageElementPromise;

            if (source !== initialSource) {
              return;
            }

            setSourceState({
              state: 'LOADED',
              url,
              width,
              height,
            });
          } catch (e) {
            if (source !== initialSource) {
              return;
            }
            console.error(e);
            setSourceState({
              state: 'ERROR',
              error: { code: 'DETERMINE_IMG_DIMENSIONS_FAILED', details: e as Error },
            });
          }
        }
      }
    },
    [fetcher, hqPdf, pdfToPng, source],
  );

  useEffect(() => {
    updateSource(source, source);
  }, [source, updateSource]);

  return children(sourceState);
};

export default BackgroundSource;
