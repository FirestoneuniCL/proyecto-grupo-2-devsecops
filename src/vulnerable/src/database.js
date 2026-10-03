// In-memory data store that simulates MongoDB-style queries.
// A03: The query function processes MongoDB operators ($ne, $gt, $regex, etc.)
// directly from user input, making it vulnerable to NoSQL injection.

const users = [
  {
    id: 1,
    username: 'doctor_martinez',
    password: 'martinez123',
    role: 'doctor',
    securityQuestion: 'nombre de tu mascota',
    securityAnswer: 'rex',
  },
  {
    id: 2,
    username: 'doctor_lopez',
    password: 'lopez2024',
    role: 'doctor',
    securityQuestion: 'nombre de tu mascota',
    securityAnswer: 'firulais',
  },
  {
    id: 3,
    username: 'paciente_garcia',
    password: 'garcia456',
    role: 'paciente',
    securityQuestion: 'nombre de tu mascota',
    securityAnswer: 'lobato',
  },
];

const patients = [
  {
    id: 1,
    name: 'Juan Perez',
    ssn: '123-45-6789',
    bloodType: 'O+',
    allergies: ['Penicilina', 'Mariscos'],
    history: [
      { date: '2024-01-15', diagnosis: 'Hipertension', treatment: 'Losartan 50mg' },
      { date: '2024-03-20', diagnosis: 'Diabetes Tipo 2', treatment: 'Metformina 850mg' },
    ],
  },
  {
    id: 2,
    name: 'Maria Gonzalez',
    ssn: '987-65-4321',
    bloodType: 'A-',
    allergies: ['Aspirina'],
    history: [
      { date: '2024-02-10', diagnosis: 'Asma bronquial', treatment: 'Salbutamol' },
      { date: '2024-05-05', diagnosis: 'Gastritis', treatment: 'Omeprazol 20mg' },
    ],
  },
  {
    id: 3,
    name: 'Carlos Rodriguez',
    ssn: '456-78-9012',
    bloodType: 'B+',
    allergies: [],
    history: [
      { date: '2024-04-01', diagnosis: 'Fractura de radio', treatment: 'Yeso + analgesicos' },
    ],
  },
];

const prescriptions = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    medication: 'Losartan 50mg',
    dosage: '1 tableta cada 24 horas',
    duration: '30 dias',
    date: '2024-01-15',
    signed: true,
    signature: 'FAKE_SIGNATURE_NOT_ENCRYPTED',
    modifiedBy: [],
  },
  {
    id: 2,
    patientId: 2,
    doctorId: 2,
    medication: 'Salbutamol',
    dosage: '2 inhalaciones cada 8 horas',
    duration: 'Indefinido',
    date: '2024-02-10',
    signed: true,
    signature: 'FAKE_SIGNATURE_NOT_ENCRYPTED',
    modifiedBy: [],
  },
];

const diagnoses = [
  { id: 1, patientId: 1, diagnosis: 'Hipertension', date: '2024-01-15', severity: 'moderada' },
  { id: 2, patientId: 1, diagnosis: 'Diabetes Tipo 2', date: '2024-03-20', severity: 'leve' },
  { id: 3, patientId: 2, diagnosis: 'Asma bronquial', date: '2024-02-10', severity: 'moderada' },
  { id: 4, patientId: 2, diagnosis: 'Gastritis', date: '2024-05-05', severity: 'leve' },
  { id: 5, patientId: 3, diagnosis: 'Fractura de radio', date: '2024-04-01', severity: 'grave' },
];

// Simulates a MongoDB-style query that processes operators from user input.
// A03: No sanitization of $ne, $gt, $lt, $regex, $exists operators.
function matchesQuery(doc, field, condition) {
  if (typeof condition === 'object' && condition !== null) {
    for (const op of Object.keys(condition)) {
      const val = condition[op];
      switch (op) {
        case '$ne':
          if (doc[field] === val) return false;
          break;
        case '$gt':
          if (!(doc[field] > val)) return false;
          break;
        case '$gte':
          if (!(doc[field] >= val)) return false;
          break;
        case '$lt':
          if (!(doc[field] < val)) return false;
          break;
        case '$lte':
          if (!(doc[field] <= val)) return false;
          break;
        case '$regex':
          if (!new RegExp(val).test(String(doc[field]))) return false;
          break;
        case '$exists':
          if (condition.$exists && doc[field] === undefined) return false;
          if (!condition.$exists && doc[field] !== undefined) return false;
          break;
        case '$in':
          if (!Array.isArray(val) || !val.includes(doc[field])) return false;
          break;
        default:
          if (doc[field] !== val) return false;
      }
    }
    return true;
  }
  return doc[field] === condition;
}

function queryDiagnoses(query) {
  return diagnoses.filter((doc) => {
    for (const field of Object.keys(query)) {
      if (!matchesQuery(doc, field, query[field])) return false;
    }
    return true;
  });
}

module.exports = {
  users,
  patients,
  prescriptions,
  diagnoses,
  queryDiagnoses,
};
