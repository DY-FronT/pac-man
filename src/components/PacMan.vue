<template>
  <div
    class="pacMan"
    :class="[direction, { move: isMoving, portal: onPortal }]"
    :style="{
      left: coordinateX * pacManSize + 'rem',
      top: coordinateY * pacManSize + 'rem'
    }"
    tabindex="0"
    @keydown="handleKeyDown($event)">
    <div class="pacMan__eye" />
  </div>
</template>

<script>
import useScreenWidth from '@/mixins/useScreenWidth.js'

import { mapActions } from 'vuex'

export default {
  props: {
    gamingField: {
      type: Array,
      desc: 'Массив с координатами игрового поля'
    }
  },
  mixins: [useScreenWidth],
  data() {
    return {
      coordinateX: 1,
      coordinateY: 1,
      currentDirection: { deltaX: 0, deltaY: 0 },
      directionMove: null,
      isMoving: false,
      onPortal: false
    }
  },
  methods: {
    ...mapActions({
      ACTION_SET_COORDINATES: 'currentCoordinates/updatePacmanCoordinates'
    }),
    handleKeyDown(event) {
      const validDirection = {
        up: ['w', 'ц', 'ArrowUp'],
        down: ['s', 'ы', 'ArrowDown'],
        left: ['a', 'ф', 'ArrowLeft'],
        right: ['d', 'в', 'ArrowRight']
      }
    
      const directionCoordinates = {
        up: { deltaX: 0, deltaY: -1 },
        down: { deltaX: 0, deltaY: 1 },
        left: { deltaX: -1, deltaY: 0 },
        right: { deltaX: 1, deltaY: 0 }
      }

      const currentKey = this.findValidKey(event.key, validDirection)

      if (currentKey) {
        if (currentKey.key.includes('Arrow')) {
          event.preventDefault()
        }
        
        const { direction } = currentKey
        const { deltaX, deltaY } = directionCoordinates[direction]
        this.tryChangeDirection(deltaX, deltaY, direction)
      }
    },
    findValidKey(key, directionMap) {
      for (const direction in directionMap) {
        if (directionMap[direction].includes(key)) {
          return { direction, key }
        }
      }
      return null
    },
    tryChangeDirection(deltaX, deltaY, direction) {
      const newPosX = this.coordinateX + deltaX
      const newPosY = this.coordinateY + deltaY

      if (this.isValidMove(newPosX, newPosY)) {
        if (this.isMoving && (this.currentDirection.deltaX !== deltaX || this.currentDirection.deltaY !== deltaY)) {
          this.stopContinuousMovement()
          this.currentDirection = { deltaX, deltaY }
          this.startContinuousMovement()
        } else if (!this.isMoving) {
          this.currentDirection = { deltaX, deltaY }
          this.startContinuousMovement()
        }
        this.directionMove = direction
      }
    },
    isValidMove(coordinateX, coordinateY) {
      return (
        coordinateX >= 0 &&
        coordinateX < this.gamingField[0].length &&
        coordinateY >= 0 &&
        coordinateY < this.gamingField.length &&
        this.gamingField[coordinateY][coordinateX] !== 1
      );
    },
    stopContinuousMovement() {
      this.isMoving = false
      clearInterval(this.intervalId)
    },
    startContinuousMovement() {
      if (!this.isMoving) {
        this.isMoving = true

        this.intervalId = setInterval(() => {
          this.movePacMan()
        }, 300)
      }
    },
    movePacMan() {
      let newPosX = this.coordinateX + this.currentDirection.deltaX
      const newPosY = this.coordinateY + this.currentDirection.deltaY
      const shouldCheckPortal = this.isBeyondField(newPosX)

      if (shouldCheckPortal) {
        newPosX = this.checkPortal(newPosX)
      }

      if (this.onPortal && !shouldCheckPortal) {
        this.onPortal = false
      }

      if (this.isValidMove(newPosX, newPosY)) {
        this.$emit('moving', newPosX, newPosY)
        this.coordinateX = newPosX
        this.coordinateY = newPosY
        this.ACTION_SET_COORDINATES({x: newPosX, y: newPosY})
      } else {
        this.stopContinuousMovement()
      }
    },
    checkPortal(newPosX) {
      if (newPosX === -1 || newPosX === this.gamingField[0].length) {
        this.onPortal = true
        newPosX = newPosX === -1 ? (this.gamingField[0].length - 1) : 0
      } else if (this.onPortal) {
        this.onPortal = false
      }
      return newPosX
    },
    isBeyondField(newPosX) {
      return newPosX < 0 || newPosX >= this.gamingField[0].length
    },
    getFocus() {
      this.$el.focus()
    }
  },
  computed: {
    direction() {
      return this.directionMove
    },
    pacManSize() {
      return this.screenWidth >= this.screenWidthBreakpoints.phones ? 2 : 1.2
    }
  },
  mounted() {
    this.getFocus()
  },
}
</script>

<style lang="scss">
.pacMan {
  width: 2rem;
  height: 2rem;
  background-color: $colorPacMan;
  position: absolute;
  border-radius: 50%;
  transition: top .3s linear, bottom .3s linear, right .3s linear, left .3s linear;
  outline: none;

  &::before {
    content: '';
    position: absolute;
    height: .1rem;
    width: 1rem;
    background: $colorBlack;
    right: 0;
    top: 50%;
  }

  @include phones {
    width: 1.2rem;
    height: 1.2rem;

    &::before {
      width: .6rem;
    }
  }

  &.move {
    animation: mouth .35s infinite cubic-bezier(0.85, 0, 0.15, 1);
    animation-direction: alternate;

    &::before {
      display: none;
    }
  }

  &.portal {
    transition: none;
  }
}

.pacMan__eye {
  content: '';
  position: absolute;
  width: .4rem;
  height: .4rem;
  border-radius: 50%;
  background: $colorBlack;
  top: 20%;
  left: 50%;

  @include phones {
    width: .2rem;
    height: .2rem;
  }
}

.down {
  transform: rotate(90deg);
}

.up {
  transform: rotate(270deg);
}

.left {
  transform: scale(-1, 1);
}

@keyframes mouth {
  0%  {
    clip-path: polygon(100% 0, 100% 25%, 50% 50%, 50% 50%, 100% 75%, 100% 100%, 0 100%, 0 0) 
  }
  100% {
    clip-path: polygon(100% 0, 100% 50%, 50% 50%, 50% 50%, 100% 50%, 100% 100%, 0 100%, 0 0)
  }
}
</style>