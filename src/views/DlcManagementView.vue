<template>
  <div class="dlc-view-root">
    <div class="ambient-bg"></div>

    <div class="dlc-container">
      <header class="view-header">
        <div class="brand-info">
          <h1 class="title">
            扩展模块管理
            <span class="count-badge" :class="{ 'has-items': dlcStore.dlcs.length > 0 }">
              [{{ dlcStore.enabledDlcIds.size }} / {{ dlcStore.dlcs.length }}]
            </span>
          </h1>
          <span class="protocol-code">SYSTEM_EXTENSION_PROTOCOL // READY</span>
        </div>

        <div class="header-actions">
          <button class="btn-ctrl primary" @click="triggerFileInput">
            <span class="icon">+</span> 导入新模块
          </button>
          <button class="btn-ctrl" @click="$emit('back')">返回</button>
        </div>
      </header>

      <input type="file" ref="fileInput" @change="handleFileImport" multiple accept=".json,.dlc" style="display: none" />

      <div class="module-list">
        <!-- 空状态 -->
        <div v-if="dlcStore.dlcs.length === 0" class="empty-state">
          <div class="empty-icon">∅</div>
          <p>未检测到外部模块</p>
          <p class="sub-text">请导入 .json 或 .dlc 格式的扩展包</p>
        </div>

        <!-- 列表项 -->
        <div
          v-for="dlc in dlcStore.dlcs"
          :key="dlc.id"
          class="module-card"
          :class="{ active: dlcStore.enabledDlcIds.has(dlc.id) }"
        >
          <div class="status-bar"></div>

          <div class="module-content">
            <div class="module-main">
              <div class="top-row">
                <h2 class="module-name">
                  <!-- 这里！你的 Icon 回来了！ -->
                  <span v-if="dlc.icon" class="icon-wrapper">
                    <i :class="dlc.icon"></i>
                  </span>
                  <!-- 如果没有图标，就显示个小圆点 -->
                  <span v-else class="indicator-dot"></span>

                  {{ dlc.name }}
                </h2>
                <span class="module-ver">v{{ dlc.version || '1.0' }}</span>
              </div>

              <div class="meta-row">
                 <span class="module-author">作者: {{ dlc.author || '未知' }}</span>
                 <span class="module-id">ID: {{ dlc.id }}</span>
              </div>

              <p class="module-desc">{{ dlc.description || '该模块暂无详细描述。' }}</p>
            </div>

            <div class="module-ctrl">
              <button class="btn-toggle" @click="dlcStore.toggleDlc(dlc.id)">
                {{ dlcStore.enabledDlcIds.has(dlc.id) ? '已启用' : '未启用' }}
              </button>
              <button class="btn-delete" @click="handleDeleteDlc(dlc.id)">
                卸载模块
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* 逻辑部分没变，为了省篇幅就不重复贴了，和上一个版本一样 */
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
  if (confirm(`警告：确定要永久卸载模块 [${id}] 吗？`)) {
    dlcStore.removeDlc(id);
  }
};
</script>

<style scoped>
/* 字体回归通用黑体，更适合中文 */
.dlc-view-root {
  font-family: "Source Han Sans CN", "Microsoft YaHei", sans-serif;
  min-height: 100vh;
  background-color: #050505;
  color: #ccc;
  position: relative;
  overflow-x: hidden;
}

.ambient-bg {
  position: fixed; inset: 0; pointer-events: none;
  /* 背景光改成淡紫色 */
  background: radial-gradient(circle at 80% 20%, rgba(162, 155, 254, 0.08), transparent 60%);
  z-index: 0;
}

