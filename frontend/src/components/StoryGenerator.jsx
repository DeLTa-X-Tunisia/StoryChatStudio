import { useState } from 'react';
import { Bot, Sparkles, WandSparkles } from 'lucide-react';

const genres=['Amour','Amitié','Famille','Frère et sœur','Couple','Suspense','Horreur','Humour','Drame','Trahison','Secret de famille'];
export default function StoryGenerator({onGenerate,busy}){
  const [genre,setGenre]=useState('Suspense'),[duration,setDuration]=useState('moyenne'),[messageCount,setMessageCount]=useState(20),[style,setStyle]=useState('Viral TikTok'),[provider,setProvider]=useState('demo');
  const submit=e=>{e.preventDefault();onGenerate({genre,duration,messageCount:Number(messageCount),style,provider});};
  return <section className="feature-panel story-generator"><div className="feature-heading"><div className="feature-icon ai-icon"><WandSparkles size={22}/></div><div><span className="eyebrow">STORYCHAT AI STUDIO</span><h2>Générateur d’histoire IA</h2><p>Choisissez un angle. L’histoire, les personnages et les messages prennent forme ensemble.</p></div></div>
    <form onSubmit={submit} className="generator-form"><div className="generator-grid"><label>Genre de l’histoire<select value={genre} onChange={e=>setGenre(e.target.value)}>{genres.map(v=><option key={v}>{v}</option>)}</select></label><label>Durée<select value={duration} onChange={e=>setDuration(e.target.value)}><option value="courte">Courte</option><option value="moyenne">Moyenne</option><option value="longue">Longue</option></select></label><label>Nombre de messages<select value={messageCount} onChange={e=>setMessageCount(e.target.value)}>{[10,20,30,50,100].map(n=><option key={n} value={n}>{n} messages</option>)}</select></label><label>Style narratif<select value={style} onChange={e=>setStyle(e.target.value)}>{['Émotionnel','Dramatique','Réaliste','Suspense','Viral TikTok'].map(v=><option key={v}>{v}</option>)}</select></label></div>
      <div className="provider-picker"><span>PROVIDER IA</span>{[['demo','Démo locale'],['ollama','Ollama'],['openai','OpenAI'],['local','API locale']].map(([key,label])=><button type="button" onClick={()=>setProvider(key)} className={provider===key?'selected':''} key={key}>{label}</button>)}</div>
      <div className="provider-note"><Bot size={16}/><span>{provider==='demo'?'Fonctionne immédiatement, sans clé API.':provider==='openai'?'Nécessite OPENAI_API_KEY dans backend/.env.':provider==='ollama'?'Utilise votre instance Ollama locale.':'Envoie la requête à LOCAL_AI_URL.'}</span></div>
      <button className="primary-button generate-button" disabled={busy}><Sparkles size={17}/>{busy?'Création de votre histoire…':'Générer l’histoire'}<span>→</span></button>
    </form>
  </section>;
}
