<template>
  <div class="view-container">
    <header class="header">
      <h1>归档 / ACHIEVEMENTS</h1>
      <button class="btn-back" @click="$emit('back')">返回</button>
    </header>

    <div class="achievement-list">
      <div v-for="ach in unlocked" :key="ach.id" class="ach-item unlocked">
        <span class="status">[解密成功]</span>
        <div class="content">
          <div class="name">{{ ach.name }}</div>
          <div class="desc">{{ ach.description }}</div>
        </div>
      </div>

      <div v-for="ach in locked" :key="ach.id" class="ach-item locked">
        <span class="status">[数据丢失]</span>
        <div class="content">
          <div class="name">????????</div>
          <div class="desc">尚未满足提取条件</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAchievementStore } from '@/stores/achievementStore';
defineEmits(['back']);
const achievementStore = useAchievementStore();

const unlocked = computed(() => achievementStore.unlockedAchievements());
const locked = computed(() => achievementStore.lockedAchievements());
</script>

<style scoped>
.view-container { padding: 3rem; max-width: 800px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
.btn-back { background: transparent; border: 1px solid var(--border); color: #fff; cursor: pointer; padding: 0.5rem 1rem; }

.ach-item {
  display: flex;
  gap: 2rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border);
}
.status { font-size: 0.8rem; width: 100px; }
.unlocked .status { color: var(--accent); }
.locked { color: var(--text-dim); }
.name { font-weight: bold; margin-bottom: 0.5rem; }
.desc { font-size: 0.9rem; }
</style>