.dlc-container {
  position: relative; z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

/* Header */
.view-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem;
}
.title {
  font-size: 1.8rem; font-weight: 700; color: #fff; margin: 0;
  display: flex; align-items: baseline; gap: 1rem;
}
.count-badge { font-size: 1rem; color: #555; font-weight: 400; }
.count-badge.has-items { color: #a29bfe; } /* 有物品时变紫 */

.protocol-code { font-size: 0.75rem; color: #444; letter-spacing: 1px; margin-top: 5px; display: block;}

.header-actions { display: flex; gap: 1rem; }
.btn-ctrl {
  background: transparent; border: 1px solid #333; color: #ccc;
  padding: 0.6rem 1.2rem; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; gap: 0.5rem;
}
.btn-ctrl:hover { border-color: #fff; color: #fff; }
.btn-ctrl.primary { background: #eee; color: #000; border-color: #eee; font-weight: bold; }
.btn-ctrl.primary:hover { background: #fff; }

/* 列表 */
.module-list { display: flex; flex-direction: column; gap: 1rem; }
.empty-state { text-align: center; padding: 4rem; border: 1px dashed #222; color: #444; }
.empty-icon { font-size: 2rem; opacity: 0.5; margin-bottom: 1rem; }

/* 卡片样式 */
.module-card {
  position: relative;
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid #222;
  border-radius: 4px;
  display: flex; overflow: hidden;
  transition: all 0.2s ease-out;
}

/* 悬浮效果保留，但稍微内敛一点 */
.module-card:hover {
  transform: translateY(-3px);
  background: #1a1a1a;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  border-color: #444;
}

.status-bar { width: 4px; background: #222; flex-shrink: 0; transition: background 0.3s; }

.module-content {
  flex: 1; padding: 1.2rem 1.5rem;
  display: flex; justify-content: space-between; gap: 1.5rem;
}

.module-main { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }

.top-row { display: flex; align-items: center; gap: 1rem; }
.module-name {
  font-size: 1.1rem; color: #ddd; margin: 0; font-weight: 600;
  display: flex; align-items: center; gap: 0.6rem;
}

/* Icon 样式 */
.icon-wrapper { color: #a29bfe; font-size: 1.1rem; }
.indicator-dot { width: 6px; height: 6px; background: #333; border-radius: 50%; }

.module-ver { font-size: 0.75rem; color: #555; background: #111; padding: 1px 5px; border-radius: 2px; }
.meta-row { font-size: 0.75rem; color: #666; display: flex; gap: 1rem; margin-top: 0.2rem; }
.module-desc { font-size: 0.85rem; color: #888; margin-top: 0.5rem; line-height: 1.5; }

/* 按钮区 */
.module-ctrl {
  display: flex; flex-direction: column; gap: 0.8rem; justify-content: center;
  width: 100px; flex-shrink: 0; border-left: 1px solid #222; padding-left: 1.5rem;
}
.btn-toggle {
  background: transparent; border: 1px solid #444; color: #888;
  padding: 0.5rem; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
}
.btn-toggle:hover { border-color: #888; color: #ccc; }

.btn-delete {
  background: transparent; border: none; color: #444; font-size: 0.75rem;
  cursor: pointer; text-align: right; text-decoration: underline;
}
.btn-delete:hover { color: #d32f2f; }


/* --- 激活状态 (Active State) --- */
/* 紫色系主题 #a29bfe */
.module-card.active {
  border-color: #6c5ce7; /* 深紫边框 */
  background: rgba(162, 155, 254, 0.05); /* 极淡紫背景 */
}
.module-card.active .status-bar { background: #a29bfe; box-shadow: 2px 0 8px rgba(162, 155, 254, 0.4); }
.module-card.active .indicator-dot { background: #a29bfe; box-shadow: 0 0 5px #a29bfe; }
.module-card.active .module-name { color: #fff; }
.module-card.active .module-desc { color: #aaa; }

.module-card.active .btn-toggle {
  border-color: #a29bfe; color: #fff; background: #a29bfe;
  font-weight: bold; box-shadow: 0 2px 8px rgba(162, 155, 254, 0.3);
}
.module-card.active .btn-toggle:hover {
  background: #b2adff; border-color: #b2adff;
}

@media (max-width: 768px) {
  .module-content { flex-direction: column; }
  .module-ctrl {
    width: 100%; border-left: none; border-top: 1px solid #222;
    padding-left: 0; padding-top: 1rem; flex-direction: row; justify-content: space-between; align-items: center;
  }
}
</style>
