"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type CandidateRow = {
  id: string;
  nom: string | null;
  postnom: string | null;
  prenom: string | null;
  faculte: string | null;
  votes: number | null;
  slogan: string | null;
  access?: string | null;
};

function fullName(c: CandidateRow) {
  return `${c.prenom ?? ""} ${c.postnom ?? ""} ${c.nom ?? ""}`.trim();
}

type Stats = {
  myVotes: number;
  totalVotes: number;
  percentage: number;
  rank: number;
  comparison: { id: string; name: string; votes: number }[];
};

async function fetchStats(
  candidateId: string,
  faculte: string,
): Promise<Stats> {
  const { data, error } = await supabase
    .from("candidat")
    .select("id, nom, postnom, prenom, votes")
    .eq("faculte", faculte);

  if (error || !data) {
    return {
      myVotes: 0,
      totalVotes: 0,
      percentage: 0,
      rank: 0,
      comparison: [],
    };
  }

  const comparison = (data as CandidateRow[])
    .map((c) => ({
      id: c.id,
      name: fullName(c) || "--",
      votes: (c.votes ?? 0) as number,
    }))
    .sort((a, b) => b.votes - a.votes);

  const totalVotes = comparison.reduce((sum, c) => sum + c.votes, 0);
  const myVotes = comparison.find((c) => c.id === candidateId)?.votes ?? 0;
  const percentage =
    totalVotes > 0 ? Math.round((myVotes / totalVotes) * 100) : 0;
  const rank = comparison.findIndex((c) => c.id === candidateId) + 1;

  return { myVotes, totalVotes, percentage, rank, comparison };
}

export default function DashboardPage() {
  const router = useRouter();
  const [candidateId, setCandidateId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loggedCandidate, setLoggedCandidate] = useState<CandidateRow | null>(
    null,
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("upc_candidate_session");
    if (raw) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (loggedCandidate && loggedCandidate.faculte) {
      setLoadingStats(true);
      fetchStats(loggedCandidate.id, loggedCandidate.faculte)
        .then(setStats)
        .finally(() => setLoadingStats(false));
    }
  }, [loggedCandidate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = candidateId.trim();
    const code = accessCode.trim();

    if (!id) {
      setError("Veuillez entrer votre identifiant");
      return;
    }
    if (!code) {
      setError("Veuillez entrer votre code d'acces");
      return;
    }

    setLoadingStats(true);
    setError(null);
    setStats(null);

    const { data, error: loginError } = await supabase
      .from("candidat")
      .select("id, nom, postnom, prenom, faculte, votes, slogan")
      .eq("id", id)
      .eq("access", code)
      .single();

    if (loginError || !data) {
      setLoadingStats(false);
      setError("Identifiant ou code d'acces incorrect");
      return;
    }

    setLoadingStats(false);
    const candidate = data as CandidateRow;
    setLoggedCandidate(candidate);
    window.localStorage.setItem(
      "upc_candidate_session",
      JSON.stringify({
        id: candidate.id,
        faculte: candidate.faculte,
        name: fullName(candidate),
      }),
    );
    router.push("/dashboard");
  };

  const handleLogout = () => {
    setLoggedCandidate(null);
    setAccessCode("");
    setCandidateId("");
    setStats(null);
    window.localStorage.removeItem("upc_candidate_session");
  };

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
                  <label htmlFor="candidate-id">Identifiant</label>
                  <input
                    type="text"
                    id="candidate-id"
                    placeholder="Collez votre ID (UUID)"
                    required
                    value={candidateId}
                    onChange={(e) => setCandidateId(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Code d&apos;acces</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Entrez votre code d'acces"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
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
                  Bienvenue,{" "}
                  <span id="dashboard-name">
                    {fullName(loggedCandidate) || "--"}
                  </span>
                </h1>
                <p id="dashboard-position">
                  PREFAC {loggedCandidate.faculte ?? ""}
                </p>
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
                  <span className="dash-stat-value" id="total-category-votes">
                    {stats.totalVotes}
                  </span>
                  <span className="dash-stat-label">
                    Votes Totaux (categorie)
                  </span>
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
                    "{loggedCandidate.slogan ?? ""}"
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
