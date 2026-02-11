<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useDevConfig } from '@/composables/devConfig'

const player = usePlayerStore()
const { showTestEvents } = useDevConfig()
const isOpen = ref(false)
const newVarKey = ref('')
const newVarVal = ref(0)
const activeTab = ref('vars')

const toggleConsole = () => {
  isOpen.value = !isOpen.value
}

const filteredVariables = computed(() => {
  return Object.entries(player.variables || {}).sort((a, b) => a[0].localeCompare(b[0]))
})

const setVariable = (key, value) => {
  player.variables[key] = Number(value)
}

const deleteVariable = (key) => {
  delete player.variables[key]
}

const addLog = (msg) => {
  player.addLog({ message: `[DEV] ${msg}`, type: 'system' })
}

const unlockAllTestEvents = () => {
  player.unlockedEventIds.add('test_variable_system_main')
  addLog('已解锁测试事件')
}

const resetGame = () => {
  if (confirm('确定要重置游戏吗？')) {
    player.reset()
    addLog('游戏已重置')
  }
}

const killPlayer = () => {
  player.health = 0
  addLog('玩家已死亡')
}

const setSanityZero = () => {
  player.sanity = 0
  addLog('理智已归零')
}

const addMoney = (amount) => {
  player.money += amount
  addLog(`金钱 +${amount}`)
}

const addAllWorldviews = () => {
  player.logic = 50
  player.gnosis = 50
  player.weirdness = 50
  player.irony = 50
  addLog('世界观已均衡')
}

const currentTheme = ref('default')
const themes = ['default', 'cyberpunk']

const switchTheme = (theme) => {
  document.documentElement.classList.remove('theme-cyberpunk')
  currentTheme.value = theme
  if (theme === 'cyberpunk') {
    document.documentElement.classList.add('theme-cyberpunk')
  }
  addLog(`主题已切换至: ${theme}`)
}
</script>

