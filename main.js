let screen,ctx,grid,level,game,
    GRID_SIZE = 30,
    CELL_COLOR = "#BBB",
    BACKGROUND_COLOR = "#000",
    TARGET_COLOR = "#904",
    PLAYER_COLOR = "#f55"
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
  game.restartLevel()
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
}

class Game{
  constructor(){
    this.commandQueue = []
    this.player = new Player()
  }
  restartLevel(){
    this.commandQueue = []
    this.player.positionMe(level.startCell)
  }
  addToQueue(dir){
    this.commandQueue.push(dir)
    if(this.commandQueue.length == 1)
      this.checkQueue()
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
    level.grid.forEach(row => {
      row.filter(cell => cell.isBlock).forEach(cell => grid.draw(cell))
    })
    ctx.fillStyle = TARGET_COLOR
    grid.draw(level.endCell)
    this.player.draw()
  }
}

class Player{
  positionMe(obj){
    this.r = obj.r
    this.c = obj.c
    this.draw()
  }
  go(dir,cb){
    let next,i = {r:this.r,c:this.c},
        normalize = n => n/Math.abs(n)||0,
        getNext = () => {
          let [r,c] = [i.r+(!dir.h*(+dir.f||-1)),i.c+(dir.h*(+dir.f||-1))]
          return level.grid[r]&&level.grid[r][c]
        }
    next = getNext()
    while(next && !next.isBlock && next != level.endCell){
      i = next
      next = getNext()
    }
    let status = !next?'died':(next==level.endCell?'won':'')
    let inc = {r:normalize(i.r-this.r),c:normalize(i.c-this.c)}
    let animation = setInterval(() => {
      this.r += inc.r
      this.c += inc.c
      this.draw(inc)
      if(this.r == i.r && this.c == i.c){
        clearInterval(animation)
        if(status == 'died')
          this.draw(null,true)
        cb(status)
      }
    },20)
  }
  draw(inc,dead){
    if(inc){
      ctx.fillStyle = "#333"
      grid.draw({r:this.r-inc.r,c:this.c-inc.c})
    }
    ctx.fillStyle = !dead?PLAYER_COLOR:"#333"
    grid.draw(this)
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

    //alert(event.keyCode);
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
      default:
        return;
    }
    // Consume the event to avoid it being handled twice
    event.preventDefault();
  }, true);
}