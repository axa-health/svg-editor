// @flow
import React, { PureComponent } from 'react';
import DragIndicator from './drag-indicator';

type Props = {|
  id: string,
  rotate: 0 | 90 | 180 | 270,
  points: Array<{ x: number, y: number }>,
  stroke: string,
  strokeWidth: number,
  selected: boolean,
  onSelect: (e: MouseEvent, id: string) => void,
  onDragIndicatorMouseDown: (e: MouseEvent, id: string) => void,
  dragIndicatorStrokeWidth: number,
  onRemoveDrawable: (e: MouseEvent, id: string) => void,
|};

export default class PathDrawable extends PureComponent<Props> {
  handleClick = (e: MouseEvent) => {
    this.props.onSelect(e, this.props.id);
  };

  handleDragIndicatorMouseDown = (e: MouseEvent) => {
    this.props.onDragIndicatorMouseDown(e, this.props.id);
  };

  handleRemoveDrawable = (e: MouseEvent) => this.props.onRemoveDrawable(e, this.props.id);

  render() {
    const {
      id,
      points,
      stroke,
      strokeWidth,
      selected,
      dragIndicatorStrokeWidth: diStrokeWidth,
      rotate,
    } = this.props;

    // guard against corrupt data
    if (points.length === 0) {
      return null;
    }

    const diStrokeWidthHalf = diStrokeWidth / 2;

    const lowestX = points.reduce((accum, p) => Math.min(p.x, accum), Number.MAX_SAFE_INTEGER);
    const lowestY = points.reduce((accum, p) => Math.min(p.y, accum), Number.MAX_SAFE_INTEGER);
    const highestX = points.reduce((accum, p) => Math.max(p.x, accum), 0);
    const highestY = points.reduce((accum, p) => Math.max(p.y, accum), 0);

    const diX = lowestX - diStrokeWidthHalf;
    const diY = lowestY - diStrokeWidthHalf;
    const diWidth = highestX - lowestX + diStrokeWidth;
    const diHeight = highestY - lowestY + diStrokeWidth;

    return (
      <g
        style={{ pointerEvents: 'bounding-box' }}
        data-id={id}
        onClick={this.handleClick}
      >
        <path
          d={`M ${points.map(p => `${p.x} ${p.y}`).join('L')}`}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={stroke}
        />
        <DragIndicator
          id={id}
          rotate={rotate}
          onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
          diX={diX}
          diY={diY}
          diWidth={diWidth}
          diHeight={diHeight}
          diStrokeWidth={diStrokeWidth}
          selected={selected}
          onRemoveDrawable={this.handleRemoveDrawable}
        />
      </g>
    );
  }
}
