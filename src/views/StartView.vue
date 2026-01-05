<template>
  <div class="start-container">
    <div class="brand">
      <h1 class="title">兔子洞模拟器</h1>
      <p class="version">PROJECT TERMINUS [v0.1.0]</p>
    </div>

    <nav class="menu">
      <button class="btn-main" @click="$emit('startGame')" :disabled="isLoading">
        {{ isLoading ? "> 同步中..." : "> 启动" }}
      </button>
      <button class="btn-link" @click="$emit('manageDlc')" :disabled="isLoading">DLC管理</button>
      <button class="btn-link" @click="$emit('showAchievements')" :disabled="isLoading">成就</button>
      <button class="btn-link" @click="$emit('openEditor')" :disabled="isLoading">编辑器</button>
    </nav>
  </div>
</template>

<script setup>
defineProps({ isLoading: Boolean });
defineEmits(['startGame', 'manageDlc', 'openEditor', 'showAchievements']);
</script>

<style scoped>
.start-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #000;
}

.brand { text-align: center; margin-bottom: 4rem; }

.title {
  font-size: 2.5rem;
  letter-spacing: 0.5rem;
  margin: 0;
  font-weight: 300;
}

.version {
  color: var(--text-dim);
  font-size: 0.8rem;
  margin-top: 0.5rem;
  letter-spacing: 2px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 200px;
}

.btn-main {
  background: #fff;
  color: #000;
  border: none;
  padding: 1rem;
  cursor: pointer;
  font-weight: bold;
  text-align: left;
}

.btn-main:hover:not(:disabled) { background: var(--accent); }

.btn-link {
  background: transparent;
  color: var(--text-dim);
  border: 1px solid var(--border);
  padding: 0.8rem;
  cursor: pointer;
  text-align: left;
}

.btn-link:hover:not(:disabled) {
  border-color: #fff;
  color: #fff;
}
</style>