class LevelCell{
  constructor(r,c){
    this.r = r
    this.c = c
    this.owners = []
  }
  hasOwner(owner){
    return this.owners.filter(n => n.cell == owner.cell && n.dir == owner.dir).length
  }
  isOnlyOwner(owner){
    return this.hasOwner(owner) && this.owners.length == 1
  }
  removeOwner(owner){
    this.owners.forEach((n,i) => {
      if(n.cell == owner.cell && n.dir == owner.dir){
        // horrible way to do it, 
        // cause this will cause the loop to skip the next element in the array
        // but there should only be one of these in here so I don't care
        this.owners.splice(i,1)
      }
    })
  }
}

class Level{
  constructor(w,h){
    this.grid = Array(h).fill().map((n,r) => Array(w).fill().map((n,c)=>new LevelCell(r,c)))
    // Pick a starting cell
    this.startCell = this.grid[Math.floor(Math.random()*this.grid.length)][Math.floor(Math.random()*this.grid[0].length)]
    // Populate the forest, with North, South, East, 
    this.forest = []
    this.addToForest(this.startCell,0,true)
    this.addToForest(this.startCell,0,false)
    let ends = []
//     While we still have stuff to do
//    for(let i = 0; i < 10; i++){
    while(this.forest.length){
      // Pick a random index
      let ri = Math.floor(Math.random()*this.forest.length)
      // Redraw tree to get posschildren
      let tree = this.createTree(...this.forest[ri].placement)
      // Pick where to place the block along the path (tree)
      let child = this.pickChild(tree)
      // If it is possible to place a block
      if(child){
        child.block.isBlock = true
        // Remove the Placeholders that are behind the choosen child
        this.removeExcessPlaceholders(tree,child,{
          cell:this.forest[ri].placement[0],
          dir:this.forest[ri].placement[1]
        })
        this.addToForest(child,this.forest[ri].level+1)
      } else {
        ends.push(this.forest[ri])
      }
      // Chop down the tree in the forest
      this.forest.splice(ri,1)
//      console.log(this.forest.length,this.forest.map(n => n.level))
//      this.display(true)
    }
    this.pickEnd(ends)
  }
  removePlaceholder(origin){
    this.grid.forEach(row => {
      row.forEach(cell => {
        var i = cell.owners.map(n=>n.cell).indexOf(origin.cell)
        if(cell.hasOwner(origin))
          cell.owners.splice(i,1)
      })
    })
  }
  display(haveNums){
//    console.log('\x1B[2J');
    /* ϞΔ·Ͱ˹˺˻˼°·×¤ɸ±ʘՕ */
    if(haveNums)
      console.log('  '+[...Array(this.grid[0].length).keys()].join(' '))
    this.grid.forEach((row,i) => {
      let rowString = row.map(cell =>
                              cell==this.startCell?'§':'' ||
                              cell==this.endCell?'$':'' ||
                              cell.isBlock?'ʘ':'' || 
                              cell.owners[0]?'+':' ').join(' ')
      console.log((haveNums?i+' ':'')+rowString)
    })
  }
  createTree(i,f,h,all=[i],origin = {cell:i,dir:f}){
    let next, children = {poss:[],all:[]},
        getNext = () => {
          let [r,c] = [i.r+(!h*(+f||-1)),i.c+(h*(+f||-1))]
          return this.grid[r]&&this.grid[r][c]
        }
    while(next = getNext()){
      // add this one to alls
      children.all.push(i)
      // if next is a block that has not already been done, recurse
      if(next.isBlock){
        if(!all.includes(i) && (!i.owners[0] || i.isOnlyOwner(origin))){
          children.left = this.createTree(i,true,!h,all.concat(children.all),origin),
          children.right = this.createTree(i,false,!h,all.concat(children.all),origin)
        }
        break;
      }
      // if we are not on a path and next is not on a path
      if(!all.includes(i) && (!i.owners[0] || i.isOnlyOwner(origin)) &&
        !all.includes(next) && (!next.owners[0] || next.isOnlyOwner(origin))){
        children.poss.push({
          block:next,
          intersection:i,
          isHorz:!h
        })
      }
      // increment i
      i = next
    }
    // We fell off the page
    if(!next)
      children.all.push(i)
    return children
  }
  pickChild(tree){
    // give there the chance that it won't pick any
    let allPoss = [undefined]
    function getPoss(tree){
      if(!tree)return
      allPoss.push(...tree.poss)
      getPoss(tree.left)
      getPoss(tree.right)
    }
    getPoss(tree)
    return allPoss[Math.floor(Math.random()*allPoss.length)]
  }
  removeExcessPlaceholders(tree,choosen,owner,doneFlag = false){
    if(!tree) return
    tree.all.forEach(cell => {
      // Remove the placeholders that are behind the block
      if(doneFlag){
        cell.removeOwner(owner)
      }
      if(cell == choosen.block)
        doneFlag = true
    })
    // If we made it this far, then check the children
    this.removeExcessPlaceholders(tree.left,choosen,owner,doneFlag)
    this.removeExcessPlaceholders(tree.right,choosen,owner,doneFlag)
  }
  addPlaceholder(tree,owner,dir){
    if(!tree)return
    tree.all.forEach(cell => cell.owners.push({cell:owner,dir:dir}))
    this.addPlaceholder(tree.left,owner,dir)
    this.addPlaceholder(tree.right,owner,dir)
  }
  addToForest(choosen,level,isHorz){
    if(isHorz!=undefined)
      choosen = {intersection:choosen,isHorz:isHorz}
    for(let i = 0; i < 2; i++){
      let dir = i%2
      // Create the placeholder
      let tree = this.createTree(choosen.intersection,dir,choosen.isHorz)
      this.addPlaceholder(tree,choosen.intersection,dir)
      // Add to the forest
      this.forest.push({level:level,placement:[choosen.intersection,dir,choosen.isHorz]})
    }
  }
  pickEnd(ends){
    ends.sort((a,b) => b.level-a.level)
    let end,tree,done = false,
        find = (tree,end,level=0) => {
          if(!tree)return []
          if(tree.all.includes(end))
            return [{end:end,level:level}]
          else
            return find(tree.left,end,level+1).concat(find(tree.right,end,level+1))
        },
        solve = (tree) => {
          if(!tree)return []
          let found = tree.all.filter(cell => cell==this.endCell)
          let inChildren = solve(tree.left,level+1).concat(solve(tree.right,level+1))
          if(found.length){
//            console.log('found it!')
            return tree.all.slice(0,tree.all.indexOf(found[0])+1)
          }
          else if(inChildren.length)
            return tree.all.concat(inChildren)
          else 
            return []
        }
    // DANGER!!! Removing all Paths
    this.grid.forEach(row => row.forEach(cell => cell.owners = []))
    let entireTree = Array(4).fill().map((n,i) => this.createTree(this.startCell,i>=2,i%2))
    while(!done){
      tree = this.createTree(...ends[0].placement)
      end = tree.all.filter(cell => ends[0].level ==
                  Math.min(...entireTree
                                .reduce((a,tree) => a.concat(find(tree,cell)),[])
                                .map(n => n.level)))
      end = end[end.length-1]
      if(end == undefined)
        ends.shift()
      else
        done = true
    }
    this.level = ends[0].level
    this.endCell = end
    this.solution = entireTree.reduce((a,tree) => a.concat(solve(tree)),[])
    this.solution.splice(this.solution.indexOf(this.endCell))
//    console.log(this.endCell,this.solution)
    this.blocks = []  
    this.solution.reduce((last,n,i,a) => {
      let diff = i&&{r:n.r-a[i-1].r,c:n.c-a[i-1].c}
      if(diff && !diff.r && !diff.c)
        this.blocks.push(this.grid[n.r+last.r][n.c+last.c])
      return diff
    },{})
  }
}