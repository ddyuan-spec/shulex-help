// In-memory unit verification only; no browser data or staging requests.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),data=new Map();
const localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
function runtime(tenant='tenant-shulex-home',kb='kb-shulex-home-help',query=''){
 const c={localStorage,URL,location:{href:'http://localhost/index.html'+query},Event:class{},CustomEvent:class{},console};c.window=c;c.dispatchEvent=()=>{};c.document={body:{replaceChildren(){},append(){}},createElement:()=>({setAttribute(){}})};vm.createContext(c);
 for(const file of ['tenant-context.js','workflow-store.js','learning-store.js']){let code=fs.readFileSync(path.join(root,file),'utf8');if(file==='tenant-context.js')code=code.replace("tenantId:'tenant-shulex-home'",'tenantId:'+JSON.stringify(tenant)).replace("knowledgeBaseId:'kb-shulex-home-help'",'knowledgeBaseId:'+JSON.stringify(kb));vm.runInContext(code,c,{filename:file});}
 return c;
}
const a=runtime(),b=runtime('tenant-b','kb-b'),otherKb=runtime('tenant-shulex-home','kb-private');
data.set('shulex-demo-tickets',JSON.stringify([{id:'UNSCOPED'}]));data.set('shulex-selflearning-v2',JSON.stringify({topics:[],faqs:[{question:'共同问题',answer:'旧答案',published:true}]}));
assert.equal(a.Workflow.tickets().length,0);assert.equal(a.Learning.findPublished('共同问题'),undefined);
function ticket(c,answer){c.Workflow.createTicket({id:'SAME-ID',context:{scenario:'noRecall',question:'共同问题'},description:'共同问题',messages:[],attachments:[]});c.Workflow.updateTicket('SAME-ID',t=>{t.messages.push({role:'support',body:answer,time:new Date().toISOString()});return t;});}
ticket(a,'租户甲的答复：请通过甲的专属渠道查询产品使用说明，并按甲的服务指引处理。');
ticket(b,'租户乙的答复：请通过乙的专属渠道查询产品使用说明，并按乙的服务指引处理。');
a.Learning.setAutoAdd(true);assert.equal(b.Learning.read().settings.autoAdd,false);assert.equal(otherKb.Learning.read().settings.autoAdd,false);
assert.equal(a.Learning.runDaily().autoAdded,1);assert.equal(b.Learning.runDaily().autoAdded,0);
assert.match(a.Learning.findPublished('共同问题').answer,/租户甲/);assert.equal(b.Learning.findPublished('共同问题'),undefined);
b.Learning.add(b.Learning.read().topics[0].id);assert.match(b.Learning.findPublished('共同问题').answer,/租户乙/);
assert.equal(otherKb.Workflow.tickets().length,0);assert.equal(otherKb.Learning.findPublished('共同问题'),undefined);
assert.equal(a.Learning.runDaily().created,0);assert.equal(b.Learning.runDaily().created,0);
assert.throws(()=>a.Learning.add(b.Learning.read().topics[0].id));
assert.throws(()=>a.Workflow.createTicket({id:'foreign',tenantId:'tenant-b'}));
assert.throws(()=>a.Workflow.updateTicket('SAME-ID',t=>({...t,knowledgeBaseId:'kb-b'})));
assert.throws(()=>a.Tenant.assert({tenantId:'tenant-b',knowledgeBaseId:'kb-b'}));
assert.throws(()=>a.Tenant.assert({}));assert.throws(()=>runtime('','',''));
assert.throws(()=>runtime('tenant-shulex-home','kb-shulex-home-help','?tenantId=tenant-b'));
assert.throws(()=>runtime('tenant-shulex-home','kb-shulex-home-help','?knowledgeBaseId=kb-private'));
const poisoned=JSON.parse(data.get(a.Learning.key));poisoned.faqs.push(b.Learning.read().faqs[0],{id:'unscoped',published:true});data.set(a.Learning.key,JSON.stringify(poisoned));assert.equal(a.Learning.read().faqs.length,1);
a.Learning.recordUse(a.Learning.read().faqs[0].id);assert.equal(b.Learning.read().uses.length,0);assert.throws(()=>a.Learning.recordUse('foreign'));
const state=a.Learning.read();for(const value of [state,state.settings,...state.topics,...state.faqs,...state.runs,...state.uses])assert.equal(a.Tenant.owns(value),true);
const t=a.Workflow.tickets()[0];for(const value of [t,t.context,...t.messages,...t.events])assert.equal(a.Tenant.owns(value),true);
console.log('PASS: A/B same question, same ticket ID, FAQ isolation, learning/settings/metrics isolation, same-tenant other-KB rejection, missing context/link tampering, foreign/unscoped records and duplicate runs.');
