import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function ContactPage() {
  return (
    <div className="pf-root">
      <Navbar />
      <header className="legal-hero">
        <div className="wrap">
          <span className="eyebrow">Get in touch</span>
          <h1 className="display" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>Contact Us</h1>
          <p>Questions about coaching, memberships, or anything else — reach out directly.</p>
        </div>
      </header>

      <div className="wrap legal-content">
        <h2>TP-IRONCORE-POWERLIFTING</h2>
        <p>We typically respond within 1-2 business days.</p>

        <div className="contact-cards">
          <div className="contact-card">
            <div className="label mono">EMAIL</div>
            <div className="value">
              <a href="mailto:singharyansingh305@gmail.com">singharyansingh305@gmail.com</a>
            </div>
          </div>
          <div className="contact-card">
            <div className="label mono">PHONE</div>
            <div className="value">
              <a href="tel:+918595889083">+91 85958 89083</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}