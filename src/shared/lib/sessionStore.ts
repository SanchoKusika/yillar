// In-memory session store replacing web's sessionStorage for cross-screen data.
// Data lives only for the lifetime of the app process.
const store = new Map<string, string>();

export const sessionStore = {
  setItem(key: string, value: string): void {
    store.set(key, value);
  },
  getItem(key: string): string | null {
    return store.get(key) ?? null;
  },
  removeItem(key: string): void {
    store.delete(key);
  },
};
