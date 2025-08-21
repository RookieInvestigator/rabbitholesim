<script setup>
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import allEndings from '@/data/endings.json';

const player = usePlayerStore();
const emit = defineEmits(['restart']);
const finalEnding = ref({ title: '探索結束', description: '你的數據已被歸檔。' });

onMounted(() => {
  // ... 結局匹配邏輯保持不變 ...
  const checkCondition = (condition) => {
    if (condition.type === 'death_reason') {
      return player.log.some(log => log.message.includes('耗盡') && condition.reason === 'health') || 
             player.log.some(log => log.message.includes('崩潰') && condition.reason === 'sanity');
    }
    return false;
  };
  const matchedEnding = allEndings.find(ending => 
    ending.conditions.every(checkCondition)
  );
  if (matchedEnding) {
    finalEnding.value = matchedEnding;
  }
});
</script>

<template>
  <div class="screen">
    <h2>{{ finalEnding.title }}</h2>
    <p class="description">{{ finalEnding.description }}</p>
    <div class="final-stats">
      你總共探索了 {{ player.turn }} 回合。
    </div>
    <button @click="emit('restart')">再探一次</button>
  </div>
</template>

<style scoped>
/* 樣式無需改變 */
.screen { text-align: center; background: #1e1e1e; padding: 2.5rem; border-radius: 8px; border: 1px solid #333; }
h2 { color: #ffc878; margin-bottom: 1rem; }
.description { color: #aaa; line-height: 1.7; font-size: 1.1rem; max-width: 600px; margin: 0 auto 2rem; }
.final-stats { font-style: italic; color: #888; margin-bottom: 2rem; }
button { padding: 1rem 2rem; font-size: 1.2rem; }
</style>