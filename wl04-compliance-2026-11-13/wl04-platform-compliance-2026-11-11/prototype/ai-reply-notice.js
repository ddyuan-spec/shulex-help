'use strict';

const NAV_OF = { settingsAutomation: 'viewSettingsAutomation', aiReplyNotice: 'viewAiReplyNotice' };
const wlRules = [
  ['temu测试账号','平均分配给TEMU测试账号',false],
  ['custom_chat','平均分配给gofo test custom chat',true],
  ['1','平均分配给Default Team',true],
  ['email rule','平均分配给gofo test livechat',true]
];
const wlFind = id => document.getElementById(id);
const wlPrefKey = 'wl04.demo.ai-email-notice';
const wlIcon = name => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
let wlSaved = true;
try { wlSaved = localStorage.getItem(wlPrefKey) !== 'off'; } catch {}
let wlDraft = wlSaved;
let wlPage = '';
let wlToastTimer;

function go(requested, updateHash = true) {
  const key = Object.hasOwn(NAV_OF,requested) ? requested : 'settingsAutomation';
  if (wlPage !== key) {
    wlDraft = wlSaved;
    wlFind('mailPreview').hidden = true;
    wlFind('previewButton').setAttribute('aria-expanded','false');
    wlFind('previewButton').textContent = '预览邮件';
    wlFind('previewScenario').value = 'automatic';
  }
  wlPage = key;
  for (const [name,id] of Object.entries(NAV_OF)) {
    wlFind(id).hidden = name !== key;
  }
  for (const [id,active] of [['menuAutomation',key==='settingsAutomation'],['menuNotice',key==='aiReplyNotice']]) {
    wlFind(id).classList.toggle('active',active);
    if (active) wlFind(id).setAttribute('aria-current','page');
    else wlFind(id).removeAttribute('aria-current');
  }
  if (updateHash && location.hash !== '#' + key) location.hash = key;
  wlRenderNotice();
}

function wlRenderNotice() {
  wlFind('aiNoticeToggle').setAttribute('aria-checked',String(wlDraft));
  wlFind('saveNotice').disabled = wlDraft === wlSaved;
  wlFind('noticeDescription').textContent = wlDraft
    ? '在每封 AI 自动回复的邮件末尾加上告知。'
    : '依法需要告知的邮件仍会显示告知。';
  const scenario = wlFind('previewScenario').value;
  wlFind('mailIntro').hidden = scenario !== 'required';
  wlFind('mailDisclosure').hidden = scenario === 'human' || (scenario === 'automatic' && !wlDraft);
}

function wlToggleNotice() {
  wlDraft = !wlDraft;
  wlRenderNotice();
}

function wlSaveNotice() {
  if (wlDraft === wlSaved) return;
  const toast = wlFind('saveFeedback');
  try {
    localStorage.setItem(wlPrefKey,wlDraft ? 'on' : 'off');
    wlSaved = wlDraft;
    toast.textContent = '已保存';
  } catch {
    toast.textContent = '保存失败，请重试';
  }
  wlRenderNotice();
  toast.hidden = false;
  clearTimeout(wlToastTimer);
  wlToastTimer = setTimeout(() => { toast.hidden = true; },2300);
}

function wlTogglePreview() {
  const panel = wlFind('mailPreview');
  panel.hidden = !panel.hidden;
  wlFind('previewButton').setAttribute('aria-expanded',String(!panel.hidden));
  wlFind('previewButton').textContent = panel.hidden ? '预览邮件' : '收起预览';
  wlRenderNotice();
}

function wlRenderRules() {
  const term = wlFind('ruleSearch').value.trim().toLowerCase();
  const rows = wlRules.filter(rule => rule.join(' ').toLowerCase().includes(term));
  wlFind('ruleRows').innerHTML = rows.map(([name,action,on]) =>
    '<tr><td class="rule-name">' + wlIcon('grip') + name + '</td><td>' + action +
    '</td><td><span class="switch ' + (on?'checked':'') + '" aria-label="' + (on?'开启':'关闭') +
    '" role="img"></span></td><td class="row-actions">' + wlIcon('edit') + wlIcon('delete') + '</td></tr>').join('');
  wlFind('emptyRules').hidden = rows.length > 0;
}

wlFind('ruleSearch').addEventListener('input',wlRenderRules);
wlFind('aiNoticeToggle').addEventListener('click',wlToggleNotice);
wlFind('saveNotice').addEventListener('click',wlSaveNotice);
wlFind('previewButton').addEventListener('click',wlTogglePreview);
wlFind('previewScenario').addEventListener('change',wlRenderNotice);
window.addEventListener('hashchange', () => go(location.hash.slice(1),false));
wlRenderRules();
go(location.hash.slice(1),false);
