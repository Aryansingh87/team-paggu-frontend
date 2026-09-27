import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const categories = [
  { key: "POWERLIFTING", label: "Powerlifting" },
  { key: "MUSCLE_BUILDING", label: "Muscle Building" },
  { key: "FAT_LOSS", label: "Fat Loss" },
  { key: "BODY_TRANSFORMATION", label: "Body Transformation" },
];

// Cosmetic-only plate sizing per tier position within a category — not tied
// to price directly, just visual weight for 1st/2nd/3rd tier shown.
const plateSizeByIndex = ["small", "medium", "large"];

const faqs = [
  {
    q: "How does payment work?",
    a: "Memberships are billed through Razorpay for the duration shown on the plan. You can cancel anytime — see our Refund Policy for details.",
  },
  {
    q: "Can I switch plans or categories later?",
    a: "Yes. You can move between any category or tier from your dashboard — the new plan applies from your next billing cycle.",
  },
  {
    q: "Can I combine categories, like Powerlifting and Fat Loss?",
    a: "Each membership is its own coaching track. If you want a blend, message your coach directly to discuss a custom approach.",
  },
  {
    q: "What if I miss a check-in?",
    a: "No penalty — just check in when you can. Your coach reviews whatever's in the queue during their next check-in window.",
  },
];

