import type { FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback } from 'react';
import DragIndicator from '../drawables/drag-indicator';
import type { CropBoxProps, CropInteractionProps } from './types';

type Props = CropBoxProps & CropInteractionProps;

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

  return (
    <g pointerEvents="bounding-box">
      <DragIndicator
        id={id}
        onDragIndicatorMouseDown={onDragIndicatorMouseDown}
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
