// @flow

import React, { PureComponent, type Node } from 'react';
import memoize from 'memoize-one';

type Crop = {
  x: number,
  y: number,
  height: number,
  width: number,
}

export type Props = {
  // source info
  backgroundUrl: string,
  width: number,
  height: number,
  crop?: ?Crop,
  // zoom, rotate, translate
  zoom: number,
  translateX: number,
  translateY: number,
  rotate: 0 | 90 | 180 | 270,
  onZoom: (newZoom: number) => void,
  minZoom?: number,
  maxZoom?: number,

  // drag support
  allowDrag: boolean,
  onDragStart?: () => void,
  onDragEnd?: () => void,
  onDrag: (x: number, y: number) => void,

  children?: Node,

  canvasSytle?: ?any,
  canvasClassName?: ?string,
  drawMode: ?string,
};

type State = {
  heightRatio: number,
  // selectedItem?: string | null,
  // drawingPoints?: Array<DrawingPoint> | null,
};

export const PixelRatioContext: React$Context<number> = React.createContext(1);

export default class Editor extends PureComponent<$Exact<Props>, State> {
  referenceRectZoom: { current: null | Element } = React.createRef();

  referenceRectNoZoom: { current: null | Element } = React.createRef();

  makeZoomAndTranslateTransform = memoize((
    zoom: number,
    imageWidth: number,
    imageHeight: number,
    translateX: number,
    translateY: number,
    rotate: 0 | 90 | 180 | 270,
  ) => {
    const matrix = [zoom, 0, 0, zoom, translateX, translateY];

    if (rotate === 0) {
      matrix[4] -= (imageWidth / 2) * (zoom - 1);
      matrix[5] -= (imageHeight / 2) * (zoom - 1);
    } else if (rotate === 90) {
      // 1 0 0 1 x y -> 0 1 -1 0 x y
      matrix[1] = matrix[0]; // eslint-disable-line prefer-destructuring
      matrix[0] = 0;
      matrix[2] = -matrix[3];
      matrix[3] = 0;

      matrix[4] += imageHeight + ((imageHeight / 2) * (zoom - 1));
      matrix[5] -= (imageWidth / 2) * (zoom - 1);
    } else if (rotate === 180) {
      // 1 0 0 1 x y -> -1 0 0 -1 x y
      matrix[0] *= -1;
      matrix[3] *= -1;

      matrix[4] += imageWidth + ((imageWidth / 2) * (zoom - 1));
      matrix[5] += imageHeight + ((imageHeight / 2) * (zoom - 1));
    } else if (rotate === 270) {
      // 1 0 0 1 x y -> 0 -1 1 0 x y
      matrix[1] = -matrix[0];
      matrix[0] = 0;
      matrix[2] = matrix[3]; // eslint-disable-line prefer-destructuring
      matrix[3] = 0;

      matrix[4] -= ((imageHeight / 2) * (zoom - 1));
      matrix[5] += imageWidth + ((imageWidth / 2) * (zoom - 1));
    }

    return `matrix(${matrix[0]}, ${matrix[1]}, ${matrix[2]}, ${matrix[3]}, ${matrix[4]}, ${matrix[5]})`;
  });

  makeCanvasSytle = memoize((base: Object, allowDrag: boolean) => ({
    cursor: allowDrag ? 'move' : null,
    ...base,
  }));

  constructor(props: $Exact<Props>) {
    super(props);
    this.state = { heightRatio: 1 };
  }

  componentDidMount() {
    window.addEventListener('resize', this.recalcPixelRatio);
    this.recalcPixelRatio();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recalcPixelRatio);
  }

  recalcPixelRatio = () => {
    const { current: referenceRectZoom } = this.referenceRectZoom;

    if (!referenceRectZoom) {
      console.log('Missing referenceRectZoom, can\'t calc pixelRatio...'); // eslint-disable-line no-console
      return;
    }

    this.setState({
      heightRatio: this.props.height / referenceRectZoom.getBoundingClientRect().height,
    });
  }

  svgMouseDownHandler = (e: MouseEvent) => {
    if (this.props.allowDrag) {
      const referenceRect = this.referenceRectNoZoom.current;

      if (!referenceRect) {
        console.error('ReferenceRectNoZoom not available!'); // eslint-disable-line no-console
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

      e.preventDefault();
      e.stopPropagation();

      if (this.props.onDragStart) {
        this.props.onDragStart();
      }

      let lastCoords = transformPoint(e);

      const mouseMoveHandler = (e2: MouseEvent) => {
        const newCoords = transformPoint(e2);

        this.props.onDrag(
          this.props.translateX + newCoords.x - lastCoords.x,
          this.props.translateY + newCoords.y - lastCoords.y,
        );

        lastCoords = newCoords;
      };

      const mouseUpHandler = () => {
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', mouseUpHandler);

        if (this.props.onDragEnd) {
          this.props.onDragEnd();
        }
      };

      window.addEventListener('mousemove', mouseMoveHandler);
      window.addEventListener('mouseup', mouseUpHandler);
    }
  };

  handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const {
      maxZoom,
      minZoom,
      zoom,
    } = this.props;

    const newZoom = Math.min(
      maxZoom || 4,
      Math.max(
        minZoom || 1,
        zoom - (e.deltaY / 100),
      ),
    );

    this.props.onZoom(newZoom);
  };

  render() {
    const {
      backgroundUrl,
      width: imageWidth,
      height: imageHeight,
      zoom,
      translateX,
      translateY,
      rotate,
      canvasSytle,
      canvasClassName,
      crop,
      drawMode,
      allowDrag,
    } = this.props;
    const {
      heightRatio,
    } = this.state;

    let width: number;
    let height: number;
    if (rotate === 90 || rotate === 270) {
      width = imageHeight;
      height = imageWidth;
    } else {
      width = imageWidth;
      height = imageHeight;
    }

    let vHeight = height;
    let vWidth = width;
    let vX = 0;
    let vY = 0;

    if (crop && drawMode !== 'crop') {
      const {
        height: cropHeight,
        width: cropWidth,
        x,
        y,
      } = crop;

      vHeight = cropHeight;
      vWidth = cropWidth;
      vX = x;
      vY = y;
    }

    return (
      <svg
        viewBox={`${vX} ${vY} ${vWidth} ${vHeight}`}
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        onMouseDown={this.svgMouseDownHandler}
        onWheel={this.handleWheel}
        style={this.makeCanvasSytle(canvasSytle, allowDrag)}
        className={canvasClassName}
      >
        <style>
          {`
            @keyframes dash {
              to {
                stroke-dashoffset: 100;
              }
            }
          `}
        </style>
        {/* invisible rect to determine actual width/height and convert
          stuff to viewBox coordinates */}
        <rect
          x={`${vX}`}
          y={`${vY}`}
          width={`${vWidth}`}
          height={`${vHeight}`}
          ref={this.referenceRectNoZoom}
          fill="none"
        />
        {/* the zoomable part of the svg */}
        <g
          transform={this.makeZoomAndTranslateTransform(
            zoom,
            imageWidth,
            imageHeight,
            translateX,
            translateY,
            rotate,
          )}
        >
          <image
            xlinkHref={backgroundUrl}
            x="0"
            y="0"
            height={`${imageHeight}`}
            width={`${imageWidth}`}
            ref={this.referenceRectZoom}
          />
          <PixelRatioContext.Provider value={heightRatio / zoom}>
            {this.props.children}
          </PixelRatioContext.Provider>
        </g>
      </svg>
    );
  }
}
