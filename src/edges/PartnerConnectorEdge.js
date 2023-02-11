import React from "react";
import { getSmoothStepPath } from "reactflow";
import { relationshipMap } from "./styleMaps";

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
  const addIcon = data?.targetHandle === "connectorNodeLeft";
  const [edgePath] = getSmoothStepPath({
    borderRadius: 0,
    sourceY: sourceY - 10,
    sourceX: sourceX + (sourceRightOfTarget ? -5 : 5),
    targetX: targetX + (sourceRightOfTarget ? -5 : 5),
    ...props,
  });

  const { style, symbolStyle, symbol } =
    relationshipMap[data?.relationship] || {};
  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        style={style}
        d={edgePath}
        markerEnd={markerEnd}
      />
      {addIcon && (
        <text style={{ ...symbolStyle, baselineShift: "-30%" }}>
          <textPath href={`#${id}`} startOffset="90%" textAnchor="center">
            {symbol}
          </textPath>
        </text>
      )}
    </>
  );
};

export default PartnerConnectorEdge;
