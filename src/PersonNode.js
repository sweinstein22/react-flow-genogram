import { Handle, Position } from "reactflow";
import { Fragment } from "react";

const CustomHandle = ({ id, position }) => (
  <Fragment>
    <Handle
      style={{ background: "none", border: "none" }}
      isConnectable={false}
      type="source"
      position={position}
      id={id}
    />
    <Handle
      style={{ background: "none", border: "none" }}
      isConnectable={false}
      type="target"
      position={position}
      id={id}
    />
  </Fragment>
);

const PersonNode = ({ data: { name = "" } }) => {
  return (
    <Fragment>
      <CustomHandle id="child" position={Position.Top} />
      <CustomHandle id="sibling" position={Position.Top} />
      <CustomHandle id="parent" position={Position.Bottom} />
      <CustomHandle id="partner" position={Position.Bottom} />
      <div
        style={{
          border: "1px solid black",
          borderRadius: "4px",
          padding: "8px",
        }}
      >
        Name: {name}
      </div>
    </Fragment>
  );
};

export default PersonNode;
