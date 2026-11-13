(() => {
  const data = window.settingsDemo;
  const section = document.querySelector('#prototype');
  const frame = document.querySelector('#demo-frame');
  const standalone = document.querySelector('#demo-open');
  const currentPath = document.querySelector('#demo-path');
  const tbody = document.querySelector('#inventory tbody');
  const defaultRoute = 'ticket/triggers';
  let activeRoute = defaultRoute;
  let legacyMode = false;
  let fileNavigation = 0;
  const demoUrl = (route, legacy = false) => 'prototype/index.html#' + (legacy ? 'legacy/' : '') + route;

  function showLocation(route, legacy = false) {
    const entry = data.resolve(route);
    if (!entry) return;
    activeRoute = route;
    legacyMode = legacy && Boolean(data.legacyPaths[route]);
    currentPath.textContent = legacyMode ? data.legacyPaths[route] : entry.path;
    standalone.href = demoUrl(route, legacyMode);
    document.querySelectorAll('[data-mode]').forEach((button) => {
      button.setAttribute('aria-pressed', String((button.dataset.mode === 'legacy') === legacyMode));
    });
    document.querySelectorAll('.demo-examples [data-demo]').forEach((link) => {
      if (link.dataset.demo === route) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  window.addEventListener('message', (event) => {
    const localFile = location.protocol === 'file:' && event.origin === 'null';
    if (event.source !== frame.contentWindow || (!localFile && event.origin !== location.origin) ||
        event.data?.type !== 'shulex-menu-location' || typeof event.data.route !== 'string') return;
    showLocation(event.data.route, event.data.legacy === true);
  });
  function navigate(route, legacy) {
    const url = demoUrl(route, legacy);
    if (activeRoute !== route || legacyMode !== legacy) {
      const destination = new URL(url, location.href);
      if (location.protocol === 'file:') {
        // Local files have opaque origins. Use a distinct URL so returning to the
        // original src still works after navigation inside the iframe.
        destination.searchParams.set('view', ++fileNavigation);
        frame.src = destination.href;
      } else {
        frame.contentWindow.location.replace(destination.href);
      }
    }
    showLocation(route, legacy);
  }
  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      const legacy = button.dataset.mode === 'legacy';
      navigate(legacy && !data.legacyPaths[activeRoute] ? defaultRoute : activeRoute, legacy);
    });
  });

  const rows = document.createDocumentFragment();
  for (const [oldPath, route, action, boundary, label] of data.migration) {
    const target = route ? data.resolve(route) : null;
    const row = document.createElement('tr');
    row.insertCell().textContent = oldPath;
    const destination = row.insertCell();
    if (target) {
      const group = document.createElement('span');
      group.className = 'map-target';
      group.textContent = target.item ? [target.category.name, target.group].join(' → ') : '';
      if (group.textContent) destination.append(group);
      if (data.legacyPaths[route] && !/确认|边界/.test(action)) {
        const link = document.createElement('a');
        link.href = demoUrl(route);
        link.dataset.demo = route;
        link.className = 'map-link';
        link.textContent = (target.item?.[1] || target.path) + ' ↗';
        link.setAttribute('aria-label', '在原型中查看 ' + target.path);
        destination.append(link);
      } else destination.append(target.item?.[1] || target.path);
      const coverage = document.createElement('span');
      coverage.className = 'map-preview';
      coverage.textContent = data.legacyPaths[route] ? '可看配置页' : route === 'home' ? '兼容方式待确认' : '未制作配置页';
      destination.append(coverage);
    } else {
      destination.textContent = label;
    }
    const status = document.createElement('span');
    status.className = 'check ' + (action === '不迁入' ? 'no' : /确认|边界/.test(action) ? 'wait' : 'yes');
    status.textContent = action;
    row.insertCell().append(status);
    row.insertCell().textContent = boundary;
    rows.append(row);
  }
  tbody.replaceChildren(rows);

  const audit = document.querySelector('#mapping tbody');
  for (const [setting, current, target, route] of data.settingAudit) {
    const row = audit.insertRow();
    const title = document.createElement('th');
    title.scope = 'row';
    title.textContent = setting;
    row.append(title);
    row.insertCell().textContent = current;
    row.insertCell().textContent = target;
    const demo = row.insertCell();
    if (route) {
      const link = document.createElement('a');
      link.href = demoUrl(route);
      link.dataset.demo = route;
      link.className = 'map-link';
      link.textContent = '看配置 ↗';
      link.setAttribute('aria-label', '查看配置：' + setting);
      demo.append(link);
    } else demo.textContent = '留原业务页';
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-demo]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const route = link.dataset.demo;
    if (!data.resolve(route)) return;
    event.preventDefault();
    navigate(route, section.contains(link) && legacyMode && Boolean(data.legacyPaths[route]));
    if (!section.contains(link)) {
      history.replaceState(null, '', '#prototype');
      section.scrollIntoView({ block: 'start' });
      document.querySelector('#prototype-title').focus({ preventScroll: true });
    }
  });
})();
