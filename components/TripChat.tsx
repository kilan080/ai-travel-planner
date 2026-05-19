"use client";

import { useState, useRef, useEffect } from "react";
import { saveChatMessage, type ChatMessage } from "@/lib/firebase/trip";
import { generateChatResponse } from "@/lib/api-client";

interface TripChatProps {
  tripId: string;
  tripContext: object;
  initialMessages?: ChatMessage[];
}

export default function TripChat({
  tripId,
  tripContext,
  initialMessages = [],
}: TripChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Save user message to Firestore
      await saveChatMessage(tripId, userMessage);

      // Call AI
      const data = await generateChatResponse({
        messages: [...messages, userMessage].map(({ role, content }) => ({
          role,
          content,
        })),
        tripContext,
      });

      if (data.message) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.message,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        await saveChatMessage(tripId, assistantMessage);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Try again.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[500px] rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <h3 className="font-semibold text-sm">Trip Assistant</h3>
        <span className="text-xs text-neutral-500 ml-auto">
          Ask anything about your trip
        </span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300">
                Ask your trip assistant
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                &quot;What should I pack?&quot; · &quot;Best time to
                visit?&quot; · &quot;Any safety tips?&quot;
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-white text-black rounded-br-sm"
                  : "bg-white/10 text-neutral-200 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="px-4 py-3 border-t border-white/10 flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your trip..."
          rows={1}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 resize-none placeholder:text-neutral-500"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-white text-black hover:opacity-90 transition disabled:opacity-30 flex-shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
