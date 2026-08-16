import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [formError, setFormError] = useState("");
  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.email || !form.password || (mode === "signup" && !form.name)) {
      setFormError("Fill in every field to continue.");
      return;
    }

    try {
      const user =
        mode === "login"
          ? await login(form.email, form.password)
          : await signup(form);

      // If they were redirected here from a protected route, send them back there.
      const redirectTo = location.state?.from;
      navigate(redirectTo || (user.role === "coach" ? "/coach" : "/dashboard"));
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="pf-root">
      <style>{`
        .auth-shell { min-height: calc(100vh - 72px - 90px); display: flex; align-items: center; justify-content: center; padding: 60px 20px; }
        .auth-card { width: 100%; max-width: 420px; background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 40px 36px; }
        .auth-toggle { display: flex; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin-bottom: 30px; }
        .auth-toggle button {
          flex: 1; padding: 10px; background: transparent; border: none; color: var(--chalk-dim);
          font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; cursor: pointer;
        }
        .auth-toggle button.active { background: var(--blood); color: var(--chalk); }
        .auth-card h1 { font-size: 26px; margin: 0 0 6px; }
        .auth-card > .wrap-sub { color: var(--chalk-dim); font-size: 14px; margin-bottom: 26px; }
        .role-pick { display: flex; gap: 10px; margin-bottom: 18px; }
        .role-pick label {
          flex: 1; border: 1px solid var(--line); border-radius: 4px; padding: 10px; text-align: center;
          font-size: 13px; cursor: pointer; color: var(--chalk-dim);
        }
        .role-pick input { display: none; }
        .role-pick input:checked + span { color: var(--chalk); }
        .role-pick label:has(input:checked) { border-color: var(--blood); background: var(--panel-2); }
        .auth-error { background: rgba(196,36,27,0.12); border: 1px solid var(--blood); color: var(--chalk); font-size: 13px; padding: 10px 14px; border-radius: 4px; margin-bottom: 18px; }
        .auth-switch { text-align: center; margin-top: 20px; font-size: 13px; color: var(--chalk-dim); }
        .auth-switch button { background: none; border: none; color: var(--blood-bright); font-weight: 600; cursor: pointer; padding: 0; font-size: 13px; }
        .btn[disabled] { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <Navbar />

      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-toggle">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
              LOG IN
            </button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">
              SIGN UP
            </button>
          </div>

          <h1 className="display" style={{ fontSize: 26 }}>
            {mode === "login" ? "Welcome back." : "Join Team Paggu."}
          </h1>
          <div className="wrap-sub">
            {mode === "login" ? "Log in to your dashboard." : "Create an account to get your first program."}
          </div>

          {formError && <div className="auth-error">{formError}</div>}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="field">
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={update("name")} placeholder="Your name" />
              </div>
            )}

            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" />
            </div>

            <div className="field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={update("password")} placeholder="••••••••" />
            </div>

            {mode === "signup" && (
              <div className="field">
                <label>I am a…</label>
                <div className="role-pick">
                  <label>
                    <input
                      type="radio"
                      name="role"
                      checked={form.role === "client"}
                      onChange={() => setForm((f) => ({ ...f, role: "client" }))}
                    />
                    <span>Lifter</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="role"
                      checked={form.role === "coach"}
                      onChange={() => setForm((f) => ({ ...f, role: "coach" }))}
                    />
                    <span>Coach</span>
                  </label>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          <div className="auth-switch">
            {mode === "login" ? (
              <>Don't have an account? <button onClick={() => setMode("signup")}>Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setMode("login")}>Log in</button></>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
