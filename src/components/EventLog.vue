<script setup>
import { ref, watch, nextTick } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';

const player = usePlayerStore();
const logContainer = ref(null);

watch(
  () => player.log.length,
  async () => {
    await nextTick();
    const container = logContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
);
</script>

<template>
  <div class="event-log" ref="logContainer">
    <ul>
      <li v-for="log in player.log" :key="log.id" :class="`log-${log.type}`">
        <template v-if="log.type === 'event' && typeof log.message === 'object'">
          <div class="event-title">{{ log.message.title || '无标题事件' }}</div>
          <div class="event-text">{{ log.message.text }}</div>
        </template>
        <template v-else>
          {{ log.message }}
        </template>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.event-log {
  height: 100%;
  box-sizing: border-box;
  background: #1e1e1e;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  border: 1px solid #333;
  overflow-y: auto;
}

ul { 
  list-style: none; 
  padding: 0; 
  margin: 0;
}

li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #2a2a2a;
  color: #ccc;
  line-height: 1.5;
  font-size: 0.9rem;
}

li:last-child { 
  border-bottom: none; 
}

.event-title { 
    font-size: 1rem;
    margin-bottom: 0.25rem;
    color: #ffc878;
}
.event-text {
    font-weight: normal;
    color: #e0e0e0;
}
.log-choice { 
    font-size: 0.85rem;
    color: #8cb4ff;
}
.log-feedback {
    font-style: italic;
    color: #888;
}
.log-system {
    text-align: center;
    color: #666;
    font-style: italic;
}
.log-ending {
    text-align: center;
    color: #ffc878;
    font-weight: bold;
}

/* ✨ 核心修改：新增自訂滾動條樣式 ✨ */

/* 針對 Firefox */
.event-log {
  scrollbar-width: thin;
  scrollbar-color: #4a4a4a #1e1e1e;
}

/* 針對 WebKit 瀏覽器 (Chrome, Safari, Edge 等) */
.event-log::-webkit-scrollbar {
  width: 8px; /* 滾動條寬度 */
}

.event-log::-webkit-scrollbar-track {
  background: #1e1e1e; /* 軌道顏色，與背景色相同 */
  border-radius: 4px;
}

.event-log::-webkit-scrollbar-thumb {
  background-color: #4a4a4a; /* 滑塊顏色 */
  border-radius: 4px;
  border: 2px solid #1e1e1e; /* 創造類似 padding 的效果 */
}

.event-log::-webkit-scrollbar-thumb:hover {
  background-color: #6a6a6a; /* 滑塊在滑鼠懸停時的顏色 */
}
</style>