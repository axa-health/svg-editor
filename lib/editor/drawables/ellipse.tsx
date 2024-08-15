import type { CSSProperties, FunctionComponent, MouseEvent } from 'react';
import React, { useCallback, useMemo } from 'react';
import DragIndicator from './drag-indicator';

type Props = {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  selected: boolean;
  onSelect: (e: MouseEvent, id: string) => void;
  onDragIndicatorMouseDown: (e: MouseEvent, id: string) => void;
  dragIndicatorStrokeWidth: number;
  onResizeHandleMouseDown: (
    e: MouseEvent,
    id: string,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
  ) => void;
  canSelectDrawable: boolean;
};

const EllipseDrawable: FunctionComponent<Props> = ({
  id,
  cx,
  cy,
  rx,
  ry,
  fill,
  stroke,
  strokeWidth,
  selected,
  dragIndicatorStrokeWidth: diStrokeWidth,
  canSelectDrawable,
  onResizeHandleMouseDown,
  onDragIndicatorMouseDown,
  onSelect,
}) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      onSelect(e, id);
    },
    [id, onSelect],
  );

  const handleResizeHandleTopLeftMouseDown = useCallback(
    (e: MouseEvent) => onResizeHandleMouseDown(e, id, 'left', 'top'),
    [id, onResizeHandleMouseDown],
  );

  const handleResizeHandleTopRightMouseDown = useCallback(
    (e: MouseEvent) => onResizeHandleMouseDown(e, id, 'right', 'top'),
    [id, onResizeHandleMouseDown],
  );

  const handleResizeHandleBottomLeftMouseDown = useCallback(
    (e: MouseEvent) => onResizeHandleMouseDown(e, id, 'left', 'bottom'),
    [id, onResizeHandleMouseDown],
  );

  const handleResizeHandleBottomRightMouseDown = useCallback(
    (e: MouseEvent) => onResizeHandleMouseDown(e, id, 'right', 'bottom'),
    [id, onResizeHandleMouseDown],
  );

  const handleDragIndicatorMouseDown = useCallback(
    (e: MouseEvent) => onDragIndicatorMouseDown(e, id),
    [],
  );

  const strokeWidthHalf = useMemo(() => strokeWidth / 2, [strokeWidth]);

  const diX = useMemo(() => cx - rx - strokeWidthHalf, [cx, rx, strokeWidthHalf]);
  const diY = useMemo(() => cy - ry - strokeWidthHalf, [cy, ry, strokeWidthHalf]);
  const diWidth = useMemo(() => rx * 2 + strokeWidth, [rx, strokeWidth]);
  const diHeight = useMemo(() => ry * 2 + strokeWidth, [ry, strokeWidth]);

  const style: CSSProperties = useMemo(
    () => ({ cursor: canSelectDrawable ? 'pointer' : undefined }),
    [canSelectDrawable],
  );

  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        pointerEvents="visible"
        onClick={handleClick}
        style={style}
      />
      {selected && (
        <DragIndicator
          id={id}
          onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
          onResizeHandleTopLeftMouseDown={handleResizeHandleTopLeftMouseDown}
          onResizeHandleTopRightMouseDown={handleResizeHandleTopRightMouseDown}
          onResizeHandleBottomLeftMouseDown={handleResizeHandleBottomLeftMouseDown}
          onResizeHandleBottomRightMouseDown={handleResizeHandleBottomRightMouseDown}
          diX={diX}
          diY={diY}
          diWidth={diWidth}
          diHeight={diHeight}
          diStrokeWidth={diStrokeWidth}
          selected={selected}
        />
      )}
    </g>
  );
};

export default EllipseDrawable;
