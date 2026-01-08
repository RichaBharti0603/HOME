import { useState } from "react";
import { sendMessage } from "../services/aiService";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const aiReply = await sendMessage(input);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: aiReply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "AI service unavailable." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>HOME AI Assistant</h2>

      <div style={{ border: "1px solid #ccc", padding: 10, minHeight: 300 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.role === "user" ? "You" : "AI"}:</strong> {m.text}
          </div>
        ))}
        {loading && <p>AI is thinking...</p>}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "100%", marginTop: 10 }}
      />
      <button onClick={handleSend} style={{ marginTop: 10 }}>
        Send
      </button>
    </div>
  );
}
