import { Handle, Position } from "reactflow";
import { Fragment } from "react";
import PersonCard from "./PersonCard";

const CustomHandle = ({ id, position }) => {
  const styles = {};
  if ([Position.Left, Position.Right].includes(position)) {
    styles.left = "0";
    styles.right = "0";
  }

  return (
    <Fragment>
      <Handle
        style={{ background: "none", border: "none", ...styles }}
        isConnectable={false}
        type="source"
        position={position}
        id={id}
      />
      <Handle
        style={{ background: "none", border: "none", ...styles }}
        isConnectable={false}
        type="target"
        position={position}
        id={id}
      />
    </Fragment>
  );
};

const FictiveKinHandle = () => (
  <Fragment>
    <Handle
      style={{ background: "none", border: "none" }}
      isConnectable={false}
      type="source"
      position={Position.Bottom}
      id="fictive-kin"
    />
    <Handle
      style={{ background: "none", border: "none" }}
      isConnectable={false}
      type="target"
      position={Position.Top}
      id="fictive-kin"
    />
  </Fragment>
);

const PersonNode = (props) => {
  return (
    <Fragment>
      <CustomHandle id="child" position={Position.Top} />
      <CustomHandle id="sibling" position={Position.Top} />
      <CustomHandle id="parent" position={Position.Bottom} />
      <CustomHandle id="partner" position={Position.Bottom} />
      <CustomHandle id="partnerLeft" position={Position.Left} />
      <CustomHandle id="partnerRight" position={Position.Right} />
      <FictiveKinHandle />
      <PersonCard {...props} />
    </Fragment>
  );
};

export default PersonNode;
