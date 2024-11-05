import type { CSSProperties, FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import React, { useCallback, useMemo } from 'react';
import DragIndicator from './drag-indicator';

type Props = {
  id: string;
  points: ReadonlyArray<{ x: number; y: number }>;
  stroke: string;
  strokeWidth: number;
  selected: boolean;
  onSelect: (e: ReactMouseEvent, id: string) => void;
  onDragIndicatorMouseDown: (e: ReactMouseEvent, id: string) => void;
  dragIndicatorStrokeWidth: number;
  canSelectDrawable: boolean;
};

const PathDrawable: FunctionComponent<Props> = ({
  onSelect,
  id,
  onDragIndicatorMouseDown,
  points,
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

  const handleDragIndicatorMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      onDragIndicatorMouseDown(e, id);
    },
    [onDragIndicatorMouseDown, id],
  );

  const strokeWidthHalf = useMemo(() => strokeWidth / 2, [strokeWidth]);

  const lowestX = useMemo(
    () => points.reduce((accum, p) => Math.min(p.x, accum), Number.MAX_SAFE_INTEGER),
    [points],
  );
  const lowestY = useMemo(
    () => points.reduce((accum, p) => Math.min(p.y, accum), Number.MAX_SAFE_INTEGER),
    [points],
  );
  const highestX = useMemo(() => points.reduce((accum, p) => Math.max(p.x, accum), 0), [points]);
  const highestY = useMemo(() => points.reduce((accum, p) => Math.max(p.y, accum), 0), [points]);

  const diX = useMemo(() => lowestX - strokeWidthHalf, [lowestX, strokeWidthHalf]);
  const diY = useMemo(() => lowestY - strokeWidthHalf, [lowestY, strokeWidthHalf]);
  const diWidth = useMemo(() => highestX - lowestX + strokeWidth, [highestX, lowestX, strokeWidth]);
  const diHeight = useMemo(
    () => highestY - lowestY + strokeWidth,
    [highestY, lowestY, strokeWidth],
  );
  const style: CSSProperties = useMemo(
    () => ({ cursor: canSelectDrawable ? 'pointer' : undefined }),
    [canSelectDrawable],
  );

  // guard against corrupt data
  if (points.length === 0) {
    return null;
  }

  return (
    <g>
      <path
        d={`M ${points.map((p) => `${p.x} ${p.y}`).join('L')}`}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={stroke}
        onClick={handleClick}
        pointerEvents="visible-painted"
        style={style}
      />
      {selected && (
        <DragIndicator
          id={id}
          onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
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

export default PathDrawable;
