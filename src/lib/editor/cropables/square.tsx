// @flow
import React, { PureComponent } from 'react';
import DragIndicator from '../drawables/drag-indicator';

type Props = {|
  x: number,
  y: number,
  width: number,
  height: number,
  onDragIndicatorMouseDown: (e: MouseEvent) => void,
  onResizeHandleMouseDown: (e: MouseEvent, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => void,
  diStrokeWidth: number,
|};

export default class RectCrop extends PureComponent<Props> {
  handleResizeHandleTopLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'left', 'top');

  handleResizeHandleTopRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'right', 'top');

  handleResizeHandleBottomLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'left', 'bottom');

  handleResizeHandleBottomRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'right', 'bottom');

  handleDragIndicatorMouseDown = (e: MouseEvent) => {
    this.props.onDragIndicatorMouseDown(e);
  };

  render() {
    const {
      x,
      y,
      width,
      height,
      diStrokeWidth,
    } = this.props;

    const id = 'svg-editor-cut';

    return (
      <g
        style={{ pointerEvents: 'bounding-box' }}
      >
        <DragIndicator
          id={id}
          animation={false}
          onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
          onResizeHandleTopLeftMouseDown={this.handleResizeHandleTopLeftMouseDown}
          onResizeHandleTopRightMouseDown={this.handleResizeHandleTopRightMouseDown}
          onResizeHandleBottomLeftMouseDown={this.handleResizeHandleBottomLeftMouseDown}
          onResizeHandleBottomRightMouseDown={this.handleResizeHandleBottomRightMouseDown}
          diX={x}
          diY={y}
          diWidth={width}
          diHeight={height}
          diStrokeWidth={diStrokeWidth}
          selected
        />
      </g>
    );
  }
}
