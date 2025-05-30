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
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-blue-700 transition"
        title={open ? "Скрыть чат" : "Открыть чат"}
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 bg-white shadow-xl rounded-lg w-80 p-4 z-50 border border-gray-300">
          <h2 className="font-bold text-lg mb-2">Чат с ботом 🤖</h2>
          <div className="h-48 overflow-y-auto border p-2 mb-2 rounded bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm mb-1 ${
                  m.from === "user" ? "text-right text-blue-600" : "text-left text-gray-800"
                }`}
              >
                <span className="inline-block">{m.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="border rounded p-1 flex-grow text-sm"
              placeholder="Напиши сообщение..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
