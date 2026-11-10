/* Solution explanation only. Does not read or change prototype storage. */
(() => {
  const root = document.querySelector('.explainer');
  if (!root) return;
  const notes = {
    all: '看客服触点满意率，只加 Q2 客服条件；Q1 高分由指标分子判断，分母保留这 40 份有效评分。',
    0: '第 1 步：不加题目条件，整体 100 份有效评分。70 推荐、20 被动、10 贬损，NPS = +60；7–8 分保留在分母。',
    1: '第 2 步：仅加 Q2 客服条件，得到 40 份有效评分。28 份为 9–10 分，客服触点高分率 = 28 / 40 = 70%。',
    2: '第 3 步：若再筛 Q1 为 9–10 分，分母缩成 28 份，当前高分率变成 100%。这只代表客服高分样本，不能当作全体客服触点满意率。'
  };
  root.querySelectorAll('button[data-step]').forEach(button => {
    button.addEventListener('click', () => {
      root.dataset.step = button.dataset.step;
      root.querySelectorAll('button[data-step]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.getElementById('step-caption').textContent = notes[button.dataset.step];
    });
  });
})();
