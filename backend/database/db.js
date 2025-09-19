const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Para Vercel serverless, usar /tmp que es writable
// Para desarrollo local, usar carpeta data
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const dbFileName = 'astrobuild_simple_new.db';
const dbPath = isProduction
  ? path.join('/tmp', dbFileName)
  : path.join(__dirname, '../data', dbFileName);

// Crear directorio si no existe (solo en desarrollo)
if (!isProduction) {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
    // Habilitar foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // En production (Vercel), inicializar schema automáticamente
    if (isProduction) {
      initializeDatabase().catch(console.error);
    }
  }
});

// Función para inicializar la base de datos con el schema
async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await exec(schema);
      console.log('Database schema initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Función para promisificar las consultas de SQLite
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows });
        }
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            rows: [],
            lastID: this.lastID,
            changes: this.changes
          });
        }
      });
    }
  });
}

// Función para ejecutar múltiples statements (usado para el schema)
function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  query,
  exec,
  db,
  initializeDatabase
};