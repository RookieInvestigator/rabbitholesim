<script setup>
import { usePlayerStore } from '@/stores/playerStore';

const player = usePlayerStore();

const worldviewColors = {
  logic: '#3498db',
  gnosis: '#9b59b6',
  weirdness: '#2ecc71',
  irony: '#e67e22',
};

function parseText(text) {
  if (!text) return '';
  // Escape basic HTML to prevent injection, except for our own markup
  const escapedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Replace our custom markup with styled spans
  return escapedText.replace(/\[\[(logic|gnosis|weirdness|irony):(.+?)\]\]/g, (match, tendency, content) => {
    const color = worldviewColors[tendency] || '#888';
    return `<span style="color: ${color}; font-weight: 500;">${content}</span>`;
  });
}
</script>

<template>
  <div class="terminal-log">
    <div class="log-content">
      <div 
        v-for="log in player.log" 
        :key="log.id" 
        :class="['log-entry', `type-${log.type}`]"
      >
        <template v-if="log.type === 'event' && typeof log.message === 'object'">
          <div class="event-title">{{ log.message.title || 'NULL_ID' }}</div>
          <div class="event-text" v-html="parseText(log.message.text)"></div>
        </template>
        
        <template v-else>
          <div class="generic-text" v-html="parseText(typeof log.message === 'object' ? log.message.text : log.message)"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal-log {
  background: #000;
  overflow-x: hidden;
  padding: 1.5rem;
  box-sizing: border-box;
  font-family: "Source Han Sans SC", "Source Han Sans TC", sans-serif;
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.log-entry {
  align-self: flex-start;
  width: 100%;
  border-left: 1px solid #111; /* 預設為極深灰 */
  padding-left: 1rem;
  transition: border-color 0.3s ease; /* 增加一個平滑過渡，讓指示更自然 */
}

/* ✨ 微弱指示器：將最後一個條目的邊框調亮 ✨ */
.log-entry:last-child {
  border-left-color: #444; /* 稍微亮一點的灰色，指示當前位置 */
}

.event-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ccc;
  margin: 0 0 0.5rem 0;
}

/* 稀有度顏色僅作用於文字 */
.type-rare .event-title { color: #4A90E2; }
.type-legend .event-title { color: #ffc878; }
.type-ending .event-title { color: #ff4757; }

.event-text, .generic-text {
  font-size: 0.95rem;
  color: #888;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

.type-choice .generic-text { color: #555555; }
</style>