import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function RefundPolicyPage() {
  return (
    <div className="pf-root">
      <Navbar />
      <header className="legal-hero">
        <div className="wrap">
          <span className="eyebrow">Legal</span>
          <h1 className="display" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>Refund & Cancellation Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </header>

      <div className="wrap legal-content">
        <h2>1. Before Coaching Has Started</h2>
        <p>
          If you purchase a membership and change your mind before any coaching has begun (no program has
          been assigned to you), you are eligible for a <strong>full refund</strong>, provided you request it
          within <strong>3 days of your purchase date</strong>.
        </p>

        <h2>2. After a Program Has Been Assigned</h2>
        <p>
          Once your coach has assigned you a training program, your membership is considered active and
          in-use. <strong>No refunds are issued</strong> from this point onward for the current billing
          period.
        </p>

        <h2>3. Leaving the Team Mid-Membership</h2>
        <p>
          If you wish to leave the team after a program has been assigned, you may request early
          cancellation. In this case, <strong>30% of the amount paid will be deducted</strong> as an early
          cancellation charge, and the remaining 70% will be refunded to your original payment method.
        </p>

        <h2>4. How to Request a Refund or Cancellation</h2>
        <p>
          Email <a href="mailto:singharyansingh305@gmail.com">singharyansingh305@gmail.com</a> with your
          registered email and the reason for your request. We aim to respond within 2 business days.
        </p>

        <h2>5. Refund Timeline</h2>
        <p>
          Approved refunds are processed within <strong>5-7 business days</strong> and credited back to your
          original payment method via Razorpay. Actual credit timing may vary depending on your bank.
        </p>

        <h2>6. Membership Expiry</h2>
        <p>
          Memberships are not automatically renewed. Once your plan's duration ends, access simply expires —
          no cancellation is needed if you don't intend to continue, and no charge will be made.
        </p>

        <h2>7. Contact</h2>
        <p>
          For any refund or cancellation questions, reach us at{" "}
          <a href="mailto:singharyansingh305@gmail.com">singharyansingh305@gmail.com</a> or call{" "}
          <a href="tel:+918595889083">+91 85958 89083</a>.
        </p>
      </div>
      <Footer />
    </div>
  );
}