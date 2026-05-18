import type {
  ChangeEvent,
  CSSProperties,
  FunctionComponent,
  MouseEvent as ReactMouseEvent,
} from 'react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ColorResult } from 'react-color';
import { BlockPicker } from 'react-color';
import { createPortal } from 'react-dom';
import {
  MdCrop as CropIcon,
  MdOpenWith as DragIcon,
  MdPanoramaFishEye as EllipseIcon,
  MdRemove as LineIcon,
  MdEdit as PenIcon,
  MdCropLandscape as RectIcon,
  MdRotateLeft as RotateLeftIcon,
  MdRotateRight as RotateRightIcon,
  MdFormatColorText as TextIcon,
} from 'react-icons/md';
import BackgroundSource from '../lib/background-source';
import { PixelRatioContext } from '../lib/editor';
import Artboard from '../lib/editor/artboard';
import Cropable, { type Crop } from '../lib/editor/cropables';
import Drawables, { type Drawable } from '../lib/editor/drawables';
import resizeDrawable from '../lib/editor/drawables/resize';
import translateDrawable from '../lib/editor/drawables/translate';
import UncontrolledEditor from '../lib/editor/uncontrolled';

const colorStyle: CSSProperties = {
  border: '1px solid #cbd5e1',
  width: '28px',
  height: '28px',
  cursor: 'pointer',
  borderRadius: 0,
};

const iconStyles: CSSProperties = {
  color: '#475569',
  margin: 0,
  padding: '6px',
  borderRadius: 0,
  background: 'transparent',
  border: 0,
  cursor: 'pointer',
  transition: 'background-color 140ms ease, color 140ms ease',
};

const canvasStyle: CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: 0,
  background: '#f8fafc',
  flex: '1',
  minHeight: 0,
  width: '100%',
  boxShadow: 'none',
  overflow: 'hidden',
};

const containerStyle: CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '10px',
  background: '#ffffff',
  boxSizing: 'border-box',
};

const flexShrinkStyle: CSSProperties = {
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  flexWrap: 'nowrap',
  gap: '8px',
  padding: '8px 0',
  minHeight: '46px',
  borderRadius: 0,
  border: 0,
  borderBottom: '1px solid #dbe3ee',
  background: 'transparent',
  overflowX: 'auto',
  overflowY: 'hidden',
};

const spacerStyle: CSSProperties = {
  width: '1px',
  height: '24px',
  margin: '0 4px',
  background: '#d5deea',
};

const numberInputStyle: CSSProperties = {
  height: '30px',
  borderRadius: 0,
  border: '1px solid #cbd5e1',
  padding: '0 8px',
};

const pickerAnchorStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  lineHeight: 0,
  verticalAlign: 'top',
};

const pickerPopoverStyle: CSSProperties = {
  position: 'fixed',
  transform: 'translateX(-50%)',
  zIndex: 999,
};

