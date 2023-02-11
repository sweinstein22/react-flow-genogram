export const relationshipMap = {
  cohabitating: {
    style: { strokeDasharray: "5,5", stroke: "blue" },
    symbolStyle: { stroke: "blue", fill: "blue" },
    symbol: "⌂",
  },
  divorced: {
    style: { stroke: "red" },
    symbolStyle: { stroke: "red", fill: "red" },
    symbol: "/ /",
  },
  engaged: {
    style: { strokeDasharray: "5,5", stroke: "blue" },
    symbolStyle: { stroke: "blue", fill: "blue" },
    symbol: "⚬",
  },
  "love-affair": {
    style: { strokeDasharray: "5,5", stroke: "hotpink" },
    symbolStyle: { stroke: "hotpink", fill: "hotpink" },
    symbol: "♥",
  },
  married: { symbol: "⚭" },
};

export const statusMap = {
  close: { numberOfLines: 2, style: { stroke: "green" } },
  estranged: {
    style: { strokeDasharray: "10,10", stroke: "red" },
    symbolStyle: { stroke: "red", fill: "red" },
    symbol: "| |",
  },
  hostile: {
    numberOfLines: 0,
    style: {},
    symbolStyle: {},
    symbol: "",
    zigZagStyle: { stroke: "red" },
  },
};
