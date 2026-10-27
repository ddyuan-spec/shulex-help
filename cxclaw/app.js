'use strict';

// Target: main agent -> ticket assistant -> ticket functions/skills -> main agent.
// These are local demo capability labels, not a live router or separate agents.
// No live Solvea endpoints, model APIs, callback, or messaging services are used.
const CX_ROUTES = Object.freeze({ summary:'ticket-summary', draft:'ticket-reply', polish:'ticket-polish', orders:'ticket-orders', question:'ticket-qa' });
const CX_ICONS = {
  panel:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M5.8 7h.3m-.3 3h.3"/>',
  ticket:'<path d="M4 5h16a1 1 0 0 1 1 1v4a2 2 0 0 0 0 4v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a2 2 0 0 0 0-4V6a1 1 0 0 1 1-1Z"/><path d="M9 8h6m-6 4h6m-6 4h5"/>',
  users:'<path d="M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3m17 0v-3a5 5 0 0 0-2-4m0-10a4 4 0 0 1 0 8"/><circle cx="9" cy="6" r="4"/>',
  user:'<circle cx="12" cy="6" r="4"/><path d="M3 21v-3a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6v3Z"/>',
  chart:'<rect x="3" y="3" width="18" height="15" rx="2"/><path d="M8 14v-4m4 4V7m4 7v-3m-4 7v3m-3 0h6"/>',
  outreach:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 8h6m-6 4h10m-10 4h7"/>',
  settings:'<path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 1 3h4l2-3 3-1 2-3-2-2 1-3-3-2-1-3Z"/><circle cx="10.5" cy="11.5" r="3"/>',
  desk:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M7 9h10m-8 4h6M12 2v3m-3 12h6"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 9h18M3 15h18"/>',
  book:'<path d="M6 3h14v18H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm0 0v14h14M3 18h17"/>',
  partner:'<path d="M7 5 5 3m12 2 2-2M5 8a7 7 0 0 1 14 0v6a7 7 0 0 1-14 0Z"/><path d="M3 10H1m22 0h-2M8 20l-1 2m9-2 1 2m-8-7a4 4 0 0 0 6 0"/><circle cx="9" cy="10" r=".6"/><circle cx="15" cy="10" r=".6"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-9 12h6"/>',
  alert:'<path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 7v6m0 4h.01"/>',
  error:'<circle cx="12" cy="12" r="10"/><path d="m8 8 8 8m-8 0 8-8"/>',
  search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
  sort:'<path d="M7 20V4m-4 4 4-4 4 4m6-4v16m-4-4 4 4 4-4"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>',
  all:'<path d="m4 4-2 8v8h20v-8l-2-8Zm-2 8h6l2 3h4l2-3h6M7 8h10"/>',
  bot:'<rect x="4" y="6" width="16" height="14" rx="4"/><path d="M12 2v4M1 11v5m22-5v5M8 16h8"/><circle cx="8" cy="11" r="1"/><circle cx="16" cy="11" r="1"/>',
  inbox:'<path d="M3 9 12 3l9 6v11H3Zm0 0 9 6 9-6"/>',
  pending:'<path d="M3 6h18v14H3Z"/><path d="m3 6 5 7h8l5-7m-13 11h8"/>',
  solved:'<path d="M3 8h18v13H3Zm4-5v9m10-9v9M7 17h10"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 5 9 7 9-7"/>',
  ad:'<path d="M5 3h14v4H5Zm-2 6h18v12H3Z"/><path d="m7 17 2-5 2 5m-3-1h2m4-4v5h2a2.5 2.5 0 0 0 0-5Z"/>',
  rows:'<path d="M5 5h14M5 12h14M5 19h14"/>',
  cards:'<path d="M4 4h6v16H4Zm11 0h5v6h-5Zm0 11h5v9h-5Z"/>',
  dots:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  history:'<path d="M3 4v6h6M3 10a9 9 0 1 1 1 7m8-12v7l4 3"/>',
  snooze:'<circle cx="12" cy="13" r="8"/><path d="m6 2-3 3m15-3 3 3M9 10h6l-6 6h6"/>',
  tag:'<path d="m3 5 14-2 5 8-11 11L2 12Z"/><path d="m7 8 5 5 5-5"/>',
  attach:'<path d="m20 11-9 9a5 5 0 0 1-7-7l10-10a3.5 3.5 0 0 1 5 5L9 18a2 2 0 0 1-3-3l9-9"/>',
  format:'<path d="m5 17 7-14 7 14M8 12h8M3 21h18"/>',
  copy:'<rect x="7" y="7" width="13" height="14" rx="2"/><path d="M16 7V3H3v13h4"/>',
  bolt:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="m13 5-5 8h5l-2 6 6-9h-5Z"/>',
  link:'<path d="m10 13 4-4m-5 8-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 8a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-2 2"/>',
  edit:'<path d="m14 4 5 5M3 21l5-1L21 7l-5-5L3 15Z"/>',
  summary:'<path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8m-8 4h6"/>',
  draft:'<path d="M13 3H5v18h14v-9M8 8h3m-3 4h3m-3 4h6m1-13 4 4m-6 2 7-7 3 3-7 7-4 1Z"/>',
  wand:'<path d="m4 20 10-10 4 4L8 24Zm10-10 3-3 4 4-3 3M5 2v6M2 5h6m13-4v4m-2-2h4M3 12v4m-2-2h4"/>',
  box:'<path d="m3 7 9-5 9 5v11l-9 5-9-5Zm0 0 9 5 9-5M12 12v11M8 4l9 5v5"/>',
  'arrow-up':'<path d="M12 20V4m-6 6 6-6 6 6"/>',
  transfer:'<path d="M4 5a5 5 0 1 1 8 5M2 13h7l4 4-4 4m-6-4h10M17 13h5m-3-3 3 3-3 3"/>',
  grid:'<rect x="2" y="2" width="8" height="8" rx="2"/><rect x="14" y="2" width="8" height="8" rx="2"/><rect x="2" y="14" width="8" height="8" rx="2"/><rect x="14" y="14" width="8" height="8" rx="2"/>',
  phone:'<path d="M3 2h5l2 6-3 2a16 16 0 0 0 7 7l2-3 6 2v5C11 25-1 13 3 2Z"/>',
};
const CX_ORIGINAL_ICONS = new Set(['ticket','users','chart','outreach','settings','all','bot','inbox','pending','solved','bell','ad','queue-mine','failed']);
const cxIcon = (name) => CX_ORIGINAL_ICONS.has(name) ? `<img class="icon original-icon" src="assets/icons/${name}.png" alt="" aria-hidden="true" width="20" height="20">` : `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${CX_ICONS[name] || CX_ICONS.ticket}</svg>`;
const cxEsc = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const cx$ = id => document.getElementById(id);
function cxHydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=cxIcon(el.dataset.icon);});}
function cxPlatform(channel){
  if(channel==='TikTok')return '<span class="platform-tiktok">♪</span>';
  if(channel==='Line')return '<span class="platform-line">LINE</span>';
  if(channel==='站内信')return '<span class="platform-shopify">♙</span>';
  if(channel==='Instagram')return '<span class="platform-instagram">◎</span>';
  if(channel==='eBay')return '<span class="platform-ebay">ebay</span>';
  if(channel==='Livechat')return '<span class="channel-livechat">≡</span>';
  return cxIcon(channel==='Email'?'mail':'rows');
}
const CX_QUEUES = [['all','全部','2580','all'],['ai','AI处理中','1383','bot'],['open','待处理','556','inbox'],['pending','处理中','302','pending'],['solved','已解决','335','solved'],['notifications','通知邮件','0','bell'],['ads','广告邮件','4','ad'],['mine','我的工单','0','queue-mine'],['failed','发送失败','0','failed']];
const CX_CHANNELS = [['站内信','0'],['Email','1482'],['Line','7'],['TikTok','41'],['Custom Ticket','70'],['Instagram','18'],['Livechat','206']];
const CX_TICKETS = [
  {id:1587,name:'TikTok narrow UAT',title:'TikTok Shop chat uat-narrow-20261...',fullTitle:'TikTok Shop chat uat-narrow-20261026',channel:'TikTok',time:'3h 34m',date:'昨天15:22',status:'open',shop:'Solvea',initial:'T',message:'{"order_id": "576926000000000008", "package_id": "9999999999999999999"}',order:{id:'576926000000000091',name:'TikTok order binding UAT 20261026',amount:'$12.34'}},
  {id:1586,name:'TikTok narrow UAT',title:'TikTok Shop chat uat-na...',fullTitle:'TikTok Shop chat uat-narrow-20261026',channel:'TikTok',time:'3h 34m',date:'昨天15:22',status:'open',shop:'Solvea',initial:'T',message:'{"order_id": "576926000000000008", "package_id": "9999999999999999999"}'},
  {id:1585,name:'TikTok scoped sync UAT',title:'TikTok Shop chat uat-bi...',fullTitle:'TikTok Shop chat uat-binding-20261026',channel:'TikTok',time:'1h 12m',date:'昨天13:00',status:'open',shop:'Solvea',initial:'T',message:null},
  {id:1584,name:'TikTok isolation UAT',title:'TikTok Shop chat uat-bi...',fullTitle:'TikTok Shop chat uat-binding-20261026',channel:'TikTok',time:'1h 12m',date:'昨天13:00',status:'open',shop:'Solvea',initial:'T',message:null},
  {id:1577,name:'TikTok component UAT',title:'',fullTitle:'TikTok component UAT',channel:'TikTok',time:'32m',date:'昨天12:47',status:'open',shop:'Solvea',initial:'T',unread:true,message:null},
  {id:1582,name:'Codex Touchpoint...',title:'Thank you. This is anoth...',fullTitle:'Communication with Codex Touchpoint',channel:'Livechat',time:'超时 18h 10m',date:'昨天12:39',status:'open',shop:'Solvea.cx',initial:'C',online:true,message:'Thank you. This is another test.'},
  {id:1575,name:'Codex Touchpoint Test',title:'[TEST] codex-touchpoi...',fullTitle:'[TEST] codex-touchpoint',channel:'Custom Ticket',time:'25m',date:'昨天12:38',status:'open',shop:'Solvea.cx',initial:'C',unread:true,message:null},
  {id:1590,name:'Preview-',title:'Communication with Preview-',fullTitle:'Communication with Preview-',channel:'Livechat',time:'4h 15m',date:'昨天15:22',status:'open',shop:'Solvea.cx',initial:'P',email:'preview-@shulex.com',online:true,message:'你好',collaboration:true,related:true},
  {id:1591,name:'Codex Touchpoint',title:'Communication with Codex Touchpoint',fullTitle:'Communication with Codex Touchpoint',channel:'Livechat',time:'4h 15m',date:'昨天15:22',status:'ai',shop:'Solvea.cx',initial:'C',online:true,message:null},
];
const CX_SESSION = Object.fromEntries(CX_TICKETS.map(t=>[t.id,{draft:'',aiInput:'',turns:[],messages:[],note:'',noteDraft:'',handler:'',snooze:'',attachment:'',busy:false,revision:0}]));
const cxParams = new URLSearchParams(location.search);
const cxState = {ticket:Number(cxParams.get('ticket'))===1590?1590:1587,layout:cxParams.get('layout')==='table'?'table':'card',tab:cxParams.get('tab')==='ai'?'ai':'details',queue:'open',channel:'',search:'',ascending:false,drawerOpen:true,noteMode:false};
let cxToastTimer, cxSnoozeChoice='';
function cxTicket(){return CX_TICKETS.find(t=>t.id===cxState.ticket);}
function cxSession(){return CX_SESSION[cxState.ticket];}
function cxToast(message){const el=cx$('toast');el.textContent=message;el.hidden=false;clearTimeout(cxToastTimer);cxToastTimer=setTimeout(()=>el.hidden=true,2600);}
function cxRenderQueue(){
  cx$('queue-items').innerHTML=CX_QUEUES.map(([key,label,count,icon])=>`<button class="queue-item ${cxState.queue===key&&!cxState.channel?'active':''}" data-queue="${key}"><span>${cxIcon(icon)}</span><span>${label}</span><span class="queue-count">${count}</span></button>`).join('');
  cx$('channel-items').innerHTML=CX_CHANNELS.map(([label,count])=>`<button class="queue-item ${cxState.channel===label?'active':''}" data-channel="${label}"><span class="channel-icon">${cxPlatform(label)}</span><span>${label}</span><span class="queue-count">${count}</span></button>`).join('');
}
function cxFilteredTickets(){
  let rows=CX_TICKETS.filter(t=>cxState.channel?t.channel===cxState.channel:cxState.queue==='all'||t.status===cxState.queue);
  if(cxState.search){let query=cxState.search.toLowerCase().replace(/^#/,'');rows=rows.filter(t=>`${t.id} ${t.name} ${t.fullTitle}`.toLowerCase().includes(query));}
  return cxState.ascending?[...rows].reverse():rows;
}
function cxStatus(t){return t.status==='ai'?'<span class="status-tag ai"><i></i>AI处理中</span>':t.status==='solved'?'<span class="status-tag solved"><i></i>已解决</span>':`<span class="status-tag ${t.online?'online':''}"><i></i>${t.online?'在线':'待处理'}</span>`;}
function cxRenderList(){
  const rows=cxFilteredTickets();
  document.body.classList.toggle('table-mode',cxState.layout==='table');
  cx$('card-layout').classList.toggle('active',cxState.layout==='card');
  cx$('table-layout').classList.toggle('active',cxState.layout==='table');
  cx$('card-layout').setAttribute('aria-pressed',cxState.layout==='card');
  cx$('table-layout').setAttribute('aria-pressed',cxState.layout==='table');
  cx$('ticket-workbench').classList.toggle('closed',!cxState.drawerOpen);
  if(cxState.layout==='card'){
    cx$('ticket-list-content').innerHTML=rows.length?rows.map(t=>`<button class="ticket-card ${t.id===cxState.ticket?'active':''}" data-ticket="${t.id}" aria-label="打开工单 #${t.id} ${cxEsc(t.name)}"><div class="ticket-card-heading">${t.online?'<span class="online-dot"></span><span>在线</span><span>｜</span>':''}<span class="person">${cxEsc(t.name)}</span><span class="ticket-number">#${t.id}</span>${t.unread?'<span class="ticket-unread"></span>':''}</div><div class="ticket-preview"><span class="new-ticket">新工单</span>${cxEsc(t.title)}</div><div class="ticket-card-footer"><span class="channel-icon">${cxPlatform(t.channel)}</span><span class="ticket-time ${t.time.includes('超时')?'ticket-overdue':t.time==='3h 34m'?'':'ticket-warning'}">${t.time}</span><span class="ticket-date">${t.date}</span></div></button>`).join(''):'<div class="empty-list">暂无工单</div>';
  }else{
    const tableRows=[...rows].sort((a,b)=>a.id===1590?-1:b.id===1590?1:0);
    cx$('ticket-list-content').innerHTML=`<div class="table-count">共${cxState.queue==='ai'?'1383':'557'} 条</div><table class="tickets-table"><thead><tr><th class="check-col"><input type="checkbox" aria-label="选择全部工单" id="select-all-tickets" ${cxState.queue==='ai'?'disabled':''}></th><th class="subject-col">主题</th><th class="number-col">工单编号</th><th class="status-col">状态</th><th class="handler-col">处理人</th><th>创建时间</th></tr></thead><tbody>${tableRows.map(t=>`<tr class="${t.id===cxState.ticket?'active':''}" data-ticket="${t.id}"><td class="check-col"><input type="checkbox" aria-label="选择工单 #${t.id}" ${t.status==='ai'?'disabled':''}></td><td class="ticket-subject"><button aria-label="打开工单 #${t.id} ${cxEsc(t.name)}"><span class="new-ticket">新工单</span>${cxEsc(t.fullTitle)}</button></td><td>#${t.id}</td><td>${cxStatus(t)}</td><td>${cxEsc(CX_SESSION[t.id].handler || t.shop)}</td><td>${t.date}</td></tr>`).join('')}</tbody></table>${tableRows.length?'':'<div class="empty-list">暂无工单</div>'}`;
  }
  cx$('mainArea').dataset.layout=cxState.layout;
}
function cxSelectTicket(id){
  if(!CX_SESSION[id])return;
  cxSession().draft=cx$('reply-editor').value;
  cxSession().noteDraft=cx$('customer-note-input')?.value || cxSession().noteDraft;
  cxState.ticket=id;cxState.drawerOpen=true;cxState.noteMode=false;
  cx$('action-menu').hidden=true;cx$('events-panel').hidden=true;
  cxRenderList();cxRenderTicket();
}
function cxRenderTicket(){
  const t=cxTicket(), session=cxSession();
  cx$('mainArea').dataset.ticket=t.id;
  cx$('ticket-title').textContent=t.fullTitle;
  cx$('ticket-title').title=t.fullTitle;
  cx$('ticket-assign').innerHTML=`${session.handler?cxEsc(session.handler):t.status==='ai'?'转人工':'分配'}<span>${cxIcon('chevron')}</span>`;
  cx$('ticket-meta').innerHTML=`${cxStatus(t)}<b>#${t.id}</b><span class="meta-rule"></span><span class="meta-timer">${t.time}</span><span class="meta-rule"></span><span class="meta-shop">${cxIcon('tag')}${cxEsc(t.shop)}</span>${t.channel==='Livechat'?`<span class="meta-rule"></span><span>${cxIcon('link')}</span><span class="meta-link">https://ai-stagi...</span>`:''}<span class="meta-rule"></span><span class="meta-tag">＋ 标签</span><button class="more-label" id="meta-more">更多</button>`;
  if(session.snooze)cx$('ticket-meta').insertAdjacentHTML('beforeend',`<span class="meta-tag" title="稍后处理">${cxEsc(session.snooze)}</span>`);
  cxRenderMessages();cxRenderComposer();cxRenderDetails();cxRenderPartner();cxSwitchTab(cxState.tab);
  cx$('context-toggle').setAttribute('aria-label',cxState.layout==='table'?'关闭工单':'收起工单详情');
}
function cxRenderMessages(){
  const t=cxTicket(),session=cxSession();
  const initial=t.message?`<div class="message"><div class="message-avatar ${t.online?'is-online':''}">${t.initial}</div><div class="message-main"><div class="message-name">${cxEsc(t.name)}<span class="channel-icon">${cxPlatform(t.channel)}</span></div><div class="message-content ${t.channel==='TikTok'?'code':''}">${cxEsc(t.message)}</div></div></div>`:'';
  const collaboration=t.collaboration?`<div class="conversation-block collaboration"><h3>${cxIcon('info')}人机协同</h3><p>你看看你同意吗</p><div class="rejected">${cxIcon('error')}已拒绝</div></div><div class="transfer-separator">${cxIcon('transfer')}AI转人工</div><div class="conversation-block ai-note"><b>AI</b>MANUAL_TO_AGENT</div>`:'';
  const sent=session.messages.map(m=>m.kind==='summary'?cxSummaryCard(m):`<div class="message sent-message"><div class="message-avatar">r</div><div class="message-main"><div class="message-name">rick.yuan${m.note?' · 备注':''}</div><div class="message-content">${cxEsc(m.text)}${m.attachment?`<div class="message-attachment">${cxEsc(m.attachment)}</div>`:''}</div></div></div>`).join('');
  cx$('conversation-messages').innerHTML=initial+collaboration+sent;
  if(session.messages.length)cx$('conversation-messages').scrollTop=cx$('conversation-messages').scrollHeight;
}
function cxSummaryCard(message){
  return `<article class="ticket-summary-card" aria-label="工单AI总结"><header><span class="ticket-summary-title"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.56 8.84 1.13 4.38H8.42z"/><path fill-rule="evenodd" d="M15.96 1H8.04q-1.48-.01-2.46.05a5 5 0 0 0-1.91.48 5 5 0 0 0-2.14 2.14 5 5 0 0 0-.48 1.91Q1 6.56 1 8.04v7.92q-.01 1.48.05 2.46a5 5 0 0 0 .48 1.91 5 5 0 0 0 2.14 2.14 5 5 0 0 0 1.91.48q.98.06 2.46.05h7.92q1.48.01 2.46-.05a5 5 0 0 0 1.91-.48 5 5 0 0 0 2.14-2.14 5 5 0 0 0 .48-1.91q.06-.98.05-2.46V8.04q.01-1.48-.05-2.46a5 5 0 0 0-.48-1.91 5 5 0 0 0-2.14-2.14 5 5 0 0 0-1.91-.48Q17.44 1 15.96 1M7.8 5.89h3.53l3.16 12.22h-2.52l-.63-2.44H7.79l-.64 2.44H4.63zM18.11 18.1V5.9h-2.44V18.1z" clip-rule="evenodd"/></svg>AI总结</span><time>${cxEsc(message.time)}</time></header><div class="ticket-summary-body"><p><strong>Emotion</strong><br>${cxEsc(message.emotion)}</p><p><strong>FinalSolution</strong><br>${cxEsc(message.solution)}</p><p><strong>Summary</strong><br>${cxEsc(message.text)}</p></div></article>`;
}
function cxRenderComposer(){
  const t=cxTicket(),session=cxSession();
  const channels=['Email','Livechat','Livechat','phone','amazon','站内信','walmart','eBay','TikTok','Rakuten','WhatsApp','Line'];
  cx$('composer-channels').innerHTML=channels.map((ch,index)=>`<span class="channel-item ${ch===t.channel&&(t.channel!=='Livechat'||index===1)?'selected':''}">${ch==='phone'?cxIcon('phone'):ch==='amazon'?'<b style="font:700 23px Georgia">a</b>':ch==='walmart'?'✳':ch==='Rakuten'?'<span style="font-size:5px">Rakuten</span>':ch==='WhatsApp'?cxIcon('phone'):cxPlatform(ch)}</span>`).join('')+`<span class="meta-rule"></span><button class="note-toggle" id="note-toggle" aria-pressed="${cxState.noteMode}">${cxIcon('edit')}备注</button><span class="recipient-name">${cxEsc(t.name)}</span><span class="editor-panel-icon">${cxIcon('panel')}</span>`;
  cx$('reply-editor').value=session.draft;
  cx$('reply-editor').placeholder=cxState.noteMode?'请输入备注':'请输入';
  cx$('attachment-name').textContent=session.attachment;
  cx$('attachment-name').hidden=!session.attachment;
  cx$('composer').hidden=t.status==='ai';cx$('agent-transfer-bar').hidden=t.status!=='ai';
  cxUpdateSendState();
}
function cxUpdateSendState(){const enabled=!!cx$('reply-editor').value.trim();cx$('send-reply').disabled=!enabled;cx$('send-options').disabled=!enabled;}
function cxRenderDetails(){
  const t=cxTicket(),session=cxSession();
  cx$('details-panel').innerHTML=`<details class="detail-section" open><summary>${cxIcon('user')}客户信息<span class="chevron">⌄</span></summary><div class="detail-body"><div class="customer-profile"><div class="customer-avatar">${t.initial}</div><div><div class="customer-name">${cxEsc(t.name)}</div>${t.email?`<div class="customer-email">${cxIcon('mail')}${cxEsc(t.email)}</div>`:''}</div></div><div class="customer-tags">${cxIcon('grid')}客户标签<span class="add-link">＋ 添加</span></div><label class="note-label" for="customer-note-input">备注</label><div class="customer-note"><textarea id="customer-note-input" placeholder="添加" aria-label="客户备注">${cxEsc(session.noteDraft||session.note)}</textarea><button id="save-customer-note" aria-label="保存客户备注" ${session.noteDraft&&session.noteDraft!==session.note?'':'disabled'}>${cxIcon('arrow-up')}</button></div><dl class="customer-fields"><dt>inqForm</dt><dd>-</dd><dt>CountryCode</dt><dd>-</dd><dt>SatisfactionUrl</dt><dd>${t.id===1587?'https://desk-staging...':'-'}</dd></dl>${t.related?`<div class="related-heading"><span>相关工单</span><b>33</b></div><button class="related-ticket" data-related="1113"><div class="related-ticket-top"><span class="status-tag"><i></i>待处理</span><span>#1113</span><small>09/22 11:15</small></div><div class="related-ticket-title">Communication with Preview-</div></button><button class="related-ticket blue-border" data-related="1119"><div class="related-ticket-top"><span class="status-tag solved"><i></i>已解决</span><span>#1119</span><small>09/22 11:24</small></div><div class="related-ticket-title">Communication with Preview-</div></button><button class="expand-related" id="expand-related">展开 ⌄</button><div id="related-expanded" hidden><div class="related-ticket"><div class="related-ticket-title">Communication with Preview-</div><div class="related-ticket-top">#1590 · 当前工单</div></div></div>`:''}</div></details><details class="detail-section" open><summary>${cxIcon('summary')}电商信息<span class="commerce-add">＋ 订单</span><span class="chevron">⌄</span></summary><div class="commerce-body">${t.order?`<div class="order-card"><div class="order-number"><span>⌄</span><span class="channel-icon">${cxPlatform('TikTok')}</span>${t.order.id}</div><div class="order-name">${t.order.name}</div><div class="order-amount">总金额: ${t.order.amount}</div></div>`:'<div class="commerce-empty">暂无订单</div>'}</div></details>`;
}
function cxSwitchTab(tab){
  cxState.tab=tab;
  const ai=tab==='ai';cx$('details-panel').hidden=ai;cx$('partner-panel').hidden=!ai;
  cx$('details-tab').setAttribute('aria-selected',!ai);cx$('partner-tab').setAttribute('aria-selected',ai);
  cx$('mainArea').dataset.tab=tab;
  if(ai)cx$('ai-conversation').scrollTop=cx$('ai-conversation').scrollHeight;
}
const CX_TOOL_LABELS={summary:'总结工单',draft:'草拟回复',polish:'AI润色',orders:'订单物流',question:'工单问答'};
const CX_AGENT_LABELS={summary:'工单总结',draft:'回复建议',polish:'回复润色',orders:'订单物流',question:'工单问答'};
function cxRenderPartner(){
  const t=cxTicket(),session=cxSession();
  cx$('ai-input').value=session.aiInput;
  cx$('ai-ticket-context').textContent='#'+t.id;
  cx$('ai-context-caption').textContent='#'+t.id+' · '+t.name;
  cx$('ai-conversation').innerHTML=session.turns.length?session.turns.map(turn=>`<article class="ai-turn" data-turn="${turn.id}" data-agent="${CX_ROUTES[turn.tool]}"><div class="ai-user-message">${cxEsc(turn.prompt)}</div><div class="ai-answer-heading">${cxIcon('partner')}cxclaw工单助手<span>· ${CX_AGENT_LABELS[turn.tool]}</span></div>${turn.pending?`<div class="ai-running"><span class="spinner"></span>正在${turn.tool==='question'?'查看当前工单':CX_TOOL_LABELS[turn.tool]}…</div>`:`<div class="ai-answer-body">${turn.html}</div><div class="ai-source">${cxEsc(turn.source)}</div><div class="ai-result-actions" ${turn.summary?'hidden':''}>${turn.draft?`<button class="apply-draft ${turn.applied?'applied':''}" data-apply="${turn.id}">${turn.applied?'已应用':'应用到编辑框'}</button>`:''}<button data-copy="${turn.id}">复制</button></div>`}</article>`).join(''):'<div class="ai-empty">随便问点关于这张工单的事——<br>回答会附上可用的依据。</div>';
  document.querySelectorAll('[data-tool]').forEach(el=>el.disabled=session.busy);
  cx$('ai-input').disabled=session.busy;
  cx$('ask-ai').disabled=session.busy||!cx$('ai-input').value.trim();
  cx$('ai-conversation').scrollTop=cx$('ai-conversation').scrollHeight;
}
function cxGenerateResult(tool,t,session,prompt){
  const source=`依据：工单 #${t.id}${t.message?' 会话记录':''}${t.order?'、已关联订单':''}。`;
  const base={source,draft:''};
  if(tool==='summary'){
    const facts=t.channel==='TikTok'&&t.message?['客户提供了订单号 576926000000000008。','包裹号为 9999999999999999999。',t.order?'已关联订单 576926000000000091，总金额 $12.34。':'当前没有已关联订单。','消息中的订单号与已关联订单需进一步核对；尚无物流轨迹。']:t.collaboration?['客户发送了“你好”。','人机协同请求“你看看你同意吗”已被拒绝。','已有 AI转人工及 MANUAL_TO_AGENT 记录。','等待人工进一步确认客户诉求。']:t.message?[`客户消息：${t.message}`,'当前仍需确认客户具体诉求。']:['当前工单没有可供总结的会话内容。'];
    const humanMessages=session.messages.filter(m=>m.kind!=='summary');
    return {...base,summary:{emotion:'待确认',solution:'待确认',text:facts.join('')+(humanMessages.length?`本次会话已追加 ${humanMessages.length} 条人工消息。`:'')},html:'<p>AI总结已添加到工单会话记录。</p>'};
  }
  if(tool==='draft'){
    const draft=t.collaboration?'您好，很高兴为您服务。请问有什么可以帮助您？':t.channel==='TikTok'&&t.message?'您好，已收到您提供的订单和包裹信息。为准确查询，请确认您需要查询的订单号；核对后我们会进一步协助您。':t.message?'您好，已收到您的消息。请问您具体需要哪方面的帮助？':'';
    return {...base,draft,html:draft?`<p>${cxEsc(draft)}</p>`:'<p>当前没有客户消息，请先确认客户诉求后再生成回复。</p>'};
  }
  if(tool==='polish'){
    const original=session.draft.trim();
    if(!original)return {...base,html:'<p>请先在左侧回复框输入需要润色的内容，再点击 AI润色。</p>'};
    let draft=original.replace(/\s+/g,' ').replace(/亲[，,]?/g,'您好，').replace(/马上/g,'尽快').replace(/查一下/g,'核查').replace(/稍等一下/g,'请稍等');
    if(!/^(您好|你好|Hello|Hi|Dear)/i.test(draft))draft='您好，'+draft;
    if(!/[。！？.!?]$/.test(draft))draft+='。';
    return {...base,source:'依据：当前编辑框草稿。',draft,html:`<p>${cxEsc(draft)}</p>`};
  }
  if(tool==='orders'){
    return {...base,html:t.order?`<p><strong>已关联订单</strong></p><p>${t.order.id}<br>${cxEsc(t.order.name)}<br>总金额：${t.order.amount}</p><p><strong>物流信息</strong></p><p>客户提供包裹号 9999999999999999999。当前未获取物流轨迹。</p><p>消息订单号与关联订单号不同，需先确认需要查询的订单。</p>`:'<p>当前工单没有已关联订单，暂时无法查询订单或物流。</p>'};
  }
  if(/物流|订单|包裹|快递/.test(prompt))return cxGenerateResult('orders',t,session,prompt);
  if(/总结|概括|摘要|发生了什么|诉求/.test(prompt))return cxGenerateResult('summary',t,session,prompt);
  if(/润色|改写|优化回复/.test(prompt))return cxGenerateResult('polish',t,session,prompt);
  if(/回复|怎么说|怎么答/.test(prompt))return cxGenerateResult('draft',t,session,prompt);
  return {...base,html:t.message?`<p>当前客户为 ${cxEsc(t.name)}，工单 #${t.id}。</p><p>${t.collaboration?'客户仅发送了“你好”，协同请求已被拒绝，并已转人工。':t.channel==='TikTok'?'会话中包含订单和包裹编号，尚未明确客户需要查询的问题。':`最近客户消息：“${cxEsc(t.message)}”。`}</p><p>现有记录不足以回答“${cxEsc(prompt)}”，需要补充相关信息。</p>`:'<p>当前没有足够的会话内容回答这个问题，请补充客户消息。</p>'};
}
function cxRunTool(tool,prompt){
  const t=cxTicket(),session=cxSession();if(session.busy)return;
  session.draft=cx$('reply-editor').value;
  const turn={id:Date.now()+'-'+session.turns.length,tool,prompt:prompt||CX_TOOL_LABELS[tool],pending:true,html:'',source:'',draft:''};
  session.turns.push(turn);session.busy=true;const revision=session.revision;
  const capturedDraft=session.draft;
  cxSwitchTab('ai');cxRenderPartner();
  setTimeout(()=>{
    if(session.revision!==revision)return;
    Object.assign(turn,cxGenerateResult(tool,t,{...session,draft:capturedDraft},turn.prompt),{pending:false});
    if(turn.summary){
      const now=new Date(),two=value=>String(value).padStart(2,'0');
      session.messages.push({kind:'summary',...turn.summary,time:`${two(now.getMonth()+1)}/${two(now.getDate())} ${two(now.getHours())}:${two(now.getMinutes())}`});
      if(cxState.ticket===t.id)cxRenderMessages();
    }
    session.busy=false;
    if(cxState.ticket===t.id)cxRenderPartner();
  },650);
}
function cxMenu(anchor,items){
  const menu=cx$('action-menu');
  const r=anchor.getBoundingClientRect();
  menu.innerHTML=items.map(([label,action])=>`<button data-menu-action="${action}">${cxEsc(label)}</button>`).join('');
  menu.hidden=false;
  menu.style.top=Math.min(r.bottom+5,innerHeight-220)+'px';menu.style.left=Math.min(r.right-160,innerWidth-200)+'px';
}
function cxSetLayout(layout){cxSession().draft=cx$('reply-editor').value;cxState.layout=layout;cxState.drawerOpen=true;cxRenderList();cxRenderTicket();}
function cxSendReply(){
  const text=cx$('reply-editor').value.trim();if(!text)return;
  const session=cxSession();session.messages.push({text,note:cxState.noteMode,attachment:session.attachment});session.draft='';session.attachment='';
  cxRenderMessages();cxRenderComposer();
  cxToast(cxState.noteMode?'备注已添加':'消息已添加到当前原型会话');
}

cxHydrateIcons();cxRenderQueue();cxRenderList();cxRenderTicket();
cx$('card-layout').addEventListener('click',()=>cxSetLayout('card'));
cx$('table-layout').addEventListener('click',()=>cxSetLayout('table'));
cx$('details-tab').addEventListener('click',()=>cxSwitchTab('details'));
cx$('partner-tab').addEventListener('click',()=>cxSwitchTab('ai'));
cx$('global-partner').addEventListener('click',()=>{cxState.drawerOpen=true;cx$('ticket-workbench').classList.remove('closed','context-collapsed');cxSwitchTab('ai');});
cx$('ticket-search').addEventListener('input',event=>{cxState.search=event.target.value;cxRenderList();});
cx$('search-wrap').querySelector('[data-icon]').addEventListener('click',()=>cx$('ticket-search').focus());
cx$('sort-tickets').addEventListener('click',()=>{cxState.ascending=!cxState.ascending;cxRenderList();});
cx$('ticket-list-content').addEventListener('click',event=>{
  if(event.target.matches('input[type=checkbox]')){
    if(event.target.id==='select-all-tickets')cx$('ticket-list-content').querySelectorAll('tbody input:not(:disabled)').forEach(input=>input.checked=event.target.checked);
    return;
  }
  const row=event.target.closest('[data-ticket]');if(row)cxSelectTicket(Number(row.dataset.ticket));
});
cx$('queue-items').addEventListener('click',event=>{
  const button=event.target.closest('[data-queue]');if(!button)return;
  cxState.queue=button.dataset.queue;cxState.channel='';cxState.search='';cx$('ticket-search').value='';
  cxRenderQueue();const matches=cxFilteredTickets();if(matches.length&&!matches.some(t=>t.id===cxState.ticket))cxSelectTicket(matches[0].id);cxRenderList();
});
cx$('channel-items').addEventListener('click',event=>{
  const button=event.target.closest('[data-channel]');if(!button)return;
  cxState.channel=button.dataset.channel;cxState.search='';cx$('ticket-search').value='';cxRenderQueue();const matches=cxFilteredTickets();if(matches.length)cxSelectTicket(matches[0].id);cxRenderList();
});
cx$('reply-editor').addEventListener('input',()=>{cxSession().draft=cx$('reply-editor').value;cxUpdateSendState();});
cx$('send-reply').addEventListener('click',cxSendReply);
cx$('send-options').addEventListener('click',event=>cxMenu(event.currentTarget,[['发送','send'],['发送并标记为已解决','send-solved']]));
cx$('composer-channels').addEventListener('click',event=>{if(event.target.closest('#note-toggle')){cxState.noteMode=!cxState.noteMode;cxSession().draft=cx$('reply-editor').value;cxRenderComposer();}});
cx$('format-reply').addEventListener('click',()=>{cx$('reply-editor').classList.toggle('editor-formatted');cx$('reply-editor').focus();});
cx$('paste-reply').addEventListener('click',()=>{cx$('reply-editor').focus();cxToast('按 Ctrl+V 粘贴到回复框');});
cx$('quick-reply').addEventListener('click',event=>cxMenu(event.currentTarget,[['您好，请问有什么可以帮助您？','quick-hello'],['感谢您的耐心等待。','quick-thanks']]));
cx$('insert-link').addEventListener('click',()=>{const editor=cx$('reply-editor');editor.setRangeText('https://',editor.selectionStart,editor.selectionEnd,'end');cxSession().draft=editor.value;cxUpdateSendState();editor.focus();});
cx$('attach-file').addEventListener('change',event=>{cxSession().attachment=event.target.files[0]?.name||'';cx$('attachment-name').textContent=cxSession().attachment;cx$('attachment-name').hidden=!cxSession().attachment;});
cx$('ticket-events').addEventListener('click',()=>cx$('events-panel').hidden=!cx$('events-panel').hidden);
cx$('close-events').addEventListener('click',()=>cx$('events-panel').hidden=true);
cx$('ticket-snooze').addEventListener('click',()=>{cxSnoozeChoice='';document.querySelectorAll('[data-snooze]').forEach(b=>b.classList.remove('active'));cx$('snooze-date').value='';cx$('snooze-dialog').showModal();});
document.querySelectorAll('[data-snooze]').forEach(button=>button.addEventListener('click',()=>{cxSnoozeChoice=button.dataset.snooze;document.querySelectorAll('[data-snooze]').forEach(b=>b.classList.toggle('active',b===button));}));
cx$('confirm-snooze').addEventListener('click',()=>{const time=cx$('snooze-date').value||cxSnoozeChoice;if(!time){cxToast('请选择稍后处理时间');return;}cxSession().snooze=time;cx$('snooze-dialog').close();cxRenderTicket();cxToast('已设为'+time+'处理');});
cx$('ticket-assign').addEventListener('click',event=>cxMenu(event.currentTarget,[['rick.yuan','assign-rick'],['AI - Solvea.cx','assign-ai']]));
cx$('agent-transfer').addEventListener('click',()=>{cxTicket().status='open';cxState.queue='open';cxRenderQueue();cxRenderList();cxRenderTicket();cxToast('已转入待处理');});
cx$('ticket-more').addEventListener('click',event=>cxMenu(event.currentTarget,[['转发','forward'],['标记为通知邮件','notification']]));
cx$('ticket-meta').addEventListener('click',event=>{if(event.target.id==='meta-more')cxMenu(event.target,[['事件','events'],['稍后处理','snooze']]);});
cx$('action-menu').addEventListener('click',event=>{
  const button=event.target.closest('[data-menu-action]');if(!button)return;cx$('action-menu').hidden=true;
  const action=button.dataset.menuAction;
  if(action==='assign-rick'||action==='assign-ai'){cxSession().handler=action==='assign-rick'?'rick.yuan':'AI - Solvea.cx';cxRenderTicket();cxRenderList();}
  else if(action.startsWith('quick-')){cx$('reply-editor').value=action==='quick-hello'?'您好，请问有什么可以帮助您？':'感谢您的耐心等待。';cxSession().draft=cx$('reply-editor').value;cxUpdateSendState();}
  else if(action==='send'||action==='send-solved'){cxSendReply();if(action==='send-solved'){cxTicket().status='solved';cxRenderTicket();cxRenderList();}}
  else if(action==='events'){cx$('events-panel').hidden=false;}
  else if(action==='snooze'){cx$('ticket-snooze').click();}
  else if(action==='forward'){cxState.noteMode=false;cx$('reply-editor').value='转发：\n'+(cxTicket().message||'');cxSession().draft=cx$('reply-editor').value;cxUpdateSendState();cx$('reply-editor').focus();}
  else if(action==='notification'){cxTicket().status='notifications';cxRenderList();cxToast('已标记为通知邮件');}
});
cx$('context-toggle').addEventListener('click',()=>{
  if(cxState.layout==='table'){cxState.drawerOpen=false;cx$('ticket-workbench').classList.add('closed');}
  else{cx$('ticket-workbench').classList.add('context-collapsed');const restore=document.createElement('button');restore.className='restore-context';restore.textContent='详情';restore.addEventListener('click',()=>{cx$('ticket-workbench').classList.remove('context-collapsed');restore.remove();});cx$('ticket-title').after(restore);}
});
cx$('details-panel').addEventListener('input',event=>{if(event.target.id==='customer-note-input'){cxSession().noteDraft=event.target.value;cx$('save-customer-note').disabled=event.target.value===cxSession().note;}});
cx$('details-panel').addEventListener('click',event=>{
  if(event.target.closest('#save-customer-note')){cxSession().note=cx$('customer-note-input').value;cxSession().noteDraft=cxSession().note;cx$('save-customer-note').disabled=true;cxToast('客户备注已保存');}
  if(event.target.closest('#expand-related')){cx$('related-expanded').hidden=!cx$('related-expanded').hidden;cx$('expand-related').textContent=cx$('related-expanded').hidden?'展开 ⌄':'收起 ⌃';}
  const related=event.target.closest('[data-related]');if(related)cxToast('参考截图仅提供该工单标题和状态，未提供会话内容');
});
document.querySelectorAll('[data-tool]').forEach(button=>button.addEventListener('click',()=>cxRunTool(button.dataset.tool)));
cx$('ai-input').addEventListener('input',()=>{cxSession().aiInput=cx$('ai-input').value;cx$('ask-ai').disabled=!cx$('ai-input').value.trim()||cxSession().busy;});
cx$('ai-input').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();cx$('ai-form').requestSubmit();}});
cx$('ai-form').addEventListener('submit',event=>{event.preventDefault();const prompt=cx$('ai-input').value.trim();if(!prompt||cxSession().busy)return;cxSession().aiInput='';cx$('ai-input').value='';cxRunTool('question',prompt);});
cx$('ai-conversation').addEventListener('click',async event=>{
  const apply=event.target.closest('[data-apply]'),copy=event.target.closest('[data-copy]');
  if(apply){const turn=cxSession().turns.find(t=>t.id===apply.dataset.apply);if(!turn?.draft)return;cxSession().draft=turn.draft;cx$('reply-editor').value=turn.draft;turn.applied=true;cxUpdateSendState();cxRenderPartner();cx$('reply-editor').focus();}
  if(copy){const turn=cxSession().turns.find(t=>t.id===copy.dataset.copy);const text=new DOMParser().parseFromString(turn.html,'text/html').body.textContent;try{await navigator.clipboard.writeText(text);copy.textContent='已复制';}catch{cxToast('复制未完成，请选中回复内容后复制');}}
});
cx$('new-ai-chat').addEventListener('click',()=>{if(!cxSession().turns.length){cx$('ai-input').focus();return;}cx$('clear-chat-description').textContent=`将清空工单 #${cxState.ticket} 的问答记录，清空后不可恢复。`;cx$('clear-chat-dialog').showModal();});
cx$('clear-chat-dialog').addEventListener('close',()=>{if(cx$('clear-chat-dialog').returnValue==='confirm'){const session=cxSession();session.revision++;session.turns=[];session.busy=false;cxRenderPartner();}});
cx$('dismiss-alert').addEventListener('click',()=>cx$('dismiss-alert').closest('.account-alert').hidden=true);
document.addEventListener('click',event=>{if(!event.target.closest('.action-menu,.conversation-actions,.editor-tools,.send-group,#meta-more'))cx$('action-menu').hidden=true;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){cx$('action-menu').hidden=true;cx$('events-panel').hidden=true;if(cxState.layout==='table'&&!document.querySelector('dialog[open]')){cxState.drawerOpen=false;cx$('ticket-workbench').classList.add('closed');}}});
