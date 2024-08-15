import React, { PureComponent, type ReactNode } from 'react';

type Props ={
  width: number,
  height: number,
  children?: ReactNode,
  onMouseDown: ({ start: { x: number, y: number } }, MouseEvent) => void,
  onMouseMove: ({
      start: { x: number, y: number },
      current: { x: number, y: number }
    }, MouseEvent) => void,
  onMouseUp: ({
      start: { x: number, y: number },
      current: { x: number, y: number }
    }, MouseEvent) => void,
};

const artboardStyles = { pointerEvents: 'all', cursor: 'crosshair' };

export default class ArtboardBase extends PureComponent<Props> {
  handleArtboardMouseDown = (e: MouseEvent) => {
    const artboard = e.currentTarget;

    // $FlowFixMe flow doesn't know currentTarget is of type Element
    const svg = artboard.closest('svg');

    if (!svg) {
      console.error('svg not found'); // eslint-disable-line no-console
      return;
    }

    // $FlowFixMe flow doesn't know artboard is an SVGGraphicsElement
    const inverseMatrix = artboard.getScreenCTM().inverse();

    e.stopPropagation();

    const transformPoint = ({ clientX, clientY }) => {
      let pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      pt = pt.matrixTransform(inverseMatrix);

      return { x: pt.x, y: pt.y };
    };

    const start = transformPoint(e);
    this.props.onMouseDown({ start }, e);

    const mouseMoveHandler = (e2: MouseEvent) => {
      this.props.onMouseMove({ start, current: transformPoint(e2) }, e2);
    };

    const mouseUpHandler = (e2: MouseEvent) => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);

      this.props.onMouseUp({ start, current: transformPoint(e2) }, e2);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  };

  render() {
    const {
      width,
      height,
      children,
    } = this.props;

    return (
      <g>
        <rect
          style={artboardStyles}
          onMouseDown={this.handleArtboardMouseDown}
          pointerEvents="bounding-box"
          key="artboard"
          fill="none"
          x="0"
          y="0"
          width={`${width}`}
          height={`${height}`}
        />
        {children}
      </g>
    );
  }
}
