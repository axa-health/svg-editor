import type { FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import EllipseDrawable from './ellipse';
import LineDrawable from './line';
import PathDrawable from './path';
import RectDrawable from './rect';
import TextDrawable from './text';

export type Drawable =
  | {
      type: 'rect';
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      strokeWidth: number;
      stroke: string;
      fill: string;
    }
  | {
      type: 'text';
      id: string;
      x: number;
      y: number;
      text: ReadonlyArray<string>;
      fill: string;
      fontSize: number;
    }
  | {
      type: 'ellipse';
      id: string;
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      strokeWidth: number;
      stroke: string;
      fill: string;
    }
  | {
      type: 'line';
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      strokeWidth: number;
      stroke: string;
    }
  | {
      type: 'path';
      id: string;
      points: Array<{ x: number; y: number }>;
      strokeWidth: number;
      stroke: string;
    };

type Props = {
  canSelectDrawable?: boolean;
  selectedDrawable?: string;
  onSelectDrawable: (id?: string) => void;
  onDrawableTranslate: (id: string, x: number, y: number) => void;
  onDrawableTranslateEnd?: (id: string, x: number, y: number) => void;
  onRemoveDrawable?: (id: string) => void;
  onResizeDrawable: (
    e: ReactMouseEvent,
    id: string,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => void;
  onResizeDrawableEnd?: (
    e: ReactMouseEvent,
    id: string,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => void;
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
      console.error('referenceRect not available!'); // eslint-disable-line no-console
      return;
    }

    const svg = referenceRect.current.closest('svg');

    if (!svg) {
      console.error('svg not found'); // eslint-disable-line no-console
      return;
    }

    const inverseMatrix = referenceRect?.current.getScreenCTM()?.inverse();

    const transformPoint = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
      let pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      pt = pt.matrixTransform(inverseMatrix);

      return { x: pt.x, y: pt.y };
    };

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
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
  ) => {
    if (!canSelectDrawable) {
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

    const inverseMatrix = referenceRect.current.getScreenCTM()?.inverse();

    const transformPoint = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
      let pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      pt = pt.matrixTransform(inverseMatrix);

      return { x: pt.x, y: pt.y };
    };

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
  useEffect(() => {
    window.addEventListener('keydown', onWindowKeyPress);
    return () => {
      window.removeEventListener('keydown', onWindowKeyPress);
    };
  }, [onWindowKeyPress]);
  return (
    <g>
      <rect ref={referenceRect} x="0" y="0" width={`${width}`} height={`${height}`} fill="none" />
      {drawables &&
        [...drawables].sort(sortBySelected).map((item) => {
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
                  selected={selectedDrawable === item.id}
                  onSelect={handleDrawableSelect}
                  onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
                  dragIndicatorStrokeWidth={diStrokeWidth}
                  onResizeHandleMouseDown={handleResizeHandleMouseDown}
                  canSelectDrawable={canSelectDrawable}
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
                  selected={selectedDrawable === item.id}
                  onSelect={handleDrawableSelect}
                  onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
                  dragIndicatorStrokeWidth={diStrokeWidth}
                  onResizeHandleMouseDown={handleResizeHandleMouseDown}
                  canSelectDrawable={canSelectDrawable}
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
                  selected={selectedDrawable === item.id}
                  onSelect={handleDrawableSelect}
                  onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
                  dragIndicatorStrokeWidth={diStrokeWidth}
                  canSelectDrawable={canSelectDrawable}
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
                  selected={selectedDrawable === item.id}
                  onSelect={handleDrawableSelect}
                  onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
                  dragIndicatorStrokeWidth={diStrokeWidth}
                  onResizeHandleMouseDown={handleResizeHandleMouseDown}
                  canSelectDrawable={canSelectDrawable}
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
                  selected={selectedDrawable === item.id}
                  onSelect={handleDrawableSelect}
                  onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
                  dragIndicatorStrokeWidth={diStrokeWidth}
                  canSelectDrawable={canSelectDrawable}
                />
              );
            default:
              console.error('item of unknown type could not be drawn', item); // eslint-disable-line no-console
              return null;
          }
        })}
    </g>
  );
};

export default DrawableComp;
