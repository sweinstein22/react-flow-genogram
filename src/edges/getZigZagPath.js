import { range } from "lodash";

export const getZigZagPath = ({ sourceX, sourceY, targetX, targetY }) => {
  const sourceLeftOfTarget = sourceX < targetX;
  const sourceAboveTarget = sourceY < targetY;

  const points = [];
  const numberOfSteps = Math.ceil(
    (Math.abs(sourceX - targetX) + Math.abs(sourceY - targetY)) / 15
  );
  const xStep = Math.abs(sourceX - targetX) / numberOfSteps;
  const yStep = Math.abs(sourceY - targetY) / numberOfSteps;
  range(0, numberOfSteps + 2).forEach((step) => {
    points.push({
      x: sourceX + xStep * step * (sourceLeftOfTarget ? 1 : -1),
      y: sourceY + yStep * step * (sourceAboveTarget ? 1 : -1),
    });
  });

  let x, y, lx, ly, mx, my, path;
  for (let i = 0; i < points.length; i++) {
    x = points[i].x;
    y = points[i].y;
    if (i === 0) {
      path = "M " + x + " " + y + " L";
      continue;
    }
    lx = points[i - 1].x;
    ly = points[i - 1].y;
    mx = (lx + x) / 2;
    my = (ly + y) / 2;

    const scale = Math.sqrt(0.75);
    mx += scale * (y - ly);
    my -= scale * (x - lx);

    path += " " + mx + " " + my;
    path += " " + x + " " + y;
  }
  return path;
};
