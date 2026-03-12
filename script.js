// Election Data
const faculties = [
  { id: 'fase', name: 'FASE', fullName: 'Faculte des Sciences Economiques' }
];

// presidentialCandidates supprimés - PREFAC FASE seulement

const facultyCandidates = {
  fase: [
    { id: 'fase1', name: 'Bamue Kayembe Claudine', slogan: "Une économie forte pour des étudiants forts" },
    { id: 'fase2', name: 'Katolo Nkosso Lucien', slogan: "Rigueur, transparence et résultats pour tous" },
    { id: 'fase3', name: 'Mwipita Mufuta Jessy', slogan: "Innover aujourd’hui pour l’économie de demain" },
    { id: 'fase4', name: "N'Thila Masanka Pathou", slogan: "Leadership, engagement et progrès étudiant" },
    { id: 'fase5', name: 'Otshumbe Klonda Laurent', slogan: "Des idées nouvelles pour une faculté meilleure" },
    { id: 'fase6', name: 'Tunda Nkoji Sam', slogan: "Ensemble pour une gestion responsable et efficace" }
  ]
};

// State
let currentPage = 'home';
let currentStep = 1;
let selectedFaculty = null;
let selectedPrefac = null; // PREFAC FASE seulement
let votes = JSON.parse(localStorage.getItem('upc_votes') || '{}');
let hasVoted = JSON.parse(localStorage.getItem('upc_has_voted') || 'false');

// Initialize votes structure
function initializeVotes() {
  // Votes présidentiels supprimés
  if (!votes.faculty) {
    votes.faculty = {};
    Object.keys(facultyCandidates).forEach(fac => {
      votes.faculty[fac] = {};
      facultyCandidates[fac].forEach(c => votes.faculty[fac][c.id] = 0);
    });
  }
  saveVotes();
}

function saveVotes() {
  localStorage.setItem('upc_votes', JSON.stringify(votes));
  localStorage.setItem('upc_has_voted', JSON.stringify(hasVoted));
}

// Navigation
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
  
  currentPage = page;
  
  if (page === 'vote') {
    if (hasVoted) {
      showVoteSuccess();
    } else {
      resetVoteFlow();
    }
  } else if (page === 'results') {
    renderResults();
  } else if (page === 'dashboard') {
    populateCandidateSelect();
    if (loggedInCandidate) {
      updateDashboardStats();
    }
  }
  
  window.scrollTo(0, 0);
}

// selectFacultyAndVote supprimé - FASE auto
function goToFASEVote() {
  selectedFaculty = 'fase';
  showPage('vote');
  goToStep(2);
}

// Vote Flow
function resetVoteFlow() {
  currentStep = 1;
  selectedFaculty = null;
  selectedPrefac = null;
  selectedPresident = null;
  updateProgressSteps();
  renderFacultySelection();
  showStep(1);
}

function goToStep(step) {
  currentStep = step;
  updateProgressSteps();
  showStep(step);
  
  if (step === 2 && selectedFaculty) {
    renderPrefacCandidates();
    // Étape 3 supprimée - vote PREFAC direct après sélection
    setTimeout(() => {
      selectedPrefac = facultyCandidates.fase[0].id; // Auto-select premier ou logique
      submitPrefacVote();
    }, 500);
  }
}

function showStep(step) {
  document.querySelectorAll('.vote-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + step).classList.add('active');
}

function showVoteSuccess() {
  document.querySelectorAll('.vote-step').forEach(s => s.classList.remove('active'));
  document.getElementById('vote-success').classList.add('active');
  updateProgressSteps(true);
}

function updateProgressSteps(allComplete = false) {
  document.querySelectorAll('.step').forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.remove('active', 'completed');
    
    if (allComplete || stepNum < currentStep) {
      step.classList.add('completed');
    } else if (stepNum === currentStep) {
      step.classList.add('active');
    }
  });
  
  document.querySelectorAll('.step-line').forEach((line, index) => {
    line.classList.toggle('active', index + 1 < currentStep || allComplete);
  });
}