<template>
  <div class="dev-console" :class="{ open: isOpen }">
    <button class="dev-toggle" @click="toggleConsole" title="开发者工具">
      ⚙
    </button>

    <div v-if="isOpen" class="dev-content">
      <div class="dev-header">
        <span class="dev-title">开发者控制台</span>
        <button class="dev-close" @click="isOpen = false">×</button>
      </div>

      <div class="dev-tabs">
        <button :class="{ active: activeTab === 'vars' }" @click="activeTab = 'vars'">变量</button>
        <button :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">属性</button>
        <button :class="{ active: activeTab === 'events' }" @click="activeTab = 'events'">事件</button>
        <button :class="{ active: activeTab === 'debug' }" @click="activeTab = 'debug'">调试</button>
      </div>

      <div v-if="activeTab === 'vars'" class="dev-section">
        <div class="var-list">
          <div v-if="filteredVariables.length === 0" class="empty-msg">
            无变量
          </div>
          <div v-for="[key, val] in filteredVariables" :key="key" class="var-row">
            <span class="var-name" :title="key">{{ key }}</span>
            <input
              type="number"
              :value="val"
              @input="e => setVariable(key, e.target.value)"
              class="var-input"
            >
            <button @click="deleteVariable(key)" class="btn-del" title="删除">×</button>
          </div>
        </div>
        <div class="add-var">
          <input
            v-model="newVarKey"
            placeholder="变量名"
            class="var-input small"
          >
          <input
            type="number"
            v-model.number="newVarVal"
            placeholder="值"
            class="var-input small"
          >
          <button @click="() => { if(newVarKey) { setVariable(newVarKey, newVarVal || 0); newVarKey = ''; newVarVal = 0 } }">
            +
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'stats'" class="dev-section">
        <div class="stats-grid">
          <div class="stat-row">
            <span class="stat-label">生命</span>
            <input type="number" v-model.number="player.health" class="stat-input">
          </div>
          <div class="stat-row">
            <span class="stat-label">理智</span>
            <input type="number" v-model.number="player.sanity" class="stat-input">
          </div>
          <div class="stat-row">
            <span class="stat-label">金钱</span>
            <input type="number" v-model.number="player.money" class="stat-input">
          </div>
          <div class="stat-row">
            <span class="stat-label">回合</span>
            <input type="number" v-model.number="player.turn" class="stat-input">
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-row">
            <span class="stat-label">逻辑</span>
            <input type="number" v-model.number="player.logic" class="stat-input">
          </div>
          <div class="stat-row">
            <span class="stat-label">灵知</span>
            <input type="number" v-model.number="player.gnosis" class="stat-input">
          </div>
          <div class="stat-row">
            <span class="stat-label">怪诞</span>
            <input type="number" v-model.number="player.weirdness" class="stat-input">
          </div>
          <div class="stat-row">
            <span class="stat-label">解构</span>
            <input type="number" v-model.number="player.irony" class="stat-input">
          </div>
        </div>
        <div class="quick-actions">
          <button @click="killPlayer" class="btn-danger">💀 立即死亡</button>
          <button @click="setSanityZero">🧠 理智归零</button>
          <button @click="addMoney(1000)">💰 +1000</button>
          <button @click="addAllWorldviews">⚖ 均衡世界观</button>
        </div>
      </div>

      <div v-if="activeTab === 'events'" class="dev-section">
        <label class="dev-checkbox">
          <input type="checkbox" v-model="showTestEvents">
          显示 test 标签事件
        </label>
        <div class="event-info">
          <div>已触发事件: {{ player.triggeredEventIds?.size || 0 }}</div>
          <div>已解锁事件: {{ player.unlockedEventIds?.size || 0 }}</div>
          <div>已做出选择: {{ player.madeChoices?.size || 0 }}</div>
        </div>
        <div class="quick-actions">
          <button @click="unlockAllTestEvents">🔓 解锁测试事件</button>
          <button @click="player.triggeredEventIds.clear()">🗑 清空已触发</button>
          <button @click="player.unlockedEventIds.clear()">🗑 清空已解锁</button>
          <button @click="player.madeChoices.clear()">🗑 清空选择记录</button>
        </div>
      </div>

      <div v-if="activeTab === 'debug'" class="dev-section">
        <div class="debug-info">
          <div class="debug-header">核心数值</div>
          <div class="debug-row"><span>生命</span><span>{{ player.health }}</span></div>
          <div class="debug-row"><span>理智</span><span>{{ player.sanity }}</span></div>
          <div class="debug-row"><span>金钱</span><span>{{ player.money }}</span></div>
          <div class="debug-row"><span>回合</span><span>{{ player.turn }}</span></div>
          <div class="debug-row"><span>声望</span><span>{{ player.fame }}</span></div>
          <div class="debug-row"><span>匿名性</span><span>{{ player.anonymity }}</span></div>
        </div>
        <div class="debug-info">
          <div class="debug-header">世界观</div>
          <div class="debug-row"><span>逻辑</span><span>{{ player.logic }}</span></div>
          <div class="debug-row"><span>灵知</span><span>{{ player.gnosis }}</span></div>
          <div class="debug-row"><span>怪诞</span><span>{{ player.weirdness }}</span></div>
          <div class="debug-row"><span>解构</span><span>{{ player.irony }}</span></div>
          <div class="debug-row"><span>主导</span><span>{{ player.dominantWorldview }}</span></div>
        </div>
        <div class="debug-info">
          <div class="debug-header">状态效果 ({{ player.statusEffects?.length || 0 }})</div>
          <div v-if="!player.statusEffects?.length" class="debug-item">无</div>
          <div v-for="eff in player.statusEffects" :key="eff.id" class="debug-item">
            {{ eff.id }} [Lv.{{ eff.levels }}, {{ eff.duration }}回合]
          </div>
        </div>
        <div class="debug-info">
          <div class="debug-header">标签 ({{ player.tags?.length || 0 }})</div>
          <div class="debug-item">{{ player.tags?.join(', ') || '无' }}</div>
        </div>
        <div class="debug-info">
          <div class="debug-header">物品 ({{ player.inventory?.length || 0 }})</div>
          <div class="debug-item">{{ player.inventory?.join(', ') || '无' }}</div>
        </div>
        <div class="debug-info">
          <div class="debug-header">天赋 ({{ player.talents?.length || 0 }})</div>
          <div class="debug-item">{{ player.talents?.map(t => t.name).join(', ') || '无' }}</div>
        </div>
        <div class="debug-info">
          <div class="debug-header">事件统计</div>
          <div class="debug-row"><span>已触发</span><span>{{ player.triggeredEventIds?.size || 0 }}</span></div>
          <div class="debug-row"><span>已解锁</span><span>{{ player.unlockedEventIds?.size || 0 }}</span></div>
          <div class="debug-row"><span>已选择</span><span>{{ player.madeChoices?.size || 0 }}</span></div>
        </div>
        <div class="debug-info">
          <div class="debug-header">日志 ({{ player.log?.length || 0 }})</div>
          <div class="debug-item" style="max-height: 60px; overflow: auto;">
            {{ player.log?.slice(-5).map(l => l.type).join(', ') || '无' }}
          </div>
        </div>
        <div class="debug-info">
          <div class="debug-header">主题切换</div>
          <div class="theme-selector">
            <button
              v-for="theme in themes"
              :key="theme"
              :class="{ active: currentTheme === theme }"
              @click="switchTheme(theme)"
              class="theme-btn"
            >
              {{ theme === 'cyberpunk' ? '赛博朋克' : '默认' }}
            </button>
          </div>
        </div>
        <div class="quick-actions">
          <button @click="addLog('测试日志')">📝 添加日志</button>
          <button @click="resetGame" class="btn-danger">🔄 重置游戏</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dev-console {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 9999;
  font-family: var(--font-mono);
  font-size: 12px;
}

