import React from "react";
import { getSmoothStepPath } from "reactflow";

const ChildEdge = ({ id, sourceY, targetY, markerEnd, ...props }) => {
  const [edgePath] = getSmoothStepPath({
    borderRadius: 0,
    sourceY: sourceY - 5,
    targetY: targetY + 10,
    centerY: targetY - 10,
    ...props,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
    </>
  );
};

export default ChildEdge;
