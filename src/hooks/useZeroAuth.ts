"use client";

import { useEffect, useState } from "react";

interface ZeroAuthState {
  uuid: string | null;
  handle: string | null;
  isReady: boolean;
  saveHandle: (nextHandle: string) => void;
}

function createUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useZeroAuth(): ZeroAuthState {
  const [uuid, setUuid] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedUuid = window.localStorage.getItem("brutal_uuid");
      const storedHandle = window.localStorage.getItem("brutal_handle");
      const nextUuid = storedUuid ?? createUuid();

      if (!storedUuid) {
        window.localStorage.setItem("brutal_uuid", nextUuid);
      }

      setUuid(nextUuid);
      setHandle(storedHandle);
      setIsReady(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  function saveHandle(nextHandle: string) {
    const normalizedHandle = nextHandle.trim().slice(0, 32);

    if (!normalizedHandle) {
      return;
    }

    window.localStorage.setItem("brutal_handle", normalizedHandle);
    setHandle(normalizedHandle);
  }

  return { uuid, handle, isReady, saveHandle };
}
