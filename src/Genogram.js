import ElkJS from "elkjs";
import React, { useEffect, useMemo } from "react";
import ReactFlow, {
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
} from "reactflow";
import Key from "./Key";
import PersonNode from "./PersonNode";
import "reactflow/dist/style.css";

// Test data trying to leverage only one on one relationship information from the "database"
import sampleGraphqlNodesAndEdges from "./graphqlAdaptSiblingRelationships/calculateNodesAndEdges";

// Test data without trying to implement any sort of data parsing
// import hardcodedNodesAndEdges from "./hardcodedNodesAndEdges/calculateNodesAndEdges";

const elk = new ElkJS();

const nodeWidth = 172;
const nodeHeight = 36;

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

const sampleNodesAndEdges = sampleGraphqlNodesAndEdges();
// const sampleNodesAndEdges = hardcodedNodesAndEdges();

const getLayoutedElements = async (nodes, edges) => {
  // Add attributes required by elkjs to nodes and edges
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

  // Dynamically determine position nodes should be rendered in
  await elk.layout(graph).then((layoutedGraph) => {
    layoutedGraph.children.map((node) => {
      const shiftedNode = node;
      // Shift anchor point to center graph
      shiftedNode.position = {
        x: node.x - nodeWidth / 2,
        y: node.y - nodeHeight / 2,
      };
      return shiftedNode;
    });
  });

  return {
    nodes: graph.children,
    // Add in edges that should be rendered but should not impact
    // dynamic positioning of nodes
    edges: [...graph.edges, ...sampleNodesAndEdges.staticEdges],
  };
};

const Genogram = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const layoutElements = async () => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        await getLayoutedElements(
          sampleNodesAndEdges.nodes,
          sampleNodesAndEdges.dynamicEdges
        );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    };

    layoutElements();
  }, [setNodes, setEdges]);

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
      <Key />
    </ReactFlow>
  );
};

export default Genogram;
