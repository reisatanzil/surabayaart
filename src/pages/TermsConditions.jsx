export default function TermsConditions() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/balaipemuda.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: "900px",
          margin: "0 auto",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        }}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.history.back()
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#4D403A",
            textDecoration: "none",
            fontWeight: "600",
            marginBottom: "25px",
          }}
        >
          ← Back
        </a>

        <h1
          style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#4D403A",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          Terms & Conditions
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            marginBottom: "35px",
          }}
        >
          Last Updated: June 8, 2026
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "25px",
            lineHeight: "1.8",
            color: "#333",
          }}
        >
          <section>
            <h2 style={{ color: "#4D403A" }}>1. Definitions</h2>
            <p>
              SurabayaArt is an online platform that provides event
              information and ticket purchasing services for art,
              cultural, and entertainment events.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#4D403A" }}>2. User Accounts</h2>
            <p>
              Users are responsible for maintaining the confidentiality
              of their account credentials and ensuring that all
              information provided is accurate and up to date.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#4D403A" }}>3. Ticket Purchases</h2>
            <p>
              Tickets purchased through SurabayaArt are valid only for
              the specified event and cannot be exchanged unless stated
              otherwise by the organizer.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#4D403A" }}>4. Payment</h2>
            <p>
              Payments are processed through available payment methods.
              A transaction is considered complete once payment has been
              successfully verified.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#4D403A" }}>5. Refund Policy</h2>
            <p>
              Refunds are only available if an event is cancelled by
              the organizer.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#4D403A" }}>6. E-Ticket Usage</h2>
            <p>
              Each E-Ticket contains a unique QR Code and may only be
              used once for entry to the event.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#4D403A" }}>7. Intellectual Property</h2>
            <p>
              All content, graphics, logos, and materials displayed on
              SurabayaArt are protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#4D403A" }}>8. User Conduct</h2>
            <p>
              Users may not engage in unlawful activities, distribute
              harmful content, or interfere with the functionality of
              the platform.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#4D403A" }}>9. Limitation of Liability</h2>
            <p>
              SurabayaArt acts as a platform provider and is not
              responsible for changes, cancellations, or issues related
              to events managed by organizers.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#4D403A" }}>10. Changes to Terms</h2>
            <p>
              SurabayaArt reserves the right to update these Terms &
              Conditions at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#4D403A" }}>11. Contact</h2>
            <p>
              For questions regarding these Terms & Conditions, please
              contact the SurabayaArt support team.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}