import { Panel } from "reactflow";
import React, { useState } from "react";
import { If } from "conditional-react-component";
import "./Key.css";

const Key = () => {
  const [showPanel, setShowPanel] = useState(true);
  return (
    <Panel position="top-right" className="key">
      <If condition={!showPanel}>
        <button onClick={() => setShowPanel(true)}>&#9432;</button>
      </If>
      <If condition={showPanel}>
        <div>
          {/* This should be replaced with Flex, Button, & translations */}
          <div className="keyTitle">
            <b>Key</b>
            <button onClick={() => setShowPanel(false)}>X</button>
          </div>
          <ul>
            <li>Deceased: </li>
            <li>Divorced: </li>
            <li>Positive Relationship: </li>
          </ul>
        </div>
      </If>
    </Panel>
  );
};

export default Key;
