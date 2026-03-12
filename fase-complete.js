// FASE Sondage COMPLET - TOUTES fonctions globales
(function() {
  'use strict';
  
  // ===== DATA FASE =====
  const faculties = [{ id: 'fase', name: 'FASE', fullName: 'Faculte des Sciences Economiques' }];
  const facultyCandidates = {
    fase: [
      { id: 'fase1', name: 'Bamue Kayembe Claudine', slogan: "Une économie forte pour des étudiants forts" },
      { id: 'fase2', name: 'Katolo Nkosso Lucien', slogan: "Rigueur, transparence et résultats pour tous" },
      { id: 'fase3', name: 'Mwipita Mufuta Jessy', slogan: "Innover aujourd'hui pour l'économie de demain" },
      { id: 'fase4', name: "N'Thila Masanka Pathou", slogan: "Leadership, engagement et progrès étudiant" },
      { id: 'fase5', name: 'Otshumbe Klonda Laurent', slogan: "Des idées nouvelles pour une faculté meilleure" },
      { id: 'fase6', name: 'Tunda Nkoji Sam', slogan: "Ensemble pour une gestion responsable et efficace" }
    ]
  };
  
  // ===== STATE =====
  let currentPage = 'home';
  let currentStep = 1;
  let selectedFaculty = 'fase';
  let selectedPrefac = null;
  let votes = JSON.parse(localStorage.getItem('upc_votes') || '{}');
  let hasVoted = false; // Reset pour debug
  let loggedInCandidate = null;
  const CANDIDATE_PASSWORD = 'upc2026';
  
  // ===== INIT VOTES =====
  function initializeVotes() {
    if (!votes.faculty) {
      votes.faculty = { fase: {} };
      facultyCandidates.fase.forEach(c => votes.faculty.fase[c.id] = 0);
    }
    localStorage.setItem('upc_votes', JSON.stringify(votes));
    localStorage.setItem('upc_has_voted', JSON.stringify(hasVoted));
  }
  
  // ===== NAVIGATION PRINCIPALE =====
  function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page').classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });
    
    currentPage = page;
    
  if (page === 'vote') {
      resetVoteFlow(); // Force toujours nouveau vote
    }
    else if (page === 'dashboard') {
      populateCandidateSelect();
      if (loggedInCandidate) updateDashboardStats();
    }
    
    window.scrollTo(0, 0);
  }
  
  // ===== VOTE FLOW FASE =====
  function resetVoteFlow() {
    currentStep = 1;
    selectedPrefac = null;
    updateProgressSteps();
    renderFacultySelection();
    showStep(1);
  }
  
  function goToStep(step) {
    currentStep = step;
    updateProgressSteps();
    showStep(step);
    
    if (step === 2) {
      renderPrefacCandidates();
    }
  }
  
  function showStep(step) {
    document.querySelectorAll('.vote-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-' + step).classList.add('active');
  }
  
  function showVoteSuccess() {
    document.querySelectorAll('.vote-step').forEach(s => s.classList.remove('active'));
    document.getElementById('vote-success').classList.add('active');
  }
  
  function updateProgressSteps() {
    document.querySelectorAll('.step').forEach((step, index) => {
      const stepNum = index + 1;
      step.classList.toggle('active', stepNum === currentStep);
      step.classList.toggle('completed', stepNum < currentStep);
    });
    
    document.querySelectorAll('.step-line').forEach((line, index) => {
      line.classList.toggle('active', index + 1 < currentStep);
    });
  }
  
  // ===== RENDER FASE =====
  function renderFacultySelection() {
    const container = document.getElementById('faculty-selection');
    const faculty = faculties[0];
    container.innerHTML = `
      <div class="faculty-select-card selected">
        <h3>${faculty.name}</h3>
        <p>${faculty.fullName}</p>
        <div class="auto-select-badge">FASE ✓ Auto-sélectionné</div>
        <button class="btn btn-primary" onclick="goToStep(2)">Continuer PREFAC</button>
      </div>
    `;
  }
  
  function renderPrefacCandidates() {
    const faculty = faculties[0];
    document.getElementById('selected-faculty-name').textContent = faculty.name;
    
    const candidates = facultyCandidates.fase;
    const container = document.getElementById('prefac-candidates');
    
    container.innerHTML = candidates.map(candidate => `
      <div class="candidate-card ${selectedPrefac === candidate.id ? 'selected' : ''}" onclick="selectPrefacCandidate('${candidate.id}')">
        <div class="candidate-header">
          <div class="candidate-avatar">${getInitials(candidate.name)}</div>
          <div class="candidate-info">
            <h3>${candidate.name}</h3>
            <p>PREFAC FASE</p>
          </div>
        </div>
        <div class="candidate-slogan">"${candidate.slogan}"</div>
        <button class="btn ${selectedPrefac === candidate.id ? 'btn-success' : 'btn-primary'}">
          ${selectedPrefac === candidate.id ? ' Sélectionné' : 'Voter'}
        </button>
      </div>
    `).join('');
  }
  
  function selectPrefacCandidate(id) {
    selectedPrefac = id;
    renderPrefacCandidates();
    submitPrefacVote();
  }
  
  function submitPrefacVote() {
    if (selectedPrefac) {
      votes.faculty.fase[selectedPrefac]++;
      hasVoted = true;
      localStorage.setItem('upc_votes', JSON.stringify(votes));
      localStorage.setItem('upc_has_voted', JSON.stringify(true));
      showVoteSuccess();
    }
  }
  
  // ===== RÉSULTATS FASE =====
function renderResults() {
    const container = document.getElementById('faculty-results');
    const candidates = facultyCandidates.fase;
    const facultyVotes = votes.faculty.fase || {};
    const totalVotes = Object.values(facultyVotes).reduce((a, b) => a + b, 0);
    
    document.getElementById('total-votes').textContent = totalVotes;
    
    const sortedCandidates = [...candidates].sort((a, b) => (facultyVotes[b.id] || 0) - (facultyVotes[a.id] || 0));
    
    if (sortedCandidates.length && sortedCandidates[0]) {
      document.getElementById('leader-name').textContent = sortedCandidates[0].name;
    }
    
    container.innerHTML = sortedCandidates.map((candidate, index) => {
      const voteCount = facultyVotes[candidate.id] || 0;
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      const isLeader = index === 0 && voteCount > 0;
      
      return `
        <div class="result-row">
          <div class="result-candidate">
            <div class="result-avatar">${getInitials(candidate.name)}</div>
            <span class="result-name">
              ${candidate.name} ${isLeader ? '<span class="leader-badge">👑 Leader</span>' : ''}
            </span>
          </div>
          <div class="result-bar-container">
            <div class="result-bar">
              <div class="result-bar-fill ${isLeader ? 'leader' : ''}" style="width: ${Math.max(percentage, 5)}%">
                ${percentage > 10 ? percentage + '%' : ''}
              </div>
            </div>
            <span class="result-votes">${voteCount} vote${voteCount > 1 ? 's' : ''}</span>
          </div>
        </div>
      `;
    }).join('');
  }
window.renderResults = renderResults;
  
  // ===== DASHBOARD CANDIDATS FASE =====
  function populateCandidateSelect() {
    const select = document.getElementById('candidate-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionnez PREFAC FASE</option>';
    
    facultyCandidates.fase.forEach(c => {
      const opt = new Option(c.name, `faculty:fase:${c.id}`);
      select.appendChild(opt);
    });
  }
  
  function handleLogin(event) {
    event.preventDefault();
    const select = document.getElementById('candidate-select');
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    
    if (!select.value || password !== CANDIDATE_PASSWORD) {
      errorEl.textContent = 'Candidat ou code incorrect';
      errorEl.classList.add('show');
      return;
    }
    
    const [type, facId, candidateId] = select.value.split(':');
    const candidate = facultyCandidates.fase.find(c => c.id === candidateId);
    
    loggedInCandidate = {
      id: candidateId,
      name: candidate.name,
      slogan: candidate.slogan,
      faculty: 'fase'
    };
    
    errorEl.classList.remove('show');
    showDashboardContent();
  }
  
  function showDashboardContent() {
    document.getElementById('dashboard-login').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';
    
    document.getElementById('dashboard-name').textContent = loggedInCandidate.name;
    document.getElementById('dashboard-position').textContent = 'PREFAC FASE';
    document.getElementById('my-slogan').textContent = `"${loggedInCandidate.slogan}"`;
    
    updateDashboardStats();
  }
  
  function updateDashboardStats() {
    const facultyVotes = votes.faculty.fase || {};
    const myVotes = facultyVotes[loggedInCandidate.id] || 0;
    const totalVotes = Object.values(facultyVotes).reduce((a, b) => a + b, 0);
    const percentage = totalVotes > 0 ? Math.round((myVotes / totalVotes) * 100) : 0;
    
    const allCandidates = facultyCandidates.fase.map(c => ({
      id: c.id,
      name: c.name,
      votes: facultyVotes[c.id] || 0
    })).sort((a, b) => b.votes - a.votes);
    
    const rank = allCandidates.findIndex(c => c.id === loggedInCandidate.id) + 1;
    
    document.getElementById('my-votes').textContent = myVotes;
    document.getElementById('my-percentage').textContent = percentage + '%';
    document.getElementById('my-rank').textContent = rank === 1 ? '1er' : rank + 'e';
    document.getElementById('total-category-votes').textContent = totalVotes;
    
    renderComparisonChart(allCandidates, totalVotes);
  }
  
  function renderComparisonChart(candidates, totalVotes) {
    const container = document.getElementById('comparison-chart');
    container.innerHTML = candidates.map(c => {
      const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
      const isMe = c.id === loggedInCandidate.id;
      return `
        <div class="comparison-row ${isMe ? 'is-me' : ''}">
          <div class="comparison-name">
            ${c.name}${isMe ? ' <span class="me-badge">VOUS</span>' : ''}
          </div>
          <div class="comparison-bar-wrap">
            <div class="comparison-bar">
              <div class="comparison-bar-fill" style="width: ${pct}%">
                ${pct > 8 ? pct + '%' : ''}
              </div>
            </div>
            <span>${c.votes} votes</span>
          </div>
        </div>
      `;
    }).join('');
  }
  
  function handleLogout() {
    loggedInCandidate = null;
    document.getElementById('dashboard-login').style.display = 'block';
    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('password').value = '';
    document.getElementById('candidate-select').value = '';
  }
  
  // ===== UTILS =====
  function getInitials(name) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
  
  function toggleMobileMenu() {
    document.querySelector('.nav-links-wrapper').classList.toggle('open');
    document.querySelector('.burger').classList.toggle('active');
  }
  
  function closeMobileMenu() {
    document.querySelector('.nav-links-wrapper').classList.remove('open');
    document.querySelector('.burger').classList.remove('active');
  }
  
  // ===== EXPORTER TOUT GLOBALEMENT =====
  window.showPage = showPage;
window.selectPrefacCandidate = selectPrefacCandidate;
window.goToStep = goToStep;
  window.goToFASEVote = () => { selectedFaculty = 'fase'; showPage('vote'); };
  window.toggleMobileMenu = toggleMobileMenu;
  window.closeMobileMenu = closeMobileMenu;
  window.handleLogin = handleLogin;
  window.handleLogout = handleLogout;
  
  // ===== START IMMÉDIAT =====
  initializeVotes();
  renderFacultySelection();
  document.querySelectorAll('.nav-link[data-page="home"]').forEach(l => l.classList.add('active'));
})();