type PickerPosition = { top: number; left: number };

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
  const fillPickerRef = useRef<HTMLDivElement>(null);
  const strokePickerRef = useRef<HTMLDivElement>(null);
  const fillPopoverRef = useRef<HTMLDivElement>(null);
  const strokePopoverRef = useRef<HTMLDivElement>(null);
  const [fillPickerPosition, setFillPickerPosition] = useState<PickerPosition | undefined>();
  const [strokePickerPosition, setStrokePickerPosition] = useState<PickerPosition | undefined>();
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
    setStrokeColorPickerOpen(false);
  }, []);

  const toggleStrokeColorPicker = useCallback(() => {
    setStrokeColorPickerOpen((prevOpen) => !prevOpen);
    setFillColorPickerOpen(false);
  }, []);

  const updatePickerPositions = useCallback(() => {
    const fillRect = fillPickerRef.current?.getBoundingClientRect();
    if (fillRect) {
      setFillPickerPosition({
        top: fillRect.bottom + 10,
        left: fillRect.left + fillRect.width / 2,
      });
    }

    const strokeRect = strokePickerRef.current?.getBoundingClientRect();
    if (strokeRect) {
      setStrokePickerPosition({
        top: strokeRect.bottom + 10,
        left: strokeRect.left + strokeRect.width / 2,
      });
    }
  }, []);

  useEffect(() => {
    if (!fillColorPickerOpen && !strokeColorPickerOpen) {
      return;
    }

    updatePickerPositions();

    const handleReposition = () => updatePickerPositions();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [fillColorPickerOpen, strokeColorPickerOpen, updatePickerPositions]);

  useEffect(() => {
    const onWindowMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (!target) {
        return;
      }

      const clickedInsideFill = fillPickerRef.current?.contains(target);
      const clickedInsideStroke = strokePickerRef.current?.contains(target);
      const clickedInsideFillPopover = fillPopoverRef.current?.contains(target);
      const clickedInsideStrokePopover = strokePopoverRef.current?.contains(target);

      if (
        !clickedInsideFill &&
        !clickedInsideStroke &&
        !clickedInsideFillPopover &&
        !clickedInsideStrokePopover
      ) {
        setFillColorPickerOpen(false);
        setStrokeColorPickerOpen(false);
      }
    };

    window.addEventListener('mousedown', onWindowMouseDown);

    return () => {
      window.removeEventListener('mousedown', onWindowMouseDown);
    };
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
      _e: ReactMouseEvent,
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
    () => ({ ...iconStyles, color: drawMode === null ? '#2563eb' : '#475569' }),
    [drawMode],
  );

  const penIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'pen' ? '#2563eb' : '#475569' }),
    [drawMode],
  );

  const rectIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'rect' ? '#2563eb' : '#475569' }),
    [drawMode],
  );

  const ellipseIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'ellipse' ? '#2563eb' : '#475569' }),
    [drawMode],
  );

  const lineIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'line' ? '#2563eb' : '#475569' }),
    [drawMode],
  );

  const cropIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'crop' ? '#2563eb' : '#475569' }),
    [drawMode],
  );

  const textIconStyle: CSSProperties = useMemo(
    () => ({ ...iconStyles, color: drawMode === 'text' ? '#2563eb' : '#475569' }),
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
              {drawMode != null && (
                <>
                  <span key="spacer" style={spacerStyle} />
                  {(drawMode === 'rect' || drawMode === 'ellipse') && (
                    <Fragment key="fill">
                      <div ref={fillPickerRef} style={pickerAnchorStyle}>
                        <button
                          type="button"
                          key="fillColor"
                          style={fillColorStyle}
                          onClick={toggleFillColorPicker}
                        />
                      </div>
                    </Fragment>
                  )}
                  <input
                    name="strokeWidth"
                    key="strokeWidth"
                    type="number"
                    value={strokeWidth}
                    onChange={handleStrokeWidthChange}
                    style={numberInputStyle}
                  />
                  {drawMode === 'text' && (
                    <input
                      name="fontSize"
                      key="fontSize"
                      type="number"
                      value={fontSize}
                      onChange={handleFontSizeChange}
                      style={numberInputStyle}
                    />
                  )}
                  <div ref={strokePickerRef} style={pickerAnchorStyle}>
                    <button
                      type="button"
                      key="strokeColor"
                      style={strokeColorStyle}
                      onClick={toggleStrokeColorPicker}
                    />
                  </div>
                </>
              )}
            </div>
            {fillColorPickerOpen &&
              fillPickerPosition &&
              createPortal(
                <div
                  ref={fillPopoverRef}
                  style={{
                    ...pickerPopoverStyle,
                    top: fillPickerPosition.top,
                    left: fillPickerPosition.left,
                  }}
                >
                  <BlockPicker
                    key="fillColorPicker"
                    colors={colors}
                    color={fillColor}
                    onChange={handleFillColorChange}
                  />
                </div>,
                document.body,
              )}
            {strokeColorPickerOpen &&
              strokePickerPosition &&
              createPortal(
                <div
                  ref={strokePopoverRef}
                  style={{
                    ...pickerPopoverStyle,
                    top: strokePickerPosition.top,
                    left: strokePickerPosition.left,
                  }}
                >
                  <BlockPicker
                    key="strokeColorPicker"
                    colors={colors}
                    color={strokeColor}
                    onChange={handleStrokeColorChange}
                  />
                </div>,
                document.body,
              )}
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
                      minHeight={0}
                      minWidth={0}
                    >
                      <Drawables
                        diStrokeWidth={3.5 * pixelRatio}
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
                        diStrokeWidth={3.5 * pixelRatio}
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
