'use strict';

const OPEN_ROUTES = ['integration', 'open-app', 'open-apply', 'open-doc'];
const OPEN_LABELS = { name: '客户姓名', email: '客户邮箱' };
const OPEN_DOMAINS = ['DESK', 'AGENT', 'KNOWLEDGE_BASE'];
const OPEN_STATUS = { none: '未申请', pending: '审核中', approved: '已授权', rejected: '未通过', revoked: '已撤销' };
const OPEN_SAMPLE = Object.freeze({
  appName: '售后对账',
  clientId: 'demo_client_20261112',
  secret: 'demo_not_a_real_secret',
  purpose: '对账时用客户邮箱核对退换货记录。',
  customerId: '8105',
  ticketId: '2101',
  name: 'Amy Chen',
  maskedName: 'A** C***',
  email: 'amy@example.com',
  maskedEmail: 'a***@example.com'
});
const OPEN_ENDPOINTS = {
  list: { name: '查询完整工单列表', path: '/openapi/external/desk/tickets', description: '分页查询 access_token 所属租户的工单。' },
  detail: { name: '查询完整工单详情', path: '/openapi/external/desk/tickets/{ticketId}', description: '按 Shulex 工单号查询 access_token 所属租户的工单。' },
  messages: { name: '查询完整工单消息', path: '/openapi/external/desk/tickets/{ticketId}/messages', description: '分页查询指定工单的客户消息及客服回复。' }
};

const openQuery = new URLSearchParams(location.search);
const openScene = openQuery.get('scene') || 'default';
const openStorage = 'wl04-open-platform-v1:' + openScene;
let openFailureOnce = openScene === 'submit-error';
let openEndpoint = 'detail';
let openExample = 'current';
let openCurrentPage;
let openToastTimer;
const op = (id) => document.getElementById(id);

function openInitialState(scene) {
  const base = {
    appName: OPEN_SAMPLE.appName, domains: ['DESK'],
    status: 'none', approved: [], requested: [], purpose: '', rejected: '',
    secretVersion: 0
  };
  if (scene === 'empty') return { ...base, appName: '', domains: [] };
  if (scene === 'pending') return { ...base, status: 'pending', requested: ['email'], purpose: OPEN_SAMPLE.purpose };
  if (scene === 'approved') return { ...base, status: 'approved', approved: ['email'] };
  if (scene === 'expanding') return { ...base, status: 'pending', approved: ['email'], requested: ['name'], purpose: '按客户姓名复核对账记录。' };
  if (scene === 'rejected') return { ...base, status: 'rejected', requested: ['email'], purpose: '同步客户数据。', rejected: '请说明在哪个售后流程中需要使用客户邮箱。' };
  if (scene === 'revoked') return { ...base, status: 'revoked' };
  return base;
}

function openRestoreState() {
  const initial = openInitialState(openScene);
  try {
    const stored = JSON.parse(sessionStorage.getItem(openStorage));
    if (stored && OPEN_STATUS[stored.status] && Array.isArray(stored.domains)
      && Array.isArray(stored.approved) && Array.isArray(stored.requested)
      && typeof stored.appName === 'string') return { ...initial, ...stored };
  } catch {}
  return initial;
}
let openState = openRestoreState();

function openSaveState() {
  try { sessionStorage.setItem(openStorage, JSON.stringify(openState)); } catch {}
}

function openCanRequest() {
  return Boolean(openState.appName) && openState.domains.includes('DESK');
}
function openFieldNames(keys) {
  return keys.map((key) => OPEN_LABELS[key]).filter(Boolean).join('、');
}
function openToast(message) {
  op('toast').textContent = message;
  op('toast').hidden = false;
  clearTimeout(openToastTimer);
  openToastTimer = setTimeout(() => { op('toast').hidden = true; }, 2200);
}
function openSecretValue() {
  return OPEN_SAMPLE.secret + (openState.secretVersion ? '_' + openState.secretVersion : '');
}
function openSetSecretVisible(visible) {
  op('client-secret').type = visible ? 'text' : 'password';
  op('show-secret').setAttribute('aria-pressed', String(visible));
  const label = (visible ? '隐藏' : '显示') + ' client_secret';
  op('show-secret').title = label;
  op('show-secret').setAttribute('aria-label', label);
}

