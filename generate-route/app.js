// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

const findClosestEdgeToPoint = require("./helper/findClosestEdgeToPoint");
const findPathBetweenNodes = require("./helper/findPathBetweenNodes");
const edgeScore = require("./helper/edgeScore");

// import graph data
const edgeArray = require("./edges.json");
const indexedNodes = require("./indexedNodes.json");

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
      nodes: indexedNodes
    };
    /* contains an array of edge objects and an array of node objects
    {
      edges: [],
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

    const startParams = findClosestEdgeToPoint(graph, start);
    const endParams = findClosestEdgeToPoint(graph, end);
    const startEdge = startParams.edge;
    const startLocation = startParams.location;
    const endEdge = endParams.edge;
    const endLocation = endParams.location;

    const startNode0 = startEdge.start_id;
    const startNode1 = startEdge.end_id;
    const endNode0 = endEdge.start_id;
    const endNode1 = endEdge.end_id;

    const startEdgeDist = edgeScore(startEdge, safetyParams);
    const endEdgeDist = edgeScore(endEdge, safetyParams);

    var possiblePaths = [];

    possiblePaths[0] = findPathBetweenNodes(
      graph,
      startNode0,
      endNode0,
      safetyParams
    );
    possiblePaths[1] = findPathBetweenNodes(
      graph,
      startNode0,
      endNode1,
      safetyParams
    );
    possiblePaths[2] = findPathBetweenNodes(
      graph,
      startNode1,
      endNode0,
      safetyParams
    );
    possiblePaths[3] = findPathBetweenNodes(
      graph,
      startNode1,
      endNode1,
      safetyParams
    );

    const dists = [
      startEdgeDist * startLocation +
        possiblePaths[0].dist +
        endEdgeDist * endLocation,
      startEdgeDist * startLocation +
        possiblePaths[1].dist +
        endEdgeDist * (1 - endLocation),
      startEdgeDist * (1 - startLocation) +
        possiblePaths[2].dist +
        endEdgeDist * endLocation,
      startEdgeDist * (1 - startLocation) +
        possiblePaths[3].dist +
        endEdgeDist * (1 - endLocation)
    ];

    const index = dists.indexOf(Math.min(...dists));
    var path = possiblePaths[index].path;

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
