<template>
  <div
    class="ghost walk"
    :style="{
      left: coordinateX * 2 + 'rem',
      top: coordinateY * 2 + 'rem'
    }">
    <div
      v-for="({}, index) in 4"
      :key="index"
      :style="{left: index * 5 / 10 + 'rem'}"
      class="tentacle" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      coordinateX: 12,
      coordinateY: 14
    }
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
  }

  &::before {
    left: .4rem;
  }

  &::after {
    right: .4rem;
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