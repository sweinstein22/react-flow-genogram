// Test data trying to leverage only one on one relationship information from the "database"

import {
  sampleGraphqlHumanRelationshipResponse,
  sampleGraphqlHumanResponse,
} from "./sample-graphql-response.js";

const parseGraphqlData = (data) => {
  const partnerRelationshipStatuses = ["married", "divorced", "partners"];
  const parentChildRelationships = {};
  const partnerRelationships = {};

  data.forEach(
    ({ humanId1, humanId2, relationship, emotionalRelationship }) => {
      // Parent Child Relationship
      if (relationship === "parent-child") {
        const currentChildren = parentChildRelationships[humanId1] || [];
        parentChildRelationships[humanId1] = [
          ...currentChildren,
          { id: humanId2, status: emotionalRelationship },
        ];
      }
      // Partner Relationship
      else if (partnerRelationshipStatuses.includes(relationship)) {
        // confirm that there isn't an existing permutation of the relationship represented yet
        // if we have good data this shouldn't be a problem, but better to safeguard!
        if (
          !(
            partnerRelationships[`${humanId1}-${humanId2}`] ||
            partnerRelationships[`${humanId2}-${humanId1}`]
          )
        ) {
          partnerRelationships[`${humanId1}-${humanId2}`] = {
            humanId1,
            humanId2,
            relationship,
          };
        }
      }
      // Sibling Relationship
      else if (relationship === "siblings") {
      }
    }
  );

  return { parentChildRelationships, partnerRelationships };
};

const generateNodesAndEdges = ({
  parentChildRelationships,
  partnerRelationships,
}) => {
  const nodesById = {};
  const edgesToGenerateDynamically = {};
  const edgesToAddAfterDynamicGeneration = {};

  const addNode = ({ id, hidden }) => {
    if (!nodesById[id]) {
      nodesById[id] = {
        id: id,
        hidden,
        type: "personNode",
        data: sampleGraphqlHumanResponse[id],
        position: { x: 0, y: 0 },
      };
    }
  };

  const addParentChildEdge = ({ edgeId, parentId, childId }) => {
    edgesToGenerateDynamically[edgeId] = {
      id: edgeId,
      source: parentId,
      target: childId,
      sourceHandle: "parent",
      targetHandle: "child",
      type: "step",
    };
  };

  // Generate Nodes and Edges for Parent/Child Relationships
  Object.entries(parentChildRelationships).forEach(([id, children]) => {
    // Add node for human whose data we are interpreting
    addNode({ id });

    children.forEach(({ id: childId, status }) => {
      // Add kinship edge between parent and child
      const edgeId = `e${id}-${childId}`;
      addParentChildEdge({ edgeId, parentId: id, childId });
      addNode({ id: childId });
    });
  });

  Object.entries(([id, { humanId1, humanId2, status }]) => {
    const parents = Object.keys(parentChildRelationships);
    // If at least one human is not a parent, indicating
    // these two people don't have children together
    if (!(parents.includes(humanId1) || parents.includes(humanId2))) {
      const phantomChildId = `${humanId1}-${humanId2}-phantomChild`;
      addNode({ id: phantomChildId, hidden: true });
      const edgeId = `e${humanId1}-${humanId2}`;
      addParentChildEdge({
        edgeId: `${edgeId}-phantomChild1`,
        parentId: humanId1,
        childId: phantomChildId,
      });
      addParentChildEdge({
        edgeId: `${edgeId}-phantomChild2`,
        parentId: humanId2,
        childId: phantomChildId,
      });

      edgesToAddAfterDynamicGeneration[edgeId] = {
        id: edgeId,
        source: humanId1,
        target: humanId2,
        sourceHandle: "partner",
        targetHandle: "partner",
        type: "step",
      };
    }
  });

  return {
    nodes: Object.values(nodesById),
    dynamicEdges: Object.values(edgesToGenerateDynamically),
    staticEdges: Object.values(edgesToAddAfterDynamicGeneration),
  };
};

const sampleGraphqlNodesAndEdges = () => {
  const parsedData = parseGraphqlData(sampleGraphqlHumanRelationshipResponse);
  return generateNodesAndEdges(parsedData);
};

export default sampleGraphqlNodesAndEdges;
