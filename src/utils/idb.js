const DB_NAME = 'RabbitHoleDB';
const STORE_NAME = 'dlcs';
const DB_VERSION = 1;

let dbPromise = null;

function openDb() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.errorCode);
      reject('IndexedDB error');
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
  return dbPromise;
}

/**
 * 获取所有存储的DLC
 * @returns {Promise<Array<any>>}
 */
export async function getAllDlcs() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error('Error fetching all from IndexedDB:', event.target.errorCode);
      reject('Error fetching all');
    };
  });
}

/**
 * 存储一个DLC
 * @param {object} dlcContent - DLC的完整内容
 * @returns {Promise<void>}
 */
export async function setDlc(dlcContent) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(dlcContent);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error setting item in IndexedDB:', event.target.errorCode);
      reject('Error setting item');
    };
  });
}

/**
 * 删除一个DLC
 * @param {string} dlcId - DLC的ID
 * @returns {Promise<void>}
 */
export async function deleteDlc(dlcId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(dlcId);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error deleting item from IndexedDB:', event.target.errorCode);
            reject('Error deleting item');
        };
    });
}
