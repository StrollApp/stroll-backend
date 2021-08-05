"use strict";

const app = require("../../app.js");
const chai = require("chai");
const expect = chai.expect;

const getRouteURL = require("../../helper/googleMapsLinkGenerator");

// test a given query
const testQuery = async query => {
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
    ` The original route would have been https://www.google.com/maps/dir/${start.latitude},${start.longitude}/${end.latitude},${end.longitude}/data=!4m2!4m1!3e2`
  );
  console.log(
    `   The result has ${waypoints.length} waypoints and can be inspected with the following Google Maps link ${link}\n\n\n`
  );
};

describe("query to /generate-route lambda function", function () {
  it("1) should return valid response on query, basic sanity check", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          // original unit test:
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
    await testQuery(query);
  });

  it("2) should return valid response on query, basic sanity check", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          // budu unit test:
          start: {
            longitude: -122.2759143292285,
            latitude: 37.884688478564016
          },
          end: {
            longitude: -122.28257650112171,
            latitude: 37.88888613298019
          }
        },
        safetyParams: ["crime", "streetLights"]
      })
    };
    await testQuery(query);
  });

  it("3) path going through people's park", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          // peoples park test
          start: {
            latitude: 37.86657697036694,
            longitude: -122.25407911520239
          },
          end: {
            latitude: 37.86545734582157,
            longitude: -122.26316730880775
          }
        },
        safetyParams: ["crime", "streetLights"]
      })
    };
    await testQuery(query);
  });

  it("4) path going from unit 2 to RSF", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          start: {
            latitude: 37.8662019598997,
            longitude: -122.25470066070557
          },
          end: {
            latitude: 37.86866240734136,
            longitude: -122.2628116607666
          }
        },
        safetyParams: ["crime", "streetLights"]
      })
    };
    await testQuery(query);
  });

  it("5) path going from unit 2 to somewhere north of campus", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          start: {
            latitude: 37.8662019598997,
            longitude: -122.25470066070557
          },
          end: {
            latitude: 37.88102692319533,
            longitude: -122.26441025733948
          }
        },
        safetyParams: ["crime", "streetLights"]
      })
    };
    await testQuery(query);
  });

  it("6) path from S. tip of Berkeley to N. tip of Berkeley", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          start: {
            latitude: 37.894904889845144,
            longitude: -122.28195190429686
          },
          end: {
            latitude: 37.84910360472934,
            longitude: -122.27105140686035
          }
        },
        safetyParams: ["crime", "streetLights"]
      })
    };
    await testQuery(query);
  });

  it("7) path from SW tip of Berkeley to NE tip of Berkeley", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          start: {
            latitude: 37.84926456884684,
            longitude: -122.29658603668211
          },
          end: {
            latitude: 37.90206723405876,
            longitude: -122.26727485656738
          }
        },
        safetyParams: ["crime", "streetLights"]
      })
    };
    await testQuery(query);
  });

  it("8) path from S. tip of Berkeley to N. tip of Berkeley (street lights only)", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          start: {
            latitude: 37.894904889845144,
            longitude: -122.28195190429686
          },
          end: {
            latitude: 37.84910360472934,
            longitude: -122.27105140686035
          }
        },
        safetyParams: ["streetLights"]
      })
    };
    await testQuery(query);
  });

  it("9) path from SW tip of Berkeley to NE tip of Berkeley (street lights only)", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          start: {
            latitude: 37.84926456884684,
            longitude: -122.29658603668211
          },
          end: {
            latitude: 37.90206723405876,
            longitude: -122.26727485656738
          }
        },
        safetyParams: ["streetLights"]
      })
    };
    await testQuery(query);
  });

  it("10) offset path from SW tip of Berkeley to NE tip of Berkeley (street lights only)", async () => {
    // set up query object to send to function
    const query = {
      body: JSON.stringify({
        points: {
          start: {
            latitude: 37.850004862706705,
            longitude: -122.27608874722878
          },
          end: {
            latitude: 37.88629074736004,
            longitude: -122.28377570657851
          }
        },
        safetyParams: ["streetLights"]
      })
    };
    await testQuery(query);
  });
});
