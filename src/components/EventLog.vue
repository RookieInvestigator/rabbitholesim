<script setup>
import { usePlayerStore } from '@/stores/playerStore';
const player = usePlayerStore();
</script>

<template>
  <div class="event-log">
    <ul>
      <li v-for="log in player.log" :key="log.id" :class="`log-${log.type}`">
        {{ log.message }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.event-log {
  height: 450px;
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  border: 1px solid #333;
}
ul { list-style: none; padding: 0; margin: 0; }
li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #2a2a2a;
  color: #ccc;
  line-height: 1.6;
}
li:last-child { border-bottom: none; }
.log-event { color: white; font-weight: 600; }
.log-choice { color: #8cb4ff; }
.log-feedback { color: #888; font-style: italic; }
.log-system { text-align: center; color: #666; font-style: italic; }
.log-ending { text-align: center; color: #ffc878; font-weight: bold; font-size: 1.1rem; }
</style>