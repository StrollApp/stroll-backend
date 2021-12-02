const crimePoints = require("./data/crimeDataPoints.json");
const streetLightPoints = require("./data/streetLightDataPoints.json");

let response;

/**
 *
 * get-heatmap-data takes an event object from the query that asks for certain data points for
 * heatmap generation (ex: for crime, streetlight, foot traffic data etc.), and returns an array
 * containing heatmap points.
 *
 * @param {Object} event - contains query information
 * The event body should contain an object of the shape {"type": String}, specifying the type of
 * data being queried for heatmap generation. The string can take on "CRIME", "STREET_LIGHT",
 * or "FOOT_TRAFFIC", though for now, it will only work for "CRIME" and "STREET_LIGHT".
 *
 * @returns [Object] array - contains array of data points
 * Each data point will have the shape {"Longitude": Number, "Latitude": Number} and optionally a
 * Number "Weight" attribute.
 *
 */
exports.lambdaHandler = async (event, context) => {
  try {
    // extract claims
    const claims = event.requestContext.authorizer.jwt.claims;

    // extract type of map queried
    const query = JSON.parse(event.body);
    const type = query.type;

    // log query
    console.log(
      `\n[GET HEATMAP DATE QUERY]:\n` +
        `FROM ${JSON.stringify({
          id: claims.user_id,
          email_verified: claims.email_verified
        })}\n` +
        `FOR ${event.body}`
    );

    // set output data
    var dataArray = [];
    switch (type) {
      case "CRIME":
        dataArray = crimePoints;
        break;
      case "STREET_LIGHT":
        dataArray = streetLightPoints;
        break;
      default:
        break;
    }

    // generate response object
    response = {
      statusCode: 200,
      body: JSON.stringify({ dataArray })
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};