// Render Faculty Selection
function renderFacultySelection() {
  const container = document.getElementById('faculty-selection');
  const faculty = faculties[0];
  container.innerHTML = `
    <div class="faculty-select-card selected" onclick="selectFaculty('${faculty.id}')">
      <h3>${faculty.name}</h3>
      <p>${faculty.fullName}</p>
      <span style="color: green; font-weight: bold;">✓ FASE seulement - Sélection automatique</span>
    </div>
  `;
  selectedFaculty = 'fase';
}

function selectFaculty(facultyId) {
  selectedFaculty = facultyId;
  renderFacultySelection();
  setTimeout(() => goToStep(2), 200);
}

// Render PREFAC Candidates
function renderPrefacCandidates() {
  const faculty = faculties.find(f => f.id === selectedFaculty);
  document.getElementById('selected-faculty-name').textContent = faculty.name;
  
  const candidates = facultyCandidates[selectedFaculty];
  const container = document.getElementById('prefac-candidates');
  
  container.innerHTML = candidates.map(candidate => `
    <div class="candidate-card ${selectedPrefac === candidate.id ? 'selected' : ''}"
         onclick="selectPrefacCandidate('${candidate.id}')">
      <div class="candidate-header">
        <div class="candidate-avatar">${getInitials(candidate.name)}</div>
        <div class="candidate-info">
          <h3>${candidate.name}</h3>
          <p>Candidat PREFAC - ${faculty.name}</p>
        </div>
      </div>
      <div class="candidate-slogan">"${candidate.slogan}"</div>
      <div class="candidate-actions">
        <button class="btn ${selectedPrefac === candidate.id ? 'btn-success' : 'btn-primary'}">
          ${selectedPrefac === candidate.id ? 'Selectionne' : 'Voter'}
        </button>
      </div>
    </div>
  `).join('');
}

function selectPrefacCandidate(candidateId) {
  const candidate = facultyCandidates[selectedFaculty].find(c => c.id === candidateId);
  showConfirmModal(
    `Voulez-vous voter pour ${candidate.name} comme PREFAC?`,
    () => {
      selectedPrefac = candidateId;
      renderPrefacCandidates();
      setTimeout(() => goToStep(3), 300);
    }
  );
}

// Présidentiel supprimé - PREFAC seulement

// Submit PREFAC Vote seulement
function submitPrefacVote() {
  votes.faculty[selectedFaculty][selectedPrefac]++;
  hasVoted = true;
  saveVotes();
  showVoteSuccess();
}

// Mobile menu toggles
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const wrapper = document.querySelector('.nav-links-wrapper');
  const burger = document.querySelector('.burger');
  
  const isOpen = wrapper.classList.toggle('open');
  if (menu) menu.classList.toggle('open', isOpen);
  
  // Update ARIA
  burger.setAttribute('aria-expanded', isOpen.toString());
  
  // Burger animation
  burger.classList.toggle('active', isOpen);
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const wrapper = document.querySelector('.nav-links-wrapper');
  const burger = document.querySelector('.burger');
  
  if (wrapper) wrapper.classList.remove('open');
  if (menu) menu.classList.remove('open');
  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    burger.classList.remove('active');
  }
}

// Modal
function showConfirmModal(message, onConfirm) {
  document.getElementById('confirm-message').textContent = message;
  document.getElementById('confirm-modal').classList.add('active');
  
  const confirmBtn = document.getElementById('confirm-btn');
  confirmBtn.onclick = () => {
    closeModal();
    onConfirm();
  };
}

function closeModal() {
  document.getElementById('confirm-modal').classList.remove('active');
}

// Results
function renderResults() {
  renderFacultyTabs();
  renderFacultyResults('fase');
}

// Présidentiel supprimé

