// given the graph, a start, an end point (each with a longitude and latitude property), and
// a string array of safetyParams find a path that get you from one to the other in the safest 
// manner
// return the path, including the start and end points

var PriorityQueue = require("./priorityQueue.js");

module.exports = function (graph, startNode, endNode, safetyParams) {
  // this assumes startnode and endnode are indices for the node array in the graph

  // this assumes all the regions bs is taken care of already
  // heuristic will be euclidean distance using lat/lon
  // TODO: implement thing to penalize turns
  // TODO: implement edgeScore; need to make sure lights dont make things negative or < 1 even
  // TODO: remove unecessary waypoints (>=3 forming a very straight segment)

  const pq = new PriorityQueue((a,b) => a[1] < b[1]); // push stuff as [node object INDEX (in the array), priority]
  nodes = graph.nodes.slice();
  edges = graph.edges.slice();

  // g = cost, h = heuristic, f = g+h

  pq.push([startNode, 0]);
  nodes[startNode].g = 0;

  while(!pq.isEmpty()) {

    currNode = pq.pop()[0];

    if(currNode === endNode) {
      break;
    }
    else if (nodes[currNode].visited !== undefined) {
      continue;
    }

    nodes[currNode].visited = true;

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
      if(nodes[neighbor].g === undefined || nodes[currNode].g + currW < nodes[neighbor].g) {
        nodes[neighbor].g = nodes[currNode].g + currW;
        pq.push([neighbor, nodes[neighbor].g + heuristic(nodes[neighbor], nodes[endNode])]);
        nodes[neighbor].prev = currNode; // prev stores index in array seems fine
      }

    }

  }

  // now construct the list of waypoints
  const path = []
  if (nodes[endNode].g === undefined) {
    // this is either because start === end or there is no path
  }
  else {
    curr = endNode;
    while(nodes[curr].prev !== startNode) {
      prev = nodes[curr].prev;
      path.push({
        latitude: nodes[prev].latitude,
        longitude: nodes[prev].longitude
      });
      curr = prev;
    }
    path.reverse();
  }

/* testing heuristic
  node = {
    latitude: 37.862638,
    longitude: -122.2440254
  };
  end = {
    latitude: 37.8627683,
    longitude: -122.2441072
  };
  console.log(heuristic(node, end));*/

  return path;
};

function edgeScore(edge, safetyParams) { // edge is an edge object, safetyparam is array of strings
  return edge.distance;
}

function heuristic(node, end) { // given as node object; computes euclidean distance
  s_lat = 37.84369; n_lat = 37.91079;
  avg_lat = (s_lat + n_lat)/2;

  start_lat = node.latitude;
  start_lon = node.longitude;
  end_lat = end.latitude;
  end_lon = end.longitude;

  cos = Math.cos(avg_lat * Math.PI / 180)
  degree = 69.1694444;
  ftPerMile = 5280;

  latD = (end_lat - start_lat) * degree * ftPerMile;
  lonD = (end_lon - start_lon) * cos * degree * ftPerMile;
  return Math.sqrt(latD * latD + lonD * lonD);
}