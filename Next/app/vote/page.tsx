"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

type Candidate = {
  id: string;
  nom: string;
  postnom: string;
  prenom: string;
  faculte: string;
  votes: number;
  slogan: string;
};

const FACULTY_ID = "droit";

// Modèle local aligné avec la table Supabase `candidates`

function getInitials(prenom: string, postnom: string, nom: string) {
  return [prenom, postnom, nom]
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function VotePage() {
  const [step, setStep] = useState<1 | 2 | "success">(1);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from("candidat")
        .select("*")
        .eq("faculte", "Droit");

      console.log(error);

      if (!error && data) {
        setCandidates(data);
      }
    };

    fetchCandidates();
  }, []);

  useEffect(() => {
    const voted = window.localStorage.getItem("upc_has_voted_droit");
    if (voted === "true") {
      setStep("success");
    }
  }, []);

  const handleSelectFaculty = () => {
    setStep(2);
  };

  const openConfirm = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setConfirmOpen(true);
    setError(null);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidateId) return;
    setLoading(true);
    setError(null);
    try {
      // Récupérer le nombre de votes actuel du candidat
      const { data, error: selectError } = await supabase
        .from("candidat")
        .select("votes")
        .eq("id", selectedCandidateId)
        .single();

      if (selectError) {
        throw selectError;
      }

      const currentVotes = (data?.votes as number | null) ?? 0;

      // Incrémenter le compteur de votes dans Supabase
      const { error: updateError } = await supabase
        .from("candidat")
        .update({ votes: currentVotes + 1 })
        .eq("id", selectedCandidateId);

      if (updateError) {
        throw updateError;
      }

      window.localStorage.setItem("upc_has_voted_droit", "true");
      setStep("success");
      setConfirmOpen(false);
    } catch (e) {
      console.log(e);
      setError("Une erreur est survenue lors de l'enregistrement du vote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="vote-page" className="page">
      <div className="container vote-container">
        <div className="progress-steps">
          <div
            className={`step ${
              step === 1 || step === 2 || step === "success" ? "active" : ""
            }`}
            data-step="1"
          >
            <div className="step-number">1</div>
            <span>DROIT ✓</span>
          </div>
          <div
            className={`step-line ${
              step === 2 || step === "success" ? "active" : ""
            }`}
          ></div>
          <div
            className={`step ${
              step === 2 || step === "success" ? "completed" : ""
            }`}
            data-step="2"
          >
            <div className="step-number">2</div>
            <span>PREFAC</span>
          </div>
        </div>

        {step === 1 && (
          <div id="step-1" className="vote-step active">
            <div className="step-header">
              <h2>Selectionnez votre Faculte</h2>
              <p>
                La faculté de Droit est sélectionnée automatiquement pour ce
                sondage PREFAC.
              </p>
            </div>
            <div className="faculty-selection-grid" id="faculty-selection">
              <div className="faculty-select-card selected">
                <h3>DROIT</h3>
                <p>Faculte de Droit</p>
                <div className="auto-select-badge">
                  DROIT ✓ Auto-sélectionné
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleSelectFaculty}
                >
                  Continuer PREFAC
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div id="step-2" className="vote-step active">
            <div className="step-header">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7"></path>
                </svg>
                Retour
              </button>
              <h2>
                Votez pour le PREFAC -{" "}
                <span id="selected-faculty-name">DROIT</span>
              </h2>
              <p>
                Selectionnez votre candidat prefere pour le poste de President
                de Faculte.
              </p>
            </div>
            <div className="candidates-grid" id="prefac-candidates">
              {candidates.map((candidate) => (
                // Construit le nom complet à partir du modèle
                // prenom + postnom + nom pour garder l'affichage existant
                <div
                  key={candidate.id}
                  className={`candidate-card ${
                    selectedCandidateId === candidate.id ? "selected" : ""
                  }`}
                  onClick={() => openConfirm(candidate.id)}
                >
                  <div className="candidate-header">
                    <div className="candidate-avatar">
                      {getInitials(
                        candidate.prenom,
                        candidate.postnom,
                        candidate.nom,
                      )}
                    </div>
                    <div className="candidate-info">
                      <h3>
                        {candidate.prenom} {candidate.postnom} {candidate.nom}
                      </h3>
                      <p>PREFAC Droit</p>
                    </div>
                  </div>
                  <div className="candidate-slogan">"{candidate.slogan}"</div>
                  <div className="candidate-actions">
                    <button
                      className={`btn ${
                        selectedCandidateId === candidate.id
                          ? "btn-success"
                          : "btn-primary"
                      }`}
                      type="button"
                    >
                      {selectedCandidateId === candidate.id
                        ? "Sélectionné"
                        : "Voter"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "success" && (
          <div id="vote-success" className="vote-step active">
            <div className="success-content">
              <div className="success-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                  <path d="M22 4L12 14.01l-3-3"></path>
                </svg>
              </div>
              <h2>Merci pour votre Participation!</h2>
              <p>
                Votre vote a ete enregistre avec succes. Vous pouvez consulter
                les resultats en temps reel.
              </p>
              <div className="success-buttons">
                <a className="btn btn-primary" href="/results">
                  Voir les Resultats
                </a>
                <a className="btn btn-outline" href="/">
                  Retour a l&apos;Accueil
                </a>
              </div>
              {error && (
                <p style={{ marginTop: "1rem", color: "#EF4444" }}>{error}</p>
              )}
            </div>
          </div>
        )}

        {confirmOpen && selectedCandidateId && (
          <div id="confirm-modal" className="modal active">
            <div
              className="modal-backdrop"
              onClick={() => setConfirmOpen(false)}
            ></div>
            <div className="modal-content">
              <h3>Confirmer votre Vote</h3>
              <p id="confirm-message">
                Voulez-vous confirmer votre vote pour{" "}
                {(() => {
                  const c = candidates.find(
                    (cand) => cand.id === selectedCandidateId,
                  );
                  return c ? `${c.prenom} ${c.postnom} ${c.nom}` : "";
                })()}{" "}
                ?
              </p>
              <div className="modal-buttons">
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleConfirmVote}
                  disabled={loading}
                >
                  {loading ? "Enregistrement..." : "Confirmer"}
                </button>
              </div>
              {error && (
                <p style={{ marginTop: "1rem", color: "#EF4444" }}>{error}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
