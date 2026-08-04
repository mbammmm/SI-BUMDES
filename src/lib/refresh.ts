type Listener = () => void;

const listeners = new Set<Listener>();

export function emitRefresh() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (error) {
      console.error("Refresh listener error:", error);
    }
  });
}

export function subscribeRefresh(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
