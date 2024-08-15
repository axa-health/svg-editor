import type {
  ChangeEvent,
  CSSProperties,
  FunctionComponent,
  MouseEvent as ReactMouseEvent,
} from 'react';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import {
  MdCrop as CropIcon,
  MdCropLandscape as RectIcon,
  MdEdit as PenIcon,
  MdFormatColorText as TextIcon,
  MdOpenWith as DragIcon,
  MdPanoramaFishEye as EllipseIcon,
  MdRemove as LineIcon,
  MdRotateLeft as RotateLeftIcon,
  MdRotateRight as RotateRightIcon,
} from 'react-icons/md';
import type { ColorResult } from 'react-color';
import { CompactPicker } from 'react-color';
import UncontrolledEditor from '../lib/editor/uncontrolled';
import BackgroundSource from '../lib/background-source';
import Drawables, { type Drawable } from '../lib/editor/drawables';
import Cropable, { type Crop } from '../lib/editor/cropables';
import Artboard from '../lib/editor/artboard';
import resizeDrawable from '../lib/editor/drawables/resize';
import translateDrawable from '../lib/editor/drawables/translate';
import { PixelRatioContext } from '../lib/editor';

const colorStyle: CSSProperties = {
  borderRadius: '3px',
  margin: '10px',
  width: '20px',
};

const iconStyles: CSSProperties = {
  color: 'black',
  margin: '10px',
  background: 'transparent',
  border: 0,
};

const canvasStyle: CSSProperties = {
  border: '1px solid black',
  background: 'gray',
  flex: '1',
  height: 'auto',
  width: 'auto',
};

const containerStyle: CSSProperties = { height: '100%', display: 'flex', flexDirection: 'column' };

const flexShrinkStyle: CSSProperties = { display: 'flex', flexShrink: '0' };

const spacerStyle: CSSProperties = { margin: '10px', borderRight: '1px solid #333' };

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

const pdfjs = async () => {
  const pdfJsLib = await import('pdfjs-dist');
  pdfJsLib.GlobalWorkerOptions.workerSrc = (
    await import('pdfjs-dist/build/pdf.worker?worker&url')
  ).default;
  return pdfJsLib;
};

