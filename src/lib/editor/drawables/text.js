// @flow
import React, { PureComponent, type Ref } from 'react';
import DragIndicator from './drag-indicator';

type Props = {|
  id: string,
  text: $ReadOnlyArray<string>,
  x: number,
  y: number,
  selected: boolean,
  fontSize: number,
  fill: string,
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
  textRef: Ref<any>;

  constructor(props: Props) {
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
      dragIndicatorStrokeWidth: diStrokeWidth,
      canSelectDrawable,
      fontSize,
      fill,
    } = this.props;

    const {
      height,
      width,
    } = this.state;

    if (text && !text.length) {
      return null;
    }

    const strokeWidthHalf = diStrokeWidth / 2;

    const diX = x - strokeWidthHalf;
    const diY = y - strokeWidthHalf;
    const diWidth = width + diStrokeWidth;
    const diHeight = height + diStrokeWidth;

    return (
      <g>
        <text
          ref={this.textRef}
          x={x}
          y={y}
          alignmentBaseline="hanging"
          letterSpacing="1"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={`${fontSize}px`}
          onClick={this.handleClick}
          pointerEvents="visible-painted"
          fill={fill}
          style={{ cursor: canSelectDrawable ? 'pointer' : undefined }}
        >
          {text.map((line, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <tspan key={`${line}-${i}`} x={x} dy={fontSize}>{line}</tspan>
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
