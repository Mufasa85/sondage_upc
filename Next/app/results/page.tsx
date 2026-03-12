import { supabase } from "../../lib/supabaseClient";

type VoteRow = {
  candidate_id: string;
  count: number;
};

type CandidateInfo = {
  id: string;
  name: string;
};

const CANDIDATES: CandidateInfo[] = [
  { id: "droit1", name: "Bamue Kayembe Claudine" },
  { id: "droit2", name: "Katolo Nkosso Lucien" },
  { id: "droit3", name: "Mwipita Mufuta Jessy" },
  { id: "droit4", name: "N'Thila Masanka Pathou" },
  { id: "droit5", name: "Otshumbe Klonda Laurent" },
  { id: "droit6", name: "Tunda Nkoji Sam" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

async function getResults() {
  const { data, error } = await supabase
    .from("votes")
    .select("candidate_id, count:candidate_id", { count: "exact", head: false });

  if (error || !data) {
    return {
      totalVotes: 0,
      results: CANDIDATES.map((c) => ({ candidate: c, votes: 0 })),
    };
  }

  const countsByCandidate: Record<string, number> = {};
  (data as VoteRow[]).forEach((row) => {
    countsByCandidate[row.candidate_id] =
      (countsByCandidate[row.candidate_id] || 0) + row.count;
  });

  const totalVotes = Object.values(countsByCandidate).reduce(
    (sum, v) => sum + v,
    0,
  );

  const results = CANDIDATES.map((c) => ({
    candidate: c,
    votes: countsByCandidate[c.id] || 0,
  })).sort((a, b) => b.votes - a.votes);

  return { totalVotes, results };
}

export default async function ResultsPage() {
  const { totalVotes, results } = await getResults();
  const leader = results[0];

  return (
    <main id="results-page" className="page">
      <div className="container results-container">
        <div className="results-header">
          <h1>Resultats du Sondage</h1>
          <p>
            Suivez les tendances en temps reel des elections etudiantes UPC
            2026
          </p>
          <div className="results-stats">
            <div className="stat-card">
              <span className="stat-value" id="total-votes">
                {totalVotes}
              </span>
              <span className="stat-label">Total Sondage Droit</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">6</span>
              <span className="stat-label">PREFACs</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" id="leader-name">
                {leader && leader.votes > 0 ? leader.candidate.name : "--"}
              </span>
              <span className="stat-label">En Tête</span>
            </div>
          </div>
        </div>

        <section className="results-section">
          <div className="faculty-results-header">
            <h2>
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path>
              </svg>
              PREFAC de la Faculte
            </h2>
          </div>
          <div className="results-chart" id="faculty-results">
            {results.map((row, index) => {
              const percentage =
                totalVotes > 0 ? Math.round((row.votes / totalVotes) * 100) : 0;
              const isLeader = index === 0 && row.votes > 0;
              return (
                <div className="result-row" key={row.candidate.id}>
                  <div className="result-candidate">
                    <div className="result-avatar">
                      {getInitials(row.candidate.name)}
                    </div>
                    <span className="result-name">
                      {row.candidate.name}
                      {isLeader && (
                        <span className="leader-badge"> Leader</span>
                      )}
                    </span>
                  </div>
                  <div className="result-bar-container">
                    <div className="result-bar">
                      <div
                        className={`result-bar-fill ${
                          isLeader ? "leader" : ""
                        }`}
                        style={{
                          width: `${Math.max(percentage, row.votes > 0 ? 5 : 0)}%`,
                        }}
                      >
                        {percentage > 10 ? `${percentage}%` : ""}
                      </div>
                    </div>
                    <span className="result-votes">
                      {row.votes} vote{row.votes > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

