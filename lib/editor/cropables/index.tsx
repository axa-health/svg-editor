import type { FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Square from './square';

export type Crop = {
  x: number;
  y: number;
  height: number;
  width: number;
};

type Props = {
  height: number;
  width: number;
  canTransformCrop: boolean;
  onCropTranslate: (x: number, y: number) => void;
  onCropTranslateEnd?: (x: number, y: number) => void;
  onRemoveCrop?: () => void;
  onResizeCrop: (
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => void;
  onResizeCropEnd?: (
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => void;
  onConfirmCrop?: () => void;
  crop?: Crop;
  diStrokeWidth: number;
};

const Cropables: FunctionComponent<Props> = ({
  diStrokeWidth,
  onCropTranslateEnd,
  onResizeCropEnd,
  width,
  crop,
  canTransformCrop,
  onConfirmCrop,
  onCropTranslate,
  onRemoveCrop,
  onResizeCrop,
  height,
}) => {
  const referenceRect = useRef<SVGRectElement>(null);

  const onWindowKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const eventTarget = event.target as HTMLElement;
      const tagName = eventTarget?.tagName.toLowerCase();

      if (
        tagName !== 'input' &&
        tagName !== 'textarea' &&
        !eventTarget.isContentEditable &&
        crop &&
        canTransformCrop
      ) {
        if (onConfirmCrop && event.key === 'Enter') {
          event.preventDefault();
          onConfirmCrop();
        }
        if (
          onRemoveCrop &&
          (event.key === 'Backspace' ||
            event.key === 'Delete' ||
            event.key === 'Escape' ||
            event.key === 'Esc')
        ) {
          event.preventDefault();
          onRemoveCrop();
        }
      }
    },
    [canTransformCrop, crop, onConfirmCrop, onRemoveCrop],
  );

  const handleDragIndicatorMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if (!canTransformCrop) {
        return;
      }

      if (!referenceRect.current) {
        console.error('referenceRect not available!'); // eslint-disable-line no-console
        return;
      }

      const svg = referenceRect.current.closest('svg');

      if (!svg) {
        console.error('svg not found'); // eslint-disable-line no-console
        return;
      }

      const inverseMatrix = referenceRect.current?.getScreenCTM()?.inverse();

      const transformPoint = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
        let pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        pt = pt.matrixTransform(inverseMatrix);

        return { x: pt.x, y: pt.y };
      };

      e.stopPropagation();

      // move the drawable with the mouse
      let lastCoords = transformPoint(e);

      const mouseMoveHandler = (e2: MouseEvent) => {
        const currentCoords = transformPoint(e2);

        onCropTranslate(currentCoords.x - lastCoords.x, currentCoords.y - lastCoords.y);

        lastCoords = currentCoords;
      };

      const mouseUpHandler = (e3: MouseEvent) => {
        const currentCoords = transformPoint(e3);
        if (onCropTranslateEnd) {
          onCropTranslateEnd(currentCoords.x - lastCoords.x, currentCoords.y - lastCoords.y);
        }

        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', mouseUpHandler);
      };

      window.addEventListener('mousemove', mouseMoveHandler);
      window.addEventListener('mouseup', mouseUpHandler);
    },
    [canTransformCrop, onCropTranslate, onCropTranslateEnd],
  );

  const handleResizeHandleMouseDown = useCallback(
    (e: ReactMouseEvent, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => {
      if (!canTransformCrop) {
        return;
      }

      e.stopPropagation();

      if (!referenceRect.current) {
        console.error('Reference rect not available!'); // eslint-disable-line no-console
        return;
      }

      const svg = referenceRect.current.closest('svg');

      if (!svg) {
        console.error('svg not found'); // eslint-disable-line no-console
        return;
      }

      const inverseMatrix = referenceRect.current?.getScreenCTM()?.inverse();

      const transformPoint = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
        let pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        pt = pt.matrixTransform(inverseMatrix);

        return { x: pt.x, y: pt.y };
      };

      const mouseMoveHandler = (e2: MouseEvent) => {
        const newCoords = transformPoint(e2);
        onResizeCrop(handleX, handleY, newCoords.x, newCoords.y);
      };

      const mouseUpHandler = (e3: MouseEvent) => {
        const newCoords = transformPoint(e3);
        if (onResizeCropEnd) {
          onResizeCropEnd(handleX, handleY, newCoords.x, newCoords.y);
        }

        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', mouseUpHandler);
      };

      window.addEventListener('mouseup', mouseUpHandler);
      window.addEventListener('mousemove', mouseMoveHandler);
    },
    [canTransformCrop, onResizeCrop, onResizeCropEnd],
  );

  useEffect(() => {
    window.addEventListener('keydown', onWindowKeyPress);
    return () => {
      window.removeEventListener('keydown', onWindowKeyPress);
    };
  }, [onWindowKeyPress]);

  const pointerEvents = useMemo(
    () => (canTransformCrop ? 'visiblePainted' : 'none'),
    [canTransformCrop],
  );

  if (!crop) {
    return null;
  }

  const { x, y, height: cropHeight, width: cropWidth } = crop;

  return (
    <g pointerEvents={pointerEvents}>
      <path
        d={`M0 0 H${width} V${height} H0 Z M${x} ${y} H${x + cropWidth} V${y + cropHeight} H${x} Z`}
        fillRule="evenodd"
        fill="rgba(0,0,0,0.5)"
      />
      <rect ref={referenceRect} x="0" y="0" width={`${width}`} height={`${height}`} fill="none" />
      {canTransformCrop && (
        <Square
          id="crop"
          x={x}
          y={y}
          height={cropHeight}
          width={cropWidth}
          diStrokeWidth={diStrokeWidth}
          onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
          onResizeHandleMouseDown={handleResizeHandleMouseDown}
        />
      )}
    </g>
  );
};

export default Cropables;
