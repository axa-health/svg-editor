// @flow
import React, { PureComponent } from 'react';
import DragIndicator from './drag-indicator';

type Props = {|
  id: string,
  text: $ReadOnlyArray<string>,
  x: number,
  y: number,
  selected: boolean,
  strokeWidth: number,
  onSelect: (e: MouseEvent, id: string) => void,
  onDragIndicatorMouseDown: (e: MouseEvent, id: string) => void,
  dragIndicatorStrokeWidth: number,
  canSelectDrawable: boolean,
|};

type State = {
  height: number,
  width: number,
}

export default class TextDrawable extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
    };
    this.textRef = React.createRef();
  }

  componentDidMount() {
    if (this.textRef.current) {
      this.setState({
        width: this.textRef.current.getBBox().width,
        height: this.textRef.current.getBBox().height,
      });
    }
  }

  handleClick = (e: MouseEvent) => {
    this.props.onSelect(e, this.props.id);
  };

  handleDragIndicatorMouseDown = (e: MouseEvent) => {
    this.props.onDragIndicatorMouseDown(e, this.props.id);
  };

  render() {
    const {
      id,
      text,
      x,
      y,
      selected,
      strokeWidth,
      dragIndicatorStrokeWidth: diStrokeWidth,
      canSelectDrawable,
    } = this.props;

    const {
      height,
      width,
    } = this.state;

    if (!text.length) {
      return null;
    }

    const strokeWidthHalf = strokeWidth / 2;

    const diX = x - strokeWidthHalf;
    const diY = y - strokeWidthHalf;
    const diWidth = width + strokeWidth;
    const diHeight = height + strokeWidth;

    return (
      <g>
        <text
          ref={this.textRef}
          x={x}
          alignmentBaseline="hanging"
          y={y}
          onClick={this.handleClick}
          pointerEvents="visible-painted"
          style={{ cursor: canSelectDrawable ? 'pointer' : undefined }}
        >
          {text.map((line) => (
            <tspan x={x} dy={16}>{line}</tspan>
          ))}
        </text>
        {selected && (
          <DragIndicator
            id={id}
            onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
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
