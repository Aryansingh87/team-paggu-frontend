import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ChatWidget from "../components/ChatWidget.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [program, setProgram] = useState(null);
  const [programLoading, setProgramLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [coach, setCoach] = useState(null);

  // Upload form state
  const [file, setFile] = useState(null);
  const [lift, setLift] = useState("SQUAT");
  const [weight, setWeight] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const loadProgram = () => {
    setProgramLoading(true);
    api
      .get("/programs/me")
      .then(({ data }) => setProgram(data.program))
      .catch(() => setProgram(null))
      .finally(() => setProgramLoading(false));
  };

  const loadVideos = () => {
    api
      .get("/videos/me")
      .then(({ data }) => setVideos(data.videos))
      .catch(() => setVideos([]));
  };

  useEffect(() => {
    loadProgram();
    loadVideos();
    api
      .get("/users/coach")
      .then(({ data }) => setCoach(data.coach))
      .catch(() => setCoach(null));
  }, []);

  const handleFileSelect = (e) => {
    setFile(e.target.files?.[0] || null);
    setUploadError("");
  };

  const handleUpload = async () => {
    if (!file || !weight) {
      setUploadError("Pick a video and enter the weight lifted.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("lift", lift);
      formData.append("weight", weight);
      await api.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setWeight("");
      loadVideos();
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const membership = user?.membership;

  return (
    <div className="pf-root">
      <style>{`
        .dash-shell { padding: 40px 0 90px; }
        .dash-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 36px; flex-wrap: wrap; gap: 16px; }
        .dash-head h1 { font-size: clamp(28px, 4vw, 38px); margin: 0; }
        .dash-head p { color: var(--chalk-dim); margin: 6px 0 0; font-size: 14px; }
        .membership-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--panel); border: 1px solid var(--blood); border-radius: 30px;
          padding: 8px 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px;
        }
        .membership-pill.inactive { border-color: var(--steel); }
        .membership-pill .dot { width: 7px; height: 7px; border-radius: 50%; background: #4caf50; }
        .membership-pill.inactive .dot { background: var(--steel); }

        .dash-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: start; }
        .card { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 26px; }
        .card h2 { font-family: 'Anton', sans-serif; text-transform: uppercase; font-size: 18px; margin: 0 0 20px; letter-spacing: 0.02em; }
        .empty-state { color: var(--chalk-dim); font-size: 14px; }

        .program-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 14px 0; border-top: 1px solid var(--line); }
        .program-row:first-of-type { border-top: none; }
        .program-row .lift { font-weight: 600; }
        .program-row .sets { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--blood-bright); }
        .program-row .note { grid-column: 1 / -1; font-size: 12px; color: var(--chalk-dim); margin-top: -4px; }

        .upload-box {
          border: 1.5px dashed var(--line); border-radius: 6px; padding: 26px; text-align: center;
          margin-bottom: 18px; cursor: pointer; transition: border-color .15s;
        }
        .upload-box:hover { border-color: var(--blood); }
        .upload-box input { display: none; }
        .upload-box .hint { color: var(--chalk-dim); font-size: 13px; margin-top: 8px; }
        .upload-filename { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--blood-bright); margin-top: 10px; }
        .upload-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .upload-error { color: var(--blood-bright); font-size: 13px; margin-bottom: 12px; }

        .clip-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 1px solid var(--line); font-size: 14px; }
        .clip-row:first-of-type { border-top: none; }
        .clip-row .meta { display: flex; gap: 10px; align-items: baseline; }
        .clip-row .lift { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--chalk-dim); }
        .status-badge { font-size: 11px; padding: 3px 9px; border-radius: 20px; font-family: 'JetBrains Mono', monospace; }
        .status-badge.reviewed { background: rgba(76,175,80,0.15); color: #6fd37a; }
        .status-badge.pending { background: rgba(232,185,35,0.15); color: var(--tape); }

        @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr; } .upload-fields { grid-template-columns: 1fr; } }
      `}</style>

      <Navbar />

      <div className="wrap dash-shell">
        <div className="dash-head">
          <div>
            <span className="eyebrow">Client Dashboard</span>
            <h1 className="display">Welcome back, {user?.name?.split(" ")[0] || "Lifter"}.</h1>
            <p>Here's what's loaded in for you this week.</p>
          </div>
          <div className={`membership-pill ${membership?.status === "active" ? "" : "inactive"}`}>
            <span className="dot" />
            {membership?.status === "active" ? `${membership.plan} PLAN — ACTIVE` : "NO ACTIVE MEMBERSHIP"}
          </div>
        </div>

        <div className="dash-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* CURRENT PROGRAM */}
            <div className="card">
              <h2>Your Program{program ? ` — ${program.weekLabel}` : ""}</h2>
              {programLoading && <div className="empty-state">Loading…</div>}
              {!programLoading && !program && (
                <div className="empty-state">No program assigned yet — your coach will load one in soon.</div>
              )}
              {!programLoading && program?.exercises?.map((p, i) => (
                <div className="program-row" key={i}>
                  <div className="lift">{p.lift}</div>
                  <div className="sets mono">{p.sets}</div>
                  {p.note && <div className="note">{p.note}</div>}
                </div>
              ))}
            </div>

            {/* UPLOAD */}
            <div className="card">
              <h2>Upload a Lift</h2>
              <label className="upload-box">
                <input type="file" accept="video/*" onChange={handleFileSelect} />
                <div className="display" style={{ fontSize: 16 }}>Drop a video or click to upload</div>
                <div className="hint">MP4 or MOV, up to 200MB</div>
                {file && <div className="upload-filename">Selected: {file.name}</div>}
              </label>
              <div className="upload-fields">
                <div className="field" style={{ margin: 0 }}>
                  <label>Lift</label>
                  <select value={lift} onChange={(e) => setLift(e.target.value)}>
                    <option value="SQUAT">Squat</option>
                    <option value="BENCH">Bench</option>
                    <option value="DEADLIFT">Deadlift</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Weight</label>
                  <input type="text" placeholder="e.g. 180kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
              </div>
              {uploadError && <div className="upload-error">{uploadError}</div>}
              <button className="btn btn-primary btn-block" disabled={!file || uploading} onClick={handleUpload}>
                {uploading ? "Uploading…" : "Send to Coach"}
              </button>
            </div>

            {/* RECENT UPLOADS */}
            <div className="card">
              <h2>Recent Uploads</h2>
              {videos.length === 0 && <div className="empty-state">No uploads yet.</div>}
              {videos.map((c) => (
                <div className="clip-row" key={c._id}>
                  <div className="meta">
                    <span className="lift mono">{c.lift}</span>
                    <span>{c.weight}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 12, color: "var(--chalk-dim)" }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`status-badge ${c.status}`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "26px 26px 0" }}>
              <h2>Chat with Coach</h2>
            </div>
            <ChatWidget otherUserId={coach?._id} otherUserName={coach?.name || "Coach"} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
