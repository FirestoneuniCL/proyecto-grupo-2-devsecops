// ZERO TRUST INPUT (ONF-04 / ASC-01): toda entrada se valida en el SERVIDOR con
// LISTAS BLANCAS (regex que describen lo unico permitido). Lo demas se rechaza.
const RE = {
  id: /^\d{1,6}$/,
  username: /^[a-z0-9_]{3,30}$/,
  // Contrasena: 10-100 caracteres con al menos una letra y un numero
  password: /^(?=.*[A-Za-z])(?=.*\d).{10,100}$/,
  // Texto clinico: letras (con tildes y ñ), numeros, espacio. Sin $ { } < > ; ' "
  diagnosis: /^[\p{L}0-9 ]{3,50}$/u,
  answer: /^[\p{L}0-9 ]{1,50}$/u,
  medication: /^[\p{L}0-9 .,\-/%()]{2,80}$/u,
  dosage: /^[\p{L}0-9 .,\-/%()]{2,120}$/u,
  duration: /^[\p{L}0-9 .,\-/%()]{2,60}$/u,
  hexSig: /^[a-f0-9]{64}$/,
};

// Solo acepta STRINGS (rechaza objetos/arreglos como {"$ne":null}) que cumplan el regex
function isValid(value, regex) {
  return typeof value === 'string' && regex.test(value);
}

// Rechaza claves no esperadas (lista blanca de campos)
function onlyKeys(obj, allowed) {
  return obj && typeof obj === 'object' && !Array.isArray(obj) &&
    Object.keys(obj).every((k) => allowed.includes(k));
}

// Respuesta defensiva estandar corporativa (ONF-07)
function reject(res, status, codigo, mensaje) {
  return res.status(status).json({ error: mensaje, codigo });
}
const bad = (res, msg = 'Solicitud invalida') => reject(res, 400, 'SEC-400', msg);

module.exports = { RE, isValid, onlyKeys, reject, bad };
