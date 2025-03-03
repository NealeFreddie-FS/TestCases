import sqlite3 from "sqlite3";
import { Database } from "sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(__dirname, "../../data/codecheck.db");

// Ensure the data directory exists
const ensureDataDir = (): void => {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Create database tables
const createTables = async (db: Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Submissions table
      db.run(`
        CREATE TABLE IF NOT EXISTS submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          language TEXT,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Results table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          submission_id INTEGER NOT NULL,
          score REAL NOT NULL,
          feedback TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (submission_id) REFERENCES submissions(id)
        )
      `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  });
};

// Setup the database
export const setupDatabase = async (): Promise<Database> => {
  ensureDataDir();

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }

      createTables(db)
        .then(() => {
          console.log("Database setup complete");
          resolve(db);
        })
        .catch(reject);
    });
  });
};

// Get a database connection
export const getDatabase = async (): Promise<Database> => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};