function openRenderApp() {
  const hasApp = Boolean(openState.appName);
  const canRequest = openCanRequest();
  const available = Object.keys(OPEN_LABELS).filter((key) => !openState.approved.includes(key));
  op('app-dot').classList.toggle('active', hasApp);
  op('domain-dot').classList.toggle('active', openState.domains.length > 0);
  op('pii-dot').classList.toggle('active', canRequest && openState.approved.length > 0);
  op('app-option-title').textContent = hasApp ? '当前租户已有应用' : '创建应用并签发凭据';
  op('app-option-description').textContent = hasApp ? '当前租户已存在开放平台应用，系统已自动加载，无需重复创建。' : '为 ERP 或其他第三方系统签发 client_id 和 client_secret，用于调用开放平台接口。';
  op('active-app-name').textContent = openState.appName;
  op('active-app-name').hidden = !hasApp;
  op('create-app').hidden = hasApp;
  op('credentials').hidden = !hasApp;
  op('client-secret').value = openSecretValue();
  op('rotate-secret').disabled = !hasApp;
  op('export-doc').disabled = !hasApp || !openState.domains.length;
  op('domain-fields').disabled = !hasApp;
  for (const field of document.querySelectorAll('input[name="work-domain"]')) field.checked = openState.domains.includes(field.value);
  op('save-domain').disabled = !hasApp;
  op('save-domain').textContent = openState.domains.length ? '保存更改' : '保存并授权';
  op('domain-error').hidden = true;
  op('pii-option').hidden = !canRequest;
  op('pii-status').textContent = OPEN_STATUS[openState.status];
  op('pii-status').dataset.tone = openState.status;
  op('pii-fields').textContent = openFieldNames(openState.approved) || '—';
  const apply = op('apply-button');
  apply.hidden = openState.status === 'pending' || available.length === 0;
  apply.textContent = openState.status === 'rejected' ? '修改后重新提交'
    : openState.approved.length ? '申请新增字段'
    : '申请工单个人信息读取';
  op('pending-summary').hidden = openState.status !== 'pending';
  op('pending-summary').textContent = openState.status === 'pending' ? '申请字段：' + openFieldNames(openState.requested) : '';
  op('rejected-reason').hidden = openState.status !== 'rejected';
  op('rejected-reason').textContent = openState.status === 'rejected' ? '未通过原因：' + openState.rejected : '';
}

function openPrepareForm() {
  const isResubmission = openState.status === 'rejected';
  op('request-app').value = openState.appName;
  op('request-purpose').value = isResubmission ? openState.purpose : '';
  for (const input of document.querySelectorAll('input[name="pii"]')) {
    input.disabled = openState.approved.includes(input.value);
    input.checked = isResubmission && openState.requested.includes(input.value) && !input.disabled;
    input.removeAttribute('aria-invalid');
  }
  op('request-purpose').removeAttribute('aria-invalid');
  for (const id of ['fields-error', 'purpose-error', 'submit-error']) op(id).hidden = true;
}

function openResponseFor(endpoint, example) {
  if (example === 'current' && !openState.appName) return { error: 'invalid_access_token' };
  if (example === 'current' && !openCanRequest()) {
    return { error: 'work_domain_not_enabled', workDomain: 'DESK' };
  }
  const approved = example === 'current' ? openState.approved : example === 'email' ? ['email'] : [];
  const name = approved.includes('name') ? OPEN_SAMPLE.name : OPEN_SAMPLE.maskedName;
  const customer = {
    customerId: OPEN_SAMPLE.customerId, name,
    email: approved.includes('email') ? OPEN_SAMPLE.email : OPEN_SAMPLE.maskedEmail
  };
  const ticket = { ticketId: OPEN_SAMPLE.ticketId, subject: '退货进度查询', customer };
  const page = { total: 1, totalPages: 1, page: 1, pageSize: 20 };
  const items = [{ messageId: '5400', senderName: name, content: '您好，我想确认退货处理进度。', attachments: [] }];
  const data = endpoint === 'list' ? { ...page, tickets: [ticket] }
    : endpoint === 'messages' ? { ticketId: OPEN_SAMPLE.ticketId, ...page, items }
    : { ...ticket, aiSummary: null, messages: { ...page, items }, notes: [] };
  return { code: '200', msg: 'success', requestId: null, success: true, data };
}
function openRenderDoc() {
  const info = OPEN_ENDPOINTS[openEndpoint];
  op('endpoint-title').textContent = info.name;
  op('endpoint-path').textContent = info.path;
  op('endpoint-description').textContent = info.description;
  op('response-code').textContent = JSON.stringify(openResponseFor(openEndpoint, openExample), null, 2);
  for (const button of document.querySelectorAll('[data-endpoint]')) button.setAttribute('aria-current', String(button.dataset.endpoint === openEndpoint));
  for (const button of document.querySelectorAll('[data-example]')) button.setAttribute('aria-pressed', String(button.dataset.example === openExample));
}

function openShowPage(page, shouldFocus) {
  if (!OPEN_ROUTES.includes(page)) page = 'open-app';
  if (page === 'open-apply' && (!openCanRequest() || openState.status === 'pending'
    || Object.keys(OPEN_LABELS).every((key) => openState.approved.includes(key)))) page = 'open-app';
  const changed = openCurrentPage !== page;
  openCurrentPage = page;
  for (const panel of document.querySelectorAll('[data-page]')) panel.hidden = panel.dataset.page !== page;
  if (page === 'open-app') { openRenderApp(); openSetSecretVisible(false); }
  if (page === 'open-apply' && changed) openPrepareForm();
  if (page === 'open-doc') openRenderDoc();
  if (changed) window.scrollTo(0, 0);
  if (shouldFocus && changed) op(page).querySelector('h1').focus({ preventScroll: true });
  document.title = op(page).querySelector('h1').textContent + ' · Solvea';
  return page;
}
function openNavigate(page) {
  const target = openShowPage(page, true);
  if (location.hash !== '#' + target) history.pushState(null, '', '#' + target);
}

