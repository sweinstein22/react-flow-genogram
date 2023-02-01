import ReactFlow, { MiniMap, Controls } from "reactflow";
import "reactflow/dist/style.css";

// const generateEdgesForDivorcedParents = ({}) => {};

// const generateEdgesForParents = ({}) => {
// }

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
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 200, y: 0 }, data: { label: "2" } },
  { id: "3", position: { x: 20, y: 100 }, data: { label: "3" } },
  { id: "4", position: { x: 180, y: 100 }, data: { label: "4" } },
];

const edges = [
  // Child/sibling lines
  { id: "e1-3", source: "1", target: "3", type: "smoothstep" },
  { id: "e2-3", source: "2", target: "3", type: "smoothstep" },

  // Marriage - needs custom handle logic
  // {
  // id: "e1-2",
  // source: "1",
  // target: "2",
  // targetHandle: "bottom",
  // type: "smoothstep",
  // },

  // Child/sibling lines
  { id: "e1-4", source: "1", target: "4", type: "smoothstep" },
  { id: "e2-4", source: "2", target: "4", type: "smoothstep" },
];

const Genogram = () => {
  // const nodeTypes = useMemo(() => ({ textUpdater: TextUpdaterNode }), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      // nodeTypes={nodeTypes}
    >
      <MiniMap />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
};

export default Genogram;
