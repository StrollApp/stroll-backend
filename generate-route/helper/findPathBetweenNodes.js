// given the graph, a start, an end point (each with a longitude and latitude property), and
// a string array of safetyParams find a path that get you from one to the other in the safest 
// manner
// return the path, including the start and end points

var PriorityQueue = require("./priorityQueue.js");
const edgeScore = require("./edgeScore.js");
const ANG = 5 * Math.PI / 180; // maximum amt of degrees which we consider "straight line"
const cos = 0.789328039;
const degree = 69.1694444;
const ftPerMile = 5280;

module.exports = function (graph, startNode, endNode, safetyParams) {
  // this assumes startnode and endnode are indices for the node array in the graph

  // this assumes all the regions bs is taken care of already
  // heuristic will be euclidean distance using lat/lon
  // TODO: implement thing to penalize turns
  // TODO: implement edgeScore; need to make sure lights dont make things negative or < 1 even
  // TODO: remove unecessary waypoints (>=3 forming a very straight segment)

  const pq = new PriorityQueue((a,b) => a[1] < b[1]); // push stuff as [node object INDEX (in the array), priority]
  const nodes = graph.nodes.slice();
  const edges = graph.edges.slice();

  // make arrays to store visited and g
  const visited = new Array(nodes.length);
  const g = new Array(nodes.length);
  var it = 0;
  while(it < nodes.length) {
    visited[it] = false;
    g[it] = undefined;
    it++;
  }

  // g = cost, h = heuristic, f = g+h

  pq.push([startNode, 0]);
  g[startNode] = 0;

  while(!pq.isEmpty()) {

    currNode = pq.pop()[0];

    if(currNode === endNode) {
      break;
    }
    else if (visited[currNode] === true) {
      continue;
    }

    visited[currNode] = true;

    //console.log(nodes[currNode].adjacencies);
    if(typeof(nodes[currNode].adjacencies) === 'number') {
      nodes[currNode].adjacencies = nodes[currNode].adjacencies.toString();
    }
    let adj = nodes[currNode].adjacencies.split('-')
    adj = adj.map(Number)
    for(var i=0; i<adj.length; i++) {

      neighborEdge = edges.findIndex(element => element.index === adj[i]);
      neighborId = (nodes[currNode].id === edges[neighborEdge].start_id ? edges[neighborEdge].end_id : edges[neighborEdge].start_id);
      neighbor = nodes.findIndex(element => element.id === neighborId);

      currW = edgeScore(edges[neighborEdge], safetyParams);
      if(g[neighbor] === undefined || g[currNode] + currW < g[neighbor]) {
        g[neighbor] = g[currNode] + currW;
        pq.push([neighbor, g[neighbor] + heuristic(nodes[neighbor], nodes[endNode])]);
        nodes[neighbor].prev = currNode; // prev stores index in array seems fine
      }

    }

  }

  // now construct the list of waypoints
  let path = []
  if (g[endNode] === undefined) {
    // this is either because start === end or there is no path
    // TODO: what to do if there is no path (can this even happen)
  }
  else {
    curr = endNode;
    while(curr !== startNode) {
      path.push({
        latitude: nodes[curr].latitude,
        longitude: nodes[curr].longitude
      });
      curr = nodes[curr].prev;
    }
    path.push({
      latitude: nodes[startNode].latitude,
      longitude: nodes[startNode].longitude
    })
    path.reverse();
  }

  if(path.length > 0) { // need to remove some waypoints
    path = removeUnnecessary(path);
    if(path.length > 23) {
      // TODO: ?
    }
  }

  return {
    path: path,
    dist: g[endNode]
  };
};

function heuristic(node, end) { // given as node object; computes euclidean distance
  const start_lat = node.latitude;
  const start_lon = node.longitude;
  const end_lat = end.latitude;
  const end_lon = end.longitude;

  latD = (end_lat - start_lat) * degree * ftPerMile;
  lonD = (end_lon - start_lon) * cos * degree * ftPerMile;
  return Math.sqrt(latD * latD + lonD * lonD);
}

function removeUnnecessary(path) { // array of waypoints + start and end coordinates
  let fullPath = path.slice();
  let i = 1;
  while(i < fullPath.length - 1){
    // check if i-1, i, i+1 form a straight enough line
    const a = {
      x: fullPath[i].latitude - fullPath[i-1].latitude,
      y: fullPath[i].longitude - fullPath[i-1].longitude
    };
    const b = {
      x: fullPath[i].latitude - fullPath[i+1].latitude,
      y: fullPath[i].longitude - fullPath[i+1].longitude
    };
    const dotProd = a.x * b.x + a.y * b.y;
    const distA = Math.sqrt(a.x * a.x + a.y * a.y);
    const distB = Math.sqrt(b.x * b.x + b.y * b.y);
    let currAng = Math.acos((dotProd)/(distA * distB));
    if(currAng > Math.PI/2) currAng = Math.PI - currAng;
    //console.log(currAng * 180 / Math.PI);
    if(currAng <= ANG){
      // remove node i from the array
      fullPath.splice(i, 1);
      // don't increment i
    }
    else{
      i++;
    }
  }
  return fullPath;
}