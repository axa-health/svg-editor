import type {
  FunctionComponent,
  MouseEvent as ReactMouseEvent,
  PropsWithChildren,
  WheelEvent,
} from 'react';
import { useEffect } from 'react';
import React, { createContext, useCallback, useMemo, useRef, useState } from 'react';

type Crop = {
  x: number;
  y: number;
  height: number;
  width: number;
};

export type Props = PropsWithChildren<{
  backgroundUrl: string;
  width: number;
  height: number;
  crop?: Crop;
  zoom: number;
  translateX: number;
  translateY: number;
  rotate: 0 | 90 | 180 | 270;
  onZoom: (newZoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  allowDrag: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrag: (x: number, y: number) => void;
  canvasStyle?: any;
  canvasClassName?: string;
  drawMode?: string | null;
  heightRatio?: number;
}>;

export const PixelRatioContext = createContext(1);

const Editor: FunctionComponent<Props> = ({
  heightRatio = 1,
  height,
  canvasClassName,
  canvasStyle,
  crop,
  drawMode,
  allowDrag,
  onDrag,
  onDragEnd,
  onDragStart,
  minZoom,
  onZoom,
  maxZoom,
  zoom,
  translateX,
  translateY,
  rotate,
  width,
  backgroundUrl,
  children,
}) => {
  const referenceRectZoom = useRef<SVGImageElement>(null);
  const referenceRectNoZoom = useRef<SVGRectElement>(null);
  const [heightRatioToUse, setHeightRatioToUse] = useState<number>(heightRatio);

  const zoomTranslate = useMemo(() => {
    const matrix = [zoom, 0, 0, zoom, translateX, translateY];

    if (rotate === 0) {
      matrix[4] -= (width / 2) * (zoom - 1);
      matrix[5] -= (height / 2) * (zoom - 1);
    } else if (rotate === 90) {
      // 1 0 0 1 x y -> 0 1 -1 0 x y
      matrix[1] = matrix[0]; // eslint-disable-line prefer-destructuring
      matrix[0] = 0;
      matrix[2] = -matrix[3];
      matrix[3] = 0;

      matrix[4] += height + (height / 2) * (zoom - 1);
      matrix[5] -= (width / 2) * (zoom - 1);
    } else if (rotate === 180) {
      // 1 0 0 1 x y -> -1 0 0 -1 x y
      matrix[0] *= -1;
      matrix[3] *= -1;

      matrix[4] += width + (width / 2) * (zoom - 1);
      matrix[5] += height + (height / 2) * (zoom - 1);
    } else if (rotate === 270) {
      // 1 0 0 1 x y -> 0 -1 1 0 x y
      matrix[1] = -matrix[0];
      matrix[0] = 0;
      matrix[2] = matrix[3]; // eslint-disable-line prefer-destructuring
      matrix[3] = 0;

      matrix[4] -= (height / 2) * (zoom - 1);
      matrix[5] += width + (width / 2) * (zoom - 1);
    }

    return `matrix(${matrix[0]}, ${matrix[1]}, ${matrix[2]}, ${matrix[3]}, ${matrix[4]}, ${matrix[5]})`;
  }, [height, rotate, translateX, translateY, width, zoom]);

  const recalcPixelRatio = useCallback(() => {
    if (!referenceRectZoom.current) {
      console.log("Missing referenceRectZoom, can't calc pixelRatio..."); // eslint-disable-line no-console
      return;
    }
    setHeightRatioToUse(height / referenceRectZoom.current.getBoundingClientRect().height);
  }, [height]);

  const svgMouseDownHandler = useCallback(
    (e: ReactMouseEvent<SVGElement>) => {
      if (allowDrag) {
        if (!referenceRectNoZoom.current) {
          console.error('ReferenceRectNoZoom not available!'); // eslint-disable-line no-console
          return;
        }

        const svg = referenceRectNoZoom.current.closest('svg');

        if (!svg) {
          console.error('svg not found'); // eslint-disable-line no-console
          return;
        }

        const inverseMatrix = referenceRectNoZoom.current.getScreenCTM()?.inverse();
        const transformPoint = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
          let pt = svg.createSVGPoint();
          pt.x = clientX;
          pt.y = clientY;
          pt = pt.matrixTransform(inverseMatrix);

          return { x: pt.x, y: pt.y };
        };

        e.preventDefault();
        e.stopPropagation();

        if (onDragStart) {
          onDragStart();
        }

        let lastCoords = transformPoint(e);

        const mouseMoveHandler = (e2: MouseEvent) => {
          const newCoords = transformPoint(e2);
          onDrag(translateX + newCoords.x - lastCoords.x, translateY + newCoords.y - lastCoords.y);
        };

        const mouseUpHandler = () => {
          window.removeEventListener('mousemove', mouseMoveHandler);
          window.removeEventListener('mouseup', mouseUpHandler);

          if (onDragEnd) {
            onDragEnd();
          }
        };

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
      }
    },
    [allowDrag, onDrag, onDragEnd, onDragStart, translateX, translateY],
  );

  const handleWheel = useCallback(
    (e: WheelEvent<SVGElement>) => {
      e.preventDefault();

      const newZoom = Math.min(maxZoom || 4, Math.max(minZoom || 1, zoom - e.deltaY / 100));

      onZoom(newZoom);
    },
    [maxZoom, minZoom, zoom, onZoom],
  );

  const canvasStyleToUse = useMemo(
    () => ({
      cursor: allowDrag ? 'move' : null,
      ...canvasStyle,
    }),
    [allowDrag, canvasStyle],
  );

  const { widthToUse, heightToUse } = useMemo(() => {
    if (rotate === 90 || rotate === 270) {
      return { heightToUse: width, widthToUse: height };
    }
    return { heightToUse: height, widthToUse: width };
  }, [height, rotate, width]);

  const { vHeight, vWidth, vX, vY } = useMemo(() => {
    if (crop && drawMode !== 'crop') {
      const { height: cropHeight, width: cropWidth, x, y } = crop;

      return {
        vHeight: cropHeight,
        vWidth: cropWidth,
        vX: x,
        vY: y,
      };
    }
    return { vHeight: heightToUse, vWidth: widthToUse, vX: 0, vY: 0 };
  }, [crop, drawMode, heightToUse, widthToUse]);

  useEffect(() => {
    window.addEventListener('resize', recalcPixelRatio);
    recalcPixelRatio();
    return () => {
      window.removeEventListener('resize', recalcPixelRatio);
    };
  }, [recalcPixelRatio]);

  return (
    <svg
      viewBox={`${vX} ${vY} ${vWidth} ${vHeight}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      onMouseDown={svgMouseDownHandler}
      onWheel={handleWheel}
      style={canvasStyleToUse}
      className={canvasClassName}
    >
      <style>
        {`
            @keyframes dash {
              to {
                stroke-dashoffset: 100;
              }
            }
          `}
      </style>
      {/* invisible rect to determine actual width/height and convert
          stuff to viewBox coordinates */}
      <rect
        x={`${vX}`}
        y={`${vY}`}
        width={`${vWidth}`}
        height={`${vHeight}`}
        ref={referenceRectNoZoom}
        fill="none"
      />
      {/* the zoomable part of the svg */}
      <g transform={zoomTranslate}>
        <image
          xlinkHref={backgroundUrl}
          x="0"
          y="0"
          height={`${height}`}
          width={`${width}`}
          ref={referenceRectZoom}
        />
        <PixelRatioContext.Provider value={heightRatioToUse / zoom}>
          {children}
        </PixelRatioContext.Provider>
      </g>
    </svg>
  );
};

export default Editor;
