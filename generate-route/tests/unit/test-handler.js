"use strict";

const app = require("../../app.js");
const chai = require("chai");
const expect = chai.expect;

const getRouteURL = require("../../helper/googleMapsLinkGenerator");

describe("query to /generate-route lambda function", function () {
  it("should return valid response on valid input", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          start: {
            longitude: -122.26100921630858,
            latitude: 37.86726491715302
          },
          end: {
            longitude: -122.26530075073242,
            latitude: 37.86997517701081
          }
        },
        safetyParams: ["crime", "streetLights"]
      })
    };

    const result = await app.lambdaHandler(query, {});
    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);

    let response = JSON.parse(result.body);
    expect(response).to.be.an("object");
    expect(response).to.have.property("route");
    expect(response.route).to.be.an("object");

    let route = response.route;
    expect(route).to.have.property("start");
    expect(route).to.have.property("waypoints");
    expect(route).to.have.property("end");

    const { start, waypoints, end } = route;

    const points = [start, ...waypoints, end];
    points.forEach(point => {
      expect(point).to.have.property("longitude");
      expect(point).to.have.property("latitude");
      expect(point.longitude).to.be.an("number");
      expect(point.latitude).to.be.an("number");
    });

    const link = getRouteURL(start, waypoints, end);
    console.log(
      `   The result can be inspected with the following Google Maps link ${link}`
    );
  });
});
