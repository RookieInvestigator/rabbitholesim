<template>
  <div class="dlc-manager-container">
    <div class="header">
      <h1 class="title">DLC 管理</h1>
      <button class="back-button" @click="$emit('back')">返回</button>
    </div>

    <div class="actions">
      <button class="action-button import-button" @click="triggerFileInput">导入DLC</button>
      <input 
        type="file" 
        ref="fileInput" 
        @change="handleFileImport" 
        multiple 
        accept=".json,.dlc"
        style="display: none" 
      />
    </div>

    <div class="dlc-list">
      <div v-if="dlcStore.dlcs.length === 0" class="empty-list-message">
        <p>尚未加载任何DLC模块。</p>
        <p>您可以点击“导入DLC”来添加您自己的模块。</p>
      </div>
      <div v-else class="dlc-item" v-for="dlc in dlcStore.dlcs" :key="dlc.id">
        <div class="dlc-info">
          <h2 class="dlc-name">{{ dlc.name }}</h2>
          <p class="dlc-author">作者: {{ dlc.author || '未知' }}</p>
          <p class="dlc-desc">{{ dlc.description || '没有描述。' }}</p>
        </div>
        <div class="dlc-controls">
           <button class="delete-button" @click="handleDeleteDlc(dlc.id)">删除</button>
          <label class="toggle-switch">
            <input type="checkbox" :checked="dlcStore.enabledDlcIds.has(dlc.id)" @change="dlcStore.toggleDlc(dlc.id)">
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDlcStore } from '@/stores/dlcStore';

defineEmits(['back']);

const dlcStore = useDlcStore();
const fileInput = ref(null);

function triggerFileInput() {
  fileInput.value.click();
}

async function handleFileImport(event) {
  const files = event.target.files;
  if (files.length > 0) {
    await dlcStore.importDlcFiles(files);
    // 重置文件输入，以便可以再次选择相同的文件
    event.target.value = '';
  }
}

function handleDeleteDlc(dlcId) {
    if (confirm(`确定要删除DLC "${dlcId}" 吗？此操作将从您的浏览器数据库中永久移除它！`)) {
        dlcStore.removeDlc(dlcId);
    }
}
</script>

<style scoped>
.dlc-manager-container {
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

.actions {
  margin-bottom: 2rem;
}
.action-button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'KaiTi', 'STKaiti', 'serif';
}
.import-button {
  background-color: #c7a5ff;
  color: #1a1a1a;
  border: none;
}

.dlc-list {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 1rem;
}

.empty-list-message {
  text-align: center;
  margin-top: 4rem;
  color: #888;
}

.dlc-item {
  background-color: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 5px solid #444;
  transition: border-color 0.3s;
}
.dlc-item:hover {
    border-left-color: #c7a5ff;
}

.dlc-info .dlc-name {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}
.dlc-info .dlc-author {
  font-size: 0.9rem;
  color: #999;
  margin: 0 0 1rem 0;
}
.dlc-info .dlc-desc {
  color: #ccc;
  margin: 0;
}

.dlc-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.delete-button {
    background: #6d2828;
    color: #ffc2c2;
    border: 1px solid #a33;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s;
}
.delete-button:hover {
    background: #8e3434;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}
.toggle-switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #555;
  transition: .4s;
  border-radius: 34px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #c7a5ff;
}
input:checked + .slider:before {
  transform: translateX(26px);
}
</style>