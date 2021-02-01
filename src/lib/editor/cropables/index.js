// @flow
import React, { PureComponent } from 'react';
import Square from './square';

export type Crop = {
  x: number,
  y: number,
  height: number,
  width: number,
}

type Props = {|
  height: number,
  width: number,
  canTransformCrop: boolean,
  onCropTranslate: (x: number, y: number) => void,
  onCropTranslateEnd?: (x: number, y: number) => void,
  onRemoveCrop?: () => void,
  onResizeCrop: (
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => void,
  onResizeCropEnd?: (
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => void,
  onConfirmCrop?: () => void,
  crop: ?Crop,
  diStrokeWidth: number,
|};

export default class Cropables extends PureComponent<Props> {
  referenceRect: ?Element = null;

  componentDidMount() {
    window.addEventListener('keydown', this.onWindowKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onWindowKeyPress);
  }

  onWindowKeyPress = (event: KeyboardEvent) => {
    const {
      onRemoveCrop,
      crop,
      canTransformCrop,
      onConfirmCrop,
    } = this.props;

    const eventTarget: HTMLElement = (event.target: any);
    const tagName = eventTarget.tagName.toLowerCase();

    if (
      tagName !== 'input'
      && tagName !== 'textarea'
      && !eventTarget.isContentEditable
      && crop
      && canTransformCrop
    ) {
      if (onConfirmCrop && event.key === 'Enter') {
        event.preventDefault();
        onConfirmCrop();
      }
      if (onRemoveCrop && (event.key === 'Backspace'
        || event.key === 'Delete'
        || event.key === 'Escape'
        || event.key === 'Esc')) {
        event.preventDefault();
        onRemoveCrop();
      }
    }
  };

  referenceRectRef = (el: ?Element) => {
    this.referenceRect = el;

    if (this.referenceRect) {
      // TODO: calc this
    }
  };

  handleDragIndicatorMouseDown = (e: MouseEvent) => {
    if (!this.props.canTransformCrop) {
      return;
    }

    const { referenceRect } = this;

    if (!referenceRect) {
      console.error('referenceRect not available!'); // eslint-disable-line no-console
      return;
    }

    const svg = referenceRect.closest('svg');

    if (!svg) {
      console.error('svg not found'); // eslint-disable-line no-console
      return;
    }

    // $FlowFixMe flow doesn't know artboard is an SVGGraphicsElement
    const inverseMatrix = referenceRect.getScreenCTM().inverse();

    const transformPoint = ({ clientX, clientY }) => {
      // $FlowFixMe flow doesn't know we get an SVG element
      let pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      pt = pt.matrixTransform(inverseMatrix);

      return { x: pt.x, y: pt.y };
    };

    e.stopPropagation();

    // move the drawable with the mouse
    let lastCoords = transformPoint(e);

    const mouseMoveHandler = (e2: MouseEvent) => {
      const currentCoords = transformPoint(e2);

      this.props.onCropTranslate(
        currentCoords.x - lastCoords.x,
        currentCoords.y - lastCoords.y,
      );

      lastCoords = currentCoords;
    };

    const { onCropTranslateEnd } = this.props;

    const mouseUpHandler = (e3: MouseEvent) => {
      const currentCoords = transformPoint(e3);
      if (onCropTranslateEnd) {
        onCropTranslateEnd(
          currentCoords.x - lastCoords.x,
          currentCoords.y - lastCoords.y,
        );
      }

      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  }

  handleRemoveCrop = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.props.onRemoveCrop) {
      this.props.onRemoveCrop();
    }
  };

  handleResizeHandleMouseDown = (e: MouseEvent, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => {
    if (!this.props.canTransformCrop) {
      return;
    }

    e.stopPropagation();

    const { referenceRect } = this;

    if (!referenceRect) {
      console.error('Reference rect not available!'); // eslint-disable-line no-console
      return;
    }

    const svg = referenceRect.closest('svg');

    if (!svg) {
      console.error('svg not found'); // eslint-disable-line no-console
      return;
    }

    // $FlowFixMe flow doesn't know artboard is an SVGGraphicsElement
    const inverseMatrix = referenceRect.getScreenCTM().inverse();

    const transformPoint = ({ clientX, clientY }) => {
      // $FlowFixMe flow doesn't know we get an SVG element
      let pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      pt = pt.matrixTransform(inverseMatrix);

      return { x: pt.x, y: pt.y };
    };

    const mouseMoveHandler = (e2) => {
      const newCoords = transformPoint(e2);
      this.props.onResizeCrop(
        handleX,
        handleY,
        newCoords.x,
        newCoords.y,
      );
    };

    const { onResizeCropEnd } = this.props;

    const mouseUpHandler = (e3: MouseEvent) => {
      const newCoords = transformPoint(e3);
      if (onResizeCropEnd) {
        onResizeCropEnd(
          handleX,
          handleY,
          newCoords.x,
          newCoords.y,
        );
      }

      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
  }

  render() {
    const {
      height,
      width,
      crop,
      canTransformCrop,
      diStrokeWidth,
    } = this.props;

    if (!crop) {
      return null;
    }

    const {
      x,
      y,
      height: cropHeight,
      width: cropWidth,
    } = crop;

    return (
      <g
        style={{ pointerEvents: canTransformCrop ? 'visiblePainted' : 'none' }}
      >
        <path
          d={`M0 0 H${width} V${height} H0 Z M${x} ${y} H${x + cropWidth} V${y + cropHeight} H${x} Z`}
          fillRule="evenodd"
          fill="rgba(0,0,0,0.5)"
        />
        <rect
          ref={this.referenceRectRef}
          x="0"
          y="0"
          width={`${width}`}
          height={`${height}`}
          fill="none"
        />
        {canTransformCrop && (
          <Square
            x={x}
            y={y}
            height={cropHeight}
            width={cropWidth}
            diStrokeWidth={diStrokeWidth}
            onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
            onResizeHandleMouseDown={this.handleResizeHandleMouseDown}
          />
        )}
      </g>
    );
  }
}
