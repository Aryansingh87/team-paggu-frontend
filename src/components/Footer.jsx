import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="pf-footer">
      <div className="wrap" style={{ padding: "30px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span>© {new Date().getFullYear()} TP-IRONCORE-POWERLIFTING</span>
          <span className="mono">SQUAT · BENCH · DEADLIFT</span>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13 }}>
          <Link to="/terms" style={{ color: "var(--chalk-dim)" }}>Terms & Conditions</Link>
          <Link to="/privacy" style={{ color: "var(--chalk-dim)" }}>Privacy Policy</Link>
          <Link to="/refund-policy" style={{ color: "var(--chalk-dim)" }}>Refund Policy</Link>
          <Link to="/contact" style={{ color: "var(--chalk-dim)" }}>Contact Us</Link>
        </div>
      </div>
    </footer>
  );
}