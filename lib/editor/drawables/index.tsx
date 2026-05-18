import type { FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { createSvgPointTransformer } from '../utils';
import EllipseDrawable from './ellipse';
import LineDrawable from './line';
import PathDrawable from './path';
import RectDrawable from './rect';
import TextDrawable from './text';
import type {
  Drawable,
  DrawableResizeHandler,
  DrawableTranslateHandler,
  ResizeHandleX,
  ResizeHandleY,
} from './types';

export type { Drawable } from './types';

type Props = {
  canSelectDrawable?: boolean;
  selectedDrawable?: string;
  onSelectDrawable: (id?: string) => void;
  onDrawableTranslate: DrawableTranslateHandler;
  onDrawableTranslateEnd?: DrawableTranslateHandler;
  onRemoveDrawable?: (id: string) => void;
  onResizeDrawable: DrawableResizeHandler;
  onResizeDrawableEnd?: DrawableResizeHandler;
  drawables: ReadonlyArray<Drawable>;
  diStrokeWidth: number;
  width: number;
  height: number;
};

const DrawableComp: FunctionComponent<Props> = ({
  diStrokeWidth,
  canSelectDrawable = true,
  selectedDrawable,
  onRemoveDrawable,
  drawables,
  onDrawableTranslate,
  onDrawableTranslateEnd,
  onResizeDrawableEnd,
  onResizeDrawable,
  width,
  onSelectDrawable,
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
        selectedDrawable
      ) {
        if (onRemoveDrawable) {
          if (event.key === 'Escape' || event.key === 'Esc') {
            event.preventDefault();
            onSelectDrawable(undefined);
          } else if (event.key === 'Backspace' || event.key === 'Delete') {
            event.preventDefault();
            onRemoveDrawable(selectedDrawable);
          }
        }
      }
    },
    [onRemoveDrawable, onSelectDrawable, selectedDrawable],
  );

  const handleDragIndicatorMouseDown = (e: ReactMouseEvent, id: string) => {
    if (!canSelectDrawable) {
      return;
    }

    if (!referenceRect.current) {
      return;
    }

    const transformPoint = createSvgPointTransformer(referenceRect.current);

    if (!transformPoint) {
      return;
    }

    e.stopPropagation();

    // select the drawable, if not yet selected
    if (selectedDrawable !== id) {
      onSelectDrawable(id);
    }

    // move the drawable with the mouse
    let lastCoords = transformPoint(e);

    const mouseMoveHandler = (e2: MouseEvent) => {
      const currentCoords = transformPoint(e2);

      onDrawableTranslate(id, currentCoords.x - lastCoords.x, currentCoords.y - lastCoords.y);

      lastCoords = currentCoords;
    };

    const mouseUpHandler = (e3: MouseEvent) => {
      const currentCoords = transformPoint(e3);
      if (onDrawableTranslateEnd) {
        onDrawableTranslateEnd(id, currentCoords.x - lastCoords.x, currentCoords.y - lastCoords.y);
      }

      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  };

  const handleDrawableSelect = (e: ReactMouseEvent, id: string) => {
    if (!canSelectDrawable) {
      return;
    }

    e.stopPropagation();
    onSelectDrawable(id);
  };

  const handleResizeHandleMouseDown = (
    e: ReactMouseEvent,
    id: string,
    handleX: ResizeHandleX,
    handleY: ResizeHandleY,
  ) => {
    if (!canSelectDrawable) {
      return;
    }

    e.stopPropagation();

    if (!referenceRect.current) {
      return;
    }

    const transformPoint = createSvgPointTransformer(referenceRect.current);

    if (!transformPoint) {
      return;
    }

    const mouseMoveHandler = (e2: MouseEvent) => {
      const newCoords = transformPoint(e2);

      onResizeDrawable(e, id, handleX, handleY, newCoords.x, newCoords.y);
    };

    const mouseUpHandler = (e3: MouseEvent) => {
      const newCoords = transformPoint(e3);
      if (onResizeDrawableEnd) {
        onResizeDrawableEnd(e, id, handleX, handleY, newCoords.x, newCoords.y);
      }

      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
  };

  const sortBySelected = useCallback(
    (drawableA: Drawable, drawableB: Drawable) => {
      if (selectedDrawable === drawableA.id) {
        return 1;
      }

      if (selectedDrawable === drawableB.id) {
        return -1;
      }

      return 0;
    },
    [selectedDrawable],
  );

  const isSelected = useCallback((id: string) => selectedDrawable === id, [selectedDrawable]);

  const sharedSelectableProps = {
    onSelect: handleDrawableSelect,
    onDragIndicatorMouseDown: handleDragIndicatorMouseDown,
    dragIndicatorStrokeWidth: diStrokeWidth,
    canSelectDrawable,
  };

  const sharedResizableProps = {
    ...sharedSelectableProps,
    onResizeHandleMouseDown: handleResizeHandleMouseDown,
  };

  const renderDrawable = (item: Drawable) => {
    switch (item.type) {
      case 'ellipse':
        return (
          <EllipseDrawable
            key={item.id}
            id={item.id}
            cx={item.cx}
            cy={item.cy}
            rx={item.rx}
            ry={item.ry}
            fill={item.fill}
            stroke={item.stroke}
            strokeWidth={item.strokeWidth}
            selected={isSelected(item.id)}
            {...sharedResizableProps}
          />
        );
      case 'line':
        return (
          <LineDrawable
            key={item.id}
            id={item.id}
            x1={item.x1}
            x2={item.x2}
            y1={item.y1}
            y2={item.y2}
            stroke={item.stroke}
            strokeWidth={item.strokeWidth}
            selected={isSelected(item.id)}
            {...sharedResizableProps}
          />
        );
      case 'path':
        return (
          <PathDrawable
            key={item.id}
            id={item.id}
            points={item.points}
            stroke={item.stroke}
            strokeWidth={item.strokeWidth}
            selected={isSelected(item.id)}
            {...sharedSelectableProps}
          />
        );
      case 'rect':
        return (
          <RectDrawable
            key={item.id}
            id={item.id}
            x={item.x}
            y={item.y}
            width={item.width}
            height={item.height}
            fill={item.fill}
            stroke={item.stroke}
            strokeWidth={item.strokeWidth}
            selected={isSelected(item.id)}
            {...sharedResizableProps}
          />
        );
      case 'text':
        return (
          <TextDrawable
            key={item.id}
            id={item.id}
            x={item.x}
            y={item.y}
            fill={item.fill}
            text={item.text}
            fontSize={item.fontSize}
            selected={isSelected(item.id)}
            {...sharedSelectableProps}
          />
        );
      default:
        console.error('item of unknown type could not be drawn', item); // eslint-disable-line no-console
        return null;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', onWindowKeyPress);
    return () => {
      window.removeEventListener('keydown', onWindowKeyPress);
    };
  }, [onWindowKeyPress]);
  return (
    <g>
      <rect ref={referenceRect} x="0" y="0" width={`${width}`} height={`${height}`} fill="none" />
      {[...drawables].sort(sortBySelected).map(renderDrawable)}
    </g>
  );
};

export default DrawableComp;
