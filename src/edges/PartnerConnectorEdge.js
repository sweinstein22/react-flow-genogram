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
  const addIcon = data?.targetHandle === "connectorNodeLeft";
  const [edgePath] = getSmoothStepPath({
    borderRadius: 0,
    sourceY: sourceY - 10,
    sourceX: sourceX + (sourceRightOfTarget ? -5 : 5),
    targetX: targetX + (sourceRightOfTarget ? -5 : 5),
    ...props,
  });

  const relationshipMap = {
    divorced: {
      style: { stroke: "red" },
      symbolStyle: { stroke: "red", baselineShift: "sub" },
      symbol: "/ /",
    },
    engaged: {
      style: { strokeDasharray: "5,5", stroke: "blue" },
    },
    "love-affair": {
      style: { strokeDasharray: "5,5", stroke: "hotpink" },
      symbolStyle: {
        stroke: "hotpink",
        fill: "hotpink",
        baselineShift: "-30%",
      },
      symbol: "♥",
    },
  };

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
        <text style={symbolStyle}>
          <textPath href={`#${id}`} startOffset="90%" textAnchor="center">
            {symbol}
          </textPath>
        </text>
      )}
    </>
  );
};

export default PartnerConnectorEdge;
