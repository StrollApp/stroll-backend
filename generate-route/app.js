// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

const findClosestEdgeToPoint = require("./helper/findClosestEdgeToPoint");
const findPathBetweenNodes = require("./helper/findPathBetweenNodes");
const edgeScore = require("./helper/edgeScore");

// import graph data
const edgeArray = require("./edges.json");
const nodeArray = require("./nodes.json");

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (event, context) => {
  try {
    // extract start point, end point, and safety params
    const query = JSON.parse(event.body);
    const { start, end } = query.points;
    const safetyParams = query.safetyParams;

    // solve for route
    const graph = {
      edges: edgeArray,
      nodes: nodeArray
    };
    /* contains an array of edge objects and an array of node objects
    {
      edges: []
      nodes: []
    }
    and a node is of the form
    {
      index: 
      id: 
      lat: 
      long: 
      adjacencies: 
    }
    (and similar for edges)
    */
    const nodes = graph.nodes.slice();

    const startParams = findClosestEdgeToPoint(graph, start);
    const endParams = findClosestEdgeToPoint(graph, end);
    const startEdge = startParams.edge;
    const startLocation = startParams.location;
    const endEdge = endParams.edge;
    const endLocation = endParams.location;
    const startNode0 = nodes.findIndex(element => element.id === startEdge.start_id);
    const startNode1 = nodes.findIndex(element => element.id === startEdge.end_id);
    const endNode0 = nodes.findIndex(element => element.id === endEdge.start_id);
    const endNode1 = nodes.findIndex(element => element.id === endEdge.end_id);

    const startEdgeDist = edgeScore(startEdge, safetyParams);
    const endEdgeDist = edgeScore(endEdge, safetyParams);

    const result00 = findPathBetweenNodes(graph, startNode0, endNode0, safetyParams);
    const result01 = findPathBetweenNodes(graph, startNode0, endNode1, safetyParams);
    const result10 = findPathBetweenNodes(graph, startNode1, endNode0, safetyParams);
    const result11 = findPathBetweenNodes(graph, startNode1, endNode1, safetyParams);
    const dists = [
      startEdgeDist * startLocation + result00.dist + endEdgeDist * endLocation, 
      startEdgeDist * startLocation + result01.dist + endEdgeDist * (1 - endLocation), 
      startEdgeDist * (1 - startLocation) + result10.dist + endEdgeDist * endLocation, 
      startEdgeDist * (1 - startLocation) + result11.dist + endEdgeDist * (1 - endLocation)
    ];
    var index = 0;
    var min = Number.MAX_VALUE;
    for (var i = 0; i < 4; i++) {
      if (dists[i] < min) {
        min = dists[i];
        index = i;
      }
    }

    var path;
    if (index === 0) {
      path = result00.path;
    }
    else if (index === 1) {
      path = result01.path;
    }
    else if (index === 2) {
      path = result10.path;
    }
    else if (index === 3) {
      path = result11.path;
    }

    // TODO: do shit with the path and the endpoints

/* after findClosestEdgeToPoint is done use this:
    const startEdge = findClosestEdgeToPoint(graph, start); // this should return an index...
    const endEdge = findClosestEdgeToPoint(graph, end);
    // look at each endpoint on edge and find closest paths
    const path = findPathBetweenNodes(graph, startNode, endNode, safetyParams);
*/

// budu test
    const path = findPathBetweenNodes(graph, 5088, 5093, safetyParams);

    // generate return route
    const route = {
      start,
      waypoints: path,
      end
    };

    // generate response object
    response = {
      statusCode: 200,
      body: JSON.stringify({ route })
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};
