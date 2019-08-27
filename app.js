function setup() {
  createCanvas(innerWidth, innerHeight)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  ellipse(50, 50, 80, 80);
}