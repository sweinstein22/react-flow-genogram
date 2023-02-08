import React from "react";
import { getSmoothStepPath } from "reactflow";

const DivorcedEdge = ({ id, sourceX, targetX, markerEnd, ...props }) => {
  const sourceRightOfTarget = sourceX > targetX;
  const [edgePath] = getSmoothStepPath({
    borderRadius: 0,
    sourceX: sourceX + (sourceRightOfTarget ? -5 : 5),
    targetX: targetX + (sourceRightOfTarget ? -5 : 5),
    ...props,
  });

  const baselineShift = sourceRightOfTarget ? undefined : "sub";
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
        <textPath href={`#${id}`} startOffset="90%" textAnchor="center">
          /
        </textPath>
      </text>
    </>
  );
};

export default DivorcedEdge;
