<script setup>
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import allEndings from '@/data/endings.json';

const player = usePlayerStore();
const emit = defineEmits(['restart']);
const finalEnding = ref({ title: '探索结束', description: '你的数据已被归档。' });

onMounted(() => {
  // ✨ 核心修改：使用 player.deathReason 來匹配結局
  if (player.deathReason) {
    const matchedEnding = allEndings.find(ending => 
      ending.conditions.some(cond => cond.type === 'death_reason' && cond.reason === player.deathReason)
    );
    if (matchedEnding) {
      finalEnding.value = matchedEnding;
    }
  }
});

const format = (num) => Number(num).toFixed(0);
</script>

<template>
  <div class="screen">
    <h2>{{ finalEnding.title }}</h2>
    <p class="description">{{ finalEnding.description }}</p>
    
    <div class="final-stats-container">
      <div class="stat-title">--- 最终探索数据 ---</div>
      <div class="stats-grid">
        <div class="stat-item"><strong>探索回合</strong><span>{{ player.turn }}</span></div>
        <div class="stat-item"><strong>最终金钱</strong><span>{{ format(player.money) }}</span></div>
        <div class="stat-item"><strong>逻辑</strong><span>{{ format(player.logic) }}</span></div>
        <div class="stat-item"><strong>灵知</strong><span>{{ format(player.gnosis) }}</span></div>
        <div class="stat-item"><strong>怪奇</strong><span>{{ format(player.weirdness) }}</span></div>
        <div class="stat-item"><strong>戏讽</strong><span>{{ format(player.irony) }}</span></div>
      </div>
    </div>

    <button @click="emit('restart')">再来一次</button>
  </div>
</template>

<style scoped>
.screen { 
  text-align: center; 
  background: #1e1e1e; 
  padding: 2.5rem; 
  border-radius: 8px; 
  border: 1px solid #333; 
  max-width: 700px;
  margin: auto;
}
h2 { color: #ffc878; margin-bottom: 1rem; }
.description { 
  color: #aaa; 
  line-height: 1.7; 
  font-size: 1.1rem; 
  max-width: 600px; 
  margin: 0 auto 2.5rem; 
}
button { 
  padding: 1rem 2rem; 
  font-size: 1.2rem; 
  margin-top: 2rem;
}

/* ✨ 新增樣式 ✨ */
.final-stats-container {
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  padding: 1.5rem 0;
  margin-bottom: 1rem;
}
.stat-title {
  font-style: italic;
  color: #888;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
  text-align: left;
}
.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #2a2a2a;
  border-radius: 4px;
}
.stat-item strong {
  color: #ccc;
}
.stat-item span {
  color: #fff;
  font-weight: bold;
}
.dominant-worldview {
  margin-top: 1.5rem;
  font-size: 1.1rem;
  color: #ccc;
}
.dominant-worldview strong {
  color: #8cb4ff;
  text-transform: capitalize;
}
</style>