import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const memoryPath = path.resolve(currentDir, '../.data/store-memory.json');

const defaultState = {
  ids: { project: 1, conversation: 1, message: 2, character: 3 },
  projects: [{ id: 1, title: 'Première histoire', description: 'Une conversation à rebondissements.', created_at: new Date().toISOString() }],
  conversations: [{ id: 1, project_id: 1, title: 'Le message de minuit', theme: 'messenger', created_at: new Date().toISOString(), participants: [{ name: 'Lina', avatar: '', participant_key: 'a' }, { name: 'Noah', avatar: '', participant_key: 'b' }] }],
  messages: [{ id: 1, conversation_id: 1, sender: 'a', content: 'Tu es encore réveillé ?', position: 0, message_time: '23:48' }, { id: 2, conversation_id: 1, sender: 'b', content: 'Il faut que je te dise quelque chose…', position: 1, message_time: '23:49' }],
  characters: [
    { id: 1, name: 'Sara', avatar: '', description: 'Une amie loyale qui garde un secret.', color: '#a67cff', fictional_age: 24 },
    { id: 2, name: 'Ali', avatar: '', description: 'Calme en apparence, très protecteur.', color: '#48b5a3', fictional_age: 26 },
    { id: 3, name: 'Maman', avatar: '', description: 'Au cœur des histoires familiales.', color: '#e9a46a', fictional_age: null }
  ]
};

let memory = null;
let memoryLoad = null;
let memoryWriteQueue = Promise.resolve();

async function ensureMemoryState() {
  if (memory) return memory;
  if (!memoryLoad) {
    memoryLoad = (async () => {
      await fs.mkdir(path.dirname(memoryPath), { recursive: true });
      try {
        const parsed = JSON.parse(await fs.readFile(memoryPath, 'utf8'));
        memory = {
          ids: { ...defaultState.ids, ...(parsed.ids || {}) },
          projects: Array.isArray(parsed.projects) ? parsed.projects : structuredClone(defaultState.projects),
          conversations: Array.isArray(parsed.conversations) ? parsed.conversations : structuredClone(defaultState.conversations),
          messages: Array.isArray(parsed.messages) ? parsed.messages : structuredClone(defaultState.messages),
          characters: Array.isArray(parsed.characters) ? parsed.characters : structuredClone(defaultState.characters),
        };
      } catch (error) {
        if (error.code !== 'ENOENT') throw new Error(`Impossible de charger le stockage mémoire (${memoryPath}): ${error.message}`, { cause: error });
        const initialState = structuredClone(defaultState);
        await writeMemoryState(initialState);
        memory = initialState;
      }
      return memory;
    })().catch(error => {
      memoryLoad = null;
      throw error;
    });
  }
  return memoryLoad;
}

async function writeMemoryState(state) {
  const temporaryPath = `${memoryPath}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporaryPath, JSON.stringify(state, null, 2), 'utf8');
    await fs.rename(temporaryPath, memoryPath);
  } catch (error) {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
    throw new Error(`Impossible d'enregistrer le stockage mémoire (${memoryPath}): ${error.message}`, { cause: error });
  }
}

function mutateMemory(mutator) {
  const operation = memoryWriteQueue.then(async () => {
    const current = await ensureMemoryState();
    const next = structuredClone(current);
    const result = await mutator(next);
    await writeMemoryState(next);
    memory = next;
    return result;
  });
  memoryWriteQueue = operation.catch(() => {});
  return operation;
}

function nextMemoryId(state, entity) {
  const collection = state[entity === 'project' ? 'projects' : entity === 'conversation' ? 'conversations' : entity === 'message' ? 'messages' : 'characters'];
  const nextId = Math.max(Number(state.ids[entity]) || 0, ...collection.map(item => Number(item.id) || 0)) + 1;
  state.ids[entity] = nextId;
  return nextId;
}

