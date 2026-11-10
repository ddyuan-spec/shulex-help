'use strict';
// Incremental layer over the dashboard; the all-survey view stays intact.
const G=SAMPLE,sampleBaseRender=render;
const SAMPLE_METRIC_KEY='shared-demo.metric-display.v1',sampleMetricKeys=[...DEFAULT_METRIC_KEYS,'valid','nps'];
let sampleShownMetrics=[...DEFAULT_METRIC_KEYS],sampleMetricDraft=[];
try{const saved=JSON.parse(localStorage.getItem(SAMPLE_METRIC_KEY));if(Array.isArray(saved)&&saved.length>=1&&saved.length<=6&&new Set(saved).size===saved.length&&saved.every(k=>sampleMetricKeys.includes(k)))sampleShownMetrics=sampleMetricKeys.filter(k=>saved.includes(k))}catch{}
let sample={survey:'sample',version:'v1',answers:{},scenario:'normal'},sampleDraft={},sampleStatus='ready',sampleRequest=0,sampleSignature='',sampleLastChannel='',sampleHasChanged=false;
try{const saved=JSON.parse(localStorage.getItem(G.REPORT_KEY));if(saved){Object.assign(sample,saved.sample);Object.assign(state,saved.state)}}catch{}
if(!localStorage.getItem(G.REPORT_KEY))state.channel='WhatsApp';
sampleLastChannel=state.channel;sampleDraft=G.copy(sample.answers);
const sampleParams=new URLSearchParams(location.search);
if(sampleParams.get('scenario'))sample.scenario=sampleParams.get('scenario');
const sampleOptions=(items,value)=>items.map(([id,label])=>'<option value="'+esc(id)+'" '+(id===value?'selected':'')+'>'+esc(label)+'</option>').join('');
function sampleSurvey(){return G.effective(G.surveys().find(s=>s.id===sample.survey),sample.version)}
function sampleScope(){return{...state,version:sample.version,answers:G.copy(sample.answers)}}
function samplePersist(){try{localStorage.setItem(G.REPORT_KEY,JSON.stringify({sample,state}))}catch{toast('筛选条件暂未保存，刷新后可能丢失')}}
function sampleSync(){const u=new URL(location.href);u.search='';history.replaceState(null,'',u);samplePersist()}
function sampleSelect(survey){sampleRequest++;sample.survey=survey;sample.version=sampleSurvey()?.analysisVersion||'v1';sample.answers={};sampleDraft={};sampleSignature='';sampleStatus='ready';sampleHasChanged=false;sampleSync();render()}
function sampleReconcile(){
 if(sampleLastChannel!==state.channel){
  if(sample.survey&&!G.candidates(state.channel).some(s=>s.id===sample.survey)){sample.survey='';sample.answers={};sampleDraft={};sampleSignature='';toast('渠道已切换，原问卷不适用，已清空问卷及题目条件')}
  sampleLastChannel=state.channel;
 }
 const s=sampleSurvey();
 if(sample.survey&&!s){sampleStatus='stale';return}
 if(s&&sampleSignature&&G.signature(s)!==sampleSignature){sampleStatus='stale';sampleHasChanged=true}
 if(s&&G.invalid(s,sample.answers)){sampleStatus='stale';sampleHasChanged=true}
 if(s&&!sampleSignature)sampleSignature=G.signature(s);
}
function sampleQuery(){
 const s=sampleSurvey();if(!s)return;
 if(sampleHasChanged||G.invalid(s,sampleDraft)||sampleSignature!==G.signature(s)){sampleStatus='stale';render();return}
 sample.answers=G.copy(sampleDraft);const token=++sampleRequest;sampleStatus='loading';sampleSync();render();
 setTimeout(()=>{if(token!==sampleRequest)return;sampleStatus=sample.scenario==='error'?'error':'ready';samplePersist();render()},240);
}
function sampleFilters(s){
 const list=G.candidates(state.channel),surveyControl='<div class="chip"><label for="sampleSurvey">满意度问卷</label><select id="sampleSurvey" aria-label="满意度问卷">'+sampleOptions([['','全部问卷'],...list.map(s=>[s.id,s.name+(s.enabled?'':' · 已停用')])],sample.survey)+'</select></div>';
 const dates='<div class="chip date"><span data-icon="calendar"></span><label for="samplePeriod">提交日期</label><select id="samplePeriod" aria-label="提交日期">'+sampleOptions([['30','近30天'],['7','近7天'],['custom','自定义']],state.start==='2026-10-01'&&state.end==='2026-10-30'?'30':state.start==='2026-10-24'&&state.end==='2026-10-30'?'7':'custom')+'</select></div>';
 if(!s)return surveyControl;
 return '<div class="filters">'+dates+filter('团队','team',teams,'user')+filter('处理人','agent',agents,'user')+filter('渠道','channel',[...channels,'LINE'],'channel')+surveyControl+'<div class="chip muted-filter">售后邮箱⌄</div><div class="chip muted-filter">平台⌄</div><div class="chip muted-filter">店铺⌄</div><button id="sampleResetAll" class="link reset">重置</button></div>'+
 '<div class="sample-dates" '+(state.start==='2026-10-01'&&state.end==='2026-10-30'?'hidden':'')+' id="sampleCustomDates"><input type="date" aria-label="提交开始日期" id="sampleStart" value="'+esc(state.start)+'"><span>—</span><input type="date" aria-label="提交结束日期" id="sampleEnd" value="'+esc(state.end)+'"><button id="sampleDateApply">应用</button></div>'+
 (s.analysisVersions?'<div class="filters"><div class="chip"><label for="sampleVersion">问卷版本</label><select id="sampleVersion">'+sampleOptions(s.analysisVersions,sample.version)+'</select></div></div>':'')+
 '<div class="sample-question-filters">'+(G.enabled(s).length?G.enabled(s).map((q,i)=>{
  const selected=sampleDraft[q.id]||[],opts=G.values(q);return '<details class="answer-picker" data-question="'+esc(q.id)+'"><summary>Q'+(G.qs(s).indexOf(q)+1)+' '+esc(q.title)+(selected.length?' · '+selected.length+'项':'')+' ⌄</summary><div class="answer-menu">'+opts.map(([id,label])=>'<label><input type="checkbox" data-sample-answer="'+esc(q.id)+'" value="'+esc(id)+'" '+(selected.includes(id)?'checked':'')+'>'+esc(label)+'</label>').join('')+'<footer><button data-clear-question="'+esc(q.id)+'">清空</button><button class="primary" data-apply-question="'+esc(q.id)+'">应用</button></footer></div></details>'
 }).join(''):'<div class="sample-inline-state">未设置分析筛选项</div>')+'<button class="link sample-reset" id="sampleResetAnswers">重置题目条件</button></div>';
}
function sampleBindFilters(s){
 $('#sampleSurvey')?.addEventListener('change',e=>sampleSelect(e.target.value));
 if(!s)return;
 for(const key of ['team','agent','channel'])$('#'+key)?.addEventListener('change',e=>{state[key]=e.target.value;sampleRequest++;sampleStatus='ready';render();samplePersist()});
 $('#samplePeriod')?.addEventListener('change',e=>{if(e.target.value==='custom'){$('#sampleCustomDates').hidden=false;return}state.start=e.target.value==='7'?'2026-10-24':'2026-10-01';state.end='2026-10-30';sampleQuery()});
 $('#sampleDateApply')?.addEventListener('click',()=>{const start=$('#sampleStart').value,end=$('#sampleEnd').value;if(!start||!end||start>end){toast('请选择有效的开始和结束日期');return}state.start=start;state.end=end;sampleQuery()});
 $('#sampleVersion')?.addEventListener('change',e=>{sample.version=e.target.value;sample.answers={};sampleDraft={};sampleSignature='';sampleHasChanged=false;sampleReconcile();sampleQuery()});
 $('#sampleResetAnswers')?.addEventListener('click',()=>{sampleDraft={};sampleQuery()});
 $('#sampleResetAll')?.addEventListener('click',()=>{state=defaultState();sampleSelect('')});
 document.querySelectorAll('[data-sample-answer]').forEach(input=>input.addEventListener('change',()=>{const id=input.dataset.sampleAnswer,prior=sampleDraft[id]||[];sampleDraft[id]=input.checked?[...new Set([...prior,input.value])]:prior.filter(x=>x!==input.value)}));
 document.querySelectorAll('[data-clear-question]').forEach(b=>b.addEventListener('click',()=>{sampleDraft[b.dataset.clearQuestion]=[];render()}));
 document.querySelectorAll('[data-apply-question]').forEach(b=>b.addEventListener('click',sampleQuery));
}
function sampleApplied(s){return '<div class="sample-active"><span>'+esc(state.channel||'全部渠道')+'</span><span>'+esc(s.name)+'</span>'+Object.entries(sample.answers).filter(([,v])=>v.length).map(([id,selected])=>{const q=G.qs(s).find(q=>q.id===id);return '<span>'+esc(q?.title||id)+'：'+selected.map(v=>esc(q?G.values(q).find(x=>x[0]===v)?.[1]||v:v)).join('、')+'</span>'}).join('')+'</div>'}
const sampleMetricDefinitions={
 valid:{label:'有效评分答卷数',formula:'当前筛选条件下，评分题有有效答案的正式答卷数。每份答卷只计一次；0 分有效，未作答不计。没有有效评分时显示 0，未配置评分来源时显示“—”。'},
 nps:{label:'NPS',formula:'0–5 分的评分题先乘 2 换算为 0–10 分。同一答卷有多道纳入客服考核的评分题时，换算后取有效评分的平均值。NPS =（≥9 分答卷数 − ≤6 分答卷数）÷ 有效评分答卷数 × 100；其余有效评分也计入分母。'},
 rate:{label:'9–10 分占比',formula:'当前样本的 9–10 分份数 ÷ 当前样本有效评分份数 × 100%。无有效评分分母时显示“—”。'}
};
function sampleMetricHelp(key){const d=sampleMetricDefinitions[key];return '<button class="metric-help" type="button" data-sample-help="'+key+'" aria-label="'+d.label+'的计算方式" aria-describedby="metricTooltip"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.2v4.3M8 11.1h.01"/></svg></button>'}
function sampleMetric(key,label,value,note){return '<article class="metric" data-metric="'+key+'"><div class="label"><span>'+label+'</span>'+sampleMetricHelp(key)+'</div><strong>'+value+'</strong></article>'}
function sampleMetricSettings(){return '<div class="sample-stat-controls"><details class="answer-picker" id="sampleMetricSettings"><summary>设置统计</summary><div class="answer-menu"><div class="sample-stat-count" id="sampleMetricCount"></div>'+sampleMetricKeys.map(k=>'<label><input type="checkbox" data-metric-choice="'+k+'">'+esc((definitions[k]||sampleMetricDefinitions[k]).label)+'</label>').join('')+'<footer><button id="sampleMetricCancel">取消</button><button class="primary" id="sampleMetricSave">应用</button></footer></div></details></div>'}
function sampleUpdateMetricDraft(){document.querySelectorAll('[data-metric-choice]').forEach(el=>{el.checked=sampleMetricDraft.includes(el.dataset.metricChoice);el.disabled=!el.checked&&sampleMetricDraft.length>=6});$('#sampleMetricCount').textContent='已选 '+sampleMetricDraft.length+' / 6';$('#sampleMetricSave').disabled=!sampleMetricDraft.length}
function sampleBindMetricSettings(){const panel=$('#sampleMetricSettings');if(!panel)return;sampleMetricDraft=[...sampleShownMetrics];sampleUpdateMetricDraft();panel.addEventListener('toggle',()=>{if(panel.open){sampleMetricDraft=[...sampleShownMetrics];sampleUpdateMetricDraft()}});document.querySelectorAll('[data-metric-choice]').forEach(el=>el.onchange=()=>{const key=el.dataset.metricChoice;if(el.checked&&!sampleMetricDraft.includes(key)&&sampleMetricDraft.length<6)sampleMetricDraft.push(key);if(!el.checked)sampleMetricDraft=sampleMetricDraft.filter(k=>k!==key);sampleUpdateMetricDraft()});$('#sampleMetricCancel').onclick=()=>{panel.open=false;sampleMetricDraft=[...sampleShownMetrics];sampleUpdateMetricDraft()};$('#sampleMetricSave').onclick=()=>{const next=sampleMetricKeys.filter(k=>sampleMetricDraft.includes(k));if(!next.length||next.length>6)return;try{localStorage.setItem(SAMPLE_METRIC_KEY,JSON.stringify(next))}catch{toast('统计设置保存失败，请重试');return}sampleShownMetrics=next;render()}}
function sampleMetricCards(s){const st=s?G.stats(G.filter(G.rows,s,sampleScope()),s,sample.version):null,legacy=stats(cohort()),source=s&&G.source(s,sample.version);return sampleShownMetrics.map(key=>{if(DEFAULT_METRIC_KEYS.includes(key))return '<article class="metric" data-metric="'+key+'"><div class="label"><span>'+definitions[key].label+'</span>'+help(key)+'</div><strong>'+(s?'—':legacy[key])+'</strong></article>';return sampleMetric(key,sampleMetricDefinitions[key].label,key==='valid'?(source?String(st.valid):'—'):(source?sampleSigned(st.nps):'—'),'')}).join('')}
function sampleLegacyCharts(){return '<section class="card trend-card"><div class="card-heading"><h3>按日期好评率和已填写邀评数量</h3><div class="seg"><button data-grain="day" class="'+(state.grain==='day'?'active':'')+'">按日</button><button data-grain="month" class="'+(state.grain==='month'?'active':'')+'">按月</button></div></div><div class="legend"><span><i class="dot" style="background:#606bff"></i>好评率</span><span><i class="dot" style="background:#687b9e"></i>已填写邀评数量</span></div><div class="empty">待确认问卷 / 答案与邀评链接的关联口径</div></section><div class="lower-charts">'+['按团队好评率 Top 10','按渠道好评率 Top 10'].map(title=>'<section class="card"><div class="card-heading"><h3>'+title+'</h3></div><div class="empty">待确认同条件统计口径</div></section>').join('')+'</div>'}
let sampleTooltipTimer;
function sampleShowMetricTooltip(button){
 clearTimeout(sampleTooltipTimer);
 if(!button.dataset.sampleHelp){showTooltip(button);if(sample.survey){const tip=$('#metricTooltip');tip.innerHTML='<strong>'+definitions[button.dataset.help].label+'</strong><div class="tooltip-formula">'+definitions[button.dataset.help].formula+'</div><p>'+definitions[button.dataset.help].detail+'</p><p>当前选定问卷：旧指标关联与日期口径待开发确认，暂不展示数值；不以筛后答卷数替代发送分母。示例好评阈值需另行确认。</p>'}return}
 const key=button.dataset.sampleHelp,def=sampleMetricDefinitions[key],s=sampleSurvey(),st=s?G.stats(G.filter(G.rows,s,sampleScope()),s,sample.version):{valid:0},tip=$('#metricTooltip');
 const sample=key==='rate'&&st.valid?'当前范围：'+st.high+' ÷ '+st.valid+' × 100% = '+st.rate.toFixed(1)+'%':key==='nps'&&st.valid?'当前范围：('+st.high+' − '+st.low+') ÷ '+st.valid+' × 100 = '+sampleSigned(st.nps):'';
 tip.innerHTML='<strong>'+def.label+'</strong><div class="tooltip-formula">'+def.formula+'</div>'+(sample?'<p>'+sample+'</p>':'');tip.hidden=false;
 const rect=button.getBoundingClientRect(),box=tip.getBoundingClientRect();tip.style.left=Math.max(12,Math.min(rect.left-16,innerWidth-box.width-12))+'px';tip.style.top=(rect.bottom+10+box.height<innerHeight?rect.bottom+10:Math.max(12,rect.top-box.height-10))+'px';
}
function sampleScheduleTooltipHide(){clearTimeout(sampleTooltipTimer);sampleTooltipTimer=setTimeout(hideTooltip,120)}
function sampleBindMetricHelp(){
 clearTimeout(sampleTooltipTimer);
 document.querySelectorAll('[data-help],[data-sample-help]').forEach(b=>{
  b.querySelector('svg path')?.setAttribute('d','M8 4.2v4.3M8 11.1h.01');
  b.onmouseenter=()=>sampleShowMetricTooltip(b);b.onmouseleave=sampleScheduleTooltipHide;b.onfocus=()=>sampleShowMetricTooltip(b);b.onblur=sampleScheduleTooltipHide;b.onclick=()=>sampleShowMetricTooltip(b);
 });
 const tip=$('#metricTooltip');tip.onmouseenter=()=>clearTimeout(sampleTooltipTimer);tip.onmouseleave=sampleScheduleTooltipHide;
}
function sampleSigned(n){return n===null?'—':(n>0?'+':'')+Number(n.toFixed(1))}
function sampleResults(s){
 if(sampleStatus==='review')return '<div class="sample-loading"><span>筛选配置已刷新，请核对条件。</span><button id="sampleApplyReviewed">应用筛选并查询</button></div>';
 if(sampleStatus==='loading')return '<div class="sample-loading"><div class="sample-spinner"></div><span>正在查询答卷…</span></div>';
 if(sampleStatus==='error')return '<div class="sample-error"><strong>查询失败</strong><p>筛选条件已保留，请重试。</p><button id="sampleRetry">重新查询</button></div>';
 if(sampleStatus==='stale')return '<div class="sample-error"><strong>筛选配置已变化</strong><p>请刷新筛选配置并核对条件后重新查询。</p><button id="sampleRefreshConfig">刷新筛选配置</button></div>';
 const rows=G.filter(G.rows,s,sampleScope()),st=G.stats(rows,s,sample.version),source=G.qs(s).find(q=>q.id===G.source(s,sample.version));
 return '<div class="sample-toolbar"><div><h2>'+esc(s.name)+'</h2><p>'+state.start+' — '+state.end+' · 已提交答卷 '+st.total+'份'+(source?' · 评分题：'+esc(source.title):'')+'</p></div></div>'+sampleApplied(s)+
 (!source?'<div class="sample-warning">未配置评分来源，有效评分答卷数与NPS暂不计算。</div>':'')+
 (sample.answers[source?.id]?.length?'<div class="sample-warning">当前已按评分筛选样本，NPS仅代表这些答卷。</div>':'')+
 sampleMetricSettings()+'<section class="metrics sample-metrics" aria-label="满意度统计">'+sampleMetricCards(s)+'</section>'+sampleLegacyCharts();
}
function sampleBindResults(){
 $('#sampleRetry')?.addEventListener('click',()=>{sample.scenario='normal';$('#sampleScenario').value='normal';sampleQuery()});
 $('#sampleRefreshConfig')?.addEventListener('click',()=>{sampleHasChanged=false;sampleSignature='';sampleStatus='review';sample.answers={};sampleDraft={};render()});
 $('#sampleApplyReviewed')?.addEventListener('click',sampleQuery);
 sampleBindMetricHelp();sampleBindMetricSettings();document.querySelectorAll('[data-grain]').forEach(b=>b.onclick=()=>{state.grain=b.dataset.grain;render()});
}
function sampleFrame(){
 $('.top .title').textContent='工作台看板';$('.side').innerHTML=reportSide;$('.sub').innerHTML=reportSub;$('#topTabs').style.display='flex';$('#pageTitle').textContent='工单';
}
function sampleRender(){
 hideTooltip();sampleReconcile();const s=sampleSurvey();
 if(!sample.survey){
  sampleBaseRender();
  const surveyUI=document.createElement('div');surveyUI.innerHTML=sampleFilters(null);$('#channel')?.closest('.chip')?.after(surveyUI.firstElementChild);sampleBindFilters(null);
  if(!G.candidates(state.channel).length){const n=document.createElement('div');n.className='sample-inline-state';n.textContent='该渠道暂无可分析问卷';$('.filters').after(n)}
  const cards=$('.metrics');cards.insertAdjacentHTML('beforebegin',sampleMetricSettings());cards.innerHTML=sampleMetricCards(null);sampleBindMetricSettings();sampleBindMetricHelp();samplePersist();return;
 }
 sampleFrame();if(!s){$('#page').innerHTML='<div class="sample-error">问卷已不可用，请重新选择。<button id="sampleSelectAgain">选择问卷</button></div>';$('#sampleSelectAgain').onclick=()=>sampleSelect('');return}
 $('#page').innerHTML=sampleFilters(s)+sampleResults(s);sampleBindFilters(s);sampleBindResults()
 drawIcons();samplePersist();
}
render=sampleRender;
document.body.classList.add('review-report');
const review=document.createElement('div');review.className='reviewbar';review.innerHTML='<a href="../solution.html#prototype-analysis" target="_top">← 返回完整方案</a><span>演示数据</span><label>验收场景 <select id="sampleScenario">'+sampleOptions([['normal','整体 / 客服样本'],['empty','零命中答卷'],['error','查询失败与重试'],['no-filter','未设置筛选项'],['no-score','有答卷无评分'],['version','不兼容量表版本'],['no-survey','渠道无关联问卷']],'normal')+'</select></label>';document.body.prepend(review);
function sampleScenario(value){
 sampleRequest++;sampleHasChanged=false;sampleStatus='ready';sampleSignature='';sample.answers={};sampleDraft={};state=defaultState();state.channel='WhatsApp';sample.survey='sample';sample.version='v1';sample.scenario=value;
 if(value==='empty')state.start=state.end='2026-09-01';
 if(value==='no-filter'){sample.survey='email';state.channel='邮件'}
 if(value==='no-score')sample.survey='unscored';
 if(value==='version'){sample.survey='versioned';sample.version='v2';state.channel='Custom Chat'}
 if(value==='no-survey'){state.channel='LINE';sample.survey=''}
 sampleLastChannel=state.channel;sampleSync();render();if(value==='error')sampleQuery();
}
$('#sampleScenario').onchange=e=>sampleScenario(e.target.value);
window.addEventListener('storage',e=>{if(e.key===G.KEY){sampleReconcile();render()}});
window.addEventListener('focus',()=>{sampleReconcile();render()});
if(sampleParams.has('scenario')){const scenario=sampleParams.get('scenario');$('#sampleScenario').value=scenario;sampleScenario(scenario)}else render();
