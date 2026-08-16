import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import teamLogo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const dashboardPath = user?.role === "coach" ? "/coach" : "/dashboard";

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/memberships", label: "Memberships" },
  ];

  return (
    <nav className="pf-nav">
      <div className="wrap pf-nav-inner">
        <Link to="/" className="pf-logo">
          <span className="pf-logo-mark">
            <img src={teamLogo} alt="Team Paggu logo" />
          </span>
          TEAM PAGGU
        </Link>
        <div className="pf-links">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className={location.pathname === l.to ? "active" : ""}>
              {l.label}
            </Link>
          ))}
          {user && (
            <Link to={dashboardPath} className={location.pathname === dashboardPath ? "active" : ""}>
              Dashboard
            </Link>
          )}
        </div>
        <div className="pf-nav-actions">
          {user ? (
            <>
              <span className="mono" style={{ fontSize: 12, color: "var(--chalk-dim)" }} title={user.email}>
                {user.name?.split(" ")[0]}
              </span>
              <button className="btn btn-ghost nav-only" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost nav-only">Log In</Link>
          )}
          <Link to={user ? dashboardPath : "/memberships"} className="btn btn-primary">
            {user ? "My Dashboard" : "Join"}
          </Link>
          <button className="hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Log Out</a>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Log In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
