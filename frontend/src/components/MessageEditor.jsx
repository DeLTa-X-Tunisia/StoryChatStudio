import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, ImagePlus, Plus, Trash2, GripVertical, Timer, Smile } from 'lucide-react';
import { imageUrl } from '../api.js';

const typeOptions=[['message','Message'],['typing','Typing Event'],['reaction','Réaction'],['seen','Vu'],['user_blocked','User Blocked'],['call_audio_missed','Appel audio manqué'],['call_video_missed','Appel vidéo manqué'],['call_audio_accepted','Appel audio accepté'],['call_video_accepted','Appel vidéo accepté'],['call_audio_refused','Appel audio refusé'],['call_video_refused','Appel vidéo refusé'],['deleted','Message supprimé'],['edited','Message modifié'],['photo','Envoi photo'],['video','Envoi vidéo'],['voice','Envoi vocal']];
export default function MessageEditor({ messages = [], participants = [], onAdd, onUpdate, onDelete, onMove, onDuplicate, onUpload, focusIndex = null, onFocusHandled }) {
  const [dragIndex,setDragIndex]=useState(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (focusIndex == null || focusIndex < 0 || focusIndex >= messages.length) return;
    const node = itemRefs.current[focusIndex];
    if (!node) return;
    const frame = requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const textarea = node.querySelector('textarea');
      const input = node.querySelector('.timeline-text');
      const field = textarea || input;
      if (field) {
        field.focus();
        if (typeof field.setSelectionRange === 'function') {
          const end = field.value.length;
          field.setSelectionRange(end, end);
        }
      }
      onFocusHandled?.();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusIndex, messages, onFocusHandled]);

  return <section className="editor-panel"><div className="section-head"><div><span className="eyebrow">TIMELINE ÉDITABLE · GLISSER POUR RÉORDONNER</span><h2>Conversation <small>{messages.length} éléments</small></h2></div><div className="timeline-add"><button className="secondary-button compact" onClick={()=>onAdd('typing')}>● ● ● Typing</button><button className="primary-button compact" onClick={()=>onAdd('message')}><Plus size={15}/> Message</button></div></div>
    <div className="message-list">{messages.map((m,i)=><article ref={el => { itemRefs.current[i] = el; }} className={`message-card timeline-card ${m.message_type==='typing'?'typing-card':''}`} key={m.clientKey || m.id || `draft-${i}`} draggable onDragStart={()=>setDragIndex(i)} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(dragIndex!==null&&dragIndex!==i)onMove(dragIndex,i-dragIndex);setDragIndex(null);}} onDragEnd={()=>setDragIndex(null)}>
      <div className="message-card-top"><span className="sender-pill"><GripVertical size={13}/><i className={m.sender==='b'?'sender-dot-b':''}/>{participants.find(p=>p.participant_key===m.sender)?.name || `Utilisateur ${m.sender.toUpperCase()}`}</span><div className="icon-actions"><button title="Monter" disabled={i===0} onClick={()=>onMove(i,-1)}><ArrowUp size={14}/></button><button title="Descendre" disabled={i===messages.length-1} onClick={()=>onMove(i,1)}><ArrowDown size={14}/></button><button title="Dupliquer" onClick={()=>onDuplicate(i)}><Copy size={14}/></button><button title="Supprimer" onClick={()=>onDelete(i)}><Trash2 size={14}/></button></div></div>
      <div className="timeline-fields"><label>Type<select value={m.message_type||'message'} onChange={e=>onUpdate(i,{message_type:e.target.value})}>{typeOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>Auteur<select value={m.sender} onChange={e=>onUpdate(i,{sender:e.target.value})}><option value="a">{participants.find(p=>p.participant_key==='a')?.name||'Utilisateur A'}</option><option value="b">{participants.find(p=>p.participant_key==='b')?.name||'Utilisateur B'}</option></select></label><label>Statut<select value={m.delivery_status||'seen'} onChange={e=>onUpdate(i,{delivery_status:e.target.value})}><option value="sending">Envoi…</option><option value="sent">Envoyé</option><option value="delivered">Distribué</option><option value="seen">Vu</option></select></label></div>
      {m.delivery_status==='seen'&&<select className="seen-label-select" aria-label="Affichage du statut Vu" value={m.metadata?.seen_label||'now'} onChange={e=>onUpdate(i,{metadata:{...m.metadata,seen_label:e.target.value}})}><option value="time">Vu à HH:mm</option><option value="now">Vu à l’instant</option><option value="minute">Vu il y a 1 minute</option><option value="five">Vu il y a 5 minutes</option><option value="yesterday">Vu hier</option></select>}
      {m.message_type==='user_blocked'&&<select className="seen-label-select" aria-label="Texte de blocage" value={m.metadata?.block_variant||(m.sender==='a'?'blocked_by_you':'blocked_by_contact')} onChange={e=>onUpdate(i,{metadata:{...m.metadata,block_variant:e.target.value}})}><option value="blocked_by_you">Vous avez bloqué ce contact</option><option value="blocked_by_contact">Le contact vous a bloqué</option><option value="cannot_message">Envoi de messages impossible</option></select>}
      {m.message_type==='typing'?<input className="timeline-text" value={m.metadata?.label||''} placeholder={`${participants.find(p=>p.participant_key===m.sender)?.name||'Contact'} est en train d’écrire…`} onChange={e=>onUpdate(i,{metadata:{...m.metadata,label:e.target.value}})}/>:<textarea rows="2" value={m.content ?? ''} placeholder={m.message_type==='deleted'?'Message supprimé':(m.message_type||'message').startsWith('call_')?'':`Écrire un ${m.message_type==='voice'?'message vocal':m.message_type==='video'?'envoi vidéo':'message'}…`} onChange={e=>onUpdate(i,{content:e.target.value})}/>}
      {m.image && <div className="attached-image"><img src={imageUrl(m.image)}/><button onClick={()=>onUpdate(i,{image:''})}>Retirer</button></div>}
      <div className="message-card-bottom"><label className="attach-button"><ImagePlus size={14}/> Média<input hidden type="file" accept="image/*,video/*,audio/*" onChange={e=>e.target.files[0]&&onUpload(i,e.target.files[0])}/></label><span className="reaction-picker"><Smile size={13}/><select aria-label="Réaction Messenger" value={m.reaction||''} onChange={e=>onUpdate(i,{reaction:e.target.value})}><option value="">Réaction</option>{['❤️','👍','😂','😮','😢','😡'].map(r=><option key={r}>{r}</option>)}</select></span><input className="time-input" aria-label="Heure du message" type="time" value={m.message_time||''} onChange={e=>onUpdate(i,{message_time:e.target.value})}/><select className="message-date-select" aria-label="Jour du message" value={m.metadata?.date_label||'today'} onChange={e=>onUpdate(i,{metadata:{...m.metadata,date_label:e.target.value}})}><option value="today">Aujourd’hui</option><option value="yesterday">Hier</option><option value="tomorrow">Demain</option><option value="monday">Lundi</option><option value="tuesday">Mardi</option><option value="wednesday">Mercredi</option><option value="thursday">Jeudi</option><option value="friday">Vendredi</option><option value="saturday">Samedi</option><option value="sunday">Dimanche</option></select></div>
      {m.message_type==='voice'&&<label className="voice-length-control">Durée vocale (s)<input type="number" min="1" max="600" value={m.metadata?.media_duration_s||12} onChange={e=>onUpdate(i,{metadata:{...m.metadata,media_duration_s:Number(e.target.value)}})}/></label>}
      <div className="timing-row"><label><Timer size={12}/> Apparition <input type="number" min="0" max="60000" step="100" value={m.appearance_ms??1400} onChange={e=>onUpdate(i,{appearance_ms:Number(e.target.value)})}/> ms</label><label>Durée <input type="number" min="100" max="60000" step="100" value={m.duration_ms??1000} onChange={e=>onUpdate(i,{duration_ms:Number(e.target.value)})}/> ms</label></div>
    </article>)}</div>
  </section>;
}
