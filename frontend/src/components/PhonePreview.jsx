import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, MoreHorizontal, Phone, Video, Wifi } from 'lucide-react';
import { imageUrl } from '../api.js';
import GoogleSearchPreview from './GoogleSearchPreview.jsx';

const initials = name => (name || '?').slice(0,1).toUpperCase();
const dateLabels={
  today:"Aujourd’hui",yesterday:'Hier',tomorrow:'Demain',monday:'Lundi',tuesday:'Mardi',wednesday:'Mercredi',thursday:'Jeudi',friday:'Vendredi',saturday:'Samedi',sunday:'Dimanche',
};
const legacyDateKeys={
  "aujourd'hui":'today',"aujourd’hui":'today',today:'today',oggi:'today',hoje:'today','el youm':'today',lyoum:'today',lyouma:'today','النهارده':'today',
  hier:'yesterday',yesterday:'yesterday',ieri:'yesterday',ontem:'yesterday',embare7:'yesterday',lbare7:'yesterday','امبارح':'yesterday',
  demain:'tomorrow',tomorrow:'tomorrow',domani:'tomorrow','amanha':'tomorrow',ghodwa:'tomorrow',gheda:'tomorrow','بكرة':'tomorrow',
  lundi:'monday',monday:'monday','lunedi':'monday','segunda-feira':'monday',ethnin:'monday',ltnin:'monday','الاثنين':'monday',
  mardi:'tuesday',tuesday:'tuesday','martedi':'tuesday','terca-feira':'tuesday',thletha:'tuesday',tletha:'tuesday',tlat:'tuesday','الثلاثاء':'tuesday',
  mercredi:'wednesday',wednesday:'wednesday','mercoledi':'wednesday','quarta-feira':'wednesday',larba3:'wednesday','الأربعاء':'wednesday',
  jeudi:'thursday',thursday:'thursday','giovedi':'thursday','quinta-feira':'thursday',khmis:'thursday',lkhamis:'thursday',lkhmis:'thursday','الخميس':'thursday',
  vendredi:'friday',friday:'friday','venerdi':'friday','sexta-feira':'friday',jom3a:'friday','الجمعة':'friday',
  samedi:'saturday',saturday:'saturday','sabato':'saturday','sabado':'saturday',sebt:'saturday','السبت':'saturday',
  dimanche:'sunday',sunday:'sunday','domenica':'sunday','domingo':'sunday','a7ad':'sunday','l7ed':'sunday','الأحد':'sunday',
};
const dateText=value=>{
  const key=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  return dateLabels[legacyDateKeys[key]||key]||dateLabels.today;
};
const statusLabels={
  seenAt:'Vu à',seenNow:'Vu à l’instant',seenMinute:'Vu il y a 1 min',seenFive:'Vu il y a 5 min',seenYesterday:'Vu hier',sending:'Envoi…',sent:'✓ Envoyé',delivered:'✓✓ Distribué',
};
const timeMinutes=value=>{if(!value)return null;const [h,m]=value.split(':').map(Number);return Number.isFinite(h)&&Number.isFinite(m)?h*60+m:null;};

function VoiceBubble({src,seconds=12,phase=0,deterministic=false}){
  const audioRef=useRef(null);const [playing,setPlaying]=useState(false);const [progress,setProgress]=useState(0);
  const toggle=async()=>{const node=audioRef.current;if(!node){setPlaying(v=>!v);return;}if(node.paused){try{await node.play();setPlaying(true);}catch{setPlaying(false);}}else{node.pause();setPlaying(false);}};
  return <div className={`voice-bubble ${playing?'is-playing':''}`}><button className="voice-play" onClick={toggle} aria-label={playing?'Pause du message vocal':'Écouter le message vocal'}>{playing?'Ⅱ':'▶'}</button><div className="voice-wave" aria-label="Forme d’onde vocale">{Array.from({length:25},(_,i)=><i key={i} style={{height:`${5+((i*17+9)%13)}px`,animationDelay:`${i*22}ms`,...(deterministic?{animation:'none',transform:`scaleY(${.48+Math.abs(Math.sin(phase*4+i))*.52})`}:{})}}/>)}</div><span className="voice-duration">{`0:${String(Math.max(1,Math.round(seconds))).padStart(2,'0')}`}</span>{src&&<audio ref={audioRef} preload="metadata" src={imageUrl(src)} onTimeUpdate={e=>setProgress(e.currentTarget.currentTime/(e.currentTarget.duration||1))} onEnded={()=>{setPlaying(false);setProgress(0);}} style={{display:'none'}}/>}<span className="voice-progress" style={{width:`${progress*100}%`}}/></div>;
}

