<template>
  <div
    class="pacMan"
    :class="[direction, {move: isMoving}]"
    :style="{
      left: coordinateX * 2 + 'rem',
      top: coordinateY * 2 + 'rem'
    }"
    tabindex="0"
    @keydown="handleKeyDown($event)">
    <div class="pacMan__eye" />
  </div>
</template>

<script>
export default {
  props: {
    gamingField: {
      type: Array,
      desc: 'Массив с координатами игрового поля'
    }
  },
  data() {
    return {
      coordinateX: 1,
      coordinateY: 1,
      currentDirection: { deltaX: 0, deltaY: 0 },
      directionMove: null,
      isMoving: false
    }
  },
  methods: {
    handleKeyDown(event) {
      const validDirection = {
        w: {
          deltaX: 0,
          deltaY: -1
        },
        s: {
          deltaX: 0,
          deltaY: 1
        },
        a: {
          deltaX: -1,
          deltaY: 0
        },
        d: {
          deltaX: 1,
          deltaY: 0
        }
      }

      Object.keys(validDirection).forEach(key => {
        if (key == event.key) {
          const currentKey = validDirection[key]
          this.tryChangeDirection(currentKey['deltaX'], currentKey['deltaY'], event.key)
        }
      })
    },
    tryChangeDirection(deltaX, deltaY, direction) {
      const newPosX = this.coordinateX + deltaX
      const newPosY = this.coordinateY + deltaY

      if (this.isValidMove(newPosX, newPosY)) {
        // Если движение уже начато и направление изменилось, меняем направление
        if (this.isMoving && (this.currentDirection.deltaX !== deltaX || this.currentDirection.deltaY !== deltaY)) {
          this.stopContinuousMovement()
          this.currentDirection = { deltaX, deltaY };
          this.startContinuousMovement()
        } else if (!this.isMoving) {
          // Если движение еще не начато, изменяем направление и запускаем движение
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
          this.movePacMan();
        }, 300);
      }
    },
    movePacMan() {
      const newPosX = this.coordinateX + this.currentDirection.deltaX
      const newPosY = this.coordinateY + this.currentDirection.deltaY

      if (this.isValidMove(newPosX, newPosY)) {
        this.coordinateX = newPosX
        this.coordinateY = newPosY
      } else {
        this.stopContinuousMovement()
      }
    },
    getFocus() {
      this.$el.focus()
    }
  },
  computed: {
    direction() {
      return this.directionMove
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
  transition: top .5s linear, bottom .5s linear, right .5s linear, left .5s linear;
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

  &.move {
    &::before {
      display: none;
    }
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
}

.move {
  animation: mouth .35s infinite cubic-bezier(0.85, 0, 0.15, 1);
  animation-direction: alternate;
}

.s {
  transform: rotate(90deg);
}

.w {
  transform: rotate(270deg);
}

.a {
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