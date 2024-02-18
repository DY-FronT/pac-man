<template>
  <div
    class="gameField"

    @click="getFocus">
    <div class="gameField__wrapper">
      <div
        v-for="(row, rowIndex) in table"
        :key="rowIndex"
        class="gameField__row">
        <div
          v-for="(cell, cellIndex) in row"
          :key="cellIndex"
          class="gameField__box"
          :class="[getLineClass(row, rowIndex, cell, cellIndex), {coin: coinS[rowIndex][cellIndex] }]">
          <div
            v-if="isShow(getLineClass(row, rowIndex, cell, cellIndex))"
            class="gameField__t-shaped" />
        </div>
      </div>
      <div class="gameField__score">
        Score: {{ totalScore }}
      </div>
      <PacMan
        :gamingField="table"
        @moving="getCoin" />
    </div>
    <div ref="swipeElement" class="gameField__swipe"></div>
  </div>
</template>

<script>
import PacMan from '@/components/PacMan.vue'
import { field, coins } from '@/components/GameField/data.js'

import Hammer from 'hammerjs'

export default {
  components: {
    PacMan
  },
  data() {
    return {
      table: field,
      coinS: coins,
      totalScore: 0
    }
  },
  methods: {
    getLineClass(row, rowIndex, cell, cellIndex) {
      if (cell) {
        const cells = this.getCells(row, rowIndex, cellIndex)
        const diagonals = this.getDiagonals(rowIndex, cellIndex)
        const sides = this.getSides()

        const results = {
          corner: this.isCorner(cells, sides, diagonals),
          edge: this.isEdge(row, cellIndex),
          end: this.isEnd(cells, sides),
          line: this.isLine(row, cellIndex)
        }

        const result = Object.keys(results).find(key => results[key] !== false)

        return results[result]
      }
    },
    getCells(row, rowIndex, cellIndex) {
      const { cellUp, cellDown, cellLeft, cellRight } = this.getCellsObject(row, rowIndex, cellIndex)
      return { cellUp, cellDown, cellLeft, cellRight }
    },
    getCellsObject(row, rowIndex, cellIndex) {
      return {
        cellUp: this.table[rowIndex - 1] ? this.table[rowIndex - 1][cellIndex] : false,
        cellDown: this.table[rowIndex + 1] ? this.table[rowIndex + 1][cellIndex] : false,
        cellLeft: row[cellIndex - 1],
        cellRight: row[cellIndex + 1]
      }
    },
    getDiagonals(rowIndex, cellIndex) {
      const { upRight, upLeft, downRight, downLeft } = this.getDiagonalsObject(rowIndex, cellIndex)
      return { upRight, upLeft, downRight, downLeft }
    },
    getDiagonalsObject(rowIndex, cellIndex) {
      return {
        upRight: this.table[rowIndex - 1] ? this.table[rowIndex - 1][cellIndex + 1] : false,
        upLeft: this.table[rowIndex - 1] ? this.table[rowIndex - 1][cellIndex - 1] : false,
        downRight: this.table[rowIndex + 1] ? this.table[rowIndex + 1][cellIndex + 1] : false,
        downLeft: this.table[rowIndex + 1] ? this.table[rowIndex + 1][cellIndex - 1] : false
      }
    },
    getSides() {
      return {
        cellUp: 'bottom',
        cellDown: 'top',
        cellLeft: 'left',
        cellRight: 'right',
        downLeft: 'top-left',
        upLeft: 'bottom-left',
        upRight: 'bottom-right',
        downRight: 'top-right',
      }
    },
    isCorner(cells, sides, diagonals) {
      const { cellLeft, cellRight, cellUp, cellDown } = cells
      const { upRight, upLeft, downRight, downLeft } = diagonals

      if ((cellLeft || cellRight) && (cellUp || cellDown)) {
        let result = 'corner '
      
        const activeSides = Object.keys(cells).filter(key => cells[key])
        result += activeSides.map(side => sides[side]).join('-')
      
        if (activeSides.length >= 3) {
          const hasOneInactiveDiagonal = Object.values(diagonals).filter(value => !value).length === 1
        
          if (
            (cellRight && cellUp && !upRight) ||
            (cellRight && cellDown && !downRight) ||
            (cellLeft && cellUp && !upLeft) ||
            (cellLeft && cellDown && !downLeft)
          ) {
            if (hasOneInactiveDiagonal) {
              const inactiveDiagonal = Object.keys(diagonals).find(key => !diagonals[key])
              result = `corner ${sides[inactiveDiagonal]}`
            }
          } else {
            return false
          }
        }
        return result
      } else {
        return false
      }
    },
    isEnd(cells, sides) {
      const endSide = Object.keys(cells).filter(key => cells[key] == true)

      return endSide.length === 1 ? `end ${sides[endSide[0]]}` : false
    },
    isLine(row, cellIndex) {
      return row[cellIndex - 1] && row[cellIndex + 1] ? 'horizontal' : 'vertical'
    },
    isEdge(row, cellIndex) {
      return (cellIndex === 0 && row[cellIndex + 1]) || (cellIndex === row.length - 1 && row[cellIndex - 1]) ? 'horizontal' : false
    },
    isShow(classNames) {
      if(classNames) {
        return ['top-left-right', 'bottom-top-left', 'bottom-top-right'].some(className => classNames.split(' ').includes(className))
      }
    },
    getFocus() {
      this.$children[0].getFocus()
    },
    getSwipeDirection(event) {
      const deltaX = event.deltaX;
      const deltaY = event.deltaY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'd' : 'a'
      } else {
        return deltaY > 0 ? 's' : 'w'
      }
    },
    handleSwipe(direction) {
      this.$children[0].handleKeyDown({key: direction})
    },
    getCoin(newPosX, newPosY) {
      const currentRow = this.coinS[newPosY]
      if (currentRow[newPosX]) {
        setTimeout(() => {
          this.$set(this.coinS[newPosY], newPosX, 0)
          this.totalScore += 10
          if (this.totalScore >= 2450) {
            this.$children[0].stopContinuousMovement()
            alert('Поздравляю, Вы победили!')
          }
        }, 200);
      }
    }
   },
   mounted() {
    const swipeElement = this.$refs.swipeElement
    const hammer = new Hammer(swipeElement)

    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL })

    hammer.on('panleft panright panup pandown', (event) => {
      event.preventDefault()

      const direction = this.getSwipeDirection(event)
      if (direction) {
        this.handleSwipe(direction)
      }
    })
  }
};
</script>

