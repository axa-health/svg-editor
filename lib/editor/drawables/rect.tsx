import type { CSSProperties, FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useMemo } from 'react';
import DragIndicator from './drag-indicator';
import type { DrawableResizableProps, RectDrawableShapeProps } from './types';

type Props = RectDrawableShapeProps & DrawableResizableProps;

const RectDrawable: FunctionComponent<Props> = ({
  id,
  onDragIndicatorMouseDown,
  onResizeHandleMouseDown,
  onSelect,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  selected,
  dragIndicatorStrokeWidth: diStrokeWidth,
  canSelectDrawable,
}) => {
  const handleClick = useCallback(
    (e: ReactMouseEvent) => {
      onSelect(e, id);
    },
    [id, onSelect],
  );

  const handleResizeHandleTopLeftMouseDown = useCallback(
    (e: ReactMouseEvent) => onResizeHandleMouseDown(e, id, 'left', 'top'),
    [id, onResizeHandleMouseDown],
  );

  const handleResizeHandleTopRightMouseDown = useCallback(
    (e: ReactMouseEvent) => onResizeHandleMouseDown(e, id, 'right', 'top'),
    [id, onResizeHandleMouseDown],
  );

  const handleResizeHandleBottomLeftMouseDown = useCallback(
    (e: ReactMouseEvent) => onResizeHandleMouseDown(e, id, 'left', 'bottom'),
    [id, onResizeHandleMouseDown],
  );

  const handleResizeHandleBottomRightMouseDown = useCallback(
    (e: ReactMouseEvent) => onResizeHandleMouseDown(e, id, 'right', 'bottom'),
    [id, onResizeHandleMouseDown],
  );

  const handleDragIndicatorMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      onDragIndicatorMouseDown(e, id);
    },
    [id, onDragIndicatorMouseDown],
  );

  const strokeWidthHalf = useMemo(() => strokeWidth / 2, [strokeWidth]);

  const diX = useMemo(() => x - strokeWidthHalf, [strokeWidthHalf, x]);
  const diY = useMemo(() => y - strokeWidthHalf, [strokeWidthHalf, y]);
  const diWidth = useMemo(() => width + strokeWidth, [strokeWidth, width]);
  const diHeight = useMemo(() => height + strokeWidth, [height, strokeWidth]);

  const style: CSSProperties = useMemo(
    () => ({ cursor: canSelectDrawable ? 'pointer' : undefined }),
    [canSelectDrawable],
  );
  return (
    <g data-id={id} onClick={handleClick} pointerEvents="bounding-box">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
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

export default RectDrawable;
