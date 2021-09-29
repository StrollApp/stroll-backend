module.exports = function edgeScore (edge, safetyParams) { // edge is an edge object, safetyparam is array of strings
  const LIGHT_COEFF = 1/20;
  const CRIME_COEFF = 8/45;
  // notes: max lights = 30, max crime = 105 !
  
  let light = 0;
  if(safetyParams.includes("streetLights")) {
    light = lightScore(edge);
  }

  let crime = 0;
  if(safetyParams.includes("crime")) {
    crime = crimeScore(edge);
  }

  return edge.distance * (1 + LIGHT_COEFF * light + CRIME_COEFF * crime); // MAKE SURE SECOND TERM IS >= 1
}

function lightScore(edge) {
  const lightRatio = edge.light_count / edge.distance;
  return Math.max(0, 1 - 50 * lightRatio);
}

function crimeScore(edge) {
  const crimes = edge.crime_count
  if(crimes <= 15) {
    return crimes;
  }
  else if(crimes <= 50) {
    return 15 + (crimes - 15) * 0.5;
  }
  else {
    return 30 + (crimes - 45) * 0.25;
  }
}

// for later
/*function treeScore(edge) {

}*/