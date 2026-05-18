import type { CSSProperties, FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useMemo } from 'react';
import DragIndicator from './drag-indicator';
import type { DrawableResizableProps, LineDrawableShapeProps } from './types';

type Props = LineDrawableShapeProps & DrawableResizableProps;

const BASE_INTERACTIVE_STYLE: CSSProperties = {
  transition: 'opacity 180ms ease, filter 180ms ease',
  vectorEffect: 'non-scaling-stroke',
};

const LineDrawable: FunctionComponent<Props> = ({
  onSelect,
  id,
  onResizeHandleMouseDown,
  onDragIndicatorMouseDown,
  x1,
  x2,
  y1,
  y2,
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
    [onSelect, id],
  );

  const handleResizeHandleTopLeftMouseDown = useCallback(
    (e: ReactMouseEvent) => onResizeHandleMouseDown(e, id, 'left', 'top'),
    [id, onResizeHandleMouseDown],
  );

  const handleResizeHandleBottomRightMouseDown = useCallback(
    (e: ReactMouseEvent) => onResizeHandleMouseDown(e, id, 'right', 'bottom'),
    [id, onResizeHandleMouseDown],
  );

  const handleDragIndicatorMouseDown = useCallback(
    (e: ReactMouseEvent) => onDragIndicatorMouseDown(e, id),
    [id, onDragIndicatorMouseDown],
  );
  const strokeWidthHalf = strokeWidth / 2;

  const lowerX = Math.min(x1, x2);
  const higherX = Math.max(x1, x2);
  const lowerY = Math.min(y1, y2);
  const higherY = Math.max(y1, y2);

  const diX = lowerX - strokeWidthHalf;
  const diY = lowerY - strokeWidthHalf;
  const diWidth = higherX - lowerX + strokeWidth;
  const diHeight = higherY - lowerY + strokeWidth;

  const isDiHorizontalInverse = lowerX !== x1;
  const diHorizontalInverse = isDiHorizontalInverse ? -1 : 1;

  const isDiVerticalInverse = lowerY !== y1;
  const diVerticalInverse = isDiVerticalInverse ? -1 : 1;

  const style: CSSProperties = useMemo(
    () => ({
      ...BASE_INTERACTIVE_STYLE,
      cursor: canSelectDrawable ? 'pointer' : 'default',
      opacity: selected ? 0.97 : 0.9,
      filter: selected ? 'drop-shadow(0 0 2px rgba(100, 116, 139, 0.16))' : 'none',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
    [canSelectDrawable, selected],
  );

  return (
    <g>
      <line
        x1={x1}
        x2={x2}
        y1={y1}
        y2={y2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        onClick={handleClick}
        pointerEvents="visible-painted"
        style={style}
      />
      {selected && (
        <DragIndicator
          id={id}
          onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
          onResizeHandleTopLeftMouseDown={handleResizeHandleTopLeftMouseDown}
          onResizeHandleBottomRightMouseDown={handleResizeHandleBottomRightMouseDown}
          diX={diX}
          diY={diY}
          diWidth={diWidth}
          diHeight={diHeight}
          diStrokeWidth={diStrokeWidth}
          selected={selected}
          diLeft={x1 - strokeWidthHalf * diHorizontalInverse}
          diRight={x2 + strokeWidthHalf * diHorizontalInverse}
          diTop={y1 - strokeWidthHalf * diVerticalInverse}
          diBottom={y2 + strokeWidthHalf * diVerticalInverse}
          inverseCursorHorizontal={isDiHorizontalInverse}
          inverseCursorVertical={isDiVerticalInverse}
        />
      )}
    </g>
  );
};

export default LineDrawable;
