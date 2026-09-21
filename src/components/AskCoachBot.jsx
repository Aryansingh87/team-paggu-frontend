import React, { useState } from "react";
import api from "../lib/api.js";

/**
 * AskCoachBot — a RAG-grounded Q&A assistant for general powerlifting
 * questions. Separate from the real ChatWidget on purpose: this is an AI
 * assistant, not your actual coach, and it says so clearly in the UI.
 */
export default function AskCoachBot() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]); // [{question, answer, sources}]
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setError("");
    const askedQuestion = question.trim();
    setQuestion("");

    try {
      const { data } = await api.post("/ai/ask", { question: askedQuestion });
      setHistory((prev) => [...prev, { question: askedQuestion, answer: data.answer, sources: data.sources }]);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't get an answer right now. Try again.");
    } finally {
      setAsking(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="ask-bot">
      <style>{`
        .ask-bot { display: flex; flex-direction: column; height: 100%; }
        .ask-bot-disclaimer {
          font-size: 11px; color: var(--chalk-dim); padding: 0 26px 14px;
          border-bottom: 1px solid var(--line);
        }
        .ask-bot-body { flex: 1; overflow-y: auto; padding: 18px 26px; display: flex; flex-direction: column; gap: 18px; }
        .ask-bot-empty { color: var(--chalk-dim); font-size: 13px; text-align: center; margin-top: 20px; }
        .ask-bot-turn { display: flex; flex-direction: column; gap: 8px; }
        .ask-bot-question { font-weight: 600; font-size: 14px; }
        .ask-bot-answer { background: var(--panel-2); border-radius: 8px; padding: 12px 14px; font-size: 14px; line-height: 1.6; color: var(--chalk); }
        .ask-bot-sources { display: flex; flex-wrap: wrap; gap: 6px; }
        .ask-bot-source-tag {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.05em;
          background: var(--iron); border: 1px solid var(--line); color: var(--chalk-dim);
          padding: 3px 8px; border-radius: 20px;
        }
        .ask-bot-error { color: var(--blood-bright); font-size: 13px; }
        .ask-bot-input-row { display: flex; gap: 10px; padding: 14px 26px; border-top: 1px solid var(--line); }
        .ask-bot-input-row input {
          flex: 1; background: var(--iron); border: 1px solid var(--line);
          color: var(--chalk); border-radius: 4px; padding: 10px 14px; font-size: 14px; outline: none;
        }
        .ask-bot-input-row input:focus { border-color: var(--blood); }
        .ask-bot-input-row button {
          background: var(--blood); color: var(--chalk); border: none;
          border-radius: 4px; padding: 0 18px; font-weight: 600; cursor: pointer;
        }
        .ask-bot-input-row button:hover { background: var(--blood-bright); }
        .ask-bot-input-row button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="ask-bot-disclaimer">
        AI assistant grounded in real coaching material — not a replacement for your actual coach.
        For injuries or anything urgent, message your coach directly.
      </div>

      <div className="ask-bot-body">
        {history.length === 0 && (
          <div className="ask-bot-empty">
            Ask about technique, RPE, programming basics, recovery — anything general.
          </div>
        )}
        {history.map((turn, i) => (
          <div className="ask-bot-turn" key={i}>
            <div className="ask-bot-question">{turn.question}</div>
            <div className="ask-bot-answer">{turn.answer}</div>
            {turn.sources?.length > 0 && (
              <div className="ask-bot-sources">
                {turn.sources.map((s) => (
                  <span className="ask-bot-source-tag mono" key={s}>{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {error && <div className="ask-bot-error">{error}</div>}
      </div>

      <div className="ask-bot-input-row">
        <input
          placeholder="e.g. How deep does a squat need to be?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKey}
          disabled={asking}
        />
        <button onClick={handleAsk} disabled={asking || !question.trim()}>
          {asking ? "Asking…" : "Ask"}
        </button>
      </div>
    </div>
  );
}