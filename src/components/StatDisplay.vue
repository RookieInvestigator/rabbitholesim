<script setup>

import { usePlayerStore } from '@/stores/playerStore';


const player = usePlayerStore();
const format = (num) => Number(num).toFixed(1);
</script>

<template>
  <div class="stats-container">
    <div class="stat-group">
      <h4>核心狀態</h4>
      <p><span>年齡:</span> <strong>{{ format(player.age) }}</strong></p>
      <p><span>健康:</span> <strong>{{ format(player.health) }}</strong></p>
      <p><span>理智:</span> <strong>{{ format(player.sanity) }}</strong></p>
      <p><span>金錢:</span> <strong>{{ format(player.money) }}</strong></p>
    </div>
    <div class="stat-group">
      <h4>世界觀</h4>
      <p><span>邏輯:</span> <strong>{{ format(player.logic) }}</strong></p>
      <p><span>靈知:</span> <strong>{{ format(player.gnosis) }}</strong></p>
      <p><span>怪奇:</span> <strong>{{ format(player.weirdness) }}</strong></p>
      <p><span>解構:</span> <strong>{{ format(player.irony) }}</strong></p>
    </div>
    <div class="stat-group">
      <h4>身份</h4>
      <p><span>名望:</span> <strong>{{ format(player.fame) }}</strong></p>
      <p><span>隱匿:</span> <strong>{{ format(player.anonymity) }}</strong></p>
      <p><span>暴露度:</span> <strong>{{ format(player.exposure) }}</strong></p>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  background: #1e1e1e;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #333;
}
.stat-group h4 {
  margin: 0 0 0.75rem 0;
  color: #888;
  font-size: 0.9rem;
  font-weight: 600;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
}
p {
  margin: 0.4rem 0;
  color: #ccc;
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}
strong { color: white; }
</style>