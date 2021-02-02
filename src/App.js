// @flow
/* eslint-disable import/no-extraneous-dependencies */
import React, { PureComponent, Fragment } from 'react';
import PenIcon from '@material-ui/icons/Edit';
import CropIcon from '@material-ui/icons/Crop';
import DragIcon from '@material-ui/icons/OpenWith';
import RectIcon from '@material-ui/icons/CropLandscape';
import EllipseIcon from '@material-ui/icons/PanoramaFishEye';
import LineIcon from '@material-ui/icons/Remove';
import TextIcon from '@material-ui/icons/FormatColorText';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import { CompactPicker } from 'react-color';
import UncontrolledEditor from './lib/editor/uncontrolled';
import BackgroundSource from './lib/background-source';
import Drawables, { type Drawable } from './lib/editor/drawables';
import Cropable, { type Crop } from './lib/editor/cropables';
import Artboard from './lib/editor/artboard';
import resizeDrawable from './lib/editor/drawables/resize';
import translateDrawable from './lib/editor/drawables/translate';
import { PixelRatioContext } from './lib/editor';

type State = {
  drawMode: null | 'pen' | 'rect' | 'ellipse' | 'line' | 'crop',
  rotation: 0 | 90 | 180 | 270,
  strokeColorPickerOpen: boolean,
  strokeColor: string,
  strokeWidth: number,
  fontSize: number,
  fillColorPickerOpen: boolean,
  fillColor: string,
  drawables: Array<Drawable>,
  selectedDrawable: ?string,
  crop: ?Crop
};

const colorStyle = {
  borderRadius: '3px',
  margin: '10px',
  width: '20px',
};

const iconStyles = {
  color: 'black',
  margin: '10px',
  background: 'transparent',
  border: 0,
};

const canvasStyle = {
  border: '1px solid black',
  background: 'gray',
  flex: '1',
  height: 'auto',
  width: 'auto',
};

const colors = [
  '#00005b',
  '#00008f',
  '#2425aa',
  '#3032c1',
  '#3b3fd8',
  '#494df4',
  '#000000',
  '#333333',
  '#5f5f5f',
  '#7f7f7f',
  '#999999',
  '#e5e5e5',
  '#f5f5f5',
  '#fafafa',
  '#ffffff',
  '#ff1721',
  '#f07662',
  '#ec4d33',
  '#b5d0ee',
  '#fad6de',
  '#9fd9b4',
  '#f0ff93',
  '#fcd385',
  '#9fbeaf',
  '#668980',
  '#00adc6',
  '#027180',
  '#f1afc6',
  '#9190ac',
  '#ddbe65',
  '#914146',
  '#1cc54e',
  '#c91432',
];

export default class App extends PureComponent<{}, State> {
  constructor(props) {
    super(props);
    this.state = {
      drawMode: null,
      rotation: 0,
      strokeColorPickerOpen: false,
      strokeColor: '#00005b',
      strokeWidth: 10,
      fontSize: 16,
      fillColorPickerOpen: false,
      fillColor: '#00008f',
      drawables: [],
      selectedDrawable: null,
      crop: null,
      text: ['Hans Muster', 'Musterstrasse 18', '8400 Winterthur'],
    };
  }

  renderLoading = () => (
    <div>renderLoading</div>
  );

  renderError = () => (
    <div>renderError</div>
  );

  selectDrawMode = (drawMode: null | 'pen' | 'rect' | 'ellipse' | 'line' | 'crop') => () => {
    this.setState({ drawMode, selectedDrawable: null });
  }

  rotate = (degrees: 90 | -90) => () => {
    this.setState((state) => {
      if (degrees >= 0) {
        return {
          // $FlowFixMe
          rotation: (state.rotation + degrees) % 360,
        };
      }

      const rotation = state.rotation + degrees;
      return {
        // $FlowFixMe
        rotation: rotation < 0 ? 270 : rotation,
      };
    });
  }

  handleTextChange = (e: any) => {
    this.setState({ text: e.target.value });
  }

  handleFillColorChange = (e: any) => {
    this.setState({ fillColor: e.hex });
  }

  handleStrokeColorChange = (e: any) => {
    this.setState({ strokeColor: e.hex });
  }

  toggleFillColorPicker = () => {
    this.setState((state) => ({ fillColorPickerOpen: !state.fillColorPickerOpen }));
  }

