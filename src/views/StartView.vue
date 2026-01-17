<template>
  <div class="start-container" :class="{ 'loaded': isMounted }">
    <div class="brand">
      <h1 class="title">兔子洞模拟器</h1>
      <p class="version">RABBIT HOLE SIM <span class="blink">_</span></p>
    </div>

    <nav class="menu">
      <button
        class="btn-main"
        @click="$emit('startGame')"
        :disabled="isLoading"
      >
        <span class="btn-content">
          {{ isLoading ? "系统同步中..." : "启动连接" }}
        </span>
        <div class="glow-effect"></div>
      </button>

      <div class="sub-menu">
        <button class="btn-link" @click="$emit('manageDlc')" :disabled="isLoading">DLC管理</button>
        <button class="btn-link" @click="$emit('showAchievements')" :disabled="isLoading">成就</button>
        <button class="btn-link" @click="$emit('openEditor')" :disabled="isLoading">编辑器（尚未完成）</button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

defineProps({ isLoading: Boolean });
defineEmits(['startGame', 'manageDlc', 'openEditor', 'showAchievements']);

const isMounted = ref(false);
onMounted(() => {
  // 简单的入场延迟，让动画生效
  setTimeout(() => isMounted.value = true, 100);
});
</script>

<style scoped>
.start-container {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #050505;
  color: #fff;
  font-family: 'Segoe UI', sans-serif; /* 换个更干净的字体 */
  position: relative;
  overflow: hidden;

  /* 背景动效 */
  background-image:
    radial-gradient(circle at 50% 30%, rgba(20, 20, 30, 0.4) 0%, rgba(0, 0, 0, 1) 70%),
    repeating-linear-gradient(transparent 0, transparent 2px, rgba(255, 255, 255, 0.02) 3px);
  opacity: 0;
  transition: opacity 1s ease-out;
}

.start-container.loaded { opacity: 1; }

.brand {
  text-align: center;
  margin-bottom: 4rem;
  z-index: 2;
  transform: translateY(20px);
  transition: transform 1s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.loaded .brand { transform: translateY(0); }

.title {
  font-size: 3rem;
  font-weight: 200; /* 极细字体，更有未来感 */
  letter-spacing: 0.8rem;
  margin: 0;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
  background: linear-gradient(to bottom, #fff, #888);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.version {
  color: #555;
  font-size: 0.7rem;
  margin-top: 1rem;
  letter-spacing: 0.3rem;
  font-family: monospace;
}

.blink { animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0; } }

.menu {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 240px;
  z-index: 2;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s; /* 延迟出现 */
}
.loaded .menu { transform: translateY(0); opacity: 1; }

/* 主按钮：丝滑光效 */
.btn-main {
  position: relative;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 1.2rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s ease;
}

.btn-content {
  position: relative;
  z-index: 2;
  font-weight: 600;
  letter-spacing: 2px;
  font-size: 1rem;
}

.glow-effect {
  position: absolute;
  top: 0; left: -100%;
  width: 200%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: skewX(-20deg);
  transition: left 0.5s ease;
  z-index: 1;
}

.btn-main:hover {
  border-color: #fff;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.btn-main:hover .glow-effect { left: 100%; transition: left 0.7s ease; }

/* 次级菜单 */
.sub-menu {
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(255,255,255,0.1);
  padding-left: 1.5rem;
  gap: 0.8rem;
}

.btn-link {
  background: transparent;
  color: #666;
  border: none;
  padding: 0.5rem 0;
  cursor: pointer;
  text-align: left;
  font-size: 0.85rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  position: relative;
}

.btn-link:hover {
  color: #fff;
  padding-left: 10px; /* 丝滑位移 */
  text-shadow: 0 0 5px rgba(255,255,255,0.3);
}
.btn-link:hover::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  width: 4px; height: 1px;
  background: #fff;
}
</style>
