// @flow
import React, { PureComponent, type Node } from 'react';
import ArtboardBase from './base';

export type Crop = {
  x: number,
  y: number,
  width: number,
  height: number,
}

type Props = {
  width: number,
  height: number,
  onCropEnd: (crop: Crop) => void,
  onCropStart: () => void,
  minWidth: number,
  minHeight: number,
  children: Node,
};

type Coords = { x: number, y: number };

type State = {
  startCoord?: Coords | null,
  currentCoord?: Coords | null,
};

export default class ArtboardCut extends PureComponent<Props, State> {
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
    this.props.onCropStart();
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
      this.props.onCropEnd(rectBounds);
    }
    this.setState({ startCoord: null, currentCoord: null });
  }

  render() {
    const {
      width,
      height,
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
          <path
            d={`M0 0 H${width} V${height} H0 Z M${rectBounds.x} ${rectBounds.y} H${rectBounds.x + rectBounds.width} V${rectBounds.y + rectBounds.height} H${rectBounds.x} Z`}
            fillRule="evenodd"
            fill="rgba(0,0,0,0.7)"
          />
        )}
      </ArtboardBase>
    );
  }
}
