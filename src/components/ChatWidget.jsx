"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5002");

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Привет! Я бот. Задай вопрос по доставке, оплате и т.д." },
  ]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    socket.on("botReply", (msg) => {
      setMessages((prev) => [...prev, { from: "bot", text: msg }]);
    });

    return () => {
      socket.off("botReply");
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chatMessage", input);
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
  };

  return (
    <>
      {/* Кнопка 💬 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 bg-[#d87b4a] text-white p-3 rounded-full shadow-lg z-50 hover:bg-[#a04922] transition"
        title={open ? "Скрыть чат" : "Открыть чат"}
      >
        💬
      </button>

      {/* Окно чата */}
      {open && (
        <div className="fixed bottom-24 right-4 bg-[#fffaf6] border border-[#f5d0aa] shadow-xl rounded-xl w-80 max-w-xs p-4 z-50">
          <h2 className="font-bold text-lg mb-2 text-[#5a3e2b]">Чат с ботом 🤖</h2>

          <div className="h-52 overflow-y-auto border border-[#f5d0aa] rounded bg-[#fdf4eb] p-2 mb-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm mb-1 ${
                  m.from === "user"
                    ? "text-right text-[#d87b4a]"
                    : "text-left text-[#5a3e2b]"
                }`}
              >
                <span className="inline-block bg-white border border-[#f5d0aa] rounded px-2 py-1 shadow-sm max-w-[80%]">
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="flex-grow border border-[#f5d0aa] rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#d87b4a]"
              placeholder="Напиши сообщение..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-[#d87b4a] hover:bg-[#a04922] text-white px-3 py-1 rounded text-sm transition"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
