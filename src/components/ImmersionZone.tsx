"use client";

import { useEffect, useRef, useState } from "react";
import { articles, type Article } from "../../data/brutalFeed";
import { SpotifyPlayer } from "./SpotifyPlayer";

function fetchArticles(): Promise<Article[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(articles), 500);
  });
}

const RETENTION_NODE_COUNT = 5;

function getCenteredSlide(carousel: HTMLDivElement): HTMLElement | null {
  const slides = Array.from(carousel.children) as HTMLElement[];
  const carouselRect = carousel.getBoundingClientRect();
  const visibleCenter = carouselRect.left + carousel.clientWidth / 2;

  return slides.reduce<HTMLElement | null>((closestSlide, slide) => {
    if (!closestSlide) {
      return slide;
    }

    const slideDistance = Math.abs(
      slide.getBoundingClientRect().left +
        slide.clientWidth / 2 -
        visibleCenter,
    );
    const closestDistance = Math.abs(
      closestSlide.getBoundingClientRect().left +
        closestSlide.clientWidth / 2 -
        visibleCenter,
    );

    return slideDistance < closestDistance ? slide : closestSlide;
  }, null);
}

export function ImmersionZone() {
  const [loadedArticles, setLoadedArticles] = useState<Article[]>([]);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [exploredSources, setExploredSources] = useState<string[]>([]);
  const [revealedSources, setRevealedSources] = useState<string[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeSourceRef = useRef<string | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const recenterTimeoutRef = useRef<number | null>(null);
  const dwellTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let isActive = true;

    void fetchArticles().then((nextArticles) => {
      if (isActive) {
        setLoadedArticles(nextArticles);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (loadedArticles.length > 0 && carouselRef.current) {
      const carousel = carouselRef.current;
      const initialSlide = carousel.children[
        loadedArticles.length
      ] as HTMLElement | undefined;

      if (initialSlide) {
        carousel.scrollLeft =
          initialSlide.offsetLeft -
          (carousel.clientWidth - initialSlide.clientWidth) / 2;
      }

      let secondFrame: number | null = null;
      const syncInitialSlide = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          const centeredSlide = getCenteredSlide(carousel);
          const source = centeredSlide?.dataset.source ?? null;

          activeSourceRef.current = source;
          setActiveSource(source);
        });
      });

      return () => {
        window.cancelAnimationFrame(syncInitialSlide);
        if (secondFrame !== null) {
          window.cancelAnimationFrame(secondFrame);
        }
        if (scrollFrameRef.current !== null) {
          window.cancelAnimationFrame(scrollFrameRef.current);
        }
        if (recenterTimeoutRef.current !== null) {
          window.clearTimeout(recenterTimeoutRef.current);
        }
        if (dwellTimeoutRef.current !== null) {
          window.clearTimeout(dwellTimeoutRef.current);
        }
      };
    }
  }, [loadedArticles]);

  const activeArticle =
    loadedArticles.length > 0
      ? loadedArticles.find((article) => article.source === activeSource) ??
        loadedArticles[0]
      : null;

  useEffect(() => {
    if (!activeArticle) {
      return;
    }

    if (dwellTimeoutRef.current !== null) {
      window.clearTimeout(dwellTimeoutRef.current);
    }

    dwellTimeoutRef.current = window.setTimeout(() => {
      setExploredSources((sources) => {
        if (
          sources.includes(activeArticle.source) ||
          sources.length >= RETENTION_NODE_COUNT
        ) {
          return sources;
        }

        return [...sources, activeArticle.source];
      });
      setRevealedSources((sources) =>
        sources.includes(activeArticle.source)
          ? sources
          : [...sources, activeArticle.source],
      );
      dwellTimeoutRef.current = null;
    }, 12_000);

    return () => {
      if (dwellTimeoutRef.current !== null) {
        window.clearTimeout(dwellTimeoutRef.current);
        dwellTimeoutRef.current = null;
      }
    };
  }, [activeArticle]);

  if (!activeArticle) {
    return (
      <section
        aria-label="cargando artículo"
        className="mx-auto w-full max-w-3xl px-6 py-24 text-gray-300 sm:px-10"
      >
        <p className="font-mono text-xs text-gray-500">
          &gt; cargando inmersión...
        </p>
      </section>
    );
  }

  const loopedArticles = Array.from({ length: 5 }, () => loadedArticles).flat();
  const exploredNodeCount = Math.min(
    exploredSources.length,
    RETENTION_NODE_COUNT,
  );

  return (
    <div className="mx-auto w-full max-w-3xl text-gray-300">
      <div
        ref={carouselRef}
        onScroll={(event) => {
          if (scrollFrameRef.current !== null) {
            window.cancelAnimationFrame(scrollFrameRef.current);
          }

          const carousel = event.currentTarget;
          scrollFrameRef.current = window.requestAnimationFrame(() => {
            scrollFrameRef.current = null;

            const feedLength = loadedArticles.length;
            const slides = Array.from(carousel.children) as HTMLElement[];
            const nextActiveSource = getCenteredSlide(carousel)?.dataset.source;
            if (nextActiveSource !== activeSourceRef.current) {
              activeSourceRef.current = nextActiveSource ?? null;
              setActiveSource(nextActiveSource ?? null);
            }

            if (recenterTimeoutRef.current !== null) {
              window.clearTimeout(recenterTimeoutRef.current);
            }

            recenterTimeoutRef.current = window.setTimeout(() => {
              const currentSlide = slides.reduce(
                (closestIndex, slide, slideIndex) => {
                  const currentDistance = Math.abs(
                    slide.offsetLeft +
                      slide.clientWidth / 2 -
                      (carousel.scrollLeft + carousel.clientWidth / 2),
                  );
                  const closestSlide = slides[closestIndex];
                  const closestDistance = Math.abs(
                    closestSlide.offsetLeft +
                      closestSlide.clientWidth / 2 -
                      (carousel.scrollLeft + carousel.clientWidth / 2),
                  );

                  return currentDistance < closestDistance
                    ? slideIndex
                    : closestIndex;
                },
                0,
              );
              const middleBlockStart = feedLength * 2;

              if (
                currentSlide < feedLength ||
                currentSlide >= feedLength * 4
              ) {
                carousel.scrollTo({
                  left: slides[
                    currentSlide < feedLength
                      ? currentSlide + middleBlockStart
                      : currentSlide - middleBlockStart
                  ].offsetLeft,
                  behavior: "auto",
                });
              }

              recenterTimeoutRef.current = null;
            }, 120);
          });
        }}
        className="flex w-full overflow-x-auto snap-x snap-mandatory px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-10"
        style={{ scrollbarWidth: "none" }}
      >
        {loopedArticles.map((article, index) => (
          <article
            key={`${article.source}-${index}`}
            data-source={article.source}
            className="w-full flex-shrink-0 snap-center flex flex-col border-r border-white/15 py-8 px-3 sm:py-12 sm:px-5"
          >
            <header className="mb-12 pb-8">
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-gray-500">
                artículo{" "}
                {String(exploredNodeCount).padStart(2, "0")}/05
                {exploredNodeCount === RETENTION_NODE_COUNT &&
                  " - lectura completada"}
              </p>
              <p className="mb-3 font-mono text-xs text-gray-500">
                &gt; origen: {article.source}
              </p>
              <h2 className="max-w-2xl text-4xl font-bold lowercase leading-tight tracking-[-0.04em] text-white sm:text-6xl">
                {article.title}
              </h2>
              <p className="mt-6 font-mono text-xs lowercase text-gray-500">
                por {article.author}
              </p>
            </header>

            <div className="space-y-7 text-base leading-8 sm:text-lg">
              {article.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {revealedSources.includes(article.source) && (
              <p className="mt-8 font-mono text-xs text-gray-500">
                &gt; leído
              </p>
            )}
          </article>
        ))}
      </div>

      <div className="px-6 pb-12 sm:px-10 sm:pb-16">
        <blockquote className="my-16 border-l-2 border-white pl-6 text-xl italic leading-relaxed text-gray-300 sm:pl-8 sm:text-3xl">
          <p>&ldquo;{activeArticle.quote}&rdquo;</p>
          <cite className="mt-4 block font-mono text-xs not-italic uppercase tracking-[0.18em] text-gray-500">
            cita
          </cite>
        </blockquote>

        <SpotifyPlayer
          key={activeArticle.source}
          articleTitle={activeArticle.title}
          spotifyEmbedUrl={activeArticle.spotifyEmbedUrl}
        />
      </div>
    </div>
  );
}
