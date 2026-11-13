(() => {
  const notes = [
    ['01','本次需求总说明','.preview strong, main.wrap > header h1','',
      '01.1 功能交互\n01.1.1 详情按号选源，或表格勾选源单再指定目标；确认后逐张返回结果（02–06）。\n01.1.2 在目标单查看来源、附件并继续回复；原线程须显式选择（07–12）。\n\n01.2 影响范围\n01.2.1 必做：工单列表、详情、操作日志、回复和进线，按合单关系和原权限运行。\n01.2.2 必做：积压、SLA、回复、邀评、明细与导出口径对账（13）。\n\n01.3 本期边界\n01.3.1 四态沿用现有定义；合单不改状态、不合并客户资料、不批量删除，不承诺前台撤销。\n01.3.2 邮件引用自动合单独立验收，共同评审旧线程承接与去重（14）。'],
    ['02','详情入口','[data-action="detail-merge"]','detail','功能说明：在目标工单右上角「⋯」选择「合并工单」，当前单固定为目标。\n功能实现：沿用详情头部与既有菜单；进入按工单号选源页面。已并入其他单的工单不能发起；AI处理中先走现有转人工。'],
    ['03','表格批量入口','[data-action="bulk"]','batch','功能说明：切到表格布局，勾选源单后从底部工具栏发起，下一步只选一个目标。\n功能实现：已并入、AI处理中或已有源单并入的工单不可作为源；卡片右上角搜索、排序和展示设置保留。'],
    ['04','查找与候选','#find-form input','detail','按工单号查找并去重。详情可勾选多个源单，表格批量只可单选目标。展示编号、主题、状态、渠道、邮箱、客户及有权限的订单等摘要；无权候选不泄露信息。同邮箱不代表同一问题。'],
    ['05','预览与确认','[data-action="commit"]','confirm','功能说明：明确一张目标与每张源单，取消或返回不写入。\n功能实现：服务端逐单重查租户、源/目标可见、跨邮箱权限、状态及重复关系；拒绝自合、环和不支持的链式合并。成功写关系及双边日志，不发客户消息、不触发源单邀评。批量上限与权限点待技术核对。'],
    ['06','结果、核对与重试','#merge-result h1','result','逐张显示成功、失败原因或待核对。超时先按同一操作核对真实结果，只重试已确定失败项；已成功的关系、消息和日志不重复写。仅失败的源单继续留在原处理流程。'],
    ['07','目标单与历史消息','.conversation .relation','merged','目标单保留处理人和状态。按原时间归集消息与附件，保留原工单号、渠道、邮箱、To/Cc、原时间；读取和下载仍按原权限。任一关联渠道可查，API 返回有权读取的关联单号与 ID。'],
    ['08','已并入的源单','.conversation .relation','source','源单保留原状态、消息和编号，成功时退出默认待办和分派。仍可按号查看；有目标单权限才可跳转。源单无回复入口，不在源单重复处理和邀评。'],
    ['09','双边操作日志','.right details:last-child summary','merged','源单记录「并入目标」，目标单记录「合入源单」；保留操作人、时间、方向和单号。权限内展示。日志供追溯，队列与路由按有效合单关系判断。'],
    ['10','默认回复走目标线程','.compose .envelope strong','merged','普通回复沿目标单的原渠道、售后邮箱和收件规则发送。历史 To/Cc 不拼接。沿用发送和发送并解决的既有状态变更与失败处理，源单状态不动。'],
    ['11','指定回复源线程','[data-action="reply-source"]','merged','点源消息的「回复原线程」后明确展示原线程号、发件邮箱和收件人，并可切回目标线程。发送前重新验原渠道、原邮箱的发信权限；无权、失效或不支持时阻止发送，不换邮箱、不带入其他线程收件人。'],
    ['12','客户回复旧源线程','#reply-routing','reply-routing','精确命中可验证的邮件引用或渠道线程 ID，且目标有权承接时，归入目标并标明原来源；目标走既有进线状态规则。不能精确匹配或无权承接时走有权限的正常进线流程，不恢复源单，也不靠邮箱、订单或主题强行改投。'],
    ['13','报表与 SLA','#report-impact h2','report-impact','建单、解决、已发生回复和满意度历史按真实事件保留；合单本身不计解决、不新增邀评。成功时源单退出当前积压及处理中区间，活跃 SLA 停止计时和告警，目标不重置；首次回复与渠道归属保留真实发生数据，不重复计数。示例：历史建单 3→3、已解决 1→1、当前积压 2→1。汇总、明细及导出对账。'],
    ['14','与邮件引用自动合单联审','#yunxiao h2','yunxiao','手动合单与邮件引用自动合单保留独立入口及验收。联审目标单识别、已并入源单排除、原线程收发邮箱校验与归属、报表去重；引用地址失配开新单，不能因手动合单而跳过邮箱隔离规则。']
  ];
  const isPlan = !!document.querySelector('main.wrap');
  const current = new URLSearchParams(location.search).get('scene');
  const bar = document.createElement('button');
  bar.type = 'button'; bar.className = 'review-bar'; bar.textContent = '开发批注 · 14';
  const layer = document.createElement('div'); layer.className = 'review-layer';
  const dialog = document.createElement('dialog'); dialog.className = 'review-dialog';
  dialog.setAttribute('aria-label', '开发批注');
  document.body.append(bar,layer,dialog);
  const planAnchors = ['reply-routing','report-impact','yunxiao'];
  const defaultScene = {'01':'detail','04':'select','08':'source','09':'merged'};
  const href = (id, scene) => {
    if(planAnchors.includes(scene)) return (isPlan?'':'solution.html?note='+id)+'#'+scene;
    return 'prototype.html?scene='+(defaultScene[id]||scene||'detail')+'&note='+id;
  };
  function show(id) {
    const h = document.createElement('header'), close=document.createElement('button');
    h.textContent = id?'开发批注 '+id:'开发批注目录';
    close.type='button';close.textContent='关闭';close.onclick=()=>dialog.close();h.append(close);
    const body=document.createElement('div'); body.className='review-body';
    if (id) {
      const [,name,,scene,copy]=notes.find(n=>n[0]===id);
      const title=document.createElement('h2');title.textContent=name;
      const p=document.createElement('p');p.textContent=copy;
      const directory=document.createElement('button');directory.type='button';directory.textContent='返回批注目录';directory.onclick=()=>show('');
      body.append(title,p,directory);
      const anchor=layer.querySelector('[data-note="'+id+'"]');
      if (!anchor && id!=='01') {
        const jump=document.createElement('a');jump.textContent='查看对应页面';jump.href=href(id,scene);body.append(jump);
      }
    } else {
      notes.forEach(([key,name])=>{
        const b=document.createElement('button');b.type='button';b.textContent=key+' '+name;b.onclick=()=>show(key);body.append(b);
      });
    }
    dialog.replaceChildren(h,body);
    if(!dialog.open)dialog.showModal();
  }
  function target([id,,sel]) {
    if(id==='08' && !document.querySelector('.conversation .relation')?.textContent.startsWith('已并入')) return;
    if(id==='07' && !document.querySelector('.conversation .relation')?.textContent.startsWith('已合入')) return;
    if(id==='04' && current==='detail' && !document.querySelector(sel)) return;
    return [...document.querySelectorAll(sel)].find(e=>e.getClientRects().length);
  }
  let raf;
  function layout() {
    raf=0;
    const entries=notes.map(n=>[n,target(n)]).filter(([,el])=>el);
    const keep=new Set(), occupied=[];
    for(const [[id,name],el] of entries){
      const r=el.getBoundingClientRect();
      if(r.bottom<0||r.top>=innerHeight||r.right<0||r.left>=innerWidth)continue;
      let x=Math.min(innerWidth-28,Math.max(2,r.right+2));
      let y=Math.min(innerHeight-27,Math.max(2,r.top-9));
      if(el.matches('h1,h2,.relation'))x=Math.min(innerWidth-28,r.left+Math.min(r.width,340));
      while(occupied.some(([a,b])=>Math.abs(a-x)<27&&Math.abs(b-y)<23)&&y<innerHeight-47)y+=24;
      occupied.push([x,y]);keep.add(id);
      let badge=layer.querySelector('[data-note="'+id+'"]');
      if(!badge){badge=document.createElement('button');badge.type='button';badge.dataset.note=id;badge.textContent=id;badge.setAttribute('aria-label','批注 '+id+' '+name);badge.onclick=()=>show(id);layer.append(badge)}
      badge.style.transform='translate('+x+'px,'+y+'px)';
    }
    [...layer.children].filter(b=>!keep.has(b.dataset.note)).forEach(b=>b.remove());
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(layout)}
  bar.onclick=()=>show('');
  addEventListener('resize',schedule);addEventListener('scroll',schedule,true);
  const workspace=document.querySelector('.workspace');
  if(workspace)new MutationObserver(schedule).observe(workspace,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
  layout();
  const note=new URLSearchParams(location.search).get('note');
  if(note && notes.some(n=>n[0]===note)) show(note);
})();
