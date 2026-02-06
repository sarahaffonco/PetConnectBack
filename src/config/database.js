import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho do banco de dados
const dbPath = join(__dirname, '../../database/petconnect.db');

// Criar diretório database se não existir
const dbDir = dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Criar conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisificar métodos do banco para usar async/await
// Para db.run, precisamos capturar o lastID do contexto 'this'
db.runAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          lastID: this.lastID,
          changes: this.changes
        });
      }
    });
  });
};

db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

export default db;
