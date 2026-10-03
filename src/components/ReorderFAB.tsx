"use client";

const defaultReorderUrl =
  "https://wa.me/52449XXXXXXX?text=%3E%20iniciar%20secuencia%20de%20reorden.";
const rewardReorderUrl =
  "https://wa.me/52449XXXXXXX?text=%3E%20iniciar%20secuencia%20de%20reorden%20con%20BRUTAL15.";

export function ReorderFAB({
  isRewardUnlocked,
}: {
  isRewardUnlocked: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.open(
          isRewardUnlocked ? rewardReorderUrl : defaultReorderUrl,
          "_blank",
        );
      }}
      className={`fixed bottom-24 right-6 z-50 rounded-none border border-white bg-black px-4 py-3 font-mono text-white ${
        isRewardUnlocked ? "tracking-wide" : ""
      }`}
    >
      {isRewardUnlocked ? "> reordenar con BRUTAL15" : "> reordenar"}
    </button>
  );
}
