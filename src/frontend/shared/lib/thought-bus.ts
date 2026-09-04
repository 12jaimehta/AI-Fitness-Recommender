export type ThoughtListener = (thoughts: string[]) => void;

export function createThoughtBus() {
  let thoughts: string[] = [];
  const listeners = new Set<ThoughtListener>();

  function emit() {
    for (const listener of listeners) listener(thoughts);
  }

  return {
    read() {
      return thoughts;
    },
    reset() {
      thoughts = [];
      emit();
    },
    push(text: string) {
      const value = text.replace(/\s+/g, " ").trim();
      if (!value || thoughts[thoughts.length - 1] === value) return;
      thoughts = [...thoughts, value];
      emit();
    },
    subscribe(listener: ThoughtListener) {
      listeners.add(listener);
      listener(thoughts);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
