// @flow
import React, { PureComponent } from 'react';
import DragIndicator from './drag-indicator';

type Props = {|
  id: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: string,
  stroke: string,
  strokeWidth: number,
  selected: boolean,
  onSelect: (e: MouseEvent, id: string) => void,
  onDragIndicatorMouseDown: (e: MouseEvent, id: string) => void,
  dragIndicatorStrokeWidth: number,
  onResizeHandleMouseDown: (e: MouseEvent, id: string, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => void,
|};

export default class EllipseDrawable extends PureComponent<Props> {
  handleClick = (e: MouseEvent) => {
    this.props.onSelect(e, this.props.id);
  }

  handleResizeHandleTopLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'left', 'top');

  handleResizeHandleTopRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'right', 'top');

  handleResizeHandleBottomLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'left', 'bottom');

  handleResizeHandleBottomRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'right', 'bottom');

  handleDragIndicatorMouseDown = (e: MouseEvent) => {
    this.props.onDragIndicatorMouseDown(e, this.props.id);
  };

  render() {
    const {
      id,
      cx,
      cy,
      rx,
      ry,
      fill,
      stroke,
      strokeWidth,
      selected,
      dragIndicatorStrokeWidth: diStrokeWidth,
    } = this.props;

    const diStrokeWidthHalf = diStrokeWidth / 2;

    const diX = cx - rx - diStrokeWidthHalf;
    const diY = cy - ry - diStrokeWidthHalf;
    const diWidth = rx * 2 + diStrokeWidth;
    const diHeight = ry * 2 + diStrokeWidth;

    return (
      <g
        style={{ pointerEvents: 'bounding-box' }}
        data-id={id}
        onClick={this.handleClick}
      >
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <DragIndicator
          id={id}
          onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
          onResizeHandleTopLeftMouseDown={this.handleResizeHandleTopLeftMouseDown}
          onResizeHandleTopRightMouseDown={this.handleResizeHandleTopRightMouseDown}
          onResizeHandleBottomLeftMouseDown={this.handleResizeHandleBottomLeftMouseDown}
          onResizeHandleBottomRightMouseDown={this.handleResizeHandleBottomRightMouseDown}
          diX={diX}
          diY={diY}
          diWidth={diWidth}
          diHeight={diHeight}
          diStrokeWidth={diStrokeWidth}
          selected={selected}
        />
      </g>
    );
  }
}
