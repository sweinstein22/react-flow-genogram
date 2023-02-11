import ElkJS from "elkjs";
import React, { useEffect, useMemo } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
} from "reactflow";
import Key from "./Key";
import "reactflow/dist/style.css";

// Test data trying to leverage only one on one relationship information from the "database"
import processDynamicNodes from "./graphqlAdaptSiblingRelationships/processDynamicNodes";
import sampleGraphqlNodesAndEdges from "./graphqlAdaptSiblingRelationships/calculateNodesAndEdges";

// Test data without trying to implement any sort of data parsing
// import hardcodedNodesAndEdges from "./hardcodedNodesAndEdges/calculateNodesAndEdges";

// Edges
import PartnerConnectorEdge from "./edges/PartnerConnectorEdge";
import ChildEdge from "./edges/ChildEdge";
import FloatingEdge from "./edges/FloatingEdge";

// Nodes
import PersonNode from "./nodes/PersonNode";
import ConnectorNode from "./nodes/ConnectorNode";

const elk = new ElkJS();

const nodeWidth = 172;
const nodeHeight = 36;

const graph = {
  id: "root",
  children: [],
  layoutOptions: {
    "elk.algorithm": "layered",
    "elk.direction": "DOWN",
    "elk.layered.spacing.edgeNodeBetweenLayers": 60,
    "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
  },
};

const sampleNodesAndEdges = sampleGraphqlNodesAndEdges();
// const sampleNodesAndEdges = hardcodedNodesAndEdges();

const getLayoutedElements = async (nodes, edges, postPositionProcessing) => {
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

  const result = postPositionProcessing({
    nodes: graph.children,
    nodeHeight,
    nodeWidth,
  });

  return {
    nodes: result.nodes,
    // Add in edges that should be rendered but should not impact
    // dynamic positioning of nodes
    edges: [...result.edges, ...sampleNodesAndEdges.staticEdges],
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
          sampleNodesAndEdges.dynamicEdges,
          processDynamicNodes
        );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    };

    layoutElements();
  }, [setNodes, setEdges]);

  const edgeTypes = useMemo(
    () => ({
      childEdge: ChildEdge,
      floating: FloatingEdge,
      partnerConnector: PartnerConnectorEdge,
    }),
    []
  );
  const nodeTypes = useMemo(
    () => ({ connectorNode: ConnectorNode, personNode: PersonNode }),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      edgeTypes={edgeTypes}
      nodeTypes={nodeTypes}
      fitView
    >
      <MiniMap />
      <Controls showInteractive={false} />
      <Key />
    </ReactFlow>
  );
};

export default Genogram;