<style lang="scss">
.gameField {
  max-width: 56rem;
  width: 100%;
  margin: 2.4rem auto 0;
  position: relative;
  overflow: hidden;

  @include laptops {
    height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  @include phones {
    max-width: 33.6rem;
  }
}

.gameField__wrapper {
  @include laptops {
    margin-bottom: 2.4rem;
  }
}

.gameField__row {
  display: flex;
  justify-content: center;
}

.gameField__box {
  width: 2rem;
  height: 2rem;
  position: relative;

  @include phones {
    width: 1.2rem;
    height: 1.2rem;
  }

  &::before,
  &::after {
    position: absolute;
    content: '';
  }
}

.horizontal {
  &::before,
  &::after {
    width: 2rem;
    height: .2rem;
    background: $colorBorderLine;
  }

  &::before {
    top: 30%;
  }

  &::after {
    bottom: 30%;
  }

  @include phones {
    &::before,
    &::after {
      width: 1.2rem;
      height: .2rem;
    }

    &::before {
      top: 10%;
    }

    &::after {
      bottom: 10%;
    }
  }
}

.vertical {
  &::before,
  &::after {
    width: .2rem;
    height: 2rem;
    background: $colorBorderLine;
  }

  &::before {
    left: 30%;
  }

  &::after {
    right: 30%;
  }

  @include phones {
    &::before,
    &::after {
      width: .2rem;
      height: 1.2rem;
      background: $colorBorderLine;
    }

    &::before {
      left: 10%;
    }

    &::after {
      right: 10%;
    }
  }
}

.corner {
  &.top-left {
    &::before,
    &::after {
      border-radius: 0 1.5rem 0 0;
    }

    &::before {
      top: .6rem;
      border-top: 2px solid $colorBorderLine;
      border-right: 2px solid $colorBorderLine;
      height: 1.2rem;
      width: 1.2rem;
    }

    &::after {
      width: .6rem;
      height: .6rem;
      border-top: 2px solid $colorBorderLine;
      border-right: 2px solid $colorBorderLine;
      top: 1.2rem;
    }

    @include phones {
      &::before {
        width: .9rem;
        height: .9rem;
        top: .1rem;
      }

      &::after {
        top: .9rem;
        width: .1rem;
        height: .1rem;
      }
    }
  }

  &.top-right {
    &::before,
    &::after {
      border-radius: 1.5rem 0 0 0;
    }

    &::before {
      top: .6rem;
      right: 0;
      border-top: 2px solid $colorBorderLine;
      border-left: 2px solid $colorBorderLine;
      height: 1.2rem;
      width: 1.2rem;
    }

    &::after {
      width: .6rem;
      height: .6rem;
      border-top: 2px solid $colorBorderLine;
      border-left: 2px solid $colorBorderLine;
      top: 1.2rem;
      right: 0;
    }

    @include phones {
      &::before {
        top: .1rem;
        height: .9rem;
        width: .9rem;
      }

      &::after {
        top: .9rem;
        width: .1rem;
        height: .1rem;
      }
    }
  }

  &.bottom-right {
    &::before,
    &::after {
      border-radius: 0 0 0 1.5rem;
      right: 0;
    }

    &::before {
      border-bottom: 2px solid $colorBorderLine;
      border-left: 2px solid $colorBorderLine;
      height: 1.2rem;
      width: 1.2rem;
    }

    &::after {
      width: .6rem;
      height: .6rem;
      border-bottom: 2px solid $colorBorderLine;
      border-left: 2px solid $colorBorderLine;
    }

    @include phones {
      &::before {
        width: .9rem;
        height: .9rem;
        bottom: .1rem;
      }

      &::after {
        width: .1rem;
        height: .1rem;
      }
    }
  }

  &.bottom-left {
    &::before,
    &::after {
      border-radius: 0 0 1.5rem 0;
    }

    &::before {
      border-bottom: 2px solid $colorBorderLine;
      border-right: 2px solid $colorBorderLine;
      height: 1.2rem;
      width: 1.2rem;
    }

    &::after {
      width: .6rem;
      height: .6rem;
      border-right: 2px solid $colorBorderLine;
      border-bottom: 2px solid $colorBorderLine;
    }

    @include phones {
      &::before {
        width: .9rem;
        height: .9rem;
      }

      &::after {
        width: .1rem;
        height: .1rem;
      }
    }
  }

  &.top-left-right {
    &::before,
    &::after {
      border-top: 2px solid $colorBorderLine;
      width: .6rem;
      height: 0.6rem;
      bottom: 0;
    }

    &::before {
      border-right: 2px solid $colorBorderLine;
      border-radius: 0 15px 0 0;
    }

    &::after {
      right: 0;
      border-left: 2px solid $colorBorderLine;
      border-radius: 15px 0 0 0;
    }

    @include phones {
      &::before,
      &::after {
        width: .1rem;
        height: .1rem;
      }
    }
    
    .gameField__t-shaped {
      &::before {
        width: 2rem;
        height: .2rem;
        border-top: 2px solid $colorBorderLine;
        top: .6rem;
      }

      @include phones {
        &::before {
          width: 1.2rem;
          top: .1rem;
        }
      }
    }
  }

  &.bottom-top-right {
    &::before,
    &::after {
      border-left: 2px solid $colorBorderLine;
      width: .6rem;
      height: .6rem;
      right: 0;
    }

    &::before {
      border-bottom: 2px solid $colorBorderLine;
      border-radius: 0 0 0 15px;
    }

    &::after {
      border-top: 2px solid $colorBorderLine;
      border-radius: 15px 0 0 0;
      bottom: 0;
    }

    @include phones {
      &::before,
      &::after {
        width: .1rem;
        height: .1rem;
      }
    }
    
    .gameField__t-shaped {
      &::after {
        width: .2rem;
        height: 2rem;
        border-left: 2px solid $colorBorderLine;
        left: 30%;
      }

      @include phones {
        &::after {
          height: 1.2rem;
          left: 10%;
        }
      }
    }
  }

  &.bottom-top-left {
    &::before,
    &::after {
      border-right: 2px solid $colorBorderLine;
      width: .6rem;
      height: .6rem;
    }

    &::before {
      border-bottom: 2px solid $colorBorderLine;
      border-radius: 0 0 15px 0;
    }

    &::after {
      border-top: 2px solid $colorBorderLine;
      border-radius: 0 15px 0 0;
      bottom: 0;
    }

    @include phones {
      &::before,
      &::after {
        width: .1rem;
        height: .1rem;
      }
    }
    
    .gameField__t-shaped {
      &::after {
        width: .2rem;
        height: 2rem;
        border-right: 2px solid $colorBorderLine;
        right: 30%;
      }

      @include phones {
        &::after {
          height: 1.2rem;
          right: 10%;
        }
      }
    }
  }
}

.end {
  &::before,
  &::after {
    border-top: 2px solid $colorBorderLine;
    width: .2rem;
    height: 1.2rem;
    bottom: 0;
  }

  &::before {
    border-radius: 1.5rem 0 0 0;
    border-left: 2px solid $colorBorderLine;
    left: 30%;
  }

  &::after {
    border-right: 2px solid $colorBorderLine;
    right: 30%;
    border-radius: 0 1.5rem 0 0;
  }

  &.top {
    transform: rotate(0deg);
  }

  &.right {
    transform: rotate(270deg);
  }

  &.bottom {
    transform: rotate(180deg);
  }

  &.left {
    transform: rotate(90deg);
  }
}

.coin {
  &::before {
    position: absolute;
    content: '';
    width: .6rem;
    height: .6rem;
    background: $colorCoin;
    border-radius: 50%;
    top: .7rem;
    left: .7rem;
  }

  @include phones {
    &::before {
      width: .4rem;
      height: .4rem;
      top: .4rem;
      left: .4rem;
    }
  }
}

.gameField__t-shaped {
  position: relative;

  &::before,
  &::after {
    position: absolute;
    content: '';
  }
}

.gameField__score {
  font-size: 4.8rem;
  line-height: 5.6regm;
  color: $colorBorderLine;
}

.gameField__swipe {
  width: 100%;
  border: 1px solid $colorBorderLine;
  flex-grow: 1;
  margin-bottom: 2.4rem;
}
</style>