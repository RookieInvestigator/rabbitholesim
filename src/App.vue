<script setup>
import { ref, onMounted } from 'vue';
import GameView from './views/GameView.vue';
import StartView from './views/StartView.vue';
import EditorView from './views/EditorView.vue';
import DlcManagementView from './views/DlcManagementView.vue';
import AchievementView from './views/AchievementView.vue'; // 1. 导入成就视图
import { useDataCenter } from '@/composables/dataCenter';

const currentView = ref('start');
const isLoading = ref(true);
const { loadAllData } = useDataCenter();

// 初始化时加载一次数据
onMounted(async () => {
  await loadAllData();
  isLoading.value = false;
});

// 优雅地返回主菜单并重置所有状态
async function handleReturnToStart() {
  isLoading.value = true;
  // 强制重新加载所有数据（包括根据最新的DLC启用状态）
  await loadAllData({ force: true });
  currentView.value = 'start';
  isLoading.value = false;
}

function handleNavigation(view) {
  if (isLoading.value) return;

  if (view === 'start') {
    // 从游戏或DLC管理界面返回时，需要重置状态
    if (currentView.value === 'game') {
      if (!confirm('确定要返回开始菜单吗？当前游戏进度将会丢失。')) {
          return;
      }
    }
    handleReturnToStart();
  } else {
    currentView.value = view;
  }
}
</script>

<template>
  <div class="app-container">
    <main class="main-content">
      <StartView 
        v-if="currentView === 'start'" 
        :is-loading="isLoading"
        @start-game="handleNavigation('game')"
        @manage-dlc="handleNavigation('dlc')"
        @open-editor="handleNavigation('editor')"
        @show-achievements="handleNavigation('achievements')" 
      />
      <GameView v-else-if="currentView === 'game'" @back="handleNavigation('start')" />
      <EditorView v-else-if="currentView === 'editor'" @back="handleNavigation('start')" />
      <DlcManagementView v-else-if="currentView === 'dlc'" @back="handleNavigation('start')" />
      <AchievementView v-else-if="currentView === 'achievements'" @back="handleNavigation('start')" />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

.main-content {
  height: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}

/* 占位符的简单样式 */
h1, p {
  color: #e0e0e0;
  text-align: center;
}
button {
  display: block;
  margin: 2rem auto;
  padding: 10px 20px;
  background-color: transparent;
  color: #d0d0d0;
  border: 1px solid #555;
  cursor: pointer;
}
button:hover {
  background-color: #c7a5ff;
  color: #1a1a1a;
}
</style>