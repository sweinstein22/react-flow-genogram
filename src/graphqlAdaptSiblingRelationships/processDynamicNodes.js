import { sampleGraphqlHumanRelationshipResponse } from "./sample-graphql-response.js";
import parseGraphqlData from "./parseGraphqlData.js";
import addFictiveKinEdge from "../edgeUtils/addFictiveKinEdge.js";
import { isEmpty } from "lodash";

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

  const addPartnerEdge = (props) => {
    const { humanId1, humanId2, partnerCounts } = props;
    const human1NodePosition = filteredNodesById[humanId1].position;
    const human2NodePosition = filteredNodesById[humanId2].position;
    const partnerCount = partnerCounts[humanId1] + partnerCounts[humanId2];

    // Determine the center point between the pair of nodes
    let xOffset = Math.abs(human1NodePosition.x - human2NodePosition.x) / 2;
    // Shift the offset out further if the nodes are too close together
    // This happens in the grandparent as parent case
    if (xOffset < nodeWidth / 2) {
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
      type: "partnerConnector",
      data: props,
    };
    edgesById[`e${rightId}-${leftId}-connector`] = {
      id: `e${rightId}-${leftId}-connector`,
      source: rightId,
      target: connectorNodeId,
      sourceHandle: "partner",
      targetHandle: "connectorNodeRight",
      type: "partnerConnector",
      data: props,
    };
  };

  const addSingleParentEdge = (parent) => {
    const { parentId, childId } = parent;
    edgesById[`e${parentId}-${childId}`] = {
      id: `e${parentId}-${childId}`,
      source: parentId,
      target: childId,
      sourceHandle: "parent",
      targetHandle: "child",
      type: "childEdge",
      data: parent,
    };
  };

  const addCoParentEdges = ({ parent1, parent2, parents }) => {
    const { parentId: parentId1, childId } = parent1;
    const { parentId: parentId2 } = parent2;
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
        data: { ...parent1 },
      };
    } else {
      // Only add a line to the parent as a solo-entity if they aren't
      // already represented by another pairing
      const otherParents = parents.filter(
        ({ parentId }) => ![parentId1, parentId2].includes(parentId)
      );
      const partnerExistsForParent1 = otherParents.filter(
        ({ parentId }) =>
          partnerRelationships[`${parentId}-${parentId1}`] ||
          partnerRelationships[`${parentId1}-${parentId}`]
      );
      const partnerExistsForParent2 = otherParents.filter(
        ({ parentId }) =>
          partnerRelationships[`${parentId}-${parentId2}`] ||
          partnerRelationships[`${parentId2}-${parentId}`]
      );

      if (isEmpty(partnerExistsForParent1)) {
        addSingleParentEdge(parent1);
      }

      if (isEmpty(partnerExistsForParent2)) {
        addSingleParentEdge(parent2);
      }
    }
  };

  // Partner Relationships
  const partnerCounts = {};
  Object.values(partnerRelationships).forEach(
    ({ humanId1, humanId2, relationship, ...rest }) => {
      partnerCounts[humanId1] = (partnerCounts[humanId1] || 0) + 1;
      partnerCounts[humanId2] = (partnerCounts[humanId2] || 0) + 1;
      addPartnerEdge({
        humanId1,
        humanId2,
        relationship,
        partnerCounts,
        ...rest,
      });
    }
  );

  // Child Parent Relationships
  Object.values(childParentRelationships).forEach((parents) => {
    if (parents.length === 1) {
      addSingleParentEdge(parents[0]);
    } else {
      parents.forEach((parent1, index) => {
        for (let i = index + 1; i < parents.length; i++) {
          addCoParentEdges({
            parent1,
            parent2: parents[i],
            parents,
          });
        }
      });
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
