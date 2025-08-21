<script setup>
import EventEditor from '@/components/EventEditor.vue';
const emit = defineEmits(['back']);
</script>

<template>
  <div class="editor-view-scrollable">
    <header>
      <div class="header-content">
        <h2>事件編輯器</h2>
        <p>在此處創建/編輯事件，完成後將右側生成的 JSON 複製到您的事件檔案中。</p>
      </div>
      <button @click="emit('back')" class="back-button">返回天賦選擇</button>
    </header>
    <EventEditor />
  </div>
</template>

<style scoped>
/* ✨ 全新的樣式，確保滾動 ✨ */
.editor-view-scrollable {
  height: 100%;
  overflow-y: auto; /* 允許垂直滾動 */
  padding-right: 15px; /* 為滾動條留出空間，防止內容跳動 */
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e1e1e;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #333;
  margin-bottom: 1rem;
}

.back-button {
  background-color: #5a9e5d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
}
</style>