var level = {
  width: 6,
  height: 6,
  start: {x:1,y:1},
  end: {x:4,y:4},
  blocks:[
    {x:1,y:3},
    {x:3,y:2},
    {x:4,y:1},
  ]
}

const cellSize = 50

const backgroundColors = ["#34A2B7", "#46B3C7", "#3DABBF", "#2C9AAE", "#2491A5"]

var currBackground = []

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function setup() {
  createCanvas(innerWidth, innerHeight)
  assignColors()
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  drawBoard(level)
}

function drawBoard(level) {
  for (var row = 0; row < level.height; row++) {
    for (var col = 0; col < level.width; col++) {
      fill(currBackground[row][col])
      noStroke()
      rect(col*cellSize, row*cellSize, cellSize, cellSize)
      if (level.blocks.find(n => n.x==col && n.y==row)) {
        fill("#000000")
        rect(col*cellSize, row*cellSize, cellSize, cellSize, cellSize*0.1)
        fill("#484848")
        rect(col*cellSize, row*cellSize, cellSize, cellSize-(cellSize*0.055), cellSize*0.1)
      }
      if (level.end.x==col && level.end.y==row) {
        fill("#000000")
        rect(col*cellSize, row*cellSize, cellSize, cellSize, cellSize*0.1)
        fill("#ffffff")
        rect(col*cellSize, row*cellSize, cellSize, cellSize-(cellSize*0.055), cellSize*0.1)
      }
    }
  }
}

function assignColors() {
  for (var row = 0; row < level.height; row++) {
    currBackground[row] = []
    for (var col = 0; col < level.width; col++) {
      var color = backgroundColors[getRandomInt(4)]
      currBackground[row][col] = color
    }
  }
}