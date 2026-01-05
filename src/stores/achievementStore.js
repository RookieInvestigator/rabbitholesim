import { defineStore } from 'pinia';
import { ref } from 'vue';
import allAchievementsData from '@/data/achievements.json';

const getUnlockedFromStorage = () => {
  const stored = localStorage.getItem('unlocked_achievements');
  return stored ? new Set(JSON.parse(stored)) : new Set();
};

const saveUnlockedToStorage = (ids) => {
  localStorage.setItem('unlocked_achievements', JSON.stringify(Array.from(ids)));
};

export const useAchievementStore = defineStore('achievements', () => {
  const allAchievements = ref(allAchievementsData);
  const unlockedAchievementIds = ref(getUnlockedFromStorage());

  const unlockedAchievements = () => {
    return allAchievements.value.filter(ach => unlockedAchievementIds.value.has(ach.id));
  };
  
  const lockedAchievements = () => {
    return allAchievements.value.filter(ach => !unlockedAchievementIds.value.has(ach.id) && !ach.hidden);
  };

  function unlockAchievement(id) {
    if (!id || unlockedAchievementIds.value.has(id)) {
      return; // 如果没有ID或已经解锁，则不执行任何操作
    }
    
    const achievement = allAchievements.value.find(ach => ach.id === id);
    if (!achievement) {
      console.warn(`试图解锁一个不存在的成就: ${id}`);
      return;
    }

    console.log(`✨ 成就解锁: ${achievement.name} ✨`);
    unlockedAchievementIds.value.add(id);
    saveUnlockedToStorage(unlockedAchievementIds.value);
    
    // 在这里可以添加一个显示成就解锁通知的逻辑
    // e.g., eventBus.emit('achievement-unlocked', achievement);
  }

  return {
    allAchievements,
    unlockedAchievementIds,
    unlockAchievement,
    unlockedAchievements,
    lockedAchievements,
  };
});
