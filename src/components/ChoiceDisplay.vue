<script setup>
defineProps({
  choices: { type: Array, required: true },
});
const emit = defineEmits(['choice-selected']);

function selectChoice(choice) {
  emit('choice-selected', choice);
}

// Map worldview to Font Awesome classes
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
/* 全面套用思源黑體 */
.command-list {
  font-family: "Source Han Sans SC", "Source Han Sans TC", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.choice-node {
  display: flex;
  align-items: flex-start; /* 核心：上端對齊 */
  gap: 0.8rem;
  padding: 0.8rem;
  background-color: #050505;
  border: 1px solid #111; /* 極細邊框 */
  cursor: pointer;
  transition: all 0.1s ease;
  min-width: 0; /* 防止 Flex 溢出 */
}

.choice-node:hover {
  background-color: #0c0c0c;
  border-color: #444;
}

.cursor {
  font-family: monospace;
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
  color: #ccc;
  line-height: 1.5;
  margin: 0;
  word-break: break-word; /* 核心：防止長字撐破 */
}

/* 極簡世界觀標籤 */
.worldview-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: #444;
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
  color: #888;
}

.worldview-tag .value {
  color: #444;
  font-weight: bold;
}

.choice-node:hover .value {
  color: #a29bfe;
}

.tag-req-marker {
  font-size: 0.6em;
  color: #666;
  font-weight: bold;
  display: inline-block;
  margin-right: 0.4rem;
  transition: color 0.2s, text-shadow 0.2s;
  vertical-align: middle;
}

.choice-node:hover .tag-req-marker {
  color: #a29bfe;
  text-shadow: 0 0 8px rgba(162, 155, 254, 0.7);
}
</style>