function renderFacultyTabs() {
  const container = document.getElementById('faculty-tabs');
  container.innerHTML = faculties.map((fac, index) => `
    <button class="faculty-tab ${index === 0 ? 'active' : ''}" 
            onclick="selectResultFaculty('${fac.id}', this)">
      ${fac.name}
    </button>
  `).join('');
}

function selectResultFaculty(facultyId, btn) {
  document.querySelectorAll('.faculty-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderFacultyResults(facultyId);
}

function renderFacultyResults(facultyId) {
  const container = document.getElementById('faculty-results');
  const candidates = facultyCandidates[facultyId];
  const facultyVotes = votes.faculty[facultyId] || {};
  const totalVotes = Object.values(facultyVotes).reduce((a, b) => a + b, 0);
  
  const sortedCandidates = [...candidates].sort((a, b) => 
    (facultyVotes[b.id] || 0) - (facultyVotes[a.id] || 0)
  );
  
  container.innerHTML = sortedCandidates.map((candidate, index) => {
    const voteCount = facultyVotes[candidate.id] || 0;
    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
    const isLeader = index === 0 && voteCount > 0;
    
    return `
      <div class="result-row">
        <div class="result-candidate">
          <div class="result-avatar">${getInitials(candidate.name)}</div>
          <span class="result-name">
            ${candidate.name}
            ${isLeader ? '<span class="leader-badge">En tete</span>' : ''}
          </span>
        </div>
        <div class="result-bar-container">
          <div class="result-bar">
            <div class="result-bar-fill ${isLeader ? 'leader' : ''}" style="width: ${percentage}%">
              ${percentage > 10 ? percentage + '%' : ''}
            </div>
          </div>
          <span class="result-votes">${voteCount} vote${voteCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Utilities
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Dashboard State
let loggedInCandidate = null;
const CANDIDATE_PASSWORD = 'upc2026';

// Populate candidate select
function populateCandidateSelect() {
  const select = document.getElementById('candidate-select');
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Choisir un candidat PREFAC FASE --</option>';
  
  // Only FASE PREFAC
  const facId = 'fase';
  const faculty = faculties.find(f => f.id === facId);
  const group = document.createElement('optgroup');
  group.label = `PREFAC ${faculty.name}`;
  
  facultyCandidates[facId].forEach(c => {
    const opt = document.createElement('option');
    opt.value = `faculty:${facId}:${c.id}`;
    opt.textContent = c.name;
    group.appendChild(opt);
  });
  select.appendChild(group);
}

// Handle login
function handleLogin(event) {
  event.preventDefault();
  
  const select = document.getElementById('candidate-select');
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  
  if (!select.value) {
    errorEl.textContent = 'Veuillez selectionner un candidat';
    errorEl.classList.add('show');
    return;
  }
  
  if (password !== CANDIDATE_PASSWORD) {
    errorEl.textContent = 'Code d\'acces incorrect';
    errorEl.classList.add('show');
    return;
  }
  
  errorEl.classList.remove('show');
  
  // Parse selected PREFAC FASE only
  const parts = select.value.split(':');
  const facultyId = parts[1];
  const candidate = facultyCandidates[facultyId].find(c => c.id === parts[2]);
  const faculty = faculties.find(f => f.id === facultyId);
  loggedInCandidate = {
    type: 'faculty',
    id: candidate.id,
    name: candidate.name,
    slogan: candidate.slogan,
    category: `PREFAC ${faculty.name}`,
    faculty: facultyId
  };
  
  showDashboardContent();
}

// Show dashboard content
function showDashboardContent() {
  document.getElementById('dashboard-login').style.display = 'none';
  document.getElementById('dashboard-content').style.display = 'block';
  
  // Update header
  document.getElementById('dashboard-name').textContent = loggedInCandidate.name;
  document.getElementById('dashboard-position').textContent = loggedInCandidate.category;
  
  // Update campaign info
  document.getElementById('my-slogan').textContent = `"${loggedInCandidate.slogan}"`;
  document.getElementById('my-category').textContent = loggedInCandidate.category;
  
  // Update stats
  updateDashboardStats();
}

// Update dashboard statistics
function updateDashboardStats() {
  if (!loggedInCandidate) return;
  
  let myVotes = 0;
  let totalVotes = 0;
  let allCandidatesVotes = [];
  
  // Only PREFAC FASE
  const facultyVotes = votes.faculty[loggedInCandidate.faculty] || {};
  myVotes = facultyVotes[loggedInCandidate.id] || 0;
  totalVotes = Object.values(facultyVotes).reduce((a, b) => a + b, 0);
  
  allCandidatesVotes = facultyCandidates[loggedInCandidate.faculty].map(c => ({
    id: c.id,
    name: c.name,
    votes: facultyVotes[c.id] || 0
  }));
    const facultyVotes = votes.faculty[loggedInCandidate.faculty] || {};
    myVotes = facultyVotes[loggedInCandidate.id] || 0;
    totalVotes = Object.values(facultyVotes).reduce((a, b) => a + b, 0);
    
    allCandidatesVotes = facultyCandidates[loggedInCandidate.faculty].map(c => ({
      id: c.id,
      name: c.name,
      votes: facultyVotes[c.id] || 0
    }));
  }
  
  // Sort by votes
  allCandidatesVotes.sort((a, b) => b.votes - a.votes);
  
  // Calculate rank
  const rank = allCandidatesVotes.findIndex(c => c.id === loggedInCandidate.id) + 1;
  const rankText = rank === 1 ? '1er' : `${rank}e`;
  
  // Calculate percentage
  const percentage = totalVotes > 0 ? Math.round((myVotes / totalVotes) * 100) : 0;
  
  // Update DOM
  document.getElementById('my-votes').textContent = myVotes;
  document.getElementById('my-percentage').textContent = `${percentage}%`;
  document.getElementById('my-rank').textContent = rankText;
  document.getElementById('total-category-votes').textContent = totalVotes;
  
  // Render comparison chart
  renderComparisonChart(allCandidatesVotes, totalVotes);


// Render comparison chart
function renderComparisonChart(candidates, totalVotes) {
  const container = document.getElementById('comparison-chart');
  
  container.innerHTML = candidates.map(candidate => {
    const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
    const isMe = candidate.id === loggedInCandidate.id;
    
    return `
      <div class="comparison-row ${isMe ? 'is-me' : ''}">
        <div class="comparison-name">
          ${candidate.name}
          ${isMe ? '<span class="me-badge">VOUS</span>' : ''}
        </div>
        <div class="comparison-bar-wrap">
          <div class="comparison-bar">
            <div class="comparison-bar-fill" style="width: ${percentage}%">
              ${percentage > 8 ? percentage + '%' : ''}
            </div>
          </div>
          <span class="comparison-votes">${candidate.votes} votes</span>
        </div>
      </div>
    `;
  }).join('');
}

// Handle logout
function handleLogout() {
  loggedInCandidate = null;
  document.getElementById('dashboard-content').style.display = 'none';
  document.getElementById('dashboard-login').style.display = 'block';
  document.getElementById('password').value = '';
  document.getElementById('candidate-select').value = '';
  document.getElementById('login-error').classList.remove('show');
}

// Close menu when clicking outside or pressing Escape
document.addEventListener('click', (e) => {
  const burger = e.target.closest('.burger');
  const wrapper = document.querySelector('.nav-links-wrapper');
  
  if (!burger && !wrapper.contains(e.target) && wrapper.classList.contains('open')) {
    closeMobileMenu();
  }
});

// Keyboard support: Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu();
  }
});

// Initialize IMMÉDIAT
initializeVotes();
renderFacultySelection();
populateCandidateSelect();
showPage('home');

// Force functions global
window.showPage = showPage;
window.goToFASEVote = goToFASEVote;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
