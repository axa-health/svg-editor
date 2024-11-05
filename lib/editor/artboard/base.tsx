import type {
  CSSProperties,
  FunctionComponent,
  MouseEvent as ReactMouseEvent,
  PropsWithChildren,
} from 'react';
import { useCallback } from 'react';
import React from 'react';

type Coords = { x: number; y: number };

type Props = PropsWithChildren<{
  width: number;
  height: number;
  onMouseDown: ({ start }: { start: Coords }, event: ReactMouseEvent) => void;
  onMouseMove: ({ start, current }: { start: Coords; current: Coords }, event: MouseEvent) => void;
  onMouseUp: ({ start, current }: { start: Coords; current: Coords }, event: MouseEvent) => void;
}>;

const style: CSSProperties = { cursor: 'crosshair' };

const ArtboardBase: FunctionComponent<Props> = ({
  width,
  height,
  children,
  onMouseUp,
  onMouseDown,
  onMouseMove,
}) => {
  const handleArtboardMouseDown = useCallback(
    (e: ReactMouseEvent<SVGRectElement>) => {
      const artboard = e.currentTarget;

      const svg = artboard.closest('svg');

      if (!svg) {
        console.error('svg not found'); // eslint-disable-line no-console
        return;
      }
      const inverseMatrix = artboard.getScreenCTM()?.inverse();

      e.stopPropagation();

      const transformPoint = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
        let pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        pt = pt.matrixTransform(inverseMatrix);

        return { x: pt.x, y: pt.y };
      };

      const start = transformPoint(e);
      onMouseDown({ start }, e);

      const mouseMoveHandler = (e2: MouseEvent) => {
        onMouseMove({ start, current: transformPoint(e2) }, e2);
      };

      const mouseUpHandler = (e2: MouseEvent) => {
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', mouseUpHandler);

        onMouseUp({ start, current: transformPoint(e2) }, e2);
      };

      window.addEventListener('mousemove', mouseMoveHandler);
      window.addEventListener('mouseup', mouseUpHandler);
    },
    [onMouseDown, onMouseMove, onMouseUp],
  );

  return (
    <g>
      <rect
        style={style}
        onMouseDown={handleArtboardMouseDown}
        pointerEvents="bounding-box"
        key="artboard"
        fill="none"
        x="0"
        y="0"
        width={`${width}`}
        height={`${height}`}
      />
      {children}
    </g>
  );
};

export default ArtboardBase;
