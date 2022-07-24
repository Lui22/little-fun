<template>
  <div class="grid">
    <Word v-for="(item, index) of words"
          :key="index"
          :word="item"
    @click="wordLoad()"></Word>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import WordnikRandomWord from '@/helpers/WordnikRandomWord'
import Word from '@/components/Word'

onMounted(() => {
  // setInterval(() => wordLoad(), 3000)
  wordLoad()
})

const words = ref([])

const wordLoad = async () => {
  words.value.push(await WordnikRandomWord())
}
</script>

<style lang="scss">
body {
  margin: 0;
  background: #bebebe;
  font-family: 'Montserrat', sans-serif;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 5vh 5vw;
  gap: 50px
}
</style>
