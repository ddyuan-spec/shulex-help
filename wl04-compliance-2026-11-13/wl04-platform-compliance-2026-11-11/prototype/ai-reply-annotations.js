'use strict';

const noticeAnnotations = [...document.querySelectorAll('.annotation-note')];

function positionNoticeAnnotation(note) {
  const point = document.getElementById('annotationPoint' + note.id.slice(-2));
  const pointBox = point.getBoundingClientRect();
  const noteBox = note.getBoundingClientRect();
  const menu = point.closest('.annotation-menu');
  const right = menu ? menu.getBoundingClientRect().right : pointBox.right;
  const gap = 10;
  const margin = 12;
  const fitsRight = right + gap + noteBox.width <= window.innerWidth - margin;
  const x = fitsRight ? right + gap : Math.max(margin,window.innerWidth - noteBox.width - margin);
  const preferredY = fitsRight ? pointBox.top : pointBox.bottom + gap;
  const y = Math.min(Math.max(margin,preferredY),window.innerHeight - noteBox.height - margin);
  note.style.setProperty('--note-x', x + 'px');
  note.style.setProperty('--note-y', y + 'px');
}

for (const note of noticeAnnotations) {
  note.addEventListener('toggle', event => {
    if (event.newState === 'open') positionNoticeAnnotation(note);
  });
}

function repositionOpenNoticeAnnotation() {
  for (const note of noticeAnnotations) {
    if (!note.matches(':popover-open')) continue;
    const point = document.getElementById('annotationPoint' + note.id.slice(-2));
    if (!point.getClientRects().length) note.hidePopover();
    else positionNoticeAnnotation(note);
  }
}

window.addEventListener('resize',repositionOpenNoticeAnnotation);
document.addEventListener('scroll',repositionOpenNoticeAnnotation,true);
window.addEventListener('hashchange',repositionOpenNoticeAnnotation);