.dev-toggle {
  width: 28px;
  height: 28px;
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid var(--border-highlight);
  color: var(--text-dim);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
  transition: opacity 0.2s, color 0.2s;
}

.dev-toggle:hover {
  opacity: 1;
  color: var(--success);
  border-color: var(--success);
}

.dev-content {
  position: absolute;
  bottom: 35px;
  right: 0;
  background: rgba(10, 10, 10, 0.98);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  width: 340px;
  max-height: 450px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow);
}

.dev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-light);
}

.dev-title {
  color: var(--success);
  font-size: 11px;
  letter-spacing: 1px;
}

.dev-close {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  line-height: 1;
}

.dev-close:hover {
  color: var(--danger);
}

.dev-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-light);
}

.dev-tabs button {
  flex: 1;
  background: var(--bg-secondary);
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-dim);
  padding: 6px 0;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.dev-tabs button:hover {
  color: var(--text-secondary);
}

.dev-tabs button.active {
  color: var(--success);
  border-bottom-color: var(--success);
  background: var(--bg-elevated);
}

.dev-section {
  padding: 10px;
  max-height: 350px;
  overflow-y: auto;
}

.dev-section::-webkit-scrollbar {
  width: 4px;
}

.dev-section::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 2px;
}

.dev-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  font-size: 11px;
}

.dev-checkbox input {
  accent-color: var(--success);
}

.event-info {
  color: var(--text-dim);
  font-size: 10px;
  margin-bottom: 10px;
  line-height: 1.6;
}

.debug-info {
  color: var(--text-dim);
  font-size: 10px;
  margin-bottom: 8px;
}

.debug-header {
  color: var(--success);
  font-weight: bold;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 2px;
}

.debug-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  color: var(--text-secondary);
}

.debug-item {
  color: var(--text-secondary);
  word-break: break-all;
  padding-left: 8px;
  line-height: 1.5;
}

.empty-msg {
  color: var(--text-muted);
  text-align: center;
  padding: 10px;
  font-style: italic;
}

.var-list {
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 8px;
}

.var-row {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.var-name {
  color: #ff0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.var-input {
  width: 55px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  padding: 2px 4px;
  font-size: 11px;
  border-radius: 2px;
}

.var-input.small {
  width: 70px;
}

.btn-del {
  background: var(--bg-elevated);
  border: 1px solid #522;
  color: #f44;
  cursor: pointer;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 2px;
}

.add-var {
  display: flex;
  gap: 6px;
}

.add-var button {
  background: var(--bg-elevated);
  border: 1px solid var(--success);
  color: var(--success);
  cursor: pointer;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-label {
  color: var(--text-dim);
  width: 36px;
  font-size: 10px;
}

.stat-input {
  flex: 1;
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  padding: 2px 4px;
  font-size: 11px;
  border-radius: 2px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
}

.quick-actions button {
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  padding: 6px 10px;
  cursor: pointer;
  font-size: 10px;
  text-align: left;
  border-radius: 2px;
  transition: all 0.2s;
}

.quick-actions button:hover {
  background: var(--bg-tertiary);
  border-color: var(--success);
  color: var(--success);
}

.btn-danger {
  color: var(--danger) !important;
  border-color: #622 !important;
}

.btn-danger:hover {
  background: #311 !important;
  border-color: var(--danger) !important;
}

.theme-selector {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.theme-btn {
  flex: 1;
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  padding: 6px 10px;
  cursor: pointer;
  font-size: 10px;
  border-radius: 2px;
  transition: all 0.2s;
}

.theme-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--success);
  color: var(--success);
}

.theme-btn.active {
  background: rgba(0, 245, 255, 0.1);
  border-color: var(--success);
  color: var(--success);
}
</style>
