// Test data without trying to implement any sort of data parsing

import { initialNodes, initialEdges } from "./nodes-edges";

const childFreeMarriageEdges = [
  {
    id: "e3a-3b",
    source: "3a",
    target: "3b",
    sourceHandle: "partner",
    targetHandle: "partner",
    type: "step",
  },
];

const unknownParentEdges = [
  {
    id: "e7-8",
    source: "7",
    target: "8",
    sourceHandle: "sibling",
    targetHandle: "sibling",
    type: "step",
  },
];

const hardcodedNodesAndEdges = () => ({
  nodes: initialNodes,
  dynamicEdges: initialEdges,
  staticEdges: [...childFreeMarriageEdges, unknownParentEdges],
});

export default hardcodedNodesAndEdges;
