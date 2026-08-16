import React, { useEffect, useRef, useState } from "react";
import api from "../lib/api.js";
import { getSocket } from "../lib/socket.js";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * ChatWidget — real-time 1:1 chat over Socket.io, with REST-loaded history.
 *
 * Props:
 *  - otherUserId: the _id of the person being chatted with (required to send/receive)
 *  - otherUserName: display name shown in the header
 */
export default function ChatWidget({ otherUserId, otherUserName = "Chat" }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Load history whenever we switch conversations
  useEffect(() => {
    if (!otherUserId) return;
    setLoading(true);
    api
      .get(`/messages/${otherUserId}`)
      .then(({ data }) => setMessages(data.messages))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [otherUserId]);

  // Set up the live socket listener once
  useEffect(() => {
    const socket = getSocket();

    const handleIncoming = (message) => {
      const involvesThisConversation =
        (message.from === otherUserId || message.from?._id === otherUserId) ||
        (message.to === otherUserId || message.to?._id === otherUserId);
      if (involvesThisConversation) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleIncoming);
    return () => socket.off("receive_message", handleIncoming);
  }, [otherUserId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!draft.trim() || !otherUserId) return;
    const socket = getSocket();
    socket.emit("send_message", { to: otherUserId, text: draft.trim() });
    setDraft("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="chat-widget">
      <style>{`
        .chat-widget {
          display: flex; flex-direction: column;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 6px;
          height: 460px;
          overflow: hidden;
        }
        .chat-header {
          padding: 16px 18px;
          border-bottom: 1px solid var(--line);
          display: flex; align-items: center; gap: 10px;
          font-weight: 600; font-size: 14px;
        }
        .chat-dot { width: 8px; height: 8px; border-radius: 50%; background: #4caf50; }
        .chat-body { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
        .chat-empty { color: var(--chalk-dim); font-size: 13px; text-align: center; margin-top: 30px; }
        .chat-msg { max-width: 78%; padding: 10px 14px; border-radius: 10px; font-size: 14px; line-height: 1.5; }
        .chat-msg.them { background: var(--panel-2); align-self: flex-start; border-bottom-left-radius: 2px; }
        .chat-msg.me { background: var(--blood); color: var(--chalk); align-self: flex-end; border-bottom-right-radius: 2px; }
        .chat-time { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--chalk-dim); margin-top: 4px; display: block; }
        .chat-msg.me .chat-time { color: rgba(237,234,228,0.75); }
        .chat-input-row {
          display: flex; gap: 10px; padding: 14px;
          border-top: 1px solid var(--line);
        }
        .chat-input-row input {
          flex: 1; background: var(--iron); border: 1px solid var(--line);
          color: var(--chalk); border-radius: 4px; padding: 10px 14px; font-size: 14px; outline: none;
        }
        .chat-input-row input:focus { border-color: var(--blood); }
        .chat-input-row button {
          background: var(--blood); color: var(--chalk); border: none;
          border-radius: 4px; padding: 0 18px; font-weight: 600; cursor: pointer;
        }
        .chat-input-row button:hover { background: var(--blood-bright); }
        .chat-input-row button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
      <div className="chat-header">
        <span className="chat-dot" /> {otherUserName}
      </div>
      <div className="chat-body" ref={scrollRef}>
        {loading && <div className="chat-empty">Loading conversation…</div>}
        {!loading && messages.length === 0 && (
          <div className="chat-empty">No messages yet — say hello.</div>
        )}
        {messages.map((m) => {
          const fromId = typeof m.from === "object" ? m.from._id : m.from;
          const isMe = fromId === user?._id;
          return (
            <div key={m._id || m.createdAt} className={`chat-msg ${isMe ? "me" : "them"}`}>
              {m.text}
              <span className="chat-time">{formatTime(m.createdAt)}</span>
            </div>
          );
        })}
      </div>
      <div className="chat-input-row">
        <input
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          disabled={!otherUserId}
        />
        <button onClick={sendMessage} disabled={!otherUserId}>Send</button>
      </div>
    </div>
  );
}
