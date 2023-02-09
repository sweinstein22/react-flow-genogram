import React from "react";
import { getSmoothStepPath } from "reactflow";

const ChildEdge = ({ id, sourceY, targetY, markerEnd, data, ...props }) => {
  const [edgePath] = getSmoothStepPath({
    borderRadius: 0,
    sourceY: sourceY - 5,
    targetY: targetY + 10,
    centerY: targetY - 10,
    ...props,
  });

  const relationshipStyleMap = {
    adoptive: { strokeDasharray: "5,5" },
    estranged: { strokeDasharray: "5,5", stroke: "red" },
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        style={relationshipStyleMap[data?.relationship]}
        d={edgePath}
        markerEnd={markerEnd}
      />
    </>
  );
};

export default ChildEdge;
