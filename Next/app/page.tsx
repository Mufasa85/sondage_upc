import Link from "next/link";

export default function Home() {
  return (
    <main id="home-page" className="page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Sondage PREFAC DROIT 2026</span>
          <h1 className="hero-title text-balance">
            Sondage PREFAC Faculté de Droit
          </h1>
          <p className="hero-description text-pretty">
            Votez pour le PREFAC de la Faculté de Droit UPC.
          </p>
          <div className="hero-buttons">
            <a className="btn btn-primary btn-lg" href="/vote">
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
              </svg>
              Participer au Sondage
            </a>
            <a className="btn btn-outline btn-lg" href="/results">
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 20V10M12 20V4M6 20v-6"></path>
              </svg>
              Voir les Resultats
            </a>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Comment ça Marche</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3>1. DROIT Sélectionnée</h3>
              <p>
                Faculté de Droit sélectionnée automatiquement - Accès direct
                PREFAC.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon accent">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
              </div>
              <h3>2. Votez pour vos Candidats</h3>
              <p>Exprimez votre preference pour le PREFAC de votre faculte.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon success">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 20V10M12 20V4M6 20v-6"></path>
                </svg>
              </div>
              <h3>3. Consultez les Resultats</h3>
              <p>
                Suivez les tendances en temps reel et decouvrez les preferences
                des etudiants.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="faculties-preview">
        <div className="container">
          <h2 className="section-title">Faculté de Droit</h2>
          <div className="faculties-grid">
            <div className="faculty-card selected">
              <div className="faculty-icon accent">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <h3>DROIT ✓</h3>
              <p>Faculte de Droit</p>
              <span className="faculty-candidates">6 candidats PREFAC</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Voter PREFAC DROIT</h2>
            <p>Soutenez votre candidat préféré pour le PREFAC Droit.</p>
            <a className="btn btn-accent btn-lg" href="/vote">
              Voter PREFAC Droit
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
