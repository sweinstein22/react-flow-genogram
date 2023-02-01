import React, { useEffect, useMemo } from "react";
import ReactFlow, {
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
} from "reactflow";
import elkjs from "elkjs";
import PersonNode from "./PersonNode";
import "reactflow/dist/style.css";

import { initialNodes, initialEdges } from "./nodes-edges.js";

import "./index.css";

const elk = new elkjs();

const nodeWidth = 172;
const nodeHeight = 36;

// const generateEdgesForDivorcedParents = ({}) => {};

// const generateEdgesForParents = ({}) => {
// }

// const generateEdgesForChildlessParents = ({}) => {
// };

/** Generative way to build this stuff out
 *
 * Every marriage needs to have phantom child if not real one
 * Add marriage line after dynamic chart determination
 *
 * 1. Generate list of nodes & edges
 * 2. Dynamically generate graph
 * 3. Add in child free marriage lines, divorce lines, etc.
 *
 * TODO:
 * - determine data structure required to generate nodes & edges
 * - figure out how to determine what edges need to be added after dynamic generation
 * - figure out fictive kin structure/show & hide options?
 */

const childFreeMarriageEdges = [
  {
    id: "e1-4",
    source: "3a",
    target: "3b",
    sourceHandle: "spouse",
    targetHandle: "spouse",
    type: "step",
  },
];

const graph = {
  id: "root",
  children: [],
  layoutOptions: {
    "elk.algorithm": "layered",
    "elk.direction": "DOWN",
    "elk.layered.spacing.edgeNodeBetweenLayers": 30,
    "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
  },
};

const getLayoutedElements = (nodes, edges) => {
  graph.children = nodes.reduce(
    (memo, node) => [
      ...memo,
      { ...node, width: nodeWidth, height: nodeHeight },
    ],
    []
  );

  graph.edges = edges.reduce(
    (memo, edge) => [
      ...memo,
      { ...edge, sources: [edge.source], targets: [edge.target] },
    ],
    []
  );

  elk.layout(graph).then((positioned) => {
    positioned.children.forEach((node) => {
      // Shift anchor point to center graph
      node.position = {
        x: node.x - nodeWidth / 2,
        y: node.y - nodeHeight / 2,
      };

      return node;
    });
  });

  return {
    nodes: graph.children,
    edges: [...graph.edges, ...childFreeMarriageEdges],
  };
};

const Genogram = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    []
  );

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  // const edgeTypes = useMemo(() => ({customEdge: CustomEdge}), []);
  const nodeTypes = useMemo(() => ({ personNode: PersonNode }), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      // edgeTypes={edgeTypes}
      nodeTypes={nodeTypes}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
    >
      <MiniMap />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
};

export default Genogram;
