// Test data trying to leverage only one on one relationship information from the "database"

import {
  sampleGraphqlHumanRelationshipResponse,
  sampleGraphqlHumanResponse,
} from "./sample-graphql-response-with-connectors";
import { isEmpty } from "lodash";

import parseGraphqlData from "./parseGraphqlData.js";

const nodesById = {};
const dynamicEdges = {};
const staticEdges = {};

const addNode = ({ id, connector, hidden }) => {
  if (!nodesById[id]) {
    nodesById[id] = {
      id: id,
      hidden,
      type: connector ? "connectorNode" : "personNode",
      data: sampleGraphqlHumanResponse[id],
      position: { x: 0, y: 0 },
    };
  }
  return nodesById[id];
};

const addParentChildEdgeViaConnector = ({
  edgeId,
  parentId,
  childId,
  connectorId,
}) => {
  dynamicEdges[`${edgeId}-connector-top`] = {
    id: `${edgeId}-connector-top`,
    source: parentId,
    target: connectorId,
    sourceHandle: "parent",
    targetHandle: "connectorNodeTop",
    type: "straightstep",
  };
  dynamicEdges[`${edgeId}-connector-bottom`] = {
    id: `${edgeId}-connector-bottom`,
    source: connectorId,
    target: childId,
    sourceHandle: "connectorNodeBottom",
    targetHandle: "child",
    type: "straightstep",
  };
};

const addParentChildEdge = ({ edgeId, parentId, childId }) => {
  dynamicEdges[edgeId] = {
    id: edgeId,
    source: parentId,
    target: childId,
    sourceHandle: "parent",
    targetHandle: "child",
    type: "straightstep",
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

  staticEdges[edgeId] = {
    id: edgeId,
    source: humanId1,
    target: humanId2,
    sourceHandle: edgeRelationship,
    targetHandle: edgeRelationship,
    type: "straightstep",
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

  staticEdges[edgeId] = {
    id: edgeId,
    source: humanId1,
    target: humanId2,
    sourceHandle: "parent",
    targetHandle: "child",
    type: "straightstep",
  };
};

const addFictiveKinEdge = ({ edgeId, humanId1, humanId2, label }) => {
  dynamicEdges[edgeId] = {
    id: edgeId,
    source: humanId1,
    target: humanId2,
    sourceHandle: "fictive-kin",
    targetHandle: "fictive-kin",
    type: "straight",
    label,
  };
};

const generateNodesAndEdges = ({
  parentChildRelationships,
  childParentRelationships,
  grandparentChildRelationships,
  partnerRelationships,
  siblingRelationships,
  fictiveKinRelationships,
}) => {
  // Generate Nodes and Edges for Partner Relationships
  // connector node for partners
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

      const edgeId = `e${humanId1}-${humanId2}`;
      // Add phantom child and add partner edge between the two
      // humans as a static node
      if (childFreeAdult || noSharedChildren) {
        addPhantomSameGenerationRelationship({ humanId1, humanId2 });
        staticEdges[edgeId] = {
          id: edgeId,
          source: humanId1,
          target: humanId2,
          sourceHandle: "partner",
          targetHandle: "partner",
          type: "straightstep",
          // type: "customEdge",
          data: { withChildren: true },
        };
      } else {
        const connectorId = `${humanId1}-${humanId2}-connector`;

        addNode({ id: connectorId, connector: true });
        dynamicEdges[`${edgeId}-connector-left`] = {
          id: `${edgeId}-connector-left`,
          source: humanId1,
          target: connectorId,
          sourceHandle: "parent",
          targetHandle: "connectorNodeLeft",
          type: "straightstep",
        };
        dynamicEdges[`${edgeId}-connector-right`] = {
          id: `${edgeId}-connector-right`,
          source: connectorId,
          target: humanId2,
          sourceHandle: "connectorNodeRight",
          targetHandle: "child",
          type: "straightstep",
        };
      }
    }
  );

  // Generate Nodes and Edges for Parent/Child Relationships
  // Go through connector nodes if they exist
  Object.values(childParentRelationships).forEach((parents) => {
    if (parents.length === 1) {
      const { parentId, childId, status } = parents[0];

      // Add nodes for humans
      addNode({ id: parentId });
      addNode({ id: childId });

      // // Add kinship edge between parent and child via connector edge
      const edgeId = `e${parentId}-${childId}`;
      addParentChildEdge({ edgeId, parentId, childId });
    } else if (parents.length === 2) {
      const {
        parentId: parentOneId,
        childId,
        status: parentOneStatus,
      } = parents[0];
      const { parentId: parentTwoId, status: parentTwoStatus } = parents[1];

      // Add nodes for humans
      addNode({ id: parentOneId });
      addNode({ id: parentTwoId });
      addNode({ id: childId });

      const potentialConnectorIdOne = `${parentOneId}-${parentTwoId}-connector`;
      const potentialConnectorIdTwo = `${parentTwoId}-${parentOneId}-connector`;
      const connectorNode =
        nodesById[potentialConnectorIdOne] ||
        nodesById[potentialConnectorIdTwo] ||
        addNode({ id: potentialConnectorIdOne, connector: true });

      dynamicEdges[`${childId}-connector-child`] = {
        id: `${childId}-connector-child`,
        source: connectorNode.id,
        target: childId,
        sourceHandle: "connectorNodeBottom",
        targetHandle: "child",
        type: "straight",
      };
    }

    parents.forEach(({ parentId, childId, status }) => {
      const edgeId = `e${parentId}-${childId}`;
      // const connectorId = `${childId}-connector`;

      // Add nodes for humans
      addNode({ id: parentId });
      addNode({ id: childId });

      // // Add connector node
      // addNode({
      //   id: connectorId,
      //   connector: true,
      // });

      // // Add kinship edge between parent and child via connector edge
      // addParentChildEdgeViaConnector({
      //   edgeId,
      //   parentId,
      //   childId,
      //   connectorId,
      // });
      // addParentChildEdge({ edgeId, parentId, childId });
    });
  });

  // Generate Nodes and Edges for Grandparent/Child Relationships
  // Object.values(grandparentChildRelationships).forEach((children) => {
  // children.forEach(({ grandparentId, childId, status }) => {
  //   // Add nodes for humans
  //   addNode({ id: grandparentId });
  //   addNode({ id: childId });
  //   // Add node for phantom center-generation person
  //   addPhantomCrossGenerationRelationship({
  //     humanId1: grandparentId,
  //     humanId2: childId,
  //   });
  // });
  // });

  // Generate Nodes and Edges for Sibling Relationships
  const children = Object.values(parentChildRelationships).map(({ id }) => id);
  // Object.values(siblingRelationships).forEach(({ humanId1, humanId2 }) => {
  // const human1IsChild = children.includes(humanId1);
  // const human2IsChild = children.includes(humanId2);
  // if (!human1IsChild) addNode({ id: humanId1 });
  // if (!human2IsChild) addNode({ id: humanId2 });
  // if (!(human1IsChild && human2IsChild)) {
  //   addPhantomSameGenerationRelationship({
  //     humanId1,
  //     humanId2,
  //     phantomParent: true,
  //   });
  // }
  // });

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

  console.log(nodesById, dynamicEdges, staticEdges);

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
