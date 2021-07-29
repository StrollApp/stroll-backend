// given a graph, and a point with a longitude and latitude property
// find the node closest to it on the graph and return it
module.exports = function (graph, point) {
  const { longitude, latitude } = point;

  // TODO: Complete this implementation
  edges = graph.edges.slice();
  var len = edges.length;
  var min_value = Number.MAX_VALUE;
  var min_index = 0;
  for (var i = 0; i < len; i++) {
    distance = findSquareDistanceToEdge(point, edges[i]);
    if (distance < min_value) {
        min_value = distance;
        min_index = i;
    }
  }
  var edge = edges[min_index];
  var start_dist = findDistanceToCoords(point, edge.start_lat, edge.start_lon);
  var end_dist = findDistanceToCoords(point, edge.end_lat, edge.end_lon);
  var location = start_dist / (start_dist + end_dist);
  return {edge: edge, location: location}; // return the node
};

function findSquareDistanceToEdge(point, edge) {
    var lat = point.latitude;
    var lon = point.longitude;
    var start_lat = edge.start_lat;
    var start_lon = edge.start_lon;
    var end_lat = edge.end_lat;
    var end_lon = edge.end_lon;
    const cos = 0.789328039;
    lon *= cos;
    start_lon *= cos;
    end_lon *= cos;
    var ab = [end_lat - start_lat, end_lon - start_lon];
    var ba = [start_lat - end_lat, start_lon - end_lon];
    var ac = [lat - start_lat, lon - start_lon];
    var bc = [lat - end_lat, lon - end_lon];
    var bac = ab[0] * ac[0] + ab[1] * ac[1];
    var cba = ba[0] * bc[0] + ba[1] * bc[1];
    if (bac < 0 && cba < 0) {
        return;
    }
    else if (bac < 0) {
        return ac[0] * ac[0] + ac[1] * ac[1];
    }
    else if (cba < 0) {
        return bc[0] * bc[0] + bc[1] * bc[1];
    }
    var cross_product = ab[0] * ac[1] - ac[0] * ab[1];
    return cross_product * cross_product / (ab[0] * ab[0] + ab[1] * ab[1]);
}

function findDistanceToCoords(point, lat, lon) {
    const cos = 0.789328039;
    var point_lat = point.lat;
    var point_lon = point.lon;
    point_lon *= cos;
    lon *= cos;
    return Math.sqrt((lat - point_lat) * (lat - point_lat) + (lon - point_lon) * (lon - point_lon));
}