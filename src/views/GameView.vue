<script setup>
import { ref, watch } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { useGameLoop } from '@/composables/useGameLoop';
import { useEventEngine } from '@/composables/useEventEngine';
import StatDisplay from '@/components/StatDisplay.vue';
import EventLog from '@/components/EventLog.vue';
import TalentSelector from '@/components/TalentSelector.vue';
import GameOverScreen from '@/components/GameOverScreen.vue';

const player = usePlayerStore();
const { isRunning, start } = useGameLoop();
const { isLoading, loadEvents } = useEventEngine();

// 確保這一行只出現一次
const gameState = ref('talent'); // 'talent', 'simulation', 'game_over'

loadEvents();

function startGame(pickedTalents) {
  // 檢查 playerStore 是否有 initializeWithTalents 方法，如果有則調用
  if (player.initializeWithTalents) {
    player.initializeWithTalents(pickedTalents);
  }
  start();
  gameState.value = 'simulation';
}

function restartGame() {
  gameState.value = 'talent';
}

watch(() => player.isAlive, (isAlive) => {
  if (!isAlive && gameState.value === 'simulation') {
    gameState.value = 'game_over';
  }
});
</script>

<template>
  <div v-if="isLoading">正在載入事件庫...</div>
  
  <TalentSelector v-else-if="gameState === 'talent'" @start="startGame" />
  
  <div v-else-if="gameState === 'simulation'" class="simulation-view">
    <StatDisplay />
    <EventLog />
  </div>

  <GameOverScreen v-else-if="gameState === 'game_over'" @restart="restartGame" />
</template>

<style scoped>
.simulation-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>