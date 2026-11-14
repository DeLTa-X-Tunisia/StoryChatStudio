const cast = [
  { name: 'Sara', description: 'Une amie qui a gardé un secret trop longtemps.', color: '#a67cff', fictional_age: 24 },
  { name: 'Noah', description: 'Son ami d’enfance, direct et protecteur.', color: '#48b5a3', fictional_age: 26 },
  { name: 'Lina', description: 'Une jeune femme observatrice et déterminée.', color: '#e887a5', fictional_age: 22 },
  { name: 'Ali', description: 'Un frère calme qui cache son inquiétude.', color: '#e6a85c', fictional_age: 27 }
];
const beats = [
  ['Tu es réveillé ?', 'Oui. Pourquoi tu m’écris à cette heure-là ?', 'J’ai trouvé quelque chose dans le vieux téléphone de maman.', 'Qu’est-ce que tu racontes ?', 'Une photo. La date est d’hier… mais elle a disparu il y a dix ans.'],
  ['Je ne voulais pas te le dire par message.', 'Maintenant que tu as commencé, tu vas devoir finir.', 'Promets-moi de ne pas appeler papa.', 'Sara, tu me fais peur.', 'J’ai entendu sa voix dans le message vocal.'],
  ['Attends… c’est impossible.', 'Écoute jusqu’au bout.', '« Si tu as trouvé cette photo, c’est que je n’ai pas réussi à rentrer. »', 'Qui a enregistré ça ?', 'Je crois que c’est moi. Mais j’avais six ans.'],
  ['On devrait aller voir la maison.', 'Il est presque minuit.', 'Justement. La lumière vient de s’allumer.', 'Tu es devant chez moi ?', 'Non. Je suis devant la maison de grand-mère.'],
  ['La porte est ouverte.', 'N’entre surtout pas.', 'Il y a quelqu’un à l’intérieur.', 'Sors de là, maintenant.', 'La personne vient de m’envoyer un message.'],
  ['Qu’est-ce qu’elle a écrit ?', '« Tu as enfin compris. »', 'Sara, pars tout de suite.', 'C’est trop tard, la porte vient de se refermer.', 'Alors regarde derrière toi.'],
  ['Je ne comprends rien.', 'Tu te souviens de la nuit où maman est partie ?', 'Tu m’as toujours dit qu’elle était partie seule.', 'C’est ce que papa nous a demandé de croire.', 'Et si elle n’était jamais partie ?'],
  ['J’entends des pas.', 'Reste au téléphone avec moi.', 'Quelqu’un vient de prononcer mon prénom.', 'Ne te retourne pas.', 'C’est la voix de maman.'],
  ['Elle est là ?', 'Je vois une silhouette dans le couloir.', 'Demande-lui ce qui s’est passé.', 'Je n’arrive pas à parler.', 'Elle tient la même photo que moi.'],
  ['Elle vient de sourire.', 'Qu’est-ce qu’elle te dit ?', '« Vous auriez dû oublier. »', 'Sara, cours !', 'Le message vient d’arriver sur mon téléphone…'],
  ['Il dit : « ne lui fais pas confiance ».', 'À qui ?', 'À la personne qui est avec toi.', 'Je suis seule dans la maison.', 'Alors pourquoi je te vois sur la caméra ?'],
  ['La caméra du couloir est allumée ?', 'Elle a été débranchée il y a des années.', 'Je viens de recevoir une image en direct.', 'On y voit quoi ?', 'Moi, devant la porte. Mais je suis dehors.'],
  ['Quelqu’un a dû pirater le système.', 'Regarde la date du fichier.', 'Le fichier date de demain.', 'C’est une blague, c’est ça ?', 'Sur la photo, tu portes la chemise que tu as mise aujourd’hui.'],
  ['Je viens de retrouver le journal de maman.', 'Lis la dernière page.', '« Si Sara revient, donne-lui la clé bleue. »', 'Tu as une clé bleue ?', 'Papa en garde une dans son bureau.'],
  ['Je suis dans le bureau.', 'Ne touche à rien.', 'Il y a une boîte sous le plancher.', 'Tu l’ouvres ?', 'Il y a nos deux bracelets de naissance.'],
  ['Nos bracelets ?', 'Il y a aussi une troisième photo.', 'On dirait une petite fille.', 'C’est qui ?', 'La date derrière la photo est le jour de ma naissance.'],
  ['Sara, il faut que je te dise la vérité.', 'Tu savais qu’il y avait une autre enfant ?', 'Papa m’a fait promettre de ne jamais en parler.', 'Pourquoi tu ne m’as rien dit ?', 'Parce qu’il m’a dit que c’était toi.'],
  ['Moi ? Mais je suis là.', 'C’est ce que je croyais aussi.', 'Quelqu’un vient de sonner.', 'N’ouvre pas.', 'La personne dit qu’elle s’appelle Sara.'],
  ['Je regarde par le judas.', 'Qu’est-ce que tu vois ?', 'C’est la fille de la photo.', 'Ça n’a aucun sens.', 'Elle ressemble exactement à moi.'],
  ['Elle tient le téléphone de maman.', 'Demande-lui ce qu’elle veut.', 'Elle dit qu’elle veut rentrer chez elle.', 'Et elle est où, chez elle ?', 'Elle vient de regarder derrière moi.'],
  ['Noah, reste avec moi.', 'Je suis là. Dis-moi ce qui se passe.', 'Le miroir vient de s’allumer.', 'Qu’est-ce qu’il affiche ?', 'Une photo de nous trois.'],
  ['Il y a trois enfants sur cette photo.', 'Au dos, il y a un message.', '« Cette fois, ne choisissez personne. »', 'Choisir entre qui et qui ?', 'Les lumières viennent de s’éteindre.'],
  ['Je viens de recevoir un message de maman.', 'Elle était censée être partie.', 'Le message dit : « ne laisse entrer que l’un de vous ».', 'Qui est à la porte maintenant ?', 'Nous deux.'],
];
const parseJson = text => { const start=text.indexOf('{'); const end=text.lastIndexOf('}'); if(start<0||end<start) throw new Error('Le provider IA n’a pas renvoyé de JSON valide.'); return JSON.parse(text.slice(start,end+1)); };
const promptFor = options => `Écris en français une conversation fictive crédible, naturelle, partageable sur TikTok. Sujet: ${options.genre}. Ton: ${options.style}. Longueur: exactement ${options.messageCount} messages. Intensité/durée: ${options.duration}. Chaque message doit être court comme un vrai SMS. Les indices doivent monter progressivement et la dernière ligne doit être un cliffhanger satisfaisant. Retourne uniquement un JSON valide avec title, description, characters:{a:{name,description,color,fictional_age},b:{...}}, messages:[{sender:"a"|"b",content,message_type:"message",delivery_status:"seen"|"delivered"|"sent",reaction?:"❤️"}].`;

