// @flow
import React, { PureComponent } from 'react';
import memoize from 'memoize-one';

type Props = {|
  id: string,
  onDragIndicatorMouseDown: (e: MouseEvent) => void,
  onResizeHandleTopLeftMouseDown?: (e: MouseEvent) => void,
  onResizeHandleTopRightMouseDown?: (e: MouseEvent) => void,
  onResizeHandleBottomLeftMouseDown?: (e: MouseEvent) => void,
  onResizeHandleBottomRightMouseDown?: (e: MouseEvent) => void,
  diX: number,
  diY: number,
  diWidth: number,
  diHeight: number,
  diStrokeWidth: number,
  selected: boolean,
  animation?: boolean,
  diLeft?: number,
  diRight?: number,
  diTop?: number,
  diBottom?: number,
  inverseCursorHorizontal?: boolean,
  inverseCursorVertical?: boolean,
|};

function inverseDirection(
  inverseCursorHorizontal: ?boolean,
  inverseCursorVertical: ?boolean,
  direction: 'nw' | 'ne' | 'se' | 'sw',
): 'nw' | 'ne' | 'se' | 'sw' {
  let [v, h] = `${direction}`;

  if (inverseCursorVertical) {
    v = v === 'n' ? 's' : 'n';
  }

  if (inverseCursorHorizontal) {
    h = h === 'e' ? 'w' : 'e';
  }

  // $FlowFixMe
  return `${v}${h}`;
}

export default class DragIndicator extends PureComponent<Props> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    animation: true,
  };

  makeDiStyles = memoize((selected: boolean, strokeWidth: number, animation?: boolean) => ({
    pointerEvents: 'bounding-box',
    fill: 'transparent',
    stroke: selected ? '#999999' : 'none',
    strokeWidth,
    strokeDasharray: `${strokeWidth * 2} ${strokeWidth}`,
    animation: animation ? 'dash 5s linear forwards infinite' : 'none',
    cursor: 'move',
    // TODO: make stroke dashed
  }));

  makeResizHandleStyles = memoize((
    selected: boolean,
    inverseCursorHorizontal: ?boolean,
    inverseCursorVertical: ?boolean,
    direction: 'nw' | 'ne' | 'se' | 'sw',
  ) => ({
    pointerEvents: 'bounding-box',
    fill: selected ? '#3b3fd8' : 'none',
    stroke: 'none',
    cursor: `${inverseDirection(inverseCursorHorizontal, inverseCursorVertical, direction)}-resize`,
  }));

  render() {
    const {
      id,
      onDragIndicatorMouseDown,
      onResizeHandleTopLeftMouseDown,
      onResizeHandleTopRightMouseDown,
      onResizeHandleBottomLeftMouseDown,
      onResizeHandleBottomRightMouseDown,
      diX,
      diY,
      diWidth,
      diHeight,
      diStrokeWidth,
      selected,
      inverseCursorHorizontal,
      inverseCursorVertical,
      animation,
    } = this.props;

    const diStrokeWidthHalf = diStrokeWidth / 2;

    const diTop = this.props.diTop || (diY - diStrokeWidthHalf);
    const diBottom = this.props.diBottom || (diY + diHeight + diStrokeWidthHalf);
    const diLeft = this.props.diLeft || (diX - diStrokeWidthHalf);
    const diRight = this.props.diRight || (diX + diWidth + diStrokeWidthHalf);

    return (
      <g>
        <rect
          style={this.makeDiStyles(selected, diStrokeWidth, animation)}
          x={diX}
          y={diY}
          width={diWidth}
          height={diHeight}
          strokeWidth={diStrokeWidth}
          onMouseDown={onDragIndicatorMouseDown}
        />
        {onResizeHandleTopLeftMouseDown && (
          <circle
            style={this.makeResizHandleStyles(selected, inverseCursorHorizontal, inverseCursorVertical, 'nw')}
            cx={diLeft}
            cy={diTop}
            r={diStrokeWidth}
            onMouseDown={onResizeHandleTopLeftMouseDown}
            data-id={id}
          />
        )}
        {onResizeHandleTopRightMouseDown && (
          <circle
            style={this.makeResizHandleStyles(selected, inverseCursorHorizontal, inverseCursorVertical, 'ne')}
            cx={diRight}
            cy={diTop}
            r={diStrokeWidth}
            onMouseDown={onResizeHandleTopRightMouseDown}
            data-id={id}
          />
        )}
        {onResizeHandleBottomLeftMouseDown && (
          <circle
            style={this.makeResizHandleStyles(selected, inverseCursorHorizontal, inverseCursorVertical, 'sw')}
            cx={diLeft}
            cy={diBottom}
            r={diStrokeWidth}
            onMouseDown={onResizeHandleBottomLeftMouseDown}
            data-id={id}
          />
        )}
        {onResizeHandleBottomRightMouseDown && (
          <circle
            style={this.makeResizHandleStyles(selected, inverseCursorHorizontal, inverseCursorVertical, 'se')}
            cx={diRight}
            cy={diBottom}
            r={diStrokeWidth}
            onMouseDown={onResizeHandleBottomRightMouseDown}
            data-id={id}
          />
        )}
      </g>
    );
  }
}
