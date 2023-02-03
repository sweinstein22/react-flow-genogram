// Test data trying to leverage only one on one relationship information from the "database"

import {
  sampleGraphqlHumanRelationshipResponse,
  sampleGraphqlHumanResponse,
} from "./sample-graphql-response.js";
import { isEmpty } from "lodash";

const parseGraphqlData = (data) => {
  const partnerRelationshipStatuses = ["married", "divorced", "partners"];
  const parentChildRelationships = {};
  const grandparentChildRelationships = {};
  const partnerRelationships = {};
  const siblingRelationships = {};
  const fictiveKinRelationships = {};

  data.forEach(({ humanId1, humanId2, relationship, ...rest }) => {
    // Parent Child Relationship
    if (relationship === "parent-child") {
      const currentChildren = parentChildRelationships[humanId1] || [];
      parentChildRelationships[humanId1] = [
        ...currentChildren,
        { parentId: humanId1, childId: humanId2, ...rest },
      ];
    }
    // Grandparent Child Relationships
    if (relationship === "grandparent-child") {
      const currentChildren = grandparentChildRelationships[humanId1] || [];
      grandparentChildRelationships[humanId1] = [
        ...currentChildren,
        { grandparentId: humanId1, childId: humanId2, ...rest },
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
          ...rest,
        };
      }
    }
    // Sibling Relationship
    else if (relationship === "siblings") {
      // confirm that there isn't an existing permutation of the relationship represented yet
      // if we have good data this shouldn't be a problem, but better to safeguard!
      if (
        !(
          siblingRelationships[`${humanId1}-${humanId2}`] ||
          siblingRelationships[`${humanId2}-${humanId1}`]
        )
      ) {
        siblingRelationships[`${humanId1}-${humanId2}`] = {
          humanId1,
          humanId2,
          relationship,
          ...rest,
        };
      }
    }
    // Fictive Kin Relationship
    else if (relationship === "fictive-kin") {
      // confirm that there isn't an existing permutation of the relationship represented yet
      // if we have good data this shouldn't be a problem, but better to safeguard!
      if (
        !(
          fictiveKinRelationships[`${humanId1}-${humanId2}`] ||
          fictiveKinRelationships[`${humanId2}-${humanId1}`]
        )
      ) {
        fictiveKinRelationships[`${humanId1}-${humanId2}`] = {
          humanId1,
          humanId2,
          relationship,
          ...rest,
        };
      }
    }
  });

  return {
    parentChildRelationships,
    grandparentChildRelationships,
    partnerRelationships,
    siblingRelationships,
    fictiveKinRelationships,
  };
};

