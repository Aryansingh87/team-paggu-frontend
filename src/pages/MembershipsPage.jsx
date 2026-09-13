import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const tierMeta = {
  STARTER: { plateSize: "small" },
  COMPETITOR: { plateSize: "medium", featured: true },
  ELITE: { plateSize: "large" },
};

const faqs = [
  {
    q: "How does payment work?",
    a: "Memberships renew monthly and are billed through Razorpay. You can cancel anytime — no lock-in.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade anytime from your dashboard; the new plan applies from your next billing cycle.",
  },
  {
    q: "What if I miss a form check?",
    a: "No penalty — just upload when you can. Your coach reviews whatever's in the queue during their next check-in window.",
  },
  {
    q: "Do I need to be a competitive lifter?",
    a: "No. Starter and Competitor both work well for lifters with no meet booked — programming still follows the same principles.",
  },
];

export default function MembershipsPage() {
  const [plans, setPlans] = useState([]);
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
      .then(({ data }) => setPlans(data.plans))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

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
        .mem-hero { padding: 70px 0 50px; text-align: center; border-bottom: 1px solid var(--line); }
        .mem-hero p { color: var(--chalk-dim); max-width: 520px; margin: 16px auto 0; font-size: 16px; line-height: 1.6; }

        .tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; align-items: end; }
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

        /* SKELETON LOADING STATE */
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
          .tiers-grid { grid-template-columns: 1fr; }
          .tier-card.featured { transform: none; }
        }
      `}</style>

      <Navbar />

      <header className="mem-hero">
        <div className="wrap">
          <span className="eyebrow">Load the bar</span>
          <h1 className="display" style={{ fontSize: "clamp(34px, 5vw, 56px)" }}>Pick your plates.</h1>
          <p>Every tier gets real programming from a real coach. Heavier tiers mean tighter feedback loops.</p>
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
            <div className="tiers-grid">
              {plans.map((plan) => {
                const meta = tierMeta[plan.key] || {};
                return (
                  <div className={`tier-card ${meta.featured ? "featured" : ""}`} key={plan.key}>
                    {meta.featured && <div className="featured-badge mono">MOST LOADED</div>}
                    <div className={`plate ${meta.plateSize || "small"}`} />
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
                      className={`btn btn-block ${meta.featured ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => handleChoose(plan)}
                      disabled={loadingPlan === plan.key}
                    >
                      {loadingPlan === plan.key ? "Loading…" : `Choose ${plan.name}`}
                    </button>
                  </div>
                );
              })}
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