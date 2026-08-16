import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import heroBg from "../assets/hero-bg.png";
import coachPhoto from "../assets/coach-photo.png";

const stats = [
  { label: "LIFTERS IN TEAM", value: 12, suffix: "" },
  { label: "PRS BROKEN", value: 340, suffix: "" },
  { label: "AVG WILKS GAIN", value: 12.4, suffix: "", decimals: 1, prefix: "+" },
];

const programItems = [
  {
    tag: "PROGRAMMING",
    title: "Periodized to your meet or your goal",
    body: "Squat, bench, and deadlift blocks built around your schedule — not a template. Adjusted weekly based on how the bar actually moves.",
  },
  {
    tag: "VIDEO REVIEW",
    title: "Upload your lifts, get them marked up",
    body: "Every working set gets eyes on it. Bar path, depth, lockout — flagged and explained before your next session.",
  },
  {
    tag: "DIRECT LINE",
    title: "Message your coach, not a chatbot",
    body: "Questions about a cue, a tweak, or a missed rep get answered by the person who wrote your program.",
  },
  {
    tag: "TRACKING",
    title: "Every session logged, every PR marked",
    body: "Your training log lives in one place — load, RPE, and history you can actually look back on.",
  },
];

const clips = [
  { lift: "SQUAT", weight: "180kg", athlete: "R. Sharma" },
  { lift: "BENCH", weight: "112kg", athlete: "A. Verma" },
  { lift: "DEADLIFT", weight: "220kg", athlete: "K. Singh" },
  { lift: "SQUAT", weight: "150kg", athlete: "P. Nair" },
];

function useCountUp(target, decimals = 0, start) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    const duration = 1400;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);
  return value.toFixed(decimals);
}

