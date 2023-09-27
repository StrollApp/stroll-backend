var PriorityQueue = require("./priorityQueue.js");
const edgeScore = require("./edgeScore.js");
const ANG = (40 * Math.PI) / 180; // maximum amt of degrees which we consider "straight line"
const cos = 0.789328039;
const degree = 69.1694444;
const ftPerMile = 5280;

// given the graph, a start, an end point (each with a longitude and latitude property), and a string array of safetyParams
// find a path that get you from one to the other in the safest manner
// return the path, including the start and end points
module.exports = function (graph, startNode, endNode, safetyParams) {
  // this assumes startnode and endnode are ids for the node array in the graph
  // TODO: implement thing to penalize turns

  const pq = new PriorityQueue((a, b) => a[1] < b[1]); // push stuff as [node object INDEX, priority]
  const nodes = { ...graph.nodes };
  const edges = graph.edges.slice();

  // make maps to store visited and g
  var visited = {};
  var g = {};
  var prev = {};

  pq.push([startNode, 0]);
  g[startNode] = 0;

  while (!pq.isEmpty()) {
    currNode = pq.pop()[0];

    if (currNode === endNode) {
      break;
    }
    if (visited[currNode] === true) {
      continue;
    }

    visited[currNode] = true;

    var adj = nodes[currNode].adjacencies.split("-");
    adj = adj.map(Number);

    adj.forEach(neighborEdge => {
      neighbor =
        currNode === edges[neighborEdge].start_id
          ? edges[neighborEdge].end_id
          : edges[neighborEdge].start_id;

      currW = edgeScore(edges[neighborEdge], safetyParams);

      if (g[neighbor] === undefined || g[currNode] + currW < g[neighbor]) {
        g[neighbor] = g[currNode] + currW;
        prev[neighbor] = currNode;

        const priority =
          g[neighbor] + heuristic(nodes[neighbor], nodes[endNode]);
        pq.push([neighbor, priority]);
      }
    });
  }

  // construct the list of waypoints
  let path = [];
  var curr = endNode;

  while (curr !== startNode) {
    path.push({
      latitude: nodes[curr].latitude,
      longitude: nodes[curr].longitude
    });
    curr = prev[curr];
  }

  path.push({
    latitude: nodes[startNode].latitude,
    longitude: nodes[startNode].longitude
  });

  path.reverse();

  // need to remove some waypoints
  path = removeUnnecessary(path);

  // TODO: handle paths with more than 23 waypoints

  return {
    path: path,
    dist: g[endNode]
  };
};

function heuristic(node, end) {
  // given as node object; computes euclidean distance
  return euclideanDistance(node, end);
}

// returns in feet distance between points a and b where
// a and b are both objects containing a longitude and latitude field
function euclideanDistance(a, b) {
  const start_lat = a.latitude;
  const start_lon = a.longitude;
  const end_lat = b.latitude;
  const end_lon = b.longitude;

  latD = (end_lat - start_lat) * degree * ftPerMile;
  lonD = (end_lon - start_lon) * cos * degree * ftPerMile;
  return Math.sqrt(latD * latD + lonD * lonD);
}

function removeUnnecessary(path) {
  if (path.length < 1) return path;
  var res = removeClutteredPoints(path);
  res = removeStraightPoints(res);
  return res;
}

function removeStraightPoints(path) {
  // array of waypoints + start and end coordinates
  let fullPath = path.slice();
  let i = 1;
  while (i < fullPath.length - 1) {
    // check if i-1, i, i+1 form a straight enough line
    const a = {
      x: fullPath[i].latitude - fullPath[i - 1].latitude,
      y: fullPath[i].longitude - fullPath[i - 1].longitude
    };
    const b = {
      x: fullPath[i].latitude - fullPath[i + 1].latitude,
      y: fullPath[i].longitude - fullPath[i + 1].longitude
    };
    const dotProd = a.x * b.x + a.y * b.y;
    const distA = Math.sqrt(a.x * a.x + a.y * a.y);
    const distB = Math.sqrt(b.x * b.x + b.y * b.y);
    let currAng = Math.acos(dotProd / (distA * distB));

    if (currAng > Math.PI / 2) currAng = Math.PI - currAng;

    if (currAng <= ANG) {
      // remove node i from the array
      fullPath.splice(i, 1);
      // don't increment i
    } else {
      i++;
    }
  }
  return fullPath;
}

function removeClutteredPoints(path) {
  let res = [];
  var left = 0;
  var right = 1;

  while (right < path.length) {
    if (euclideanDistance(path[left], path[right]) < 200) {
      right++;
    } else {
      res.push(path[left]);
      left = right;
      right++;
    }
  }

  res.push(path[left]);

  if (left != path.length - 1) {
    res.push(path[path.length - 1]);
  }
  return res;
}
