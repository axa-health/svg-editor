export type Coords = { x: number; y: number };

type ClientPoint = {
  clientX: number;
  clientY: number;
};

export const createSvgPointTransformer = (element: SVGGraphicsElement) => {
  const svg = element.closest('svg');
  const inverseMatrix = element.getScreenCTM()?.inverse();

  if (!svg || !inverseMatrix) {
    return null;
  }

  return ({ clientX, clientY }: ClientPoint): Coords => {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;

    const transformedPoint = point.matrixTransform(inverseMatrix);
    return { x: transformedPoint.x, y: transformedPoint.y };
  };
};
