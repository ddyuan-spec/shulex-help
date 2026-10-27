/* Local ticket demo shared by Help Center and agent workspace. */
(function(){
 'use strict';const T=window.Tenant;T.assertContext();const keys={tickets:T.key('shulex-demo-tickets-v2')};
 const get=(key,fallback=[])=>{try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback;}catch{return fallback;}};
 function put(key,value){localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new CustomEvent('shulex-workflow-change',{detail:key}));return value;}
 const now=()=>new Date().toISOString();
 function normalize(t){return {...t,status:t.status||'pending',assignee:t.assignee||'',channel:t.channel||'Help Center',messages:t.messages||[],events:t.events||[{text:'客户从帮助中心提交工单，进入待处理队列',time:t.time||now(),type:'created'}]};}
 function scoped(ticket){T.assert(ticket);return {...ticket,context:T.bind({...ticket.context,sourceRefs:(ticket.context?.sourceIds||[]).map(id=>T.bind({id}))}),messages:(ticket.messages||[]).map(T.bind),events:(ticket.events||[]).map(T.bind),attachments:(ticket.attachments||[]).map(T.bind)};}
 const tickets=()=>get(keys.tickets).filter(T.owns).map(normalize).map(scoped);
 function createTicket(ticket){const result=normalize(T.bind({...ticket,context:T.bind(ticket.context||{}),attachments:(ticket.attachments||[]).map(T.bind),status:'pending',channel:'Help Center'}));const bound=scoped(result);put(keys.tickets,[...tickets(),bound]);return bound;}
 function updateTicket(id,mutate){let result=null;const list=tickets().map(t=>{if(t.id!==id)return t;result=mutate(t)||t;T.assert(result);T.assert(result.context);result=scoped(result);return result;});if(!result)throw Error('工单不存在或无权访问');put(keys.tickets,list);return result;}
 function event(ticket,text,type='activity'){T.assert(ticket);ticket.events.push(T.bind({text,time:now(),type}));}
 function seed(){if(tickets().some(t=>t.seed))return;
 const base={demo:true,seed:true,category:'产品使用与故障',order:'',attachments:[],channel:'Help Center'};
 const one=normalize({...base,id:'SH-DEMO-1027',email:'customer@example.com',description:'更换滤芯后，指示灯闪烁三次是什么意思？按照说明长按后还是没有重置成功。',time:'2026-10-27T16:40:00-07:00',context:{question:'更换滤芯后，指示灯闪烁三次是什么意思？',answer:'暂时没有找到这个现象的准确说明。知识库中没有足够依据。',sourceIds:['filter'],scenario:'related',vote:'down',reasons:['信息不完整或过时'],feedback:'希望了解这种状态的处理办法。'}});
 const two=normalize({...base,id:'SH-DEMO-1026',email:'shopper@example.com',description:'收到商品后发现外壳破损，希望申请售后。',category:'退换货与退款',time:'2026-10-27T16:12:00-07:00',context:{question:'收到的商品有破损，应该怎么办？',answer:'请保留商品与外包装，在签收后 7 天内联系支持团队申请处理。',sourceIds:['policy','video','timing'],scenario:'damage',vote:null,reasons:[]}});
 const three=normalize({...base,id:'SH-DEMO-1025',email:'buyer@example.com',description:'想核实我这笔订单的退款进度。',category:'退换货与退款',time:'2026-10-27T15:30:00-07:00',status:'resolved',assignee:'我',context:{question:'我的退款到账了吗？',answer:'退款通常需要 3–5 个工作日，具体以支付机构为准。',sourceIds:['timing'],scenario:'damage',reasons:[]},messages:[{id:'sample-reply',role:'support',body:'已记录你的退款进度查询，请以支付机构实际到账结果为准。',time:'2026-10-27T15:48:00-07:00'}]});
 put(keys.tickets,[...tickets(),...[one,two,three].map(t=>scoped(T.bind({...t,context:T.bind(t.context)})))]);}
 window.Workflow={keys,get,put,now,tickets,createTicket,updateTicket,event,seed};
})();
