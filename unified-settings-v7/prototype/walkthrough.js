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
    ['效率',[['自动规则','bolt','ticket/assignment'],['触发器','bolt','ticket/triggers']]],
    ['工单',[['字段与表单','layout','common/fields'],['SLA 策略','ticket','ticket/sla'],['队列','layout','ticket/routing'],['满意度调查','ticket','ticket/csat'],['WhatsApp 模板','inbox','common/whatsapp'],['工具栏扩展','layout','ticket/toolbar']]],
    ['AI',[['AI 打标','bolt','ai/tagging']]],
    ['坐席配置',[['成员','people','common/members'],['团队','people','common/teams'],['排班','report','ticket/calendar'],['容量','people','ticket/capacity']]]
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
      icon({common:'gear',ai:'shield',ticket:'ticket',channel:'inbox',platform:'layout',tools:'box'}[category.id])+category.name+'</summary>'+
      category.groups.map(([group,items]) => [group,items.filter(([id])=>window.solveaReplica?.[category.id+'/'+id])]).filter(([,items])=>items.length).map(([group,items]) => '<section class="settings-group">'+(category.groups.length===1?'':'<div class="group-caption">'+group+'</div>')+
        items.map(([id,label])=>'<a href="#'+category.id+'/'+id+'"'+attr(entry.item?.[0]===id)+'>'+icon(itemIcons[id])+label+'</a>').join('')+
      '</section>').join('')+'</details>').join('')+'</nav>';
  }
  function applicationMenu(entry, legacy, ai) {
    const apps = [
      ['chatbot','智能客服','inbox'],['desk','智能工作台','ticket'],['workbench','工作台','inbox'],['report','数据分析','report']
    ];
    if (!legacy || entry.app) apps.push(['settings','设置中心','gear']);
    const current=entry.app || (legacy?(ai?'chatbot':'desk'):'settings');
    const [,name,symbol]=apps.find(([id])=>id===current);
    const agentNav = [['首页','layout'],['数据分析','report'],['收件箱','inbox'],['预处理','bolt','ai/intent'],['知识中心','folder'],['搭建','box','tools/plugins'],['批量测试','gear'],['AI 安全','shield','ai/security'],['集成','box','channel/connections'],['智能伙伴','gear']];
    const workbenchNav = [['工单','ticket'],['联系人','people'],['报表','report'],['主动触达','inbox']];
    if (legacy) workbenchNav.push(['设置','gear','ticket/triggers']);
    const rows=current==='chatbot'?agentNav:current==='desk'?workbenchNav:[];
    const picker='<div class="app-picker"><button type="button" class="app-name" aria-expanded="false" aria-controls="application-list" aria-label="切换应用：'+name+'">'+icon(symbol)+name+'<span aria-hidden="true">≡</span></button><nav class="application-list" id="application-list" aria-label="切换应用" hidden>'+apps.map(([id,label,kind])=>
      '<a href="#'+(id==='settings'?'home':'app/'+id)+'"'+attr(current===id)+'>'+icon(kind)+label+(current===id?'<span aria-hidden="true">✓</span>':'')+'</a>').join('')+'</nav></div>';
    return picker+'<div class="app-items">'+rows.map(([label,kind,route])=>{
      const active=route===entry.route || kind==='gear'&&legacy&&current==='desk' || label==='集成'&&['channel','platform'].includes(entry.category?.id);
      return route ? '<a class="'+(active?'active':'')+'" href="'+(label==='集成'?'#app/chatbot':oldLink(route))+'">'+icon(kind)+label+'</a>' : '<span class="menu-row">'+icon(kind)+label+'</span>';
    }).join('')+'</div><div class="app-user"><i aria-hidden="true">D</i> Demo Workspace</div>';
  }
  function allSettings() {
    root.innerHTML='<div class="replica-head"><h1 tabindex="-1">全部设置</h1></div><div class="replica-body"><div class="replica-table-wrap"><table class="replica-table settings-inventory"><thead><tr><th scope="col">设置项</th><th scope="col">归属</th><th scope="col">配置内容</th></tr></thead><tbody>'+
      data.inventory.map(([route,name,,summary])=>{
        const entry=data.resolve(route);
        return '<tr><td><a href="#'+route+'">'+name+'</a></td><td>'+entry.path.split(' → ').slice(0,-1).join(' → ')+'</td><td>'+summary+'</td></tr>';
      }).join('')+'</tbody></table></div></div>';
  }
  function appPage(entry) {
    if (entry.app==='chatbot') window.solveaReplica['common/integrations'](root);
    else {
      const context={desk:['工单','联系人','主动触达'],workbench:['工作台'],report:['智能客服看板','工作台看板']};
      root.innerHTML='<div class="replica-head"><h1>'+entry.path+'</h1></div><div class="replica-body"><ul class="application-context">'+context[entry.app].map(x=>'<li>'+x+'</li>').join('')+'</ul></div>';
    }
  }
  const setPicker = (open, focus = false) => {
    const toggle=appRail.querySelector('.app-name');
    const list=appRail.querySelector('#application-list');
    if (!toggle||!list) return;
    toggle.setAttribute('aria-expanded',String(open));
    list.hidden=!open;
    if(focus) (open?list.querySelector('[aria-current],a'):toggle)?.focus();
  };
  appRail.addEventListener('click', e=>{
    const toggle=e.target.closest('.app-name');
    if (toggle) setPicker(toggle.getAttribute('aria-expanded')!=='true');
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.app-picker'))setPicker(false);});
  document.addEventListener('keydown',e=>{
    const picker=appRail.querySelector('.app-name');
    if(e.key==='Escape'&&picker?.getAttribute('aria-expanded')==='true')setPicker(false,true);
    if(e.key==='ArrowDown'&&document.activeElement===picker){e.preventDefault();setPicker(true,true);}
  });
  function missing(entry) {
    root.innerHTML='<div class="replica-head"><h1>'+entry.path+'</h1></div><div class="replica-body"><a href="#home">返回全部设置</a></div>';
  }
  function render(moveFocus = false) {
    const hash = location.hash.slice(1);
    const legacy = hash.startsWith('legacy/');
    const raw = legacy ? hash.slice('legacy/'.length) : hash;
    if (raw==='common/webhook' || raw==='ticket/webhook') {
      location.replace('#'+(legacy?'legacy/':'')+'ticket/triggers');
      return;
    }
    if (data.aliases[raw]) {location.replace('#'+(legacy?'legacy/':'')+data.aliases[raw]);return;}
    const route = raw;
    if (!legacy && data.defaults[route]) {
      location.replace('#'+data.defaults[route]);
      return;
    }
    const entry = data.resolve(route) || data.resolve('home');
    const isLegacy = legacy && Boolean(currentPaths[entry.route]);
    const isAgent = isLegacy && currentPaths[entry.route].startsWith('智能客服');
    document.querySelector('#app').classList.toggle('one-rail', isAgent || Boolean(entry.app));
    document.querySelector('#top-title').textContent = entry.app==='chatbot'?'集成':entry.app?entry.path:isAgent?entry.item[1]:isLegacy?'设置':'设置中心';
    rail.innerHTML = settingsMenu(entry, isLegacy);
    appRail.innerHTML = applicationMenu(entry, isLegacy, isAgent);
    root.onclick = null;
    root.oninput = null;
    root.onchange = null;
    const replica = window.solveaReplica?.[entry.route];
    if (replica) replica(root);
    else if (entry.app) appPage(entry);
    else if (entry.route==='home') allSettings();
    else missing(entry);
    document.title = (isLegacy ? currentPaths[entry.route] : entry.path) + ' · Solvea 复刻原型';
    if (moveFocus) {
      const heading = root.querySelector('h1');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({preventScroll:true});
      window.scrollTo({top:0,behavior:'instant'});
    }
    if (embedded) window.parent.postMessage({type:'shulex-menu-location', route:entry.route, legacy:isLegacy}, location.protocol === 'file:' ? '*' : location.origin);
  }
  window.addEventListener('hashchange',()=>render(true));
  render();
})();
