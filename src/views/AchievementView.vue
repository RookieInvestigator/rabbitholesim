<template>
  <div class="achievement-container">
    <div class="header">
      <h1 class="title">成就一览</h1>
      <button class="back-button" @click="$emit('back')">返回</button>
    </div>

    <div class="achievement-list">
      <div v-for="ach in unlocked" :key="ach.id" class="achievement-item unlocked">
        <div class="icon">✨</div>
        <div class="info">
          <h2 class="name">{{ ach.name }}</h2>
          <p class="desc">{{ ach.description }}</p>
        </div>
      </div>
      <div v-for="ach in locked" :key="ach.id" class="achievement-item locked">
        <div class="icon">❓</div>
        <div class="info">
          <h2 class="name">{{ ach.name }}</h2>
          <p class="desc">？？？</p>
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

// 使用 a computed property 来获取 getter 的值
const unlocked = computed(() => achievementStore.unlockedAchievements());
const locked = computed(() => achievementStore.lockedAchievements());
</script>

<style scoped>
.achievement-container {
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #e0e0e0;
  background: #1a1a1a;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.title {
  font-size: 2.5rem;
  color: #f0f0f0;
  font-family: 'KaiTi', 'STKaiti', 'serif';
}
.back-button {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #555;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'KaiTi', 'STKaiti', 'serif';
}
.back-button:hover {
  background: #c7a5ff;
  color: #1a1a1a;
  border-color: #c7a5ff;
}
.achievement-list {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 1rem;
}
.achievement-item {
  background-color: #2a2a2a;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-left: 5px solid;
}
.achievement-item.unlocked {
  border-left-color: #ffc878;
}
.achievement-item.locked {
  border-left-color: #444;
}
.icon {
  font-size: 2rem;
}
.info .name {
  font-size: 1.2rem;
  margin: 0 0 0.25rem 0;
}
.info .desc {
  color: #aaa;
  margin: 0;
  font-size: 0.9rem;
}
.achievement-item.unlocked .info .name {
  color: #ffc878;
}
.achievement-item.locked .info .name {
  color: #777;
}
</style>
