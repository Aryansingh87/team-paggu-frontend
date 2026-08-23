import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ChatWidget from "../components/ChatWidget.jsx";
import api from "../lib/api.js";

// Column order matters — it's what paste-from-Excel maps into, left to right.
const COLUMNS = ["day", "lift", "sets", "reps", "weight", "rpe", "notes"];
const COLUMN_LABELS = { day: "Day", lift: "Exercise", sets: "Sets", reps: "Reps", weight: "Weight", rpe: "RPE", notes: "Notes" };

const emptyRow = () => ({ day: "", lift: "", sets: "", reps: "", weight: "", rpe: "", notes: "" });
const emptyGrid = (n = 6) => Array.from({ length: n }, emptyRow);

export default function CoachDashboard() {
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [queue, setQueue] = useState([]);

  // Program assignment grid
  const [weekLabel, setWeekLabel] = useState("");
  const [rows, setRows] = useState(emptyGrid());
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

  const updateCell = (rowIdx, field, value) => {
    setRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (i) => setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  const clearGrid = () => setRows(emptyGrid());

  // Paste-from-Excel / Google Sheets support. When you copy a block of cells
  // and paste into any input in the grid, this spreads the pasted values
  // across rows/columns starting from wherever you pasted, growing the grid
  // if needed — same behavior as pasting into an actual spreadsheet.
  const handlePaste = (e, rowIdx, colIdx) => {
    const text = e.clipboardData.getData("text");
    if (!text.includes("\t") && !text.includes("\n")) return; // single value — let normal paste happen

    e.preventDefault();
    const lines = text.replace(/\r/g, "").split("\n").filter((line, i, arr) => !(i === arr.length - 1 && line === ""));

    setRows((prev) => {
      const next = prev.map((r) => ({ ...r }));
      lines.forEach((line, li) => {
        const cells = line.split("\t");
        const targetRow = rowIdx + li;
        while (next.length <= targetRow) next.push(emptyRow());
        cells.forEach((cellVal, ci) => {
          const targetCol = colIdx + ci;
          if (targetCol < COLUMNS.length) {
            next[targetRow][COLUMNS[targetCol]] = cellVal.trim();
          }
        });
      });
      return next;
    });
  };

  const handleAssign = async () => {
    const validRows = rows.filter((r) => r.lift.trim());
    if (!activeClient || !weekLabel || validRows.length === 0) {
      setAssignMsg("Fill in the week label and at least one row with an exercise name.");
      return;
    }
    setAssigning(true);
    setAssignMsg("");
    try {
      await api.post("/programs", {
        clientId: activeClient._id,
        weekLabel,
        rows: validRows,
      });
      setAssignMsg(`Assigned to ${activeClient.name}.`);
      setWeekLabel("");
      clearGrid();
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
      // could surface a toast here later
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

        .dash-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; align-items: start; }
        .side-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; margin-top: 24px; }
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

        .grid-toolbar { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
        .grid-toolbar .field { margin: 0; min-width: 220px; }
        .grid-actions { display: flex; gap: 8px; }

        .sheet-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 4px; margin-bottom: 16px; }
        .sheet { border-collapse: collapse; width: 100%; min-width: 720px; }
        .sheet th {
          background: var(--panel-2); color: var(--chalk-dim);
          font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
          text-align: left; padding: 10px 8px; border: 1px solid var(--line); white-space: nowrap;
        }
        .sheet td { border: 1px solid var(--line); padding: 0; }
        .sheet td input {
          width: 100%; box-sizing: border-box; background: transparent; border: none; color: var(--chalk);
          font-size: 13px; padding: 9px 8px; outline: none; font-family: 'Inter', sans-serif;
        }
        .sheet td input:focus { background: var(--panel-2); box-shadow: inset 0 0 0 1.5px var(--blood); }
        .sheet .col-day input, .sheet .col-sets input, .sheet .col-reps input, .sheet .col-weight input, .sheet .col-rpe input { text-align: center; }
        .sheet .row-remove { width: 34px; text-align: center; }
        .sheet .row-remove button {
          background: none; border: none; color: var(--steel); cursor: pointer; font-size: 14px; padding: 4px;
        }
        .sheet .row-remove button:hover { color: var(--blood-bright); }
        .sheet-hint { font-size: 12px; color: var(--chalk-dim); margin: -8px 0 16px; }
        .assign-msg { font-size: 13px; color: var(--blood-bright); margin: 10px 0; }

        @media (max-width: 1100px) { .dash-grid { grid-template-columns: 1fr; } .side-grid { grid-template-columns: 1fr; } }
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
          {/* PROGRAM ASSIGNMENT — SPREADSHEET */}
          <div className="card">
            <h2>Assign Program{activeClient ? ` — ${activeClient.name}` : ""}</h2>
            {!activeClient && <div className="empty-state">Pick a client from the roster to the right first.</div>}
            {activeClient && (
              <>
                <div className="grid-toolbar">
                  <div className="field">
                    <label>Week Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Week of Aug 18"
                      value={weekLabel}
                      onChange={(e) => setWeekLabel(e.target.value)}
                    />
                  </div>
                  <div className="grid-actions">
                    <button className="btn btn-ghost btn-sm" type="button" onClick={addRow}>+ Add Row</button>
                    <button className="btn btn-ghost btn-sm" type="button" onClick={clearGrid}>Clear Grid</button>
                  </div>
                </div>

                <div className="sheet-hint">
                  Tip: you can copy a block of cells straight from Excel or Google Sheets and paste it into any cell here — it'll fill across rows and columns automatically.
                </div>

                <div className="sheet-wrap">
                  <table className="sheet">
                    <thead>
                      <tr>
                        {COLUMNS.map((col) => (
                          <th key={col} className={`col-${col}`}>{COLUMN_LABELS[col]}</th>
                        ))}
                        <th className="row-remove"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {COLUMNS.map((col, colIdx) => (
                            <td key={col} className={`col-${col}`}>
                              <input
                                value={row[col]}
                                onChange={(e) => updateCell(rowIdx, col, e.target.value)}
                                onPaste={(e) => handlePaste(e, rowIdx, colIdx)}
                                placeholder={col === "day" ? "Day 1" : col === "lift" ? "Squat" : ""}
                              />
                            </td>
                          ))}
                          <td className="row-remove">
                            <button type="button" onClick={() => removeRow(rowIdx)} disabled={rows.length === 1}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {assignMsg && <div className="assign-msg">{assignMsg}</div>}
                <button className="btn btn-primary btn-block" onClick={handleAssign} disabled={assigning}>
                  {assigning ? "Assigning…" : `Assign to ${activeClient.name}`}
                </button>
              </>
            )}
          </div>

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
        </div>

        <div className="side-grid">
          {/* REVIEW QUEUE */}
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