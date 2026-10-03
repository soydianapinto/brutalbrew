"use client";

const reorderUrl =
  "https://wa.me/52449XXXXXXX?text=%3E%20iniciar%20secuencia%20de%20reorden.";

export function ReorderFAB() {
  return (
    <button
      type="button"
      onClick={() => {
        window.open(reorderUrl, "_blank");
      }}
      className="fixed bottom-24 right-6 z-50 rounded-none border border-white bg-black px-4 py-3 font-mono text-white"
    >
      &gt; reordenar
    </button>
  );
}
