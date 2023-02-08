import { sampleGraphqlHumanRelationshipResponse } from "./sample-graphql-response.js";
import parseGraphqlData from "./parseGraphqlData.js";
import addFictiveKinEdge from "../edgeUtils/addFictiveKinEdge.js";

const processNodes = ({
  nodes,
  nodeHeight,
  nodeWidth,
  parentChildRelationships,
  grandparentChildRelationships,
  partnerRelationships,
  siblingRelationships,
  fictiveKinRelationships,
}) => {
  const filteredNodesById = {};
  nodes
    .filter(({ hidden }) => !hidden)
    .forEach((node) => {
      filteredNodesById[node.id] = node;
    });

  const edgesByNodeId = {};
  const connectorNodesById = {};

  const addConnectorNode = ({ id, position }) => {
    if (!connectorNodesById[id]) {
      connectorNodesById[id] = {
        id: id,
        type: "connectorNode",
        position,
      };
    }
  };

  const addPartnerEdge = ({ humanId1, humanId2, relationship }) => {
    const human1NodePosition = filteredNodesById[humanId1].position;
    const human2NodePosition = filteredNodesById[humanId2].position;

    const xOffset = Math.abs(human1NodePosition.x - human2NodePosition.x) / 2;
    let leftId;
    let rightId;
    let connectorNodeId;
    if (human1NodePosition.x > human2NodePosition.x) {
      leftId = humanId2;
      rightId = humanId1;
      connectorNodeId = `${humanId2}-${humanId1}-connector`;
      addConnectorNode({
        id: connectorNodeId,
        position: {
          x: human2NodePosition.x + xOffset + nodeWidth / 4,
          y: human2NodePosition.y + nodeHeight + 25,
        },
      });
    } else {
      leftId = humanId1;
      rightId = humanId2;
      connectorNodeId = `${humanId1}-${humanId2}-connector`;
      addConnectorNode({
        id: connectorNodeId,
        position: {
          x: human1NodePosition.x + xOffset + nodeWidth / 4,
          y: human1NodePosition.y + nodeHeight + 25,
        },
      });
    }

    edgesByNodeId[`e${leftId}-${rightId}-connector`] = {
      id: `e${leftId}-${rightId}-connector`,
      source: leftId,
      target: connectorNodeId,
      sourceHandle: "partner",
      targetHandle: "connectorNodeLeft",
      type: relationship === "divorced" ? "divorced" : "partnerConnector",
    };
    edgesByNodeId[`e${rightId}-${leftId}-connector`] = {
      id: `e${rightId}-${leftId}-connector`,
      source: rightId,
      target: connectorNodeId,
      sourceHandle: "partner",
      targetHandle: "connectorNodeRight",
      type: relationship === "divorced" ? "divorced" : "partnerConnector",
    };
  };

  // Partner Relationships
  Object.values(partnerRelationships).forEach(
    ({ humanId1, humanId2, relationship }) => {
      addPartnerEdge({ humanId1, humanId2, relationship });
    }
  );

  // Generate Nodes and Edges for Fictive Kin Relationships
  Object.values(fictiveKinRelationships).forEach(
    ({ humanId1, humanId2, label }) => {
      const edgeId = `e${humanId1}-${humanId2}`;
      edgesByNodeId[edgeId] = addFictiveKinEdge({
        edgeId,
        humanId1,
        humanId2,
        label,
      });
    }
  );

  return {
    nodes: [...nodes, ...Object.values(connectorNodesById)],
    edges: Object.values(edgesByNodeId),
  };
};

const processDynamicNodes = ({ nodes, nodeHeight, nodeWidth }) => {
  const parsedData = parseGraphqlData(sampleGraphqlHumanRelationshipResponse);
  return processNodes({ nodes, nodeHeight, nodeWidth, ...parsedData });
};

export default processDynamicNodes;
