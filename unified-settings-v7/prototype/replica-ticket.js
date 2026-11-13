(() => {
  'use strict';
  const pages = (window.solveaReplica ||= {});
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getIcon = (name) => window.replicaIcon?.(name) ?? '';
  const button = (label, action, style = '', key = '') => `<button type="button" class="replica-button ${style}" data-action="${action}" data-key="${escape(key)}">${label}</button>`;
  const iconButton = (icon, label, action, key) => `<button type="button" class="icon-action ${icon === 'delete' ? 'delete' : ''}" title="${label}" aria-label="${label}" data-action="${action}" data-key="${escape(key)}">${getIcon(icon)}</button>`;
  const switchButton = (enabled, key, name) => `<button type="button" class="switch" role="switch" aria-checked="${enabled}" aria-label="${escape(name)}" data-action="toggle" data-key="${escape(key)}"></button>`;
  const searchField = (placeholder, value) => `<label style="position:relative;display:inline-flex;min-width:0"><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" aria-hidden="true" style="position:absolute;top:9px;left:8px;color:#667085"><circle cx="8" cy="8" r="4.5"/><path d="m11.5 11.5 4 4"/></svg><input class="replica-field" type="search" data-filter="search" placeholder="${placeholder}" aria-label="${placeholder}" value="${escape(value)}" style="padding-left:26px"></label>`;
  const pick = (values, value, attrs = '') => `<select class="replica-field" ${attrs}>${values.map((v) => `<option value="${escape(v)}"${v === value ? ' selected' : ''}>${escape(v)}</option>`).join('')}</select>`;
  const panelTitle = (title, action = '') => `<div class="replica-head"><h1 tabindex="-1">${title}</h1>${action}</div>`;
  const now = () => new Date().toLocaleString('sv-SE', {hour12:false}).slice(0,16);
  const makeStore = (id, initial) => {
    const key = 'solvea-unified-settings-demo-' + id;
    let list = initial;
    try {const saved = JSON.parse(localStorage.getItem(key)); if (Array.isArray(saved)) list = saved;} catch (_) {}
    return {get:() => list, set:(next) => {list = next; try {localStorage.setItem(key, JSON.stringify(next));} catch (_) {}}};
  };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const dialog = (root, title, content, actions) => {
    const node = document.createElement('dialog');
    node.className = 'replica-confirm';
    node.setAttribute('aria-label', title);
    node.innerHTML = `<h2>${title}</h2>${content}<div class="replica-form-actions">${actions}</div>`;
    root.append(node);
    node.addEventListener('close', () => node.remove(), {once:true});
    node.showModal();
    return node;
  };
  const confirmRemove = (root, noun, name, action) => {
    const node = dialog(root, `删除${noun}`, `<p>确定删除「${escape(name)}」吗？删除后不可恢复。</p>`, button('取消','cancel') + button('删除','confirm','primary'));
    node.addEventListener('click', (event) => {
      const clicked = event.target.closest('button');
      if (!clicked) return;
      event.stopPropagation();
      node.close();
      if (clicked.dataset.action === 'confirm') action();
    });
  };
  const triggerStore = makeStore('trigger-v7-openapi', [
    {id:'t1',name:'邮件工单处理完成后邀评',group:'售后服务',all:[['工单状态','是','已解决'],['渠道','是','邮件']],any:[],actions:['发送满意度问卷'],values:['s1'],once:true,enabled:false,date:'2026-11-06 10:20'},
    {id:'t2',name:'LiveChat 关单后发送满意度问卷',group:'未分类',all:[['工单状态','是','已解决'],['渠道','是','LiveChat']],any:[],actions:['发送满意度问卷'],once:false,enabled:true,date:'2026-11-05 09:30'},
    {id:'t3',name:'来信后添加跟进备注',group:'未分类',all:[['渠道','是','邮件']],any:[],actions:['添加内部备注'],values:['请核对客户的新来信。'],once:false,enabled:true,date:'2026-11-04 15:40'},
    {id:'t4',name:'关闭工单后通知外部系统',group:'未分类',all:[['工单状态','是','已解决']],any:[],actions:['发送 Webhook'],values:['openapi:demo:custom.ticket.closed'],templates:['{"ticketId":"{{ticket.id}}"}'],once:false,enabled:false,date:'2026-11-02 08:54'},
    {id:'t5',name:'客户从聊天窗口回复后添加备注',group:'售后服务',all:[['渠道','是','LiveChat']],any:[],actions:['添加内部备注'],values:['请跟进聊天窗口的新回复。'],once:false,enabled:false,date:'2026-10-31 12:15'}
  ]);
  const groupStore = makeStore('trigger-groups-v1', ['售后服务','未分类']);
  const surveyStore = makeStore('csat-v1', [
    {id:'s1',name:'售后服务满意度问卷',enabled:true,date:'2026-11-06 09:30',days:'',unit:'永不过期',subject:'请评价本次服务',body:'感谢与我们联系，欢迎评价这次服务。',title:'售后服务满意度问卷',description:'请告诉我们这次服务体验如何。',questions:['您对这次服务的总体感受如何？','客服回复是否及时？','您的问题是否得到解决？','还有哪些建议？']},
    {id:'s2',name:'物流咨询回访',enabled:false,date:'2026-11-05 14:38',days:'7',unit:'天',subject:'请评价物流咨询体验',body:'感谢反馈。',title:'物流咨询回访',description:'',questions:['您对本次物流咨询满意吗？','还有哪些建议？']},
    {id:'s3',name:'退换货体验调查',enabled:false,date:'2026-11-04 16:45',days:'',unit:'永不过期',subject:'请评价退换货服务',body:'感谢反馈。',title:'退换货体验调查',description:'',questions:['退换货是否顺利？','还有哪些建议？']},
    {id:'s4',name:'自助服务满意度调查',enabled:false,date:'2026-11-02 10:10',days:'',unit:'永不过期',subject:'请评价自助服务',body:'感谢反馈。',title:'自助服务满意度调查',description:'',questions:['您对自助服务满意吗？','还有哪些建议？']}
  ]);
  const channelNote = '向访客发送 LiveChat 满意度弹窗，无需选择问卷';
  const choices = {工单状态:['已解决','待处理'],渠道:['LiveChat','邮件']};
  const operators = ['是','不是'];
  const ruleActions = ['发送满意度问卷','添加内部备注','发送 Webhook'];

  pages['ticket/triggers'] = (root) => {
    let query = '';
    let status = '全部状态';
    const folded = new Set();
    root.innerHTML = panelTitle('触发器') + `<div class="replica-body" style="padding-top:7px"><div class="replica-muted" style="margin-bottom:22px">触发器可自动执行固定客服流程，减少重复操作，让工单按标准流程流转。</div><div class="replica-toolbar">${searchField('搜索规则名称',query)}${pick(['全部状态','已启用','已停用'],status,'data-filter="status" aria-label="全部状态"')}${button('管理分类','categories','push')}${button('＋ 新建触发器','new','primary')}</div><div class="replica-table-wrap"><table class="replica-table"><thead><tr><th scope="col" style="width:66%">按以下顺序执行触发器</th><th scope="col">更新时间</th><th scope="col">状态</th><th scope="col">操作</th></tr></thead><tbody></tbody></table></div></div>`;
    const tbody = root.querySelector('tbody');
    const paintRows = () => {
      const results = triggerStore.get().filter((row) => row.name.toLowerCase().includes(query.toLowerCase()) && (status === '全部状态' || row.enabled === (status === '已启用')));
      tbody.innerHTML = groupStore.get().map((group) => {
        const rows = results.filter((row) => row.group === group);
        if (!rows.length) return '';
        const expanded = !folded.has(group);
        return `<tr class="group-row"><td colspan="4"><button type="button" class="group-toggle" data-action="fold" data-key="${escape(group)}" aria-expanded="${expanded}">${expanded ? '⌄' : '›'}　${escape(group)}</button><span class="replica-muted">${rows.length} 条规则，${rows.filter((r) => r.enabled).length} 条已启用</span></td></tr>` + (!expanded ? '' : rows.map((row) => `<tr><td style="padding-left:29px">${escape(row.name)}<div class="rule-notes"><span>当 ${escape(row.all.map((c) => c.join(' ')).join(' 且 ') || '始终')}</span><span>则 ${escape(row.actions.join('、'))}</span></div></td><td class="time">${escape(row.date)}</td><td>${switchButton(row.enabled,row.id,row.name)}</td><td><div class="row-actions">${iconButton('edit','编辑','edit',row.id)}${iconButton('delete','删除','delete',row.id)}</div></td></tr>`).join(''));
      }).join('') || '<tr><td colspan="4" class="empty">未找到相关规则</td></tr>';
    };
    const openCategories = () => {
      const node = dialog(root,'管理分类','<div data-group-list></div><form class="replica-toolbar" style="margin-top:12px"><input class="replica-field" aria-label="分类名称" placeholder="分类名称" required><button class="replica-button" type="submit">新建分类</button></form>',button('关闭','cancel'));
      const renderGroups = () => {node.querySelector('[data-group-list]').innerHTML = groupStore.get().map((g) => `<p>${escape(g)}</p>`).join('');};
      renderGroups();
      node.querySelector('[data-action="cancel"]').onclick = () => node.close();
      node.querySelector('form').onsubmit = (event) => {
        event.preventDefault();
        const input = node.querySelector('input');
        const name = input.value.trim();
        if (!name || groupStore.get().includes(name)) {input.setCustomValidity('请输入未使用的分类名称'); input.reportValidity();return;}
        groupStore.set([...groupStore.get().filter((g) => g !== '未分类'),name,'未分类']);
        input.value = '';
        renderGroups();
      };
      node.querySelector('input').oninput = (event) => event.target.setCustomValidity('');
    };
    const openRule = (row) => {
      const draft = clone(row ?? {name:'',group:'未分类',all:[],any:[],actions:[],enabled:false,once:false});
      draft.values ||= [];
      draft.templates ||= [];
      const editor = document.createElement('dialog');
      editor.className = 'drawer';
      editor.style.cssText = 'width:min(920px,100%);border-radius:12px 0 0 12px';
      editor.setAttribute('aria-label',row ? '编辑触发器' : '新建触发器');
      root.append(editor);
      editor.addEventListener('close',() => editor.remove(),{once:true});
      const condition = (set, data, i) => `<div style="display:grid;grid-template-columns:1fr .8fr 1.2fr auto;gap:6px;margin-bottom:6px">${pick(Object.keys(choices),data[0],`aria-label="条件字段" data-condition="${set}:${i}:0"`)}${pick(operators,data[1],`aria-label="条件运算符" data-condition="${set}:${i}:1"`)}${pick(choices[data[0]],data[2],`aria-label="条件值" data-condition="${set}:${i}:2"`)}${iconButton('delete','删除条件','remove-condition',set+':'+i)}</div>`;
      const box = (title, description, content) => `<section style="border:1px solid #e8ebef;border-radius:7px;background:#f6f7f9;padding:12px"><strong>${title}</strong><div class="replica-muted" style="margin:3px 0 9px">${description}</div>${content}</section>`;
      const actionValue = (action, i, native) => {
        const value = draft.values[i] || '';
        if (action === '发送满意度问卷') {
          if (native) return `<span>${channelNote}</span>`;
          const surveys = surveyStore.get().filter((s) => s.enabled || s.id === value);
          return `<select class="replica-field" aria-label="选择问卷" data-action-value="${i}" required><option value="">选择问卷</option>${surveys.map((s) => `<option value="${escape(s.id)}"${s.id===value?' selected':''}>${escape(s.name)}</option>`).join('')}</select>`;
        }
        if (action === '发送 Webhook') {
          const subscriptions=window.platformTriggerOptions?.()||[];
          const available=subscriptions.some(s=>s.value===value);
          return `<select class="replica-field" aria-label="选择 Webhook" data-action-value="${i}" required><option value="">${subscriptions.length?'选择 Webhook':'暂无可用订阅'}</option><optgroup label="开放平台 Webhook">${subscriptions.map(s=>`<option value="${escape(s.value)}"${s.value===value?' selected':''}>${escape(s.label)}</option>`).join('')}</optgroup></select>${value&&!available?'<span class="replica-muted">原订阅不可用，请重新选择</span>':''}${available?`<label class="field-label webhook-data">事件 data JSON<textarea class="replica-field" data-event-template="${i}" rows="4" required>${escape(draft.templates[i] ?? '{"ticketId":"{{ticket.id}}"}')}</textarea></label>`:''}`;
        }
        return `<input class="replica-field" aria-label="内部备注" placeholder="请输入内部备注" data-action-value="${i}" value="${escape(value)}" required>`;
      };
      const paintEditor = () => {
        const livechat = draft.all.some(([field,op,value]) => field === '渠道' && op === '是' && value === 'LiveChat');
        editor.innerHTML = `<form style="height:100%;display:flex;flex-direction:column"><div class="replica-head" style="justify-content:flex-start"><button type="button" class="drawer-close" aria-label="关闭" data-action="cancel">×</button><h1>${row?'编辑':'新建'}触发器</h1></div><div class="replica-body replica-form" style="max-width:none;align-content:start;flex:1;overflow:auto"><label class="field-label"><span><b style="color:#ba454a">*</b> 规则名称</span><input class="replica-field" name="ruleName" required value="${escape(draft.name)}"></label><label class="field-label">分类${pick(['选择分类',...groupStore.get().filter((g) => g !== '未分类')], draft.group === '未分类' ? '选择分类' : draft.group,'name="ruleGroup"')}</label>${box('满足以下所有条件','每一项都必须满足；留空表示不限制。',draft.all.map((c,i) => condition('all',c,i)).join('') + button('添加条件','add-condition','','all'))}${box('满足以下任意条件','至少一项满足；留空表示不限制。',draft.any.map((c,i) => condition('any',c,i)).join('') + button('添加条件','add-condition','','any'))}${box('执行动作','命中条件后，动作将按顺序执行。',draft.actions.map((a,i) => `<div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;flex-wrap:wrap">${pick(ruleActions,a,`aria-label="执行动作" data-rule-action="${i}"`)}${actionValue(a,i,livechat)}${iconButton('delete','删除动作','remove-action',i)}</div>`).join('') + button('添加动作','add-action'))}</div><div class="replica-head" style="flex-wrap:wrap"><label><input type="checkbox" name="once"${draft.once?' checked':''}> 同一个工单多次满足条件时仅执行一次</label><div class="replica-form-actions">${button('预览匹配','preview')}${button('取 消','cancel')}<button class="replica-button primary" type="submit">保 存</button></div></div></form>`;
      };
      paintEditor();
      editor.showModal();
      editor.oninput = (event) => {
        const {target} = event;
        if (target.name === 'ruleName') target.setCustomValidity('');
        if (target.name === 'ruleName') draft.name = target.value;
        if (target.name === 'ruleGroup') draft.group = target.value === '选择分类' ? '未分类' : target.value;
        if (target.name === 'once') draft.once = target.checked;
        if (target.dataset.condition) {
          const [set,i,field] = target.dataset.condition.split(':');
          draft[set][i][field] = target.value;
          if (field === '0') draft[set][i][2] = choices[target.value][0];
          paintEditor();
        }
        if (target.dataset.ruleAction !== undefined) {const i = Number(target.dataset.ruleAction);draft.actions[i] = target.value;draft.values[i] = '';draft.templates[i]='';paintEditor();}
        if (target.dataset.actionValue !== undefined) {
          const i=Number(target.dataset.actionValue);draft.values[i]=target.value;
          if(draft.actions[i]==='发送 Webhook'){if(!draft.templates[i])draft.templates[i]='{"ticketId":"{{ticket.id}}"}';paintEditor();}
        }
        if (target.dataset.eventTemplate !== undefined) {draft.templates[Number(target.dataset.eventTemplate)]=target.value;target.setCustomValidity('');}
      };
      editor.onclick = (event) => {
        const target = event.target.closest('[data-action]');
        if (!target || !editor.contains(target)) return;
        const {action,key} = target.dataset;
        if (action === 'cancel') editor.close();
        if (action === 'add-condition') {draft[key].push(['工单状态','是','已解决']);paintEditor();}
        if (action === 'remove-condition') {
          const [set,i] = key.split(':');
          confirmRemove(editor,'条件',draft[set][i].join(' '),() => {draft[set].splice(Number(i),1);paintEditor();});
        }
        if (action === 'add-action') {draft.actions.push(ruleActions[0]);paintEditor();}
        if (action === 'remove-action') confirmRemove(editor,'动作',draft.actions[Number(key)],() => {draft.actions.splice(Number(key),1);draft.values.splice(Number(key),1);draft.templates.splice(Number(key),1);paintEditor();});
        if (action === 'preview') {
          const sample = [{id:'DEMO-101',工单状态:'已解决',渠道:'LiveChat'},{id:'DEMO-102',工单状态:'待处理',渠道:'邮件'},{id:'DEMO-103',工单状态:'已解决',渠道:'邮件'}];
          const match = (ticket,c) => (ticket[c[0]] === c[2]) === (c[1] === '是');
          const matched = sample.filter((ticket) => draft.all.every((c) => match(ticket,c)) && (!draft.any.length || draft.any.some((c) => match(ticket,c))));
          const preview = dialog(editor,'预览匹配',`<p>${matched.length ? '匹配的示例工单：' + matched.map((ticket) => ticket.id).join('、') : '暂无匹配的示例工单'}</p>`,button('关闭','cancel'));
          preview.querySelector('button').onclick = (e) => {e.stopPropagation();preview.close();};
        }
      };
      editor.onsubmit = (event) => {
        event.preventDefault();
        const input = editor.querySelector('[name="ruleName"]');
        if (!draft.name.trim()) {input.setCustomValidity('请填写规则名称');input.reportValidity();return;}
        for(const textarea of editor.querySelectorAll('[data-event-template]')){
          try {JSON.parse(textarea.value);} catch {textarea.setCustomValidity('请输入有效的事件 data JSON');textarea.reportValidity();return;}
        }
        const next = {...draft,name:draft.name.trim(),id:row?.id ?? ('t-'+Date.now()),date:now()};
        triggerStore.set(row ? triggerStore.get().map((r) => r.id === row.id ? next : r) : [next,...triggerStore.get()]);
        folded.delete(next.group);
        editor.close();
        paintRows();
      };
    };
    root.oninput = (event) => {
      if (event.target.dataset.filter === 'search') query = event.target.value;
      else if (event.target.dataset.filter === 'status') status = event.target.value;
      else return;
      paintRows();
    };
    root.onclick = (event) => {
      const target = event.target.closest('[data-action]');
      if (!target || !root.contains(target) || target.closest('dialog')) return;
      const {action,key} = target.dataset;
      const row = triggerStore.get().find((item) => item.id === key);
      if (action === 'fold') {folded.has(key) ? folded.delete(key) : folded.add(key);paintRows();tbody.querySelectorAll('[data-action="fold"]').forEach((b) => {if (b.dataset.key === key) b.focus();});}
      if (action === 'categories') openCategories();
      if (action === 'new' || (action === 'edit' && row)) openRule(row);
      if (row && action === 'toggle') {triggerStore.set(triggerStore.get().map((r) => r.id === key ? {...r,enabled:!r.enabled} : r));paintRows();tbody.querySelectorAll('[data-action="toggle"]').forEach((b) => {if (b.dataset.key === key) b.focus();});}
      if (row && action === 'delete') confirmRemove(root,'触发器',row.name,() => {triggerStore.set(triggerStore.get().filter((r) => r.id !== key));paintRows();});
    };
    paintRows();
  };

  pages['ticket/csat'] = (root) => {
    let query = '';
    const saveRow = (row) => surveyStore.set(surveyStore.get().some((r) => r.id === row.id) ? surveyStore.get().map((r) => r.id === row.id ? row : r) : [row,...surveyStore.get()]);
    const list = () => {
      root.innerHTML = panelTitle('满意度调查',button('＋ 新建问卷','new','primary')) + `<div class="replica-body"><div class="replica-toolbar">${searchField('搜索问卷名称',query)}</div><div class="replica-table-wrap"><table class="replica-table"><thead><tr><th scope="col" style="width:50%">问卷名称</th><th scope="col">规则类型</th><th scope="col">状态</th><th scope="col">更新时间</th><th scope="col">启用</th><th scope="col">操作</th></tr></thead><tbody></tbody></table></div></div>`;
      const tbody = root.querySelector('tbody');
      const paintRows = () => {
        tbody.innerHTML = surveyStore.get().filter((row) => row.name.toLowerCase().includes(query.toLowerCase())).map((row) => `<tr><td>${escape(row.name)}<div class="replica-muted" style="font-weight:400;margin-top:3px">${row.questions.length} 个问题</div></td><td>触发器</td><td><span class="badge${row.enabled?' on':''}">${row.enabled?'启用':'禁用'}</span></td><td class="time">${escape(row.date)}</td><td>${switchButton(row.enabled,row.id,row.name)}</td><td><div class="row-actions">${iconButton('edit','编辑','edit',row.id)}${iconButton('copy','复制','copy',row.id)}${iconButton('delete','删除','delete',row.id)}</div></td></tr>`).join('') || '<tr><td colspan="6" class="empty">未找到相关问卷</td></tr>';
      };
      paintRows();
      root.oninput = (event) => {if (event.target.dataset.filter === 'search') {query = event.target.value;paintRows();}};
      root.onclick = (event) => {
        const target = event.target.closest('[data-action]');
        if (!target || !root.contains(target) || target.closest('dialog')) return;
        const {action,key} = target.dataset;
        const row = surveyStore.get().find((item) => item.id === key);
        if (action === 'new' || (action === 'edit' && row)) edit(row);
        if (row && action === 'copy') {saveRow({...clone(row),id:'s-'+Date.now(),name:row.name+' Copy',date:now(),enabled:false});paintRows();}
        if (row && action === 'toggle') {saveRow({...row,enabled:!row.enabled});paintRows();tbody.querySelectorAll('[data-action="toggle"]').forEach((b) => {if (b.dataset.key === key) b.focus();});}
        if (row && action === 'delete') confirmRemove(root,'问卷',row.name,() => {surveyStore.set(surveyStore.get().filter((r) => r.id !== key));paintRows();});
      };
    };
    const edit = (row) => {
      const draft = clone(row ?? {name:'',enabled:false,days:'',unit:'永不过期',subject:'',body:'',title:'',description:'',questions:['']});
      const stages = ['配置基本信息','邮件内容','问卷内容'];
      let step = 0;
      const field = (label, name, required = false, area = false) => `<label class="field-label">${required ? '<span><b style="color:#ba454a">*</b> '+label+'</span>' : label}${area ? `<textarea class="replica-field" name="${name}"${required?' required':''}>${escape(draft[name])}</textarea>` : `<input class="replica-field" name="${name}" value="${escape(draft[name])}"${required?' required':''}>`}</label>`;
      const render = () => {
        const steps = stages.map((stage,i) => `<span${i===step?' aria-current="step"':''} style="white-space:nowrap;color:${i===step?'#141d31':'#65717d'}"><b style="display:inline-grid;place-items:center;margin-right:5px;border-radius:50%;width:20px;height:20px;color:${i===step?'white':'#65717d'};background:${i===step?'#2878ed':'#e9ebef'}">${i+1}</b>${stage}</span>`).join('<span style="width:24px;background:#e9ebef;height:1px"></span>');
        const basic = field('问卷名称','name',true) + `<label class="field-label"><span><b style="color:#ba454a">*</b> 规则类型</span>${pick(['触发器'],'触发器','name="ruleType"')}</label><label class="field-label"><span><b style="color:#ba454a">*</b> 链接有效期</span><span style="display:flex;gap:3px"><input class="replica-field" type="number" name="days" aria-label="有效期天数" min="1" value="${escape(draft.days)}" style="width:80px"${draft.unit==='永不过期'?' disabled':' required'}>${pick(['永不过期','天'],draft.unit,'name="unit" aria-label="链接有效期单位"')}</span><span class="replica-muted">从链接生成时开始计算，修改后仅影响新生成的链接。</span></label>`;
        const email = field('邮件主题','subject',true) + field('邮件正文','body',true,true);
        const questions = field('问卷标题','title',true) + field('问卷说明','description',false,true) + `<fieldset><legend>问题</legend>${draft.questions.map((q,i) => `<label class="field-label" style="margin-bottom:7px">问题 ${i+1}<input class="replica-field" data-question="${i}" value="${escape(q)}" required></label>`).join('')}${button('添加问题','add-question')}</fieldset>`;
        root.innerHTML = `<div class="replica-head" style="justify-content:flex-start">${button('←','back')}<h1 tabindex="-1">${row?'编辑':'新建'}满意度调查问卷</h1></div><form class="replica-body" style="min-height:calc(100% - 52px);display:flex;flex-direction:column"><div aria-label="问卷配置步骤" style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;padding:3px 0 21px">${steps}</div><div class="replica-form" style="width:min(560px,100%);margin:0 auto 25px">${[basic,email,questions][step]}</div><div class="replica-form-actions" style="margin-top:auto">${step>0?button('上一步','prev'):''}${button('取消','back')}<button class="replica-button primary" type="submit">${step===2?'保存':'下一步'}</button></div></form>`;
        root.querySelector('[data-action="back"]').setAttribute('aria-label','返回满意度调查');
        const form = root.querySelector('form');
        root.oninput = (event) => {
          const {target} = event;
          if (target.dataset.question !== undefined) draft.questions[Number(target.dataset.question)] = target.value;
          else if (Object.prototype.hasOwnProperty.call(draft,target.name)) draft[target.name] = target.value;
          if (target.name === 'unit') render();
        };
        root.onclick = (event) => {
          const target = event.target.closest('[data-action]');
          if (!target || !root.contains(target)) return;
          if (target.dataset.action === 'back') {list();return;}
          if (target.dataset.action === 'prev') {step--;render();}
          if (target.dataset.action === 'add-question') {draft.questions.push('');render();root.querySelector(`[data-question="${draft.questions.length-1}"]`)?.focus();}
        };
        form.onsubmit = (event) => {
          event.preventDefault();
          if (step < stages.length-1) {
            if (step === 0 && !draft.title) draft.title = draft.name;
            step++;
            render();
          } else {
            saveRow({...draft,id:row?.id ?? ('s-'+Date.now()),date:now()});
            list();
          }
        };
      };
      render();
    };
    list();
  };
})();