const isDb = () => Boolean(pool);
const parseJson = r => ({ ...r, participants: typeof r.participants === 'string' ? JSON.parse(r.participants) : (r.participants || []) });
const messageFields = ['sender', 'content', 'image', 'position', 'message_time', 'message_type', 'delivery_status', 'reaction', 'appearance_ms', 'duration_ms', 'metadata'];
const messageTypes = new Set(['message', 'typing', 'reaction', 'seen', 'user_blocked', 'call_audio_missed', 'call_video_missed', 'call_audio_accepted', 'call_video_accepted', 'call_audio_refused', 'call_video_refused', 'deleted', 'edited', 'photo', 'video', 'voice']);
const deliveryStatuses = new Set(['sending', 'sent', 'delivered', 'seen']);
const conversationThemes = new Set(['messenger', 'whatsapp', 'instagram', 'sms', 'telegram']);
const inputError = message => Object.assign(new Error(message), { statusCode: 400 });
function validateConversationFields(data, creating = false) {
  if ((creating || Object.hasOwn(data, 'title')) && (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 180)) {
    throw inputError('Le titre de la conversation est invalide.');
  }
  if ((creating || Object.hasOwn(data, 'project_id')) && (!Number.isInteger(Number(data.project_id)) || Number(data.project_id) <= 0)) {
    throw inputError('Le projet de la conversation est invalide.');
  }
  if (Object.hasOwn(data, 'theme') && !conversationThemes.has(data.theme)) throw inputError('Le thème de la conversation est invalide.');
  if (Object.hasOwn(data, 'description') && data.description !== null && typeof data.description !== 'string') throw inputError('La description de la conversation est invalide.');
}
function normalizeMessage(data, conversationId, position) {
  const message = {
    conversation_id: Number(conversationId),
    sender: data.sender || 'a',
    content: data.content ?? '',
    image: data.image || '',
    position: Number(position),
    message_time: data.message_time || null,
    message_type: data.message_type || 'message',
    delivery_status: data.delivery_status || 'seen',
    reaction: data.reaction || null,
    appearance_ms: Number(data.appearance_ms ?? 1400),
    duration_ms: Number(data.duration_ms ?? 1000),
    metadata: data.metadata ?? null,
  };
  if (!['a', 'b'].includes(message.sender) || typeof message.content !== 'string' || typeof message.image !== 'string'
    || !messageTypes.has(message.message_type) || !deliveryStatuses.has(message.delivery_status)
    || !Number.isInteger(message.position) || message.position < 0
    || !Number.isInteger(message.appearance_ms) || message.appearance_ms < 0
    || !Number.isInteger(message.duration_ms) || message.duration_ms < 0
    || (message.message_time !== null && (typeof message.message_time !== 'string' || message.message_time.length > 12))
    || (message.reaction !== null && (typeof message.reaction !== 'string' || message.reaction.length > 16))
    || (message.metadata !== null && typeof message.metadata !== 'object')) {
    throw inputError('Les données du message sont invalides.');
  }
  return message;
}
const canonicalJson = value => JSON.stringify(value, (key, item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
  return Object.fromEntries(Object.keys(item).sort().map(objectKey => [objectKey, item[objectKey]]));
});
const normalizedMetadata = value => typeof value === 'string' ? JSON.parse(value) : value;
const sameMessage = (current, next) => messageFields.every(field => field === 'metadata'
  ? canonicalJson(normalizedMetadata(current[field] ?? null)) === canonicalJson(next[field] ?? null)
  : (current[field] ?? null) === (next[field] ?? null));
function normalizeParticipants(participants = []) {
  const keyed = participants.map((participant, index) => ({
    ...participant,
    participant_key: participant.participant_key || (index ? 'b' : 'a'),
  }));
  const keys = new Set();
  for (const participant of keyed) {
    if (!['a', 'b'].includes(participant.participant_key) || keys.has(participant.participant_key)) {
      throw inputError('Les participants doivent avoir des clés uniques « a » ou « b ».');
    }
    if (typeof participant.name !== 'string' || !participant.name.trim() || participant.name.length > 100
      || typeof (participant.avatar || '') !== 'string' || (participant.avatar || '').length > 500) {
      throw inputError('Les données du participant sont invalides.');
    }
    keys.add(participant.participant_key);
  }
  return keyed;
}

