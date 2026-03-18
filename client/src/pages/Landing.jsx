import { useNavigate } from "react-router-dom"
import "../styles/landing.css"

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">JARVIS</div>
        <div className="auth-actions">
          <button className="btn ghost" onClick={() => navigate("/app")}>
            Sign In
          </button>
          <button className="btn primary" onClick={() => navigate("/app")}>
            Sign Up
          </button>
        </div>
      </header>

      <main className="hero-section">
        <h1>
          Your Intelligent <span>AI Co-Pilot</span>
        </h1>
        <p>
          Think faster. Decide smarter. Execute with confidence.
        </p>

        <button className="btn primary large" onClick={() => navigate("/app")}>
          Launch JARVIS
        </button>
      </main>
    </div>
  )
}

export default Landing