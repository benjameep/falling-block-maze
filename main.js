let screen,ctx,grid,level,game,
    GRID_SIZE = 30,
    CELL_COLOR = "#E7DACB",
    BACKGROUND_COLOR = "#21374B",
    UNTOUCHABLES_COLOR = "#264159",
    TARGET_COLOR = "#F15D2B",//0D4F8B
    PLAYER_COLOR = "#BE2C24",
    MAX_TRAIL_COLOR = parseInt('a0',16),
    INC_TRAIL_COLOR = 10,
    MIN_TRAIL_COLOR = parseInt('50',16),
    SOLUTION_COLOR = "#71C668",
    HINT_COLOR = "#BEC93A"
document.addEventListener("DOMContentLoaded", () => { 
  screen = document.getElementById("canvas");
  ctx = screen.getContext("2d");
  game = new Game()
  initDraw()
  initLevel()
  draw()
});
window.addEventListener('resize', () => {
  initDraw()
  initLevel()
  draw()
})

function initDraw(){
  fillScreen()
  grid = new Grid()
}

function initLevel(){
  level = new Level(grid.width,grid.height)
  game.newLevel()
  draw()
}

function draw(){
  ctx.fillStyle = BACKGROUND_COLOR
  ctx.fillRect(0,0,screen.width,screen.height)
  game.draw()
}

function fillScreen(){
  screen.width = window.innerWidth-1
  screen.height = window.innerHeight-1
}
//class Cell{
//  constructor(x,y){
//    this.x = (x + Grid.width) % Grid.width;
//    this.y = (y + Grid.height) % Grid.height;
//  }
//}
class Grid{
  constructor(){
    this.width = Math.floor(screen.width / GRID_SIZE);
    this.height = Math.floor(screen.height / GRID_SIZE);
    this.offsetX = Math.floor((screen.width % GRID_SIZE) / 2);
    this.offsetY = Math.floor((screen.height % GRID_SIZE) / 2);
  }
  draw(cell){
    ctx.fillRect(this.offsetX + cell.c * GRID_SIZE, 
                 this.offsetY + cell.r * GRID_SIZE,
                 GRID_SIZE,GRID_SIZE);
  }
  drawCircle(cell){
    ctx.beginPath()
    ctx.arc(this.offsetX + cell.c * GRID_SIZE + GRID_SIZE/2, 
            this.offsetY + cell.r * GRID_SIZE + GRID_SIZE/2,
            GRID_SIZE/2,GRID_SIZE/2,0,2*Math.PI)
    ctx.fill()
  }
}

class Game{
  constructor(){
    this.isBlind = false
    this.drawUntouchables = false
  }
  newLevel(){
    this.player = new Player()
    this.showSolution = false
    this.hints = []
    this.restartLevel()
  }
  restartLevel(){
    this.commandQueue = []
    this.player.positionMe(level.startCell)
    draw()
  }
  addToQueue(dir){
    this.commandQueue.push(dir)
    if(this.commandQueue.length == 1)
      this.checkQueue()
  }
  addHint(){
    if(this.hints.length < level.blocks.length){
      this.hints.push(level.blocks[this.hints.length])
    }
    draw()
  }
  checkQueue(){
    if(this.commandQueue.length){
      this.player.go(this.commandQueue[0],(status) => {
        if(status == 'died')
          this.restartLevel()
        else if(status == 'won')
          initLevel()
        else{
          this.commandQueue.shift()
          this.checkQueue()
        }
      })
    }
  }
  draw(){
    ctx.fillStyle = CELL_COLOR
    if(!this.isBlind){
      level.grid.forEach(row => {
        row.filter(cell => cell.isBlock).forEach(cell => grid.draw(cell))
      })
    }
    ctx.fillStyle = this.drawUntouchables?CELL_COLOR:UNTOUCHABLES_COLOR
    level.untouchables.forEach(cell => grid.draw(cell))
    this.player.drawTrail()
    if(this.showSolution){
      ctx.fillStyle = SOLUTION_COLOR
      level.solution.forEach(cell => grid.draw(cell))
    }
    ctx.fillStyle = HINT_COLOR
    this.hints.forEach(cell => grid.draw(cell))
    this.player.draw()
    ctx.fillStyle = TARGET_COLOR
    grid.draw(level.endCell)
  }
}

class Player{
  constructor(){
    this.trails = [[]]
  }
  positionMe(obj){
    this.r = obj.r
    this.c = obj.c
  }
  find(dir){
    let i = {r:this.r,c:this.c},
        getNext = () => {
          let [r,c] = [i.r+(!dir.h*(+dir.f||-1)),i.c+(dir.h*(+dir.f||-1))]
          return level.grid[r]&&level.grid[r][c]
        },
        next = getNext()
    while(next && !next.isBlock && next != level.endCell){
      i = next
      next = getNext()
    }
    return {
      status: !next?'died':(next==level.endCell?'won':'good'),
      hit: next,
      stopped:i
    }
  }
  go(dir,cb){
    let normalize = n => n/Math.abs(n)||0
    let target = this.find(dir)
    let inc = {r:normalize(target.stopped.r-this.r),c:normalize(target.stopped.c-this.c)}
    let animation = setInterval(() => {
      this.trails[this.trails.length-1].push({r:this.r,c:this.c})
      this.r += inc.r
      this.c += inc.c
      this.trails[this.trails.length-1].push({r:this.r,c:this.c})
      draw()
      if(this.r == target.stopped.r && this.c == target.stopped.c){
        clearInterval(animation)
        if(target.status == 'died')
          this.trails.push([])
        cb(target.status)
      }
    },20)
  }
  draw(){
    ctx.fillStyle = PLAYER_COLOR
    grid.draw(this)
  }
  drawTrail(){
    this.trails.forEach((trail,i) => {
      i = MAX_TRAIL_COLOR-(this.trails.length-1-i)*INC_TRAIL_COLOR
      let hex = (i>MIN_TRAIL_COLOR?i:MIN_TRAIL_COLOR).toString(16)
      ctx.fillStyle = "#"+hex+hex+hex
      trail.forEach(cell => grid.draw(cell))
    })
  }
}

/* Keyboard Handler */
{
  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return; // Should do nothing if the key event was already consumed.
    }
    // 187 +
    // 189 -

//    console.log(event.keyCode)
    switch (event.keyCode) {
      case 65: // a
      case 37: // <-
        game.addToQueue({f:0,h:1});
        break;
      case 87: // w
      case 38: // ^
        game.addToQueue({f:0,h:0});
        break;
      case 68: // d
      case 39: // ->
        game.addToQueue({f:1,h:1});
        break;
      case 83: // s
      case 40: // v
        game.addToQueue({f:1,h:0});
        break;
      case 76: // l
        game.showSolution = !game.showSolution
        draw()
        break;
      case 72: // h
        game.addHint()
        break;
      case 66: //b
        game.isBlind = !game.isBlind
        draw()
        break;
      case 85:
        game.drawUntouchables = !game.drawUntouchables
        draw()
      default:
        return;
    }
    // Consume the event to avoid it being handled twice
    event.preventDefault();
  }, true);
}