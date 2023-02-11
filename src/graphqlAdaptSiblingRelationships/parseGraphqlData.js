const parseGraphqlData = (data) => {
  const partnerRelationshipStatuses = [
    "married",
    "divorced",
    "partners",
    "engaged",
    "love-affair",
    "cohabitating",
  ];
  const parentChildRelationshipStatuses = ["parent-child", "adoptive"];
  const parentChildRelationships = {};
  const childParentRelationships = {};
  const grandparentChildRelationships = {};
  const partnerRelationships = {};
  const siblingRelationships = {};
  const fictiveKinRelationships = {};
  const emotionalRelationships = {};

  data.forEach(({ humanId1, humanId2, relationship, status, ...rest }) => {
    // Parent Child Relationship
    if (parentChildRelationshipStatuses.includes(relationship)) {
      const currentChildren = parentChildRelationships[humanId1] || [];
      parentChildRelationships[humanId1] = [
        ...currentChildren,
        {
          parentId: humanId1,
          childId: humanId2,
          relationship,
          status,
          ...rest,
        },
      ];
      const currentParents = childParentRelationships[humanId2] || [];
      childParentRelationships[humanId2] = [
        ...currentParents,
        {
          parentId: humanId1,
          childId: humanId2,
          relationship,
          status,
          ...rest,
        },
      ];
    }
    // Grandparent Child Relationships
    if (relationship === "grandparent-child") {
      const currentChildren = grandparentChildRelationships[humanId1] || [];
      grandparentChildRelationships[humanId1] = [
        ...currentChildren,
        { grandparentId: humanId1, childId: humanId2, status, ...rest },
      ];
      const currentParents = childParentRelationships[humanId2] || [];
      childParentRelationships[humanId2] = [
        ...currentParents,
        { parentId: humanId1, childId: humanId2, status, ...rest },
      ];
    }
    // Partner Relationship
    else if (partnerRelationshipStatuses.includes(relationship)) {
      // confirm that there isn't an existing permutation of the relationship represented yet
      // if we have good data this shouldn't be a problem, but better to safeguard!
      if (
        !(
          partnerRelationships[`${humanId1}-${humanId2}`] ||
          partnerRelationships[`${humanId2}-${humanId1}`]
        )
      ) {
        partnerRelationships[`${humanId1}-${humanId2}`] = {
          humanId1,
          humanId2,
          relationship,
          status,
          ...rest,
        };
      }
    }
    // Sibling Relationship
    else if (relationship === "siblings") {
      // confirm that there isn't an existing permutation of the relationship represented yet
      // if we have good data this shouldn't be a problem, but better to safeguard!
      if (
        !(
          siblingRelationships[`${humanId1}-${humanId2}`] ||
          siblingRelationships[`${humanId2}-${humanId1}`]
        )
      ) {
        siblingRelationships[`${humanId1}-${humanId2}`] = {
          humanId1,
          humanId2,
          relationship,
          status,
          ...rest,
        };
      }
    }
    // Fictive Kin Relationship
    else if (relationship === "fictive-kin") {
      // confirm that there isn't an existing permutation of the relationship represented yet
      // if we have good data this shouldn't be a problem, but better to safeguard!
      if (
        !(
          fictiveKinRelationships[`${humanId1}-${humanId2}`] ||
          fictiveKinRelationships[`${humanId2}-${humanId1}`]
        )
      ) {
        fictiveKinRelationships[`${humanId1}-${humanId2}`] = {
          humanId1,
          humanId2,
          relationship,
          status,
          ...rest,
        };
      }
    }

    // Emotional Relationship
    if (status) {
      emotionalRelationships[`${humanId1}-${humanId2}`] = {
        humanId1,
        humanId2,
        status,
      };
    }
  });

  return {
    parentChildRelationships,
    childParentRelationships,
    grandparentChildRelationships,
    partnerRelationships,
    siblingRelationships,
    fictiveKinRelationships,
    emotionalRelationships,
  };
};

export default parseGraphqlData;
