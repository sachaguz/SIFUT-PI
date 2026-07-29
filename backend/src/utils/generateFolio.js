const crypto = require('crypto');

function generateFolio(prefix = 'SIF') {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}

module.exports = generateFolio;
