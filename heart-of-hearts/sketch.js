p5.disableFriendlyErrors = true;
let bDoExportSvg = false;

let canvasWidth = 5.5 * 96;
let canvasHeight = 8.5 * 96;

let centralHeartSizeSlider;
let centralHeartAbbSlider;
let smallHeartSizeSlider;

function setup() {
	background(255);
	noFill();

	createCanvas(canvasWidth, canvasHeight); // 5.5"x8.5" at 96 dpi

	centralHeartSizeSlider = createSlider(30, 150, 97);
	centralHeartSizeSlider.size(100);

	centralHeartAbbSlider = createSlider(0, 0.5, 0, 0);
	centralHeartAbbSlider.size(100);

	smallHeartSizeSlider = createSlider(1, 20, 20, 0);
	smallHeartSizeSlider.size(100);
}

function rangey(start, end, step) {
	const seq = [];

	if (start > end && step < 0) {
		for (let i = start; i >= end; i += step) {
			seq.push(i);
		}
	} else if (start < end && step > 0) {
		for (let i = start; i <= end; i += step) {
			seq.push(i);
		}
	} else {
		throw new Error("Invalid range");
	}

	return seq;
}

// Length of topHalfRange + bottomHalfRange = total # of points in center heart = 160
let topHalfCenterHeartRange = rangey(-2, 2, 0.025);
let bottomHalfCenterHeartRange = rangey(2, -2, -0.025);

// Length of topHalfRange + bottomHalfRange = total # of points in center heart = 40
let topHalfSmallHeartRange = rangey(-2, 2, 0.2);
let bottomHalfSmallHeartRange = rangey(2, -2, -0.2);

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
		let abbValue = random(1 - abb, 1 + abb);
		return [p[0] * abbValue, p[1] * abbValue];
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
