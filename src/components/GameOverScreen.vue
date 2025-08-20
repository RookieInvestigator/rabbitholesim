<script setup>
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import allEndings from '@/data/endings.json';

const player = usePlayerStore();
const emit = defineEmits(['restart']);
const finalEnding = ref({ title: '模擬結束', description: '你的數據已被歸檔。' });

// 在組件掛載時，根據玩家的最終狀態匹配結局
onMounted(() => {
  const checkCondition = (condition) => {
    // 簡化版：只檢查 death_reason
    if (condition.type === 'death_reason') {
      return player.log.some(log => log.message.includes('耗盡') && condition.reason === 'health') || 
             player.log.some(log => log.message.includes('崩潰') && condition.reason === 'sanity');
    }
    // 未來可擴充 stat_check 等
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
      你活到了 {{ player.age.toFixed(1) }} 歲。
    </div>
    <button @click="emit('restart')">再來一世</button>
  </div>
</template>

<style scoped>
.screen { text-align: center; background: #1e1e1e; padding: 2.5rem; border-radius: 8px; border: 1px solid #333; }
h2 { color: #ffc878; margin-bottom: 1rem; }
.description { color: #aaa; line-height: 1.7; font-size: 1.1rem; max-width: 600px; margin: 0 auto 2rem; }
.final-stats { font-style: italic; color: #888; margin-bottom: 2rem; }
button { padding: 1rem 2rem; font-size: 1.2rem; }
</style>