'use strict';
window.createSesWorkflows=({esc,tenant,records,href,navLink,go,toast})=>{
  const tickets={
    human:{message:'MSG-420',ticket:'2046',name:'Jo Martin',email:'jo@customer.example',subject:'售后问题处理进度',body:'您好，已收到您的反馈。我们正在核实订单的处理进度。'},
    ai:{message:'MSG-421',ticket:'2047',name:'Sam Miller',email:'sam@customer.example',subject:'订单配送进度',body:'您好，我已查询您的订单，目前正在安排配送。',actor:'AI'},
    clean:{message:'MSG-423',ticket:'2048',name:'Alex Rivera',email:'alex@customer.example',subject:'更新收货地址',body:'您好，已为您更新收货地址。'}
  };
  const store=window.SolveaBlacklist, drafts={}, replies={}, attempts={};
  let filter={from:'2026-11-09',to:'2026-11-12',mailbox:''};
  const batches=[
    {date:'2026-11-10',mailbox:'primary',sent:40,ids:[]},
    {date:'2026-11-11',mailbox:'primary',sent:60,ids:['MSG-420']},
    {date:'2026-11-12',mailbox:'primary',sent:100,ids:['MSG-421']},
    {date:'2026-11-12',mailbox:'secondary',sent:50,ids:['MSG-422']}
  ];
  function blacklist(){
    const id=tenant().id, db=store.load(id)||store.empty();
    const processed=new Set(db.sesComplaintApplied||[]);
    let changed=false;
    if(!db.sesContactsSeeded){
      const contacts=id==='TEN-018'?[tickets.clean]:Object.values(tickets);
      for(const item of contacts){
        if(!db.contacts.some(c=>c.email===item.email))db.contacts.push({email:item.email,name:item.name,tag:'Email',time:'10:00',note:''});
      }
      db.sesContactsSeeded=true;
      changed=true;
    }
    for(const c of records()){
      const note='关联投诉：'+(c.feedbackId||c.id);
      if(!c.recipient)continue;
      const match=store.find(db,c.recipient);
      if(processed.has(note)&&(!match||match.systemComplaints?.some(x=>x.note===note)))continue;
      processed.add(note);
      changed=true;
      const details={email:c.recipient,reason:'客户投诉',source:c.feedbackId?'SES 垃圾邮件投诉':'邮件内投诉',note,person:'系统',time:c.time};
      if(match){
        if(!(match.systemComplaints||=[]).some(x=>x.note===note))match.systemComplaints.push(details);
        if(!db.audit.some(x=>x.note===note))db.audit.unshift({...details,action:'关联投诉禁发'});
      }else{
        store.add(db,details);
        store.find(db,c.recipient).systemComplaints=[details];
      }
    }
    if(changed){db.sesComplaintApplied=[...processed];store.store(id,db);}
    return db;
  }
  function ticket(scene){
    const selected=tickets[scene]?scene:'human', t=tenant();
    const scenario=t.id==='TEN-018'?'clean':selected, key=t.id+':'+scenario, row=tickets[scenario];
    const entries=Object.entries(tickets).filter(([id])=>t.id!=='TEN-018'||id==='clean');
    const message={id:row.message,ticket:row.ticket,recipient:scenario,subject:row.subject,body:row.body,date:'11/12 10:00',status:'sent',actor:row.actor};
    const recipient={id:scenario,name:row.name,email:row.email};
    const cases=records().filter(c=>c.message===row.message);
    const handoff=row.actor==='AI'&&cases.length?{assignee:'客服 A',reason:'AI 回复产生邮件投诉，已转人工',paused:true}:null;
    blacklist();
    window.sesPrototypeBridge={
      snapshot:()=>({compact:true,page:'ticketReady',tenant:t,recipient,message,recipients:entries.map(([id,v])=>({id,name:v.name,email:v.email})),
        messages:entries.map(([id,v])=>({id:v.message,ticket:v.ticket,recipient:id,subject:v.subject,status:'sent'})),
        sentReplies:replies[key]||[],complaints:cases,handoff,draft:drafts[key]||'',latestBlock:attempts[key],gate:{ok:true}}),
      draft:text=>{drafts[key]=text;},toast,
      navigate(id,data={}){
        if(id==='ticketReady')return go('ticketComplaint',{scene:Object.keys(tickets).find(k=>tickets[k].message===data.message)||scenario});
        if(id==='complaintDetail'){
          const links=cases.filter(c=>c.message===data.message);
          return links.length>1?go('sesComplaintList',{message:data.message,scene:scenario,origin:'ticket'}):
            go('sesComplaintDetail',{complaint:links[0]?.id,scene:scenario,origin:'ticket'});
        }
        if(id==='report')go('complaintReport');
        if(id==='contacts')go('complaintBlacklist',{scene:scenario});
      },
      saveReply(text,_purpose,resolve,addresses){
        if(!text.trim())return {ok:false,reason:'请填写邮件正文'};
        const db=store.load(t.id)||store.empty();
        if(addresses.some(email=>store.find(db,email))){
          const reason='收件邮箱在黑名单中，已拦截发信';
          attempts[key]={after:reason,time:'11/12 11:00'};
          return {ok:false,blocked:true,reason};
        }
        const id='DEMO-REPLY-'+Date.now();
        (replies[key]||=[]).unshift({...message,id,body:text,date:'11/12 11:00',actor:undefined});
        delete attempts[key];drafts[key]='';
        return {ok:true,message:id,resolve};
      }
    };
    return '<iframe class="scr-workframe" title="工单对话" src="ticket-base.html"></iframe>';
  }
  function blacklistPage(scene,view){
    blacklist();
    const email=view?'':tickets[scene]?.email||'';
    const page=view==='contacts'?'contacts':'blacklist';
    return '<div class="scr-external-bar">'+navLink('← 返回工单','ticketComplaint',{scene})+'</div><iframe class="scr-workframe" title="联系人黑名单" src="../blacklist/index.html?'+esc(new URLSearchParams({tenant:tenant().id,email}))+'#'+page+'"></iframe>';
  }
  function report(){
    const id=tenant().id, options=[['','全部邮箱'],['primary',tenant().from],['secondary','returns@'+tenant().name.toLowerCase()+'.example']];
    const selected=id==='TEN-017'?batches.filter(b=>b.date>=filter.from&&b.date<=filter.to&&(!filter.mailbox||b.mailbox===filter.mailbox)):[];
    const stats=rows=>{
      const mails=new Set(rows.flatMap(b=>b.ids)), all=records().filter(c=>mails.has(c.message)), count=cs=>new Set(cs.map(c=>c.message)).size;
      const total=rows.reduce((sum,b)=>sum+b.sent,0), spam=count(all.filter(c=>c.feedbackId));
      return {total,complaints:count(all),forms:count(all.filter(c=>!c.feedbackId)),spam,rate:total?(100*spam/total).toFixed(2)+'%':'—'};
    };
    const overall=stats(selected);
    const help=(label,value,tip)=>'<div class="scr-metric"><div>'+label+' <span class="scr-stat-help" tabindex="0" aria-label="'+esc(tip)+'">ⓘ<span>'+esc(tip)+'</span></span></div><strong>'+value+'</strong></div>';
    return '<section class="mb-list scr-report"><header class="mb-title"><h1>投诉报表</h1></header>'+
      '<form id="scr-report-filters"><label>渠道 <select aria-label="渠道"><option>Email</option></select></label><label>发件邮箱 <select name="mailbox">'+options.map(([value,label])=>'<option value="'+value+'" '+(value===filter.mailbox?'selected':'')+'>'+esc(label)+'</option>').join('')+'</select></label><label>开始日期 <input name="from" type="date" required value="'+filter.from+'"></label><label>结束日期 <input name="to" type="date" required value="'+filter.to+'"></label><button class="mb-button" type="submit">查询</button></form>'+
      '<div class="scr-report-metrics">'+help('SES 已发送邮件',overall.total,'所选发送日期和发件邮箱下实际通过 SES 发出的邮件数量。')+help('投诉邮件数',overall.complaints,'两类投诉按原邮件去重，重复事件不增加邮件数。')+help('邮件内投诉',overall.forms,'收到 Solvea 问卷投诉的邮件数；不计入 SES 投诉率。')+help('SES 垃圾邮件投诉',overall.spam,'收到有效 SES 垃圾邮件投诉的邮件数。')+help('SES 投诉率',overall.rate,'SES 垃圾邮件投诉邮件数 ÷ 同批次 SES 已发送邮件数。按原发送日统计，不等同于 AWS 控制台投诉率。')+'</div>'+
      '<h2>发件邮箱明细</h2><div class="scr-table"><table><thead><tr>'+['发件邮箱','SES 已发送','投诉邮件数','邮件内投诉','SES 垃圾邮件投诉','SES 投诉率','操作'].map(n=>'<th>'+n+'</th>').join('')+'</tr></thead><tbody>'+
      (selected.length?options.slice(1).filter(([box])=>selected.some(b=>b.mailbox===box)).map(([box,label])=>{const s=stats(selected.filter(b=>b.mailbox===box));return '<tr><td>'+esc(label)+'</td><td>'+s.total+'</td><td>'+s.complaints+'</td><td>'+s.forms+'</td><td>'+s.spam+'</td><td>'+s.rate+'</td><td>'+(s.complaints?navLink('查看投诉明细','sesComplaintList',{origin:'report',scope:box}):'—')+'</td></tr>';}).join(''):'<tr><td class="empty" colspan="7">该时间段暂无数据</td></tr>')+'</tbody></table></div></section>';
  }
  return {ticket,blacklistPage,report,reportRecords:()=>new Set((tenant().id==='TEN-017'?batches:[]).filter(b=>b.date>=filter.from&&b.date<=filter.to&&(!filter.mailbox||b.mailbox===filter.mailbox)).flatMap(b=>b.ids)),
    filter(form){const d=Object.fromEntries(new FormData(form));const end=form.elements.to;end.setCustomValidity(d.from>d.to?'结束日期不得早于开始日期':'');if(!form.reportValidity())return false;filter=d;return true;}};
};
