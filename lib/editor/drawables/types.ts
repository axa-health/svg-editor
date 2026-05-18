import type { MouseEvent as ReactMouseEvent } from 'react';
import type { Coords } from '../utils';

export type ResizeHandleX = 'left' | 'right';
export type ResizeHandleY = 'top' | 'bottom';

type DrawableMouseHandler<TArgs extends Array<unknown> = []> = (
  e: ReactMouseEvent,
  id: string,
  ...args: TArgs
) => void;

type DrawableResizeArgs = [
  handleX: ResizeHandleX,
  handleY: ResizeHandleY,
  newX: number,
  newY: number,
];

type DrawableResizeStartArgs = [handleX: ResizeHandleX, handleY: ResizeHandleY];

export type DrawableSelectHandler = DrawableMouseHandler;
export type DrawableDragStartHandler = DrawableMouseHandler;
export type DrawableTranslateHandler = (id: string, x: number, y: number) => void;
export type DrawableResizeStartHandler = DrawableMouseHandler<DrawableResizeStartArgs>;
export type DrawableResizeHandler = DrawableMouseHandler<DrawableResizeArgs>;

export type DragIndicatorMouseDownHandler = (e: ReactMouseEvent<SVGRectElement>) => void;
export type DragIndicatorResizeHandleMouseDown = (e: ReactMouseEvent<SVGCircleElement>) => void;

type DrawableType = 'rect' | 'text' | 'ellipse' | 'line' | 'path';

type DrawableBase<TType extends DrawableType> = {
  type: TType;
  id: string;
};

type StrokeShape = {
  strokeWidth: number;
  stroke: string;
};

type FillShape = {
  fill: string;
};

type XYPosition = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type RectDrawable = DrawableBase<'rect'> & XYPosition & Size & StrokeShape & FillShape;

type TextDrawable = DrawableBase<'text'> &
  XYPosition &
  FillShape & {
    text: ReadonlyArray<string>;
    fontSize: number;
  };

type EllipseDrawable = DrawableBase<'ellipse'> &
  StrokeShape &
  FillShape & {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
  };

type LineDrawable = DrawableBase<'line'> &
  StrokeShape & {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };

type PathDrawable = DrawableBase<'path'> &
  StrokeShape & {
    points: Array<Coords>;
  };

export type Drawable = RectDrawable | TextDrawable | EllipseDrawable | LineDrawable | PathDrawable;

type DrawableShapeProps<TType extends Drawable['type']> = Omit<
  Extract<Drawable, { type: TType }>,
  'type'
>;

export type RectDrawableShapeProps = DrawableShapeProps<'rect'>;
export type TextDrawableShapeProps = DrawableShapeProps<'text'>;
export type EllipseDrawableShapeProps = DrawableShapeProps<'ellipse'>;
export type LineDrawableShapeProps = DrawableShapeProps<'line'>;
export type PathDrawableShapeProps = DrawableShapeProps<'path'>;

export type DrawableSelectableProps = {
  selected: boolean;
  onSelect: DrawableSelectHandler;
  onDragIndicatorMouseDown: DrawableDragStartHandler;
  dragIndicatorStrokeWidth: number;
  canSelectDrawable: boolean;
};

export type DrawableResizableProps = DrawableSelectableProps & {
  onResizeHandleMouseDown: DrawableResizeStartHandler;
};

export type DragIndicatorBoundsProps = {
  diX: number;
  diY: number;
  diWidth: number;
  diHeight: number;
  diStrokeWidth: number;
};

export type DragIndicatorBoundsOverrideProps = {
  diLeft?: number;
  diRight?: number;
  diTop?: number;
  diBottom?: number;
};

export type DragIndicatorResizeHandlesProps = {
  onResizeHandleTopLeftMouseDown?: DragIndicatorResizeHandleMouseDown;
  onResizeHandleTopRightMouseDown?: DragIndicatorResizeHandleMouseDown;
  onResizeHandleBottomLeftMouseDown?: DragIndicatorResizeHandleMouseDown;
  onResizeHandleBottomRightMouseDown?: DragIndicatorResizeHandleMouseDown;
};

export type DragIndicatorCursorProps = {
  inverseCursorHorizontal?: boolean;
  inverseCursorVertical?: boolean;
};
