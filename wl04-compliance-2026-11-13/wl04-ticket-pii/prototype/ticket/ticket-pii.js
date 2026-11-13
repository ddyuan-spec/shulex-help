'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const byClass = (part, root = document) => $(`[class*="${part}"]`, root);
  const element = (tag, text, classes) => {
    const node = document.createElement(tag);
    if (classes) node.className = classes;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const action = (label, run, classes) => {
    const node = element('button', undefined, classes);
    node.type = 'button';
    node.setAttribute('aria-label', label);
    node.title = label;
    node.addEventListener('click', run);
    return node;
  };
  const markAction = (node, label, run) => {
    node.setAttribute('aria-label', label);
    node.title = label;
    if (node.tagName !== 'BUTTON') {
      node.tabIndex = 0;
      node.setAttribute('role', 'button');
      node.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          node.click();
        }
      });
    }
    node.addEventListener('click', run);
  };
  const entry = $('#entry');
  const detail = byClass('ticketContainer___');
  const list = byClass('ticketList___');
  const scroll = $('#scrollDiv');
  const cardList = $('.slx-list-items', scroll);
  const cardPrototype = $('.slx-list-item', cardList).cloneNode(true);
  const info = byClass('customerInfoPanel___', detail);
  const infoLines = byClass('infos___', info);
  const nameLine = byClass('nameText___', info).parentElement;
  const emailLine = byClass('subInfo___', info);
  const phoneLine = emailLine.cloneNode(true);
  const iconPhone = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 18 18 0 0 1-7.9-2.8 18 18 0 0 1-5.6-5.6 18 18 0 0 1-2.8-7.9A2 2 0 0 1 5.5 3h3a2 2 0 0 1 2 1.7l.7 3a2 2 0 0 1-.5 2.1L9.5 11a15 15 0 0 0 5.6 5.6l1.2-1.2a2 2 0 0 1 2.1-.5l3 .7a2 2 0 0 1 .6 1.3Z"/></svg>';
  $('svg', phoneLine).outerHTML = iconPhone;
  $('svg', phoneLine).style.marginRight = '6px';
  infoLines.append(phoneLine);

  const senderName = byClass('userName___', $('#message-150048123'));
  const senderIcon = senderName.nextElementSibling;
  const replyHeaderForm = $('#replyBoxFrom');
  const replyHeader = $('#replyBoxHeader');
  const replyRows = $$('[class*="formItem___"]', replyHeaderForm);
  const replyRecipient = byClass('itemContent___', replyRows[0]);
  const replySender = byClass('itemContent___', replyRows[1]);
  const replySubject = $('input', replyRows[2]);
  const editor = $('[contenteditable="true"]', detail);
  const sendButton = byClass('sendActions___', detail).querySelector('button');
  const selectedView = new URLSearchParams(location.search).get('view');
  const selectedTicket = new URLSearchParams(location.search).get('ticket');
  const deskButton = $$('a,button,[role="menuitem"]', entry).find(node => node.textContent.trim() === '工单');
  const layoutButtons = [...byClass('layoutChooseButton___').children];
  const visibleIds = new Set(['2101', '2102', '2103']);
  const records = [
    { id:'2101', name:'Amy Chen', email:'amy@example.com', channel:'Email', subject:'退货进度查询', from:'support@solvea.example', time:'10:01', status:'处理中', incoming:'您好，上周寄回的商品已经签收了，请问退款预计什么时候到账？', outgoing:'您好，我们已收到退货，正在核对入库记录，有进展后会及时回复。' },
    { id:'2102', name:'周安然', phone:'13800134826', channel:'WhatsApp', subject:'包裹配送进度查询', from:'', time:'10:07', status:'处理中', incoming:'你好，订单显示已发货，请问周五前可以送到吗？', outgoing:'您好，我来帮您查询包裹进度。' },
    { id:'2103', email:'case.three@example.com', channel:'Email', subject:'换货规格确认', from:'service@solvea.example', time:'10:16', status:'待处理', incoming:'您好，我希望换成同款的白色版本，可以帮忙核对库存吗？', outgoing:'您好，我先为您核对需要的款式。' },
  ];
  const names = { name:'姓名', email:'邮箱', phone:'电话' };
  const data = () => records.find(row => row.id === state.ticket);
  const state = { ticket:null, layout:selectedView === 'table' ? 'table' : 'card', show:new Set(), query:'', view:'全部', popover:false, addresses:false };
  let announceTimer = 0;
  let lastReply = null;

  const svg = {
    eye:'<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    closed:'<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3 21 21M10 6a10.8 10.8 0 0 1 2-.2c6.4 0 10 6.2 10 6.2a14.9 14.9 0 0 1-3.1 3.6M6.2 7.5C3.5 9.3 2 12 2 12s3.6 6.2 10 6.2a10.7 10.7 0 0 0 4.4-1M10 10a2.8 2.8 0 0 0 4 4"/></svg>',
  };
  function masked(field, value) {
    if (!value) return '—';
    if (field === 'email') {
      const end = value.indexOf('@');
      return end > 0 ? `${value[0]}***${value.slice(end)}` : `${value[0]}***`;
    }
    if (field === 'phone') return `${value.slice(0, 3)}****${value.slice(-4)}`;
    return `${value[0]}*`;
  }
  const displayed = (field, value) => state.show.has(field) ? value : masked(field, value);
  const contactField = record => record.name ? 'name' : record.email ? 'email' : 'phone';
  function notice(text) {
    clearTimeout(announceTimer);
    let node = $('#ticket-toast');
    if (!node) {
      node = element('div', undefined, 'ticket-local-toast');
      node.id = 'ticket-toast';
      node.setAttribute('role', 'status');
      document.body.append(node);
    }
    node.textContent = text;
    node.hidden = false;
    announceTimer = setTimeout(() => { node.hidden = true; }, 1900);
  }
  async function copyField(field) {
    const record = data();
    if (!record || !state.show.has(field) || !record[field]) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(record[field]);
    } catch {
      const control = element('textarea');
      control.value = record[field];
      control.className = 'pii-clipboard-fallback';
      document.body.append(control);
      control.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* page can show the copy outcome */ }
      control.remove();
      if (!copied) { notice('复制失败，请手动复制已显示的原文'); return; }
    }
    notice('已复制');
  }
  const fields = { name:nameLine, email:emailLine, phone:phoneLine };
  for (const [field, row] of Object.entries(fields)) {
    row.classList.remove('cursorPointer___Na1oY');
    row.classList.add('pii-field');
    row.dataset.piiField = field;
    const value = field === 'name' ? byClass('nameText___', row) : byClass('content___EkQOW', row);
    value.dataset.piiValue = field;
    const originalCopy = byClass('copyBtn___', row);
    const eye = action('', () => {
      if (!data()?.[field]) return;
      if (state.show.has(field)) state.show.delete(field); else state.show.add(field);
      renderPII();
    }, 'pii-icon pii-eye');
    eye.dataset.piiToggle = field;
    const copy = action(`复制${names[field]}`, () => { void copyField(field); }, 'pii-icon pii-copy');
    copy.dataset.piiCopy = field;
    copy.innerHTML = originalCopy.innerHTML;
    originalCopy.replaceWith(eye, copy);
  }
  info.id = 'ticket-customer-info';
  list.id = 'ticket-list';
  detail.id = 'ticket-detail';
  const viewMenu = $$('.menuItem___RWPzN');
  viewMenu[0].parentElement.id = 'ticket-scope';
  if (deskButton) deskButton.id = 'ticket-desk-entry';
  senderIcon.id = 'ticket-email-header';

  const addressButton = action('', () => {
    state.addresses = !state.addresses;
    renderPII();
  }, 'pii-reply-contact');
  addressButton.id = 'ticket-reply-contact';
  replyHeader.insertBefore(addressButton, replyHeader.children[3]);

  const emailPopover = element('div', undefined, 'pii-email-popover');
  emailPopover.id = 'ticket-email-popover';
  emailPopover.hidden = true;
  senderIcon.after(emailPopover);
  markAction(senderIcon, '邮件信息', () => { state.popover = !state.popover; renderPII(); });
  senderIcon.setAttribute('aria-controls', emailPopover.id);
  addressButton.setAttribute('aria-controls', replyHeaderForm.id);

  function showSelectedRoute(replace = false) {
    const target = state.ticket ? '#ticket-detail' : '#ticket-list';
    const path = new URL(location.href);
    if (state.layout === 'table') path.searchParams.set('view', 'table'); else path.searchParams.delete('view');
    if (state.ticket) path.searchParams.set('ticket', state.ticket); else path.searchParams.delete('ticket');
    path.hash = target;
    try {
      if (path.href !== location.href) history[replace ? 'replaceState' : 'pushState'](null, '', path);
    } catch { /* keep navigation usable under restrictive local file policies */ }
  }
  function selectTicket(id, update = true, options = {}) {
    const old = state.ticket;
    state.ticket = id && visibleIds.has(id) ? id : null;
    if (old !== state.ticket || options.forceReset || !state.ticket) {
      state.show.clear();
      state.popover = false;
      state.addresses = false;
      editor.textContent = '';
      lastReply = null;
      $('.pii-local-reply')?.remove();
    }
    if (id && !state.ticket && options.alert) notice('无法查看该工单');
    if (update) showSelectedRoute();
    renderList();
    renderDetail();
  }

  function visibleRecords() {
    const query = state.query.trim().toLocaleLowerCase();
    return records.filter(row => visibleIds.has(row.id)
      && (state.view === '全部' || state.view === '我的工单' || state.view === row.channel || state.view === row.status)
      && (!query || [row.id, row.name, row.email, row.phone, row.subject].some(value => value?.toLocaleLowerCase().includes(query))));
  }
  function selectRow(node, row) {
    node.dataset.ticketId = row.id;
    markAction(node, `查看工单 #${row.id} ${row.subject}`, () => selectTicket(row.id));
    if (state.ticket === row.id) node.setAttribute('aria-current', 'true');
  }

  const tableArea = element('div', undefined, 'pii-table-area');
  const tableTools = element('div', undefined, 'pii-table-tools');
  const exportButton = action('导出', () => { setExport(!exportMenu.hidden); }, 'slx-btn slx-btn-default slx-btn-variant-outlined slx-theme pii-export');
  exportButton.textContent = '导出';
  exportButton.id = 'ticket-export';
  const exportMenu = element('div', undefined, 'pii-export-menu');
  exportMenu.id = 'ticket-export-menu';
  exportMenu.hidden = true;
  exportButton.setAttribute('aria-controls', exportMenu.id);
  function setExport(wasOpen) {
    exportMenu.hidden = wasOpen;
    exportButton.setAttribute('aria-expanded', String(!wasOpen));
  }
  for (const label of ['导出工单标签', '导出工单消息', '导出满意度数据']) {
    const option = action(label, () => { setExport(true); }, 'pii-export-option');
    option.textContent = label;
    exportMenu.append(option);
  }
  const tableCount = element('span', undefined, 'pii-table-count');
  tableTools.append(tableCount, exportButton, exportMenu);
  const table = element('table', undefined, 'slx-table pii-table');
  table.setAttribute('aria-label', '工单表格');
  const headers = ['主题', 'SLA', '工单号', '状态', '最后消息', '标签', '备注', '处理人', '客户邮箱', '售后邮箱', '创建日期'];
  const tableHeader = table.createTHead().insertRow();
  for (const name of headers) {
    const header = element('th', name);
    header.scope = 'col';
    tableHeader.append(header);
  }
  const tableBody = table.createTBody();
  tableArea.append(tableTools, table);
  scroll.after(tableArea);

  for (const node of $$('span', scroll)) {
    if (node.textContent.trim().startsWith('加载中') && node.childElementCount === 0) node.parentElement.hidden = true;
  }
  const emptyList = element('div', '暂无数据', 'ticket-local-empty');
  emptyList.hidden = true;
  scroll.append(emptyList);
  const emptyDetail = element('div', '请选择工单', 'ticket-local-empty pii-empty-detail');
  detail.after(emptyDetail);
  const searchField = element('input', undefined, 'slx-input slx-input-sm pii-ticket-search');
  searchField.type = 'search';
  searchField.placeholder = '搜索工单';
  searchField.setAttribute('aria-label', '搜索工单');
  searchField.hidden = true;
  byClass('header___afi2b', list).after(searchField);
  searchField.addEventListener('input', () => { state.query = searchField.value; renderList(); });
  const listActions = $$('button', byClass('headerActions___', list));
  markAction(listActions[0], '搜索工单', () => {
    searchField.hidden = !searchField.hidden;
    if (!searchField.hidden) searchField.focus();
    else if (state.query) { searchField.value = ''; state.query = ''; renderList(); }
  });
  const collapseRight = $('button', byClass('header___gquzf', detail));
  markAction(collapseRight, '返回工单列表', () => selectTicket(null));
  if (deskButton) markAction(deskButton, '工单', event => { event.preventDefault(); state.view = '全部'; selectTicket(null); });

  for (const [index, node] of layoutButtons.entries()) {
    const mode = index === 0 ? 'card' : 'table';
    markAction(node, mode === 'card' ? '卡片视图' : '表格视图', () => {
      if (state.layout === mode) return;
      state.layout = mode;
      selectTicket(null);
    });
    node.dataset.ticketView = mode;
  }

  for (const node of viewMenu) {
    const label = byClass('text___E7psm', node)?.textContent.trim();
    if (!label) continue;
    const count = byClass('count___', node);
    if (count) {
      const size = label === '全部' || label === '我的工单' ? records.length : records.filter(row => row.channel === label || row.status === label).length;
      count.textContent = String(size);
    }
    markAction(node, label, () => { state.view = label; selectTicket(null); });
    node.dataset.ticketScope = label;
  }

  function renderList() {
    const current = visibleRecords();
    const isTable = state.layout === 'table';
    tableCount.textContent = current.length > 0 ? `共${current.length} 条` : '';
    layoutButtons.forEach(node => {
      const active = node.dataset.ticketView === state.layout;
      node.classList.toggle('active___JbB10', active);
      node.setAttribute('aria-pressed', String(active));
    });
    viewMenu.forEach(node => node.classList.toggle('active___ExFwc', node.dataset.ticketScope === state.view));
    list.classList.toggle('pii-list-expanded', !state.ticket || isTable);
    list.classList.toggle('pii-list-table', isTable);
    byClass('contentRow___').classList.toggle('pii-table-mode', isTable);
    scroll.hidden = isTable;
    tableArea.hidden = !isTable;
    exportButton.setAttribute('aria-expanded', String(!exportMenu.hidden));
    cardList.replaceChildren();
    tableBody.replaceChildren();
    for (const row of current) {
      const field = contactField(row);
      const card = cardPrototype.cloneNode(true);
      selectRow(card, row);
      byClass('customer___', card).textContent = masked(field, row[field]);
      byClass('ticketNumber___', card).textContent = `#${row.id}`;
      byClass('title___', card).textContent = row.subject;
      byClass('channelIcon___', card).textContent = row.channel;
      const footer = byClass('footer___', card);
      footer.firstElementChild.lastElementChild.textContent = row.status;
      footer.lastElementChild.textContent = row.time;
      byClass('ticketItem___', card).classList.toggle('active___b_DXM', row.id === state.ticket);
      cardList.append(card);
      const tr = tableBody.insertRow();
      selectRow(tr, row);
      for (const [index, value] of [row.subject, '—', `#${row.id}`, row.status, row.time, '—', '—', '客服 A', masked('email', row.email), row.from || '—', '11/12'].entries()) {
        const cell = tr.insertCell();
        cell.textContent = value;
        if (index === 8) cell.className = 'pii-table-customer';
      }
    }
    emptyList.textContent = state.query.trim() ? '未搜索到工单' : '暂无数据';
    emptyList.hidden = current.length > 0;
    if (!current.length) {
      const cell = tableBody.insertRow().insertCell();
      cell.colSpan = headers.length;
      cell.textContent = emptyList.textContent;
    }
  }

  function renderPII() {
    const record = data();
    if (!record) return;
    for (const [field, row] of Object.entries(fields)) {
      const isVisible = state.show.has(field);
      row.hidden = !record[field];
      $('[data-pii-value]', row).textContent = displayed(field, record[field]);
      const toggle = $('.pii-eye', row);
      const label = `${isVisible ? '隐藏' : '显示'}${names[field]}`;
      toggle.title = label;
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('aria-pressed', String(isVisible));
      toggle.innerHTML = isVisible ? svg.eye : svg.closed;
      $('.pii-copy', row).disabled = !isVisible;
    }
    const first = contactField(record);
    senderName.textContent = displayed(first, record[first]);
    const addressField = record.email ? 'email' : 'phone';
    const summary = record.name ? [displayed('name', record.name)] : [];
    if (record[addressField]) summary.push(displayed(addressField, record[addressField]));
    addressButton.textContent = summary.join('，');
    addressButton.title = state.addresses ? '收起收发信信息' : '查看收发信信息';
    addressButton.setAttribute('aria-expanded', String(state.addresses));
    addressButton.setAttribute('aria-label', `${addressButton.title}：${summary.join('，')}`);
    replyHeaderForm.hidden = !state.addresses || !record.email;
    replyRecipient.textContent = displayed('email', record.email);
    replySender.textContent = record.from;
    senderIcon.hidden = !record.email;
    senderIcon.setAttribute('aria-expanded', String(state.popover && !!record.email));
    emailPopover.hidden = !state.popover || !record.email;
    emailPopover.replaceChildren();
    if (state.popover && record.email) {
      const fromLine = element('div', undefined, 'pii-mail-line');
      fromLine.append(element('span', '发件人', 'pii-mail-label'), element('span', displayed('email', record.email)));
      const toLine = element('div', undefined, 'pii-mail-line');
      toLine.append(element('span', '收件人', 'pii-mail-label'), element('span', record.from));
      emailPopover.append(fromLine, toLine);
    }
  }

  function renderDetail() {
    const record = data();
    detail.hidden = !record;
    emptyDetail.hidden = !!record || state.layout === 'table';
    if (!record) {
      for (const value of $$('[data-pii-value]', detail)) value.textContent = '';
      senderName.textContent = '';
      replyRecipient.textContent = '';
      addressButton.textContent = '';
      emailPopover.replaceChildren();
      emailPopover.hidden = true;
      return;
    }
    byClass('preview___', byClass('ticketSubject___', detail)).textContent = record.subject;
    for (const number of $$('[class*="ticketNumber___"]', byClass('bodyContainer___', detail))) number.textContent = `#${record.id}`;
    for (const status of $$('[class*="ticketStatusTag___"]', byClass('bodyContainer___', detail))) {
      const indicator = status.firstElementChild;
      if (indicator) indicator.style.background = record.status === '待处理' ? '#f56c40' : '#3a7bdc';
      for (const node of [...status.childNodes]) if (node.nodeType === Node.TEXT_NODE) node.remove();
      status.append(record.status);
    }
    const avatars = [$('.shulex-avatar-text', info), $('.shulex-avatar-text', $('#message-150048123'))];
    for (const avatar of avatars) if (avatar) avatar.textContent = record[contactField(record)][0].toUpperCase();
    for (const [node, text] of [[$('#message-150048123'), record.incoming], [$('#message-150048125'), record.outgoing]]) {
      byClass('emailSubject___', node).textContent = record.subject;
      byClass('messageContent___', node).textContent = text;
    }
    replySubject.value = `Re: ${record.subject}`;
    sendButton.disabled = !editor.textContent.trim();
    renderPII();
  }

  const notes = byClass('noteMessage___', detail);
  if (notes) {
    const content = byClass('messageContent___', notes);
    if (content) content.textContent = '已核对处理记录。';
  }
  const notesBanner = byClass('noteContentWrapper___', detail);
  if (notesBanner) byClass('messageContent___', notesBanner).textContent = '已核对处理记录。';
  const related = byClass('relatedTicketList___', detail);
  if (related) {
    const listHeader = byClass('listHeader___', related);
    if (listHeader) listHeader.lastElementChild.textContent = '0';
    byClass('listWrapper___', related)?.replaceChildren();
    byClass('listFooter___', related)?.remove();
  }
  // Captured tenant widgets retain their locations but do not load any external integrations.
  for (const frame of $$('iframe', detail)) frame.remove();
  const liveAddress = byClass('headerForm___', detail);
  if (liveAddress) liveAddress.hidden = true;
  editor.setAttribute('aria-label', '回复正文');
  editor.addEventListener('input', () => { sendButton.disabled = !editor.textContent.trim(); });
  sendButton.setAttribute('aria-label', '发送');
  sendButton.addEventListener('click', () => {
    const record = data();
    const body = editor.textContent.trim();
    if (!record || !body) return;
    // Synthetic reply preview only; the addressing path reads the record, not the mask or rendered DOM.
    lastReply = { ticket:record.id, recipient:record.email || record.phone, body };
    const draft = $('#message-150048125').cloneNode(true);
    draft.id = 'ticket-local-reply';
    draft.classList.add('pii-local-reply');
    byClass('messageContent___', draft).textContent = lastReply.body;
    byClass('time___', draft).textContent = '刚刚';
    byClass('contentScroll___', detail).append(draft);
    editor.textContent = '';
    sendButton.disabled = true;
    document.dispatchEvent(new CustomEvent('wl04:simulated-reply', { detail:{ ...lastReply } }));
  });

  document.addEventListener('click', event => {
    if (state.popover && !event.target.closest('#ticket-email-header, #ticket-email-popover')) {
      state.popover = false;
      renderPII();
    }
    if (!exportMenu.hidden && !event.target.closest('.pii-table-tools')) setExport(true);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (state.popover) { state.popover = false; renderPII(); senderIcon.focus(); }
    else if (state.addresses) { state.addresses = false; renderPII(); addressButton.focus(); }
    else if (!exportMenu.hidden) { setExport(true); exportButton.focus(); }
  });
  const restore = () => {
    const parameters = new URLSearchParams(location.search);
    state.layout = parameters.get('view') === 'table' ? 'table' : 'card';
    selectTicket(location.hash === '#ticket-list' ? null : parameters.get('ticket') || records[0].id, false, { forceReset:true, alert:true });
  };
  window.addEventListener('popstate', restore);
  selectTicket(location.hash === '#ticket-list' ? null : selectedTicket || records[0].id, false, { alert:true });
  entry.style.visibility = 'visible';
  entry.dataset.ready = 'true';
})();
