<template>
  <div id="app">
    <div class="container">
      <GameField />
    </div>
  </div>
</template>

<script>
import GameField from '@/components/GameField/GameField.vue'

export default {
  name: 'App',
  components: {
    GameField
  }
}
</script>