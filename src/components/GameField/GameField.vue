<template>
  <div class="gameField">
    <div
      v-for="(row, rowIndex) in table"
      :key="rowIndex"
      class="gameField__row">
      <div
        v-for="(cell, cellIndex) in row"
        :key="cellIndex"
        class="gameField__box"
        :class="getLineClass(row, rowIndex, cell, cellIndex)">
        <div
          v-if="isShow(getLineClass(row, rowIndex, cell, cellIndex))"
          class="gameField__t-shaped" />
      </div>
    </div>
  </div>
</template>

<script>
import { field } from '@/components/GameField/data.js'

export default {
  data() {
    return {
      table: field
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
            return false;
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
        return ['top-left-right', 'bottom-top-left', 'bottom-top-right'].some(className => classNames.split(' ').includes(className));
      }
    }
  },
};
</script>

<style lang="scss">
.gameField__row {
  display: flex;
  justify-content: center;
}

.gameField__box {
  width: 2rem;
  height: 2rem;
  position: relative;

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
    
    .gameField__t-shaped {
      &::before {
        width: 2rem;
        height: .2rem;
        border-top: 2px solid $colorBorderLine;
        top: .6rem;
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
    
    .gameField__t-shaped {
      &::after {
        width: .2rem;
        height: 2rem;
        border-left: 2px solid $colorBorderLine;
        left: 30%;
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
    
    .gameField__t-shaped {
      &::after {
        width: .2rem;
        height: 2rem;
        border-right: 2px solid $colorBorderLine;
        right: 30%;
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

.gameField__t-shaped {
  position: relative;

  &::before,
  &::after {
    position: absolute;
    content: '';
  }
}
</style>