<script setup>
import EventEditor from '@/components/EventEditor.vue';
const emit = defineEmits(['back']);
</script>

<template>
  <div class="editor-view-container">
    <header>
      <div class="header-content">
        <h2>事件编辑器</h2>
        <p>在此处创建/编辑事件，完成后导出JSON档案即可在游戏中使用。</p>
      </div>
      <button @click="emit('back')" class="back-button">返回天赋选择</button>
    </header>
    <div class="editor-content-area">
      <EventEditor />
    </div>
  </div>
</template>

<style scoped>
/* ✨ 佈局緊湊化 ✨ */
.editor-view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e1e1e;
  padding: 0.75rem 1.25rem; /* 減小垂直和水平內邊距 */
  border-radius: 6px;
  border: 1px solid #333;
  margin-bottom: 0.75rem; /* 減小底部外邊距 */
  flex-shrink: 0;
}

.header-content h2 {
    font-size: 1.2rem; /* 減小標題字體 */
    margin: 0 0 0.2rem 0; /* 調整標題邊距 */
}

.header-content p {
    font-size: 0.85rem; /* 減小段落字體 */
    color: #aaa;
    margin: 0;
}

.editor-content-area {
  flex-grow: 1;
  min-height: 0;
}

.back-button {
  background-color: #5a9e5d;
  color: white;
  border: none;
  padding: 0.5rem 1rem; /* 減小按鈕內邊距 */
  font-size: 0.9rem; /* 減小按鈕字體 */
  border-radius: 5px;
}
</style>