(() => {
  const pages=window.solveaReplica;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button=(label,key,primary=false)=>'<button type="button" class="replica-button'+(primary?' primary':'')+'" data-action="'+key+'">'+label+'</button>';
  const read=(key,fallback)=>{try{return JSON.parse(sessionStorage.getItem('settings-v7/'+key))??fallback;}catch{return fallback;}};
  const write=(key,value)=>sessionStorage.setItem('settings-v7/'+key,JSON.stringify(value));
  const nav=(route)=>'#'+(location.hash.startsWith('#legacy/')?'legacy/':'')+route;
  const body=(root,title,content,action='')=>{root.innerHTML='<div class="replica-head"><h1>'+title+'</h1>'+action+'</div><div class="replica-body">'+content+'</div>';};
  const input=(name,label,value='',type='text',extra='')=>'<label class="field-label">'+label+'<input class="replica-field" name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+extra+'></label>';
  const select=(name,label,values,current)=>'<label class="field-label">'+label+'<select class="replica-field" name="'+name+'">'+values.map(([v,l])=>'<option value="'+esc(v)+'"'+(v===current?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select></label>';
  const form=(fields,submit='保存',cancel=true)=>'<form class="replica-form">'+fields+'<p role="alert"></p><div class="replica-toolbar">'+(cancel?button('取消','cancel'):'')+'<button class="replica-button primary" type="submit">'+submit+'</button></div></form>';
  const table=(head,rows)=>'<div class="replica-table-wrap"><table class="replica-table"><thead><tr>'+head.map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(c=>'<tr>'+c.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  const link=(label,route)=>'<a class="replica-button" href="'+nav(route)+'">'+label+'</a>';
  const domains=[['DESK','工单域'],['AGENT','Agent 域'],['KNOWLEDGE_BASE','知识库域']];
  const initialApp={id:'demo-app',name:'售后服务应用',domains:['DESK']};
  const initialHooks=[{id:'demo',name:'售后通知',url:'https://support.example.test/events',description:'工单事件',enabled:true,subscriptions:[{id:'demo-sub',type:'CUSTOM_EVENT',domain:'DESK',event:'custom.ticket.closed',version:'1.0',status:'ENABLED',self:'DELIVER'}]}];
  window.platformTriggerOptions=()=>read('app',initialApp)?.domains?.includes('DESK')?read('hooks',initialHooks).filter(h=>h.enabled).flatMap(h=>h.subscriptions.filter(s=>s.type==='CUSTOM_EVENT'&&s.domain==='DESK'&&s.status==='ENABLED').map(s=>({value:'openapi:'+h.id+':'+s.event,label:h.name+' · '+s.event,subscriptionId:s.id}))):[];

  pages['channel/connections']=root=>{
    const stores=[['Amazon','Demo Store','已授权','2026-11-05'],['Shopify','Demo Outlet','已授权','2026-11-06']];
    body(root,'渠道连接','<div class="replica-toolbar"><input type="search" class="replica-field" placeholder="搜索渠道或店铺" aria-label="搜索渠道或店铺"></div><div data-stores></div>');
    const search=root.querySelector('input');
    const render=()=>{root.querySelector('[data-stores]').innerHTML=table(['渠道','店铺','授权状态','授权时间','操作'],stores.filter(r=>r.join(' ').toLowerCase().includes(search.value.toLowerCase().trim())).map(r=>[...r,button('详情','store-'+stores.indexOf(r))]));};
    search.oninput=render;render();
    root.onclick=e=>{const a=e.target.closest('button')?.dataset.action;if(!a?.startsWith('store-'))return;const [provider,name,status,date]=stores[Number(a.slice(6))];body(root,provider+' 渠道详情',table(['店铺','授权状态','授权时间'],[[name,status,date]]),button('返回','back'));root.querySelector('[data-action=back]').onclick=()=>pages['channel/connections'](root);};
  };
  pages['channel/livechat']=root=>{
    const configs=read('chat',[{name:'官网售后',id:'Demo Bot',brand:'Demo Store'}]);
    const sections=['Install & Preview','Set Agent Working Hours','Appearance And Personalization','Automation Settings','Marketing Configuration'];
    function open(i){
      const c=configs[i]??{name:'',id:'Demo Bot',brand:'Demo Store'};
      body(root,i<0?'LiveChat Connection':'LiveChat Configuration',form(input('name','Name',c.name,'text','required')+input('brand','Brand',c.brand,'text','required'))+'<div class="config-panel"><h2>Initialization</h2>'+sections.slice(0,2).map(s=>'<p>'+s+'</p>').join('')+'<h2>Function Configuration</h2>'+sections.slice(2).map(s=>'<p>'+s+'</p>').join('')+'</div>',button('返回','back'));
      root.querySelector('[data-action=back]').onclick=list;
      root.querySelector('[data-action=cancel]').onclick=list;
      root.querySelector('form').onsubmit=e=>{e.preventDefault();const next={...c,...Object.fromEntries(new FormData(e.currentTarget))};if(i<0)configs.push(next);else configs[i]=next;write('chat',configs);list();};
    }
    function list(){body(root,'LiveChat',table(['Name','Bot ID','Brand','Status',''],configs.map((c,i)=>[esc(c.name),esc(c.id),esc(c.brand),'Connected',button('Configure →','edit-'+i)])),button('＋ Livechat','new',true));root.onclick=e=>{const a=e.target.closest('button')?.dataset.action;if(a==='new')open(-1);if(a?.startsWith('edit-'))open(Number(a.slice(5)));};}
    list();
  };
  pages['platform/qualification']=root=>{
    function render(message=''){
      const app=read('app',initialApp);
      body(root,'申请开放平台资格','<p role="status">'+esc(message)+'</p>'+(app?
        '<section class="config-panel"><h2>当前租户已有应用</h2><p>应用名称：<strong>'+esc(app.name)+'</strong></p><p>client_id：demo-client-id</p></section><section class="config-panel"><h2>配置工作域权限</h2>'+form(domains.map(([key,label])=>'<label class="field-label inline"><input type="checkbox" name="domain" value="'+key+'"'+(app.domains.includes(key)?' checked':'')+'> '+label+'</label>').join(''),'保存更改',false)+'</section>':
        '<section class="config-panel"><h2>创建开放平台应用</h2>'+form(input('name','应用名称','','text','required maxlength="128"'),'创建应用并签发凭据',false)+'</section>')+
        '<div class="replica-toolbar">'+(app?link('Webhook','platform/webhook')+link('API 文档','platform/docs'):'')+button(app?'查看未开通示例':'查看已开通示例','example')+'</div>');
      root.querySelector('[data-action=example]').onclick=()=>{write('app',app?false:initialApp);render();};
      root.querySelector('form').onsubmit=e=>{
        e.preventDefault();const data=new FormData(e.currentTarget);
        if(!app){const name=data.get('name').trim();if(!name){e.currentTarget.querySelector('[role=alert]').textContent='请输入应用名称';return;}write('app',{id:'demo-app',name,domains:[]});render('示例应用已创建');return;}
        const chosen=data.getAll('domain');if(!chosen.length){e.currentTarget.querySelector('[role=alert]').textContent='请至少选择一个工作域';return;}
        write('app',{...app,domains:chosen});render('已保存工作域权限（本地示例）');
      };
    }
    render();
  };

  pages['platform/webhook']=root=>{
    let rows=read('hooks',initialHooks);
    const app=read('app',initialApp);
    if(!app){body(root,'Webhook','<p>请先创建开放平台应用，再配置 Webhook。</p>'+link('申请开放平台资格','platform/qualification'));return;}
    function save(){write('hooks',rows);}
    function list(message=''){
      body(root,'Webhook','<div class="replica-toolbar"><strong>Webhook Endpoints</strong><span class="push"></span>'+button('查看回调事件','events')+'</div><p role="status">'+esc(message)+'</p>'+
        table(['名称','Endpoint URL','订阅事件','Endpoint 状态','操作'],rows.length?rows.map((r,i)=>[esc(r.name),esc(r.url),esc(r.subscriptions.map(s=>s.event).join('、'))||'—',r.enabled?'启用':'停用',button('编辑','endpoint-'+i)+' '+button('消息订阅','subs-'+i)]):[['尚未配置 Webhook Endpoint','','','','']]),button('添加 Endpoint','new',true));
      root.onclick=e=>{const a=e.target.closest('button')?.dataset.action;if(a==='new')endpoint(-1);if(a==='events')events();if(a?.startsWith('endpoint-'))endpoint(Number(a.slice(9)));if(a?.startsWith('subs-'))subscriptions(Number(a.slice(5)));};
    }
    function bindEditor(back,onSave){
      root.onclick=null;
      root.querySelector('[data-action=back]').onclick=()=>back();
      root.querySelector('[data-action=cancel]').onclick=()=>back();
      root.querySelector('form').onsubmit=e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.currentTarget));const message=onSave(values);if(message)e.currentTarget.querySelector('[role=alert]').textContent=message;};
    }
    function endpoint(i){
      const r=rows[i]||{enabled:true,subscriptions:[]};
      body(root,i<0?'添加 Webhook Endpoint':'编辑 Webhook Endpoint',form(input('name','名称',r.name,'text','required')+input('url','Endpoint URL',r.url,'url','required pattern="https?://.+"')+input('description','描述（选填）',r.description)+
        select('enabled','Endpoint 状态',[['true','启用'],['false','停用']],String(r.enabled))),button('返回','back'));
      bindEditor(list,v=>{
        if(!v.name.trim())return '请输入 Endpoint 名称';
        const next={...r,...v,name:v.name.trim(),enabled:v.enabled==='true',id:r.id||crypto.randomUUID()};
        if(i<0)rows.push(next);else rows[i]=next;save();list('Webhook Endpoint 已保存');
      });
    }
    function subscriptions(i,message=''){
      const r=rows[i];
      body(root,'消息订阅','<p><strong>'+esc(r.name)+'</strong> · '+esc(r.url)+'</p><p role="status">'+esc(message)+'</p>'+
        table(['事件类型','工作域','事件 Code','版本','订阅状态','操作'],r.subscriptions.length?r.subscriptions.map((s,j)=>[s.type==='CUSTOM_EVENT'?'自定义事件':'标准事件',esc(domains.find(([key])=>key===s.domain)?.[1]||s.domain),esc(s.event),esc(s.version),s.status==='ENABLED'?'启用':'停用',button('编辑','edit-'+j)]):[['暂无订阅','','','','','']]),
        '<div>'+button('返回','back')+' '+button('添加订阅','new',true)+'</div>');
      root.onclick=e=>{const a=e.target.closest('button')?.dataset.action;if(a==='back')list();if(a==='new')subscription(i,-1);if(a?.startsWith('edit-'))subscription(i,Number(a.slice(5)));};
    }
    function subscription(i,j){
      const subs=rows[i].subscriptions,s=subs[j]||{type:'CUSTOM_EVENT',domain:'DESK',version:'1.0',status:'ENABLED',self:'IGNORE'};
      const back=()=>subscriptions(i);
      body(root,j<0?'添加订阅':'编辑订阅',form(select('type','事件类型',[['CUSTOM_EVENT','自定义事件'],['STANDARD_EVENT','标准事件']],s.type)+select('domain','工作域',domains,s.domain)+
        input('event','事件 Code',s.event,'text','required')+input('version','事件版本',s.version,'text','required')+select('status','订阅状态',[['ENABLED','启用'],['DISABLED','停用']],s.status)+select('self','自身事件',[['IGNORE','忽略'],['DELIVER','仍然投递']],s.self)),button('返回','back'));
      const editor=root.querySelector('form');
      function syncType(){editor.elements.self.disabled=editor.elements.type.value==='CUSTOM_EVENT';}
      editor.elements.type.onchange=syncType;syncType();
      bindEditor(back,v=>{
        v.event=v.event.trim();v.version=v.version.trim();
        if(!v.event||!v.version)return '请输入事件 Code 和版本';
        if(v.type==='CUSTOM_EVENT'&&!/^custom\.[A-Za-z0-9_.-]+$/.test(v.event))return '事件 Code 必须以 custom. 开头';
        if(v.type==='STANDARD_EVENT'&&!(v.domain==='DESK'&&v.event==='desk.ticket.reply.created'))return '本地标准事件示例：工单域 desk.ticket.reply.created';
        if(subs.some((x,k)=>k!==j&&x.type===v.type&&x.domain===v.domain&&x.event===v.event&&x.version===v.version))return '已存在相同订阅';
        const next={...v,self:v.type==='CUSTOM_EVENT'?'DELIVER':v.self,id:s.id||crypto.randomUUID()};if(j<0)subs.push(next);else subs[j]=next;save();subscriptions(i,'订阅已保存');
      });
    }
    function events(){
      root.onclick=null;body(root,'Webhook 回调事件',table(['事件 ID','Webhook','事件 Code','状态'],[['evt_demo_01','售后通知','custom.ticket.closed','投递成功（示例）']]),button('返回','back'));
      root.querySelector('[data-action=back]').onclick=()=>list();
    }
    list();
  };
})();
