<template>
  <div class="box">
    <div class="game-restart" @click="restartGame">
      再来一局
    </div>
    <canvas ref="canvas" width="300" height="300" @click="clickTable"></canvas>
    <div class="game-refs">
      <p v-if="!isEnd">next player: {{nextPlayer.name}}</p>
      <p v-else :class="['winner', winner.color]">winner: {{winner.name}}</p>
    </div>
    <div class="game-stpes" v-if="allSteps.length > 0">
      <p>历史记录（点击可返回到对应步骤）：</p>
      <ul>
        <li v-for="(item, index) in allSteps" :key="'step'+index"
          @click="clickHistoryStep(item, index)"
        >
          step{{index+1}}: {{item.name}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      context: '',
      isEnd: false,
      winner: {},
      player1: {
        name: '红队',
        color: 'red',
        steps: []
      }, 
      player2: {
        name: '蓝队',
        color: 'blue',
        steps: []
      },
      thisPlayer: {},
      nextPlayer: {},
      boardArray: [],
      cellNum: 0,
      allSteps: [],
      pairCount: []
    }
  },
  created () {
    this.nextPlayer = this.copyObj(this.player1)
  },
  mounted () {
    this.init()
  },
  methods: {
 
    // 初始化
    init () {
      let canvas = this.$refs.canvas
      this.context = canvas.getContext('2d')
      this.drawTableBg()        // 背景
      this.setBoardArray()     // 格子组合，用于监听是否可点击
      this.linePairArray()     // 所有可组合的直线队列
    },

    restartGame () {
      this.resetCanvas()
      this.player1.steps = []
      this.player2.steps = []
      this.allSteps = []
      this.isEnd = false
      this.winner = {}
    },

    // 清空画布
    resetCanvas () {
      this.context.clearRect(0, 0, 300, 300)
      this.drawTableBg()
      this.setBoardArray()
    },

    // 所有格子
    setBoardArray () {
      this.boardArray = []
      let cellArray = []
      for (let i = 0; i < 3; i++) {
        this.boardArray[i] = []
        for (let j = 0; j < 3; j++) {
          let val = [i, j, 'notClick']
          this.boardArray[i][j] = [...val]
          cellArray.push([i, j])
        }
      }
      this.cellNum = cellArray.length
      console.log(cellArray)
      console.log(this.boardArray)
    },

    // 所有直线组合
    linePairArray () {
      let pairCount = []
      // 纵向直线
      for (let i = 0; i < 3; i++) {
        let pairOne = []
        for (let j = 0; j < 3; j++) {
         pairOne.push([i, j])
        }
        pairCount.push(pairOne)
      }
      // 横向直线
      for (let i = 0; i < 3; i++) {
        let pairOne = []
        for (let j = 0; j < 3; j++) {
         pairOne.push([j, i])
        }
        pairCount.push(pairOne)
      }

      // 斜线
      let center = [1, 1]   // 暂定，需要计算得到
      let center_x = center[0]
      let center_y = center[1]
      // 右斜线
      let center_left_top_x = center_x - 1
      let center_left_top_y = center_y - 1
      let center_right_bottom_x = center_x + 1
      let center_right_bottom_y = center_y + 1
      // 左斜线
      let center_right_top_x = center_x + 1
      let center_right_top_y = center_y - 1
      let center_left_bottom_x = center_x - 1
      let center_left_bottom_y = center_y + 1

      let right_italyLine = [[
        [center_left_top_x, center_left_top_y],
        center,
        [center_right_bottom_x, center_right_bottom_y]
      ]]

      let left_italyLine = [[
        [center_right_top_x, center_right_top_y],
        center,
        [center_left_bottom_x, center_left_bottom_y]
      ]]

      pairCount = [...pairCount, ...right_italyLine, ...left_italyLine]
      this.pairCount = pairCount
    },
    
    // 绘制棋盘
    drawTableBg () {
      const { context } = this
      context.beginPath()
      context.strokeStyle = '#000'
      for (let i = 0; i < 4; i++) {
        context.moveTo(i * 100, 0)
        context.lineTo(i * 100, 300)
        context.stroke()
        context.moveTo(0, i * 100)
        context.lineTo(300, i * 100)
        context.stroke()
      }
      context.closePath()
    },

    // 坐标，落子
    onStep (x, y, nextPlayer) {
      const { context } = this
      context.beginPath()
      context.arc(50 + x * 100, 50 + y * 100, 20, 0, 2 * Math.PI)
      context.closePath()
      context.fillStyle = nextPlayer.color
      context.fill()
    },

    // 棋盘点击事件
    clickTable (e) {
      const ox = e.offsetX
      const oy = e.offsetY
      const x = Math.floor(ox / 100)
      const y = Math.floor(oy / 100)

      if (this.isEnd) {
        this.openAlert(`本次游戏已结束，${this.winner.name}胜，请再来一局或回到历史记录`)
        return
      }

      if (this.boardArray[x][y][2] === 'notClick') {
        this.boardArray[x][y][2] = 'clicked'
        this.boardArray[x][y][3] = this.nextPlayer.name
        this.thisPlayer = this.copyObj(this.nextPlayer)
        this.thisPlayer.pos = [x, y]
        this.onStep(x, y, this.nextPlayer)
        this.allSteps.push({
          name: this.nextPlayer.name,
          color: this.nextPlayer.color,
          pos: [x, y]
        })
        if (this.nextPlayer.name === this.player1.name) {
          this.player1.steps.push({pos: [x, y]})
          this.nextPlayer = {}
          this.nextPlayer = this.copyObj(this.player2)
        } else {
          this.player2.steps.push({pos: [x, y]})
          this.nextPlayer = {}
          this.nextPlayer = this.copyObj(this.player1)
        }
      }

      //判断是否在一条直线上
      this.pairOfLine()
      
    },

    // 是否在一条直线上，返回数组 linkOne
    pairOfLine () {
      let thisPlayer = this.thisPlayer
      let steps_data = []
      if (thisPlayer.name === this.player1.name) {
        steps_data = [...this.player1.steps]
      } else {
        steps_data = [...this.player2.steps]
      }
      let steps_len = steps_data.length
      if (steps_len < 3) {
        return
      }

      let linkArray = this.pairCount

      // 提取最后的组合数组
      let linkOne = []
      let linkCount = 0

      for (let m = linkArray.length - 1 ; m > -1 ; m--) {
          let linkItem = linkArray[m] 
          
          if (linkCount > 2) {
            break
          } else {
            linkCount = 0
          }

          for (let n = 0; n < linkItem.length; n++) {
            let link_xy = linkItem[n]

            if (linkCount > 2) {
              break
            }

            for (let k = 0; k < steps_data.length; k++) {
              let step_xy = steps_data[k].pos
              
               if (link_xy[0] === step_xy[0] && link_xy[1] === step_xy[1]) {
                 linkCount ++
                 if (linkCount > 2) {  // 同一个组合，三个数都在步数里面
                   linkOne = linkItem
                 }
                 break
              }
            } 
          }         
        }

      console.log('linkOne', linkOne)
      let _this = this
      if (linkOne.length > 0) {
        this.isEnd = true
        this.winner.name = this.thisPlayer.name
        this.winner.color = this.thisPlayer.color
        setTimeout(() => {
          _this.openAlert(`本次游戏已结束，${this.winner.name}胜，请再来一局或回到历史记录`)
        }, 800);

      } else {
        let allStepsLength = this.allSteps.length
        if (allStepsLength === this.cellNum && allStepsLength > 0) {
          setTimeout(() => {
            _this.openAlert('游戏已结束，暂无胜负。点击再来一局')
          }, 800);
        }
      }
    }, 

    // 点击历史记录
    clickHistoryStep (item, idx) {
      if (idx === this.allSteps.length - 1) {
        return
      }
      this.isEnd = false
      this.winnerName = ''
      this.allSteps.splice(idx + 1)
      // 清空画布，清空玩家数据
      this.resetCanvas()
      this.player1.steps = []
      this.player2.steps = []
      // 根据剩下的总步数，重新整理玩家的步数
      let allSteps = this.allSteps
      allSteps.forEach((v, i) => {
        let x = v.pos[0]
        let y = v.pos[1]
        this.boardArray[x][y][2] = 'clicked'
        this.boardArray[x][y][3] = v.name
        this.onStep(x, y, v)
        if (v.name === this.player1.name) {
          this.player1.steps.push({pos: [x, y]})
        } else {
          this.player2.steps.push({pos: [x, y]})
        }
      })
      // 下个玩家
      if (item.name === this.player1.name) {
        this.nextPlayer = {}
        this.nextPlayer = this.copyObj(this.player2)
      } else {
        this.nextPlayer = {}
        this.nextPlayer = this.copyObj(this.player1)
      }
    },

    openAlert (content) {
      return this.$layer.alert(content, {
        title: '提示'
      })
    },

    copyObj (obj) {
      let obj_c = JSON.parse(JSON.stringify(obj))
      return { name: obj_c.name, color: obj_c.color }
    }
  }
}
</script>

<style lang="scss" scoped>
  .box{
    width: 300px;
    margin: 0 auto;
    text-align: left;
    canvas{
      border: 1px solid #ddd;
      margin: 20px auto;
      background: #fff;
      box-shadow: -2px 0 2px #efefef, 5px 5px 5px #b9b9b9;
    }
  }
  .game-refs {
    > p {
      font-size: 24px;
    }
  }
  .game-stpes {
    ul {
      li {
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        } 
      }
    }
  }
  .winner {
    font-size: 24px;
  }
  .red {
    color: red;
  }
  .blue {
    color: blue;
  }
  .game-restart {
    border: 1px solid rgba(0, 0, 0, 0.3);
    line-height: 40px;
    cursor: pointer;
    text-align: center;
    background-color: rgba(158, 158, 158, 0.3);
    &:hover {
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
</style>
