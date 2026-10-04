"use client";

import { FormEvent, useEffect, useState } from "react";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useZeroAuth } from "@/hooks/useZeroAuth";

interface Message {
  id: string;
  handle: string;
  timestamp: string;
  texto: string;
}

interface MessageRow {
  id: string;
  brutal_uuid: string;
  handle: string;
  texto: string;
  created_at: string;
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    handle: row.handle,
    timestamp: formatTimestamp(row.created_at),
    texto: row.texto,
  };
}

export function CommunityWall() {
  const { uuid, handle, isReady, saveHandle } = useZeroAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [handleInput, setHandleInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabaseClient = supabase;

    if (!isReady || !handle || !uuid || !supabaseClient) {
      return;
    }

    let isActive = true;

    void supabaseClient
      .from("community_messages")
      .select("id, brutal_uuid, handle, texto, created_at")
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data, error: queryError }) => {
        if (!isActive) {
          return;
        }

        if (queryError) {
          setError("no se pudo cargar el muro");
        } else {
          setMessages((data as MessageRow[]).map(mapMessage));
        }
        setIsLoading(false);
      });

    const channel = supabaseClient
      .channel("community-wall")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages" },
        (payload) => {
          const nextMessage = mapMessage(payload.new as MessageRow);
          setMessages((currentMessages) =>
            currentMessages.some((message) => message.id === nextMessage.id)
              ? currentMessages
              : [...currentMessages, nextMessage],
          );
        },
      )
      .subscribe();

    return () => {
      isActive = false;
      void supabaseClient.removeChannel(channel);
    };
  }, [handle, isReady, uuid]);

  function submitHandle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveHandle(handleInput);
    setHandleInput("");
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const texto = messageInput.trim();

    if (!texto || !handle || !uuid || !supabase || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("community_messages")
      .insert({ brutal_uuid: uuid, handle, texto })
      .select("id, brutal_uuid, handle, texto, created_at")
      .single();

    if (insertError || !data) {
      setError("no se pudo enviar el mensaje");
    } else {
      const nextMessage = mapMessage(data as MessageRow);
      setMessages((currentMessages) =>
        currentMessages.some((message) => message.id === nextMessage.id)
          ? currentMessages
          : [...currentMessages, nextMessage],
      );
      setMessageInput("");
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      });
    }

    setIsSending(false);
  }

  if (!isReady) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 pb-40 text-white sm:px-10">
      {!isSupabaseConfigured ? (
        <p className="border-y border-white/15 py-8 font-mono text-sm text-gray-500">
          &gt; configura supabase para activar el muro compartido
        </p>
      ) : !handle ? (
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

          {isLoading && (
            <p className="mb-5 font-mono text-xs text-gray-500">
              &gt; sincronizando muro...
            </p>
          )}
          {error && (
            <p role="alert" className="mb-5 font-mono text-xs text-gray-500">
              &gt; {error}
            </p>
          )}
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
                disabled={isSending}
                className="min-w-0 flex-1 border border-white/25 bg-black px-3 py-3 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-white disabled:opacity-50"
                placeholder="escribe un mensaje..."
              />
              <button
                type="submit"
                aria-label="enviar mensaje"
                disabled={isSending}
                className="border-y border-r border-white/25 px-4 font-mono text-white hover:bg-white hover:text-black disabled:opacity-50"
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
