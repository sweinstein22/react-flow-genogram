const addFictiveKinEdge = ({ edgeId, humanId1, humanId2, label }) => {
  return {
    id: edgeId,
    source: humanId1,
    target: humanId2,
    sourceHandle: "fictive-kin",
    targetHandle: "fictive-kin",
    type: "straight",
    label,
  };
};

export default addFictiveKinEdge;
