"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type CandidateRow = {
  id: string;
  nom: string | null;
  postnom: string | null;
  prenom: string | null;
  faculte: string | null;
  votes: number | null;
};

function fullName(c: CandidateRow) {
  return `${c.prenom ?? ""} ${c.postnom ?? ""} ${c.nom ?? ""}`.trim();
}

export function DashboardResultsClient({
  initialRows,
}: {
  initialRows: CandidateRow[];
}) {
  const [rows, setRows] = useState<CandidateRow[]>(initialRows);
  const [draftVotesById, setDraftVotesById] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(initialRows.map((r) => [r.id, String(r.votes ?? 0)])),
  );
  const [savingById, setSavingById] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  }, [rows]);

  const handleChange = (id: string, value: string) => {
    setDraftVotesById((prev) => ({ ...prev, [id]: value }));
  };

  const saveVotes = async (id: string) => {
    setError(null);

    const raw = (draftVotesById[id] ?? "").trim();
    const parsed = Number.parseInt(raw, 10);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Votes invalide (doit etre un entier >= 0). ");
      return;
    }

    setSavingById((prev) => ({ ...prev, [id]: true }));

    const previous = rows;
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, votes: parsed } : r)),
    );

    const { error: updateError } = await supabase
      .from("candidat")
      .update({ votes: parsed })
      .eq("id", id);

    if (updateError) {
      setRows(previous);
      setError(updateError.message);
    }

    setSavingById((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Resultats</h2>
        <div style={{ opacity: 0.8 }}>Total candidats: {sortedRows.length}</div>
      </div>

      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #EF4444",
            borderRadius: "12px",
          }}
        >
          <strong>Erreur:</strong>
          <div style={{ marginTop: ".25rem" }}>{error}</div>
        </div>
      )}

      <div style={{ marginTop: "1rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: ".75rem",
                  borderBottom: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                Nom
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: ".75rem",
                  borderBottom: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                Faculte
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: ".75rem",
                  borderBottom: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                Votes
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: ".75rem",
                  borderBottom: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r) => {
              const saving = savingById[r.id] === true;
              return (
                <tr key={r.id}>
                  <td
                    style={{
                      padding: ".75rem",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fullName(r) || "--"}
                  </td>
                  <td
                    style={{
                      padding: ".75rem",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.faculte ?? "--"}
                  </td>
                  <td
                    style={{
                      padding: ".75rem",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <input
                      value={draftVotesById[r.id] ?? String(r.votes ?? 0)}
                      onChange={(e) => handleChange(r.id, e.target.value)}
                      inputMode="numeric"
                      style={{
                        width: "110px",
                        padding: ".5rem",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "transparent",
                        color: "inherit",
                      }}
                    />
                  </td>
                  <td
                    style={{
                      padding: ".75rem",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={saving}
                      onClick={() => saveVotes(r.id)}
                    >
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "1rem", opacity: 0.8 }}>
                  Aucune donnee.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
