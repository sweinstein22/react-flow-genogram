import { range } from "lodash";
import { useCallback } from "react";
import { useStore, getStraightPath } from "reactflow";
import { getZigZagPath } from "./getZigZagPath.js";
import { statusMap } from "./styleMaps.js";

import { getEdgeParams } from "./FloatingEdgeUtils.js";

function FloatingEdge({ id, source, target, markerEnd, data }) {
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source])
  );
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target])
  );

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const {
    numberOfLines = 1,
    style,
    symbolStyle,
    symbol,
    zigZagStyle,
  } = statusMap[data?.status] || {};

  const sourceLeftOfTarget = sx < tx;
  const sourceAboveTarget = sy < ty;

  const edgePaths = [];
  range(0, numberOfLines).forEach((num) => {
    const offset = num * 5;
    const [edgePath] = getStraightPath({
      sourceX: sx + offset * (sourceLeftOfTarget ? -1 : 1),
      sourceY: sy + offset * (sourceAboveTarget ? 1 : -1),
      targetX: tx + offset * (sourceLeftOfTarget ? -1 : 1),
      targetY: ty + offset * (sourceAboveTarget ? 1 : -1),
    });
    edgePaths.push(edgePath);
  });

  return (
    <>
      {edgePaths.map((path, index) => (
        <path
          key={`${source}-${target}-${index}`}
          id={id}
          className="react-flow__edge-path"
          d={path}
          markerEnd={markerEnd}
          style={style}
        />
      ))}
      {zigZagStyle && (
        <path
          id={id}
          className="react-flow__edge-path"
          d={getZigZagPath({
            sourceX: sx,
            sourceY: sy,
            targetX: tx,
            targetY: ty,
          })}
          markerEnd={markerEnd}
          style={zigZagStyle}
        />
      )}
      <text style={{ ...symbolStyle, baselineShift: "-30%" }}>
        <textPath href={`#${id}`} startOffset="40%" textAnchor="center">
          {symbol}
        </textPath>
      </text>
    </>
  );
}

export default FloatingEdge;
