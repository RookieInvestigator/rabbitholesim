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
  const escapedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
        class="log-entry-enter"
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
  overflow-x: hidden;
  padding: 1.5rem;
  box-sizing: border-box;
  font-family: var(--font-sans);
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.log-entry {
  position: relative;
  align-self: flex-start;
  width: 100%;
  border-left: 1px solid var(--border);
  padding-left: 1.2rem;
  transition: border-color 0.3s ease;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.log-entry:last-child {
  border-left-color: var(--border-light);
}

.event-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.type-rare .event-title {
  color: #5cadff;
  text-shadow: 0 0 8px rgba(74, 144, 226, 0.3);
}

.type-legend .event-title {
  color: #ffda8e;
  text-shadow: 0 0 10px rgba(255, 200, 120, 0.4);
}

.type-ending .event-title {
  color: var(--danger);
  text-shadow: 0 0 10px rgba(255, 71, 87, 0.4);
}

.event-text, .generic-text {
  font-size: 0.95rem;
  color: var(--text-dim);
  line-height: 1.7;
  white-space: pre-wrap;
  margin: 0;
}

.type-choice .generic-text {
  color: var(--text-dim);
  font-style: italic;
  position: relative;
  padding-left: 1.5rem;
}

.type-choice .generic-text::before {
  position: absolute;
  left: 0;
  top: 2px;
  color: var(--text-muted);
  font-size: 0.8rem;
}
</style>