export default function MembershipsPage() {
  const [allPlans, setAllPlans] = useState([]);
  const [activeCategory, setActiveCategory] = useState("POWERLIFTING");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [payError, setPayError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    api
      .get("/memberships")
      .then(({ data }) => setAllPlans(data.plans))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const plansInView = allPlans.filter((p) => p.category === activeCategory);

  const handleChoose = async (plan) => {
    setPayError("");

    if (!user) {
      navigate("/login", { state: { from: "/memberships" } });
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      setPayError("Payment widget failed to load — check your internet connection and try again.");
      return;
    }

    setLoadingPlan(plan.key);
    try {
      const { data } = await api.post("/payments/create-order", { plan: plan.key });

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "TP-IRONCORE-POWERLIFTING",
        description: `${plan.name} Membership`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate("/dashboard");
          } catch (err) {
            setPayError("Payment succeeded but verification failed — contact your coach.");
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#c4241b" },
      });

      razorpay.on("payment.failed", () => setPayError("Payment failed or was cancelled."));
      razorpay.open();
    } catch (err) {
      setPayError(err.response?.data?.message || "Couldn't start checkout. Try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="pf-root">
      <style>{`
        .mem-hero { padding: 70px 0 40px; text-align: center; border-bottom: 1px solid var(--line); }
        .mem-hero p { color: var(--chalk-dim); max-width: 520px; margin: 16px auto 0; font-size: 16px; line-height: 1.6; }

        .category-tabs {
          display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
          padding: 24px 0 0;
        }
        .category-tab {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.05em;
          background: var(--panel); border: 1px solid var(--line); color: var(--chalk-dim);
          padding: 9px 18px; border-radius: 30px; cursor: pointer; transition: all .15s;
        }
        .category-tab:hover { border-color: var(--steel); color: var(--chalk); }
        .category-tab.active { background: var(--blood); border-color: var(--blood); color: var(--chalk); }

        .tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; align-items: end; }
        .tiers-grid.cols-1 { grid-template-columns: minmax(280px, 380px); justify-content: center; }
        .tiers-grid.cols-2 { grid-template-columns: repeat(2, minmax(0, 340px)); justify-content: center; }
        .tier-card {
          background: var(--panel); border: 1px solid var(--line); border-radius: 4px;
          padding: 30px 26px; display: flex; flex-direction: column;
          transition: transform .18s ease, border-color .18s ease;
        }
        .tier-card:hover { transform: translateY(-4px); border-color: var(--steel); }
        .tier-card.featured { background: var(--panel-2); border-color: var(--blood); transform: scale(1.04); }
        .plate { border-radius: 50%; background: radial-gradient(circle at 35% 30%, #2a2a2a, #0d0d0d 70%); border: 3px solid var(--blood); margin-bottom: 18px; }
        .plate.small { width: 44px; height: 44px; }
        .plate.medium { width: 58px; height: 58px; border-color: var(--blood-bright); }
        .plate.large { width: 72px; height: 72px; border-color: var(--tape); }
        .tier-name { font-family: 'Anton', sans-serif; font-size: 20px; letter-spacing: 0.03em; }
        .tier-desc { color: var(--chalk-dim); font-size: 14px; margin: 6px 0 20px; }
        .tier-price { font-family: 'JetBrains Mono', monospace; font-size: 30px; font-weight: 700; }
        .tier-price span { font-size: 14px; color: var(--chalk-dim); font-weight: 500; }
        .tier-features { list-style: none; padding: 0; margin: 22px 0 26px; flex: 1; }
        .tier-features li { font-size: 14px; color: var(--chalk-dim); padding: 9px 0; border-top: 1px solid var(--line); display: flex; gap: 10px; align-items: baseline; }
        .tier-features li::before { content: '—'; color: var(--blood-bright); }
        .featured-badge { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em; color: var(--iron); background: var(--blood); padding: 4px 10px; border-radius: 2px; width: fit-content; margin-bottom: 16px; }

        .pay-error { max-width: 760px; margin: 0 auto 24px; background: rgba(196,36,27,0.12); border: 1px solid var(--blood); color: var(--chalk); font-size: 13px; padding: 12px 16px; border-radius: 4px; text-align: center; }

        .skeleton-card { background: var(--panel); border: 1px solid var(--line); border-radius: 4px; padding: 30px 26px; }
        .skeleton-block { background: var(--panel-2); border-radius: 3px; animation: pulse 1.4s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .skeleton-plate { width: 50px; height: 50px; border-radius: 50%; margin-bottom: 18px; }
        .skeleton-line { height: 14px; margin-bottom: 10px; }
        .skeleton-line.w-60 { width: 60%; }
        .skeleton-line.w-90 { width: 90%; }
        .skeleton-line.w-40 { width: 40%; height: 28px; margin: 16px 0; }
        .skeleton-loading-note { text-align: center; color: var(--chalk-dim); font-size: 13px; margin-top: 20px; }

        .faq-list { border-top: 1px solid var(--line); max-width: 760px; }
        .faq-item { padding: 24px 0; border-bottom: 1px solid var(--line); }
        .faq-item h4 { margin: 0 0 8px; font-size: 16px; }
        .faq-item p { margin: 0; color: var(--chalk-dim); font-size: 14px; line-height: 1.6; }

        @media (max-width: 900px) {
          .tiers-grid, .tiers-grid.cols-1, .tiers-grid.cols-2 { grid-template-columns: 1fr; }
          .tier-card.featured { transform: none; }
        }
      `}</style>

      <Navbar />

      <header className="mem-hero">
        <div className="wrap">
          <span className="eyebrow">Load the bar</span>
          <h1 className="display" style={{ fontSize: "clamp(34px, 5vw, 56px)" }}>Pick your track.</h1>
          <p>Every tier gets real programming from a real coach. Pick the category that matches your goal.</p>
        </div>
        <div className="category-tabs">
          {categories.map((c) => (
            <button
              key={c.key}
              className={`category-tab ${activeCategory === c.key ? "active" : ""}`}
              onClick={() => setActiveCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </header>

      <section className="pf-section">
        <div className="wrap">
          {payError && <div className="pay-error">{payError}</div>}

          {loading && (
            <>
              <div className="tiers-grid">
                {[1, 2, 3].map((i) => (
                  <div className="skeleton-card" key={i}>
                    <div className="skeleton-block skeleton-plate" />
                    <div className="skeleton-block skeleton-line w-60" />
                    <div className="skeleton-block skeleton-line w-90" />
                    <div className="skeleton-block skeleton-line w-40" />
                    <div className="skeleton-block skeleton-line w-90" />
                    <div className="skeleton-block skeleton-line w-90" />
                    <div className="skeleton-block skeleton-line w-60" />
                  </div>
                ))}
              </div>
              <p className="skeleton-loading-note">Loading membership plans…</p>
            </>
          )}

          {!loading && loadError && (
            <p style={{ color: "var(--chalk-dim)", textAlign: "center" }}>
              Couldn't reach the server right now — this can happen on the very first visit in a while.
              Try refreshing in a few seconds.
            </p>
          )}

          {!loading && !loadError && (
            <div className={`tiers-grid ${plansInView.length === 1 ? "cols-1" : plansInView.length === 2 ? "cols-2" : ""}`}>
              {plansInView.map((plan, i) => {
                const featured = plansInView.length > 1 && i === Math.min(1, plansInView.length - 1) && plansInView.length > 2;
                return (
                  <div className={`tier-card ${featured ? "featured" : ""}`} key={plan.key}>
                    {featured && <div className="featured-badge mono">MOST LOADED</div>}
                    <div className={`plate ${plateSizeByIndex[i] || "small"}`} />
                    <div className="tier-name">{plan.name?.toUpperCase()}</div>
                    <div className="tier-desc">{plan.description}</div>
                    <div className="tier-price mono">
                      ₹{plan.price}
                      <span>/{plan.period}</span>
                    </div>
                    <ul className="tier-features">
                      {plan.features?.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <button
                      className={`btn btn-block ${featured ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => handleChoose(plan)}
                      disabled={loadingPlan === plan.key}
                    >
                      {loadingPlan === plan.key ? "Loading…" : `Choose ${plan.name}`}
                    </button>
                  </div>
                );
              })}
              {plansInView.length === 0 && (
                <p style={{ color: "var(--chalk-dim)", textAlign: "center", gridColumn: "1 / -1" }}>
                  No plans in this category yet.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="pf-section" style={{ background: "var(--panel)" }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Before you load in</span>
            <h2 className="display">Common questions.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((f) => (
              <div className="faq-item" key={f.q}>
                <h4>{f.q}</h4>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}