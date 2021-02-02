// @flow
import React, { PureComponent } from 'react';
import EllipseDrawable from './ellipse';
import LineDrawable from './line';
import PathDrawable from './path';
import RectDrawable from './rect';
import TextDrawable from './text';

export type Drawable = {
  type: 'rect',
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number,
  stroke: string,
  fill: string,
} | {
  type: 'text',
  id: string,
  x: number,
  y: number,
  text: string,
  fill: string,
  fontSize: number,
} | {
  type: 'ellipse',
  id: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  strokeWidth: number,
  stroke: string,
  fill: string,
} | {
  type: 'line',
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number,
  stroke: string,
} | {
  type: 'path',
  id: string,
  points: Array<{ x: number, y: number }>,
  strokeWidth: number,
  stroke: string,
};

type Props = {|
  canSelectDrawable: boolean,
  selectedDrawable?: ?string,
  onSelectDrawable: (id: ?string) => void,
  onDrawableTranslate: (id: string, x: number, y: number) => void,
  onDrawableTranslateEnd?: (id: string, x: number, y: number) => void,
  onRemoveDrawable?: (id: string) => void,
  onResizeDrawable: (
    e: MouseEvent,
    id: string,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => void,
  onResizeDrawableEnd?: (
    e: MouseEvent,
    id: string,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => void,
  drawables: Array<Drawable>,
  diStrokeWidth: number,
  width: number,
  height: number,
|};

export default class Drawables extends PureComponent<Props> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    // flow needs the prop to be required even it's not
    // eslint-disable-next-line react/default-props-match-prop-types
    canSelectDrawable: true,
  };

  referenceRect: { current: null | Element } = React.createRef();

  componentDidMount() {
    window.addEventListener('keydown', this.onWindowKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onWindowKeyPress);
  }

  onWindowKeyPress = (event: KeyboardEvent) => {
    const { selectedDrawable, onRemoveDrawable, onSelectDrawable } = this.props;

    const eventTarget: HTMLElement = (event.target: any);
    const tagName = eventTarget.tagName.toLowerCase();

    if (
      tagName !== 'input'
      && tagName !== 'textarea'
      && !eventTarget.isContentEditable
      && selectedDrawable
    ) {
      if (onRemoveDrawable) {
        if (event.key === 'Escape' || event.key === 'Esc') {
          event.preventDefault();
          onSelectDrawable(null);
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
          event.preventDefault();
          onRemoveDrawable(selectedDrawable);
        }
      }
    }
  };

  handleDragIndicatorMouseDown = (e: MouseEvent, id: string) => {
    if (!this.props.canSelectDrawable) {
      return;
    }

    const { current: referenceRect } = this.referenceRect;

    if (!referenceRect) {
      console.error('referenceRect not available!'); // eslint-disable-line no-console
      return;
    }

    const svg = referenceRect.closest('svg');

    if (!svg) {
      console.error('svg not found'); // eslint-disable-line no-console
      return;
    }

    // $FlowFixMe flow doesn't know artboard is an SVGGraphicsElement
    const inverseMatrix = referenceRect.getScreenCTM().inverse();

    const transformPoint = ({ clientX, clientY }) => {
      // $FlowFixMe flow doesn't know we get an SVG element
      let pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      pt = pt.matrixTransform(inverseMatrix);

      return { x: pt.x, y: pt.y };
    };

    e.stopPropagation();

    // select the drawable, if not yet selected
    if (this.props.selectedDrawable !== id) {
      this.props.onSelectDrawable(id);
    }

    // move the drawable with the mouse
    let lastCoords = transformPoint(e);

    const mouseMoveHandler = (e2: MouseEvent) => {
      const currentCoords = transformPoint(e2);

      this.props.onDrawableTranslate(
        id,
        currentCoords.x - lastCoords.x,
        currentCoords.y - lastCoords.y,
      );

      lastCoords = currentCoords;
    };

    const { onDrawableTranslateEnd } = this.props;

    const mouseUpHandler = (e3: MouseEvent) => {
      const currentCoords = transformPoint(e3);
      if (onDrawableTranslateEnd) {
        onDrawableTranslateEnd(
          id,
          currentCoords.x - lastCoords.x,
          currentCoords.y - lastCoords.y,
        );
      }

      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  }

  handleDrawableSelect = (e: MouseEvent, id: string) => {
    if (!this.props.canSelectDrawable) {
      return;
    }

    e.stopPropagation();
    this.props.onSelectDrawable(id);
  };

  handleRemoveDrawable = (e: MouseEvent, id: string) => {
    e.stopPropagation();

    if (this.props.onRemoveDrawable) {
      this.props.onRemoveDrawable(id);
    }
  };

  handleResizeHandleMouseDown = (e: MouseEvent, id: string, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => {
    if (!this.props.canSelectDrawable) {
      return;
    }

    e.stopPropagation();

    const { current: referenceRect } = this.referenceRect;

    if (!referenceRect) {
      console.error('Reference rect not available!'); // eslint-disable-line no-console
      return;
    }

    const svg = referenceRect.closest('svg');

    if (!svg) {
      console.error('svg not found'); // eslint-disable-line no-console
      return;
    }

    // $FlowFixMe
    const inverseMatrix = referenceRect.getScreenCTM().inverse();

    const transformPoint = ({ clientX, clientY }) => {
      // $FlowFixMe flow doesn't know we get an SVG element
      let pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      pt = pt.matrixTransform(inverseMatrix);

      return { x: pt.x, y: pt.y };
    };

    const mouseMoveHandler = (e2) => {
      const newCoords = transformPoint(e2);

      this.props.onResizeDrawable(
        e,
        id,
        handleX,
        handleY,
        newCoords.x,
        newCoords.y,
      );
    };

    const { onResizeDrawableEnd } = this.props;

    const mouseUpHandler = (e3: MouseEvent) => {
      const newCoords = transformPoint(e3);
      if (onResizeDrawableEnd) {
        onResizeDrawableEnd(
          e,
          id,
          handleX,
          handleY,
          newCoords.x,
          newCoords.y,
        );
      }

      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
  }

  sortBySelected = (drawableA: Drawable, drawableB: Drawable) => {
    const { selectedDrawable } = this.props;

    if (selectedDrawable === drawableA.id) {
      return 1;
    }

    if (selectedDrawable === drawableB.id) {
      return -1;
    }

    return 0;
  };

  render() {
    const {
      selectedDrawable,
      diStrokeWidth,
      canSelectDrawable,
      width,
      height,
    } = this.props;

    return (
      <g>
        <rect
          ref={this.referenceRect}
          x="0"
          y="0"
          width={`${width}`}
          height={`${height}`}
          fill="none"
        />
        {this.props.drawables
          && this.props.drawables
            .sort(this.sortBySelected).map((item) => {
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
                      onSelect={this.handleDrawableSelect}
                      onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
                      dragIndicatorStrokeWidth={diStrokeWidth}
                      onResizeHandleMouseDown={this.handleResizeHandleMouseDown}
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
                      onSelect={this.handleDrawableSelect}
                      onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
                      dragIndicatorStrokeWidth={diStrokeWidth}
                      onResizeHandleMouseDown={this.handleResizeHandleMouseDown}
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
                      onSelect={this.handleDrawableSelect}
                      onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
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
                      onSelect={this.handleDrawableSelect}
                      onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
                      dragIndicatorStrokeWidth={diStrokeWidth}
                      onResizeHandleMouseDown={this.handleResizeHandleMouseDown}
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
                      onSelect={this.handleDrawableSelect}
                      onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
                      dragIndicatorStrokeWidth={diStrokeWidth}
                      onResizeHandleMouseDown={this.handleResizeHandleMouseDown}
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
  }
}
