"use client";

import { useEffect, useState } from "react";

const INITIAL_SECONDS = 5 * 60;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function HeaderTimer({
  onRewardUnlocked,
}: {
  onRewardUnlocked: () => void;
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(INITIAL_SECONDS);
  const isRewardUnlocked = secondsRemaining === 0;

  useEffect(() => {
    if (isRewardUnlocked) {
      onRewardUnlocked();
    }
  }, [isRewardUnlocked, onRewardUnlocked]);

  useEffect(() => {
    if (secondsRemaining === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [secondsRemaining]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/15 bg-black px-5 py-4">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">
          tiempo restante
        </span>
        <div className="text-right">
          <time
            aria-label={`${formatTime(secondsRemaining)} restantes`}
            className="font-mono text-2xl leading-none text-white tabular-nums"
          >
            {formatTime(secondsRemaining)}
          </time>
          {isRewardUnlocked && (
            <p className="mt-3 max-w-xs text-right font-mono text-xs leading-relaxed text-white/60">
              &gt; recompensa: código promocional BRUTAL15
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
