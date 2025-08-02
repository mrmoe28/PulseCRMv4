// Use SQLite for development, PostgreSQL for production
const isDevelopment = process.env.NODE_ENV === 'development';
const usesSQLite = process.env.DATABASE_TYPE === 'sqlite' || isDevelopment;

if (usesSQLite) {
  // Development: Use SQLite
  console.log('🔄 Using SQLite database for development');
  module.exports = require('./sqlite');
} else {
  // Production: Use PostgreSQL
  console.log('🔄 Using PostgreSQL database for production');
  module.exports = require('./index-postgres');
}
