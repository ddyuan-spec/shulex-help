'use strict';
// Incremental layer over the V131 dashboard; the all-survey view stays intact.
const G=GOFO,gofoBaseRender=render;
const GOFO_METRIC_KEY='gofo.metric-display.v1',gofoMetricKeys=[...DEFAULT_METRIC_KEYS,'valid','nps'];
let gofoShownMetrics=[...DEFAULT_METRIC_KEYS],gofoMetricDraft=[];
try{const saved=JSON.parse(localStorage.getItem(GOFO_METRIC_KEY));if(Array.isArray(saved)&&saved.length>=1&&saved.length<=6&&new Set(saved).size===saved.length&&saved.every(k=>gofoMetricKeys.includes(k)))gofoShownMetrics=gofoMetricKeys.filter(k=>saved.includes(k))}catch{}
let gofo={survey:'gofo',version:'v1',answers:{},page:1,screen:'report',id:'',scenario:'normal'},gofoDraft={},gofoStatus='ready',gofoRequest=0,gofoSignature='',gofoRows=[],gofoLastChannel='',gofoHasChanged=false;
try{const saved=JSON.parse(localStorage.getItem(G.REPORT_KEY));if(saved){Object.assign(gofo,saved.gofo);Object.assign(state,saved.state)}}catch{}
if(!localStorage.getItem(G.REPORT_KEY))state.channel='WhatsApp';
gofoLastChannel=state.channel;gofoDraft=G.copy(gofo.answers);
const gofoParams=new URLSearchParams(location.search);
if(['responses','response'].includes(gofoParams.get('page')))gofo.screen=gofoParams.get('page');
if(gofoParams.get('id'))gofo.id=gofoParams.get('id');
if(gofoParams.get('scenario'))gofo.scenario=gofoParams.get('scenario');
const gofoOptions=(items,value)=>items.map(([id,label])=>'<option value="'+esc(id)+'" '+(id===value?'selected':'')+'>'+esc(label)+'</option>').join('');
function gofoSurvey(){return G.effective(G.surveys().find(s=>s.id===gofo.survey),gofo.version)}
function gofoScope(){return{...state,version:gofo.version,answers:G.copy(gofo.answers)}}
function gofoPersist(){try{localStorage.setItem(G.REPORT_KEY,JSON.stringify({gofo,state}))}catch{toast('筛选条件暂未保存，刷新后可能丢失')}}
function gofoSync(){const u=new URL(location.href);u.search='';if(gofo.screen!=='report')u.searchParams.set('page',gofo.screen);if(gofo.screen==='response')u.searchParams.set('id',gofo.id);history.replaceState(null,'',u);gofoPersist()}
function gofoNav(screen,id=''){gofo.screen=screen;if(id)gofo.id=id;gofoSync();render();$('#scrollBody').scrollTop=0}
function gofoSelect(survey){gofoRequest++;gofo.survey=survey;gofo.version=gofoSurvey()?.analysisVersion||'v1';gofo.answers={};gofoDraft={};gofo.page=1;gofo.screen='report';gofoSignature='';gofoStatus='ready';gofoHasChanged=false;gofoSync();render()}
function gofoReconcile(){
 if(gofoLastChannel!==state.channel){
  if(gofo.survey&&!G.candidates(state.channel).some(s=>s.id===gofo.survey)){gofo.survey='';gofo.answers={};gofoDraft={};gofoSignature='';toast('渠道已切换，原问卷不适用，已清空问卷及题目条件')}
  gofoLastChannel=state.channel;
 }
 const s=gofoSurvey();
 if(gofo.survey&&!s){gofoStatus='stale';return}
 if(s&&gofoSignature&&G.signature(s)!==gofoSignature){gofoStatus='stale';gofoHasChanged=true}
 if(s&&G.invalid(s,gofo.answers)){gofoStatus='stale';gofoHasChanged=true}
 if(s&&!gofoSignature)gofoSignature=G.signature(s);
}
function gofoQuery(){
 const s=gofoSurvey();if(!s)return;
 if(gofoHasChanged||G.invalid(s,gofoDraft)||gofoSignature!==G.signature(s)){gofoStatus='stale';render();return}
 gofo.answers=G.copy(gofoDraft);gofo.page=1;const token=++gofoRequest;gofoStatus='loading';gofoSync();render();
 setTimeout(()=>{if(token!==gofoRequest)return;gofoStatus=gofo.scenario==='error'?'error':'ready';gofoPersist();render()},240);
}
function gofoFilters(s){
 const list=G.candidates(state.channel),surveyControl='<div class="chip"><label for="gofoSurvey">满意度问卷</label><select id="gofoSurvey" aria-label="满意度问卷">'+gofoOptions([['','全部问卷'],...list.map(s=>[s.id,s.name+(s.enabled?'':' · 已停用')])],gofo.survey)+'</select></div>';
 const dates='<div class="chip date"><span data-icon="calendar"></span><label for="gofoPeriod">提交日期</label><select id="gofoPeriod" aria-label="提交日期">'+gofoOptions([['30','近30天'],['7','近7天'],['custom','自定义']],state.start==='2026-10-01'&&state.end==='2026-10-30'?'30':state.start==='2026-10-24'&&state.end==='2026-10-30'?'7':'custom')+'</select></div>';
 if(!s)return surveyControl;
 return '<div class="filters">'+dates+filter('团队','team',teams,'user')+filter('处理人','agent',agents,'user')+filter('渠道','channel',[...channels,'LINE'],'channel')+surveyControl+'<div class="chip muted-filter">售后邮箱⌄</div><div class="chip muted-filter">平台⌄</div><div class="chip muted-filter">店铺⌄</div><button id="gofoResetAll" class="link reset">重置</button></div>'+
 '<div class="gofo-dates" '+(state.start==='2026-10-01'&&state.end==='2026-10-30'?'hidden':'')+' id="gofoCustomDates"><input type="date" aria-label="提交开始日期" id="gofoStart" value="'+esc(state.start)+'"><span>—</span><input type="date" aria-label="提交结束日期" id="gofoEnd" value="'+esc(state.end)+'"><button id="gofoDateApply">应用</button></div>'+
 (s.analysisVersions?'<div class="filters"><div class="chip"><label for="gofoVersion">问卷版本</label><select id="gofoVersion">'+gofoOptions(s.analysisVersions,gofo.version)+'</select></div></div>':'')+
 '<div class="gofo-question-filters">'+(G.enabled(s).length?G.enabled(s).map((q,i)=>{
  const selected=gofoDraft[q.id]||[],opts=G.values(q);return '<details class="answer-picker" data-question="'+esc(q.id)+'"><summary>Q'+(G.qs(s).indexOf(q)+1)+' '+esc(q.title)+(selected.length?' · '+selected.length+'项':'')+' ⌄</summary><div class="answer-menu">'+opts.map(([id,label])=>'<label><input type="checkbox" data-gofo-answer="'+esc(q.id)+'" value="'+esc(id)+'" '+(selected.includes(id)?'checked':'')+'>'+esc(label)+'</label>').join('')+'<footer><button data-clear-question="'+esc(q.id)+'">清空</button><button class="primary" data-apply-question="'+esc(q.id)+'">应用</button></footer></div></details>'
 }).join(''):'<div class="gofo-inline-state">未设置分析筛选项</div>')+'<button class="link gofo-reset" id="gofoResetAnswers">重置题目条件</button><a class="gofo-config-link" href="survey.html?page=create&amp;id='+encodeURIComponent(s.id)+'&amp;step=2&amp;from=report">配置筛选项 ↗</a></div>';
}
function gofoBindFilters(s){
 $('#gofoSurvey')?.addEventListener('change',e=>gofoSelect(e.target.value));
 if(!s)return;
 for(const key of ['team','agent','channel'])$('#'+key)?.addEventListener('change',e=>{state[key]=e.target.value;gofoRequest++;gofoStatus='ready';gofo.page=1;render();gofoPersist()});
 $('#gofoPeriod')?.addEventListener('change',e=>{if(e.target.value==='custom'){$('#gofoCustomDates').hidden=false;return}state.start=e.target.value==='7'?'2026-10-24':'2026-10-01';state.end='2026-10-30';gofoQuery()});
 $('#gofoDateApply')?.addEventListener('click',()=>{const start=$('#gofoStart').value,end=$('#gofoEnd').value;if(!start||!end||start>end){toast('请选择有效的开始和结束日期');return}state.start=start;state.end=end;gofoQuery()});
 $('#gofoVersion')?.addEventListener('change',e=>{gofo.version=e.target.value;gofo.answers={};gofoDraft={};gofoSignature='';gofoHasChanged=false;gofoReconcile();gofoQuery()});
 $('#gofoResetAnswers')?.addEventListener('click',()=>{gofoDraft={};gofoQuery()});
 $('#gofoResetAll')?.addEventListener('click',()=>{state=defaultState();gofoSelect('')});
 document.querySelectorAll('[data-gofo-answer]').forEach(input=>input.addEventListener('change',()=>{const id=input.dataset.gofoAnswer,prior=gofoDraft[id]||[];gofoDraft[id]=input.checked?[...new Set([...prior,input.value])]:prior.filter(x=>x!==input.value)}));
 document.querySelectorAll('[data-clear-question]').forEach(b=>b.addEventListener('click',()=>{gofoDraft[b.dataset.clearQuestion]=[];render()}));
 document.querySelectorAll('[data-apply-question]').forEach(b=>b.addEventListener('click',gofoQuery));
}
function gofoApplied(s){return '<div class="gofo-active"><span>'+esc(state.channel||'全部渠道')+'</span><span>'+esc(s.name)+'</span>'+Object.entries(gofo.answers).filter(([,v])=>v.length).map(([id,selected])=>{const q=G.qs(s).find(q=>q.id===id);return '<span>'+esc(q?.title||id)+'：'+selected.map(v=>esc(q?G.values(q).find(x=>x[0]===v)?.[1]||v:v)).join('、')+'</span>'}).join('')+'</div>'}
const gofoMetricDefinitions={
 valid:{label:'有效评分答卷数',formula:'当前筛选条件下，评分题有有效答案的正式答卷数。每份答卷只计一次；0 分有效，未作答不计。没有有效评分时显示 0，未配置评分来源时显示“—”。'},
 nps:{label:'NPS',formula:'0–5 分的评分题先乘 2 换算为 0–10 分。同一答卷有多道纳入客服考核的评分题时，换算后取有效评分的平均值。NPS =（≥9 分答卷数 − ≤6 分答卷数）÷ 有效评分答卷数 × 100；其余有效评分也计入分母。'},
 rate:{label:'9–10 分占比',formula:'当前样本的 9–10 分份数 ÷ 当前样本有效评分份数 × 100%。无有效评分分母时显示“—”。'}
};
function gofoMetricHelp(key){const d=gofoMetricDefinitions[key];return '<button class="metric-help" type="button" data-gofo-help="'+key+'" aria-label="'+d.label+'的计算方式" aria-describedby="metricTooltip"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.2v4.3M8 11.1h.01"/></svg></button>'}
function gofoMetric(key,label,value,note){return '<article class="metric" data-metric="'+key+'"><div class="label"><span>'+label+'</span>'+gofoMetricHelp(key)+'</div><strong>'+value+'</strong></article>'}
function gofoMetricSettings(){return '<div class="gofo-stat-controls"><details class="answer-picker" id="gofoMetricSettings"><summary>设置统计</summary><div class="answer-menu"><div class="gofo-stat-count" id="gofoMetricCount"></div>'+gofoMetricKeys.map(k=>'<label><input type="checkbox" data-metric-choice="'+k+'">'+esc((definitions[k]||gofoMetricDefinitions[k]).label)+'</label>').join('')+'<footer><button id="gofoMetricCancel">取消</button><button class="primary" id="gofoMetricSave">应用</button></footer></div></details></div>'}
function gofoUpdateMetricDraft(){document.querySelectorAll('[data-metric-choice]').forEach(el=>{el.checked=gofoMetricDraft.includes(el.dataset.metricChoice);el.disabled=!el.checked&&gofoMetricDraft.length>=6});$('#gofoMetricCount').textContent='已选 '+gofoMetricDraft.length+' / 6';$('#gofoMetricSave').disabled=!gofoMetricDraft.length}
function gofoBindMetricSettings(){const panel=$('#gofoMetricSettings');if(!panel)return;gofoMetricDraft=[...gofoShownMetrics];gofoUpdateMetricDraft();panel.addEventListener('toggle',()=>{if(panel.open){gofoMetricDraft=[...gofoShownMetrics];gofoUpdateMetricDraft()}});document.querySelectorAll('[data-metric-choice]').forEach(el=>el.onchange=()=>{const key=el.dataset.metricChoice;if(el.checked&&!gofoMetricDraft.includes(key)&&gofoMetricDraft.length<6)gofoMetricDraft.push(key);if(!el.checked)gofoMetricDraft=gofoMetricDraft.filter(k=>k!==key);gofoUpdateMetricDraft()});$('#gofoMetricCancel').onclick=()=>{panel.open=false;gofoMetricDraft=[...gofoShownMetrics];gofoUpdateMetricDraft()};$('#gofoMetricSave').onclick=()=>{const next=gofoMetricKeys.filter(k=>gofoMetricDraft.includes(k));if(!next.length||next.length>6)return;try{localStorage.setItem(GOFO_METRIC_KEY,JSON.stringify(next))}catch{toast('统计设置保存失败，请重试');return}gofoShownMetrics=next;render()}}
function gofoMetricCards(s){const st=s?G.stats(G.filter(G.rows,s,gofoScope()),s,gofo.version):null,legacy=stats(cohort()),source=s&&G.source(s,gofo.version);return gofoShownMetrics.map(key=>{if(DEFAULT_METRIC_KEYS.includes(key))return '<article class="metric" data-metric="'+key+'"><div class="label"><span>'+definitions[key].label+'</span>'+help(key)+'</div><strong>'+(s?'—':legacy[key])+'</strong></article>';return gofoMetric(key,gofoMetricDefinitions[key].label,key==='valid'?(source?String(st.valid):'—'):(source?gofoSigned(st.nps):'—'),'')}).join('')}
function gofoLegacyCharts(){return '<section class="card trend-card"><div class="card-heading"><h3>按日期好评率和已填写邀评数量</h3><div class="seg"><button data-grain="day" class="'+(state.grain==='day'?'active':'')+'">按日</button><button data-grain="month" class="'+(state.grain==='month'?'active':'')+'">按月</button></div></div><div class="legend"><span><i class="dot" style="background:#606bff"></i>好评率</span><span><i class="dot" style="background:#687b9e"></i>已填写邀评数量</span></div><div class="empty">待确认问卷 / 答案与邀评链接的关联口径</div></section><div class="lower-charts">'+['按团队好评率 Top 10','按渠道好评率 Top 10'].map(title=>'<section class="card"><div class="card-heading"><h3>'+title+'</h3></div><div class="empty">待确认同条件统计口径</div></section>').join('')+'</div>'}
let gofoTooltipTimer;
function gofoShowMetricTooltip(button){
 clearTimeout(gofoTooltipTimer);
 if(!button.dataset.gofoHelp){showTooltip(button);if(gofo.survey){const tip=$('#metricTooltip');tip.innerHTML='<strong>'+definitions[button.dataset.help].label+'</strong><div class="tooltip-formula">'+definitions[button.dataset.help].formula+'</div><p>'+definitions[button.dataset.help].detail+'</p><p>当前选定问卷：旧指标关联与日期口径待开发确认，暂不展示数值；不以筛后答卷数替代发送分母。GOFO好评阈值需另行确认。</p>'}return}
 const key=button.dataset.gofoHelp,def=gofoMetricDefinitions[key],s=gofoSurvey(),st=s?G.stats(G.filter(G.rows,s,gofoScope()),s,gofo.version):{valid:0},tip=$('#metricTooltip');
 const sample=key==='rate'&&st.valid?'当前范围：'+st.high+' ÷ '+st.valid+' × 100% = '+st.rate.toFixed(1)+'%':key==='nps'&&st.valid?'当前范围：('+st.high+' − '+st.low+') ÷ '+st.valid+' × 100 = '+gofoSigned(st.nps):'';
 tip.innerHTML='<strong>'+def.label+'</strong><div class="tooltip-formula">'+def.formula+'</div>'+(sample?'<p>'+sample+'</p>':'');tip.hidden=false;
 const rect=button.getBoundingClientRect(),box=tip.getBoundingClientRect();tip.style.left=Math.max(12,Math.min(rect.left-16,innerWidth-box.width-12))+'px';tip.style.top=(rect.bottom+10+box.height<innerHeight?rect.bottom+10:Math.max(12,rect.top-box.height-10))+'px';
}
function gofoScheduleTooltipHide(){clearTimeout(gofoTooltipTimer);gofoTooltipTimer=setTimeout(hideTooltip,120)}
function gofoBindMetricHelp(){
 clearTimeout(gofoTooltipTimer);
 document.querySelectorAll('[data-help],[data-gofo-help]').forEach(b=>{
  b.querySelector('svg path')?.setAttribute('d','M8 4.2v4.3M8 11.1h.01');
  b.onmouseenter=()=>gofoShowMetricTooltip(b);b.onmouseleave=gofoScheduleTooltipHide;b.onfocus=()=>gofoShowMetricTooltip(b);b.onblur=gofoScheduleTooltipHide;b.onclick=()=>gofoShowMetricTooltip(b);
 });
 const tip=$('#metricTooltip');tip.onmouseenter=()=>clearTimeout(gofoTooltipTimer);tip.onmouseleave=gofoScheduleTooltipHide;
}
function gofoSigned(n){return n===null?'—':(n>0?'+':'')+Number(n.toFixed(1))}
function gofoResults(s){
 if(gofoStatus==='review')return '<div class="gofo-loading"><span>筛选配置已刷新，请核对条件。</span><button id="gofoApplyReviewed">应用筛选并查询</button></div>';
 if(gofoStatus==='loading')return '<div class="gofo-loading"><div class="gofo-spinner"></div><span>正在查询答卷…</span></div>';
 if(gofoStatus==='error')return '<div class="gofo-error"><strong>查询失败</strong><p>筛选条件已保留，请重试。</p><button id="gofoRetry">重新查询</button></div>';
 if(gofoStatus==='stale')return '<div class="gofo-error"><strong>筛选配置已变化</strong><p>请刷新筛选配置并核对条件后重新查询。</p><button id="gofoRefreshConfig">刷新筛选配置</button></div>';
 const rows=gofoRows=G.filter(G.rows,s,gofoScope()),st=G.stats(rows,s,gofo.version),source=G.qs(s).find(q=>q.id===G.source(s,gofo.version));
 return '<div class="gofo-toolbar"><div><h2>'+esc(s.name)+'</h2><p>'+state.start+' — '+state.end+' · 已提交答卷 '+st.total+'份'+(source?' · 评分题：'+esc(source.title):'')+'</p></div><div class="actions"><button id="gofoDetails">答卷明细</button><button id="gofoExport" '+(!rows.length?'disabled':'')+'>导出答卷</button></div></div>'+gofoApplied(s)+
 (!source?'<div class="gofo-warning">未配置推荐意愿评分来源，有效评分答卷数与NPS暂不计算。</div>':'')+
 (gofo.answers[source?.id]?.length?'<div class="gofo-warning">当前已按评分筛选样本，NPS仅代表这些答卷。</div>':'')+
 gofoMetricSettings()+'<section class="metrics gofo-metrics" aria-label="满意度统计">'+gofoMetricCards(s)+'</section>'+gofoLegacyCharts();
}
function gofoExport(){
 const s=gofoSurvey();if(!s||gofoStatus!=='ready')return;const rows=G.filter(G.rows,s,gofoScope());if(!rows.length)return;
 try{const blob=new Blob([G.csv(rows,s,gofoScope())],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='GOFO-答卷-'+new Date().toISOString().slice(0,10)+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出 '+rows.length+'份答卷')}catch{toast('导出失败，请重试')}
}
function gofoBindResults(){
 $('#gofoDetails')?.addEventListener('click',()=>gofoNav('responses'));
 $('#gofoExport')?.addEventListener('click',gofoExport);
 $('#gofoRetry')?.addEventListener('click',()=>{gofo.scenario='normal';$('#gofoScenario').value='normal';gofoQuery()});
 $('#gofoRefreshConfig')?.addEventListener('click',()=>{gofoHasChanged=false;gofoSignature='';gofoStatus='review';gofo.answers={};gofoDraft={};render()});
 $('#gofoApplyReviewed')?.addEventListener('click',gofoQuery);
 gofoBindMetricHelp();gofoBindMetricSettings();document.querySelectorAll('[data-grain]').forEach(b=>b.onclick=()=>{state.grain=b.dataset.grain;render()});
}
function gofoDetails(s){
 const rows=gofoRows=G.filter(G.rows,s,gofoScope()),size=10;gofo.page=Math.max(1,Math.min(gofo.page,Math.ceil(rows.length/size)||1));
 if(gofo.screen==='response'){
  const row=rows.find(r=>r.id===gofo.id);
  if(!row)return '<div class="report-detail"><button id="gofoBackList">← 返回答卷明细</button><div class="gofo-empty">该答卷不在当前筛选范围内</div></div>';
  return '<div class="report-detail"><div class="detail-heading"><button id="gofoBackList">← 返回答卷明细</button><h2>答卷详情</h2></div><section class="card"><dl class="gofo-meta">'+[['答卷ID',row.id],['问卷',s.name],['版本',row.version],['提交时间',row.date+' '+row.time],['渠道',row.channel],['工单ID','#'+row.ticket]].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl></section><section class="card"><h3>问卷答案</h3>'+G.qs(s).map((q,i)=>'<div class="gofo-answer"><h3>Q'+(i+1)+' '+esc(q.title)+'</h3><p>'+esc(G.answer(q,row))+'</p></div>').join('')+'</section></div>';
 }
 return '<div class="report-detail"><div class="detail-heading"><button id="gofoBackReport">← 返回满意度分析</button><h2>答卷明细</h2><button style="margin-left:auto" id="gofoExport" '+(!rows.length?'disabled':'')+'>导出答卷</button></div>'+gofoApplied(s)+'<div class="gofo-toolbar"><p>'+esc(G.summary(s,gofoScope()))+'</p><span>共 '+rows.length+'份</span></div><section class="card"><div class="table-wrap"><table><thead><tr><th>答卷ID</th><th>问卷 / 版本</th><th>提交时间</th><th>渠道</th><th>工单ID</th>'+G.qs(s).map((q,i)=>'<th>Q'+(i+1)+' '+esc(q.type==='rating'?'评分':q.type==='multiple'?'影响环节':q.type==='text'?'建议':'回访意愿')+'</th>').join('')+'<th>操作</th></tr></thead><tbody>'+rows.slice((gofo.page-1)*size,gofo.page*size).map(r=>'<tr><td>'+r.id+'</td><td>'+esc(s.name)+'<br>'+esc(r.version)+'</td><td>'+r.date+'<br>'+r.time+'</td><td>'+r.channel+'</td><td>#'+r.ticket+'</td>'+G.qs(s).map(q=>'<td class="answer-cell">'+esc(G.answer(q,r))+'</td>').join('')+'<td><button class="detail-link" data-response="'+r.id+'">查看详情</button></td></tr>').join('')+(!rows.length?'<tr><td colspan="20"><div class="gofo-empty">暂无符合条件的答卷</div></td></tr>':'')+'</tbody></table></div><div class="gofo-pagination"><span>'+gofo.page+' / '+Math.max(1,Math.ceil(rows.length/size))+'页 · 每页10份</span><button id="gofoPrev" '+(gofo.page===1?'disabled':'')+'>上一页</button><button id="gofoNext" '+(gofo.page*size>=rows.length?'disabled':'')+'>下一页</button></div></section></div>';
}
function gofoBindDetails(){
 $('#gofoBackReport')?.addEventListener('click',()=>gofoNav('report'));
 $('#gofoBackList')?.addEventListener('click',()=>gofoNav('responses'));
 $('#gofoExport')?.addEventListener('click',gofoExport);
 $('#gofoPrev')?.addEventListener('click',()=>{gofo.page--;gofoSync();render()});
 $('#gofoNext')?.addEventListener('click',()=>{gofo.page++;gofoSync();render()});
 document.querySelectorAll('[data-response]').forEach(b=>b.addEventListener('click',()=>gofoNav('response',b.dataset.response)));
}
function gofoFrame(){
 mode='report';$('.top .title').textContent='工作台看板';$('.side').innerHTML=reportSide;$('.sub').innerHTML=reportSub;$('#topTabs').style.display='flex';$('#pageTitle').textContent='工单';$('#previewSwitch').textContent='配置满意度问卷';$('#previewSwitch').onclick=()=>location.assign('survey.html?page=surveys');
}
function gofoRender(){
 hideTooltip();gofoReconcile();const s=gofoSurvey();
 if(!gofo.survey){
  mode='report';gofoBaseRender();$('#previewSwitch').textContent='配置满意度问卷';$('#previewSwitch').onclick=()=>location.assign('survey.html?page=surveys');
  const surveyUI=document.createElement('div');surveyUI.innerHTML=gofoFilters(null);$('#channel')?.closest('.chip')?.after(surveyUI.firstElementChild);gofoBindFilters(null);
  if(!G.candidates(state.channel).length){const n=document.createElement('div');n.className='gofo-inline-state';n.textContent='该渠道暂无可分析问卷';$('.filters').after(n)}
  const cards=$('.metrics');cards.insertAdjacentHTML('beforebegin',gofoMetricSettings());cards.innerHTML=gofoMetricCards(null);gofoBindMetricSettings();gofoBindMetricHelp();gofoPersist();return;
 }
 gofoFrame();if(!s){$('#page').innerHTML='<div class="gofo-error">问卷已不可用，请重新选择。<button id="gofoSelectAgain">选择问卷</button></div>';$('#gofoSelectAgain').onclick=()=>gofoSelect('');return}
 if(gofo.screen!=='report'&&gofoStatus==='ready'){$('#page').innerHTML=gofoDetails(s);gofoBindDetails()}else{$('#page').innerHTML=gofoFilters(s)+gofoResults(s);gofoBindFilters(s);gofoBindResults()}
 drawIcons();gofoPersist();
}
render=gofoRender;
document.body.classList.add('review-report');
const review=document.createElement('div');review.className='reviewbar';review.innerHTML='<a href="../solution.html#prototype-analysis" target="_top">← 返回完整方案</a><span>开发评估稿 · 旧六项及图表的问卷联动待确认 · 合成数据</span><label>验收场景 <select id="gofoScenario">'+gofoOptions([['normal','整体 / 客服样本'],['empty','零命中答卷'],['error','查询失败与重试'],['no-filter','未设置筛选项'],['no-score','有答卷无评分'],['version','不兼容量表版本'],['no-survey','渠道无关联问卷']],'normal')+'</select></label><a href="survey.html?page=create&amp;id=gofo&amp;step=2&amp;from=report">编辑问卷 →</a>';document.body.prepend(review);
function gofoScenario(value){
 gofoRequest++;gofoHasChanged=false;gofoStatus='ready';gofoSignature='';gofo.answers={};gofoDraft={};gofo.screen='report';state=defaultState();state.channel='WhatsApp';gofo.survey='gofo';gofo.version='v1';gofo.scenario=value;
 if(value==='empty')state.start=state.end='2026-09-01';
 if(value==='no-filter'){gofo.survey='email';state.channel='邮件'}
 if(value==='no-score')gofo.survey='unscored';
 if(value==='version'){gofo.survey='versioned';gofo.version='v2';state.channel='Custom Chat'}
 if(value==='no-survey'){state.channel='LINE';gofo.survey=''}
 gofoLastChannel=state.channel;gofoSync();render();if(value==='error')gofoQuery();
}
$('#gofoScenario').onchange=e=>gofoScenario(e.target.value);
window.addEventListener('storage',e=>{if(e.key===G.KEY){gofoReconcile();render()}});
window.addEventListener('focus',()=>{gofoReconcile();render()});
window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);gofo.screen=p.get('page')||'report';gofo.id=p.get('id')||'';render()});
if(gofoParams.has('scenario')){const scenario=gofoParams.get('scenario');$('#gofoScenario').value=scenario;gofoScenario(scenario)}else render();
