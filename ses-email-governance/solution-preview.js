'use strict';
const frames=[...document.querySelectorAll('.live-prototype iframe[data-src]')];
let activeFrame=null;
function showPreview(frame, route){
  if(route)frame.dataset.src=route;
  if(activeFrame===frame){
    if(route){
      const requested=new URL(route,document.baseURI).href;
      try{
        const shown=frame.contentWindow.location.href;
        if(shown===requested)return;
        if(shown!=='about:blank'&&frame.getAttribute('src')===route){
          // The iframe can navigate on its own; its src attribute then holds the old target.
          frame.contentWindow.location.assign(requested);
          return;
        }
      }catch{}
      frame.src=route;
    }
    return;
  }
  if(activeFrame){
    try{
      const page=activeFrame.contentWindow.location;
      if(page.pathname.endsWith('/prototype/index.html'))activeFrame.dataset.src=page.href;
    }catch{}
    activeFrame.removeAttribute('src');
  }
  activeFrame=frame;
  frame.src=frame.dataset.src;
}
const observer=new IntersectionObserver(entries=>{
  const visible=entries.filter(entry=>entry.isIntersecting&&entry.intersectionRatio>0);
  if(!visible.length)return;
  const rect=activeFrame?.getBoundingClientRect();
  if(rect && rect.top<innerHeight && rect.bottom>0)return;
  visible.sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
  showPreview(visible[0].target);
},{threshold:0.01});
frames.forEach(frame=>observer.observe(frame));
document.addEventListener('click',event=>{
  const preview=event.target.closest('[data-complaint-preview]');
  if(preview){
    showPreview(document.querySelector('#frame-complaint'),preview.dataset.complaintPreview);
    document.querySelector('#complaint-preview-label').textContent='交互原型 · '+preview.textContent.replace(' ↗','');
    document.querySelectorAll('[data-complaint-preview]').forEach(button=>button.setAttribute('aria-pressed',String(button===preview)));
    const anchor=preview.closest('.complaint-views')?document.querySelector('#complaint-views'):document.querySelector('#complaint-preview');
    anchor.scrollIntoView({block:'start'});
    return;
  }
  const button=event.target.closest('[data-target]');
  if(!button)return;
  const section=button.closest('.role-section');
  showPreview(section.querySelector('iframe'),button.dataset.target);
  section.querySelectorAll('[data-target]').forEach(item=>item.classList.toggle('selected',item===button));
  section.querySelector('.frame-location').textContent=button.textContent.trim();
});
