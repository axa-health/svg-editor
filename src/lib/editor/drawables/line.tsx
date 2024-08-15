// @flow
import React, { PureComponent } from 'react';
import DragIndicator from './drag-indicator';

type Props = {|
  id: string,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  stroke: string,
  strokeWidth: number,
  selected: boolean,
  onSelect: (e: MouseEvent, id: string) => void,
  onDragIndicatorMouseDown: (e: MouseEvent, id: string) => void,
  dragIndicatorStrokeWidth: number,
  onResizeHandleMouseDown: (e: MouseEvent, id: string, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => void,
  canSelectDrawable: boolean,
|};

export default class LineDrawable extends PureComponent<Props> {
  handleClick = (e: MouseEvent) => {
    this.props.onSelect(e, this.props.id);
  }

  handleResizeHandleTopLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'left', 'top');

  handleResizeHandleBottomRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'right', 'bottom');

  handleDragIndicatorMouseDown = (e: MouseEvent) => {
    this.props.onDragIndicatorMouseDown(e, this.props.id);
  };

  render() {
    const {
      id,
      x1,
      x2,
      y1,
      y2,
      stroke,
      strokeWidth,
      selected,
      dragIndicatorStrokeWidth: diStrokeWidth,
      canSelectDrawable,
    } = this.props;

    const strokeWidthHalf = strokeWidth / 2;

    const lowerX = Math.min(x1, x2);
    const higherX = Math.max(x1, x2);
    const lowerY = Math.min(y1, y2);
    const higherY = Math.max(y1, y2);
    const diX = lowerX - strokeWidthHalf;
    const diY = lowerY - strokeWidthHalf;
    const diWidth = higherX - lowerX + strokeWidth;
    const diHeight = higherY - lowerY + strokeWidth;

    const isDiHorizontalInverse = lowerX !== x1;
    const diHorizontalInverse = isDiHorizontalInverse ? -1 : 1;

    const isDiVerticalInverse = lowerY !== y1;
    const diVerticalInverse = isDiVerticalInverse ? -1 : 1;

    return (
      <g>
        <line
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
          stroke={stroke}
          strokeWidth={strokeWidth}
          onClick={this.handleClick}
          pointerEvents="visible-painted"
          style={{ cursor: canSelectDrawable ? 'pointer' : undefined }}
        />
        {selected && (
          <DragIndicator
            id={id}
            onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
            onResizeHandleTopLeftMouseDown={this.handleResizeHandleTopLeftMouseDown}
            onResizeHandleBottomRightMouseDown={this.handleResizeHandleBottomRightMouseDown}
            diX={diX}
            diY={diY}
            diWidth={diWidth}
            diHeight={diHeight}
            diStrokeWidth={diStrokeWidth}
            selected={selected}
            diLeft={x1 - (strokeWidthHalf * diHorizontalInverse)}
            diRight={x2 + (strokeWidthHalf * diHorizontalInverse)}
            diTop={y1 - (strokeWidthHalf * diVerticalInverse)}
            diBottom={y2 + (strokeWidthHalf * diVerticalInverse)}
            inverseCursorHorizontal={isDiHorizontalInverse}
            inverseCursorVertical={isDiVerticalInverse}
          />
        )}
      </g>
    );
  }
}
