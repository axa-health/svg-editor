import React, { PureComponent } from 'react';
import Editor, { type Props as EditorProps } from '.';

export type Props = $Diff<EditorProps, {
  zoom: number,
  translateX: number,
  translateY: number,
  onDrag: (x: number, y: number) => void,
  onZoom: (zoom: number) => void,
}> & {
  initialZoom?: number,
  initialTranslateX?: number,
  initialTranslateY?: number,
  onZoom?: (zoom: number) => void,
};

type State = {|
  zoom: number,
  translateX: number,
  translateY: number,
  selectedDrawable?: string,
|};

export default class UncontrolledEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      zoom: props.initialZoom || 1,
      translateX: props.initialTranslateX || 0,
      translateY: props.initialTranslateY || 0,
    };
  }

  handleDrag = (x: number, y: number) => {
    this.setState({ translateX: x, translateY: y });
  }

  handleZoom = (zoom: number) => {
    this.setState({ zoom });
    if (this.props.onZoom) {
      this.props.onZoom(zoom);
    }
  }

  render() {
    const {
      zoom,
      translateX,
      translateY,
    } = this.state;
    const {
      initialZoom,
      initialTranslateX,
      initialTranslateY,
      onZoom,
      ...otherProps
    } = this.props;

    return (
      <Editor
        zoom={zoom}
        translateX={translateX}
        translateY={translateY}
        onDrag={this.handleDrag}
        onZoom={this.handleZoom}
        rotate={0}
        {...otherProps}
      />
    );
  }
}
