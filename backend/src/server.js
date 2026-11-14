import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as store from './store.js';
import { connectDatabase, dbMode } from './db.js';
import { generateStory } from './services/storyGenerator.js';
import * as exportJobs from './exportJobs.js';
import { listVoiceProviders, VOICEOVER_CONTRACT } from './services/voiceProviders.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const uploadDir = path.join(root, 'uploads'); fs.mkdirSync(uploadDir, { recursive: true });
const app = express(); app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' })); app.use(express.json({ limit: '5mb' })); app.use('/uploads', express.static(uploadDir));
const exportsDir = path.join(root, 'exports'); fs.mkdirSync(exportsDir, { recursive: true }); app.use('/exports', express.static(exportsDir));
const upload = multer({ dest: uploadDir, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter: (_, file, cb) => cb(null, /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime)|audio\/(mpeg|mp4|wav|ogg|webm))$/.test(file.mimetype)) });
const asyncRoute = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const notFound = (res, what) => res.status(404).json({ error: `${what} introuvable.` });

app.get('/api/health', (_,res) => res.json({ status: 'ok', database: dbMode }));
app.get('/api/projects', asyncRoute(async (_,res) => res.json(await store.listProjects())));
app.post('/api/projects', asyncRoute(async (req,res) => { if (!req.body.title?.trim()) return res.status(400).json({error:'Le titre est obligatoire.'}); res.status(201).json(await store.createProject(req.body)); }));
app.get('/api/projects/:id', asyncRoute(async (req,res) => { const p=await store.getProject(req.params.id); return p ? res.json(p) : notFound(res,'Projet'); }));
app.put('/api/projects/:id', asyncRoute(async (req,res) => { const p=await store.updateProject(req.params.id,req.body); return p ? res.json(p) : notFound(res,'Projet'); }));
app.delete('/api/projects/:id', asyncRoute(async (req,res) => { await store.deleteProject(req.params.id); res.status(204).end(); }));
app.get('/api/conversations', asyncRoute(async (req,res) => res.json(await store.listConversations(req.query.project_id))));
app.post('/api/conversations', asyncRoute(async (req,res) => {
  if (!req.body.title?.trim() || !req.body.project_id) return res.status(400).json({error:'Titre et projet sont obligatoires.'});
  if (Object.hasOwn(req.body,'messages') && !Array.isArray(req.body.messages)) return res.status(400).json({error:'Les messages doivent être une liste.'});
  if (Object.hasOwn(req.body,'participants') && !Array.isArray(req.body.participants)) return res.status(400).json({error:'Les participants doivent être une liste.'});
  res.status(201).json(await store.createConversation(req.body));
}));
app.get('/api/conversations/:id', asyncRoute(async (req,res) => { const c=await store.getConversation(req.params.id); return c ? res.json(c) : notFound(res,'Conversation'); }));
app.put('/api/conversations/:id', asyncRoute(async (req,res) => {
  if (Object.hasOwn(req.body, 'messages')) {
    if (!Array.isArray(req.body.messages) || !Array.isArray(req.body.participants)) return res.status(400).json({error:'Les messages et participants doivent être des listes.'});
    const state=await store.saveConversationState(req.params.id,req.body);
    return state ? res.json(state) : notFound(res,'Conversation');
  }
  const c=await store.updateConversation(req.params.id,req.body);
  return c ? res.json(c) : notFound(res,'Conversation');
}));
app.delete('/api/conversations/:id', asyncRoute(async (req,res) => { await store.deleteConversation(req.params.id); res.status(204).end(); }));
app.get('/api/messages', asyncRoute(async (req,res) => res.json(await store.listMessages(req.query.conversation_id))));
app.post('/api/messages', asyncRoute(async (req,res) => { if (!req.body.conversation_id) return res.status(400).json({error:'conversation_id est obligatoire.'}); res.status(201).json(await store.createMessage(req.body)); }));
app.put('/api/messages/:id', asyncRoute(async (req,res) => { const m=await store.updateMessage(req.params.id,req.body); return m ? res.json(m) : notFound(res,'Message'); }));
app.delete('/api/messages/:id', asyncRoute(async (req,res) => { await store.deleteMessage(req.params.id); res.status(204).end(); }));
app.post('/api/uploads', upload.single('image'), (req,res) => { if (!req.file) return res.status(400).json({error:'Média invalide.'}); const ext = path.extname(req.file.originalname).replace(/[^.a-zA-Z0-9]/g,'').slice(0,8) || '.media'; const dest = `${req.file.path}${ext}`; fs.renameSync(req.file.path,dest); res.status(201).json({ url: `/uploads/${path.basename(dest)}` }); });
app.post('/api/generate-story', asyncRoute(async (req,res) => res.json(await generateStory(req.body))));
app.get('/api/characters', asyncRoute(async (_,res)=>res.json(await store.listCharacters())));
app.post('/api/characters', asyncRoute(async (req,res)=>{if(!req.body.name?.trim())return res.status(400).json({error:'Le nom du personnage est obligatoire.'});res.status(201).json(await store.createCharacter(req.body));}));
app.put('/api/characters/:id', asyncRoute(async (req,res)=>{const c=await store.updateCharacter(req.params.id,req.body);return c?res.json(c):notFound(res,'Personnage');}));
app.delete('/api/characters/:id', asyncRoute(async (req,res)=>{await store.deleteCharacter(req.params.id);res.status(204).end();}));
app.get('/api/voice/providers', (_,res)=>res.json({providers:listVoiceProviders(),contract:VOICEOVER_CONTRACT}));
app.post('/api/exports', asyncRoute(async (req,res)=>{if(!Array.isArray(req.body.messages))return res.status(400).json({error:'La timeline de messages est obligatoire.'});const job=exportJobs.startExportJob(req.body);res.status(202).json({id:job.id,status:job.status,progress:job.progress});}));
app.get('/api/exports/:id', asyncRoute(async (req,res)=>{const job=exportJobs.getExportJob(req.params.id);return job?res.json(job):res.json({id:req.params.id,status:'failed',progress:0,error:'Ce rendu a été interrompu ou perdu après un redémarrage du serveur. Relancez l’export.'});}));
app.use((err,_,res,__ ) => { console.error(err); res.status(err.statusCode || 500).json({ error: err.message || 'Erreur serveur.' }); });
await connectDatabase();
const port = Number(process.env.PORT || 4000); app.listen(port, () => console.log(`StoryChat API : http://localhost:${port}`));
