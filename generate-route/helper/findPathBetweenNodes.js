// given the graph, a start, an end point (each with a longitude and latitude property), and
// a string array of safetyParams find a path that get you from one to the other in the safest 
// manner
// return the path, including the start and end points

module.exports = function (graph, startNode, endNode, safetyParams) {
  // i will assume startnode and endnode are indices for the node array in the graph

  // pq impl
  const top = 0;
  const parent = i => ((i + 1) >>> 1) - 1;
  const left = i => (i << 1) + 1;
  const right = i => (i + 1) << 1;

  class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
      this._heap = [];
      this._comparator = comparator;
    }
    size() {
      return this._heap.length;
    }
    isEmpty() {
      return this.size() == 0;
    }
    peek() {
      return this._heap[top];
    }
    push(...values) {
      values.forEach(value => {
        this._heap.push(value);
        this._siftUp();
      });
      return this.size();
    }
    pop() {
      const poppedValue = this.peek();
      const bottom = this.size() - 1;
      if (bottom > top) {
        this._swap(top, bottom);
      }
      this._heap.pop();
      this._siftDown();
      return poppedValue;
    }
    _greater(i, j) {
      return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i, j) {
      [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _siftUp() {
      let node = this.size() - 1;
      while (node > top && this._greater(node, parent(node))) {
        this._swap(node, parent(node));
        node = parent(node);
      }
    }
    _siftDown() {
      let node = top;
      while (
        (left(node) < this.size() && this._greater(left(node), node)) ||
        (right(node) < this.size() && this._greater(right(node), node))
      ) {
        let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
        this._swap(node, maxChild);
        node = maxChild;
      }
    }
  }

  // this assumes all the regions bs is taken care of already
  // heuristic will be euclidean distance using lat/lon
  // TODO: implement turning thing...
  // TODO: review astar pseudocode w bibarb
  // TODO: implement edgeScore; need to make sure lights dont make things negative or < 1 even
  // can we label first column of CSVs,,

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