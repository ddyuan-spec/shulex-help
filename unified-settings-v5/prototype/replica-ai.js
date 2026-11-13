(() => {
  const custom = 'Custom quality inspection rules';
  const types = ['Platform Rules Inspection','Service Inspection',custom,'Risk warning'];
  const sources = ['Default','AI Reply','Human Reply'];
  const scopes = ['Customer Service Reply','Consumer Letter','Whole Ticket'];
  const actions = ['Only identify','Stop response and transfer to agent','Template reply','Rewrite reply'];
  const agents = ['Inspect all Agents','Inspect the designated Agent'];
  const sample = [
    ['Check if replies request private information from the buyer',0,0,0],
    ['Check the customer service stance',1,0,1],
    ['Last email not from agent',2,0,0],
    ['Order update – AI reply review',2,1,0],
    ['Escalation phrasing – Human reply review',2,2,0],
    ['Inspection for disparaging competitors',0,0,0],
    ['Repetitive Prefix (Suffix) Check',1,0,1],
    ['Complaint',3,0,0]
  ].map(([name,type,source,action], id) => ({id,name,type,source,action,scope:0,agent:0,description:'',keyword:'',filter:false}));
  const html = (value) => String(value).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sourceKey = 'solvea-settings-review-v4-ai';
  let rows = sample;
  try { rows = JSON.parse(sessionStorage.getItem(sourceKey)) || sample; } catch {}
  let subsection = 'inspections';

  window.solveaReplica ||= {};
  window.solveaReplica['ai/security'] = (root) => {
    root.innerHTML = '<div class="replica-head"><h1>AI Security</h1></div><div class="replica-body">'+
      '<div class="replica-tabs" role="tablist" aria-label="AI Security"><button class="replica-tab" role="tab" aria-selected="true">Quality Inspection</button><button class="replica-tab" role="tab" aria-selected="false" disabled>Data Masking</button></div>'+
      '<div class="replica-tabs" role="tablist" aria-label="Quality Inspection"><button class="replica-tab" role="tab" data-sub="overview">Overview</button><button class="replica-tab" role="tab" data-sub="inspections">Inspections</button></div>'+
      '<div data-inspection-overview hidden><svg viewBox="0 0 560 105" style="display:block;width:100%;max-height:125px" role="img" aria-label="Example quality inspection trend"><path d="M23 26H544M23 56H544M23 86H544" stroke="#e8e9ee" stroke-dasharray="4 3"/><path d="M23 86H284Q310 86 325 58T368 26Q397 25 416 55T457 85Q475 85 491 60T544 42" fill="none" stroke="#7658dc" stroke-width="2.5"/><text x="23" y="102" fill="#647083" font-size="11">10-01</text><text x="487" y="102" fill="#647083" font-size="11">10-17</text></svg><h2 style="font-size:15px">Inspections</h2></div>'+
      '<div class="replica-toolbar"><input class="replica-field" type="search" placeholder="Search Inspection Item" aria-label="Search Inspection Item"><select class="replica-field" aria-label="All Type"><option value="">All Type</option>'+types.map((type,i)=>'<option value="'+i+'">'+type+'</option>').join('')+'</select></div>'+
      '<div class="replica-table-wrap"><table class="replica-table"><thead><tr><th>Name</th><th>Type</th><th>Reply Source</th><th>Action</th><th></th></tr></thead><tbody></tbody></table></div></div>';
    const search = root.querySelector('input[type=search]');
    const type = root.querySelector('select');
    const body = root.querySelector('tbody');
    const refresh = () => {
      const shown = rows.filter((row) => (!type.value || row.type === Number(type.value)) && row.name.toLowerCase().includes(search.value.toLowerCase().trim()));
      body.innerHTML = shown.map((row) => '<tr><td>'+html(row.name)+'</td><td>'+types[row.type]+'</td><td>'+sources[row.source]+'</td><td>'+actions[row.action]+'</td><td>'+(row.type===2?'<button type="button" class="icon-action" aria-label="Edit '+html(row.name)+'" data-ai-edit="'+row.id+'">'+window.replicaIcon('edit')+'</button>':'')+'</td></tr>').join('') || '<tr><td colspan="5" class="empty">No data</td></tr>';
    };
    const renderTab = () => {
      root.querySelectorAll('[data-sub]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.sub===subsection)));
      root.querySelector('[data-inspection-overview]').hidden = subsection !== 'overview';
    };
    root.querySelectorAll('[data-sub]').forEach((button) => button.addEventListener('click',()=>{subsection=button.dataset.sub;renderTab();}));
    search.addEventListener('input',refresh);
    type.addEventListener('change',refresh);
    body.addEventListener('click',(event)=>{
      const button = event.target.closest('[data-ai-edit]');
      if (button) edit(rows.find(({id})=>id===Number(button.dataset.aiEdit)));
    });
    renderTab();
    refresh();

    function edit(row) {
      const drawer=document.createElement('dialog');
      drawer.className='drawer';
      drawer.setAttribute('aria-label','Edit Custom quality inspection rules');
      const radios=(name,labels,value)=>'<div class="options">'+labels.map((label,i)=>'<label><input type="radio" name="'+name+'" value="'+i+'"'+(i===value?' checked':'')+'> '+label+'</label>').join('')+'</div>';
      drawer.innerHTML='<div class="replica-head"><strong>Edit Custom quality inspection rules</strong><button type="button" class="drawer-close" aria-label="Close">×</button></div>'+
        '<form class="replica-body replica-form"><label class="field-label">QC Item Name*<input class="replica-field" name="name" required value="'+html(row.name)+'"></label>'+
        '<fieldset><legend>Inspection Message Scope*</legend>'+radios('scope',scopes,row.scope)+'</fieldset>'+
        '<fieldset><legend>Reply Source*</legend>'+radios('source',sources,row.source)+'</fieldset>'+
        '<label><input type="checkbox" name="filter"'+(row.filter?' checked':'')+'> Filter Amazon tickets</label>'+
        '<fieldset><legend>Inspection Rule</legend><label class="field-label">Description<textarea class="replica-field" name="description">'+html(row.description)+'</textarea></label><label class="field-label">Keyword<input class="replica-field" name="keyword" value="'+html(row.keyword)+'"></label></fieldset>'+
        '<fieldset><legend>Action*</legend>'+radios('action',actions,row.action)+'</fieldset>'+
        '<fieldset><legend>Apply Agent Scope*</legend>'+radios('agent',agents,row.agent)+'<label class="field-label" data-agent-field>Agent<select class="replica-field" name="agentName"><option>Demo Agent</option></select></label></fieldset>'+
        '<div class="replica-form-actions"><button class="replica-button" type="button" data-cancel>Cancel</button><button class="replica-button primary" type="submit">Save</button></div></form>';
      const form=drawer.querySelector('form');
      const enforce=()=>{
        const human=form.elements.source.value==='2';
        if(human) form.elements.action.value='0';
        Array.from(form.elements.action).forEach((control)=>{control.disabled=human && control.value!=='0';});
        drawer.querySelector('[data-agent-field]').hidden=form.elements.agent.value!=='1';
      };
      drawer.querySelectorAll('[data-cancel],.drawer-close').forEach((button)=>button.addEventListener('click',()=>drawer.close()));
      drawer.addEventListener('close',()=>drawer.remove(),{once:true});
      form.addEventListener('change',enforce);
      form.addEventListener('submit',(event)=>{
        event.preventDefault();
        const inputs = new FormData(form);
        if(!inputs.get('name').trim()) return;
        Object.assign(row,{name:inputs.get('name').trim(),scope:Number(inputs.get('scope')),source:Number(inputs.get('source')),action:Number(inputs.get('action')),agent:Number(inputs.get('agent')),filter:inputs.has('filter'),description:inputs.get('description'),keyword:inputs.get('keyword')});
        try { sessionStorage.setItem(sourceKey,JSON.stringify(rows)); } catch {}
        refresh();
        drawer.close();
      });
      root.append(drawer);
      enforce();
      drawer.showModal();
    }
  };
})();