document.addEventListener('click', (event) => {
  const route = event.target.closest('[data-route]');
  if (route) {
    if (route.dataset.route === 'open-doc') { openEndpoint = 'detail'; openExample = 'current'; }
    openNavigate(route.dataset.route);
    return;
  }
  const endpoint = event.target.closest('[data-endpoint]');
  if (endpoint) { openEndpoint = endpoint.dataset.endpoint; openRenderDoc(); return; }
  const example = event.target.closest('[data-example]');
  if (example) { openExample = example.dataset.example; openRenderDoc(); }
});
window.addEventListener('popstate', () => openShowPage(location.hash.slice(1), true));
window.addEventListener('hashchange', () => openShowPage(location.hash.slice(1), true));

op('create-app').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = op('app-name').value.trim();
  if (!name) {
    op('app-name').setCustomValidity('请输入应用名称');
    op('app-name').reportValidity();
    return;
  }
  openState.appName = name;
  openSaveState();
  openRenderApp();
  openToast('应用已创建');
});
op('app-name').addEventListener('input', () => op('app-name').setCustomValidity(''));

op('domain-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!openState.appName) return;
  const chosen = [...event.currentTarget.querySelectorAll('input[name="work-domain"]:checked')]
    .map((node) => node.value).filter((code) => OPEN_DOMAINS.includes(code));
  op('domain-error').hidden = chosen.length > 0;
  if (!chosen.length) {
    event.currentTarget.querySelector('input[name="work-domain"]').focus();
    return;
  }
  openState.domains = chosen;
  openSaveState();
  openRenderApp();
  openToast('工作域权限已保存');
});

op('request-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!openCanRequest() || openState.status === 'pending') return;
  const boxes = [...event.currentTarget.querySelectorAll('input[name="pii"]:not(:disabled)')];
  const requested = boxes.filter((node) => node.checked).map((node) => node.value);
  const purposeField = op('request-purpose');
  const purpose = purposeField.value.trim();
  const fieldsValid = requested.length > 0;
  const purposeValid = purpose.length > 0;
  op('fields-error').hidden = fieldsValid;
  op('purpose-error').hidden = purposeValid;
  op('submit-error').hidden = true;
  for (const input of boxes) input.setAttribute('aria-invalid', String(!fieldsValid));
  purposeField.setAttribute('aria-invalid', String(!purposeValid));
  if (!fieldsValid || !purposeValid) {
    (fieldsValid ? purposeField : boxes[0])?.focus();
    return;
  }
  if (openFailureOnce) {
    openFailureOnce = false;
    op('submit-error').hidden = false;
    return;
  }
  openState.status = 'pending';
  openState.requested = requested;
  openState.purpose = purpose;
  openState.rejected = '';
  openSaveState();
  openNavigate('open-app');
  openToast('申请已提交');
});

op('show-secret').addEventListener('click', () => openSetSecretVisible(op('client-secret').type === 'password'));
op('copy-client').addEventListener('click', async () => {
  const field = op('client-id');
  try {
    await navigator.clipboard.writeText(field.value);
    openToast('已复制');
  } catch {
    field.focus();
    field.select();
  }
});
op('rotate-secret').addEventListener('click', () => {
  const dialog = op('rotate-dialog');
  dialog.returnValue = '';
  dialog.showModal();
});
op('rotate-dialog').addEventListener('close', (event) => {
  const dialog = event.currentTarget;
  if (dialog.returnValue !== 'confirm') return;
  openState.secretVersion += 1;
  openSaveState();
  op('client-secret').value = openSecretValue();
  openSetSecretVisible(false);
  openToast('客户端密钥已重新生成');
});
op('export-doc').addEventListener('click', () => {
  const notes = ['# 应用接入文档', '', '应用：' + openState.appName, '工作域：' + openState.domains.join('、'), '获批工单个人信息：' + (openCanRequest() ? openFieldNames(openState.approved) : '无')];
  if (openCanRequest()) for (const [key, api] of Object.entries(OPEN_ENDPOINTS)) {
    notes.push('', '## ' + api.name, '', 'POST ' + api.path, '', '当前权限下的响应示例', '', String.fromCharCode(96,96,96) + 'json', JSON.stringify(openResponseFor(key, 'current'), null, 2), String.fromCharCode(96,96,96));
  }
  const download = document.createElement('a');
  download.href = URL.createObjectURL(new Blob([notes.join('\n')], { type: 'text/markdown;charset=utf-8' }));
  download.download = 'open-platform-example.md';
  download.click();
  setTimeout(() => URL.revokeObjectURL(download.href), 1500);
});

const openInitialPage = openShowPage(location.hash.slice(1), false);
if (openInitialPage === 'open-app' && openQuery.get('focus') === 'pii') {
  requestAnimationFrame(() => {
    if (openCurrentPage !== 'open-app') return;
    const section = op('work-domain-permissions');
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 12, behavior: 'instant' });
  });
}
