"use client";

import { useEffect } from "react";

const BOOT_DURATION_MS = 2000;

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onComplete();
    }, BOOT_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onComplete]);

  return (
    <div
      aria-label="brutal_os está inicializando"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black px-6 text-center font-mono text-xl text-white"
    >
      brutal&gt; inicializando...
    </div>
  );
}
