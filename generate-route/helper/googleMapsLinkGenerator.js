// create Google maps url, when opened, routes the user from
// the start to end points through the selected waypoints
module.exports = function (start, waypoints, end) {
  var routeURL = "https://www.google.com/maps/dir/";
  const points = [start, ...waypoints, end];
  points.forEach(loc => {
    routeURL += `${loc.latitude},${loc.longitude}/`;
  });
  routeURL += "data=!4m2!4m1!3e2";
  return routeURL;
};
