<template>
  <div class="word">
    <h2 class="word-heading">{{ word.word }}</h2>
    <p class="word-definition">{{ word.definition }}</p>
  </div>
</template>

<script setup>
import { defineProps, onMounted, ref } from 'vue'
defineProps(['word'])

onMounted(() => {
  setTimeout(() => animateShadow(), 200)
  animateText()
})

const afterOpacity = ref(0)
const animateShadow = async () => {
  afterOpacity.value += 0.02

  if (afterOpacity.value < 1) {
    setTimeout(() => {
      animateShadow()
    }, 1)
  }
}

const textOpacity = ref(0)
const animateText = async () => {
  textOpacity.value += 0.01

  if (textOpacity.value < 1) {
    setTimeout(() => {
      animateText()
    }, 2)
  }
}
</script>

<style lang="scss" scoped>
  .word {
    position: relative;
    border-radius: 50px;
    min-width: 300px;
    min-height: 200px;
    padding: 30px;
    box-sizing: border-box;
    color: #fff;
    opacity: v-bind(textOpacity);
    cursor: pointer;

    &:before {
      border-radius: 50px;
      width: 100%;
      height: 100%;
      z-index: -1;
      content: '';
      position: absolute;
      box-shadow: 20px 20px 60px #a2a2a2,
      -20px -20px 60px #dbdbdb;
      top: 0;
      left: 0;
      opacity: v-bind(afterOpacity);
    }
  }

  h2, p {
    max-width: max-content;
  }
</style>
