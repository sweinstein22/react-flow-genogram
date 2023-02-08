import { sampleGraphqlHumanRelationshipResponse } from "./sample-graphql-response.js";
import parseGraphqlData from "./parseGraphqlData.js";
import addFictiveKinEdge from "../edgeUtils/addFictiveKinEdge.js";

const processNodes = ({
  nodes,
  nodeHeight,
  nodeWidth,
  childParentRelationships,
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

  const edgesById = {};
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

  const addPartnerEdge = ({
    humanId1,
    humanId2,
    relationship,
    partnerCounts,
  }) => {
    const human1NodePosition = filteredNodesById[humanId1].position;
    const human2NodePosition = filteredNodesById[humanId2].position;
    const partnerCount = partnerCounts[humanId1] + partnerCounts[humanId2];

    // Determine the center point between the pair of nodes
    let xOffset = Math.abs(human1NodePosition.x - human2NodePosition.x) / 2;
    // Shift the offset out further if the nodes are too close together
    // This happens in the grandparent as parent case
    if (xOffset < 10) {
      xOffset = xOffset + nodeWidth / 2;
    }

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
          y: human2NodePosition.y + nodeHeight + 14 * partnerCount,
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
          y: human1NodePosition.y + nodeHeight + 14 * partnerCount,
        },
      });
    }

    edgesById[`e${leftId}-${rightId}-connector`] = {
      id: `e${leftId}-${rightId}-connector`,
      source: leftId,
      target: connectorNodeId,
      sourceHandle: "partner",
      targetHandle: "connectorNodeLeft",
      type: relationship === "divorced" ? "divorced" : "partnerConnector",
    };
    edgesById[`e${rightId}-${leftId}-connector`] = {
      id: `e${rightId}-${leftId}-connector`,
      source: rightId,
      target: connectorNodeId,
      sourceHandle: "partner",
      targetHandle: "connectorNodeRight",
      type: relationship === "divorced" ? "divorced" : "partnerConnector",
    };
  };

  const addSingleParentEdge = ({ parentId, childId }) => {
    edgesById[`e${parentId}-${childId}`] = {
      id: `e${parentId}-${childId}`,
      source: parentId,
      target: childId,
      sourceHandle: "parent",
      targetHandle: "child",
      type: "childEdge",
    };
  };

  const addCoParentEdges = ({ parentId1, parentId2, childId }) => {
    const connectorNode =
      connectorNodesById[`${parentId1}-${parentId2}-connector`] ||
      connectorNodesById[`${parentId2}-${parentId1}-connector`];

    if (connectorNode) {
      edgesById[`e${parentId1}-${parentId2}-${childId}`] = {
        id: `e${parentId1}-${parentId2}-${childId}`,
        source: connectorNode.id,
        target: childId,
        sourceHandle: "connectorNodeBottom",
        targetHandle: "child",
        type: "childEdge",
      };
    } else {
      addSingleParentEdge({ parentId: parentId1, childId });
      addSingleParentEdge({ parentId: parentId2, childId });
    }
  };

  // Partner Relationships
  const partnerCounts = {};
  Object.values(partnerRelationships).forEach(
    ({ humanId1, humanId2, relationship }) => {
      partnerCounts[humanId1] = (partnerCounts[humanId1] || 0) + 1;
      partnerCounts[humanId2] = (partnerCounts[humanId2] || 0) + 1;
      addPartnerEdge({ humanId1, humanId2, relationship, partnerCounts });
    }
  );

  // Child Parent Relationships
  Object.values(childParentRelationships).forEach((parents) => {
    if (parents.length === 1) {
      const { parentId, childId } = parents[0];
      addSingleParentEdge({ parentId, childId });
    } else {
      for (let i = 0; i < parents.length - 1; i++) {
        const { parentId: parentId1, childId } = parents[i];
        const { parentId: parentId2 } = parents[i + 1];
        addCoParentEdges({ parentId1, parentId2, childId });
      }

      // parents.forEach(({ parentId, childId }, index) => {
      //   for (let i = index + 1; i < parents.length; i++) {
      //     const { parentId: parentId2 } = parents[i];
      //     addCoParentEdges({ parentId1: parentId, parentId2, childId });
      //   }
      // });
    }
  });

  // Sibling Relationships
  Object.values(siblingRelationships).forEach(({ humanId1, humanId2 }) => {
    if (
      !childParentRelationships[humanId1] ||
      !childParentRelationships[humanId2]
    ) {
      const edgeId = `e${humanId1}-${humanId2}`;
      edgesById[edgeId] = {
        id: edgeId,
        source: humanId1,
        target: humanId2,
        sourceHandle: "sibling",
        targetHandle: "sibling",
        type: "step",
      };
    }
  });

  // Fictive Kin Relationships
  Object.values(fictiveKinRelationships).forEach(
    ({ humanId1, humanId2, label }) => {
      const edgeId = `e${humanId1}-${humanId2}`;
      edgesById[edgeId] = addFictiveKinEdge({
        edgeId,
        humanId1,
        humanId2,
        label,
      });
    }
  );

  return {
    nodes: [...nodes, ...Object.values(connectorNodesById)],
    edges: Object.values(edgesById),
  };
};

const processDynamicNodes = ({ nodes, nodeHeight, nodeWidth }) => {
  const parsedData = parseGraphqlData(sampleGraphqlHumanRelationshipResponse);
  return processNodes({ nodes, nodeHeight, nodeWidth, ...parsedData });
};

export default processDynamicNodes;
