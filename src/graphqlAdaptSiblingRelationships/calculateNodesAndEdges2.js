// Test data trying to leverage only one on one relationship information from the "database"

import {
  sampleGraphqlHumanRelationshipResponse,
  sampleGraphqlHumanResponse,
} from "./sample-graphql-response2.js";
import { isEmpty } from "lodash";
import parseGraphqlData from "./parseGraphqlData.js";

const generateNodesAndEdges = ({
  partnerRelationships,
  parentChildRelationships,
  childParentRelationships,
  grandparentChildRelationships,
  siblingRelationships,
  fictiveKinRelationships,
}) => {
  const nodesById = {};
  const dynamicEdges = {};
  const staticEdges = {};

  const addNode = ({ id, hidden, connector }) => {
    if (!nodesById[id]) {
      nodesById[id] = {
        id: id,
        hidden,
        type: connector ? "connectorNode" : "personNode",
        data: sampleGraphqlHumanResponse[id] || { name: "here" },
        position: { x: 0, y: 0 },
      };
    }
  };

  const addHiddenParentChildEdge = ({ parentId, childId }) => {
    const edgeId = `${parentId}-${childId}`;
    dynamicEdges[edgeId] = {
      id: edgeId,
      source: parentId,
      target: childId,
      sourceHandle: "parent",
      targetHandle: "child",
      type: "step",
      hidden: true,
    };
  };

  const addHumanConnectorEdge = ({
    humanId,
    humanHandle,
    connectorId,
    connectorHandle,
    hidden,
  }) => {
    addNode({ id: connectorId, connector: true });
    const edgeId = `e${humanId}-${connectorId}`;
    dynamicEdges[edgeId] = {
      id: edgeId,
      source: humanId,
      target: connectorId,
      sourceHandle: humanHandle,
      targetHandle: connectorHandle,
      hidden,
      type: "liftedTarget",
    };
  };

  // Partner Relationships
  Object.values(partnerRelationships).forEach(
    ({ humanId1, humanId2, relationship }) => {
      // Add node for each human and a connector node between the two
      addNode({ id: humanId1 });
      addNode({ id: humanId2 });

      // Add a connector node between the partners
      const connectorNodeId = `${humanId1}-${humanId2}-connector`;
      addHumanConnectorEdge({
        humanId: humanId1,
        humanHandle: "partnerRight",
        connectorId: connectorNodeId,
        connectorHandle: "connectorNodeTop",
        hidden: true,
      });
      addHumanConnectorEdge({
        humanId: humanId2,
        humanHandle: "partnerLeft",
        connectorId: connectorNodeId,
        connectorHandle: "connectorNodeTop",
        hidden: true,
      });

      // Add an edge between the two partners directly
      const edgeId = `${humanId1}-${humanId2}`;
      staticEdges[edgeId] = {
        id: edgeId,
        source: humanId1,
        target: humanId2,
        sourceHandle: "partnerLeft",
        targetHandle: "partnerLeft",
        type: relationship === "divorced" ? "divorced" : "straight",
      };

      // Add any shared children to the connector node
      const childrenForParent1 = (parentChildRelationships[humanId1] || []).map(
        ({ childId }) => childId
      );
      const childrenForParent2 = (parentChildRelationships[humanId2] || []).map(
        ({ childId }) => childId
      );
      // Probably need this logic to be more robust/only filter based on id
      const sharedChildren = childrenForParent1.filter((childId) =>
        childrenForParent2.includes(childId)
      );

      sharedChildren.forEach((childId) => {
        addNode({ id: childId });
        addHiddenParentChildEdge({ parentId: humanId1, childId });
        addHiddenParentChildEdge({ parentId: humanId2, childId });
        addHumanConnectorEdge({
          humanId: childId,
          humanHandle: "child",
          connectorId: connectorNodeId,
          connectorHandle: "connectorNodeBottom",
          type: "step",
        });
      });
    }
  );

  return {
    nodes: Object.values(nodesById),
    dynamicEdges: Object.values(dynamicEdges),
    staticEdges: Object.values(staticEdges),
  };
};

const sampleGraphqlNodesAndEdges = () => {
  const parsedData = parseGraphqlData(sampleGraphqlHumanRelationshipResponse);
  return generateNodesAndEdges(parsedData);
};

export default sampleGraphqlNodesAndEdges;
