import React from "react";
import { getSmoothStepPath } from "reactflow";

const DivorcedEdge = ({ id, sourceX, targetX, markerEnd, ...props }) => {
  const [edgePath] = getSmoothStepPath({
    borderRadius: 0,
    sourceX,
    targetX,
    ...props,
  });

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
        <textPath href={`#${id}`} startOffset="50%" textAnchor="center">
          / /
        </textPath>
      </text>
    </>
  );
};

export default DivorcedEdge;
