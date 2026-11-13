(() => {
  const entries = {
    ticket: {
      url: "../wl04-ticket-pii/prototype/ticket/index.html#ticket-detail",
      title: "Solvea · 工单列表与详情"
    },
    api: {
      url: "../wl04-ticket-pii/prototype/open-platform/index.html?focus=pii#open-app",
      title: "Solvea · 开放平台应用、申请和接口示例"
    },
    ai: {
      url: "prototype/ai-reply-notice.html#aiReplyNotice",
      title: "Solvea · AI 回复告知设置与邮件预览"
    }
  };
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const prototype = document.getElementById("prototype");
  const preview = document.getElementById("preview");
  const frame = document.getElementById("preview-frame");
  const frameShell = frame.closest(".frame");
  const label = document.getElementById("preview-label");
  const link = document.getElementById("preview-link");
  const scenarios = document.getElementById("api-scenarios");
  let scene = "";

  // The captured Solvea workbench retains its desktop panel widths.
  new ResizeObserver(([entry]) => {
    const width = entry.contentRect.width;
    if (width <= 0) return;
    const scaledWidth = Math.min(1536, Math.max(1100, width));
    const scale = scaledWidth / 1536;
    frameShell.style.setProperty("--ticket-preview-width", `${scaledWidth}px`);
    frameShell.style.setProperty("--ticket-preview-height", `${900 * scale}px`);
    frameShell.style.setProperty("--ticket-preview-scale", scale);
  }).observe(frameShell);

  function load(key) {
    const { url, title } = entries[key];
    const target = new URL(url, document.baseURI);
    if (key === "api" && scene) target.searchParams.set("scene", scene);
    const src = target.href;
    label.textContent = title;
    frame.title = title;
    frame.src = src;
    link.href = src;
    scenarios.hidden = key !== "api";
    for (const button of scenarios.querySelectorAll("[data-scene]")) {
      button.setAttribute("aria-pressed", String(button.dataset.scene === scene));
    }
  }

  scenarios.addEventListener("click", event => {
    const button = event.target.closest("[data-scene]");
    if (!button || button.dataset.scene === scene) return;
    scene = button.dataset.scene;
    load("api");
  });

  function select(tab, navigate = false) {
    const key = tab.id.slice(4);
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
    }
    if (preview.dataset.active !== key) {
      document.querySelector(`[data-preview="${key}"]`).append(preview);
      preview.dataset.active = key;
      load(key);
      preview.hidden = false;
    }
    if (navigate) {
      prototype.scrollIntoView({ block: "start" });
      document.getElementById(tab.getAttribute("aria-controls")).focus({ preventScroll: true });
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab, true));
    tab.addEventListener("keydown", event => {
      const offset = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[event.key];
      if (!offset && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + offset + tabs.length) % tabs.length;
      tabs[next].focus();
      select(tabs[next]);
    });
  });

  select(tabs[0]);
})();