async function syncParticipants(query, conversationId, participants) {
  const keyed = normalizeParticipants(participants || []);
  for (const participant of keyed) {
    await query(
      'INSERT INTO participants (conversation_id,name,avatar,character_id,participant_key) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),avatar=VALUES(avatar),character_id=VALUES(character_id)',
      [conversationId, participant.name, participant.avatar || '', participant.character_id || null, participant.participant_key],
    );
  }
  if (!keyed.length) {
    await query('DELETE FROM participants WHERE conversation_id=?', [conversationId]);
  } else {
    const placeholders = keyed.map(() => '?').join(',');
    await query(`DELETE FROM participants WHERE conversation_id=? AND participant_key NOT IN (${placeholders})`, [conversationId, ...keyed.map(participant => participant.participant_key)]);
  }
  return keyed;
}

export async function listProjects() {
  if (!isDb()) {
    const state = await ensureMemoryState();
    return state.projects.map(p => ({ ...p, conversation_count: state.conversations.filter(c => c.project_id === p.id).length, message_count: state.messages.filter(m => state.conversations.some(c => c.id === m.conversation_id && c.project_id === p.id)).length }));
  }
  const [rows] = await pool.query('SELECT p.*, COUNT(DISTINCT c.id) conversation_count, COUNT(DISTINCT m.id) message_count FROM projects p LEFT JOIN conversations c ON c.project_id=p.id LEFT JOIN messages m ON m.conversation_id=c.id GROUP BY p.id ORDER BY p.created_at DESC');
  return rows;
}

export async function createProject(data) {
  if (!isDb()) {
    return mutateMemory(state => {
      const project = { id: nextMemoryId(state, 'project'), title: data.title, description: data.description || '', created_at: new Date().toISOString() };
      state.projects.unshift(project);
      return project;
    });
  }
  const [r] = await pool.query('INSERT INTO projects (title,description) VALUES (?,?)', [data.title, data.description || '']);
  return { id: r.insertId, ...data };
}

export async function updateProject(id, data) {
  if (!isDb()) {
    return mutateMemory(state => {
      const project = state.projects.find(item => item.id === Number(id));
      if (!project) return null;
      for (const key of ['title', 'description']) {
        if (Object.hasOwn(data, key)) project[key] = data[key];
      }
      return project;
    });
  }
  const fields = ['title', 'description'].filter(key => Object.hasOwn(data, key));
  if (fields.length) await pool.query(`UPDATE projects SET ${fields.map(key => `${key}=?`).join(',')} WHERE id=?`, [...fields.map(key => data[key]), id]);
  return getProject(id);
}

export async function getProject(id) {
  if (!isDb()) {
    const state = await ensureMemoryState();
    return state.projects.find(p => p.id === Number(id)) || null;
  }
  const [r] = await pool.query('SELECT * FROM projects WHERE id=?', [id]);
  return r[0] || null;
}

export async function deleteProject(id) {
  if (!isDb()) {
    return mutateMemory(state => {
      state.projects = state.projects.filter(project => project.id !== Number(id));
      const conversationIds = state.conversations.filter(conversation => conversation.project_id === Number(id)).map(conversation => conversation.id);
      state.conversations = state.conversations.filter(conversation => conversation.project_id !== Number(id));
      state.messages = state.messages.filter(message => !conversationIds.includes(message.conversation_id));
    });
  }
  await pool.query('DELETE FROM projects WHERE id=?', [id]);
}

export async function listConversations(projectId) {
  if (!isDb()) {
    const state = await ensureMemoryState();
    return state.conversations.filter(c => !projectId || c.project_id === Number(projectId));
  }
  const [rows] = await pool.query(`SELECT c.*, (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',p.id,'name',p.name,'avatar',p.avatar,'character_id',p.character_id,'participant_key',p.participant_key,'color',ch.color,'fictional_age',ch.fictional_age,'voice_provider',ch.voice_provider,'voice_id',ch.voice_id)) FROM participants p LEFT JOIN characters ch ON ch.id=p.character_id WHERE p.conversation_id=c.id) participants FROM conversations c ${projectId ? 'WHERE c.project_id=?' : ''} ORDER BY c.created_at DESC`, projectId ? [projectId] : []);
  return rows.map(parseJson);
}

export async function getConversation(id) {
  const c = (await listConversations()).find(x => x.id === Number(id));
  return c || null;
}

