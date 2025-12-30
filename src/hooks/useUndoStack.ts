import { useState, useEffect, useCallback, useRef } from "react";

interface UndoableAction<T> {
  type: string;
  timestamp: number;
  previousState: T;
}

interface UseUndoStackOptions<T> {
  maxSize?: number;
  getCurrentState: () => T;
  restoreState: (state: T) => void;
  /**
   * Called right before restoreState() on undo.
   * Useful to sync the inverse changes to the server.
   */
  onBeforeRestore?: (currentState: T, previousState: T) => void;
}

export function useUndoStack<T>({
  maxSize = 50,
  getCurrentState,
  restoreState,
  onBeforeRestore,
}: UseUndoStackOptions<T>) {
  const [stack, setStack] = useState<UndoableAction<T>[]>([]);
  const isRestoringRef = useRef(false);

  // Push a new action to the stack
  const pushUndo = useCallback((actionType: string) => {
    if (isRestoringRef.current) return;
    
    const currentState = getCurrentState();
    setStack((prev) => {
      const newStack = [
        ...prev,
        {
          type: actionType,
          timestamp: Date.now(),
          previousState: currentState,
        },
      ];
      // Keep only last maxSize actions
      if (newStack.length > maxSize) {
        return newStack.slice(-maxSize);
      }
      return newStack;
    });
  }, [getCurrentState, maxSize]);

  // Undo the last action
  const undo = useCallback(() => {
    if (stack.length === 0) return false;

    const lastAction = stack[stack.length - 1];
    const currentState = getCurrentState();

    isRestoringRef.current = true;

    // Allow caller to sync inverse changes before we restore local state
    onBeforeRestore?.(currentState, lastAction.previousState);

    restoreState(lastAction.previousState);
    setStack((prev) => prev.slice(0, -1));

    // Reset flag after state is restored
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 100);

    return true;
  }, [stack, restoreState, getCurrentState, onBeforeRestore]);

  // Listen for Ctrl+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  return {
    pushUndo,
    undo,
    canUndo: stack.length > 0,
    stackSize: stack.length,
  };
}

