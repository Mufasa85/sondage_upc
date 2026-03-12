// data.js - Faculties and Candidates for UPC Election Poll

const faculties = [
  { id: 1, name: 'FASE (Économie)', color: '#3B82F6' },
  { id: 2, name: 'Droit', color: '#10B981' },
  { id: 3, name: 'Médecine', color: '#EF4444' },
  { id: 4, name: 'FASI (Informatique)', color: '#F59E0B' },
  { id: 5, name: 'Théologie', color: '#8B5CF6' }
];

const candidatesByFaculty = {
  1: [ // FASE
    { id: 101, name: 'Jean-Pierre Mvula', photo: 'https://via.placeholder.com/300x400/3B82F6/FFFFFF?text=Jean-Pierre+Mvula', votes: 0 },
    { id: 102, name: 'Marie Kabila', photo: 'https://via.placeholder.com/300x400/3B82F6/FFFFFF?text=Marie+Kabila', votes: 0 },
    { id: 103, name: 'Étienne Tshisekedi Jr.', photo: 'https://via.placeholder.com/300x400/3B82F6/FFFFFF?text=Étienne+Tshisekedi', votes: 0 },
    { id: 104, name: 'Sophie Lumumba', photo: 'https://via.placeholder.com/300x400/3B82F6/FFFFFF?text=Sophie+Lumumba', votes: 0 }
  ],
  2: [ // Droit
    { id: 201, name: 'Antoine Nkulu', photo: 'https://via.placeholder.com/300x400/10B981/FFFFFF?text=Antoine+Nkulu', votes: 0 },
    { id: 202, name: 'Fatima Zongo', photo: 'https://via.placeholder.com/300x400/10B981/FFFFFF?text=Fatima+Zongo', votes: 0 },
    { id: 203, name: 'Patrice Lumumba II', photo: 'https://via.placeholder.com/300x400/10B981/FFFFFF?text=Patrice+Lumumba', votes: 0 }
  ],
  3: [ // Médecine
    { id: 301, name: 'Dr. Aline Banza', photo: 'https://via.placeholder.com/300x400/EF4444/FFFFFF?text=Dr.+Aline+Banza', votes: 0 },
    { id: 302, name: 'Paul Mbeko', photo: 'https://via.placeholder.com/300x400/EF4444/FFFFFF?text=Paul+Mbeko', votes: 0 },
    { id: 303, name: 'Claire Mutombo', photo: 'https://via.placeholder.com/300x400/EF4444/FFFFFF?text=Claire+Mutombo', votes: 0 },
    { id: 304, name: 'Henri Lunda', photo: 'https://via.placeholder.com/300x400/EF4444/FFFFFF?text=Henri+Lunda', votes: 0 }
  ],
  4: [ // FASI
    { id: 401, name: 'David Kabeya', photo: 'https://via.placeholder.com/300x400/F59E0B/000000?text=David+Kabeya', votes: 0 },
    { id: 402, name: 'Élise Ngoy', photo: 'https://via.placeholder.com/300x400/F59E0B/000000?text=Élise+Ngoy', votes: 0 },
    { id: 403, name: 'Marc Tunda', photo: 'https://via.placeholder.com/300x400/F59E0B/000000?text=Marc+Tunda', votes: 0 }
  ],
  5: [ // Théologie
    { id: 501, name: 'Pasteur Éric Mputu', photo: 'https://via.placeholder.com/300x400/8B5CF6/FFFFFF?text=Pasteur+Éric', votes: 0 },
    { id: 502, name: 'Sarah Ilunga', photo: 'https://via.placeholder.com/300x400/8B5CF6/FFFFFF?text=Sarah+Ilunga', votes: 0 },
    { id: 503, name: 'Abbé Joseph Kabila', photo: 'https://via.placeholder.com/300x400/8B5CF6/FFFFFF?text=Abbé+Joseph', votes: 0 },
    { id: 504, name: 'Rachel Mwanza', photo: 'https://via.placeholder.com/300x400/8B5CF6/FFFFFF?text=Rachel+Mwanza', votes: 0 }
  ]
};

let currentFacultyId = null;
let hasVoted = false;
let totalVotes = 0;

