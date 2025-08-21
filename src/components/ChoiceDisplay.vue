<script setup>
defineProps({
  choices: { type: Array, required: true },
});
const emit = defineEmits(['choice-selected']);
function selectChoice(choice) {
  emit('choice-selected', choice);
}
const worldviewIcons = { logic: '🧠', gnosis: '👁️', weirdness: '🌀', irony: '🎭' };
</script>

<template>
  <div class="choices-grid-compact">
    <div
      v-for="choice in choices"
      :key="choice.uuid"
      class="choice-card"
      @click="selectChoice(choice)"
    >
      <div class="choice-text-wrapper">
        <span class="arrow">></span>
        <p class="choice-text">{{ choice.text }}</p>
      </div>
      <div class="choice-worldview">
        {{ worldviewIcons[choice.worldview] || '🔘' }} 
        <span class="tooltip">{{ choice.worldview }} (程度: {{ choice.magnitude }})</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.choices-grid-compact {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.4rem;
}

.choice-card {
  border: 1px solid #333;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #242424;
  position: relative;
  display: flex;
  align-items: center;
}
.choice-card:hover {
  border-color: #4A90E2;
  background-color: #2a2a2a;
}
.choice-text-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;
  padding-right: 2.5rem;
  /* ✨ 核心修正(1)：這是一個關鍵的 Flexbox 修復，允許內部的文字正確換行 */
  min-width: 0;
}
.arrow {
  color: #8cb4ff;
  font-size: 1rem;
  font-weight: bold;
}
.choice-text {
  font-size: 0.9rem;
  color: #e0e0e0;
  line-height: 1.5;
  margin: 0;
  /* ✨ 核心修正(2)：強制文字在需要時可以斷開單詞換行，提供雙重保險 */
  word-break: break-word;
}
.choice-worldview {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0.8rem;
  background: #333;
  border-radius: 50%;
  width: 1.8rem;
  height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.choice-worldview .tooltip {
  visibility: hidden; width: 120px; background-color: #121212; color: #fff;
  text-align: center; border-radius: 6px; padding: 5px 0; position: absolute;
  z-index: 1; bottom: 125%; left: 50%; margin-left: -60px; opacity: 0;
  transition: opacity 0.3s; font-size: 0.8rem;
}
.choice-worldview:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
</style>