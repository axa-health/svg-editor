import type { CSSProperties, FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import React, { useCallback, useMemo } from 'react';
import DragIndicator from './drag-indicator';

type Props = {
  id: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  selected: boolean;
  onSelect: (e: ReactMouseEvent, id: string) => void;
  onDragIndicatorMouseDown: (e: ReactMouseEvent, id: string) => void;
  dragIndicatorStrokeWidth: number;
  onResizeHandleMouseDown: (
    e: ReactMouseEvent,
    id: string,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
  ) => void;
  canSelectDrawable: boolean;
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
  const strokeWidthHalf = useMemo(() => strokeWidth / 2, [strokeWidth]);

  const lowerX = useMemo(() => Math.min(x1, x2), [x1, x2]);
  const higherX = useMemo(() => Math.max(x1, x2), [x1, x2]);
  const lowerY = useMemo(() => Math.min(y1, y2), [y1, y2]);
  const higherY = useMemo(() => Math.max(y1, y2), [y1, y2]);
  const diX = useMemo(() => lowerX - strokeWidthHalf, [lowerX, strokeWidthHalf]);
  const diY = useMemo(() => lowerY - strokeWidthHalf, [lowerY, strokeWidthHalf]);
  const diWidth = useMemo(() => higherX - lowerX + strokeWidth, [higherX, lowerX, strokeWidth]);
  const diHeight = useMemo(() => higherY - lowerY + strokeWidth, [higherY, lowerY, strokeWidth]);

  const isDiHorizontalInverse = useMemo(() => lowerX !== x1, [lowerX, x1]);
  const diHorizontalInverse = useMemo(
    () => (isDiHorizontalInverse ? -1 : 1),
    [isDiHorizontalInverse],
  );

  const isDiVerticalInverse = useMemo(() => lowerY !== y1, [lowerY, y1]);
  const diVerticalInverse = useMemo(() => (isDiVerticalInverse ? -1 : 1), [isDiVerticalInverse]);
  const style: CSSProperties = useMemo(
    () => ({ cursor: canSelectDrawable ? 'pointer' : undefined }),
    [canSelectDrawable],
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