export const storyProviders = {
  demo: async options => {
    const n=Number(options.messageCount)||20; const messages=[];
    for(let i=0;i<n;i++){const line=beats[Math.floor(i/5)%beats.length][i%5];const clockMinutes=23*60+40+Math.floor(i/2);const clock=((clockMinutes%1440)+1440)%1440;messages.push({sender:i%2?'b':'a',content:line,message_type:'message',delivery_status:'seen',message_time:`${String(Math.floor(clock/60)).padStart(2,'0')}:${String(clock%60).padStart(2,'0')}`,metadata:{date_label:clockMinutes>=1440?'tomorrow':'today'}});}
    return {title:`${options.genre||'Le secret'} — après minuit`,description:`Une histoire ${String(options.style||'réaliste').toLowerCase()} en ${n} messages.`,characters:{a:cast[0],b:cast[1]},messages};
  },
  openai: async options => {
    if(!process.env.OPENAI_API_KEY) throw new Error('Ajoutez OPENAI_API_KEY dans backend/.env pour utiliser OpenAI.');
    const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',messages:[{role:'system',content:'Tu es scénariste de conversations courtes. Réponds uniquement en JSON strict.'},{role:'user',content:promptFor(options)}],response_format:{type:'json_object'}})});
    if(!response.ok) throw new Error(`OpenAI a répondu ${response.status}.`); return parseJson((await response.json()).choices[0].message.content);
  },
  ollama: async options => {
    const response=await fetch(`${process.env.OLLAMA_URL||'http://localhost:11434'}/api/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OLLAMA_MODEL||'llama3.1',prompt:promptFor(options),stream:false,format:'json'})});
    if(!response.ok) throw new Error('Ollama est indisponible.'); return parseJson((await response.json()).response);
  },
  local: async options => {
    const endpoint=process.env.LOCAL_AI_URL||'http://localhost:8000/generate';
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(process.env.LOCAL_AI_TOKEN?{Authorization:`Bearer ${process.env.LOCAL_AI_TOKEN}`}:{})},body:JSON.stringify({prompt:promptFor(options),options})});
    if(!response.ok) throw new Error(`L’API locale a répondu ${response.status}.`); const result=await response.json(); return result.story||result;
  }
};

export async function generateStory(options={}) {
  const provider=storyProviders[options.provider||'demo'];
  if(!provider) throw new Error('Provider IA inconnu.');
  const result=await provider(options);
  if(!Array.isArray(result.messages)||result.messages.length===0) throw new Error('Le provider n’a renvoyé aucun message.');
  const messages=result.messages.slice(0,Number(options.messageCount)||100).map((m,i)=>({...m,sender:m.sender==='b'?'b':'a',content:String(m.content||''),message_type:m.message_type||'message',delivery_status:m.delivery_status||'seen',position:i,appearance_ms:Number(options.appearanceMs)||1400,duration_ms:Number(m.duration_ms)||1000}));
  return {title:result.title||'Nouvelle histoire',description:result.description||'',characters:result.characters||{a:cast[0],b:cast[1]},messages,provider:options.provider||'demo'};
}