function Stat({ s, start }) {
  const val = useCountUp(s.value, s.decimals || 0, start);
  return (
    <div className="stat">
      <div className="stat-value">
        {s.prefix || ""}
        {Number(val).toLocaleString()}
        {s.suffix}
      </div>
      <div className="stat-label">{s.label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="pf-root">
      <style>{`
        .pf-root { overflow-x: hidden; }

        /* HERO */
        .pf-hero {
          position: relative;
          padding: 170px 0 110px;
          min-height: 620px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .hero-bg-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center 25%;
          z-index: 0;
        }
        .hero-bg-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(11,11,12,0.35) 0%, rgba(11,11,12,0.65) 55%, var(--iron) 96%);
          z-index: 1;
        }
        .hero-content { position: relative; z-index: 2; max-width: 640px; }
        .pf-hero h1 { font-size: clamp(40px, 7vw, 76px); margin: 0 0 26px; }
        .pf-hero h1 .accent { color: var(--blood-bright); }
        .pf-hero p { max-width: 520px; color: var(--chalk-dim); font-size: 17px; line-height: 1.6; margin-bottom: 28px; }
        .hero-quote {
          font-family: 'Anton', sans-serif;
          font-size: clamp(17px, 1.8vw, 21px);
          color: var(--chalk);
          border-left: 3px solid var(--blood);
          padding-left: 16px; margin-bottom: 32px; max-width: 460px;
        }
        .pf-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
        @media (max-width: 900px) {
          .pf-hero { padding: 130px 0 70px; min-height: 480px; }
        }

        /* SCOREBOARD */
        .pf-scoreboard { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--panel); }
        .scoreboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .stat { padding: 30px 20px; text-align: center; border-right: 1px solid var(--line); }
        .stat:last-child { border-right: none; }
        .stat-value { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: clamp(22px, 3vw, 32px); color: var(--blood-bright); }
        .stat-label { margin-top: 8px; font-size: 11px; letter-spacing: 0.12em; color: var(--chalk-dim); }
        @media (max-width: 900px) { .scoreboard-grid { grid-template-columns: repeat(1, 1fr); } .stat { border-right: none; border-bottom: 1px solid var(--line); } }

        /* PROGRAM LOG LIST */
        .log-list { border-top: 1px solid var(--line); }
        .log-item { display: grid; grid-template-columns: 160px 1fr; gap: 30px; padding: 30px 0; border-bottom: 1px solid var(--line); }
        .log-item .tag { font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.1em; color: var(--blood-bright); padding-top: 4px; }
        .log-item h3 { font-size: 21px; margin: 0 0 8px; font-weight: 700; }
        .log-item p { color: var(--chalk-dim); margin: 0; line-height: 1.6; font-size: 15px; max-width: 560px; }
        @media (max-width: 900px) { .log-item { grid-template-columns: 1fr; gap: 10px; } }

        /* COACH */
        .coach-split { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 60px; align-items: center; }
        .coach-photo {
          aspect-ratio: 4/5; border-radius: 4px;
          overflow: hidden;
          border: 1px solid var(--line);
        }
        .coach-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center 15%; display: block; }
        .coach-copy p { color: var(--chalk-dim); line-height: 1.7; font-size: 16px; margin-bottom: 16px; }
        .coach-quote { border-left: 3px solid var(--blood); padding-left: 18px; margin: 24px 0; font-family: 'Anton', sans-serif; font-size: 22px; text-transform: none; line-height: 1.3; }
        @media (max-width: 900px) { .coach-split { grid-template-columns: 1fr; } }

        /* VIDEO WALL */
        .clip-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .clip-card { background: var(--panel); border: 1px solid var(--line); border-radius: 4px; aspect-ratio: 9/12; position: relative; overflow: hidden; display: flex; align-items: flex-end; }
        .clip-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8)); }
        .clip-play { position: absolute; top: 14px; right: 14px; width: 30px; height: 30px; border-radius: 50%; background: rgba(237,234,228,0.12); display: flex; align-items: center; justify-content: center; }
        .clip-play::after { content: ''; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 9px solid var(--chalk); margin-left: 2px; }
        .clip-meta { position: relative; padding: 16px; z-index: 1; }
        .clip-meta .lift { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--blood-bright); letter-spacing: 0.1em; }
        .clip-meta .weight { font-family: 'Anton', sans-serif; font-size: 24px; margin: 4px 0; }
        .clip-meta .athlete { font-size: 12px; color: var(--chalk-dim); }
        @media (max-width: 900px) { .clip-grid { grid-template-columns: repeat(2, 1fr); } }

        /* CTA */
        .pf-cta {
          padding: 100px 0; text-align: center; border-top: 1px solid var(--line);
          background: radial-gradient(ellipse 700px 400px at 50% 0%, rgba(196,36,27,0.14), transparent 65%);
        }
        .pf-cta h2 { font-size: clamp(36px, 6vw, 64px); margin: 0 0 18px; }
        .pf-cta p { color: var(--chalk-dim); max-width: 480px; margin: 0 auto 34px; font-size: 16px; }
      `}</style>

      <Navbar />

      {/* HERO */}
      <header className="pf-hero">
        <img src={heroBg} alt="Team Paggu training in the gym" className="hero-bg-img" />
        <div className="hero-bg-overlay" />
        <div className="wrap hero-content">
          <span className="eyebrow">// TEAM PAGGU</span>
          <h1 className="display">
            SQUAT <span className="accent">BENCH</span> DEADLIFT
          </h1>
          <p>
            Personalized powerlifting programming, video form checks, and a direct
            line to your coach — every lift tracked to the kilogram, every block
            built around your meet.
          </p>
          <div className="hero-quote">"WE DON'T JUST COMPETE, WE DOMINATE."</div>
          <div className="pf-hero-actions">
            <Link to="/memberships" className="btn btn-primary">View Memberships</Link>
            <a href="#coach" className="btn btn-ghost">Meet Your Coach</a>
          </div>
        </div>
      </header>

      {/* SCOREBOARD */}
      <section className="pf-scoreboard" ref={statsRef}>
        <div className="wrap">
          <div className="scoreboard-grid">
            {stats.map((s) => (
              <Stat key={s.label} s={s} start={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      <section className="pf-section" id="program">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">What's loaded in</span>
            <h2 className="display">Everything a lifter under a bar actually needs.</h2>
          </div>
          <div className="log-list">
            {programItems.map((item) => (
              <div className="log-item" key={item.tag}>
                <div className="tag mono">{item.tag}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERSHIPS TEASER */}
      <section className="pf-section" id="memberships" style={{ background: "var(--panel)" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">Load the bar</span>
          <h2 className="display" style={{ marginBottom: 18 }}>Ready to pick your plates?</h2>
          <p style={{ color: "var(--chalk-dim)", maxWidth: 480, margin: "0 auto 30px" }}>
            Full pricing, features, and a plan for every lifter — from first meet to nationals.
          </p>
          <Link to="/memberships" className="btn btn-primary">See Membership Plans</Link>
        </div>
      </section>

      {/* COACH */}
      <section className="pf-section" id="coach">
        <div className="wrap coach-split">
          <div className="coach-photo">
            <img src={coachPhoto} alt="Team Paggu coach" />
          </div>
          <div className="coach-copy">
            <span className="eyebrow">Your Coach</span>
            <h2 className="display" style={{ fontSize: "38px", marginBottom: 18 }}>
              Coached by someone who still competes.
            </h2>
            <p>
              Every program on this platform is written by a coach who has stood
              on the platform themselves — not a template pulled off a spreadsheet.
              Years of competing, judging, and coaching go into every block.
            </p>
            <div className="coach-quote">"I don't program for average. I program for your total."</div>
            <Link to="/memberships" className="btn btn-primary">Start Training</Link>
          </div>
        </div>
      </section>

      {/* RESULTS / VIDEO WALL */}
      <section className="pf-section" id="results" style={{ background: "var(--panel)" }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">On the platform</span>
            <h2 className="display">PRs, filmed and marked up.</h2>
          </div>
          <div className="clip-grid">
            {clips.map((c, i) => (
              <div className="clip-card" key={i}>
                <div className="clip-play" />
                <div className="clip-meta">
                  <div className="lift mono">{c.lift}</div>
                  <div className="weight">{c.weight}</div>
                  <div className="athlete">{c.athlete}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pf-cta">
        <div className="wrap">
          <h2 className="display">Load the bar.</h2>
          <p>Pick a membership, get your first program this week, and start tracking every lift that matters.</p>
          <Link to="/memberships" className="btn btn-primary">Join Team Paggu</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
