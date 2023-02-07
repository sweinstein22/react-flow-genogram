import React from "react";
import { getSmoothStepPath } from "reactflow";

const LiftedTargetPositionEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  targetHandleId,
  sourcePosition,
  targetPosition,
  label,
  markerEnd,
}) => {
  let path;

  let targetYAdjusted = targetY;
  if (targetHandleId.includes("connectorNode")) {
    targetYAdjusted = sourceY - 45; // 0.65 * Math.abs(sourceY - targetY);
  }

  const [edgePath] = getSmoothStepPath({
    borderRadius: 0,
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY: targetYAdjusted,
    targetPosition,
  });
  path = edgePath;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={path}
        markerEnd={markerEnd}
      />
      <text>
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {label}
        </textPath>
      </text>
    </>
  );
};

export default LiftedTargetPositionEdge;
