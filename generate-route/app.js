// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

const findClosesNodeToPoint = require("./helper/findClosestNodeToPoint");
const findPathBetweenNodes = require("./helper/findPathBetweenNodes");

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
    const graph = {}; // dummy variable for pointer to graph
    const startNode = findClosesNodeToPoint(graph, start);
    const endNode = findClosesNodeToPoint(graph, end);
    const path = findPathBetweenNodes(graph, startNode, endNode, safetyParams);

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
