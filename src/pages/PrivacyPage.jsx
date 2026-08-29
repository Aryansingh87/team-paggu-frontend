import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function PrivacyPage() {
  return (
    <div className="pf-root">
      <Navbar />
      <header className="legal-hero">
        <div className="wrap">
          <span className="eyebrow">Legal</span>
          <h1 className="display" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>Privacy Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </header>

      <div className="wrap legal-content">
        <h2>1. What We Collect</h2>
        <p>When you use TP-IRONCORE-POWERLIFTING, we collect:</p>
        <ul>
          <li><strong>Account information</strong> — name, email, and password (stored securely hashed, never in plain text).</li>
          <li><strong>Training data</strong> — programs assigned to you, and videos you upload for coach review.</li>
          <li><strong>Messages</strong> — chat history between you and your coach, used to provide the coaching service.</li>
          <li><strong>Payment information</strong> — handled entirely by Razorpay. We receive confirmation of successful payment and your membership plan, but never see or store your card, UPI, or bank details.</li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <p>We use your data solely to operate the coaching platform: assigning and displaying your programs, storing your uploaded videos for coach review, enabling chat with your coach, and managing your membership status.</p>

        <h2>3. Data Storage</h2>
        <p>
          Account and program data is stored in a secure MongoDB Atlas database. Uploaded videos are stored
          via Cloudinary. We take reasonable technical measures to protect your data, but no online service
          can guarantee absolute security.
        </p>

        <h2>4. Data Sharing</h2>
        <p>
          We do not sell or rent your personal data to third parties. Your data is only accessible to you,
          your assigned coach, and service providers strictly necessary to run the platform (database
          hosting, video storage, and payment processing).
        </p>

        <h2>5. Your Rights</h2>
        <p>
          You can request access to, correction of, or deletion of your personal data at any time by
          emailing us. We will respond within a reasonable timeframe.
        </p>

        <h2>6. Cookies</h2>
        <p>
          We use minimal local browser storage to keep you logged in (an authentication token). We do not
          use tracking or advertising cookies.
        </p>

        <h2>7. Children's Privacy</h2>
        <p>This service is not intended for users under 18 without parental/guardian consent.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this Privacy Policy occasionally. Continued use of the platform after changes are posted constitutes acceptance.</p>

        <h2>9. Contact</h2>
        <p>
          For any privacy-related questions or requests, contact us at{" "}
          <a href="mailto:singharyansingh305@gmail.com">singharyansingh305@gmail.com</a> or call{" "}
          <a href="tel:+918595889083">+91 85958 89083</a>.
        </p>
      </div>
      <Footer />
    </div>
  );
}