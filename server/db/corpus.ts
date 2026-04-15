import Database from 'better-sqlite3';

import { CODEX_EXPORT_DB_PATH } from '../config.js';
import { createCorpusSchema } from './corpus-schema.js';

let corpusDb: Database.Database | null = null;

export function getCorpusDb(): Database.Database {
  if (!corpusDb) {
    corpusDb = new Database(CODEX_EXPORT_DB_PATH);
    corpusDb.pragma('journal_mode = WAL');
    corpusDb.pragma('foreign_keys = ON');
    createCorpusSchema(corpusDb);
  }
  return corpusDb;
}

export function closeCorpusDb(): void {
  if (corpusDb) {
    corpusDb.close();
    corpusDb = null;
  }
}
