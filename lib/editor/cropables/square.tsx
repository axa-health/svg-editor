import type { FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import React, { useCallback } from 'react';
import DragIndicator from '../drawables/drag-indicator';

type Props = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onDragIndicatorMouseDown: (e: ReactMouseEvent) => void;
  onResizeHandleMouseDown: (
    e: ReactMouseEvent,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
  ) => void;
  diStrokeWidth: number;
};

const RectCrop: FunctionComponent<Props> = ({
  x,
  y,
  width,
  height,
  diStrokeWidth,
  onResizeHandleMouseDown,
  onDragIndicatorMouseDown,
  id,
}) => {
  const handleResizeHandleTopLeftMouseDown = useCallback(
    (e: ReactMouseEvent) => onResizeHandleMouseDown(e, 'left', 'top'),
    [onResizeHandleMouseDown],
  );

  const handleResizeHandleTopRightMouseDown = useCallback(
    (e: ReactMouseEvent) => onResizeHandleMouseDown(e, 'right', 'top'),
    [onResizeHandleMouseDown],
  );

  const handleResizeHandleBottomLeftMouseDown = useCallback(
    (e: ReactMouseEvent) => onResizeHandleMouseDown(e, 'left', 'bottom'),
    [onResizeHandleMouseDown],
  );

  const handleResizeHandleBottomRightMouseDown = useCallback(
    (e: ReactMouseEvent) => onResizeHandleMouseDown(e, 'right', 'bottom'),
    [onResizeHandleMouseDown],
  );

  const handleDragIndicatorMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      onDragIndicatorMouseDown(e);
    },
    [onDragIndicatorMouseDown],
  );

  return (
    <g pointerEvents="bounding-box">
      <DragIndicator
        id={id}
        onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
        onResizeHandleTopLeftMouseDown={handleResizeHandleTopLeftMouseDown}
        onResizeHandleTopRightMouseDown={handleResizeHandleTopRightMouseDown}
        onResizeHandleBottomLeftMouseDown={handleResizeHandleBottomLeftMouseDown}
        onResizeHandleBottomRightMouseDown={handleResizeHandleBottomRightMouseDown}
        diX={x}
        diY={y}
        diWidth={width}
        diHeight={height}
        diStrokeWidth={diStrokeWidth}
        selected
      />
    </g>
  );
};

export default RectCrop;
