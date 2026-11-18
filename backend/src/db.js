import mysql from 'mysql2/promise';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export let pool = null;
export let dbMode = 'memory';

export async function connectDatabase() {
  if (!process.env.DB_HOST || !process.env.DB_NAME) return false;
  try {
    const base = { host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '' };
    if (process.env.DB_CREATE_DATABASE === 'true') {
      const bootstrap = await mysql.createConnection(base);
      await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME.replaceAll('`', '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await bootstrap.end();
    }
    pool = mysql.createPool({ ...base, database: process.env.DB_NAME, waitForConnections: true, connectionLimit: 10, charset: 'utf8mb4' });
    const schema = await fs.readFile(path.resolve(here, '../../database/schema.sql'), 'utf8');
    for (const statement of schema.split(';').map(s => s.trim()).filter(Boolean)) await pool.query(statement);
    await ensureColumn('participants', 'character_id', 'BIGINT UNSIGNED NULL');
    await ensureColumn('conversations', 'description', 'TEXT NULL');
    await ensureColumn('conversations', 'language', "VARCHAR(16) NOT NULL DEFAULT 'fr'");
    await ensureColumn('characters', 'voice_provider', 'VARCHAR(32) NULL');
    await ensureColumn('characters', 'voice_id', 'VARCHAR(128) NULL');
    await ensureColumn('messages', 'message_type', "ENUM('message','typing','reaction','seen','user_blocked','call_audio_missed','call_video_missed','call_audio_accepted','call_video_accepted','call_audio_refused','call_video_refused','deleted','edited','photo','video','voice') NOT NULL DEFAULT 'message'");
    await pool.query("ALTER TABLE messages MODIFY COLUMN message_type ENUM('message','typing','reaction','seen','user_blocked','call_audio_missed','call_video_missed','call_audio_accepted','call_video_accepted','call_audio_refused','call_video_refused','deleted','edited','photo','video','voice') NOT NULL DEFAULT 'message'");
    await ensureColumn('messages', 'delivery_status', "ENUM('sending','sent','delivered','seen') NOT NULL DEFAULT 'seen'");
    await ensureColumn('messages', 'reaction', 'VARCHAR(16) NULL');
    await ensureColumn('messages', 'appearance_ms', 'INT UNSIGNED NOT NULL DEFAULT 1400');
    await ensureColumn('messages', 'duration_ms', 'INT UNSIGNED NOT NULL DEFAULT 1000');
    await ensureColumn('messages', 'metadata', 'JSON NULL');
    dbMode = 'mysql';
    await seedIfEmpty();
    await seedCharactersIfEmpty();
    console.log(`MySQL connecté (${process.env.DB_NAME})`);
    return true;
  } catch (error) {
    pool = null;
    console.warn(`MySQL indisponible, démarrage en mode mémoire : ${error.message}`);
    return false;
  }
}

async function ensureColumn(table, column, definition) {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?', [process.env.DB_NAME, table, column]);
  if (!rows[0].total) await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

async function seedIfEmpty() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM projects');
  if (row.total) return;
  const [p] = await pool.query('INSERT INTO projects (title, description) VALUES (?, ?)', ['Première histoire', 'Une conversation à rebondissements.']);
  const [c] = await pool.query('INSERT INTO conversations (project_id, title, theme) VALUES (?, ?, ?)', [p.insertId, 'Le message de minuit', 'messenger']);
  await pool.query('INSERT INTO participants (conversation_id, name, avatar, participant_key) VALUES (?, ?, ?, ?), (?, ?, ?, ?)', [c.insertId, 'Lina', '', 'a', c.insertId, 'Noah', '', 'b']);
  await pool.query('INSERT INTO messages (conversation_id, sender, content, position, message_time) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)', [c.insertId, 'a', 'Tu es encore réveillé ?', 0, '23:48', c.insertId, 'b', 'Il faut que je te dise quelque chose…', 1, '23:49']);
}

async function seedCharactersIfEmpty() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM characters');
  if (row.total) return;
  await pool.query('INSERT INTO characters (name,description,color,fictional_age) VALUES (?,?,?,?),(?,?,?,?),(?,?,?,?)', ['Sara','Une amie loyale qui garde un secret.','#a67cff',24,'Ali','Calme en apparence, très protecteur.','#48b5a3',26,'Maman','Au cœur des histoires familiales.','#e9a46a',null]);
}
