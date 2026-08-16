import React from "react";

export default function Footer() {
  return (
    <footer className="pf-footer">
      <div className="wrap pf-footer" style={{ padding: 0 }}>
        <span>© {new Date().getFullYear()} Team Paggu</span>
        <span className="mono">SQUAT · BENCH · DEADLIFT</span>
      </div>
    </footer>
  );
}
