import React, {useEffect, useMemo} from 'react';
import ReactFlow, {ConnectionLineType, useNodesState, useEdgesState} from 'reactflow';
import elkjs from "elkjs";
import 'reactflow/dist/style.css';

import {initialNodes, initialEdges} from './nodes-edges.js';

import './index.css';

const elk = new elkjs();

const nodeWidth = 172;
const nodeHeight = 36;

const graph = {
  id: "root",
  children: [],
}

const getLayoutedElements = (nodes, edges) => {
  graph.children = nodes.reduce((memo, node) => (
    [...memo, {...node, width: nodeWidth, height: nodeHeight}]
  ), []);

  graph.edges = edges.reduce((memo, edge) => (
    [...memo, {...edge, sources: [edge.source], targets: [edge.target]}]
  ), []);

  elk.layout(graph).then(positioned => {
    positioned.children.forEach((node) => {
      // Shift anchor point to center graph
      node.position = {
        x: node.x - nodeWidth / 2,
        y: node.y - nodeHeight / 2,
      };

      return node;
    });

    positioned.edges.forEach((edge) => {
      // Reconfigure data from elkjs to react flow format
      edge.source = edge.sources[0];
      edge.target = edge.targets[0];

      return edge;
    });
  })

  return {nodes: graph.children, edges: graph.edges};
};


const Genogram = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const {nodes: layoutedNodes, edges: layoutedEdges} = useMemo(() => getLayoutedElements(
    initialNodes,
    initialEdges
  ), []);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
    />
  );
};

export default Genogram;

