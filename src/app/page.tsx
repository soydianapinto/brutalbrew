"use client";

import { useCallback, useState } from "react";

import { BootSequence } from "@/components/BootSequence";
import { CommunityWall } from "@/components/CommunityWall";
import { HeaderTimer } from "@/components/HeaderTimer";
import { ImmersionZone } from "@/components/ImmersionZone";
import { OriginBlock } from "@/components/OriginBlock";
import { ReorderFAB } from "@/components/ReorderFAB";

export default function Home() {
  const [isBooting, setIsBooting] = useState(true);
  const finishBoot = useCallback(() => {
    setIsBooting(false);
  }, []);

  return (
    <main className="min-h-screen bg-black font-sans text-white">
      {isBooting && <BootSequence onComplete={finishBoot} />}
      {!isBooting && (
        <>
          <HeaderTimer />
          <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 pb-16 pt-32">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
              brutal cold brew
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-bold lowercase leading-[0.95] tracking-[-0.06em] sm:text-7xl">
              tu dosis.
              <br />
              sin filtros.
            </h1>
            <OriginBlock />
          </section>
          <ImmersionZone />
          <CommunityWall />
          <ReorderFAB />
        </>
      )}
    </main>
  );
}
