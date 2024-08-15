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
  canSelectDrawable: boolean,
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
      canSelectDrawable,
    } = this.props;

    const strokeWidthHalf = strokeWidth / 2;

    const diX = cx - rx - strokeWidthHalf;
    const diY = cy - ry - strokeWidthHalf;
    const diWidth = rx * 2 + strokeWidth;
    const diHeight = ry * 2 + strokeWidth;

    return (
      <g>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          pointerEvents="visible"
          onClick={this.handleClick}
          style={{ cursor: canSelectDrawable ? 'pointer' : undefined }}
        />
        {selected && (
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
        )}
      </g>
    );
  }
}
