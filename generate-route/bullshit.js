// const nodes = require("./nodes.json");
// const fs = require("fs");

// const bitch = {};
// var index = 0;
// nodes.forEach(obj => {
//   bitch[obj.id] = index;
//   index++;
// });

// const outputstring = JSON.stringify(bitch, null, 2);

// fs.writeFile("nodeIdToIndex.json", outputstring, "utf8", () => {});

const nodes = require("./nodes.json");
const fs = require("fs");

const bitch = {};
nodes.forEach(obj => {
  bitch[obj.id] = obj;
  delete bitch[obj.id].id;
});

const outputstring = JSON.stringify(bitch, null, 2);

fs.writeFile("indexedNodes.json", outputstring, "utf8", () => {});
