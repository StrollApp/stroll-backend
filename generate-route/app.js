// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

const findClosestNodeToPoint = require("./helper/findClosestNodeToPoint");
const findPathBetweenNodes = require("./helper/findPathBetweenNodes");

// budu's testing stuff
const edgeArray = require("./edges.json");
const nodeArray = require("./nodes.json");
//

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
    }; // dummy variable for pointer to graph
    // i guess i want this to contain an array of edge objects and an array of node objects
    /* 
    {
      edges: []
      nodes: []
    }
    and a node is like
    {
      index: 
      id: 
      lat: 
      long: 
      adjacencies: []
    }
    */
    // with property names as specified in csv file
    // except any list separated with - should just be an array ig
/*
    const startNode = findClosestNodeToPoint(graph, start); // this should return an index...
    const endNode = findClosestNodeToPoint(graph, end);
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