export async function createConversation(data) {
  validateConversationFields(data, true);
  const input = data.participants || [{ name: data.userA || 'Utilisateur A', avatar: data.avatarA || '', participant_key: 'a' }, { name: data.userB || 'Utilisateur B', avatar: data.avatarB || '', participant_key: 'b' }];
  const parts = normalizeParticipants(input);
  const initialMessages = Array.isArray(data.messages) ? data.messages : [];
  if (!isDb()) {
    return mutateMemory(state => {
      const conversation = { id: nextMemoryId(state, 'conversation'), project_id: Number(data.project_id), title: data.title, description: data.description || '', theme: data.theme || 'messenger', created_at: new Date().toISOString(), participants: parts };
      state.conversations.unshift(conversation);
      initialMessages.forEach((message, position) => state.messages.push({
        id: nextMemoryId(state, 'message'),
        ...normalizeMessage(message, conversation.id, position),
      }));
      return conversation;
    });
  }
  const connection = await pool.getConnection();
  let id;
  try {
    await connection.beginTransaction();
    const [result] = await connection.query('INSERT INTO conversations (project_id,title,description,theme) VALUES (?,?,?,?)', [data.project_id, data.title, data.description || '', data.theme || 'messenger']);
    id = result.insertId;
    await syncParticipants(connection.query.bind(connection), id, parts);
    for (const [position, messageData] of initialMessages.entries()) {
      const message = normalizeMessage(messageData, id, position);
      await connection.query(
        'INSERT INTO messages (conversation_id,sender,content,image,position,message_time,message_type,delivery_status,reaction,appearance_ms,duration_ms,metadata) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [id, message.sender, message.content, message.image, message.position, message.message_time, message.message_type, message.delivery_status, message.reaction, message.appearance_ms, message.duration_ms, message.metadata === null ? null : JSON.stringify(message.metadata)],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getConversation(id);
}

export async function updateConversation(id, data) {
  validateConversationFields(data);
  if (!isDb()) {
    return mutateMemory(state => {
      const conversation = state.conversations.find(item => item.id === Number(id));
      if (!conversation) return null;
      for (const key of ['title', 'description', 'theme', 'project_id']) {
        if (Object.hasOwn(data, key)) conversation[key] = data[key];
      }
      if (Array.isArray(data.participants)) conversation.participants = normalizeParticipants(data.participants);
      return conversation;
    });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query('SELECT id FROM conversations WHERE id=? FOR UPDATE', [id]);
    if (!rows.length) {
      await connection.rollback();
      return null;
    }
    const fields = ['title', 'description', 'theme', 'project_id'].filter(key => Object.hasOwn(data, key));
    if (fields.length) await connection.query(`UPDATE conversations SET ${fields.map(key => `${key}=?`).join(',')} WHERE id=?`, [...fields.map(key => data[key]), id]);
    if (Array.isArray(data.participants)) await syncParticipants(connection.query.bind(connection), id, data.participants);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getConversation(id);
}

export async function saveConversationState(id, data) {
  validateConversationFields(data);
  if (!Array.isArray(data.messages) || !Array.isArray(data.participants)) {
    throw inputError('La sauvegarde exige les listes complètes des messages et participants.');
  }
  const incomingMessages = data.messages.map((message, index) => ({
    ...normalizeMessage(message, id, index),
    id: message.id ?? null,
    _client_key: message._client_key || null,
  }));
  const messageIds = incomingMessages.filter(message => message.id !== null).map(message => String(message.id));
  if (new Set(messageIds).size !== messageIds.length) throw inputError('La sauvegarde contient des identifiants de message dupliqués.');
  const clientKeys = incomingMessages.filter(message => message._client_key).map(message => message._client_key);
  if (new Set(clientKeys).size !== clientKeys.length) throw inputError('La sauvegarde contient des clés de message dupliquées.');
  const participants = normalizeParticipants(data.participants);

  if (!isDb()) {
    return mutateMemory(state => {
      const conversation = state.conversations.find(item => item.id === Number(id));
      if (!conversation) return null;
      for (const key of ['title', 'description', 'theme', 'project_id']) {
        if (Object.hasOwn(data, key)) conversation[key] = data[key];
      }
      conversation.participants = participants;
      const currentMessages = state.messages.filter(message => message.conversation_id === Number(id));
      const currentById = new Map(currentMessages.map(message => [String(message.id), message]));
      const retained = [];
      const savedMessages = incomingMessages.map(message => {
        const existing = message.id === null ? null : currentById.get(String(message.id));
        if (message.id !== null && !existing) {
          const error = new Error(`Le message ${message.id} n’appartient pas à cette conversation.`);
          error.statusCode = 409;
          throw error;
        }
        const saved = {
          ...(existing || {}),
          ...message,
          id: existing?.id ?? nextMemoryId(state, 'message'),
        };
        const { _client_key, ...stored } = saved;
        retained.push(stored);
        return { ...stored, _client_key };
      });
      state.messages = state.messages.filter(message => message.conversation_id !== Number(id)).concat(retained);
      return { conversation, messages: savedMessages };
    });
  }

  const connection = await pool.getConnection();
  let savedMessages;
  try {
    await connection.beginTransaction();
    const [conversations] = await connection.query('SELECT id FROM conversations WHERE id=? FOR UPDATE', [id]);
    if (!conversations.length) {
      await connection.rollback();
      return null;
    }
    const fields = ['title', 'description', 'theme', 'project_id'].filter(key => Object.hasOwn(data, key));
    if (fields.length) await connection.query(`UPDATE conversations SET ${fields.map(key => `${key}=?`).join(',')} WHERE id=?`, [...fields.map(key => data[key]), id]);
    await syncParticipants(connection.query.bind(connection), id, participants);
    const [currentRows] = await connection.query('SELECT * FROM messages WHERE conversation_id=?', [id]);
    const currentById = new Map(currentRows.map(message => [String(message.id), message]));
    const retainedIds = new Set();
    savedMessages = [];

    for (const message of incomingMessages) {
      let saved;
      if (message.id !== null) {
        const existing = currentById.get(String(message.id));
        if (!existing) {
          const error = new Error(`Le message ${message.id} n’appartient pas à cette conversation.`);
          error.statusCode = 409;
          throw error;
        }
        retainedIds.add(String(existing.id));
        if (sameMessage(existing, message)) {
          saved = { ...existing };
        } else {
          const values = messageFields.map(field => field === 'metadata' && message[field] !== null ? JSON.stringify(message[field]) : message[field]);
          await connection.query(`UPDATE messages SET ${messageFields.join(',')} WHERE id=? AND conversation_id=?`, [...values, existing.id, id]);
          saved = { ...message, id: existing.id };
        }
      } else {
        const values = messageFields.map(field => field === 'metadata' && message[field] !== null ? JSON.stringify(message[field]) : message[field]);
        const [result] = await connection.query(`INSERT INTO messages (conversation_id,${messageFields.join(',')}) VALUES (${messageFields.map(() => '?').join(',')})`, [id, ...values]);
        saved = { ...message, id: result.insertId };
        retainedIds.add(String(result.insertId));
      }
      savedMessages.push({ ...saved, _client_key: message._client_key });
    }

    const deletedIds = currentRows.filter(message => !retainedIds.has(String(message.id))).map(message => message.id);
    if (deletedIds.length) {
      const placeholders = deletedIds.map(() => '?').join(',');
      await connection.query(`DELETE FROM messages WHERE conversation_id=? AND id IN (${placeholders})`, [id, ...deletedIds]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return { conversation: await getConversation(id), messages: savedMessages };
}

export async function deleteConversation(id) {
  if (!isDb()) {
    return mutateMemory(state => {
      state.conversations = state.conversations.filter(conversation => conversation.id !== Number(id));
      state.messages = state.messages.filter(message => message.conversation_id !== Number(id));
    });
  }
  await pool.query('DELETE FROM conversations WHERE id=?', [id]);
}

export async function listMessages(conversationId) {
  if (!isDb()) {
    const state = await ensureMemoryState();
    return state.messages.filter(m => !conversationId || m.conversation_id === Number(conversationId)).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }
  const [rows] = await pool.query(`SELECT * FROM messages ${conversationId ? 'WHERE conversation_id=?' : ''} ORDER BY position,id`, conversationId ? [conversationId] : []);
  return rows;
}

export async function createMessage(data) {
  if (!isDb()) {
    return mutateMemory(state => {
      const message = {
        id: nextMemoryId(state, 'message'),
        ...normalizeMessage(data, data.conversation_id, Number(data.position ?? state.messages.filter(item => item.conversation_id === Number(data.conversation_id)).length)),
      };
      state.messages.push(message);
      return message;
    });
  }
  const message = normalizeMessage(data, data.conversation_id, Number(data.position ?? 0));
  const [r] = await pool.query('INSERT INTO messages (conversation_id,sender,content,image,position,message_time,message_type,delivery_status,reaction,appearance_ms,duration_ms,metadata) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [message.conversation_id, message.sender, message.content, message.image, message.position, message.message_time, message.message_type, message.delivery_status, message.reaction, message.appearance_ms, message.duration_ms, message.metadata === null ? null : JSON.stringify(message.metadata)]);
  const [rows] = await pool.query('SELECT * FROM messages WHERE id=?', [r.insertId]);
  return rows[0];
}

export async function updateMessage(id, data) {
  if (!isDb()) {
    return mutateMemory(state => {
      const message = state.messages.find(item => item.id === Number(id));
      if (!message) return null;
      for (const key of messageFields) {
        if (Object.hasOwn(data, key)) message[key] = data[key];
      }
      return message;
    });
  }
  const fields = messageFields.filter(key => Object.hasOwn(data, key));
  if (fields.length) {
    const values = fields.map(key => key === 'metadata' && data[key] !== null ? JSON.stringify(data[key]) : data[key]);
    await pool.query(`UPDATE messages SET ${fields.map(key => `${key}=?`).join(',')} WHERE id=?`, [...values, id]);
  }
  const [r] = await pool.query('SELECT * FROM messages WHERE id=?', [id]);
  return r[0] || null;
}

export async function deleteMessage(id) {
  if (!isDb()) {
    return mutateMemory(state => {
      state.messages = state.messages.filter(message => message.id !== Number(id));
    });
  }
  await pool.query('DELETE FROM messages WHERE id=?', [id]);
}

export async function listCharacters() {
  if (!isDb()) {
    const state = await ensureMemoryState();
    return state.characters;
  }
  const [rows] = await pool.query('SELECT * FROM characters ORDER BY name');
  return rows;
}

export async function createCharacter(data) {
  if (!isDb()) {
    return mutateMemory(state => {
      const character = { id: nextMemoryId(state, 'character'), name: data.name, avatar: data.avatar || '', description: data.description || '', color: data.color || '#8b7bff', fictional_age: data.fictional_age || null, voice_provider: data.voice_provider || null, voice_id: data.voice_id || null };
      state.characters.push(character);
      return character;
    });
  }
  const [result] = await pool.query('INSERT INTO characters (name,avatar,description,color,fictional_age,voice_provider,voice_id) VALUES (?,?,?,?,?,?,?)', [data.name, data.avatar || '', data.description || '', data.color || '#8b7bff', data.fictional_age || null, data.voice_provider || null, data.voice_id || null]);
  const [rows] = await pool.query('SELECT * FROM characters WHERE id=?', [result.insertId]);
  return rows[0];
}

export async function updateCharacter(id, data) {
  if (!isDb()) {
    return mutateMemory(state => {
      const character = state.characters.find(item => item.id === Number(id));
      if (!character) return null;
      for (const key of ['name', 'avatar', 'description', 'color', 'fictional_age', 'voice_provider', 'voice_id']) {
        if (Object.hasOwn(data, key)) character[key] = data[key];
      }
      return character;
    });
  }
  const allowed = ['name', 'avatar', 'description', 'color', 'fictional_age', 'voice_provider', 'voice_id'];
  const fields = allowed.filter(key => Object.hasOwn(data, key));
  if (fields.length) await pool.query(`UPDATE characters SET ${fields.map(key => `${key}=?`).join(',')} WHERE id=?`, [...fields.map(key => data[key]), id]);
  const [rows] = await pool.query('SELECT * FROM characters WHERE id=?', [id]);
  return rows[0] || null;
}

export async function deleteCharacter(id) {
  if (!isDb()) {
    return mutateMemory(state => {
      state.characters = state.characters.filter(character => character.id !== Number(id));
    });
  }
  await pool.query('DELETE FROM characters WHERE id=?', [id]);
}
