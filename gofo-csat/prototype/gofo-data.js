'use strict';
// Synthetic fixtures shared by configuration, analysis, detail and export.
(function(root){
 const KEY='gofo-csat-prototype-v1',REPORT_KEY='gofo-csat-report-v1';
 const copy=x=>JSON.parse(JSON.stringify(x));
 const q=(id,type,title,extra={})=>({id,type,title,desc:'',required:false,conditional:false,conditionQ:0,conditionScore:3,scale:'0–10',kpi:false,analysisFilter:false,options:['是','否'],optionIds:[id+'-yes',id+'-no'],...extra});
 const questions=[
  q('q1','rating','您有多大意愿向亲友推荐 GOFO？',{required:true,analysisFilter:true}),
  q('q2','multiple','哪些环节影响了您的评价？',{analysisFilter:true,options:['配送时效','包裹完好程度','客服响应与问题解决','配送人员服务','其他'],optionIds:['delivery','package','support','courier','other']}),
  q('q3','text','您还有哪些建议？'),
  q('q4','single','是否愿意接受回访？')
 ];
 const content=(qs,title)=>({subject:'请评价本次配送体验',body:'感谢您选择 GOFO，欢迎分享您的体验。',signature:false,title,desc:'请根据本次配送的真实体验填写。',qs});
 const makeSurvey=(id,name,channel,qs,extra={})=>({id,name,enabled:true,date:'2026-11-09 09:30',expiry:'天',duration:7,invitationChannel:channel,channels:[channel],versions:{Original:content(qs,name)},analysisVersion:'v1',npsSource:'q1',...extra});
 const seeds=[
  makeSurvey('gofo','GOFO 配送体验问卷','WhatsApp',copy(questions),{previewRef:'gofo-preview',contentReady:true,whatsapp:{account:'demo',templateId:'demo::service_feedback::zh_CN',buttonIndex:'0',variables:{},binding:{templateId:'demo::service_feedback::zh_CN',buttonIndex:0,surveyRef:'gofo-preview'}}}),
  makeSurvey('email','邮件售后反馈','邮件',[q('email-q1','rating','您对本次服务满意吗？',{scale:'1–5'}),q('email-q2','text','您的建议')],{npsSource:null}),
  makeSurvey('legacy','历史配送问卷','WhatsApp',[q('legacy-q1','rating','推荐 GOFO 的意愿',{analysisFilter:true})],{enabled:false,npsSource:'legacy-q1'}),
  makeSurvey('versioned','配送问卷（不同量表版本）','Custom Chat',[q('version-q1','rating','推荐 GOFO 的意愿',{analysisFilter:true})],{npsSource:'version-q1',analysisVersion:'v2',analysisVersions:[['v2','v2 · 0–10分'],['v1','v1 · 1–5分']]}),
  makeSurvey('unscored','未评分答卷示例','WhatsApp',copy(questions),{npsSource:'q1'})
 ];
 const rows=[];
 for(let i=0;i<100;i++){
  const support=i<40,rank=support?i:i-40;
  const score=support?(rank<28?9+rank%2:rank<36?7+rank%2:rank===39?0:4):(rank<42?9+rank%2:rank<54?7+rank%2:rank===59?0:3);
  const topics=support?['support',i%2?'delivery':'package']:['delivery',i%3?'package':'courier'];
  rows.push({id:'GOFO-'+String(i+1).padStart(4,'0'),surveyId:'gofo',version:'v1',ticket:String(10400+Math.floor(i/2)),channel:'WhatsApp',date:'2026-10-'+String(1+i%30).padStart(2,'0'),time:'10:'+String(i%60).padStart(2,'0')+':00',team:['客服一组','客服二组','物流支持组'][i%3],agent:['Emma','Leo','Sophie'][i%3],answers:{q1:score,q2:topics,q3:i%7===0?'希望配送更准时，客服沟通更清楚。':'',q4:i%4===0?'q4-no':'q4-yes'}});
 }
 rows.push({id:'UNSCORED-001',surveyId:'unscored',version:'v1',ticket:'10701',channel:'WhatsApp',date:'2026-10-15',time:'12:00:00',team:'客服一组',agent:'Emma',answers:{q1:null,q2:['support'],q3:'还没有评分',q4:null}});
 for(const [id,n] of [['email',5],['legacy',6],['versioned',8]])for(let i=0;i<n;i++){
  const s=seeds.find(s=>s.id===id),qid=s.versions.Original.qs[0].id;
  rows.push({id:id.toUpperCase()+'-'+(i+1),surveyId:id,version:id==='versioned'&&i<3?'v1':s.analysisVersion,ticket:String(10800+i),channel:s.invitationChannel,date:'2026-10-15',time:'13:00:00',team:'客服一组',agent:'Emma',answers:{[qid]:id==='email'||(id==='versioned'&&i<3)?4:i%2?10:0}});
 }
 function read(){try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}}
 function surveys(){const saved=read()?.current?.surveys;return saved||copy(seeds)}
 function effective(s,version){if(s?.id==='versioned'&&version==='v1'){s=copy(s);s.versions.Original.qs[0].scale='1–5';s.npsSource=null}return s}
 function source(s,version){if(s.id==='versioned'&&version==='v1')return null;const q=qs(s).find(q=>q.id===s.npsSource);return q?.type==='rating'&&q.scale==='0–10'?s.npsSource:null}
 function qs(s){return s?.versions?.Original?.qs||[]}
 function enabled(s){return qs(s).filter(q=>q.type!=='text'&&q.analysisFilter)}
 function values(q){if(q.type==='rating'){const min=q.scale?.startsWith('0')?0:1,max=Number(q.scale?.split(/[–-]/)[1])||5;return Array.from({length:max-min+1},(_,i)=>[String(min+i),String(min+i)+'分']).concat([['__missing','未作答']])}return q.options.map((label,i)=>[q.optionIds?.[i]||q.id+'-option-'+i,label]).concat([['__missing','未作答']])}
 function candidates(channel){return surveys().filter(s=>!channel||s.invitationChannel===channel||s.channels?.includes(channel)||rows.some(r=>r.surveyId===s.id&&r.channel===channel))}
 function signature(s){return JSON.stringify(enabled(s).map(q=>({id:q.id,type:q.type,scale:q.scale,values:values(q)})))}
 function invalid(s,answers){return Object.entries(answers).some(([id,selected])=>selected.length&&(!enabled(s).some(q=>q.id===id)||selected.some(v=>!values(enabled(s).find(q=>q.id===id)).some(x=>x[0]===v))))}
 function filter(all,s,st){return all.filter(r=>r.surveyId===s.id&&(!st.channel||r.channel===st.channel)&&r.date>=st.start&&r.date<=st.end&&(!st.team||r.team===st.team)&&(!st.agent||r.agent===st.agent)&&(!s.analysisVersions||r.version===st.version)&&Object.entries(st.answers||{}).every(([id,wanted])=>{if(!wanted.length)return true;const answer=r.answers[id],have=answer===null||answer===undefined||answer===''||Array.isArray(answer)&&!answer.length?['__missing']:Array.isArray(answer)?answer.map(String):[String(answer)];return wanted.some(v=>have.includes(v))}))}
 function stats(rs,s,version){const id=source(s,version),valid=id?rs.filter(r=>Number.isInteger(r.answers[id])&&r.answers[id]>=0&&r.answers[id]<=10):[],high=valid.filter(r=>r.answers[id]>=9).length,low=valid.filter(r=>r.answers[id]<=6).length;return{total:rs.length,valid:valid.length,high,low,passive:valid.length-high-low,nps:valid.length?(high-low)/valid.length*100:null,rate:valid.length?high/valid.length*100:null}}
 function answer(q,row){const v=row.answers[q.id];if(v===null||v===undefined||v===''||Array.isArray(v)&&!v.length)return '未作答';if(q.type==='rating')return String(v);if(q.type==='text')return String(v);return (Array.isArray(v)?v:[v]).map(id=>values(q).find(x=>x[0]===String(id))?.[1]||'历史选项：'+id).join('；')}
 function summary(s,st){return [s.name,st.start+' — '+st.end,st.channel||'全部渠道',st.team,st.agent,...Object.entries(st.answers||{}).filter(([,v])=>v.length).map(([id,v])=>{const q=qs(s).find(q=>q.id===id);return(q?.title||id)+'：'+v.map(id=>q?values(q).find(x=>x[0]===id)?.[1]||id:id).join('、')})].filter(Boolean).join(' / ')}
 const csvCell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 function csv(rs,s,st,now=new Date().toISOString()){const questions=qs(s),head=['答卷ID','问卷','版本','提交时间','渠道','工单ID',...questions.map(q=>q.title),'筛选条件','生成时点','集合版本'];return '\uFEFF'+[head,...rs.map(r=>[r.id,s.name,r.version,r.date+' '+r.time,r.channel,r.ticket,...questions.map(q=>answer(q,r)),summary(s,st),now,'synthetic-20261109-v1'])].map(r=>r.map(csvCell).join(',')).join('\r\n')}
 root.GOFO={KEY,REPORT_KEY,copy,seeds,rows,read,surveys,effective,qs,enabled,values,candidates,signature,invalid,source,filter,stats,answer,summary,csv};
})(globalThis);
