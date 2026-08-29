import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function TermsPage() {
  return (
    <div className="pf-root">
      <Navbar />
      <header className="legal-hero">
        <div className="wrap">
          <span className="eyebrow">Legal</span>
          <h1 className="display" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>Terms & Conditions</h1>
          <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </header>

      <div className="wrap legal-content">
        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms & Conditions govern your use of the TP-IRONCORE-POWERLIFTING website and coaching
          services ("we", "us", "our"). By creating an account, purchasing a membership, or otherwise using
          this platform, you agree to be bound by these terms. If you do not agree, please do not use the
          service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          TP-IRONCORE-POWERLIFTING provides personalized powerlifting coaching, including training program
          assignment, video-based form review, and direct messaging with your coach, delivered through paid
          membership plans as listed on our Memberships page.
        </p>

        <h2>3. Eligibility</h2>
        <p>
          You must be at least 18 years old, or have the consent of a parent/legal guardian, to create an
          account and purchase a membership.
        </p>

        <h2>4. Memberships & Payments</h2>
        <ul>
          <li>Membership plans, pricing, and duration are as displayed on our Memberships page at the time of purchase.</li>
          <li>Payments are processed securely through Razorpay. We do not store your card or banking details.</li>
          <li>Your membership grants access for the duration stated on the plan you purchased, starting from the date of successful payment.</li>
          <li>Refunds and cancellations are governed by our separate Refund & Cancellation Policy.</li>
        </ul>

        <h2>5. Assumption of Risk</h2>
        <p>
          Powerlifting and strength training carry inherent physical risk. By using this service, you
          acknowledge that you are participating voluntarily and confirm you are physically fit to do so, or
          have consulted a medical professional where appropriate. TP-IRONCORE-POWERLIFTING and its coaches
          are not liable for injuries sustained while following an assigned program, to the fullest extent
          permitted by law.
        </p>

        <h2>6. User Content (Videos & Messages)</h2>
        <p>
          Any video you upload for form review remains your content, but you grant us a limited license to
          store and review it solely for the purpose of coaching feedback. Do not upload content that is
          unlawful, infringes on others' rights, or is unrelated to training review. We may remove content
          that violates this.
        </p>

        <h2>7. Acceptable Use</h2>
        <p>
          You agree not to misuse the chat, video upload, or account system — including harassment of
          coaches or other users, sharing your account credentials, or attempting to disrupt the platform's
          normal operation.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, TP-IRONCORE-POWERLIFTING is not liable for any indirect,
          incidental, or consequential damages arising from your use of the service.
        </p>

        <h2>9. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the platform after changes are
          posted constitutes acceptance of the revised terms.
        </p>

        <h2>10. Governing Law</h2>
        <p>These Terms are governed by the laws of India.</p>

        <h2>11. Contact</h2>
        <p>
          Questions about these Terms can be sent to{" "}
          <a href="mailto:singharyansingh305@gmail.com">singharyansingh305@gmail.com</a>.
        </p>
      </div>
      <Footer />
    </div>
  );
}