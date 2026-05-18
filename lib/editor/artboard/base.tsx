import type {
  CSSProperties,
  FunctionComponent,
  PropsWithChildren,
  MouseEvent as ReactMouseEvent,
} from 'react';
import { useCallback, useMemo, useState } from 'react';
import { createSvgPointTransformer } from '../utils';
import type { DragCurrent, DragStart } from './types';

type Props = PropsWithChildren<{
  width: number;
  height: number;
  onMouseDown: (payload: DragStart, event: ReactMouseEvent) => void;
  onMouseMove: (payload: DragCurrent, event: MouseEvent) => void;
  onMouseUp: (payload: DragCurrent, event: MouseEvent) => void;
}>;

const baseStyle: CSSProperties = {
  cursor: 'crosshair',
  transition: 'fill 180ms ease, stroke 180ms ease, stroke-width 180ms ease',
};

const ArtboardBase: FunctionComponent<Props> = ({
  width,
  height,
  children,
  onMouseUp,
  onMouseDown,
  onMouseMove,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const style = useMemo<CSSProperties>(
    () => ({
      ...baseStyle,
      cursor: isDrawing ? 'grabbing' : 'crosshair',
      fill: isDrawing
        ? 'rgba(100, 116, 139, 0.035)'
        : isHovered
          ? 'rgba(148, 163, 184, 0.03)'
          : 'transparent',
      stroke: isDrawing ? '#64748b' : isHovered ? '#94a3b8' : 'transparent',
      strokeWidth: isDrawing ? 1 : 0.75,
      strokeDasharray: isDrawing ? '2.5 6' : undefined,
    }),
    [isDrawing, isHovered],
  );

  const handleArtboardMouseDown = useCallback(
    (e: ReactMouseEvent<SVGRectElement>) => {
      const artboard = e.currentTarget;

      const transformPoint = createSvgPointTransformer(artboard);

      if (!transformPoint) {
        return;
      }

      e.stopPropagation();

      setIsDrawing(true);

      const start = transformPoint(e);
      onMouseDown({ start }, e);

      const mouseMoveHandler = (e2: MouseEvent) => {
        onMouseMove({ start, current: transformPoint(e2) }, e2);
      };

      const mouseUpHandler = (e2: MouseEvent) => {
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', mouseUpHandler);

        setIsDrawing(false);

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
