import { defineStore } from 'pinia';
import { getAllDlcs, setDlc, deleteDlc } from '@/utils/idb';

const fetchJSON = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch JSON from ${url}:`, error);
    return null;
  }
};

const getEnabledIdsFromStorage = () => {
  const stored = localStorage.getItem('enabled_dlcs');
  return stored ? new Set(JSON.parse(stored)) : null; // 返回null表示从未设置过
};

const saveEnabledIdsToStorage = (ids) => {
  localStorage.setItem('enabled_dlcs', JSON.stringify(Array.from(ids)));
};

export const useDlcStore = defineStore('dlc', {
  state: () => ({
    dlcs: [],
    enabledDlcIds: getEnabledIdsFromStorage() || new Set(),
    isLoaded: false,
  }),

  getters: {
    enabledDlcContent(state) {
      return state.dlcs.filter(dlc => state.enabledDlcIds.has(dlc.id));
    },
  },

  actions: {
    /**
     * @description 初始化DLC系统：播种内置DLC，并从IndexedDB加载
     * @param {object} builtInDlcModules - 由 import.meta.glob 扫描到的内置DLC模块
     */
    async initializeDlcSystem(builtInDlcModules) {
      if (this.isLoaded) return;
      console.log('正在初始化DLC系统...');

      // 1. 播种内置DLC
      const storedDlcs = await getAllDlcs();
      const storedDlcIds = new Set(storedDlcs.map(d => d.id));
      
      const seedingPromises = Object.entries(builtInDlcModules).map(async ([path, loader]) => {
        const module = await loader();
        const builtInDlc = module.default;
        if (builtInDlc && !storedDlcIds.has(builtInDlc.id)) {
          console.log(`发现新的内置DLC '${builtInDlc.id}'，正在植入数据库...`);
          await setDlc(builtInDlc);
        }
      });
      await Promise.all(seedingPromises);
      
      // 2. 从IndexedDB加载所有DLC
      this.dlcs = await getAllDlcs();
      
      // 3. 设置启用状态
      if (getEnabledIdsFromStorage() === null) {
        // 首次加载，默认启用所有找到的DLC
        this.enabledDlcIds = new Set(this.dlcs.map(d => d.id));
        saveEnabledIdsToStorage(this.enabledDlcIds);
      }

      this.isLoaded = true;
      console.log(`DLC系统初始化完毕，共加载了 ${this.dlcs.length} 个DLC。`);
    },

    /**
     * @description 从文件输入导入并保存DLC
     * @param {FileList} files - 从 <input type="file"> 获取的文件列表
     */
    async importDlcFiles(files) {
      const importPromises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const content = JSON.parse(event.target.result);
              if (!content.id || !content.name) {
                return reject(new Error(`文件 ${file.name} 格式无效: 缺少 id 或 name 字段。`));
              }
              // 检查是否已存在相同ID的DLC
              if (this.dlcs.some(d => d.id === content.id)) {
                console.warn(`ID为 '${content.id}' 的DLC已存在，将进行覆盖。`);
                // 先从数组中移除旧的
                this.dlcs = this.dlcs.filter(d => d.id !== content.id);
              }
              await setDlc(content); // 存入IndexedDB
              this.dlcs.push(content); // 添加到state
              this.enabledDlcIds.add(content.id); // 默认启用新导入的
              resolve();
            } catch (e) {
              reject(new Error(`解析文件 ${file.name} 失败: ${e.message}`));
            }
          };
          reader.onerror = () => reject(new Error(`读取文件 ${file.name} 失败。`));
          reader.readAsText(file);
        });
      });

      try {
        await Promise.all(importPromises);
        saveEnabledIdsToStorage(this.enabledDlcIds); // 保存启用状态
        console.log(`成功导入 ${files.length} 个DLC文件。`);
      } catch (error) {
        console.error(error.message);
        // 这里可以添加一个反馈给用户的UI提示
      }
    },

    /**
     * @description 删除一个DLC
     * @param {string} dlcId
     */
    async removeDlc(dlcId) {
        try {
            await deleteDlc(dlcId); // 从IndexedDB删除
            this.dlcs = this.dlcs.filter(d => d.id !== dlcId); // 从state删除
            this.enabledDlcIds.delete(dlcId); // 从启用列表删除
            saveEnabledIdsToStorage(this.enabledDlcIds);
            console.log(`成功删除ID为 '${dlcId}' 的DLC。`);
        } catch (error) {
            console.error(`删除ID为 '${dlcId}' 的DLC失败:`, error);
        }
    },

    /**
     * @description 切换指定DLC的启用状态
     * @param {string} dlcId 
     */
    toggleDlc(dlcId) {
      if (this.enabledDlcIds.has(dlcId)) {
        this.enabledDlcIds.delete(dlcId);
      } else {
        this.enabledDlcIds.add(dlcId);
      }
      saveEnabledIdsToStorage(this.enabledDlcIds);
    }
  }
});
