import React from "react";
import { getStraightPath } from "reactflow";

const DivorcedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
}) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const startOffset = sourceX > targetX ? "25%" : "65%";
  const baselineShift = sourceX > targetX ? undefined : "sub";

  return (
    <>
      <path
        id={id}
        style={{ stroke: "red" }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text style={{ stroke: "red", baselineShift }}>
        <textPath href={`#${id}`} startOffset={startOffset} textAnchor="center">
          / /
        </textPath>
      </text>
    </>
  );
};

export default DivorcedEdge;
