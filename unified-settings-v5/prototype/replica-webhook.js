(() => {
  // UI baseline: 2026-11-06 archived TriggerWebhook/index.tsx and index.module.less.
  // This replica never calls or links to an endpoint. A secret is represented only by a flag.
  const storageKey = 'solvea-settings-review-webhooks-v1';
  const samples = [
    { id: 1, name: '订单系统', url: 'https://orders.example.com/hooks/ticket', method: 'POST', secretConfigured: true, status: 'ENABLED' },
    { id: 2, name: '工单状态通知', url: 'https://notify.example.net/hooks/ticket', method: 'POST', secretConfigured: false, status: 'DISABLED' }
  ];
  let records = samples;
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (Array.isArray(saved)) records = saved;
  } catch {}
  const persist = () => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(records)); } catch {}
  };
  window.replicaWebhookOptions = () => records.map(({id,name})=>({id:String(id),name}));
  const h = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const button = (text, action, extra = '') => '<button type="button" class="replica-button ' + extra + '" data-action="' + action + '">' + text + '</button>';

  window.solveaReplica ||= {};
  window.solveaReplica['common/webhook'] = (root) => {
    const render = () => {
      root.innerHTML = '<section style="min-height:100%;background:#f7f8fa;border-radius:inherit">' +
        '<div class="replica-head" style="align-items:flex-start;padding-top:22px;border-bottom:0"><div>' +
        '<h1 style="font-size:24px">Webhook</h1><p class="replica-muted" style="margin:5px 0 0">配置 Trigger 可调用的外部 HTTP 接收地址。</p></div>' +
        button('新增 Webhook', 'new', 'primary') + '</div><div class="replica-body">' +
        '<div class="replica-table-wrap" style="background:#fff;border:1px solid #eaecf0;border-radius:8px;padding:9px 14px">' +
        '<table class="replica-table"><thead><tr><th>名称</th><th>地址</th><th>方式</th><th>签名</th><th>状态</th><th>操作</th></tr></thead><tbody>' +
        (records.map((row) =>
          '<tr><td>' + h(row.name) + '</td><td style="max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + h(row.url) + '">' + h(row.url) +
          '</td><td>' + h(row.method) + '</td><td>' + (row.secretConfigured ? 'HMAC' : '未配置') +
          '</td><td>' + (row.status === 'ENABLED' ? '启用' : '停用') + '</td><td><div class="row-actions">' +
          '<button type="button" class="icon-action" data-action="edit" data-id="' + h(row.id) + '">编辑</button>' +
          '<button type="button" class="icon-action delete" data-action="delete" data-id="' + h(row.id) + '">删除</button></div></td></tr>'
        ).join('') || '<tr><td colspan="6" class="empty">暂无 Webhook，请先新增一个接收地址</td></tr>') +
        '</tbody></table></div></div></section>';
      root.querySelector('[data-action="new"]').addEventListener('click', () => editWebhook());
      root.querySelector('tbody').addEventListener('click', (event) => {
        const target = event.target.closest('button[data-action]');
        if (!target) return;
        const selected = records.find((item) => String(item.id) === target.dataset.id);
        if (!selected) return;
        if (target.dataset.action === 'edit') editWebhook(selected);
        if (target.dataset.action === 'delete') confirmAction(selected);
      });
    };

    function attachDialog(dialog) {
      dialog.addEventListener('close', () => dialog.remove(), { once: true });
      root.append(dialog);
      dialog.showModal();
    }

    function editWebhook(endpoint) {
      const dialog = document.createElement('dialog');
      dialog.className = 'drawer';
      dialog.style.width = 'min(520px,100%)';
      dialog.setAttribute('aria-labelledby', 'webhook-drawer-title');
      dialog.innerHTML = '<div class="replica-head"><h1 id="webhook-drawer-title">' + (endpoint ? '编辑 Webhook' : '新增 Webhook') + '</h1>' +
        '<button type="button" class="drawer-close" data-action="close" aria-label="关闭">×</button></div>' +
        '<div class="replica-body"><form class="replica-form">' +
        '<label class="field-label">名称<input class="replica-field" name="name" required placeholder="例如：订单系统" value="' + h(endpoint?.name) + '"></label>' +
        '<label class="field-label">Endpoint URL<input type="url" class="replica-field" name="url" required placeholder="https://example.com/hooks/ticket" value="' + h(endpoint?.url) + '"></label>' +
        '<label class="field-label">签名密钥<input type="password" class="replica-field" name="secret" autocomplete="new-password" placeholder="输入密钥"><span class="replica-muted">' +
        (endpoint?.secretConfigured ? '已配置密钥；留空表示保持不变。' : '可选，使用 HMAC-SHA256 签名。') + '</span></label>' +
        '<div class="field-label"><span>状态</span><div class="options" style="margin-top:6px;align-items:center">' +
        '<button class="switch" type="button" role="switch" aria-label="状态" aria-checked="' + (endpoint?.status !== 'DISABLED') + '"></button>' +
        '<span data-status>' + (endpoint?.status !== 'DISABLED' ? '启用' : '停用') + '</span></div></div>' +
        '<div class="replica-form-actions">' + button('取消', 'close') + '<button class="replica-button primary" type="submit">保存</button></div></form></div>';
      const form = dialog.querySelector('form');
      const name = form.elements.namedItem('name');
      const url = form.elements.namedItem('url');
      const status = dialog.querySelector('[role=switch]');
      const statusText = dialog.querySelector('[data-status]');
      const showStatus = (enabled) => {
        status.setAttribute('aria-checked', String(enabled));
        statusText.textContent = enabled ? '启用' : '停用';
      };
      status.addEventListener('click', () => showStatus(status.getAttribute('aria-checked') !== 'true'));
      [name, url].forEach((input) => input.addEventListener('input', () => input.setCustomValidity('')));
      dialog.querySelectorAll('[data-action="close"]').forEach((el) => el.addEventListener('click', () => dialog.close()));
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const nameValue = name.value.trim();
        const urlValue = url.value.trim();
        if (!nameValue) { name.setCustomValidity('请输入名称'); name.reportValidity(); return; }
        let protocol;
        try { protocol = new URL(urlValue).protocol; } catch {}
        if (protocol !== 'http:' && protocol !== 'https:') {
          url.setCustomValidity('请输入有效的 HTTP(S) 地址'); url.reportValidity(); return;
        }
        const secret = form.elements.namedItem('secret');
        const row = {
          id: endpoint?.id ?? Date.now(),
          name: nameValue,
          url: urlValue,
          method: endpoint?.method || 'POST',
          secretConfigured: Boolean(endpoint?.secretConfigured || secret.value),
          status: status.getAttribute('aria-checked') === 'true' ? 'ENABLED' : 'DISABLED'
        };
        secret.value = '';
        records = endpoint ? records.map((item) => item.id === endpoint.id ? row : item) : [...records, row];
        persist();
        dialog.close();
        render();
      });
      attachDialog(dialog);
    }

    function confirmAction(endpoint) {
      const dialog = document.createElement('dialog');
      dialog.className = 'replica-confirm';
      dialog.setAttribute('aria-labelledby', 'webhook-confirm-title');
      dialog.innerHTML = '<h2 id="webhook-confirm-title">删除「' + h(endpoint.name) + '」？</h2><p>删除后无法恢复。</p>' +
        '<div class="replica-form-actions">' + button('取消', 'cancel') + button('删除', 'confirm', 'primary') + '</div>';
      dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => dialog.close());
      dialog.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        records = records.filter(({ id }) => id !== endpoint.id);
        persist();
        dialog.close();
        render();
      });
      attachDialog(dialog);
    }

    render();
  };
})();
