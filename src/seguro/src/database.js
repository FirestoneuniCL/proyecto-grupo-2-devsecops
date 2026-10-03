const crypto = require('crypto');

function hashPassword(password) {
  return crypto.scryptSync(password, 'medical-records-demo-salt', 32).toString('hex');
}

const users = [
  { id: 1, username: 'doctor_martinez', passwordHash: hashPassword('martinez123'), role: 'doctor', patientId: null },
  { id: 2, username: 'doctor_lopez', passwordHash: hashPassword('lopez2024'), role: 'doctor', patientId: null },
  { id: 3, username: 'paciente_garcia', passwordHash: hashPassword('garcia456'), role: 'paciente', patientId: 3 },
];

const patients = [
  { id: 1, name: 'Juan Perez', ssn: '123-45-6789', bloodType: 'O+', allergies: ['Penicilina', 'Mariscos'], history: [{ date: '2024-01-15', diagnosis: 'Hipertension', treatment: 'Losartan 50mg' }, { date: '2024-03-20', diagnosis: 'Diabetes Tipo 2', treatment: 'Metformina 850mg' }] },
  { id: 2, name: 'Maria Gonzalez', ssn: '987-65-4321', bloodType: 'A-', allergies: ['Aspirina'], history: [{ date: '2024-02-10', diagnosis: 'Asma bronquial', treatment: 'Salbutamol' }, { date: '2024-05-05', diagnosis: 'Gastritis', treatment: 'Omeprazol 20mg' }] },
  { id: 3, name: 'Carlos Rodriguez', ssn: '456-78-9012', bloodType: 'B+', allergies: [], history: [{ date: '2024-04-01', diagnosis: 'Fractura de radio', treatment: 'Yeso + analgesicos' }] },
];

const prescriptions = [
  { id: 1, patientId: 1, doctorId: 1, medication: 'Losartan 50mg', dosage: '1 tableta cada 24 horas', duration: '30 dias', date: '2024-01-15', signed: true, signature: 'FAKE_SIGNATURE_NOT_ENCRYPTED', modifiedBy: [] },
  { id: 2, patientId: 2, doctorId: 2, medication: 'Salbutamol', dosage: '2 inhalaciones cada 8 horas', duration: 'Indefinido', date: '2024-02-10', signed: true, signature: 'FAKE_SIGNATURE_NOT_ENCRYPTED', modifiedBy: [] },
];

const diagnoses = [
  { id: 1, patientId: 1, diagnosis: 'Hipertension', date: '2024-01-15', severity: 'moderada' },
  { id: 2, patientId: 1, diagnosis: 'Diabetes Tipo 2', date: '2024-03-20', severity: 'leve' },
  { id: 3, patientId: 2, diagnosis: 'Asma bronquial', date: '2024-02-10', severity: 'moderada' },
  { id: 4, patientId: 2, diagnosis: 'Gastritis', date: '2024-05-05', severity: 'leve' },
  { id: 5, patientId: 3, diagnosis: 'Fractura de radio', date: '2024-04-01', severity: 'grave' },
];

const auditLog = [];

function queryDiagnoses({ diagnosis, severity } = {}) {
  return diagnoses.filter((record) => {
    const diagnosisMatches = diagnosis === undefined || (typeof diagnosis === 'string' && diagnosis.length <= 100 && record.diagnosis.toLowerCase().includes(diagnosis.toLowerCase()));
    const severityMatches = severity === undefined || ['leve', 'moderada', 'grave'].includes(severity) && record.severity === severity;
    return diagnosisMatches && severityMatches;
  });
}

module.exports = { users, patients, prescriptions, diagnoses, auditLog, queryDiagnoses, hashPassword };
