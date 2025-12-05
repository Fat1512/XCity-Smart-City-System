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
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { AI_REQUEST } from "../utils/axiosConfig";
import { Upload, Trash2, Loader2, Send, RotateCcw } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
  tokens?: number;
}

interface WatcherStatus {
  local: boolean;
  rss: boolean;
}

type WatcherName = "local" | "rss";
type ActiveTab = "manage" | "chat";

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const [chatInput, setChatInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("manage");

  const [watcherStatus, setWatcherStatus] = useState<WatcherStatus | null>(
    null
  );
  const [watcherError, setWatcherError] = useState<string>("");

  useEffect(() => {
    fetchDocuments();
    fetchWatcherStatus();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await AI_REQUEST.get<{ documents: string[] }>(
        `/rag/documents`
      );
      setDocuments(response.data.documents || []);
    } catch {
      console.error("Lỗi khi tải danh sách tài liệu");
    }
  };

  const fetchWatcherStatus = async () => {
    try {
      const response = await AI_REQUEST.get<{ watchers: WatcherStatus }>(
        `/watcher/status`
      );
      setWatcherStatus(response.data.watchers);
      setWatcherError("");
    } catch {
      setWatcherError("Không thể tải trạng thái watcher.");
    }
  };

  const handleToggleWatcher = async (
    watcher: WatcherName,
    enabled: boolean
  ) => {
    try {
      setWatcherError("");
      setWatcherStatus((prev) =>
        prev ? { ...prev, [watcher]: enabled } : null
      );

      await AI_REQUEST.post(`/watcher/toggle`, { watcher, enabled });
      await fetchWatcherStatus();
    } catch {
      setWatcherError(`Không thể thay đổi trạng thái ${watcher}.`);
      await fetchWatcherStatus();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus("Vui lòng chọn một file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploadStatus(`Đang tải lên ${file.name}...`);

    try {
      const response = await AI_REQUEST.post(`/rag/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadStatus(`Tải lên thành công: ${response.data.filename}`);
      setFile(null);
      fetchDocuments();
    } catch {
      setUploadStatus("Tải lên thất bại.");
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${filename}?`)) return;

    try {
      await AI_REQUEST.delete(`/rag/document`, { data: { filename } });
      fetchDocuments();
    } catch {
      console.error("Lỗi khi xóa file");
    }
  };

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: Message = { sender: "user", text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    setIsLoading(true);

    const payload: any = { query: userMsg.text };
    if (conversationId) payload.conversation_id = conversationId;

    try {
      const response = await AI_REQUEST.post(`/rag/chat`, payload);
      const { answer, token_usage, conversation_id } = response.data;

      if (conversation_id) setConversationId(conversation_id);

      const botMsg: Message = {
        sender: "bot",
        text: answer,
        tokens: token_usage?.total_tokens || 0,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Đã xảy ra lỗi." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <div className="w-full py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-10 text-blue-700 tracking-tight">
        🤖 Document Assistant Dashboard
      </h1>

      <div className="flex justify-center mb-10">
        <div className="flex bg-gray-100 rounded-2xl p-1 shadow-inner">
          {(
            [
              { key: "manage", label: "📁 Quản lý Tệp" },
              { key: "chat", label: "💬 Thử Chat" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all
              ${
                activeTab === tab.key
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "manage" && (
        <div className="space-y-10">
          <div className="p-6 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">📤 Tải lên tài liệu</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="file"
                accept=".pdf,.docx,.md,.txt"
                onChange={handleFileChange}
                className="block w-full border border-gray-300 rounded-xl p-3 cursor-pointer hover:border-blue-500 transition"
              />

              <button
                type="submit"
                disabled={!file}
                className="px-5 py-2 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl disabled:opacity-50 flex items-center gap-2 shadow hover:shadow-lg transition"
              >
                <Upload size={18} />
                Tải lên
              </button>

              {uploadStatus && (
                <p className="text-sm text-gray-600 italic">{uploadStatus}</p>
              )}
            </form>
          </div>

          <div className="p-6 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              📚 Tài liệu đã tải lên
            </h2>

            {documents.length === 0 ? (
              <p className="text-gray-500">Chưa có tài liệu nào.</p>
            ) : (
              <ul className="space-y-3">
                {documents.map((doc) => (
                  <li
                    key={doc}
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-xl transition border"
                  >
                    <span className="font-medium">{doc}</span>

                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Watcher */}
          <div className="p-6 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">👀 Watcher</h2>

            {watcherError && (
              <p className="text-red-600 font-medium">{watcherError}</p>
            )}

            {!watcherStatus ? (
              <p className="text-gray-500 flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Đang tải...
              </p>
            ) : (
              <div className="space-y-4">
                {(["local", "rss"] as WatcherName[]).map((w) => (
                  <div
                    key={w}
                    className="flex justify-between items-center px-4 py-3 bg-gray-50 border rounded-xl"
                  >
                    <span className="font-medium">
                      {w === "local" ? "📁 Watcher Thư mục" : "📡 Watcher RSS"}
                    </span>

                    <button
                      onClick={() => handleToggleWatcher(w, !watcherStatus[w])}
                      className={`relative w-14 h-8 rounded-full transition ${
                        watcherStatus[w] ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 h-6 w-6 bg-white rounded-full shadow transition-all ${
                          watcherStatus[w] ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="p-6 bg-white/70 backdrop-blur-xl border rounded-2xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">💬 Chat với tài liệu</h2>

            <button
              onClick={startNewChat}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2"
            >
              <RotateCcw size={16} /> Chat mới
            </button>
          </div>

          {/* Chat Window */}
          <div className="h-[420px] overflow-y-auto border rounded-2xl p-4 space-y-4 bg-linear-to-br from-gray-50 to-gray-100">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[75%] animate-fadeIn ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white ml-auto shadow-md"
                    : "bg-white shadow border"
                }`}
              >
                <p>{msg.text}</p>
                {msg.tokens !== undefined && (
                  <p className="text-xs opacity-60 mt-1">{msg.tokens} tokens</p>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="text-gray-600 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Bot đang trả lời...
              </div>
            )}
          </div>

          <form
            onSubmit={handleChatSubmit}
            className="mt-4 flex items-center gap-3"
          >
            <input
              className="flex-1 border rounded-xl p-3 bg-white shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
            />

            <button
              className="px-5 py-2 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow hover:shadow-lg transition flex items-center gap-2"
              disabled={isLoading}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
