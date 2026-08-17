"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { X, Send, MessageSquare, Loader2 } from "lucide-react";

const GREETING =
  "Bonjour ! Je suis Karim, conseiller chez KOST GROUP. Vous cherchez une formation DGR IATA ? Dites-moi votre rôle — expéditeur, agent cargo, pilote — et je trouve exactement ce qu'il vous faut.";

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: "greeting",
    role: "assistant",
    parts: [{ type: "text", text: GREETING }],
    metadata: undefined,
  },
];

const transport = new DefaultChatTransport({ api: "/api/chat" });

function getMessageText(m: UIMessage): string {
  return m.parts.filter(isTextUIPart).map((p) => p.text).join("");
}

export default function KarimChat() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: INITIAL_MESSAGES,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (open) {
      setHasOpened(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInputValue("");
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed right-4 z-50 w-[calc(100vw-2rem)] max-w-sm flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10"
          style={{ bottom: "5rem", height: "min(520px, calc(100vh - 7rem))" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#003D7A] flex-shrink-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#0052A3] flex items-center justify-center text-white font-bold text-sm select-none">
                K
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#003D7A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-none">
                Karim
              </p>
              <p className="text-blue-200 text-xs mt-0.5">
                Conseiller KOST GROUP · En ligne
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-blue-200 hover:text-white transition-colors p-1 rounded"
              aria-label="Fermer le chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#001E3C]">
            {messages.map((m) => {
              const text = getMessageText(m);
              if (!text) return null;
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#0052A3] flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1 select-none">
                      K
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-[#0052A3] text-white rounded-br-sm"
                        : "bg-[#0A2744] text-gray-100 rounded-bl-sm border border-white/5"
                    }`}
                  >
                    {text}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[#0052A3] flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1 select-none">
                  K
                </div>
                <div className="bg-[#0A2744] border border-white/5 px-3 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 bg-[#001E3C] border-t border-white/10 flex-shrink-0"
          >
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Votre message..."
              disabled={isLoading}
              className="flex-1 bg-[#0A2744] text-white placeholder-gray-500 text-sm px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#0052A3] hover:bg-[#0066CC] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Envoyer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={
          open ? "Fermer le chat" : "Parler à Karim, notre conseiller"
        }
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-[#003D7A] hover:bg-[#0052A3] text-white shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            {!hasOpened && (
              <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#001E3C] animate-pulse" />
            )}
          </>
        )}
      </button>
    </>
  );
}
