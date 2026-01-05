import { reactive, readonly } from 'vue';
import { useDlcStore } from '@/stores/dlcStore';

// ✨ 黑魔法：利用Vite自动发现所有数据和DLC文件！
const baseDataModules = import.meta.glob('/src/data/**/*.json');
const builtInDlcModules = import.meta.glob('/src/dlc/**/*.dlc.json');

const gameData = reactive({
  events: [],
  talents: [],
  endings: [],
  statusEffects: {},
  customStats: [],
});

let isLoaded = false;

const resetData = () => {
  gameData.events = [];
  gameData.talents = [];
  gameData.endings = [];
  gameData.statusEffects = {};
  gameData.customStats = [];
  isLoaded = false;
  console.log("游戏数据已重置。");
};

/**
 * @description 加载所有游戏数据的函数！
 * 现在是基于 import.meta.glob 的全自动加载！
 */
const loadAllData = async ({ force = false } = {}) => {
  if (isLoaded && !force) {
    return gameData.customStats;
  }
  if (force) {
    resetData();
  }
  console.log("正在全自动加载数据...");

  const dlcStore = useDlcStore();

  // 1. 将发现的内置DLC模块交给dlcStore去初始化和播种
  await dlcStore.initializeDlcSystem(builtInDlcModules);

  // 2. 加载基础游戏数据
  let baseEvents = [];
  let baseTalents = [];
  let baseEndings = [];
  let baseStatusEffects = {};

  for (const path in baseDataModules) {
    const loader = baseDataModules[path];
    const module = await loader();
    const content = module.default;
    
    if (path.includes('/events/')) baseEvents.push(...content);
    else if (path.includes('talents.json')) baseTalents.push(...content);
    else if (path.includes('endings.json')) baseEndings.push(...content);
    else if (path.includes('status_effects.json')) Object.assign(baseStatusEffects, content);
  }
  
  // 3. 合并已启用的DLC数据
  const enabledDlcContent = dlcStore.enabledDlcContent;
  let dlcEvents = [];
  let dlcTalents = [];
  let dlcEndings = [];
  let dlcStatusEffects = {};
  let dlcCustomStats = [];

  enabledDlcContent.forEach(dlc => {
    if (dlc.events) dlcEvents.push(...dlc.events);
    if (dlc.talents) dlcTalents.push(...dlc.talents);
    if (dlc.endings) dlcEndings.push(...dlc.endings);
    if (dlc.statusEffects) Object.assign(dlcStatusEffects, dlc.statusEffects);
    if (dlc.customStats) dlcCustomStats.push(...dlc.customStats);
  });

  // 4. 最终合并与更新
  gameData.events = [...baseEvents, ...dlcEvents];
  gameData.talents = [...baseTalents, ...dlcTalents];
  gameData.endings = [...baseEndings, ...dlcEndings];
  gameData.statusEffects = { ...baseStatusEffects, ...dlcStatusEffects };
  gameData.customStats = dlcCustomStats; // 自定义数值只来源于DLC
  isLoaded = true;

  console.log("数据加载与合并完成！", {
    events: gameData.events.length,
    talents: gameData.talents.length,
    endings: gameData.endings.length,
    statusEffects: Object.keys(gameData.statusEffects).length,
    customStats: gameData.customStats.length,
    enabledDlcs: Array.from(dlcStore.enabledDlcIds),
  });

  return gameData.customStats;
};

export function useDataCenter() {
  return {
    gameData: readonly(gameData),
    loadAllData,
    resetData,
  };
}
