<template>
  <div class="dlc-view-root">
    <div class="dlc-container">
      <header class="view-header">
        <div class="brand-info">
          <span class="protocol-code">PROTOCOL: DLC_MANAGER</span>
          <h1 class="title">扩展模块管理 [{{ dlcStore.dlcs.length }}]</h1>
        </div>
        <div class="header-actions">
          <button class="btn-ctrl primary" @click="triggerFileInput">导入新协议</button>
          <button class="btn-ctrl" @click="$emit('back')">返回</button>
        </div>
      </header>

      <input type="file" ref="fileInput" @change="handleFileImport" multiple accept=".json,.dlc" style="display: none" />

      <div class="module-list">
        <div v-if="dlcStore.dlcs.length === 0" class="empty-msg">
          NO_EXTERNAL_MODULES_DETECTED
        </div>
        
        <div 
          v-for="dlc in dlcStore.dlcs" 
          :key="dlc.id" 
          class="module-item"
          :class="{ active: dlcStore.enabledDlcIds.has(dlc.id) }"
        >
          <div class="status-indicator"></div>
          
          <div class="module-content">
            <div class="module-info">
              <div class="name-row">
                <span v-if="dlc.icon" class="icon-wrapper"><i :class="dlc.icon"></i></span>
                <h2 class="module-name">{{ dlc.name }}</h2>
                <span class="module-author">@{{ dlc.author || 'UNKNOWN' }}</span>
              </div>
              <p class="module-desc">{{ dlc.description || '该模块未提供详细描述数据。' }}</p>
            </div>
            
            <div class="module-actions">
              <button class="btn-toggle" @click="dlcStore.toggleDlc(dlc.id)">
                {{ dlcStore.enabledDlcIds.has(dlc.id) ? '已启用' : '未激活' }}
              </button>
              <button class="btn-delete" @click="handleDeleteDlc(dlc.id)">
                卸载
              </button>
            </div>
          </div>
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

const triggerFileInput = () => fileInput.value.click();
const handleFileImport = async (e) => {
  if (e.target.files.length > 0) {
    await dlcStore.importDlcFiles(e.target.files);
    e.target.value = '';
  }
};

const handleDeleteDlc = (id) => {
  if (confirm(`确定永久卸载模块 [${id}] 吗？`)) {
    dlcStore.removeDlc(id);
  }
};
</script>

<style scoped>
/* 全面採用思源黑體與黑白終端風格 */
.dlc-view-root {
  font-family: "Source Han Sans SC", "Source Han Sans TC", sans-serif;
  min-height: 100vh;
  background-color: #000;
  color: #fff;
}

.dlc-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* 標頭樣式 */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
  border-bottom: 1px solid #111;
  padding-bottom: 1rem;
}

.protocol-code { font-size: 0.7rem; color: #333; letter-spacing: 2px; }
.title { font-size: 1.5rem; margin: 0.2rem 0 0 0; font-weight: 700; }

.header-actions { display: flex; gap: 0.8rem; }

/* 頂部控制按鈕 */
.btn-ctrl {
  background: transparent;
  color: #666;
  border: 1px solid #111;
  padding: 0.5rem 1.2rem;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 700;
}
.btn-ctrl:hover { color: #fff; border-color: #444; }
.btn-ctrl.primary { background: #fff; color: #000; border-color: #fff; }

/* 列表樣式 */
.module-list { display: flex; flex-direction: column; gap: 1rem; }

.module-item {
  position: relative;
  display: flex;
  background: #000;
  border: 1px solid #111;
  transition: all 0.1s ease;
}

.status-indicator {
  width: 4px;
  background: #111;
  flex-shrink: 0;
}

/* 啟動狀態 */
.module-item.active { border-color: #222; }
.module-item.active .status-indicator { background: #a29bfe; }

.module-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 核心：上端對齊 */
  gap: 2rem;
}

.module-info { flex: 1; }
.name-row { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.6rem; }
.icon-wrapper { font-size: 1rem; color: #444; }
.module-name { font-size: 1.1rem; margin: 0; font-weight: 700; color: #eee; }
.module-author { font-size: 0.75rem; color: #333; font-family: monospace; margin-left: auto; }
.module-desc { font-size: 0.85rem; color: #555; margin: 0; line-height: 1.6; }

/* ✨ 重點優化：加大後的切換按鈕 ✨ */
.module-actions { 
  display: flex; 
  flex-direction: column; 
  gap: 0.6rem; 
  flex-shrink: 0; 
  width: 100px; /* 固定寬度讓按鈕對齊 */
}

.btn-toggle {
  background: transparent;
  border: 1px solid #222;
  color: #444;
  padding: 0.6rem 0;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
}

.btn-toggle:hover { border-color: #444; color: #888; }

/* 啟用狀態下的按鈕視覺 */
.active .btn-toggle {
  border-color: #a29bfe;
  color: #a29bfe;
  background: rgba(162, 155, 254, 0.05);
}

.btn-delete {
  background: transparent;
  border: none;
  color: #222;
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.2rem 0;
}
.btn-delete:hover { color: #ff4757; }

/* 手機版適配 */
@media (max-width: 768px) {
  .view-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .module-content { flex-direction: column; gap: 1.5rem; padding: 1.2rem; }
  .module-actions { 
    width: 100%; 
    flex-direction: row; 
    justify-content: space-between; 
    align-items: center;
    border-top: 1px solid #111;
    padding-top: 1rem;
  }
  .btn-toggle { flex: 1; padding: 0.8rem 0; }
}
</style>