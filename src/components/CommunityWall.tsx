"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { useZeroAuth } from "@/hooks/useZeroAuth";

interface Message {
  id: string;
  handle: string;
  timestamp: string;
  texto: string;
}

const initialMessages: Message[] = [
  {
    id: "msg-001",
    handle: "nómada",
    timestamp: "09:16",
    texto: "la concentración también necesita un lugar.",
  },
  {
    id: "msg-002",
    handle: "grano_frío",
    timestamp: "10:42",
    texto: "dieciséis horas cambian la conversación del café.",
  },
  {
    id: "msg-003",
    handle: "modo_avión",
    timestamp: "11:08",
    texto: "menos pestañas. más señal.",
  },
];

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function CommunityWall() {
  const { handle, isReady, saveHandle } = useZeroAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [handleInput, setHandleInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const previousMessageCount = useRef(messages.length);

  useEffect(() => {
    if (messages.length > previousMessageCount.current) {
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      });
    }

    previousMessageCount.current = messages.length;
  }, [messages.length]);

  function submitHandle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveHandle(handleInput);
    setHandleInput("");
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const texto = messageInput.trim();

    if (!texto || !handle) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: createMessageId(),
        handle,
        timestamp: new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        texto,
      },
    ]);
    setMessageInput("");
  }

  if (!isReady) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 pb-40 text-white sm:px-10">
      {!handle ? (
        <form
          onSubmit={submitHandle}
          className="border-y border-white/15 py-8"
        >
          <label
            htmlFor="community-handle"
            className="mb-4 block font-mono text-sm text-gray-300"
          >
            ingresa tu seudónimo
          </label>
          <div className="flex">
            <input
              id="community-handle"
              type="text"
              value={handleInput}
              onChange={(event) => setHandleInput(event.target.value)}
              maxLength={32}
              autoComplete="nickname"
              className="min-w-0 flex-1 border border-white/25 bg-black px-3 py-3 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-white"
              placeholder="tu_handle"
              required
            />
            <button
              type="submit"
              className="border-y border-r border-white/25 px-4 font-mono text-white hover:bg-white hover:text-black"
            >
              &gt;
            </button>
          </div>
        </form>
      ) : (
        <>
          <header className="mb-8 border-y border-white/15 py-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-gray-500">
              muro&gt;comunitario
            </p>
            <p className="mt-2 font-mono text-sm text-gray-300">
              conectado como @{handle}
            </p>
          </header>

          <div className="space-y-5 font-mono text-sm leading-relaxed text-gray-300">
            {messages.map((message) => (
              <p key={message.id}>
                <span className="text-white">
                  [{message.handle}] -&gt;
                </span>{" "}
                {message.texto}{" "}
                <time className="text-xs text-gray-600">{message.timestamp}</time>
              </p>
            ))}
          </div>

          <form
            onSubmit={submitMessage}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-white/20 bg-black px-6 py-4 sm:px-10"
          >
            <div className="mx-auto flex w-full max-w-3xl">
              <label htmlFor="community-message" className="sr-only">
                escribe un mensaje
              </label>
              <input
                id="community-message"
                type="text"
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                maxLength={280}
                autoComplete="off"
                className="min-w-0 flex-1 border border-white/25 bg-black px-3 py-3 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-white"
                placeholder="escribe un mensaje..."
              />
              <button
                type="submit"
                aria-label="enviar mensaje"
                className="border-y border-r border-white/25 px-4 font-mono text-white hover:bg-white hover:text-black"
              >
                &gt;
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
