// Simple in-memory limiter against password guessing: 5 failures per key per 15 minutes.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const fails = new Map<string, number[]>();

function recent(key: string): number[] {
  const now = Date.now();
  const list = (fails.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  fails.set(key, list);
  return list;
}
export const isLimited = (key: string) => recent(key).length >= MAX_FAILS;
export const recordFailure = (key: string) => { recent(key).push(Date.now()); };
export const clearFailures = (key: string) => { fails.delete(key); };