  toggleStrokeColorPicker = () => {
    this.setState((state) => ({ strokeColorPickerOpen: !state.strokeColorPickerOpen }));
  }

  handleStrokeWidthChange = (e: Event) => {
    // $FlowFixMe
    this.setState({ strokeWidth: e.target.value });
  }

  handleFontSizeChange = (e: Event) => {
    // $FlowFixMe
    this.setState({ fontSize: e.target.value });
  }

  handleSelectDrawable = (selectedDrawable: ?string) => {
    this.setState({ selectedDrawable });
  }

  handleDragStart = () => {
    this.setState({ selectedDrawable: null });
  }

  handleResizeDrawable = (
    e: MouseEvent,
    id: string,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => {
    this.setState((state) => ({
      drawables: state.drawables.map((item) => {
        if (item.id === id) {
          return resizeDrawable(item, handleX, handleY, newX, newY);
        }

        return item;
      }),
    }));
  }

  handleRemoveDrawable = (removedDrawable: string) => {
    this.setState((state) => ({
      drawables: state.drawables.filter((item) => item.id !== removedDrawable),
    }));
  }

  handleDrawableTranslate = (id: string, x: number, y: number) => {
    this.setState((state) => ({
      drawables: state.drawables.map((i) => {
        if (i.id === id) {
          return translateDrawable(i, x, y);
        }

        return i;
      }),
    }));
  }

  handleDrawEnd = (drawable: Drawable) => {
    this.setState((state) => {
      const drawables = [...state.drawables, drawable];

      return {
        drawables,
        selectedDrawable: drawable.id,
      };
    });
  }

  pdfjs = async () => {
    const pdfjs = (await import('pdfjs-dist'));
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
    return pdfjs;
  }

  handleCropEnd = (crop: Crop) => {
    this.setState({
      crop,
    });
  }

  handleConfirmCrop = () => {
    this.setState({ drawMode: null });
  }

  handleCropTranslate = (x: number, y: number) => {
    this.setState((state) => {
      if (!state.crop) {
        return {};
      }
      return {
        crop: {
          ...state.crop,
          x: state.crop.x + x,
          y: state.crop.y + y,
        },
      };
    });
  }

  handleRemoveCrop = () => {
    this.setState({
      crop: null,
    });
  }

  onDrawStart = () => {
    this.setState({ selectedDrawable: null });
  }

  onCropStart = () => {
    this.setState({ selectedDrawable: null });
  }

  handleResizeCrop = (
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => {
    this.setState((state) => {
      if (!state.crop) {
        return {};
      }

      let {
        x,
        y,
        width,
        height,
      } = state.crop;

      if (handleX === 'left') {
        width = Math.max(10, width - (newX - x));
        x = newX;
      } else if (handleX === 'right') {
        width = Math.max(10, newX - x);
      }

      if (handleY === 'top') {
        height = Math.max(10, height - (newY - y));
        y = newY;
      } else if (handleY === 'bottom') {
        height = Math.max(10, newY - y);
      }
      return {
        crop: {
          ...state.crop,
          x,
          y,
          height,
          width,
        },
      };
    });
  }

  render() {
    return (
      <BackgroundSource source="/pdf-test.pdf" pdfjs={this.pdfjs} hqPdf>
        {(source) => {
          if (source.state === 'LOADING') {
            return (<div>Loading...</div>);
          }

          if (source.state === 'ERROR') {
            return (<div>Error...</div>);
          }

          const {
            drawMode,
            rotation,
            fillColor,
            fillColorPickerOpen,
            strokeColor,
            strokeWidth,
            strokeColorPickerOpen,
            drawables,
            selectedDrawable,
            crop,
            text,
            fontSize,
          } = this.state;

          return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexShrink: '0' }}>
                {
                  drawMode != null && (
                    <>
                      {(drawMode === 'rect' || drawMode === 'ellipse') && (
                        <Fragment key="fill">
                          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                          <button
                            type="button"
                            key="fillColor"
                            style={{ ...colorStyle, backgroundColor: fillColor }}
                            onClick={this.toggleFillColorPicker}
                          />
                          {fillColorPickerOpen && (
                            <CompactPicker key="fillColorPicker" colors={colors} onChange={this.handleFillColorChange} />
                          )}
                        </Fragment>
                      )}
                      <input name="strokeWidth" key="strokeWidth" type="number" value={strokeWidth} onChange={this.handleStrokeWidthChange} />
                      {drawMode === 'text' && (<input name="fontSize" key="fontSize" type="number" value={fontSize} onChange={this.handleFontSizeChange} />)}
                      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                      <button
                        type="button"
                        key="strokeColor"
                        style={{ ...colorStyle, backgroundColor: strokeColor }}
                        onClick={this.toggleStrokeColorPicker}
                      />
                      {strokeColorPickerOpen && (
                        <CompactPicker key="strokeColorPicker" colors={colors} onChange={this.handleStrokeColorChange} />
                      )}
                      <span key="spacer" style={{ margin: '10px', borderRight: '1px solid #333' }} />
                    </>
                  )
                }
                <DragIcon style={{ ...iconStyles, color: drawMode === null ? 'blue' : 'black' }} onClick={this.selectDrawMode(null)} />
                <PenIcon style={{ ...iconStyles, color: drawMode === 'pen' ? 'blue' : 'black' }} onClick={this.selectDrawMode('pen')} />
                <RectIcon style={{ ...iconStyles, color: drawMode === 'rect' ? 'blue' : 'black' }} onClick={this.selectDrawMode('rect')} />
                <EllipseIcon style={{ ...iconStyles, color: drawMode === 'ellipse' ? 'blue' : 'black' }} onClick={this.selectDrawMode('ellipse')} />
                <LineIcon style={{ ...iconStyles, color: drawMode === 'line' ? 'blue' : 'black' }} onClick={this.selectDrawMode('line')} />
                <CropIcon style={{ ...iconStyles, color: drawMode === 'crop' ? 'blue' : 'black' }} onClick={this.selectDrawMode('crop')} />
                <TextIcon style={{ ...iconStyles, color: drawMode === 'text' ? 'blue' : 'black' }} onClick={this.selectDrawMode('text')} />
                <span style={{ margin: '10px', borderRight: '1px solid #333' }} />
                <RotateLeftIcon style={iconStyles} onClick={this.rotate(-90)} />
                <RotateRightIcon style={iconStyles} onClick={this.rotate(90)} />
              </div>
              <UncontrolledEditor
                drawMode={drawMode}
                allowDrag={drawMode === null}
                backgroundUrl={source.url}
                width={source.width}
                height={source.height}
                rotate={rotation}
                canvasSytle={canvasStyle}
              >
                <PixelRatioContext.Consumer>
                  {(pixelRatio: number) => (
                    <>
                      <Artboard
                        key="artboard"
                        drawMode={drawMode}
                        width={source.width}
                        height={source.height}
                        text={text}
                        onDrawEnd={this.handleDrawEnd}
                        onCropEnd={this.handleCropEnd}
                        drawingFill={fillColor}
                        drawingStroke={strokeColor}
                        drawingStrokeWidth={strokeWidth}
                        onDrawStart={this.onDrawStart}
                        onCropStart={this.onCropStart}
                        fontSize={fontSize}
                      >
                        <Drawables
                          diStrokeWidth={5 * pixelRatio}
                          drawables={drawables}
                          onSelectDrawable={this.handleSelectDrawable}
                          selectedDrawable={selectedDrawable}
                          onResizeDrawable={this.handleResizeDrawable}
                          onDrawableTranslate={this.handleDrawableTranslate}
                          onRemoveDrawable={this.handleRemoveDrawable}
                          width={source.width}
                          height={source.height}
                          fontSize={fontSize}
                        />
                        <Cropable
                          key="cropable"
                          diStrokeWidth={5 * pixelRatio}
                          width={source.width}
                          height={source.height}
                          crop={crop}
                          fontSize={fontSize}
                          canTransformCrop={drawMode === 'crop'}
                          onResizeCrop={this.handleResizeCrop}
                          onCropTranslate={this.handleCropTranslate}
                          onRemoveCrop={this.handleRemoveCrop}
                          onConfirmCrop={this.handleConfirmCrop}
                        />
                      </Artboard>
                    </>
                  )}
                </PixelRatioContext.Consumer>
              </UncontrolledEditor>
            </div>
          );
        }}
      </BackgroundSource>
    );
  }
}
