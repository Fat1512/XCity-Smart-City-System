// -----------------------------------------------------------------------------
// Copyright 2025 Fenwick Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// -----------------------------------------------------------------------------
import React, { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import useChatAI from "./useChatAI";
import type { Message } from "react-hook-form";

export interface MessageChatAI {
  text: string;
  role: "user" | "bot";
  meta?: string;
  toolResult?: any;
  trafficStats?: any;
  trafficImages?: Array<{
    stream_id: string;
    mime_type: string;
    image_base64: string;
  }>;
  conversationId?: string | null;
}

const INITIAL_BOT_MESSAGE: MessageChatAI = {
  text: "Xin chào, tôi có thể:\n- Tính đường (có/không kẹt xe) giữa hai tọa độ.\n- Mô tả tình trạng giao thông hiện tại (và gửi kèm hình).",
  role: "bot",
};
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageChatAI[]>([
    INITIAL_BOT_MESSAGE,
  ]);
  const [input, setInput] = useState("");

  const { isPending, chatWithAI } = useChatAI();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg: MessageChatAI = {
      role: "user",
      text: input,
    };

    setMessages((m) => [...m, userMsg]);
    chatWithAI(
      { query: input, conversationId: conversationId },
      {
        onSuccess: ({
          conversation_id,
          answer,
          traffic_stats,
          traffic_images,
        }) => {
          setConversationId(conversation_id);
          setMessages((prev) => [
            ...prev,
            { role: "bot", text: answer, traffic_stats, traffic_images },
          ]);
          setInput("");
        },
      }
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  console.log(messages);
  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed cursor-pointer bottom-6 right-6 w-16 h-16 bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-rotate-6 z-50 group"
        >
          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <svg
            className="w-8 h-8 text-white drop-shadow-lg"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3C10.5 3 9.2 3.8 8.5 5C7.8 5 7.2 5.2 6.7 5.6C6 6.2 5.5 7 5.3 8C4.5 8.2 3.8 8.7 3.3 9.4C2.5 10.5 2.5 12 3.3 13.1C3.8 13.8 4.5 14.3 5.3 14.5C5.5 15.5 6 16.3 6.7 16.9C7.2 17.3 7.8 17.5 8.5 17.5C9.2 18.7 10.5 19.5 12 19.5C13.5 19.5 14.8 18.7 15.5 17.5C16.2 17.5 16.8 17.3 17.3 16.9C18 16.3 18.5 15.5 18.7 14.5C19.5 14.3 20.2 13.8 20.7 13.1C21.5 12 21.5 10.5 20.7 9.4C20.2 8.7 19.5 8.2 18.7 8C18.5 7 18 6.2 17.3 5.6C16.8 5.2 16.2 5 15.5 5C14.8 3.8 13.5 3 12 3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              className="animate-pulse"
              d="M12 7L12.5 8.5L14 9L12.5 9.5L12 11L11.5 9.5L10 9L11.5 8.5L12 7Z"
              fill="currentColor"
            />
            <path
              className="animate-pulse"
              style={{ animationDelay: "0.3s" }}
              d="M9 11.5L9.3 12.3L10 12.5L9.3 12.7L9 13.5L8.7 12.7L8 12.5L8.7 12.3L9 11.5Z"
              fill="currentColor"
            />
            <path
              className="animate-pulse"
              style={{ animationDelay: "0.6s" }}
              d="M15 11.5L15.3 12.3L16 12.5L15.3 12.7L15 13.5L14.7 12.7L14 12.5L14.7 12.3L15 11.5Z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-120 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between px-5 py-4 bg-linear-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-b border-gray-200 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3C10.5 3 9.2 3.8 8.5 5C7.8 5 7.2 5.2 6.7 5.6C6 6.2 5.5 7 5.3 8C4.5 8.2 3.8 8.7 3.3 9.4C2.5 10.5 2.5 12 3.3 13.1C3.8 13.8 4.5 14.3 5.3 14.5C5.5 15.5 6 16.3 6.7 16.9C7.2 17.3 7.8 17.5 8.5 17.5C9.2 18.7 10.5 19.5 12 19.5C13.5 19.5 14.8 18.7 15.5 17.5C16.2 17.5 16.8 17.3 17.3 16.9C18 16.3 18.5 15.5 18.7 14.5C19.5 14.3 20.2 13.8 20.7 13.1C21.5 12 21.5 10.5 20.7 9.4C20.2 8.7 19.5 8.2 18.7 8C18.5 7 18 6.2 17.3 5.6C16.8 5.2 16.2 5 15.5 5C14.8 3.8 13.5 3 12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 7L12.5 8.5L14 9L12.5 9.5L12 11L11.5 9.5L10 9L11.5 8.5L12 7Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800 bg-linear-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Smart Assistant
                </h2>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:rotate-90 group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
          >
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap shadow-lg transition-all duration-200 hover:scale-[1.02] ${
                    msg.role === "user"
                      ? "ml-auto bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white"
                      : "mr-auto bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.toolResult && (
                  <details className="mt-2 text-xs text-gray-600 ml-2">
                    <summary className="cursor-pointer hover:text-gray-800">
                      Chi tiết route (GeoJSON)
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded border border-gray-200 overflow-x-auto text-[10px] text-gray-700">
                      {JSON.stringify(msg.toolResult, null, 2)}
                    </pre>
                  </details>
                )}

                {msg.trafficStats && (
                  <details className="mt-2 text-xs text-gray-600 ml-2">
                    <summary className="cursor-pointer hover:text-gray-800">
                      Traffic stats
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded border border-gray-200 overflow-x-auto text-[10px] text-gray-700">
                      {JSON.stringify(msg.trafficStats, null, 2)}
                    </pre>
                  </details>
                )}

                {msg.traffic_images && msg.traffic_images.length > 0 && (
                  <div className="mt-2 ml-2">
                    <div className="text-xs text-gray-600 mb-2">
                      Ảnh giao thông hiện tại:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.traffic_images.map((img, imgIdx) => (
                        <img
                          key={imgIdx}
                          src={`data:${img.mime_type};base64,${img.image_base64}`}
                          alt={img.stream_id}
                          className="max-w-[380px] rounded border border-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isPending && (
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div
                  className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            )}
          </div>

          <div className="flex gap-2 p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi...&#10;VD: Tính đường từ 10.77,106.68 tới 10.78,106.70"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              rows={2}
              disabled={isPending}
            />
            <button
              onClick={sendMessage}
              disabled={isPending || !input.trim()}
              className="px-4 cursor-pointer bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
