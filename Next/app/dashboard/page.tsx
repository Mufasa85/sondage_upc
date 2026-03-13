"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { DashboardResultsClient } from "./results-client";

type CandidateRow = {
  id: string;
  nom: string | null;
  postnom: string | null;
  prenom: string | null;
  faculte: string | null;
  votes: number | null;
};

type Session = {
  id: string;
  faculte: string | null;
  name: string;
};

function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem("upc_candidate_session");
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [rows, setRows] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const s = readSession();
    if (!s || !s.id) {
      router.push("/login");
      return;
    }
    setSession(s);
  }, [router]);

  useEffect(() => {
    const faculte = session?.faculte;
    if (!session || !faculte) return;

    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);

    supabase
      .from("candidat")
      .select("id, nom, postnom, prenom, faculte, votes")
      .eq("faculte", faculte)
      .order("votes", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setRows([]);
          setErrorMessage(
            error?.message || "Impossible de charger les donnees.",
          );
          return;
        }
        setRows(data as CandidateRow[]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const totalVotes = useMemo(
    () => rows.reduce((sum, r) => sum + (r.votes ?? 0), 0),
    [rows],
  );

  const leaderName = useMemo(() => {
    const leader = rows[0];
    if (!leader || (leader.votes ?? 0) <= 0) return "--";
    return `${leader.prenom ?? ""} ${leader.postnom ?? ""} ${leader.nom ?? ""}`.trim();
  }, [rows]);

  const handleLogout = () => {
    window.localStorage.removeItem("upc_candidate_session");
    router.push("/login");
  };

  return (
    <main className="page">
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1>Dashboard Resultats</h1>
            <p style={{ marginTop: ".25rem" }}>
              {session?.name ? (
                <>
                  Connecte: <strong>{session.name}</strong>
                </>
              ) : (
                ""
              )}
              {session?.faculte ? (
                <>
                  {" "}
                  | Faculte: <strong>{session.faculte}</strong>
                </>
              ) : (
                ""
              )}
            </p>
          </div>

          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            <button
              className="btn btn-outline"
              type="button"
              onClick={handleLogout}
            >
              Deconnexion
            </button>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              border: "1px solid #EF4444",
              borderRadius: "12px",
            }}
          >
            <strong>Erreur Supabase:</strong>
            <div style={{ marginTop: ".25rem" }}>{errorMessage}</div>
          </div>
        )}

        <div
          style={{
            marginTop: "1rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          <div className="stat-card">
            <span className="stat-value">{totalVotes}</span>
            <span className="stat-label">Total Votes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{leaderName}</span>
            <span className="stat-label">Leader</span>
          </div>
        </div>

        <section style={{ marginTop: "1rem" }}>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <DashboardResultsClient initialRows={rows} />
          )}
        </section>
      </div>
    </main>
  );
}
