(() => {
  const data = window.settingsDemo;
  const root = document.querySelector('#settings-view');
  const rail = document.querySelector('#settings-rail');
  const appRail = document.querySelector('#app-rail');
  const embedded = window.parent !== window;
  document.querySelector('#review').hidden = embedded;

  const shapes = {
    gear:'M10 2h4l1 3 3 1 3 2-1 4 1 4-3 2-3 1-1 3h-4l-1-3-3-1-3-2 1-4-1-4 3-2 3-1z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    ticket:'M3 5h18v4a3 3 0 0 0 0 6v4H3v-4a3 3 0 0 0 0-6z M13 8v1m0 3v1m0 3v1',
    people:'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 20v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2zm16-9a4 4 0 0 0 0-8m0 10a5 5 0 0 1 4 5v2',
    report:'M3 4h18v14H3z M7 14v-3m5 3V8m5 6v-4m-5 8v3',
    inbox:'M3 6h18v13H3zM3 13h5l2 2h4l2-2h5',
    layout:'M3 4h18v16H3zM9 4v16m4-11h4m-4 4h4',
    bolt:'m12 2-9 12h7l-1 8 11-13h-8z',
    box:'m12 2 9 5v10l-9 5-9-5V7zm0 10 9-5m-9 5L3 7m9 5v10',
    shield:'m12 2 9 4v6c0 5-5 8-9 10-4-2-9-5-9-10V6zm-4 10 3 3 5-6',
    folder:'M3 6h6l2 2h10v11H3z',
    edit:'m4 16 11-11 4 4L8 20H4zm10-10 4 4m-9 11h12',
    delete:'M3 6h18m-14 0 1-3h8l1 3m-12 0 1 15h12l1-15m-9 4v7m4-7v7',
    copy:'M8 8h13v13H8zM16 8V3H3v13h5',
    more:'M5 12h1m5 0h1m5 0h1'
  };
  const icon = (name) => '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(shapes[name] || shapes.folder)+'"/></svg>';
  window.replicaIcon = icon;
  const itemIcons = {triggers:'bolt',security:'shield',csat:'ticket',teams:'people',members:'people',channels:'box',sla:'ticket',fields:'layout',tagging:'bolt',form:'layout'};
  const currentPaths = data.legacyPaths;
  const legacyGroups = [
    ['效率',[['自动规则','bolt','ticket/assignment'],['触发器','bolt','ticket/triggers'],['Webhook','layout','common/webhook']]],
    ['工单',[['字段与表单','layout'],['SLA策略','ticket'],['路由配置','layout'],['队列','layout'],['满意度调查','ticket','ticket/csat'],['WhatsApp模板','inbox']]],
    ['AI',[['AI 打标','bolt'],['艾登（AI 助手）','bolt']]],
    ['坐席配置',[['成员','people'],['团队','people','common/teams'],['排班','report'],['容量','people']]]
  ];
  const attr = (condition) => condition ? ' aria-current="page"' : '';
  const automationRoutes = ['ticket/assignment','ticket/merge-close','ticket/mail'];
  const oldLink = (route) => '#legacy/' + route;
  function settingsMenu(entry, legacy) {
    if (legacy) {
      return '<h2>设置</h2><nav aria-label="原设置菜单">'+legacyGroups.map(([title,items]) =>
        '<section class="settings-group"><div class="group-caption">'+title+'</div>'+items.map(([label,kind,route]) =>
          route ? '<a href="'+oldLink(route)+'"'+attr(entry.route===route || route==='ticket/assignment' && automationRoutes.includes(entry.route))+'>'+icon(kind)+label+'</a>' :
            '<span class="menu-row">'+icon(kind)+label+'</span>').join('')+'</section>').join('')+'</nav>';
    }
    return '<h2><a href="#home">设置中心</a></h2><nav aria-label="设置中心目录">'+data.categories.map((category) =>
      '<details'+(entry.category?.id===category.id ? ' open' : '')+'><summary'+(entry.category?.id===category.id?' class="active"':'')+'>'+
      icon({common:'gear',ai:'shield',ticket:'ticket'}[category.id])+category.name+'</summary>'+
      category.groups.map(([group,items]) => [group,items.filter(([id])=>window.solveaReplica?.[category.id+'/'+id])]).filter(([,items])=>items.length).map(([group,items]) => '<section class="settings-group"><div class="group-caption">'+group+'</div>'+
        items.map(([id,label])=>'<a href="#'+category.id+'/'+id+'"'+attr(entry.item?.[0]===id)+'>'+icon(itemIcons[id])+label+'</a>').join('')+
      '</section>').join('')+'</details>').join('')+'</nav>';
  }
  function applicationMenu(entry, legacy, ai) {
    const agentNav = [['Profile','layout'],['Inbox','inbox'],['Preprocessing','bolt'],['Knowledge','folder'],['Build','box'],['Batch','gear'],['Safeguards','shield','ai/security'],['Integrations','box','common/channels'],['CX Claw','gear']];
    const workbenchNav = [['工单','ticket'],['联系人','people'],['报表','report'],['主动触达','inbox'],[legacy?'设置':'设置中心','gear',legacy?'ticket/triggers':'home']];
    return '<div class="app-name">'+icon('inbox')+(ai?'Agent':'智能工作台')+'<span aria-hidden="true">≡</span></div>'+
      '<div class="app-items">'+(ai?agentNav:workbenchNav).map(([label,kind,route])=>{
        const active = ai ? route===entry.route : kind==='gear';
        return route ? '<a class="'+(active?'active':'')+'" href="'+(legacy?oldLink(route):'#'+route)+'">'+icon(kind)+label+'</a>' :
          '<span class="menu-row">'+icon(kind)+label+'</span>';
      }).join('')+'</div><div class="app-user"><i aria-hidden="true">D</i> Demo Workspace</div>';
  }
  function directory(entry) {
    const content = entry.item ? '<p>此设置的配置页尚未制作，请查看方案对照表。</p><a href="../solution.html#mapping" target="_top">查看开发对照表</a>' :
      '<div class="directory-list">'+data.categories.map(({id,name})=>'<a href="#'+data.defaults[id]+'">'+icon({common:'gear',ai:'shield',ticket:'ticket'}[id])+name+'<span aria-hidden="true">›</span></a>').join('')+'</div>';
    root.innerHTML = '<div class="replica-head"><h1 tabindex="-1">'+(entry.item?.[1] || '设置中心')+'</h1></div><div class="replica-body directory overview">'+content+'</div>';
  }
  function render(moveFocus = false) {
    const hash = location.hash.slice(1);
    const legacy = hash.startsWith('legacy/');
    const route = legacy ? hash.slice('legacy/'.length) : hash;
    if (!legacy && data.defaults[route]) {
      location.replace('#'+data.defaults[route]);
      return;
    }
    const entry = data.resolve(legacy && !currentPaths[route] ? 'ticket/triggers' : route) || data.resolve('home');
    const isAgent = legacy && (entry.route==='ai/security' || entry.route==='common/channels');
    document.querySelector('#app').classList.toggle('one-rail', isAgent);
    document.querySelector('#top-title').textContent = isAgent ? (entry.route==='ai/security'?'Safeguards':'Integrations') : legacy ? '设置' : '设置中心';
    rail.innerHTML = settingsMenu(entry, legacy);
    appRail.innerHTML = applicationMenu(entry, legacy, isAgent);
    root.onclick = null;
    root.oninput = null;
    root.onchange = null;
    const replica = window.solveaReplica?.[entry.route];
    if (replica) replica(root);
    else directory(entry);
    document.title = (legacy ? currentPaths[entry.route] : entry.path) + ' · Solvea 复刻原型';
    if (moveFocus) {
      const heading = root.querySelector('h1');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({preventScroll:true});
      window.scrollTo({top:0,behavior:'instant'});
    }
    if (embedded) window.parent.postMessage({type:'shulex-menu-location', route:entry.route, legacy}, location.protocol === 'file:' ? '*' : location.origin);
  }
  window.addEventListener('hashchange',()=>render(true));
  render();
})();
