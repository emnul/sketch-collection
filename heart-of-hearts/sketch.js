p5.disableFriendlyErrors = true;
let bDoExportSvg = false;

let canvasWidth = 5.5 * 96;
let canvasHeight = 8.5 * 96;

let centralHeartSizeSlider;
let centralHeartAbbSlider;
let smallHeartSizeSlider;

let numPointsCentralHeartInput;
let numPointsSmallHeartInput;

function setup() {
  background(255);
  noFill();

  createCanvas(canvasWidth, canvasHeight); // 5.5"x8.5" at 96 dpi

  centralHeartSizeSliderLabel = createElement("label", "Center Heart Size");
  centralHeartSizeSlider = createSlider(30, 150, 97);
  centralHeartSizeSlider.size(100);
  centralHeartSizeSliderLabel.child(centralHeartSizeSlider);

  centralHeartAbbSliderLabel = createElement(
    "label",
    "Center Heart Abberation",
  );
  centralHeartAbbSlider = createSlider(0, 0.5, 0, 0);
  centralHeartAbbSlider.size(100);
  centralHeartAbbSliderLabel.child(centralHeartAbbSlider);

  smallHeartSizeSliderLabel = createElement("label", "Small Heart Size");
  smallHeartSizeSlider = createSlider(1, 20, 20, 0);
  smallHeartSizeSlider.size(100);
  smallHeartSizeSliderLabel.child(smallHeartSizeSlider);

  numPointsCentralHeartInputLabel = createElement(
    "label",
    "num points central heart",
  );
  numPointsCentralHeartInput = createInput(80, "number");
  numPointsCentralHeartInputLabel.child(numPointsCentralHeartInput);

  numPointsSmallHeartInputLabel = createElement(
    "label",
    "num points small heart",
  );
  numPointsSmallHeartInput = createInput(20, "number");
  numPointsSmallHeartInputLabel.child(numPointsSmallHeartInput);
}

// numSteps determines how many points in a path
function rangey(start, end, numSteps) {
  const seq = [];

  let totalRange = Math.abs(start) + Math.abs(end);
  let step = totalRange / numSteps;

  if (start > end) {
    for (let i = start; i >= end; i -= step) {
      seq.push(i);
    }
  } else if (start < end) {
    for (let i = start; i <= end; i += step) {
      seq.push(i);
    }
  } else {
    throw new Error("Invalid range");
  }

  return seq;
}

// Function that plots topHalf of a heart
// size scales heart
// range of x is [2, -2]
// We multiply y by -size to scale and flip the shape
let topHalfPointFn = (x, size) =>
  Math.sqrt(1 - Math.pow(Math.abs(x) - 1, 2)) * -size;

// Function that plots bottomHalf of a heart
// size scales heart
// range of x is [2, -2]
// We multiply y by -size to scale and flip the shape
let bottomHalfPointFn = (x, size) => (Math.acos(1 - Math.abs(x)) - PI) * -size;

// Draws Small Holzapfel's Heart Using Provided Points
function drawHolzapfelsHeart(points) {
  beginShape();
  for (const p of points) {
    vertex(p[0], p[1]);
  }
  endShape(CLOSE);
}

// Function that creates a list of points that form a heart shape in the center of the canvas
function holzapfelsHeartCurvePath(
  size,
  originX,
  originY,
  topHalfRange,
  bottomHalfRange,
) {
  let points = [];

  // Points that make up top of heart
  for (const x of topHalfRange) {
    let y = topHalfPointFn(x, size);
    // Need to multiply x by size to scale it to match y's scale
    points.push([x * size + originX, y + originY]);
  }

  // Draw bottom half of heart
  for (const x of bottomHalfRange) {
    let y = bottomHalfPointFn(x, size);
    points.push([x * size + originX, y + originY]);
  }

  // [[x1, y1], [x2, y2], ... [xn, yn]]
  return points;
}

function keyPressed() {
  // Press 's' to save an SVG file of the current plot
  if (key == "s") {
    bDoExportSvg = true;
  } else if (key == " ") {
    loop();
  }
}

function draw() {
  background(255);
  // Length of topHalfRange + bottomHalfRange = total # of points in center heart = 160
  let topHalfCenterHeartRange = rangey(
    -2,
    2,
    numPointsCentralHeartInput.value(),
  );
  let bottomHalfCenterHeartRange = rangey(
    2,
    -2,
    numPointsCentralHeartInput.value(),
  );

  // Length of topHalfRange + bottomHalfRange = total # of points in small heart = 40
  let topHalfSmallHeartRange = rangey(-2, 2, numPointsSmallHeartInput.value());
  let bottomHalfSmallHeartRange = rangey(
    2,
    -2,
    numPointsSmallHeartInput.value(),
  );

  let centerHeartPathPoints = holzapfelsHeartCurvePath(
    centralHeartSizeSlider.value(),
    canvasWidth / 2,
    canvasHeight / 2.5,
    topHalfCenterHeartRange,
    bottomHalfCenterHeartRange,
  );
  let abb = centralHeartAbbSlider.value(); // % abberation for each point
  centerHeartPathPoints = centerHeartPathPoints.map((p) => {
    // adds abberation to all points
    let abbValueX = random(1 - abb, 1 + abb);
    let abbValueY = random(1 - abb, 1 + abb);
    return [p[0] * abbValueX, p[1] * abbValueY];
  });

  if (bDoExportSvg) {
    // Begin exporting, if requested
    beginRecordSVG(this, "heart-of-hearts.svg");
  }

  // Draw a small heart at every point in the centerHeartPathPoints arr
  for (const p of centerHeartPathPoints) {
    // generate points of smaller heart
    let smallHeartPoints = holzapfelsHeartCurvePath(
      smallHeartSizeSlider.value(),
      p[0],
      p[1],
      topHalfSmallHeartRange,
      bottomHalfSmallHeartRange,
    );

    drawHolzapfelsHeart(smallHeartPoints);
  }

  if (bDoExportSvg) {
    // End exporting, if doing so
    endRecordSVG();
    bDoExportSvg = false;
  }

  noLoop();
}
