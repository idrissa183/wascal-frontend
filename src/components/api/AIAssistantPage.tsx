import React, { useState } from "react";
import Base from "../layout/Base";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const updated = [...messages, { role: "user", content: input }];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([...updated, { role: "assistant", content: data.message }]);
      } else {
        console.error("Chat error", await res.text());
      }
    } catch (err) {
      console.error("Chat request failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Base>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-96 overflow-y-auto border rounded-md p-4 bg-white dark:bg-gray-800">
          {messages.map((m, idx) => (
            <p
              key={idx}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              <span className="font-semibold mr-1">
                {m.role === "user" ? "You" : "AI"}:
              </span>
              {m.content}
            </p>
          ))}
          {loading && <p>...</p>}
        </div>
        <div className="flex space-x-2">
          <Input
            className="flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </Base>
  );
}