const App: FunctionComponent = () => {
  const [drawMode, setDrawMode] = useState<
    'pen' | 'rect' | 'ellipse' | 'line' | 'crop' | 'text' | null
  >(null);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [strokeColorPickerOpen, setStrokeColorPickerOpen] = useState<boolean>(false);
  const [strokeColor, setStrokeColor] = useState<string>('#027180');
  const [strokeWidth, setStrokeWidth] = useState<number>(10);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fillColorPickerOpen, setFillColorPickerOpen] = useState<boolean>(false);
  const [fillColor, setFillColor] = useState<string>('#00adc6');
  const [drawables, setDrawables] = useState<ReadonlyArray<Drawable>>([]);
  const [selectedDrawable, setSelectedDrawable] = useState<string | undefined>(undefined);
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [text] = useState<ReadonlyArray<string>>([
    'Hans Muster',
    'Musterstrasse 18',
    '8400 Winterthur',
  ]);

  const selectDrawMode = useCallback(
    (drawModeToUse: null | 'pen' | 'rect' | 'ellipse' | 'line' | 'crop' | 'text') => () => {
      setDrawMode(drawModeToUse);
      setSelectedDrawable(undefined);
    },
    [],
  );

  const rotate = useCallback(
    (degrees: 90 | -90) => () => {
      setRotation((currentRotation) => {
        if (degrees >= 0) {
          return ((currentRotation + degrees) % 360) as 0 | 90 | 180 | 270;
        }

        const newRotation = currentRotation + degrees;
        return (newRotation < 0 ? 270 : newRotation) as 0 | 90 | 180 | 270;
      });
    },
    [],
  );

  const handleFillColorChange = useCallback((color: ColorResult) => {
    setFillColor(color.hex);
  }, []);

  const handleStrokeColorChange = useCallback((color: ColorResult) => {
    setStrokeColor(color.hex);
  }, []);

  const toggleFillColorPicker = useCallback(() => {
    setFillColorPickerOpen((prevOpen) => !prevOpen);
  }, []);

  const toggleStrokeColorPicker = useCallback(() => {
    setStrokeColorPickerOpen((prevOpen) => !prevOpen);
  }, []);

  const handleStrokeWidthChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setStrokeWidth(parseInt(e.target.value, 10));
  }, []);

  const handleFontSizeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFontSize(parseInt(e.target.value, 10));
  }, []);

  const handleSelectDrawable = useCallback((id?: string) => {
    setSelectedDrawable(id);
  }, []);

  const handleResizeDrawable = useCallback(
    (
      e: ReactMouseEvent,
      id: string,
      handleX: 'left' | 'right',
      handleY: 'top' | 'bottom',
      newX: number,
      newY: number,
    ) => {
      setDrawables((currentDrawables) =>
        currentDrawables.map((drawable) => {
          if (drawable.id === id) {
            return resizeDrawable(drawable, handleX, handleY, newX, newY);
          }
          return drawable;
        }),
      );
    },
    [],
  );

  const handleRemoveDrawable = useCallback((removedDrawable: string) => {
    setDrawables((currentDrawables) =>
      currentDrawables.filter((drawable) => drawable.id !== removedDrawable),
    );
  }, []);

  const handleDrawableTranslate = useCallback((id: string, x: number, y: number) => {
    setDrawables((currentDrawables) =>
      currentDrawables.map((drawable) => {
        if (drawable.id === id) {
          return translateDrawable(drawable, x, y);
        }
        return drawable;
      }),
    );
  }, []);

  const handleDrawEnd = useCallback((drawable: Drawable) => {
    setDrawables((currentDrawables) => [...currentDrawables, drawable]);
  }, []);

  const handleCropEnd = useCallback((newCrop: Crop) => {
    setCrop(newCrop);
  }, []);

  const handleConfirmCrop = useCallback(() => {
    setDrawMode(null);
  }, []);

  const handleCropTranslate = useCallback((x: number, y: number) => {
    setCrop((currentCrop) => {
      if (!currentCrop) {
        return undefined;
      }
      return {
        ...currentCrop,
        x: currentCrop.x + x,
        y: currentCrop.y + y,
      };
    });
  }, []);

  const handleRemoveCrop = useCallback(() => {
    setCrop(undefined);
  }, []);

  const onDrawStart = useCallback(() => {
    setSelectedDrawable(undefined);
  }, []);

  const onCropStart = useCallback(() => {
    setSelectedDrawable(undefined);
  }, []);

  const handleResizeCrop = useCallback(
    (handleX: 'left' | 'right', handleY: 'top' | 'bottom', newX: number, newY: number) => {
      setCrop((currentCrop) => {
        if (!currentCrop) {
          return undefined;
        }

        let { x, y, width, height } = currentCrop;

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
          ...currentCrop,
          x,
          y,
          height,
          width,
        };
      });
    },
    [],
  );

  const fillColorStyle: CSSProperties = useMemo(
    () => ({ ...colorStyle, backgroundColor: fillColor }),
    [fillColor],
  );

  const strokeColorStyle: CSSProperties = useMemo(
    () => ({ ...colorStyle, backgroundColor: strokeColor }),
    [strokeColor],
  );

  const dragIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === null ? 'blue' : 'black' }),
    [drawMode],
  );

  const penIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'pen' ? 'blue' : 'black' }),
    [drawMode],
  );

  const rectIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'rect' ? 'blue' : 'black' }),
    [drawMode],
  );

  const ellipseIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'ellipse' ? 'blue' : 'black' }),
    [drawMode],
  );

  const lineIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'line' ? 'blue' : 'black' }),
    [drawMode],
  );

  const cropIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'crop' ? 'blue' : 'black' }),
    [drawMode],
  );

  const textIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'text' ? 'blue' : 'black' }),
    [drawMode],
  );

  return (
    <BackgroundSource source="/pdf-test.pdf" pdfjs={pdfjs} hqPdf>
      {(source) => {
        if (source.state === 'LOADING') {
          return <div>Loading...</div>;
        }

        if (source.state === 'ERROR') {
          return <div>Error... {source.error.code}</div>;
        }

        return (
          <div style={containerStyle}>
            <div style={flexShrinkStyle}>
              {drawMode != null && (
                <>
                  {(drawMode === 'rect' || drawMode === 'ellipse') && (
                    <Fragment key="fill">
                      <button
                        type="button"
                        key="fillColor"
                        style={fillColorStyle}
                        onClick={toggleFillColorPicker}
                      />
                      {fillColorPickerOpen && (
                        <CompactPicker
                          key="fillColorPicker"
                          colors={colors}
                          onChange={handleFillColorChange}
                        />
                      )}
                    </Fragment>
                  )}
                  <input
                    name="strokeWidth"
                    key="strokeWidth"
                    type="number"
                    value={strokeWidth}
                    onChange={handleStrokeWidthChange}
                  />
                  {drawMode === 'text' && (
                    <input
                      name="fontSize"
                      key="fontSize"
                      type="number"
                      value={fontSize}
                      onChange={handleFontSizeChange}
                    />
                  )}
                  <button
                    type="button"
                    key="strokeColor"
                    style={strokeColorStyle}
                    onClick={toggleStrokeColorPicker}
                  />
                  {strokeColorPickerOpen && (
                    <CompactPicker
                      key="strokeColorPicker"
                      colors={colors}
                      onChange={handleStrokeColorChange}
                    />
                  )}
                  <span key="spacer" style={spacerStyle} />
                </>
              )}
              <DragIcon style={dragIconStyle} onClick={selectDrawMode(null)} />
              <PenIcon style={penIconStyle} onClick={selectDrawMode('pen')} />
              <RectIcon style={rectIconStyle} onClick={selectDrawMode('rect')} />
              <EllipseIcon style={ellipseIconStyle} onClick={selectDrawMode('ellipse')} />
              <LineIcon style={lineIconStyle} onClick={selectDrawMode('line')} />
              <CropIcon style={cropIconStyle} onClick={selectDrawMode('crop')} />
              <TextIcon style={textIconStyle} onClick={selectDrawMode('text')} />
              <span style={spacerStyle} />
              <RotateLeftIcon style={iconStyles} onClick={rotate(-90)} />
              <RotateRightIcon style={iconStyles} onClick={rotate(90)} />
            </div>
            <UncontrolledEditor
              drawMode={drawMode}
              allowDrag={drawMode === null}
              backgroundUrl={source.url}
              width={source.width}
              height={source.height}
              rotate={rotation}
              canvasStyle={canvasStyle}
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
                      onDrawEnd={handleDrawEnd}
                      onCropEnd={handleCropEnd}
                      drawingFill={fillColor}
                      drawingStroke={strokeColor}
                      drawingStrokeWidth={strokeWidth}
                      onDrawStart={onDrawStart}
                      onCropStart={onCropStart}
                      fontSize={fontSize}
                      minHeight={50}
                      minWidth={100}
                    >
                      <Drawables
                        diStrokeWidth={5 * pixelRatio}
                        drawables={drawables}
                        onSelectDrawable={handleSelectDrawable}
                        selectedDrawable={selectedDrawable}
                        onResizeDrawable={handleResizeDrawable}
                        onDrawableTranslate={handleDrawableTranslate}
                        onRemoveDrawable={handleRemoveDrawable}
                        width={source.width}
                        height={source.height}
                      />
                      <Cropable
                        key="cropable"
                        diStrokeWidth={5 * pixelRatio}
                        width={source.width}
                        height={source.height}
                        crop={crop}
                        canTransformCrop={drawMode === 'crop'}
                        onResizeCrop={handleResizeCrop}
                        onCropTranslate={handleCropTranslate}
                        onRemoveCrop={handleRemoveCrop}
                        onConfirmCrop={handleConfirmCrop}
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
};

export default App;
