// Datos ficticios en memoria. Cambios respecto a la version vulnerable:
//  - Contrasenas y respuestas de seguridad ALMACENADAS CON HASH (scrypt + sal)  [A02/A07]
//  - Cada usuario esta vinculado a pacientes (patientId / patients asignados)    [A01]
//  - Firma digital REAL (HMAC-SHA256), no texto "FAKE_SIGNATURE"                 [A02]
//  - Sin operadores tipo Mongo: la busqueda es una comparacion de texto simple   [A03]
const crypto = require('crypto');

// ---- Hash de contrasenas (scrypt, incluido en Node: sin dependencias) ----
function hashSecret(plain) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
function verifySecret(plain, stored) {
  const [saltHex, hashHex] = String(stored).split(':');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(String(plain), Buffer.from(saltHex, 'hex'), 64);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

// Clave de firma: en produccion viene de variable de entorno / gestor de secretos
const SIGNING_KEY = process.env.SIGNING_KEY || crypto.randomBytes(32).toString('hex');
function sign(p) {
  const data = [p.id, p.patientId, p.doctorId, p.medication, p.dosage, p.duration, p.date].join('|');
  return crypto.createHmac('sha256', SIGNING_KEY).update(data).digest('hex');
}

// NOTA DE LABORATORIO: estas credenciales de semilla son ficticias. En un sistema real
// vendrian de una base de datos, nunca del codigo fuente.
const users = [
  { id: 1, username: 'doctor_martinez', passwordHash: hashSecret('martinez123'), role: 'doctor',
    patients: [1, 3], answerHash: hashSecret('rex') },
  { id: 2, username: 'doctor_lopez', passwordHash: hashSecret('lopez2024'), role: 'doctor',
    patients: [2], answerHash: hashSecret('firulais') },
  { id: 3, username: 'paciente_garcia', passwordHash: hashSecret('garcia456'), role: 'paciente',
    patientId: 4, answerHash: hashSecret('lobato') },
];

const patients = [
  { id: 1, name: 'Juan Perez', ssn: '123-45-6789', bloodType: 'O+', allergies: ['Penicilina', 'Mariscos'],
    history: [{ date: '2024-01-15', diagnosis: 'Hipertension', treatment: 'Losartan 50mg' },
              { date: '2024-03-20', diagnosis: 'Diabetes Tipo 2', treatment: 'Metformina 850mg' }] },
  { id: 2, name: 'Maria Gonzalez', ssn: '987-65-4321', bloodType: 'A-', allergies: ['Aspirina'],
    history: [{ date: '2024-02-10', diagnosis: 'Asma bronquial', treatment: 'Salbutamol' },
              { date: '2024-05-05', diagnosis: 'Gastritis', treatment: 'Omeprazol 20mg' }] },
  { id: 3, name: 'Carlos Rodriguez', ssn: '456-78-9012', bloodType: 'B+', allergies: [],
    history: [{ date: '2024-04-01', diagnosis: 'Fractura de radio', treatment: 'Yeso + analgesicos' }] },
  // Paciente nuevo, vinculado al usuario paciente_garcia (para poder demostrar el control A01)
  { id: 4, name: 'Ana Garcia', ssn: '321-54-9876', bloodType: 'AB+', allergies: [],
    history: [{ date: '2024-06-01', diagnosis: 'Migrana', treatment: 'Paracetamol 1g' }] },
];

const prescriptions = [
  { id: 1, patientId: 1, doctorId: 1, medication: 'Losartan 50mg', dosage: '1 tableta cada 24 horas',
    duration: '30 dias', date: '2024-01-15' },
  { id: 2, patientId: 2, doctorId: 2, medication: 'Salbutamol', dosage: '2 inhalaciones cada 8 horas',
    duration: 'Indefinido', date: '2024-02-10' },
];
prescriptions.forEach((p) => { p.signature = sign(p); });

const diagnoses = [
  { id: 1, patientId: 1, diagnosis: 'Hipertension', date: '2024-01-15', severity: 'moderada' },
  { id: 2, patientId: 1, diagnosis: 'Diabetes Tipo 2', date: '2024-03-20', severity: 'leve' },
  { id: 3, patientId: 2, diagnosis: 'Asma bronquial', date: '2024-02-10', severity: 'moderada' },
  { id: 4, patientId: 2, diagnosis: 'Gastritis', date: '2024-05-05', severity: 'leve' },
  { id: 5, patientId: 3, diagnosis: 'Fractura de radio', date: '2024-04-01', severity: 'grave' },
  { id: 6, patientId: 4, diagnosis: 'Migrana', date: '2024-06-01', severity: 'leve' },
];

// ---- Autorizacion (A01): ¿este usuario puede ver a este paciente? ----
function canAccessPatient(user, patientId) {
  if (user.role === 'paciente') return user.patientId === patientId;
  if (user.role === 'doctor') return user.patients.includes(patientId);
  return false;
}
function accessiblePatientIds(user) {
  return user.role === 'paciente' ? [user.patientId] : user.patients;
}

// ---- Busqueda segura (A03): el termino es SIEMPRE un string; se compara como texto ----
function searchDiagnoses(term, user) {
  const t = term.toLowerCase();
  const allowed = accessiblePatientIds(user);
  return diagnoses.filter((d) => allowed.includes(d.patientId) && d.diagnosis.toLowerCase().includes(t));
}

module.exports = { users, patients, prescriptions, diagnoses, hashSecret, verifySecret, sign,
                   canAccessPatient, accessiblePatientIds, searchDiagnoses, SIGNING_KEY };
