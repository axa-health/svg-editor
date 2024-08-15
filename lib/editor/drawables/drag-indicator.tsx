import type { CSSProperties, FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import React, { useCallback, useMemo } from 'react';

type Props = {
  id: string;
  onDragIndicatorMouseDown: (e: ReactMouseEvent<SVGRectElement>) => void;
  onResizeHandleTopLeftMouseDown?: (e: ReactMouseEvent<SVGCircleElement>) => void;
  onResizeHandleTopRightMouseDown?: (e: ReactMouseEvent<SVGCircleElement>) => void;
  onResizeHandleBottomLeftMouseDown?: (e: ReactMouseEvent<SVGCircleElement>) => void;
  onResizeHandleBottomRightMouseDown?: (e: ReactMouseEvent<SVGCircleElement>) => void;
  diX: number;
  diY: number;
  diWidth: number;
  diHeight: number;
  diStrokeWidth: number;
  selected: boolean;
  animation?: boolean;
  diLeft?: number;
  diRight?: number;
  diTop?: number;
  diBottom?: number;
  inverseCursorHorizontal?: boolean;
  inverseCursorVertical?: boolean;
};

function inverseDirection(
  inverseCursorHorizontal: boolean | undefined | null,
  inverseCursorVertical: boolean | undefined | null,
  direction: 'nw' | 'ne' | 'se' | 'sw',
): 'nw' | 'ne' | 'se' | 'sw' {
  let [v, h] = `${direction}`;

  if (inverseCursorVertical) {
    v = v === 'n' ? 's' : 'n';
  }

  if (inverseCursorHorizontal) {
    h = h === 'e' ? 'w' : 'e';
  }

  return `${v}${h}` as 'nw' | 'ne' | 'se' | 'sw';
}

const DragIndicator: FunctionComponent<Props> = ({
  id,
  onDragIndicatorMouseDown,
  onResizeHandleTopLeftMouseDown,
  onResizeHandleTopRightMouseDown,
  onResizeHandleBottomLeftMouseDown,
  onResizeHandleBottomRightMouseDown,
  diX,
  diY,
  diWidth,
  diHeight,
  diStrokeWidth,
  selected,
  inverseCursorHorizontal,
  inverseCursorVertical,
  animation = true,
  diRight,
  diTop,
  diLeft,
  diBottom,
}) => {
  const diStyles: CSSProperties = useMemo(
    () => ({
      fill: 'transparent',
      stroke: selected ? '#94a2a4' : 'none',
      strokeWidth: diStrokeWidth,
      strokeDasharray: `${diStrokeWidth * 2} ${diStrokeWidth}`,
      animation: animation ? 'dash 5s linear forwards infinite' : 'none',
      cursor: 'move',
    }),
    [animation, diStrokeWidth, selected],
  );

  const makeResizeHandleStyles = useCallback(
    (direction: 'nw' | 'ne' | 'se' | 'sw') => ({
      fill: selected ? '#343C3D' : 'none',
      stroke: 'none',
      cursor: `${inverseDirection(inverseCursorHorizontal, inverseCursorVertical, direction)}-resize`,
    }),
    [inverseCursorHorizontal, inverseCursorVertical, selected],
  );

  const diStrokeWidthHalf = useMemo(() => diStrokeWidth / 2, [diStrokeWidth]);

  const diTopToUse = useMemo(() => diTop || diY, [diStrokeWidthHalf, diTop, diY]);
  const diBottomToUse = useMemo(
    () => diBottom || diY + diHeight,
    [diBottom, diHeight, diStrokeWidthHalf, diY],
  );
  const diLeftToUse = useMemo(() => diLeft || diX, [diLeft, diStrokeWidthHalf, diX]);
  const diRightToUse = useMemo(
    () => diRight || diX + diWidth,
    [diRight, diStrokeWidthHalf, diWidth, diX],
  );

  return (
    <g>
      <rect
        style={diStyles}
        pointerEvents="bounding-box"
        x={diX}
        y={diY}
        width={diWidth}
        height={diHeight}
        strokeWidth={diStrokeWidth}
        onMouseDown={onDragIndicatorMouseDown}
      />
      {onResizeHandleTopLeftMouseDown && (
        <circle
          pointerEvents="bounding-box"
          style={makeResizeHandleStyles('nw')}
          cx={diLeftToUse}
          cy={diTopToUse}
          r={diStrokeWidth}
          onMouseDown={onResizeHandleTopLeftMouseDown}
          data-id={id}
        />
      )}
      {onResizeHandleTopRightMouseDown && (
        <circle
          pointerEvents="bounding-box"
          style={makeResizeHandleStyles('ne')}
          cx={diRightToUse}
          cy={diTopToUse}
          r={diStrokeWidth}
          onMouseDown={onResizeHandleTopRightMouseDown}
          data-id={id}
        />
      )}
      {onResizeHandleBottomLeftMouseDown && (
        <circle
          pointerEvents="bounding-box"
          style={makeResizeHandleStyles('sw')}
          cx={diLeftToUse}
          cy={diBottomToUse}
          r={diStrokeWidth}
          onMouseDown={onResizeHandleBottomLeftMouseDown}
          data-id={id}
        />
      )}
      {onResizeHandleBottomRightMouseDown && (
        <circle
          pointerEvents="bounding-box"
          style={makeResizeHandleStyles('se')}
          cx={diRightToUse}
          cy={diBottomToUse}
          r={diStrokeWidth}
          onMouseDown={onResizeHandleBottomRightMouseDown}
          data-id={id}
        />
      )}
    </g>
  );
};

export default DragIndicator;
