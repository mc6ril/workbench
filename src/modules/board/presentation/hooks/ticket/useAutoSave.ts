import { useEffect, useRef, useState } from "react";

export type AutoSaveState = "idle" | "saving" | "saved";

export function useAutoSave(
  canSave: boolean,
  onSave: () => Promise<void>
): { autoSaveState: AutoSaveState } {
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>("idle");

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveRef = useRef({ canSave, onSave });
  useEffect(() => {
    saveRef.current = { canSave, onSave };
  });

  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    if (!canSave) {
      return;
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveState("saving");
      try {
        await onSave();
        setAutoSaveState("saved");
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(
          () => setAutoSaveState("idle"),
          2000
        );
      } catch {
        setAutoSaveState("idle");
      }
    }, 800);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [canSave, onSave]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }

      if (!saveRef.current.canSave) {
        return;
      }

      void saveRef.current.onSave().catch(() => {});
    };
  }, []); // intentional empty deps: cleanup reads from saveRef, not closure

  return { autoSaveState };
}
