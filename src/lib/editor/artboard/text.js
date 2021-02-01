// @flow
import React, { PureComponent, type Node } from 'react';
import type { Drawable } from '../drawables';
import ArtboardBase from './base';

type Props ={
  drawingFill: string,
  drawingStroke: string,
  drawingStrokeWidth: number,
  text: $ReadOnlyArray<string>,
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

export default class ArtboardText extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getTextBounds = ({ startCoord, currentCoord }: {
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

    if (width < this.props.minWidth && height < this.props.minHeight) {
      return null;
    }

    return {
      x: lowerX,
      y: lowerY,
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

    const textBounds = this.getTextBounds({ startCoord: start, currentCoord: current });

    if (textBounds) {
      const id = String(Date.now());
      this.props.onDrawEnd({
        type: 'text',
        id,
        ...textBounds,
        text: this.props.text,
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
      children,
      text,
    } = this.props;

    const textBounds = this.getTextBounds(this.state);

    return (
      <ArtboardBase
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        width={width}
        height={height}
      >
        {children}
        {textBounds && (
          <text
            {...textBounds}
            letterSpacing="1"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="16px"
            alignmentBaseline="hanging"
            fill={drawingFill}
          >
            {text}
          </text>
        )}
      </ArtboardBase>
    );
  }
}
