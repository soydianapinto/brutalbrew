"use client";

import { useState } from "react";

interface SpotifyPlayerProps {
  articleTitle: string;
  spotifyEmbedUrl: string;
}

export function SpotifyPlayer({
  articleTitle,
  spotifyEmbedUrl,
}: SpotifyPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls="immersion-player"
        onClick={() => {
          setIsExpanded((expanded) => !expanded);
        }}
        className="mb-4 font-mono text-sm text-gray-500 transition-colors hover:text-white"
      >
        {isExpanded ? "> cerrar reproductor" : "> canción disponible"}
      </button>

      {isExpanded && (
        <div id="immersion-player" className="aspect-video w-full">
          <iframe
            key={spotifyEmbedUrl}
            title={`playlist de spotify para ${articleTitle}`}
            src={`${spotifyEmbedUrl}&autoplay=1`}
            className="h-full w-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="eager"
          />
        </div>
      )}
    </>
  );
}
