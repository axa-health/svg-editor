// @flow
import React, { PureComponent, type Node } from 'react';
import type { Drawable } from '../drawables';
import ArtboardBase from './base';

type Props ={
  drawingFill: string,
  drawingStroke: string,
  drawingStrokeWidth: number,
  width: number,
  height: number,
  onDrawEnd: (drawable: Drawable) => void,
  onDrawStart: () => void,
  minWidth: number,
  minHeight: number,
  children?: Node,
};

type Coords = { x: number, y: number };

type State = {
  startCoord?: Coords | null,
  currentCoord?: Coords | null,
};

export default class ArtboardRect extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getRectBounds = ({ startCoord, currentCoord }: {
    startCoord: ?Coords,
    currentCoord: ?Coords,
  }) => {
    if (!startCoord || !currentCoord) {
      return null;
    }

    const lowerX = Math.min(startCoord.x, currentCoord.x);
    const lowerY = Math.min(startCoord.y, currentCoord.y);
    const higherX = Math.max(startCoord.x, currentCoord.x);
    const higherY = Math.max(startCoord.y, currentCoord.y);

    const width = higherX - lowerX;
    const height = higherY - lowerY;

    if (width === 0 || height === 0) {
      return null;
    }
    if (width < this.props.minWidth || height < this.props.minHeight) {
      return null;
    }

    return {
      x: lowerX,
      y: lowerY,
      width,
      height,
    };
  }

  onMouseDown = ({ start }: { start: Coords }) => {
    this.props.onDrawStart();
    this.setState({ startCoord: start });
  }

  onMouseMove = ({ current, start }: {
    current: Coords,
    start: Coords,
  }) => {
    this.setState({ startCoord: start, currentCoord: current });
  }

  onMouseUp = ({ current, start }: {
    current: Coords,
    start: Coords,
  }) => {
    this.setState({ startCoord: start, currentCoord: current });

    const rectBounds = this.getRectBounds({ startCoord: start, currentCoord: current });

    if (rectBounds) {
      const id = String(Date.now());
      this.props.onDrawEnd({
        type: 'rect',
        id,
        ...rectBounds,
        fill: this.props.drawingFill,
        stroke: this.props.drawingStroke,
        strokeWidth: this.props.drawingStrokeWidth,
      });
    }
    this.setState({ startCoord: null, currentCoord: null });
  }

  render() {
    const {
      width,
      height,
      drawingFill,
      drawingStroke,
      drawingStrokeWidth,
      children,
    } = this.props;

    const rectBounds = this.getRectBounds(this.state);

    return (
      <ArtboardBase
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        width={width}
        height={height}
      >
        {children}
        {rectBounds && (
          <rect
            key="rect"
            {...rectBounds}
            fill={drawingFill}
            stroke={drawingStroke}
            strokeWidth={drawingStrokeWidth}
          />
        )}
      </ArtboardBase>
    );
  }
}
