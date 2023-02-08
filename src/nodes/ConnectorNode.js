import { Handle, Position } from "reactflow";
import { Fragment } from "react";

const ConnectorHandle = ({ id, position }) => (
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

const ConnectorNode = () => {
  return (
    <div style={{ height: "1px", width: "1px", color: "transparent" }}>
      <ConnectorHandle id="connectorNodeTop" position={Position.Top} />
      <ConnectorHandle id="connectorNodeBottom" position={Position.Bottom} />
      <ConnectorHandle id="connectorNodeLeft" position={Position.Left} />
      <ConnectorHandle id="connectorNodeRight" position={Position.Right} />x
    </div>
  );
};

export default ConnectorNode;
