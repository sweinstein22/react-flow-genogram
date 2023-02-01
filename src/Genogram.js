import {useMemo} from "react";
import ReactFlow, {MiniMap, Controls} from "reactflow";
import PersonNode from "./PersonNode";
import "reactflow/dist/style.css";

// const generateEdgesForDivorcedParents = ({}) => {};

// const generateEdgesForParents = ({}) => {
// }

// const generateEdgesForChildlessParents = ({}) => {
// };

/** Generative way to build this stuff out
 *
 * Child with parents
 *    One parent or two parents
 *    Siblings or no siblings
 *
 * Person
 *    Married (edge, custom handle)
 *      Status of Marriage (edge styling)
 *    Sibling (edge, custom handle)
 *
 * Positioning (ugh)
 *    All relative to child?
 *    Maybe need some sort of multiplier, calculated via degrees of separation?
 */

const nodes = [
  {id: "1", type: "personNode", position: {x: 0, y: 0}, data: {name: "First Parent"}},
  {id: "2", type: "personNode", position: {x: 200, y: 0}, data: {name: "Second Parent"}},
  {id: "3", type: "personNode", position: {x: 20, y: 100}, data: {name: "First Sibling"}},
  {id: "4", type: "personNode", position: {x: 180, y: 100}, data: {name: "Second Sibling"}},
  {id: "5", type: "personNode", position: {x: 400, y: 0}, data: {name: "Spouse"}},
];

const edges = [
  // Child/sibling lines
  {id: "e1-3", source: "1", target: "3", sourceHandle: "parent", targetHandle: "child", type: "step"},
  {id: "e2-3", source: "2", target: "3", sourceHandle: "parent", targetHandle: "child", type: "step"},

  // Marriage - needs custom handle logic
  {id: "e2-5", source: "2", target: "5", sourceHandle: "spouse", targetHandle: "spouse", type: "step"},

  // Child/sibling lines
  {id: "e1-4", source: "1", target: "4", sourceHandle: "parent", targetHandle: "child", type: "step"},
  {id: "e2-4", source: "2", target: "4", sourceHandle: "parent", targetHandle: "child", type: "step"},
];

const Genogram = () => {
  // const edgeTypes = useMemo(() => ({customEdge: CustomEdge}), []);
  const nodeTypes = useMemo(() => ({personNode: PersonNode}), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      // edgeTypes={edgeTypes}
      nodeTypes={nodeTypes}
    >
      <MiniMap />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
};

export default Genogram;

