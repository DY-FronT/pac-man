<template>
  <div
    class="ghost"
    :class="{walk: isMovingGhost}"
    :style="{
      left: blinkyPosition.x * ghostSize + 'rem',
      top: blinkyPosition.y * ghostSize + 'rem'
    }">
    <div
      v-for="({}, index) in 4"
      :key="index"
      :style="{left: index * tentacleSize / 10 + 'rem'}"
      class="tentacle" />
  </div>
</template>

<script>
import useScreenWidth from '@/mixins/useScreenWidth.js'

import { field } from '@/components/GameField/data.js'

import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      blinkyPosition: { x: 12, y: 14 },
      isMovingGhost: false,
      currentStepIndex: 0,
      gameField: field,
      path: null
    }
  },
  mixins: [useScreenWidth],
  methods: {
    isCellBlocked(x, y) {
      // Проверка на наличие стены и учет границ игрового поля
      if (
        x < 0 || x >= this.gameField[0].length ||
        y < 0 || y >= this.gameField.length ||
        this.gameField[y][x] === 1
      ) {
        return true
      }
    
      return false
    },
    findPath() {
      const start = this.blinkyPosition
      const end = this.pacmanPosition
      const path = this.findPathAlgorithm(start, end);
      this.path = path
    },
    findPathAlgorithm(start, end) {
      const openList = []
      const closedList = []

      class Node {
        constructor(x, y, parent = null) {
          this.x = x
          this.y = y
          this.parent = parent
          this.g = parent ? parent.g + 1 : 0
          this.h = 0
        }
      
        calculateHeuristic(endNode) {
          this.h = Math.abs(endNode.x - this.x) + Math.abs(endNode.y - this.y)
        }
      
        getCost() {
          return this.g + this.h
        }
      
        equals(otherNode) {
          return this.x === otherNode.x && this.y === otherNode.y
        }
      
        isEnd(endNode) {
          return this.equals(endNode)
        }

        isStart(startNode) {
          return this.equals(startNode)
        }
      }

      const startNode = new Node(start.x, start.y)
      const endNode = new Node(end.x, end.y)

      openList.push(startNode)

      while (openList.length > 0) {
        openList.sort((a, b) => a.getCost() - b.getCost())
        const currentNode = openList.shift()

        closedList.push(currentNode)

        if (currentNode.isEnd(endNode)) {
          const path = []
          let current = currentNode
          while (current !== null) {
            if (!current.isStart(startNode)) {
              path.unshift({ x: current.x, y: current.y })
            }
            current = current.parent
          }
          return path
        }

        const neighbors = [
          { x: currentNode.x + 1, y: currentNode.y },
          { x: currentNode.x - 1, y: currentNode.y },
          { x: currentNode.x, y: currentNode.y + 1 },
          { x: currentNode.x, y: currentNode.y - 1 },
        ]

        for (const neighbor of neighbors) {
          if (this.isCellBlocked(neighbor.x, neighbor.y) || closedList.some(node => node.equals(new Node(neighbor.x, neighbor.y)))) {
            continue
          }

          const newNeighbor = new Node(neighbor.x, neighbor.y, currentNode)

          const existingNeighbor = openList.find(node => node.equals(newNeighbor))
          if (existingNeighbor && newNeighbor.g >= existingNeighbor.g) {
            continue
          }

          openList.push(newNeighbor)
        }
      }

      return null
    },
    async moveGhost() {
      if (this.isMovingGhost) {
        return
      }

      this.isMovingGhost = true

      while (this.path && this.currentStepIndex < this.path.length) {
        const nextStep = this.path[this.currentStepIndex]
        this.blinkyPosition.x = nextStep.x
        this.blinkyPosition.y = nextStep.y
        this.currentStepIndex++

        await this.sleep(300)

        this.checkCollision()
      }

      this.isMovingGhost = false
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    checkCollision() {
      if (this.blinkyPosition.x === this.pacmanPosition.x && this.blinkyPosition.y === this.pacmanPosition.y) {
        alert('Вы проиграли!')
      }
    }
  },
  computed: {
    ...mapGetters({
      pacmanPosition: 'currentCoordinates/getPacmanCoordinates'
    }),
    ghostSize() {
      return this.screenWidth >= this.screenWidthBreakpoints.phones ? 2 : 1.2
    },
    tentacleSize() {
      return this.screenWidth >= this.screenWidthBreakpoints.phones ? 5 : 3
    }
  },
  watch: {
    path(newPath) {
      if (newPath) {
        this.currentStepIndex = 0
        this.moveGhost()
      }
    },
    pacmanPosition() {
      this.findPath()
    }
  },
  mounted() {
    setTimeout(() => {
      this.findPath()
    }, 3000)
  }
}
</script>

<style lang="scss">
.ghost {
  position: absolute;
  width: 2rem;
  height: 2rem;
  border-radius: 50% 50% 15% 15%;
  background: $redGhost;
  transition: top .3s linear, bottom .3s linear, right .3s linear, left .3s linear;

  @include phones {
    width: 1.2rem;
    height: 1.2rem;
  }

  &::before,
  &::after {
    content: '·';
    position: absolute;
    width: .5rem;
    height: .5rem;
    border-radius: 50%;
    top: .4rem;
    background-color: $colorWhite;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;

    @include phones {
      width: .3rem;
      height: .3rem;
      font-size: 1rem;
    }
  }

  &::before {
    left: .4rem;

    @include phones {
      left: .2rem;
    }
  }

  &::after {
    right: .4rem;

    @include phones {
      right: .2rem;
    }
  }

  &.walk {
    .tentacle {
      animation: walk 1s .5s infinite linear;
    }
  }
}

.tentacle {
  position: absolute;
  bottom: -.2rem;
  background: $redGhost;
  width: .5rem;
  height: .5rem;
  border-radius:5% 5% 50% 50%;
  transform-origin: top center;

  @include phones {
    width: .3rem;
    height: .3rem;
    bottom: -.1rem;
  }
}

@keyframes walk {
  0%  {
    transform: rotate(20deg);
  }
  25%  {
    transform: rotate(-20deg);
  }
  50%  {
    transform: rotate(20deg);
  }
  75%  { 
    transform: rotate(-20deg);
  }
  100% {  
    transform: rotate(20deg);
  }
}
</style>