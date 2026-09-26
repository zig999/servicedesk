import type { ICaseStore } from './case-store.port.js';

export async function deleteCase(store: ICaseStore, slug: string): Promise<void> {
  await store.delete(slug);
}
