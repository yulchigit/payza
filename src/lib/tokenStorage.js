import { isNativeRuntime } from "lib/runtime";

const memoryStore = new Map();

const fallbackStorage = {
  getItem(key) {
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  },
  setItem(key, value) {
    memoryStore.set(key, String(value));
  },
  removeItem(key) {
    memoryStore.delete(key);
  }
};

const resolveBrowserStorage = (name) => {
  if (typeof window === "undefined") return null;

  try {
    const storage = window[name];
    if (!storage) return null;

    const probeKey = "__payza_storage_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return storage;
  } catch (error) {
    return null;
  }
};

const getPreferredStorage = () => {
  const candidates = isNativeRuntime()
    ? ["localStorage", "sessionStorage"]
    : ["sessionStorage", "localStorage"];

  for (const candidate of candidates) {
    const storage = resolveBrowserStorage(candidate);
    if (storage) {
      return storage;
    }
  }

  return fallbackStorage;
};

export const authTokenStorage = {
  getItem(key) {
    try {
      return getPreferredStorage().getItem(key);
    } catch (error) {
      return fallbackStorage.getItem(key);
    }
  },
  setItem(key, value) {
    const normalizedValue = String(value);
    try {
      getPreferredStorage().setItem(key, normalizedValue);
      fallbackStorage.removeItem(key);
    } catch (error) {
      fallbackStorage.setItem(key, normalizedValue);
    }
  },
  removeItem(key) {
    try {
      getPreferredStorage().removeItem(key);
    } catch (error) {
      // Ignore storage cleanup failures and always clear the in-memory fallback.
    }
    fallbackStorage.removeItem(key);
  }
};
