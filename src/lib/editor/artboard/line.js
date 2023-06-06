// @flow
import React, { PureComponent, type Node } from 'react';
import type { Drawable } from '../drawables';
import ArtboardBase from './base';

type Props ={
  drawingStroke: string,
  drawingStrokeWidth: number,
  children: Node,
  width: number,
  height: number,
  onDrawEnd: (drawable: Drawable) => void,
  onDrawStart: () => void,
  minWidth: number,
  minHeight: number,
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

  getLinePoints = ({ startCoord, currentCoord }: {
    startCoord?: Coords | null,
    currentCoord?: Coords | null,
  }) => {
    if (!startCoord || !currentCoord) {
      return null;
    }
    return {
      x1: startCoord.x,
      y1: startCoord.y,
      x2: currentCoord.x,
      y2: currentCoord.y,
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

    const linePoints = this.getLinePoints({ startCoord: start, currentCoord: current });

    if (linePoints) {
      const id = String(Date.now());
      this.props.onDrawEnd({
        type: 'line',
        id,
        ...linePoints,
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
      drawingStroke,
      drawingStrokeWidth,
      children,
    } = this.props;

    const points = this.getLinePoints(this.state);

    return (
      <ArtboardBase
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        width={width}
        height={height}
      >
        {children}
        {points && (
          <line
            {...points}
            stroke={drawingStroke}
            strokeWidth={drawingStrokeWidth}
          />
        )}
      </ArtboardBase>
    );
  }
}
