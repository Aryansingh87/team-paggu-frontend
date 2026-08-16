import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ChatWidget from "../components/ChatWidget.jsx";
import api from "../lib/api.js";

const emptyExercise = { lift: "", sets: "", note: "" };

export default function CoachDashboard() {
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [queue, setQueue] = useState([]);

  // Program assignment form
  const [weekLabel, setWeekLabel] = useState("");
  const [exercises, setExercises] = useState([{ ...emptyExercise }]);
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState("");

  const loadClients = () => {
    api
      .get("/users/clients")
      .then(({ data }) => {
        setClients(data.clients);
        if (data.clients.length && !activeClient) setActiveClient(data.clients[0]);
      })
      .catch(() => setClients([]));
  };

  const loadQueue = () => {
    api
      .get("/videos/queue")
      .then(({ data }) => setQueue(data.videos))
      .catch(() => setQueue([]));
  };

  useEffect(() => {
    loadClients();
    loadQueue();
  }, []);

  const updateExercise = (i, key, value) => {
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, [key]: value } : ex)));
  };

  const addExerciseRow = () => setExercises((prev) => [...prev, { ...emptyExercise }]);
  const removeExerciseRow = (i) => setExercises((prev) => prev.filter((_, idx) => idx !== i));

  const handleAssign = async () => {
    if (!activeClient || !weekLabel || exercises.some((ex) => !ex.lift || !ex.sets)) {
      setAssignMsg("Fill in the week label and every lift + sets field.");
      return;
    }
    setAssigning(true);
    setAssignMsg("");
    try {
      await api.post("/programs", {
        clientId: activeClient._id,
        weekLabel,
        exercises,
      });
      setAssignMsg(`Assigned to ${activeClient.name}.`);
      setWeekLabel("");
      setExercises([{ ...emptyExercise }]);
    } catch (err) {
      setAssignMsg(err.response?.data?.message || "Couldn't assign program.");
    } finally {
      setAssigning(false);
    }
  };

  const markReviewed = async (videoId) => {
    try {
      await api.patch(`/videos/${videoId}/review`, {});
      loadQueue();
    } catch {
      // silently ignore for now — could surface a toast here
    }
  };

  const pendingCount = queue.length;

  return (
    <div className="pf-root">
      <style>{`
        .dash-shell { padding: 40px 0 90px; }
        .dash-head { margin-bottom: 36px; }
        .dash-head h1 { font-size: clamp(28px, 4vw, 38px); margin: 0; }
        .dash-head p { color: var(--chalk-dim); margin: 6px 0 0; font-size: 14px; }

        .coach-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 30px; }
        .coach-stat { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 18px 20px; }
        .coach-stat .num { font-family: 'JetBrains Mono', monospace; font-size: 26px; color: var(--blood-bright); font-weight: 700; }
        .coach-stat .label { font-size: 11px; color: var(--chalk-dim); letter-spacing: 0.1em; margin-top: 4px; }

        .dash-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; align-items: start; }
        .card { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 26px; }
        .card h2 { font-family: 'Anton', sans-serif; text-transform: uppercase; font-size: 17px; margin: 0 0 18px; letter-spacing: 0.02em; }
        .empty-state { color: var(--chalk-dim); font-size: 14px; }

        .roster-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 10px; border-radius: 4px; cursor: pointer;
          border: 1px solid transparent;
        }
        .roster-row:hover { border-color: var(--line); }
        .roster-row.active { background: var(--panel-2); border-color: var(--blood); }
        .roster-name { font-weight: 600; font-size: 14px; }
        .roster-meta { font-size: 11px; color: var(--chalk-dim); margin-top: 2px; }
        .plan-chip { font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 3px 8px; border-radius: 20px; background: var(--panel-2); color: var(--chalk-dim); }

        .queue-row { padding: 12px 0; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 4px; }
        .queue-row:first-of-type { border-top: none; }
        .queue-top { display: flex; justify-content: space-between; font-size: 13px; }
        .queue-athlete { font-weight: 600; }
        .queue-meta { font-size: 11px; color: var(--chalk-dim); font-family: 'JetBrains Mono', monospace; }
        .queue-actions { display: flex; gap: 8px; margin-top: 6px; }

        .exercise-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; margin-bottom: 10px; align-items: center; }
        .exercise-row input { background: var(--iron); border: 1px solid var(--line); color: var(--chalk); border-radius: 3px; padding: 8px 10px; font-size: 13px; }
        .exercise-row button { background: transparent; border: 1px solid var(--line); color: var(--chalk-dim); border-radius: 3px; padding: 8px 10px; cursor: pointer; font-size: 12px; }
        .assign-msg { font-size: 13px; color: var(--blood-bright); margin: 10px 0; }

        @media (max-width: 1100px) { .dash-grid { grid-template-columns: 1fr; } }
      `}</style>

      <Navbar />

      <div className="wrap dash-shell">
        <div className="dash-head">
          <span className="eyebrow">Coach Dashboard</span>
          <h1 className="display">Your team, loaded in.</h1>
          <p>{clients.length} lifters on your roster — {pendingCount} video{pendingCount === 1 ? "" : "s"} waiting on review.</p>
        </div>

        <div className="coach-stats">
          <div className="coach-stat">
            <div className="num mono">{clients.length}</div>
            <div className="label">TOTAL LIFTERS</div>
          </div>
          <div className="coach-stat">
            <div className="num mono">{pendingCount}</div>
            <div className="label">VIDEOS PENDING REVIEW</div>
          </div>
        </div>

        <div className="dash-grid">
          {/* ROSTER */}
          <div className="card">
            <h2>Client Roster</h2>
            {clients.length === 0 && <div className="empty-state">No clients signed up yet.</div>}
            {clients.map((c) => (
              <div
                key={c._id}
                className={`roster-row ${activeClient?._id === c._id ? "active" : ""}`}
                onClick={() => setActiveClient(c)}
              >
                <div>
                  <div className="roster-name">{c.name}</div>
                  <div className="roster-meta">{c.email}</div>
                </div>
                <span className="plan-chip mono">{c.membership?.plan || "NO PLAN"}</span>
              </div>
            ))}
          </div>

          {/* PROGRAM ASSIGNMENT + REVIEW QUEUE */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="card">
              <h2>Assign Program{activeClient ? ` — ${activeClient.name}` : ""}</h2>
              {!activeClient && <div className="empty-state">Pick a client from the roster first.</div>}
              {activeClient && (
                <>
                  <div className="field">
                    <label>Week Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Week of Aug 11"
                      value={weekLabel}
                      onChange={(e) => setWeekLabel(e.target.value)}
                    />
                  </div>
                  {exercises.map((ex, i) => (
                    <div className="exercise-row" key={i}>
                      <input
                        placeholder="Lift (e.g. Squat)"
                        value={ex.lift}
                        onChange={(e) => updateExercise(i, "lift", e.target.value)}
                      />
                      <input
                        placeholder="Sets (e.g. 5x3 @ 82%)"
                        value={ex.sets}
                        onChange={(e) => updateExercise(i, "sets", e.target.value)}
                      />
                      <button type="button" onClick={() => removeExerciseRow(i)} disabled={exercises.length === 1}>✕</button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" type="button" onClick={addExerciseRow} style={{ marginBottom: 14 }}>
                    + Add Exercise
                  </button>
                  {assignMsg && <div className="assign-msg">{assignMsg}</div>}
                  <button className="btn btn-primary btn-block" onClick={handleAssign} disabled={assigning}>
                    {assigning ? "Assigning…" : `Assign to ${activeClient.name}`}
                  </button>
                </>
              )}
            </div>

            <div className="card">
              <h2>Video Review Queue</h2>
              {queue.length === 0 && <div className="empty-state">Nothing pending — all caught up.</div>}
              {queue.map((v) => (
                <div className="queue-row" key={v._id}>
                  <div className="queue-top">
                    <span className="queue-athlete">{v.client?.name}</span>
                    <span className="queue-meta">{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="queue-meta">{v.lift} — {v.weight}</div>
                  <div className="queue-actions">
                    <a className="btn btn-ghost btn-sm" href={v.videoUrl} target="_blank" rel="noreferrer">Watch</a>
                    <button className="btn btn-primary btn-sm" onClick={() => markReviewed(v._id)}>Mark Reviewed</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "26px 26px 0" }}>
              <h2>Chat{activeClient ? ` — ${activeClient.name}` : ""}</h2>
            </div>
            <ChatWidget otherUserId={activeClient?._id} otherUserName={activeClient?.name || "Select a client"} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
