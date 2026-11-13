(() => {
  const data = window.settingsDemo;
  const section = document.querySelector('#prototype');
  const frame = document.querySelector('#demo-frame');
  const standalone = document.querySelector('#demo-open');
  const currentPath = document.querySelector('#demo-path');
  const tbody = document.querySelector('#mapping tbody');
  const back = document.querySelector('#back-to-row');
  const total = document.querySelector('#inventory-count');
  let activeRoute = 'home', lastConfig = '', legacyMode = false, filter = 'all', serial = 0;
  const urlFor = (route, legacy = false) => 'prototype/index.html#' + (legacy ? 'legacy/' : '') + route;
  const keyFor = route => 'setting-' + route.replace('/', '-');

  function show(route, legacy) {
    const entry = data.resolve(route);
    if (!entry) return;
    activeRoute = route;
    legacyMode = legacy && Boolean(data.legacyPaths[route]);
    if (entry.item) lastConfig = route;
    currentPath.textContent = legacyMode ? data.legacyPaths[route] : entry.path;
    standalone.href = urlFor(route, legacyMode);
    const all = section.querySelector('[data-demo=home]');
    if (route === 'home') all.setAttribute('aria-current','location');
    else all.removeAttribute('aria-current');
    back.href = lastConfig ? '#' + keyFor(lastConfig) : '#mapping';
    section.querySelectorAll('[data-mode]').forEach(b => {
      b.disabled = !entry.item && b.dataset.mode === 'legacy';
      b.setAttribute('aria-pressed', String((b.dataset.mode === 'legacy') === legacyMode));
    });
  }
  function navigate(route, legacy = false) {
    const dest = new URL(urlFor(route, legacy), location.href);
    if (route !== activeRoute || legacy !== legacyMode) {
      if (location.protocol === 'file:') {
        dest.searchParams.set('view', ++serial);
        frame.src = dest.href;
      } else {
        frame.contentWindow.location.replace(dest.href);
      }
    }
    show(route, legacy);
  }

  function renderRows() {
    const rows = document.createDocumentFragment();
    const visible = data.inventory.filter(([route]) => filter === 'all' || route.startsWith(filter + '/'));
    for (const [route, label, old, details] of visible) {
      const row = document.createElement('tr');
      row.id = keyFor(route);
      const title = document.createElement('th');
      title.scope = 'row';
      title.textContent = label;
      row.append(title);
      row.insertCell().textContent = old;
      const target = row.insertCell();
      const targetPath = document.createElement('strong');
      targetPath.textContent = data.resolve(route).path;
      target.append(targetPath);
      const note = document.createElement('span');
      note.className = 'map-preview';
      note.textContent = details;
      target.append(note);
      const link = document.createElement('a');
      link.className = 'map-link';
      link.href = urlFor(route);
      link.dataset.demo = route;
      link.textContent = '看配置 ↗';
      link.setAttribute('aria-label', '查看配置：' + label);
      row.insertCell().append(link);
      rows.append(row);
    }
    tbody.replaceChildren(rows);
    total.textContent = visible.length + ' 项设置';
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
  }

  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;renderRows();});
  section.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>navigate(activeRoute,b.dataset.mode==='legacy'));
  window.addEventListener('message', event => {
    const localFile = location.protocol === 'file:' && event.origin === 'null';
    if (event.source !== frame.contentWindow || (!localFile && event.origin !== location.origin) ||
        event.data?.type !== 'shulex-menu-location' || typeof event.data.route !== 'string') return;
    show(event.data.route,event.data.legacy === true);
  });

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-demo]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const route = link.dataset.demo;
    if (!data.resolve(route)) return;
    event.preventDefault();
    navigate(route);
    if (!section.contains(link)) {
      history.replaceState(null, '', '#prototype');
      section.scrollIntoView({ block:'start' });
      document.querySelector('#prototype-title').focus({ preventScroll:true });
    }
  });
  back.onclick = event => {
    event.preventDefault();
    if (lastConfig && !document.getElementById(keyFor(lastConfig))) {
      filter = 'all';
      renderRows();
    }
    const row = lastConfig ? document.getElementById(keyFor(lastConfig)) : null;
    const target = row || document.querySelector('#mapping-title');
    history.replaceState(null, '', '#' + (row?.id || 'mapping'));
    target.scrollIntoView({block:'center'});
    (row?.querySelector('a') || target).focus({preventScroll:true});
  };
  if (location.hash === '#inventory') history.replaceState(null, '', '#mapping');
  renderRows();
  show('home', false);
})();