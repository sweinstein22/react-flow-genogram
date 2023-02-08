import React from "react";
import { getSmoothStepPath } from "reactflow";

const PartnerConnectorEdge = ({
  id,
  sourceX,
  targetX,
  markerEnd,
  ...props
}) => {
  const sourceRightOfTarget = sourceX > targetX;
  const [edgePath] = getSmoothStepPath({
    borderRadius: 0,
    sourceX: sourceX + (sourceRightOfTarget ? -5 : 5),
    targetX: targetX + (sourceRightOfTarget ? -5 : 5),
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

export default PartnerConnectorEdge;
