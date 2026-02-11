<script setup>
defineProps({
  choices: { type: Array, required: true },
});
const emit = defineEmits(['choice-selected']);

function selectChoice(choice) {
  emit('choice-selected', choice);
}

const worldviewIcons = {
  logic: 'fas fa-atom icon-logic',
  gnosis: 'fas fa-eye icon-gnosis',
  weirdness: 'fas fa-spider icon-weirdness',
  irony: 'fas fa-masks-theater icon-irony'
};

function hasTagRequirement(choice) {
  if (!choice.conditions) return false;
  return choice.conditions.some(c => c.type === 'tag_check');
}
</script>

<template>
  <div class="command-list">
    <div
      v-for="choice in choices"
      :key="choice.uuid"
      class="choice-node"
      @click="selectChoice(choice)"
    >
      <div class="cursor">
        <div v-if="choice.worldview" class="worldview-tag">
          <span class="icon"><i :class="worldviewIcons[choice.worldview] || 'fas fa-question-circle'"></i></span>
        </div>
      </div>

      <div class="choice-body">
        <p class="main-text">
          {{ choice.text }}
          <span v-if="hasTagRequirement(choice)" class="tag-req-marker" title="特殊">◆</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.command-list {
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.choice-node {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.8rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.1s ease;
  min-width: 0;
}

.choice-node:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-highlight);
}

.cursor {
  font-family: var(--font-mono);
  font-weight: bold;
  font-size: 1rem;
  padding-top: 0.1rem;
}

.choice-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.main-text {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
}

.worldview-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: var(--text-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.worldview-tag .icon {
  font-size: 0.8rem;
}

.icon-logic { color: #3498db; }
.icon-gnosis { color: #9b59b6; }
.icon-weirdness { color: #2ecc71; }
.icon-irony { color: #e67e22; }

.choice-node:hover .worldview-tag {
  color: var(--text-dim);
}

.worldview-tag .value {
  color: var(--text-muted);
  font-weight: bold;
}

.choice-node:hover .value {
  color: var(--accent);
}

.tag-req-marker {
  font-size: 0.6em;
  color: var(--text-dim);
  font-weight: bold;
  display: inline-block;
  margin-right: 0.4rem;
  transition: color 0.2s, text-shadow 0.2s;
  vertical-align: middle;
}

.choice-node:hover .tag-req-marker {
  color: var(--accent);
  text-shadow: 0 0 8px var(--accent-glow);
}
</style>
