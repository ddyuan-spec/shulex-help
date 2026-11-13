(() => {
  const replicas = window.solveaReplica ||= {};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const heading = (title, back = false) => '<div class="replica-head"><h1>' + esc(title) + '</h1>' + (back ? '<button type="button" class="replica-button" data-back>返回</button>' : '') + '</div>';
  const button = (text, attr, main = false) => '<button type="button" class="replica-button'+(main?' primary':'')+'" '+attr+'>'+esc(text)+'</button>';
  const field = (name, label, type = 'text', options = [], required = false) => ({name,label,type,options,required});
  const list = (id, seed) => {
    try { return JSON.parse(sessionStorage.getItem('solvea-v6/'+id)) || seed; } catch { return seed; }
  };
  const keep = (id, values) => { try { sessionStorage.setItem('solvea-v6/'+id,JSON.stringify(values)); } catch {} };
  function input(f, value) {
    const base = 'name="'+f.name+'" class="replica-field"'+(f.required?' required':'');
    const options = f.options.map(x => '<option'+(String(value)===x?' selected':'')+'>'+esc(x)+'</option>').join('');
    if (f.type === 'select') return '<select '+base+'>'+options+'</select>';
    if (f.type === 'multi') return '<select '+base+' multiple>'+f.options.map(x=>'<option'+(String(value??'').split('、').includes(x)?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select>';
    if (f.type === 'textarea') return '<textarea '+base+' rows="4">'+esc(value)+'</textarea>';
    if (f.type === 'checkbox') return '<input type="checkbox" name="'+f.name+'"'+(value===true || value==='启用'?' checked':'')+'>';
    return '<input type="'+f.type+'" '+base+' value="'+esc(value)+'"'+(f.type==='number'?' min="0"':'')+(f.pattern?' pattern="'+esc(f.pattern)+'"':'')+'>';
  }
  function collection(id, cfg) {
    replicas[id] = root => {
      let records = list(id, cfg.rows);
      let query = '';
      function table(focusBack = false) {
        const add = cfg.add ? button(cfg.add,'data-new',true) : '';
        const search = cfg.search ? '<input type="search" class="replica-field" aria-label="'+esc(cfg.search)+'" placeholder="'+esc(cfg.search)+'" value="'+esc(query)+'">' : '';
        root.innerHTML=heading(cfg.title)+'<div class="replica-body">'+(cfg.prefix?.(id.endsWith('/fields')?'fields':null) || '')+
          ((search||add)?'<div class="replica-toolbar">'+search+'<span class="push"></span>'+add+'</div>':'')+
          '<div class="replica-table-wrap"><table class="replica-table"><thead><tr>'+cfg.cols.map(([,c])=>'<th scope="col">'+esc(c)+'</th>').join('')+
          (cfg.edit ? '<th scope="col">操作</th>' : '')+'</tr></thead><tbody></tbody></table></div></div>';
        const tbody=root.querySelector('tbody');
        const redraw=()=>{const result=(cfg.read?.(records)||records).map((rec,i)=>[rec,i]).filter(([rec])=>(!cfg.filter||cfg.filter(rec))&&(!query || Object.values(rec).some(v=>String(v).toLowerCase().includes(query))));
          tbody.innerHTML=result.length ? result.map(([rec,i])=>'<tr>'+cfg.cols.map(([k])=>'<td>'+esc(typeof rec[k]==='boolean'?(rec[k]?'启用':'停用'):rec[k])+'</td>').join('')+
            (cfg.edit?'<td>'+button('编辑','data-edit="'+i+'"')+'</td>':'')+'</tr>').join('') : '<tr><td class="empty" colspan="'+(cfg.cols.length+Number(Boolean(cfg.edit)))+'">暂无数据</td></tr>';
        };
        redraw();
        root.querySelector('[data-new]')?.addEventListener('click',()=>edit(-1));
        const filter=root.querySelector('input[type=search]');
        filter?.addEventListener('input',()=>{query=filter.value.trim().toLowerCase();redraw();});
        tbody.addEventListener('click',e=>{const el=e.target.closest('[data-edit]');if(el)edit(Number(el.dataset.edit));});
        if(focusBack) (root.querySelector('[data-edit], [data-new]')||root.querySelector('h1'))?.focus();
      }
      function edit(i) {
        const rec=i<0 ? {} : records[i];
        const save=values=>{
          const updated={...rec,...values,...(cfg.onSave?.(values,rec) || {})};
          records=i<0?[...records,updated]:records.map((x,j)=>j===i?updated:x);
          keep(id,records); table(true);
          root.querySelector('.replica-body').insertAdjacentHTML('beforeend','<p class="replica-muted" role="status">已保存</p>');
        };
        if (cfg.editor) { cfg.editor(root, rec, i<0, save, ()=>table(true)); return; }
        root.innerHTML=heading(i<0?cfg.add:(cfg.editTitle||'编辑'+cfg.title),true)+'<div class="replica-body"><form class="replica-form">'+
          cfg.fields.map(f=>'<label class="field-label">'+esc(f.label)+input(f,rec[f.name] ?? cfg.defaults?.[f.name])+'</label>').join('')+
          '<div class="replica-toolbar">'+button('取消','data-cancel')+'<button class="replica-button primary" type="submit">保存</button></div></form></div>';
        root.querySelector('[data-back]').onclick=()=>table(true);
        root.querySelector('[data-cancel]').onclick=()=>table(true);
        root.querySelector('form').onsubmit=e=>{
          e.preventDefault();
          const form=e.currentTarget;
          const values=Object.fromEntries(cfg.fields.map(f=>{
            const el=form.elements.namedItem(f.name);
            return [f.name,f.type==='checkbox'?el.checked:f.type==='multi'?Array.from(el.selectedOptions,x=>x.value).join('、'):el.value.trim()];
          }));
          save(values);
        };
        root.querySelector('form input, form select, form textarea')?.focus();
      }
      table();
    };
  }
  const team = ['售后服务','售前支持'];
  const channels = ['邮件','消息','语音'];
  const dates = '2026-11-05 14:30';
  const fieldsSeed=[{id:'order',name:'订单号',type:'单行文本',form:'售后表单',owner:'Demo Admin',updated:dates},{id:'reason',name:'售后原因',type:'单选下拉',form:'售后表单',source:'退货原因',options:'质量问题\n尺寸不合适',owner:'Demo Admin',updated:dates},{id:'sku',name:'商品 SKU',type:'单行文本',form:'—',owner:'Demo Admin',updated:dates}];
  const formSeed=[{key:'customer',name:'客户信息',builtin:true,enabled:true,items:[]},{key:'commerce',name:'电商信息',builtin:true,enabled:true,items:[]},{key:'custom',name:'自定义信息',builtin:true,enabled:true,items:[]},{key:'returns',name:'售后表单',enabled:true,items:['order','reason']}];
  function fieldTabs(tab) {
    if (!location.hash.startsWith('#legacy/')) return '';
    return '<nav class="replica-toolbar" aria-label="字段与表单"><a class="replica-tab" aria-selected="'+(tab==='fields')+'" href="#legacy/common/fields">字段管理</a><a class="replica-tab" aria-selected="'+(tab==='forms')+'" href="#legacy/ticket/form">表单管理</a></nav>';
  }
  collection('common/fields',{title:'字段管理',prefix:fieldTabs,search:'搜索字段名称',add:'新建字段',edit:true,editTitle:'编辑字段',
    cols:[['name','字段名称'],['type','字段类型'],['form','归属表单'],['owner','更新人'],['updated','更新时间']],
    fields:[field('name','字段名称','text',[],true),field('type','字段类型','select',['单行文本','多行文本','单选下拉','多选下拉','日期','复选框','整数','小数','正则文本']),field('source','使用 AI 字段','select',['不关联','退货原因']),field('options','字段选项','textarea')],
    rows:fieldsSeed, read:records=>records.map(f=>({...f,form:list('ticket/form',formSeed).find(form=>form.items?.includes(f.id))?.name||'—'})),
    onSave:(_,r)=>({id:r.id||crypto.randomUUID(),owner:'Demo Admin',updated:'刚刚'})});
  collection('common/whatsapp',{title:'WhatsApp 模板',search:'搜索模板名称',add:'新建模板',edit:true,editTitle:'编辑模板',
    cols:[['name','模板名称'],['category','类别'],['language','语言'],['status','状态'],['updated','更新时间']],
    fields:[field('account','WhatsApp 账号','select',['Demo Support']),field('name','模板名称','text',[],true),field('category','类别','select',['实用','营销','身份验证']),field('language','语言','select',['简体中文','英语']),field('body','正文','textarea',[],true)],
    rows:[{account:'Demo Support',name:'order_status',category:'实用',language:'英语',status:'已批准',body:'Hello, your order is ready.',updated:dates}],
    onSave:(_,r)=>({status:r.status||'草稿',updated:'刚刚'})});
  collection('common/members',{title:'成员',search:'搜索成员',add:'添加成员',edit:true,editTitle:'编辑成员',
    cols:[['email','邮箱'],['name','名称'],['role','角色'],['teams','团队'],['active','激活状态'],['online','在线状态'],['created','创建时间'],['last','最后活跃时间']],
    fields:[field('email','邮箱','email',[],true),field('name','名称','text',[],true),field('role','角色','select',['客服','管理员']),field('teams','团队','multi',team)],
    rows:[{email:'alex@example.test',name:'Alex Chen',role:'客服',teams:'售后服务',active:'已激活',online:'在线',created:dates,last:dates}],
    onSave:(_,r)=>({active:r.active||'未激活',online:r.online||'离线',created:r.created||'刚刚',last:r.last||'—'})});
  collection('common/roles',{title:'角色',add:'新建角色',edit:true,editTitle:'编辑角色',
    cols:[['name','角色'],['members','团队成员'],['creator','创建人']],
    fields:[field('name','角色名称','text',[],true),field('description','描述','textarea'),field('permissions','权限','multi',['工单配置','分单规则','满意度调查','成员管理'])],
    rows:[{name:'服务主管',members:2,creator:'Demo Admin',permissions:'工单配置、分单规则'}],onSave:(_,r)=>({members:r.members??0,creator:r.creator||'Demo Admin'})});
  collection('common/replies',{title:'模板库',search:'搜索模板',add:'新建模板',edit:true,editTitle:'编辑模板',
    cols:[['id','ID'],['name','模板名称'],['status','状态'],['content','内容'],['scene','适用场景'],['creator','创建人']],
    fields:[field('scene','适用场景','select',['Email & Livechat','Voice & SMS']),field('directory','所属目录','select',['售后服务','售前支持']),field('name','模板名称','text',[],true),field('content','内容','textarea',[],true)],
    rows:[{id:'101',name:'退换货指引',status:'已发布',content:'请提供订单号和商品信息。',scene:'Email & Livechat',creator:'Demo Admin'}],
    onSave:(_,r)=>({id:r.id||String(Date.now()).slice(-6),status:r.status||'未发布',creator:r.creator||'Demo Admin'})});
  collection('common/labels',{title:'标签管理',add:'新建标签组',edit:true,editTitle:'编辑标签组',
    cols:[['name','标签组'],['description','描述']],
    fields:[field('name','标签组名称','text',[],true),field('description','描述','textarea')],
    rows:[{name:'售后原因',description:'售后消息使用的 AI 标签组'}]});
  collection('channel/phones',{title:'电话号码',search:'按号码或名称搜索',edit:true,editTitle:'编辑基本信息',
    cols:[['number','电话号码'],['name','号码名称'],['status','状态']],
    fields:[field('name','号码名称','text',[],true),field('sip','Termination SIP URI'),field('route','初始接听策略','select',['AI Agent','人工团队','IVR']),field('agent','首接 AI Agent','select',['售后 AI']),field('team','人工接听团队','select',team)],
    rows:[{number:'+12025550136',name:'售后热线',status:'已启用',route:'AI Agent'},{number:'+12025550147',name:'备用号码',status:'未配置'}]});
  collection('ai/intent',{title:'意图理解',search:'搜索意图',add:'新增意图',edit:true,editTitle:'编辑意图',
    cols:[['name','意图名称'],['category','类别'],['type','类型'],['description','描述'],['status','状态']],
    fields:[field('name','意图名称','text',[],true),field('category','类别'),field('type','类型'),field('description','描述','textarea'),field('parent','上级意图','select',['无','售后咨询'])],
    rows:[{name:'退换货咨询',category:'售后咨询',type:'自定义',description:'客户询问如何退换货',status:'启用'}],onSave:(_,r)=>({status:r.status||'启用'})});
  collection('ai/extraction',{title:'AI 字段',search:'搜索字段',add:'新建字段',edit:true,editTitle:'编辑 AI 字段',
    cols:[['name','字段名称'],['type','数据类型'],['description','提取规则']],
    fields:[field('name','字段名称','text',[],true),field('type','数据类型','select',['文本','数字','布尔值']),field('description','提取规则','textarea',[],true)],
    rows:[{name:'退货原因',type:'文本',description:'从客户的原始消息中提取退货原因。'}]});
  collection('ticket/routing',{title:'队列',add:'新增队列',edit:true,editTitle:'编辑队列',
    cols:[['name','队列名称'],['conditions','匹配条件'],['team','团队'],['seconds','最长等待时间（秒）'],['enabled','状态']],
    fields:[field('name','队列名称','text',[],true),field('team','团队','select',team),field('seconds','最长等待时间（秒）','number',[],true),field('match','匹配方式','select',['满足全部条件','满足任一条件']),field('conditions','匹配条件','select',['渠道是邮件','渠道是消息']),field('enabled','状态','checkbox')],
    rows:[{name:'售后邮件队列',team:'售后服务',seconds:300,match:'满足全部条件',conditions:'渠道是邮件',enabled:true}]});
  collection('ticket/calendar',{title:'排班',add:'新增排班',edit:true,editTitle:'编辑排班',
    cols:[['name','名称'],['timezone','时区'],['service','服务时间'],['holiday','节假日'],['updated','更新时间']],
    editor:calendarEditor,
    rows:[{name:'售后工作日',timezone:'Asia/Shanghai',service:'周一至周五 09:00–17:00',holiday:'1 个节假日',updated:dates,hours:Array.from({length:7},(_,i)=>i<5?[['09:00','17:00']]:[]),holidays:[{name:'圣诞节',start:'2026-12-25',end:'2026-12-25'}]}]});
  collection('ticket/capacity',{title:'容量',add:'新增规则',edit:true,editTitle:'编辑容量规则',
    cols:[['name','规则名称'],['email','邮件'],['message','消息'],['voice','语音'],['agents','坐席']],
    fields:[field('name','规则名称','text',[],true),...channels.map((c,i)=>field(['email','message','voice'][i],c,'number')),field('dailyOn','邮件日工作上限','checkbox'),field('daily','邮件日工作上限数量','number'),field('agents','坐席','multi',['Alex Chen','Jamie Lin','Sam Wu'])],
    rows:[{name:'默认容量规则',email:20,message:5,voice:1,agents:'全部坐席'},{name:'售后专用',email:10,message:3,voice:1,agents:'Alex Chen、Jamie Lin'}]});
  collection('ticket/sla',{title:'SLA 策略',add:'新建策略',edit:true,editTitle:'编辑策略',
    cols:[['name','策略名称'],['description','描述'],['status','状态']],
    editor:slaEditor,
    rows:[{name:'售后首次回复',description:'售后邮件工作时间内首次回复',status:'启用',all:[['等于','邮件']],any:[],targets:[{hours:2,minutes:0,seconds:0,mode:'工作时间'},{hours:24,minutes:0,seconds:0,mode:'自然时间'}],calendar:'售后工作日'}],
    onSave:(_,r)=>({status:r.status||'启用'})});
  {
    const slots=['客户','订单','自定义面板'];
    const seed=[{name:'客户信息',slot:'客户',enabled:true,data:'https://support.example.test/customer',timeout:10},{name:'售后订单',slot:'订单',enabled:true,data:'https://orders.example.test/data',timeout:10},{name:'物流查询',slot:'自定义面板',enabled:true,url:'https://orders.example.test/tracking',height:480}];
    const config=slot=>({
      title:'工具栏扩展',add:slot==='自定义面板'?'新增面板':null,edit:true,editTitle:'编辑配置',
      prefix:()=>'<nav class="replica-toolbar" aria-label="工具栏扩展类型">'+slots.map(x=>'<button type="button" class="replica-tab" aria-selected="'+(slot===x)+'" data-slot="'+x+'">'+x+'</button>').join('')+'</nav>',
      cols:slot==='自定义面板'?[['name','Tab name'],['url','Page URL'],['height','Panel height'],['enabled','状态']]:[['data','Data API URL'],['timeout','超时时间'],['enabled','状态']],
      fields:slot==='自定义面板'?[field('name','Tab name','text',[],true),field('url','Page URL','url',[],true),field('height','Panel height','number'),field('enabled','状态','checkbox')]:[field('data','Data API URL','url',[],true),field('timeout','超时时间','number'),field('enabled','状态','checkbox')],
      rows:seed,filter:r=>r.slot===slot,onSave:()=>({slot})
    });
    const paint=(root,slot)=>{
      collection('ticket/toolbar',config(slot));
      const renderer=replicas['ticket/toolbar'];replicas['ticket/toolbar']=entry;
      renderer(root);
    };
    const entry=root=>{root.onclick=e=>{const b=e.target.closest('[data-slot]');if(b)paint(root,b.dataset.slot);};paint(root,'客户');};
    replicas['ticket/toolbar']=entry;
  }

  replicas['ticket/form']=root=>{
    const id='ticket/form';
    let saved=list(id,formSeed);
    if (!Array.isArray(saved) || saved.some(f=>!Array.isArray(f.items))) saved=formSeed;
    let forms=structuredClone(saved), active=forms.find(f=>!f.builtin)?.key || forms[0].key;
    const fields=list('common/fields',fieldsSeed);
    const byId=new Map(fields.map(f=>[f.id,f]));
    function render(message='') {
      const current=forms.find(f=>f.key===active);
      const selected=current.items.map(key=>byId.get(key)).filter(Boolean);
      const assigned=new Set(forms.flatMap(f=>f.items));
      const available=fields.filter(f=>!assigned.has(f.id));
      const row=(f,actions)=>'<div class="config-line"><span><strong>'+esc(f.name)+'</strong> <span class="replica-muted">'+esc(f.type)+'</span></span>'+actions+'</div>';
      root.innerHTML=heading('表单管理')+'<div class="replica-body">'+fieldTabs('forms')+'<div class="form-builder">'+
        '<aside class="config-panel form-list" aria-label="表单">'+forms.map(f=>'<button type="button" class="replica-tab" aria-pressed="'+(f.key===active)+'" data-form="'+esc(f.key)+'">'+esc(f.name)+'</button>').join('')+button('新建表单','data-new-form')+'</aside>'+
        '<form class="config-panel builder-config"><label class="field-label">表单名称<input class="replica-field" name="name" value="'+esc(current.name)+'" maxlength="24" required'+(current.builtin?' readonly':'')+'></label><label class="field-label inline"><input type="checkbox" name="enabled"'+(current.enabled?' checked':'')+'> 状态</label>'+
        '<h3>已选字段 <small>'+selected.length+'</small></h3><div class="config-lines">'+(selected.map((f,i)=>row(f,button('↑','data-up="'+esc(f.id)+'" aria-label="上移 '+esc(f.name)+'"'+(!i?' disabled':''))+button('↓','data-down="'+esc(f.id)+'" aria-label="下移 '+esc(f.name)+'"'+(i===selected.length-1?' disabled':''))+button('移除','data-remove="'+esc(f.id)+'" aria-label="移除 '+esc(f.name)+'"'))).join('')||'<p class="replica-muted">暂无已选字段</p>')+'</div>'+
        '<h3>可选字段</h3><div class="config-lines">'+(available.map(f=>row(f,button('添加','data-add="'+esc(f.id)+'" aria-label="添加 '+esc(f.name)+'"'))).join('')||'<p class="replica-muted">暂无可选字段</p>')+'</div>'+
        '<div class="replica-toolbar builder-actions">'+(!current.builtin?button('删除表单','data-delete-form'):'')+'<button type="submit" class="replica-button primary">确认</button><span role="status">'+esc(message)+'</span></div></form>'+
        '<aside class="config-panel form-preview" aria-label="工单右侧预览"><h3>工单右侧预览</h3>'+forms.filter(f=>f.enabled).map(f=>'<section><strong>'+esc(f.name)+'</strong>'+f.items.map(key=>byId.has(key)?'<div>'+esc(byId.get(key).name)+'<span>—</span></div>':'').join('')+'</section>').join('')+'</aside></div></div>';
      const form=root.querySelector('.builder-config');
      form.oninput=e=>{
        if(e.target.name==='name'){current.name=e.target.value;const tab=Array.from(root.querySelectorAll('[data-form]')).find(b=>b.dataset.form===current.key);tab.textContent=current.name;const preview=Array.from(root.querySelectorAll('.form-preview section strong'));const i=forms.filter(f=>f.enabled).indexOf(current);if(preview[i])preview[i].textContent=current.name;}
        if(e.target.name==='enabled'){current.enabled=e.target.checked;render();root.querySelector('[name=enabled]').focus();}
      };
      form.onsubmit=e=>{
        e.preventDefault();
        const name=current.name.trim();
        if (!name || forms.some(f=>f!==current && f.name===name)){root.querySelector('[role=status]').textContent='请输入未使用的表单名称';return;}
        current.name=name;keep(id,forms);render('已保存');
      };
      root.querySelectorAll('[data-form]').forEach(b=>b.onclick=()=>{active=b.dataset.form;render();});
      root.querySelector('[data-new-form]').onclick=()=>formDialog('新建表单','<label class="field-label">表单名称<input name="name" class="replica-field" maxlength="24" required></label>',values=>{
        const name=values.name.trim();
        if(!name||forms.some(f=>f.name===name)) return '请输入未使用的表单名称';
        active=crypto.randomUUID();forms.push({key:active,name,enabled:true,items:[]});keep(id,forms);render('已创建');return '';
      });
      root.querySelector('[data-delete-form]')?.addEventListener('click',()=>formDialog('删除表单','<p>确认删除「'+esc(current.name)+'」？已选字段会回到可选字段。</p>',()=>{
        forms=forms.filter(f=>f!==current);active=forms[0].key;keep(id,forms);render('已删除');return '';
      },'删除'));
      form.onclick=e=>{
        const b=e.target.closest('button');if(!b)return;
        const {up,down,remove,add}=b.dataset;
        if(add)current.items.push(add);
        else if(remove)current.items=current.items.filter(x=>x!==remove);
        else if(up||down){const i=current.items.indexOf(up||down),j=i+(up?-1:1);[current.items[i],current.items[j]]=[current.items[j],current.items[i]];}
        else return;
        render();
      };
    }
    function formDialog(title,body,submit,caption='保存'){ openDialog(root,title,body,submit,caption); }
    render();
  };

  function openDialog(root,title,body,submit,caption='保存') {
    const dialog=document.createElement('dialog');dialog.className='config-dialog';dialog.setAttribute('aria-label',title);
    dialog.innerHTML='<form><h2>'+esc(title)+'</h2>'+body+'<p role="alert"></p><div class="replica-toolbar"><span class="push"></span>'+button('取消','data-close')+'<button class="replica-button primary" type="submit">'+esc(caption)+'</button></div></form>';
    root.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});
    dialog.querySelector('[data-close]').onclick=()=>dialog.close();
    dialog.querySelector('form').onsubmit=e=>{
      e.preventDefault();const error=submit(Object.fromEntries(new FormData(e.currentTarget)));
      if(error){dialog.querySelector('[role=alert]').textContent=error;return;}
      if(dialog.isConnected) dialog.close();
    };
    dialog.showModal();
  }

  function calendarEditor(root,rec,fresh,save,back) {
    const days=['周一','周二','周三','周四','周五','周六','周日'];
    const zones=['Asia/Shanghai','America/New_York','Europe/London','UTC'];
    let name=rec.name||'', timezone=zones.includes(rec.timezone)?rec.timezone:zones[0];
    let hours=structuredClone(rec.hours||Array.from({length:7},(_,i)=>i<5?[['09:00','17:00']]:[]));
    let holidays=structuredClone(rec.holidays||[]);
    function render() {
      root.innerHTML=heading(fresh?'新增排班':'编辑排班',true)+'<div class="replica-body"><form class="replica-form wide-form">'+
        '<div class="config-pair"><label class="field-label">名称'+input(field('name','','text',[],true),name)+'</label><label class="field-label">时区'+input(field('timezone','','select',zones),timezone)+'</label></div>'+
        '<section class="config-panel"><h2>每周营业时间</h2>'+hours.map((spans,i)=>'<div class="config-line week-day"><strong>'+days[i]+'</strong><div>'+(!spans.length?'<span class="replica-muted">不营业</span>':spans.map(([start,end],j)=>'<div class="time-range"><input class="replica-field" type="time" required aria-label="'+days[i]+'开始时间" value="'+esc(start)+'" data-hour="'+i+','+j+',0"><span>至</span><input class="replica-field" type="time" required aria-label="'+days[i]+'结束时间" value="'+esc(end)+'" data-hour="'+i+','+j+',1">'+button('移除','data-remove-hour="'+i+','+j+'"')+'</div>').join(''))+'</div>'+button('添加时段','data-add-hour="'+i+'" aria-label="'+days[i]+'添加时段"')+'</div>').join('')+'</section>'+
        '<section class="config-panel"><div class="replica-toolbar"><h2>节假日</h2><span class="push"></span>'+button('添加节假日','data-holiday="-1"')+'</div>'+
        (holidays.map((h,i)=>'<div class="config-line"><span><strong>'+esc(h.name)+'</strong> '+esc(h.start)+(h.start===h.end?'':' 至 '+esc(h.end))+'</span>'+button('编辑','data-holiday="'+i+'"')+button('删除','data-del-holiday="'+i+'"')+'</div>').join('')||'<p class="replica-muted">暂未添加节假日</p>')+'</section>'+
        '<div class="replica-toolbar">'+button('取消','data-cancel')+'<button type="submit" class="replica-button primary">保存</button><span role="alert"></span></div></form></div>';
      root.querySelector('[data-back]').onclick=back;root.querySelector('[data-cancel]').onclick=back;
      const form=root.querySelector('form');
      form.oninput=e=>{const el=e.target;if(el.name==='name')name=el.value;if(el.name==='timezone')timezone=el.value;if(el.dataset.hour){const [i,j,k]=el.dataset.hour.split(',');hours[i][j][k]=el.value;}};
      form.onclick=e=>{
        const b=e.target.closest('button');if(!b)return;
        const {addHour,removeHour,holiday,delHoliday}=b.dataset;
        if(addHour!=null)hours[Number(addHour)].push(['09:00','17:00']);
        else if(removeHour!=null){const [i,j]=removeHour.split(',').map(Number);hours[i].splice(j,1);}
        else if(delHoliday!=null)holidays.splice(Number(delHoliday),1);
        else if(holiday!=null){
          const i=Number(holiday),h=holidays[i]||{};
          openDialog(root,i<0?'新增节假日':'编辑节假日',[['name','名称','text'],['start','开始日期','date'],['end','结束日期','date']].map(([key,label,type])=>'<label class="field-label">'+label+input(field(key,'',type,[],true),h[key])+'</label>').join(''),values=>{
            if(!values.name.trim()||values.end<values.start)return '请检查名称和日期范围';
            if(i<0)holidays.push(values);else holidays[i]=values;render();return '';
          });
          return;
        }else return;
        render();
      };
      form.onsubmit=e=>{
        e.preventDefault();
        if(!name.trim()||hours.some(spans=>spans.some(([a,b],i)=>a>=b||spans.some(([c,d],j)=>i!==j&&a<d&&c<b)))){
          form.querySelector('[role=alert]').textContent='请输入名称，检查营业时段结束时间及重叠情况';return;
        }
        save({name:name.trim(),timezone,hours,holidays,service:hours.flatMap((spans,i)=>spans.length?[days[i]+' '+spans.map(([a,b])=>a+'–'+b).join('、')]:[]).join('；')||'不营业',holiday:holidays.length?holidays.length+' 个节假日':'无',updated:'刚刚'});
      };
    }
    render();
  }

  function slaEditor(root,rec,fresh,save,back) {
    const steps=['基础信息','适用条件','响应时效'];
    const draft={name:rec.name||'',description:rec.description||'',all:structuredClone(rec.all||[]),any:structuredClone(rec.any||[]),
      targets:structuredClone(rec.targets||Array.from({length:2},()=>({hours:0,minutes:0,seconds:0,mode:'自然时间'}))),calendar:rec.calendar||''};
    let step=0;
    function condition(key,title){
      return '<section class="config-panel"><h3>'+title+'</h3>'+draft[key].map(([op,value],i)=>'<div class="condition-line"><span>渠道</span><select class="replica-field" aria-label="关系" data-condition="'+key+','+i+',0">'+['等于','不等于'].map(x=>'<option'+(x===op?' selected':'')+'>'+x+'</option>').join('')+'</select><select class="replica-field" aria-label="取值" data-condition="'+key+','+i+',1">'+channels.map(x=>'<option'+(x===value?' selected':'')+'>'+x+'</option>').join('')+'</select>'+button('删除条件','data-del-condition="'+key+','+i+'"')+'</div>').join('')+button('添加条件','data-add-condition="'+key+'" aria-label="'+title+'：添加条件"')+'</section>';
    }
    function render(){
      const calendarNames=list('ticket/calendar',[{name:'售后工作日'}]).map(c=>c.name);
      const basic='<label class="field-label">策略名称'+input(field('name','','text',[],true),draft.name)+'</label><label class="field-label">描述'+input(field('description','','textarea'),draft.description)+'</label>';
      const targets=draft.targets.map((target,i)=>'<section class="config-panel"><h3>'+['人工首次响应','人工后续响应'][i]+'</h3><div class="duration-grid">'+[['hours','小时',9999],['minutes','分钟',59],['seconds','秒',59]].map(([k,l,m])=>'<label class="field-label">'+l+'<input class="replica-field" type="number" min="0" max="'+m+'" aria-label="'+['人工首次响应','人工后续响应'][i]+l+'" value="'+esc(target[k])+'" data-target="'+i+','+k+'"></label>').join('')+'<label class="field-label">计时方式<select class="replica-field" data-target="'+i+',mode">'+['自然时间','工作时间'].map(x=>'<option'+(x===target.mode?' selected':'')+'>'+x+'</option>').join('')+'</select></label></div></section>').join('')+
        '<label class="field-label">排班'+input(field('calendar','','select',['请选择',...calendarNames]),draft.calendar)+'</label>';
      root.innerHTML=heading(fresh?'新建策略':'编辑策略',true)+'<div class="replica-body"><div class="sla-editor"><ol class="sla-steps">'+steps.map((s,i)=>'<li'+(i===step?' aria-current="step"':'')+'><b>'+(i+1)+'</b>'+s+'</li>').join('')+'</ol><form class="replica-form"><h2>'+steps[step]+'</h2>'+(step===0?basic:step===1?condition('all','满足以下所有条件')+condition('any','满足以下任意条件'):targets)+'<div class="replica-toolbar">'+button('取消','data-cancel')+(step?button('上一步','data-prev'):'')+'<button type="submit" class="replica-button primary">'+(step<2?'下一步':'保存')+'</button><span role="alert"></span></div></form></div></div>';
      const form=root.querySelector('form');
      root.querySelector('[data-back]').onclick=back;form.querySelector('[data-cancel]').onclick=back;
      form.querySelector('[data-prev]')?.addEventListener('click',()=>{step--;render();});
      form.oninput=e=>{
        const el=e.target;if(el.name)draft[el.name]=el.value;
        if(el.dataset.condition){const [k,i,j]=el.dataset.condition.split(',');draft[k][i][j]=el.value;}
        if(el.dataset.target){const [i,k]=el.dataset.target.split(',');draft.targets[i][k]=k==='mode'?el.value:Number(el.value);}
      };
      form.onclick=e=>{
        const b=e.target.closest('button');if(!b)return;
        if(b.dataset.addCondition){draft[b.dataset.addCondition].push(['等于','邮件']);render();}
        if(b.dataset.delCondition){const [k,i]=b.dataset.delCondition.split(',');draft[k].splice(Number(i),1);render();}
      };
      form.onsubmit=e=>{
        e.preventDefault();const message=form.querySelector('[role=alert]');
        if(!draft.name.trim()){message.textContent='请输入策略名称';return;}
        if(step===1&&!draft.all.length&&!draft.any.length){message.textContent='请至少添加一个适用条件';return;}
        if(step<2){step++;render();return;}
        if(!draft.targets.some(t=>t.hours||t.minutes||t.seconds)){message.textContent='请至少填写一个大于 0 秒的目标时长';return;}
        if(!calendarNames.includes(draft.calendar)){message.textContent='请选择排班';return;}
        save(draft);
      };
    }
    render();
  }

  replicas['ai/tagging']=root=>{
    const id='ai/tagging', state=list(id,{selection:'全部',mode:'追加'});
    root.innerHTML=heading('AI 打标')+'<div class="replica-body"><form class="replica-form"><label class="field-label">打标结果选择'+
      input(field('selection','','select',['全部','只保留置信度最高的标签']),state.selection)+'</label><label class="field-label">更新方式'+
      input(field('mode','','select',['追加','覆盖']),state.mode)+'</label><div><button class="replica-button primary">保存</button></div><p role="status"></p></form></div>';
    root.querySelector('form').onsubmit=e=>{e.preventDefault();keep(id,Object.fromEntries(new FormData(e.currentTarget)));root.querySelector('[role=status]').textContent='AI 打标设置已保存';};
  };
  collection('tools/plugins',{title:'工具管理',add:'添加插件',edit:true,editTitle:'编辑插件',
    cols:[['name','插件名称'],['description','插件描述'],['type','插件类型'],['skills','所关联的客服技能']],
    fields:[{...field('name','插件名称','text',[],true),pattern:'[A-Za-z0-9_]*_[A-Za-z0-9_]*'},field('description','插件描述','textarea',[],true)],
    rows:[{name:'get_order_info',description:'查询订单状态与物流进度',type:'自定义',skills:'订单查询'}],onSave:(_,r)=>({type:r.type||'自定义',skills:r.skills||'—'})});
  replicas['platform/docs']=root=>{
    root.innerHTML=heading('API 文档')+'<div class="replica-body"><article class="config-panel api-reference"><h2>接口文档</h2><p class="replica-muted">本地只读示例。正式文档由已授权的工作区加载。</p><details open><summary>调用说明</summary><p>调用方通过工作区原有授权访问接口。接口目录及参数以工作区提供的文档为准。</p></details><details><summary>权限与凭据</summary><p>从原授权入口管理凭据。此页不展示密钥。</p></details></article></div>';
  };
  replicas['common/integrations']=root=>{
    const apps=[['Solvea LiveChat','官方应用','连接网站实时聊天。','◉','channel/livechat'],['Solvea 电话号码','官方应用','管理接入的电话号码。','☎','channel/phones'],['Amazon','电商应用','连接店铺及其客服渠道。','a','channel/connections'],['Shopify','电商应用','连接店铺及其客服渠道。','S','channel/connections'],['订单中心','数据应用','查询已同步订单。','▣'],['Email','渠道应用','管理客服邮箱和同步。','✉','channel/email'],['自研工单系统','渠道应用','接入自研工单。','▣','channel/custom-ticket'],['开放平台','渠道应用','开放应用授权和 Webhook。','◇','platform/qualification'],['快速三方授权','数据应用','管理第三方系统授权。','◇','tools/third-party-auth']];
    const modes=['全部应用','渠道应用','电商应用','数据应用'];
    let mode=modes[0];
    let q='';
    root.innerHTML=heading('集成')+'<div class="replica-body"><div class="replica-toolbar"><div class="integration-tabs"></div><span class="push"></span><input type="search" class="replica-field" aria-label="搜索应用" placeholder="搜索.."></div><div class="integration-grid"></div></div>';
    const paint=()=>{
      root.querySelector('.integration-tabs').innerHTML=modes.map(x=>'<button type="button" class="replica-tab" aria-selected="'+(x===mode)+'" data-mode="'+x+'">'+x+'</button>').join('');
      root.querySelector('.integration-grid').innerHTML=apps.filter(a=>(mode===modes[0] || a[1]===mode)&&a[0].toLowerCase().includes(q)).map(([name,type,desc,icon,route])=>{
        const content='<div><i aria-hidden="true">'+icon+'</i><strong>'+esc(name)+'</strong><span class="badge">'+type+'</span></div><p>'+desc+'</p>';
        return route?'<a href="#legacy/'+route+'">'+content+'</a>':'<article>'+content+'</article>';
      }).join('') || '<p>暂无匹配应用</p>';
    };
    root.querySelector('.integration-tabs').onclick=e=>{const el=e.target.closest('[data-mode]');if(el){mode=el.dataset.mode;paint();}};
    root.querySelector('input').oninput=e=>{q=e.target.value.trim().toLowerCase();paint();};
    paint();
  };
  collection('channel/custom-ticket',{title:'自研工单系统',search:'搜索账户名称',add:'添加自研工单系统',edit:true,editTitle:'自研工单系统授权',
    cols:[['name','账户名称'],['status','授权状态']],
    fields:[field('name','账户名称','text',[],true),field('query','工单查询接口','url',[],true),field('reply','AI 回复接口','url',[],true),field('tags','标签回调接口','url'),field('timeout','回复超时（毫秒）','number')],
    rows:[{name:'售后工单系统',status:'已配置',query:'https://desk.example.test/query',reply:'https://desk.example.test/reply',timeout:10000}],
    onSave:()=>({status:'已配置'})});
  collection('tools/third-party-auth',{title:'快速三方授权',search:'搜索名称或 authId',
    cols:[['name','授权名称'],['id','authId'],['type','授权类型'],['status','状态']],
    rows:[{name:'订单查询（示例）',id:'demo-order-auth',type:'API Key',status:'启用'}]});
})();
