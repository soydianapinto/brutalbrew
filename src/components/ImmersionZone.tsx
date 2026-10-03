"use client";

import { useEffect, useRef, useState } from "react";
import { articles, type Article } from "../../data/brutalFeed";

function fetchArticles(): Promise<Article[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(articles), 500);
  });
}

export function ImmersionZone() {
  const [loadedArticles, setLoadedArticles] = useState<Article[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const recenterTimeoutRef = useRef<number | null>(null);

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
      carouselRef.current.scrollLeft =
        carouselRef.current.clientWidth * loadedArticles.length;

      return () => {
        if (scrollFrameRef.current !== null) {
          window.cancelAnimationFrame(scrollFrameRef.current);
        }
        if (recenterTimeoutRef.current !== null) {
          window.clearTimeout(recenterTimeoutRef.current);
        }
      };
    }
  }, [loadedArticles.length]);

  if (loadedArticles.length === 0) {
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
  const activeArticle = loadedArticles[activeIndex % loadedArticles.length];

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

            const slideWidth = carousel.clientWidth;
            const feedLength = loadedArticles.length;
            const index = Math.round(carousel.scrollLeft / slideWidth);
            setActiveIndex(index % feedLength);

            if (recenterTimeoutRef.current !== null) {
              window.clearTimeout(recenterTimeoutRef.current);
            }

            recenterTimeoutRef.current = window.setTimeout(() => {
              const currentSlide = Math.round(
                carousel.scrollLeft / slideWidth,
              );
              const middleBlockStart = feedLength * 2;

              if (
                currentSlide < feedLength ||
                currentSlide >= feedLength * 4
              ) {
                carousel.scrollTo({
                  left:
                    (currentSlide < feedLength
                      ? currentSlide + middleBlockStart
                      : currentSlide - middleBlockStart) * slideWidth,
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
            className="w-full flex-shrink-0 snap-center flex flex-col border-r border-white/15 py-8 px-3 sm:py-12 sm:px-5"
          >
            <header className="mb-12 pb-8">
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-gray-500">
                zona_immersiva / artículo
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
          </article>
        ))}
      </div>

      <div className="px-6 pb-12 sm:px-10 sm:pb-16">
        <blockquote className="my-16 border-l-2 border-white pl-6 text-xl italic leading-relaxed text-gray-300 sm:pl-8 sm:text-3xl">
          <p>&ldquo;{activeArticle.quote}&rdquo;</p>
          <cite className="mt-4 block font-mono text-xs not-italic uppercase tracking-[0.18em] text-gray-500">
            frase del día
          </cite>
        </blockquote>

        <div className="aspect-video w-full">
          <iframe
            title={`playlist de spotify para ${activeArticle.title}`}
            src={activeArticle.spotifyEmbedUrl}
            className="h-full w-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