const generateNodesAndEdges = ({
  parentChildRelationships,
  grandparentChildRelationships,
  partnerRelationships,
  siblingRelationships,
  fictiveKinRelationships,
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

  const addPhantomSameGenerationRelationship = ({
    humanId1,
    humanId2,
    phantomParent,
  }) => {
    const phantomNodeId = `${humanId1}-${humanId2}-phantomNode`;
    const edgeId = `e${humanId1}-${humanId2}`;
    const phantomIdLabel = phantomParent ? "parentId" : "childId";
    const existingIdLabel = phantomParent ? "childId" : "parentId";
    const edgeRelationship = phantomParent ? "sibling" : "partner";

    addNode({ id: phantomNodeId, hidden: true });
    addParentChildEdge({
      edgeId: `e${edgeId}-phantomNode1`,
      [phantomIdLabel]: phantomNodeId,
      [existingIdLabel]: humanId1,
    });
    addParentChildEdge({
      edgeId: `e${edgeId}-phantomNode2`,
      [phantomIdLabel]: phantomNodeId,
      [existingIdLabel]: humanId2,
    });

    edgesToAddAfterDynamicGeneration[edgeId] = {
      id: edgeId,
      source: humanId1,
      target: humanId2,
      sourceHandle: edgeRelationship,
      targetHandle: edgeRelationship,
      type: "step",
    };
  };

  const addPhantomCrossGenerationRelationship = ({ humanId1, humanId2 }) => {
    const phantomNodeId = `${humanId1}-${humanId2}-phantomNode`;
    const edgeId = `e${humanId1}-${humanId2}`;

    addNode({ id: phantomNodeId, hidden: true });
    addParentChildEdge({
      edgeId: `e${edgeId}-phantomNode1`,
      parentId: humanId1,
      childId: phantomNodeId,
    });
    addParentChildEdge({
      edgeId: `e${edgeId}-phantomNode2`,
      parentId: phantomNodeId,
      childId: humanId2,
    });

    edgesToAddAfterDynamicGeneration[edgeId] = {
      id: edgeId,
      source: humanId1,
      target: humanId2,
      sourceHandle: "parent",
      targetHandle: "child",
      type: "step",
    };
  };

  const addFictiveKinEdge = ({ edgeId, humanId1, humanId2, label }) => {
    edgesToGenerateDynamically[edgeId] = {
      id: edgeId,
      source: humanId1,
      target: humanId2,
      sourceHandle: "fictive-kin",
      targetHandle: "fictive-kin",
      type: "straight",
      label,
    };
  };

  // Generate Nodes and Edges for Parent/Child Relationships
  Object.values(parentChildRelationships).forEach((children) => {
    children.forEach(({ parentId, childId, status }) => {
      // Add nodes for humans
      addNode({ id: parentId });
      addNode({ id: childId });

      // Add kinship edge between parent and child
      const edgeId = `e${parentId}-${childId}`;
      addParentChildEdge({ edgeId, parentId, childId });
    });
  });

  // Generate Nodes and Edges for Grandparent/Child Relationships
  Object.values(grandparentChildRelationships).forEach((children) => {
    children.forEach(({ grandparentId, childId, status }) => {
      // Add nodes for humans
      addNode({ id: grandparentId });
      addNode({ id: childId });
      // Add node for phantom center-generation person
      addPhantomCrossGenerationRelationship({
        humanId1: grandparentId,
        humanId2: childId,
      });
    });
  });

  // Generate Nodes and Edges for Partner Relationships
  Object.values(partnerRelationships).forEach(
    ({ humanId1, humanId2, status }) => {
      // Add nodes for both humans in case they haven't
      // been accounted for, addNode will skip anyone that
      // already exists
      addNode({ id: humanId1 });
      addNode({ id: humanId2 });

      // If at least one human is not a parent, indicating
      // these two people don't have children together
      const parents = Object.keys(parentChildRelationships);
      const childFreeAdult = !(
        parents.includes(humanId1) && parents.includes(humanId2)
      );

      // If there are no shared children between the parents,
      // we similarly need a phantom child
      const human2ChildIds = (parentChildRelationships[humanId2] || []).map(
        ({ childId }) => childId
      );
      const noSharedChildren = isEmpty(
        (parentChildRelationships[humanId1] || []).filter(({ childId }) =>
          human2ChildIds.includes(childId)
        )
      );

      // Add phantom child and add partner edge between the two
      // humans as a static node
      if (childFreeAdult || noSharedChildren) {
        addPhantomSameGenerationRelationship({ humanId1, humanId2 });

        const edgeId = `e${humanId1}-${humanId2}`;
        edgesToAddAfterDynamicGeneration[edgeId] = {
          id: edgeId,
          source: humanId1,
          target: humanId2,
          sourceHandle: "partner",
          targetHandle: "partner",
          type: "step",
          // type: "customEdge",
          data: { withChildren: true },
        };
      }
    }
  );

  // Generate Nodes and Edges for Sibling Relationships
  const children = Object.values(parentChildRelationships).map(({ id }) => id);
  Object.values(siblingRelationships).forEach(({ humanId1, humanId2 }) => {
    const human1IsChild = children.includes(humanId1);
    const human2IsChild = children.includes(humanId2);

    if (!human1IsChild) addNode({ id: humanId1 });
    if (!human2IsChild) addNode({ id: humanId2 });
    if (!(human1IsChild && human2IsChild)) {
      addPhantomSameGenerationRelationship({
        humanId1,
        humanId2,
        phantomParent: true,
      });
    }
  });

  // Generate Nodes and Edges for Fictive Kin Relationships
  Object.values(fictiveKinRelationships).forEach(
    ({ humanId1, humanId2, label }) => {
      addNode({ id: humanId1 });
      addNode({ id: humanId2 });
      addFictiveKinEdge({
        edgeId: `e${humanId1}-${humanId2}`,
        humanId1,
        humanId2,
        label,
      });
    }
  );

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