export default function PhonePreview({ conversation={}, participants=[], messages=[], visibleCount=0, theme='messenger', typing=false, statusOverrides={}, ultraRealistic=true, messengerAppearance='light', googleSearchAppearance='light', renderAtMs=null, renderMode='phone-mockup', publicBaseUrl, deterministic=false, shake=0, className='', idPrefix='', forceScrollToEnd=false }) {
  const canvasRef=useRef(null);
  const a=participants.find(p=>p.participant_key==='a')||{name:'Utilisateur A'};
  const b=participants.find(p=>p.participant_key==='b')||{name:'Utilisateur B'};
  const style={messenger:{shell:'messenger-screen',out:'bubble-out',in:'bubble-in',bar:'messenger-bar'},whatsapp:{shell:'whatsapp-screen',out:'bubble-wa-out',in:'bubble-wa-in',bar:'whatsapp-bar'},instagram:{shell:'instagram-screen',out:'bubble-ig-out',in:'bubble-ig-in',bar:'instagram-bar'},sms:{shell:'sms-screen',out:'bubble-sms-out',in:'bubble-sms-in',bar:'sms-bar'},telegram:{shell:'telegram-screen',out:'bubble-tg-out',in:'bubble-tg-in',bar:'telegram-bar'}}[theme]||{};
  let visible=messages.slice(0,visibleCount);
  if(renderAtMs!==null){
    let low=0,high=messages.length;
    while(low<high){const middle=Math.floor((low+high)/2);if((messages[middle].startMs||0)<=renderAtMs)low=middle+1;else high=middle;}
    visible=messages.slice(0,low).filter(message=>message.message_type!=='typing'||renderAtMs<(message.startMs||0)+(Number(message.duration_ms)||1000));
  }
  const isMessenger=theme==='messenger';
  const scrollAnimationFrame=deterministic&&renderAtMs!==null&&renderMode==='screen-recording'?renderAtMs:null;
  useLayoutEffect(()=>{if((renderAtMs===null&&!forceScrollToEnd)||!canvasRef.current)return;const canvas=canvasRef.current;const target=Math.max(0,canvas.scrollHeight-canvas.clientHeight);if(scrollAnimationFrame!==null){const latest=visible.at(-1);const since=renderAtMs-(latest?.startMs||0);const progress=Math.max(0,Math.min(1,since/420));const eased=1-(1-progress)*(1-progress);canvas.scrollTop=target*eased;}else canvas.scrollTop=target;},[scrollAnimationFrame,visible.length,deterministic,renderMode,forceScrollToEnd]);
  const lastOutgoingIndex=visible.reduce((found,m,i)=>m.sender==='a'&&!['typing','reaction','seen','user_blocked'].includes(m.message_type)?i:found,-1);
  const getStatus=(m,i)=>{
    const override=statusOverrides[m.id||i];
    if(override)return override;
    if(deterministic&&renderAtMs!==null&&m.sender==='a'&&m.message_type!=='typing'&&renderAtMs>=(m.startMs||0)){
      const age=renderAtMs-(m.startMs||0);
      const progressed=age<500?'sending':age<1000?'sent':age<1500?'delivered':'seen';
      const order=['sending','sent','delivered','seen'];
      return order[Math.min(order.indexOf(progressed),Math.max(0,order.indexOf(m.delivery_status||'seen')))];
    }
    return m.delivery_status;
  };
  const lastReadIndex=visible.reduce((found,m,i)=>m.sender==='a'&&m.message_type!=='user_blocked'&&getStatus(m,i)==='seen'?i:found,-1);
  const nextSenderByIndex=new Array(visible.length);
  let nextNonTypingSender=null;
  for(let i=visible.length-1;i>=0;i--){
    nextSenderByIndex[i]=nextNonTypingSender;
    if(visible[i].message_type!=='typing')nextNonTypingSender=visible[i].sender;
  }
  const statusLabel=(status,m)=>status==='seen'?({time:`${statusLabels.seenAt} ${m.message_time||'HH:mm'}`,now:statusLabels.seenNow,minute:statusLabels.seenMinute,five:statusLabels.seenFive,yesterday:statusLabels.seenYesterday}[m.metadata?.seen_label||'now']):statusLabels[status]||'';
  const mediaSrc=value=>value?.startsWith('/uploads/')&&publicBaseUrl?`${publicBaseUrl}${value}`:imageUrl(value);
  const MotionDiv=deterministic?'div':motion.div;
  if(theme==='google-search')return <GoogleSearchPreview conversation={conversation} results={visible} idPrefix={idPrefix} className={className} deterministic={deterministic} renderMode={renderMode} shake={shake} appearance={googleSearchAppearance} publicBaseUrl={publicBaseUrl}/>;
  return <div lang={conversation.language||'fr'} className={`phone-frame ${className} ${deterministic?`remotion-phone-frame remotion-${renderMode}`:''}`} style={deterministic&&shake?{transform:`translate(${Math.sin(shake*.24)*1.15+Math.sin(shake*.71)*.35}px,${Math.sin(shake*.19)*.8}px) scale(4.5) scale(1.003)`}:undefined}><div id={idPrefix?`${idPrefix}-phone-screen`:'phone-screen'} className={`phone-screen ${style.shell} ${isMessenger?`messenger-appearance-${messengerAppearance}`:''} ${ultraRealistic&&isMessenger?'ultra-realistic-messenger':''}`}>
    {ultraRealistic&&isMessenger?<div className="android-camera" aria-hidden="true"/>:<div className="phone-notch" aria-hidden="true"><i/><span/></div>}
    <div className="statusbar"><span>9:41</span><div className="status-icons"><span className="signal-bars"><i/><i/><i/><i/></span><span className="network-label">5G</span><Wifi size={14}/><span className="battery-icon"><i/><b/></span></div></div>
    <header className={`chat-header ${style.bar}`}><button className="chat-back" aria-label="Retour"><ChevronLeft size={22}/></button><div className="contact-avatar">{b.avatar?<img src={mediaSrc(b.avatar)}/>:initials(b.name)}<i/></div><div className="contact-meta"><strong>{b.name}</strong><small>{isMessenger?'Actif(ve) à l’instant':'en ligne'}</small></div><div className="header-actions"><button aria-label="Appel audio"><Phone size={17}/></button><button aria-label="Appel vidéo"><Video size={18}/></button><button aria-label="Options"><MoreHorizontal size={19}/></button></div></header>
    <div className="chat-canvas" id={idPrefix?`${idPrefix}-chat-canvas`:'chat-canvas'} ref={canvasRef}>
      {visible.map((m,i)=>{const type=m.message_type||'message';const sender=participants.find(p=>p.participant_key===m.sender)||{name:'Contact'};const prev=visible[i-1];const nextSender=nextSenderByIndex[i];const dateLabel=m.metadata?.date_label||'today';const previousDate=prev?.metadata?.date_label||'today';const dateChanged=!prev||dateLabel!==previousDate;const minutes=timeMinutes(m.message_time);const previousMinutes=timeMinutes(prev?.message_time);const showTime=Boolean(m.message_time&&(dateChanged||!prev||previousMinutes===null||minutes===null||Math.abs(minutes-previousMinutes)>=5));const endIncomingGroup=m.sender==='b'&&type!=='typing'&&type!=='user_blocked'&&nextSender!=='b';const grouped=Boolean(prev&&prev.sender===m.sender&&!dateChanged);const status=getStatus(m,i);const special=type.startsWith('call_');const isLastOutgoing=i===lastOutgoingIndex;const isReadAvatar=i===lastReadIndex;const blockText={blocked_by_you:'Vous avez bloqué ce contact.',blocked_by_contact:`${sender.name} a bloqué ce contact.`,cannot_message:'Vous ne pouvez plus envoyer de messages à ce contact.'}[m.metadata?.block_variant||(m.sender==='a'?'blocked_by_you':'blocked_by_contact')];
        return <Fragment key={m.id||`new-${i}`}>
          {dateChanged&&<div className="date-separator" style={deterministic?{opacity:Math.max(0,Math.min(1,((renderAtMs-(m.startMs||0))/180)))}:undefined}>{dateText(dateLabel)}</div>}
          {showTime&&<div className="time-separator">{m.message_time}</div>}
          <MotionDiv {...(!deterministic?{layout:true,initial:{opacity:0,y:10,scale:.97},animate:{opacity:1,y:0,scale:1},exit:{opacity:0},transition:{type:'spring',stiffness:390,damping:30}}:{})} style={deterministic?(()=>{const progress=Math.max(0,Math.min(1,(renderAtMs-(m.startMs||0))/220));const eased=1-(1-progress)*(1-progress);return {opacity:eased,transform:`translateY(${(1-eased)*6}px) scale(${.98+eased*.02})`};})():undefined} className={`message-row ${m.sender==='a'?'sent':'received'} ${type} ${grouped?'grouped':''}`}>
            {m.sender==='b'&&type!=='typing'&&type!=='user_blocked'&&(endIncomingGroup?<div className="tiny-avatar">{sender.avatar?<img src={mediaSrc(sender.avatar)}/>:initials(sender.name)}<i className="avatar-presence"/></div>:<div className="tiny-avatar avatar-spacer"/>)}
            {type==='typing'?<div className="typing-row typing-event"><div className="typing-dots">{[0,1,2].map(n=><i key={n} style={deterministic?{animation:'none',opacity:.55+Math.sin((renderAtMs/100+n*5)/5)*.35,transform:`translateY(${Math.sin((renderAtMs/100+n*5)/5)*2}px)`}:undefined}/>)}</div><span>{m.metadata?.label||`${sender.name} est en train d’écrire…`}</span></div>:type==='user_blocked'?<div className="blocked-notice">{m.content||blockText}</div>:<div className={`message-bubble ${m.sender==='a'?style.out:style.in} ${special?'call-bubble':''}`}>
              {special?<div className={`call-content ${type.includes('missed')||type.includes('refused')?'call-failed':'call-success'}`}><span className="call-symbol">{type.includes('video')?<Video size={17}/>:<Phone size={17}/>}</span><span><b>{type.includes('video')?'Appel vidéo':'Appel audio'} {type.includes('missed')?'manqué':type.includes('refused')?'refusé':type.includes('accepted')?'accepté':''}</b><small>{type.includes('missed')||type.includes('refused')?'Appel non abouti':`${Math.round((m.duration_ms||12000)/1000)} s`}</small></span></div>:type==='deleted'?<i className="deleted-message">Vous avez supprimé un message</i>:type==='voice'?<VoiceBubble src={m.image} seconds={m.metadata?.media_duration_s||12} phase={renderAtMs/1000||0} deterministic={deterministic}/>:type==='video'?<video className="message-image" controls={!deterministic} src={mediaSrc(m.image)}/>:m.image?<img className="message-image" src={mediaSrc(m.image)}/>:null}
              {m.content&&<span>{m.content}</span>}{type==='edited'&&<small>Modifié</small>}{type==='seen'&&<small>Vu à {m.message_time||'l’instant'}</small>}
              {m.reaction&&<span className="message-reaction">{m.reaction}</span>}
            </div>}
          </MotionDiv>
          {isMessenger&&(isLastOutgoing||isReadAvatar)&&<div className="outgoing-receipt">{isLastOutgoing&&status&&statusLabel(status,m)}{isReadAvatar&&<span className="read-avatar-wrap">{b.avatar?<img className="read-avatar" src={mediaSrc(b.avatar)}/>:<span className="read-avatar read-avatar-fallback">{initials(b.name)}</span>}<i className="avatar-presence"/></span>}</div>}
        </Fragment>;
      })}
      {typing&&<MotionDiv {...(!deterministic?{initial:{opacity:0,y:5},animate:{opacity:1,y:0}}:{})} className="typing-row live-typing"><div className="typing-dots"><i/><i/><i/></div><span>{b.name} est en train d’écrire…</span></MotionDiv>}
    </div>
    <div className="composer-mock"><span>Message…</span><div>➤</div></div>
  </div></div>;
}
