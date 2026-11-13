(() => {
  const h = (s) => String(s).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button = (name, action, primary = false) => '<button class="replica-button'+(primary?' primary':'')+'" type="button" data-act="'+action+'">'+name+'</button>';
  const email = [
    {mail:'support@example.com',brand:'Demo Store',status:'Enable',time:'--'},
    {mail:'orders@example.net',brand:'Demo Outlet',status:'Enable',time:'2026/10/28 10:00'}
  ];
  const teamKey='solvea-settings-review-v4-teams';
  let teams=[
    {id:1,name:'Support',members:['Alex Chen'],schedule:'Open 24/7'},
    {id:2,name:'Orders',members:['Jamie Lin','Sam Wu'],schedule:'工作日 09:00–18:00'},
    {id:3,name:'Returns',members:['Sam Wu'],schedule:'Open 24/7'}
  ];
  try { teams=JSON.parse(sessionStorage.getItem(teamKey))||teams; } catch {}
  const stash=()=>{try{sessionStorage.setItem(teamKey,JSON.stringify(teams));}catch{}};
  window.solveaReplica ||= {};
  window.solveaReplica['common/channels'] = (root) => {
    const legacy = location.hash.startsWith('#legacy/');
    const list = () => {
      root.innerHTML='<div class="replica-head"><h1><button type="button" class="replica-button back-button" data-act="back" aria-label="Back">←</button> Email</h1>'+button('＋ Email','new',true)+'</div>'+
        '<div class="replica-body"><div class="replica-toolbar"><input class="replica-field" type="search" placeholder="Search" aria-label="Search"></div><div class="replica-table-wrap"><table class="replica-table"><thead><tr><th>Email</th><th>Brand</th><th>Status</th><th>Authorization time</th><th></th></tr></thead><tbody></tbody></table></div></div>';
      const search=root.querySelector('input[type=search]');
      const tbody=root.querySelector('tbody');
      const rows=()=>{
        const q=search.value.toLowerCase().trim();
        tbody.innerHTML=email.map((item,i)=>item.mail.toLowerCase().includes(q)?'<tr><td>'+(item.time==='--'?'<span style="color:#d17809" aria-hidden="true">⚠ </span>':'')+item.mail+'</td><td>'+item.brand+'</td><td>'+item.status+'</td><td class="time">'+item.time+'</td><td>'+button('Configure →','configure-'+i)+'</td></tr>':'').join('')||'<tr><td colspan="5" class="empty">No data</td></tr>';
      };
      search.addEventListener('input',rows);
      root.querySelector('[data-act="back"]').onclick=()=>{if(legacy) integrations(); else location.hash='#home';};
      root.querySelector('[data-act="new"]').onclick=()=>configuration();
      tbody.onclick=(event)=>{const a=event.target.closest('[data-act]');if(a)configuration(email[Number(a.dataset.act.split('-')[1])]);};
      rows();
    };
    const integrations=()=>{
      root.innerHTML='<div class="replica-head"><h1>Integrations</h1></div><div class="replica-body"><div class="replica-tabs"><button type="button" class="replica-tab" aria-selected="true">All</button></div><div class="directory-list">'+button('Email','email')+'</div></div>';
      root.querySelector('[data-act="email"]').onclick=list;
    };
    const configuration=(item)=>{
      root.innerHTML='<div class="replica-head"><h1><button type="button" class="replica-button back-button" data-act="back" aria-label="Back">←</button> Email Connection</h1></div>'+
        '<div class="replica-body mail-config"><div class="mail-summary"><strong>Email</strong><div>'+(item ? item.mail+' · '+item.brand : 'Email Connection')+'</div></div>'+
        '<h2>Authorization Steps <span class="replica-muted"> · '+(item?.time && item.time!=='--'?'1':'0')+' / 1 steps &nbsp; Necessary</span></h2>'+
        '<div class="mail-panel"><div><b>Email Connection</b><p>After authorization, emails will be synchronized in real-time.</p></div><button class="replica-button primary" type="button" disabled>Connect</button></div>'+
        '<h2>Function Configuration</h2><div class="mail-panel"><div><b>Configure Sync Folder</b><p>Select the folders for email synchronization.</p></div><button class="replica-button" type="button" disabled>Configure</button></div>'+
        '<div class="mail-panel"><div><b>Configure Email Signature</b><p>Set up the email signature for this email address.</p></div><button class="replica-button" type="button" disabled>Configure</button></div></div>';
      root.querySelector('[data-act="back"]').onclick=list;
    };
    list();
  };
  window.solveaReplica['common/teams']=(root)=>{
    const people=['Alex Chen','Jamie Lin','Sam Wu'];
    const schedule=['Open 24/7','工作日 09:00–18:00'];
    const list=()=>{
      root.innerHTML='<div class="replica-head"><h1>Teams</h1>'+button('＋ New team','new',true)+'</div><div class="replica-body"><div class="replica-table-wrap"><table class="replica-table"><thead><tr><th>Team name</th><th>Members</th><th>Member count</th><th>Scheduling</th><th></th></tr></thead><tbody>'+
        teams.map((t)=>'<tr><td>'+h(t.name)+'</td><td>'+h(t.members.join(', '))+'</td><td>'+t.members.length+'</td><td>'+h(t.schedule)+'</td><td><details class="team-actions"><summary aria-label="More actions for '+h(t.name)+'">'+window.replicaIcon('more')+'</summary><div>'+button('Edit','edit-'+t.id)+button('Delete','delete-'+t.id)+'</div></details></td></tr>').join('')+
        '</tbody></table></div></div>';
      root.querySelector('[data-act="new"]').onclick=()=>edit();
      root.querySelectorAll('tbody [data-act]').forEach((el)=>{el.onclick=()=>{const [mode,id]=el.dataset.act.split('-');const team=teams.find((item)=>item.id===Number(id));if(mode==='edit')edit(team);else confirmDelete(team);};});
    };
    const edit=(team)=>{
      root.innerHTML='<div class="replica-head"><h1><button type="button" class="replica-button back-button" data-act="back" aria-label="Back">←</button> '+(team?'Edit team':'New team')+'</h1></div><div class="replica-body"><form class="replica-form">'+
        '<label class="field-label">Team name<input name="name" class="replica-field" required value="'+h(team?.name||'')+'"></label>'+
        '<fieldset><legend>Members</legend><div class="options">'+people.map((name)=>'<label><input type="checkbox" name="members" value="'+h(name)+'"'+(team?.members.includes(name)?' checked':'')+'> '+h(name)+'</label>').join('')+'</div></fieldset>'+
        '<label class="field-label">Scheduling<select class="replica-field" name="schedule">'+schedule.map((s)=>'<option'+(s===team?.schedule?' selected':'')+'>'+h(s)+'</option>').join('')+'</select></label>'+
        '<div class="replica-form-actions">'+button('Cancel','cancel')+'<button type="submit" class="replica-button primary">Save</button></div></form></div>';
      root.querySelectorAll('[data-act]').forEach((el)=>{el.onclick=list;});
      const form=root.querySelector('form');
      form.onsubmit=(event)=>{
        event.preventDefault();
        const values=new FormData(form);
        const name=values.get('name').trim();
        if(!name){form.elements.name.value='';form.elements.name.reportValidity();return;}
        const next={name,members:values.getAll('members'),schedule:values.get('schedule')};
        if(team)Object.assign(team,next);else teams.push({...next,id:Date.now()});
        stash();list();
      };
    };
    const confirmDelete=(team)=>{
      const modal=document.createElement('dialog');
      modal.className='replica-confirm';
      modal.innerHTML='<h2>Delete '+h(team.name)+'?</h2><p>This action cannot be undone.</p><div class="replica-form-actions">'+button('Cancel','cancel')+button('Delete','confirm',true)+'</div>';
      modal.querySelector('[data-act="cancel"]').onclick=()=>modal.close();
      modal.querySelector('[data-act="confirm"]').onclick=()=>{teams=teams.filter(({id})=>id!==team.id);stash();modal.close();list();};
      modal.addEventListener('close',()=>modal.remove(),{once:true});
      root.append(modal);modal.showModal();
    };
    list();
  };
})();
