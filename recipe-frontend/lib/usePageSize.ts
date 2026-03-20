import { useSyncExternalStore } from "react";

function calculate() {
  if (window.innerWidth < 1000) return 3;
  if (window.innerWidth < 1500) return 6;
  return 9;
}

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

export function usePageSize() {
  return useSyncExternalStore(
    subscribe,
    () => calculate(),
    () => null,
  );
}