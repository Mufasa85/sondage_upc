"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Candidate = {
  id: string;
  name: string;
  slogan: string;
};

const CANDIDATES: Candidate[] = [
  {
    id: "droit1",
    name: "Bamue Kayembe Claudine",
    slogan: "Justice, équité et voix pour chaque étudiant",
  },
  {
    id: "droit2",
    name: "Katolo Nkosso Lucien",
    slogan: "Le droit au service des étudiants",
  },
  {
    id: "droit3",
    name: "Mwipita Mufuta Jessy",
    slogan: "Défendre vos droits, construire l'avenir",
  },
  {
    id: "droit4",
    name: "N'Thila Masanka Pathou",
    slogan: "Justice, engagement et leadership étudiant",
  },
  {
    id: "droit5",
    name: "Otshumbe Klonda Laurent",
    slogan: "Pour une faculté juste et respectée",
  },
  {
    id: "droit6",
    name: "Tunda Nkoji Sam",
    slogan: "La voix des étudiants, la force du droit",
  },
];

const ACCESS_CODE = "upc2026";

type Stats = {
  myVotes: number;
  totalVotes: number;
  percentage: number;
  rank: number;
  comparison: { id: string; name: string; votes: number }[];
};

async function fetchStats(candidateId: string): Promise<Stats> {
  const { data, error } = await supabase
    .from("votes")
    .select("candidate_id")
    .eq("faculty_id", "droit");

  if (error || !data) {
    return {
      myVotes: 0,
      totalVotes: 0,
      percentage: 0,
      rank: 0,
      comparison: [],
    };
  }

  const counts: Record<string, number> = {};
  data.forEach((row) => {
    counts[row.candidate_id] = (counts[row.candidate_id] || 0) + 1;
  });

  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
  const comparison = CANDIDATES.map((c) => ({
    id: c.id,
    name: c.name,
    votes: counts[c.id] || 0,
  })).sort((a, b) => b.votes - a.votes);

  const myVotes = counts[candidateId] || 0;
  const percentage =
    totalVotes > 0 ? Math.round((myVotes / totalVotes) * 100) : 0;
  const rank = comparison.findIndex((c) => c.id === candidateId) + 1;

  return { myVotes, totalVotes, percentage, rank, comparison };
}

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loggedInId, setLoggedInId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (loggedInId) {
      setLoadingStats(true);
      fetchStats(loggedInId)
        .then(setStats)
        .finally(() => setLoadingStats(false));
    }
  }, [loggedInId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setError("Veuillez selectionner un candidat");
      return;
    }
    if (password !== ACCESS_CODE) {
      setError("Code d'acces incorrect");
      return;
    }
    setError(null);
    setLoggedInId(selectedId);
  };

  const handleLogout = () => {
    setLoggedInId(null);
    setPassword("");
    setSelectedId("");
    setStats(null);
  };

  const loggedCandidate = CANDIDATES.find((c) => c.id === loggedInId) || null;

  return (
    <main id="dashboard-page" className="page">
      <div className="container dashboard-container">
        {!loggedCandidate && (
          <div id="dashboard-login" className="dashboard-section">
            <div className="login-card">
              <div className="login-header">
                <div className="login-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2>Espace Candidat</h2>
                <p>Connectez-vous pour voir vos statistiques de vote</p>
              </div>
              <form id="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="candidate-select">
                    Selectionnez votre nom
                  </label>
                  <select
                    id="candidate-select"
                    required
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    <option value="">-- Choisir un candidat PREFAC Droit --</option>
                    <optgroup label="PREFAC Droit">
                      {CANDIDATES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="password">Code d&apos;acces</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Entrez votre code"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="form-hint">Code par defaut: upc2026</span>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-full"
                >
                  <svg
                    className="icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"></path>
                  </svg>
                  Se Connecter
                </button>
              </form>
              {error && <div className="login-error show">{error}</div>}
            </div>
          </div>
        )}

        {loggedCandidate && stats && (
          <div id="dashboard-content" className="dashboard-section">
            <div className="dashboard-header">
              <div className="dashboard-welcome">
                <h1>
                  Bienvenue, <span id="dashboard-name">{loggedCandidate.name}</span>
                </h1>
                <p id="dashboard-position">PREFAC Droit</p>
              </div>
              <button className="btn btn-outline" onClick={handleLogout}>
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"></path>
                </svg>
                Deconnexion
              </button>
            </div>

            <div className="dashboard-stats">
              <div className="dash-stat-card primary">
                <div className="dash-stat-icon">
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
                <div className="dash-stat-info">
                  <span className="dash-stat-value" id="my-votes">
                    {stats.myVotes}
                  </span>
                  <span className="dash-stat-label">Mes Votes</span>
                </div>
              </div>
              <div className="dash-stat-card accent">
                <div className="dash-stat-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 20V10M12 20V4M6 20v-6"></path>
                  </svg>
                </div>
                <div className="dash-stat-info">
                  <span className="dash-stat-value" id="my-percentage">
                    {stats.percentage}%
                  </span>
                  <span className="dash-stat-label">Pourcentage</span>
                </div>
              </div>
              <div className="dash-stat-card success">
                <div className="dash-stat-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 1012 0V2z"></path>
                  </svg>
                </div>
                <div className="dash-stat-info">
                  <span className="dash-stat-value" id="my-rank">
                    {stats.rank === 1
                      ? "1er"
                      : stats.rank > 0
                        ? `${stats.rank}e`
                        : "-"}
                  </span>
                  <span className="dash-stat-label">Classement</span>
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path>
                  </svg>
                </div>
                <div className="dash-stat-info">
                  <span
                    className="dash-stat-value"
                    id="total-category-votes"
                  >
                    {stats.totalVotes}
                  </span>
                  <span className="dash-stat-label">Votes Totaux (categorie)</span>
                </div>
              </div>
            </div>

            <div className="dashboard-chart-section">
              <h2>
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 20V10M12 20V4M6 20v-6"></path>
                </svg>
                Comparaison avec les autres candidats
              </h2>
              <div className="comparison-chart" id="comparison-chart">
                {stats.comparison.map((c) => {
                  const pct =
                    stats.totalVotes > 0
                      ? Math.round((c.votes / stats.totalVotes) * 100)
                      : 0;
                  const isMe = c.id === loggedCandidate.id;
                  return (
                    <div
                      key={c.id}
                      className={`comparison-row ${isMe ? "is-me" : ""}`}
                    >
                      <div className="comparison-name">
                        {c.name}
                        {isMe && <span className="me-badge">VOUS</span>}
                      </div>
                      <div className="comparison-bar-wrap">
                        <div className="comparison-bar">
                          <div
                            className="comparison-bar-fill"
                            style={{ width: `${pct}%` }}
                          >
                            {pct > 8 ? `${pct}%` : ""}
                          </div>
                        </div>
                        <span className="comparison-votes">
                          {c.votes} votes
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-history-section">
              <h2>
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                Informations de Campagne
              </h2>
              <div className="campaign-info">
                <div className="info-item">
                  <span className="info-label">Slogan:</span>
                  <span className="info-value" id="my-slogan">
                    "{loggedCandidate.slogan}"
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Statut:</span>
                  <span className="info-value status-active">
                    Campagne Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {loggedCandidate && !stats && loadingStats && (
          <p>Chargement des statistiques...</p>
        )}
      </div>
    </main>
  );
}

