import React from "react";
import { getSmoothStepPath } from "reactflow";

const PartnerConnectorEdge = ({
  id,
  sourceY,
  sourceX,
  targetX,
  markerEnd,
  data,
  ...props
}) => {
  const sourceRightOfTarget = sourceX > targetX;
  const [edgePath] = getSmoothStepPath({
    borderRadius: 0,
    sourceY: sourceY - 10,
    sourceX: sourceX + (sourceRightOfTarget ? -5 : 5),
    targetX: targetX + (sourceRightOfTarget ? -5 : 5),
    ...props,
  });

  const relationshipStyleMap = {
    divorced: { stroke: "red" },
    engaged: { strokeDasharray: "5,5", stroke: "blue" },
    "love-affair": { strokeDasharray: "5,5", stroke: "hotpink" },
  };

  const baselineShift = sourceRightOfTarget ? undefined : "sub";
  const relationshipSymbolMap = {
    divorced: (
      <text style={{ stroke: "red", baselineShift }}>
        <textPath href={`#${id}`} startOffset="90%" textAnchor="center">
          /
        </textPath>
      </text>
    ),
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
      {relationshipSymbolMap[data?.relationship]}
    </>
  );
};

export default PartnerConnectorEdge;
