(() => {
  'use strict';
  const pages = (window.solveaReplica ||= {});
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (name) => window.replicaIcon?.(name) ?? '';
  const get = (key, fallback) => {
    try {return JSON.parse(localStorage.getItem('solvea-automation-'+key)) ?? fallback;} catch (_) {return fallback;}
  };
  const set = (key, data) => {
    try {localStorage.setItem('solvea-automation-'+key,JSON.stringify(data));} catch (_) {}
  };
  const button = (text, action, style = '', attrs = '') => `<button type="button" class="replica-button ${style}" data-auto-action="${action}" ${attrs}>${text}</button>`;
  const choose = (values, selected, attrs) => `<select class="replica-field" ${attrs}>${values.map((v)=>`<option${v === selected ? ' selected' : ''}>${escape(v)}</option>`).join('')}</select>`;
  const sw = (label, on, attrs) => `<button type="button" class="switch" role="switch" aria-label="${escape(label)}" aria-checked="${Boolean(on)}" ${attrs}></button>`;
  const iconAction = (name, label, action, attrs = '') => `<button type="button" class="icon-action${name==='delete'?' delete':''}" title="${label}" aria-label="${label}" data-auto-action="${action}" ${attrs}>${icon(name)}</button>`;
  const titles = [['assignment','分单','分单规则'],['merge-close','工单处理','工单处理'],['mail','留言邮箱规则','留言邮箱规则']];
  const header = (page) => {
    const legacy = location.hash.startsWith('#legacy/');
    const heading = titles.find(([id]) => id===page)[2];
    return `<div class="replica-head"><h1 tabindex="-1">${legacy ? '自动规则' : heading}</h1></div>` +
      (legacy ? `<div class="replica-tabs" role="navigation" aria-label="自动规则页签" style="padding:0 20px">${titles.map(([id,label])=>`<a class="replica-tab" href="#legacy/ticket/${id}"${id===page?' aria-selected="true" aria-current="page"':''}>${label}</a>`).join('')}</div>` : '');
  };
  const confirm = (root, name, callback) => {
    const dlg = document.createElement('dialog');
    dlg.className = 'replica-confirm';
    dlg.setAttribute('aria-label','删除确认');
    dlg.innerHTML = `<h2>删除确认</h2><p>确定删除「${escape(name)}」吗？删除后不可恢复。</p><div class="replica-form-actions">${button('取消','cancel')}${button('删除','remove','primary')}</div>`;
    root.append(dlg);
    dlg.addEventListener('close',()=>dlg.remove(),{once:true});
    dlg.onclick = (event) => {
      const action = event.target.closest('[data-auto-action]')?.dataset.autoAction;
      if (!action) return;
      event.stopPropagation();
      dlg.close();
      if (action==='remove') callback();
    };
    dlg.showModal();
  };
  const result = (root, text) => {root.querySelector('[data-auto-result]').textContent = text;};
  const footer = `<div style="display:flex;gap:10px;align-items:center;margin-top:20px"><button type="submit" class="replica-button primary">确定</button><span class="replica-muted" data-auto-result role="status"></span></div>`;
  const section = (title, text, controls = '', action = '') => `<section style="padding:13px 0 17px;border-bottom:1px solid #edf0f2"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><strong>${title}</strong>${action}</div><div class="replica-muted" style="margin-top:5px">${text}</div>${controls}</section>`;

  pages['ticket/merge-close'] = (root) => {
    const id = 'merge-close-v1';
    const saved = get(id,{close:true,closeDays:7,merge:true,mergeDays:3,online:true,clear:false,timer:false,timerValue:30,timerUnit:'分钟'});
    const draft = {...saved};
    const timerUnits = {'分钟':259200,'小时':4320,'天':180};
    const number = (key, label, max, enabled) => `<input class="replica-field" type="number" name="${key}" min="1" max="${max}" value="${escape(draft[key])}" style="width:80px" aria-label="${label}" required${enabled ? '' : ' disabled'}>`;
    const paint = () => {
      const timer = `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:8px 0"><span>售后在线客服</span><div style="display:flex;align-items:center;gap:7px">${number('timerValue','等待时间',timerUnits[draft.timerUnit],draft.timer)}${choose(Object.keys(timerUnits),draft.timerUnit,'name="timerUnit" aria-label="等待时间单位"'+(draft.timer?'':' disabled'))}${sw('售后在线客服自动关闭',draft.timer,'data-toggle="timer"')}</div></div><div class="replica-muted">此配置独立于通用自动关闭。若两者都开启，先到期的规则生效；客户回复后本轮等待取消。</div>`;
      root.innerHTML = header('merge-close') + `<form class="replica-body" style="max-width:810px">${section('自动关闭工单',number('closeDays','自动关闭工单天数',180,draft.close)+' 天后，工单无新消息，系统自动将工单关闭。','',sw('自动关闭工单',draft.close,'data-toggle="close"'))}${section('Custom Livechat 自动关闭','客服公开回复成功后开始等待，客户在设定时间内未回复则自动关闭工单。',timer)}${section('工单合并',number('mergeDays','工单合并天数',30,draft.merge)+' 天内，同一客户重复来信，工单自动合并。','',sw('工单合并',draft.merge,'data-toggle="merge"'))}${section('仅分配给在线客服','开启此功能后，自动分单仅会指派当前在线的客服；关闭后，系统分配工单时将忽略客服在线状态。','',sw('仅分配给在线客服',draft.online,'data-toggle="online"'))}${section('回复后清除处理人','开启后，人工客服回复消息后，将自动清除此工单的处理人。','',sw('回复后清除处理人',draft.clear,'data-toggle="clear"'))}${footer}</form>`;
      const form = root.querySelector('form');
      const update = () => {form.querySelector('[type="submit"]').disabled = JSON.stringify(draft)===JSON.stringify(saved);};
      update();
      form.onclick = (event) => {
        const key = event.target.closest('[data-toggle]')?.dataset.toggle;
        if (!key) return;
        draft[key] = !draft[key];
        paint();
        root.querySelector(`[data-toggle="${key}"]`)?.focus();
      };
      form.oninput = (event) => {
        const {name,type,value} = event.target;
        if (name) draft[name] = type==='number' ? (value ? Number(value) : '') : value;
        if (name==='timerUnit') form.elements.timerValue.max=timerUnits[value];
        update();
        result(root,'');
      };
      form.onsubmit = (event) => {
        event.preventDefault();
        set(id,draft);
        Object.assign(saved,draft);
        update();
        result(root,'保存成功');
      };
    };
    paint();
  };

  pages['ticket/mail'] = (root) => {
    const id = 'form-mail-v1';
    const stored = get(id,{forms:['forms@example.com'],references:['updates@example.com']});
    const draft = {forms:[...stored.forms],references:[...stored.references]};
    const groups = {
      forms:['留言邮箱识别','当发件人为以下邮箱时，系统会自动提取邮件中的客户 Email，生成新的客户和会话；该配置对当前账号下所有授权邮箱生效。','添加留言邮箱','删除留言邮箱','info@formsubmitapp.com'],
      references:['仅按邮件引用关系合单','以下来信邮箱的邮件，只有在系统识别到它是对历史邮件的继续回复时，才会合并到原工单；如果无法识别为历史邮件的回复，则会新建工单。','添加邮箱','删除邮箱','support@example.com']
    };
    const paint = () => {
      const body = Object.keys(groups).map((type) => {
        const [title,description,add,remove,placeholder] = groups[type];
        const items = draft[type].map((email,i) => `<div style="display:flex;gap:6px;align-items:center"><input class="replica-field" type="email" aria-label="${title} ${i+1}" data-email="${type}:${i}" value="${escape(email)}" placeholder="${placeholder}" style="width:min(340px,100%)">${iconAction('delete',remove,'delete-email',`data-email-row="${type}:${i}"`)}</div>`).join('');
        return section(title,description,`<div style="display:grid;gap:8px;margin:10px 0">${items}</div>${button('＋ '+add,'add-email','',`data-email-type="${type}"${draft[type].length>=20?' disabled':''}`)}`);
      }).join('');
      root.innerHTML = header('mail') + `<form class="replica-body" style="max-width:810px">${body}${footer}</form>`;
      const form = root.querySelector('form');
      form.oninput = (event) => {
        const [type,i] = (event.target.dataset.email || '').split(':');
        if (type) draft[type][Number(i)] = event.target.value;
        result(root,'');
      };
      form.onclick = (event) => {
        const target = event.target.closest('[data-auto-action]');
        if (!target || target.closest('dialog')) return;
        if (target.dataset.autoAction==='add-email') {
          const type = target.dataset.emailType;
          if (draft[type].length>=20) return;
          draft[type].push('');
          paint();
          root.querySelector(`[data-email="${type}:${draft[type].length-1}"]`)?.focus();
        } else if (target.dataset.autoAction==='delete-email') {
          const [type,i] = target.dataset.emailRow.split(':');
          const index = Number(i);
          const remove = () => {draft[type].splice(index,1);paint();};
          if (draft[type][index].trim()) confirm(root,draft[type][index],remove);
          else remove();
        }
      };
      form.onsubmit = (event) => {
        event.preventDefault();
        for (const type of Object.keys(groups)) draft[type] = [...new Set(draft[type].map((s)=>s.trim().toLowerCase()).filter(Boolean))];
        set(id,draft);
        paint();
        result(root,'保存成功');
      };
    };
    paint();
  };

  pages['ticket/assignment'] = (root) => {
    const id = 'assignment-v1';
    const rows = get(id,[
      {key:'assign-a',name:'站内聊天分单',team:'售后支持组',channel:'LiveChat',on:true,date:'2026-11-05 10:30'},
      {key:'assign-b',name:'邮件工单分单',team:'邮件支持组',channel:'邮件',on:true,date:'2026-11-04 09:00'},
      {key:'assign-c',name:'默认接待分单',team:'默认团队',channel:'邮件',on:false,date:'2026-11-03 18:20'}
    ]);
    let query = '';
    root.innerHTML = header('assignment') + `<div class="replica-body"><div class="replica-toolbar" style="justify-content:space-between"><input class="replica-field" type="search" placeholder="搜索" aria-label="搜索" style="background:#f3f4f6;border-color:#f3f4f6;width:min(280px,100%)">${button('＋ 自动规则','new','primary')}</div><div class="replica-table-wrap"><table class="replica-table"><thead><tr><th>按以下顺序执行自动规则</th><th>执行动作</th><th>状态</th><th>最后更新时间</th><th aria-label="操作"></th></tr></thead><tbody></tbody></table></div></div>`;
    const tbody = root.querySelector('tbody');
    const paintRows = () => {
      tbody.innerHTML = rows.filter((row)=>row.name.toLowerCase().includes(query.toLowerCase())).map((row)=>`<tr><td>${escape(row.name)}</td><td>平均分配给${escape(row.team)}</td><td>${sw(row.name,row.on,`data-auto-action="toggle" data-key="${row.key}"`)}</td><td class="time">${escape(row.date)}</td><td><div class="row-actions">${iconAction('edit','编辑','edit',`data-key="${row.key}"`)}${iconAction('delete','删除','delete',`data-key="${row.key}"`)}</div></td></tr>`).join('') || '<tr><td class="empty" colspan="5">暂无数据</td></tr>';
    };
    const open = (row) => {
      const dialog = document.createElement('dialog');
      dialog.className = 'drawer';
      dialog.setAttribute('aria-label',row?'编辑自动规则':'添加自动规则');
      dialog.innerHTML = `<form><div class="replica-head"><h1>${row?'编辑':'添加'}自动规则</h1>${button('×','close','','aria-label="关闭"')}</div><div class="replica-body replica-form"><label class="field-label">自动规则名称<input class="replica-field" name="name" required placeholder="输入自动规则名称" value="${escape(row?.name)}"></label><fieldset><legend>当工单转人工并满足以下条件时</legend><label class="field-label">渠道${choose(['LiveChat','邮件'],row?.channel,'name="channel"')}</label></fieldset><fieldset><legend>执行以下动作</legend><label class="field-label">平均分配给${choose(['默认团队','售后支持组','邮件支持组'],row?.team,'name="team"')}</label></fieldset><div class="replica-form-actions">${button('取消','close')}<button class="replica-button primary" type="submit">保存</button></div></div></form>`;
      root.append(dialog);
      dialog.addEventListener('close',()=>dialog.remove(),{once:true});
      dialog.onclick = (event) => {if(event.target.closest('[data-auto-action="close"]')) dialog.close();};
      const form = dialog.querySelector('form');
      form.elements.name.oninput = ()=>form.elements.name.setCustomValidity('');
      form.onsubmit = (event) => {
        event.preventDefault();
        const name = form.elements.name.value.trim();
        if (!name || rows.some((r)=>r.key!==row?.key && r.name===name)) {
          form.elements.name.setCustomValidity(name?'自动规则名称已存在':'输入自动规则名称');
          form.elements.name.reportValidity();
          return;
        }
        const edited = {name,team:form.elements.team.value,channel:form.elements.channel.value,date:new Date().toLocaleString('sv-SE').slice(0,16)};
        if (row) Object.assign(row,edited); else rows.unshift({key:'assign-'+Date.now(),on:false,...edited});
        set(id,rows);
        paintRows();
        dialog.close();
      };
      dialog.showModal();
    };
    root.querySelector('[type="search"]').oninput = (event) => {query=event.target.value;paintRows();};
    root.onclick = (event) => {
      const target = event.target.closest('[data-auto-action]');
      if(!target || target.closest('dialog'))return;
      const row = rows.find((r)=>r.key===target.dataset.key);
      const action = target.dataset.autoAction;
      if(action==='new'||(action==='edit'&&row))open(row);
      if(action==='toggle'&&row){row.on=!row.on;set(id,rows);target.setAttribute('aria-checked',String(row.on));}
      if(action==='delete'&&row)confirm(root,row.name,()=>{rows.splice(rows.indexOf(row),1);set(id,rows);paintRows();});
    };
    paintRows();
  };
})();
