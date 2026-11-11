window.SES_SEED={version:1,ticketStatus:{},qualityEscalations:{},tenants:[
 {id:'TEN-017',name:'AURORA',route:'OWN',ses:'active',reason:'',application:'none',remediation:'none',provider:'SMTP',from:'support@aurora.example',auth:'connected',ownOnly:false,attempts:16000,complaints:8,bounces:36,complete:true,group:'ready',verifiedAt:'2026-11-09 09:20'},
 {id:'TEN-018',name:'NOVA',route:'OWN',ses:'off',reason:'尚未申请平台发送资格',application:'none',remediation:'none',provider:'SMTP',from:'support@nova.example',auth:'none',ownOnly:false,attempts:0,complaints:0,bounces:0,complete:false,group:'transition',verifiedAt:''},
 {id:'TEN-019',name:'POLAR',route:'OWN',ses:'restricted',reason:'平台复核：停止非必要重复触达',application:'approved',remediation:'none',provider:'MICROSOFT',from:'support@polar.example',auth:'expired',ownOnly:true,attempts:10000,complaints:6,bounces:25,complete:true,group:'urgent',verifiedAt:'2026-11-02 16:10'}
],recipients:[
 {id:'R-SAM',name:'Sam Miller',email:'sam@customer.example',tenant:'TEN-017',optional:false,stop:false,complaint:false,bounce:false},
 {id:'R-KIM',name:'Kim Wilson',email:'kim@customer.example',tenant:'TEN-017',optional:true,stop:false,complaint:false,bounce:false},
 {id:'R-LEE',name:'Lee Chen',email:'lee@customer.example',tenant:'TEN-017',optional:false,stop:true,complaint:false,bounce:false},
 {id:'R-JO',name:'Jo Martin',email:'jo@customer.example',tenant:'TEN-017',optional:false,stop:false,complaint:true,bounce:false},
 {id:'R-BO',name:'Bo Taylor',email:'bo@customer.example',tenant:'TEN-017',optional:false,stop:false,complaint:false,bounce:true},
 {id:'R-NOVA',name:'Alex Rivera',email:'alex@customer.example',tenant:'TEN-018',optional:false,stop:false,complaint:false,bounce:false},
 {id:'R-POLAR',name:'Jamie Jones',email:'jamie@customer.example',tenant:'TEN-019',optional:false,stop:false,complaint:false,bounce:false}
],messages:[
 {id:'MSG-204',ticket:'DEMO-204',tenant:'TEN-017',recipient:'R-SAM',subject:'订单问题处理进度',body:'您好，已将您的订单问题交给售后负责人确认，正在核对处理进度。',status:'sent',provider:'SMTP',purpose:'service',date:'2026-11-09 09:32',reason:''},
 {id:'MSG-205',ticket:'DEMO-205',tenant:'TEN-017',recipient:'R-KIM',subject:'满意度反馈邀请',body:'请评价本次服务。',status:'queued',provider:'SES',purpose:'optional',date:'2026-11-09 09:40',reason:'收件人已退出可选邮件'},
 {id:'MSG-206',ticket:'DEMO-206',tenant:'TEN-017',recipient:'R-SAM',subject:'售后进度补充',body:'您好，正在确认本次售后的处理进度。',status:'failed',provider:'SMTP',purpose:'service',date:'2026-11-08 16:20',reason:'SMTP 授权已失效',handled:false},
 {id:'MSG-207',ticket:'DEMO-207',tenant:'TEN-017',recipient:'R-SAM',subject:'订单 A1028 的补充说明',body:'我们已收到您的补充信息。',status:'unknown',provider:'SMTP',purpose:'service',date:'2026-11-09 10:03',reason:'供应商提交超时，结果待核查'},
 {id:'MSG-208',ticket:'DEMO-208',tenant:'TEN-017',recipient:'R-LEE',subject:'售后回复',body:'关于您提出的售后问题…',status:'queued',provider:'SMTP',purpose:'service',date:'2026-11-09 10:10',reason:'收件人已停止该商家全部联系'},
 {id:'MSG-209',ticket:'DEMO-209',tenant:'TEN-017',recipient:'R-KIM',subject:'历史满意度邀请',body:'邀请您评价服务。',status:'queued',provider:'SES',purpose:'optional',date:'2026-10-02 10:00',reason:'已超出邀请时效',expired:true},
 {id:'MSG-210',ticket:'DEMO-210',tenant:'TEN-017',recipient:'R-JO',subject:'投诉抑制后的售后回复',body:'待核对联系状态。',status:'queued',provider:'SES',purpose:'service',date:'2026-11-09 10:11',reason:'已知Complaint抑制'},
 {id:'MSG-211',ticket:'DEMO-211',tenant:'TEN-017',recipient:'R-BO',subject:'地址退信后的售后回复',body:'待核对收件地址。',status:'queued',provider:'SES',purpose:'service',date:'2026-11-09 10:12',reason:'永久退信抑制'},
 {id:'MSG-301',ticket:'DEMO-301',tenant:'TEN-018',recipient:'R-NOVA',subject:'新客户接入测试',body:'关于您的售后问题…',status:'queued',provider:'SES',purpose:'service',date:'2026-11-09 10:00',reason:'无可用发送通道'},
 {id:'MSG-401',ticket:'DEMO-401',tenant:'TEN-019',recipient:'R-POLAR',subject:'待处理售后回复',body:'您好，正在确认售后处理方式。',status:'queued',provider:'SES',purpose:'service',date:'2026-11-09 10:00',reason:'平台 SES 受限且自有邮箱授权失效'}
],events:[
 {id:'EV-001',type:'Complaint',tenant:'TEN-017',recipient:'R-JO',message:'SES-DEMO-450',received:'2026-11-09 08:30',sent:'2026-11-07 10:00',duplicate:false,late:true,provider:'SES'},
 {id:'EV-002',type:'Complaint',tenant:'TEN-017',recipient:'R-JO',message:'SES-DEMO-450',received:'2026-11-09 08:31',sent:'2026-11-07 10:00',duplicate:true,late:true,provider:'SES'},
 {id:'EV-003',type:'PermanentBounce',tenant:'TEN-017',recipient:'R-BO',message:'SES-DEMO-451',received:'2026-11-09 09:10',sent:'2026-11-09 09:00',duplicate:false,late:false,provider:'SES'},
 {id:'EV-004',type:'Complaint',tenant:null,recipient:null,message:'SES-DEMO-UNKNOWN',received:'2026-11-09 09:20',sent:'未知',duplicate:false,late:false,provider:'SES'}
],feedbacks:[{id:'FB-031',tenant:'TEN-017',recipient:'R-SAM',message:'MSG-204',type:'回复重复或没有帮助',aspect:'本次服务',note:'订单号和照片已提供过，请负责人跟进。',status:'pending',assignee:'SUP-B',target:'AGENT-A',history:[{time:'2026-11-09 10:15',text:'收到原邮件服务反馈'}],report:false}],audits:[],notifications:[{id:'N-001',tenant:'TEN-019',subject:'平台 SES 发送资格已限制',status:'failed',kind:'restriction',time:'2026-11-09 08:00',reason:'管理通知服务暂不可用'}],drafts:{},requests:{},surveyHistory:[],outbound:[],roleNotes:{},replay:null};

window.SES_SEED.messages.push(
 {id:'MSG-419',ticket:'DEMO-420',tenant:'TEN-017',recipient:'R-SAM',subject:'关于您的售后问题',body:'您好，我们已收到您提供的信息，售后负责人正在核对处理方式。',status:'sent',provider:'SES',purpose:'service',date:'2026-11-09 09:00',reason:'',complaintLink:true,complaintDemo:true},
 {id:'MSG-420',ticket:'DEMO-420',tenant:'TEN-017',recipient:'R-SAM',subject:'售后问题处理进度',body:'您好，您的售后问题已交由负责人跟进。如有新情况，可以直接回复这封邮件。',status:'sent',provider:'SES',purpose:'service',date:'2026-11-09 09:32',reason:'',complaintLink:true,complaintDemo:true}
);
window.SES_SEED.complaints=[
 {id:'CP-023',tenant:'TEN-017',message:'MSG-419',ticket:'DEMO-420',recipient:'R-SAM',reason:'我收到了重复的跟进邮件。',status:'processing',assignee:'ADMIN-C',created:'2026-11-09 09:15',history:[{time:'2026-11-09 09:15',text:'收到邮件内投诉 · 已进入租户待办'},{time:'2026-11-09 09:21',text:'租户管理员：核对原邮件及发送历史'}]}
];
window.SES_SEED.complaintForms=[
 {id:'CF-DEFAULT',name:'标准投诉表单',title:'投诉这封邮件',description:'提交后，投诉将交给这家商家的负责人处理。',required:false,revision:1,system:true},
 {id:'CF-SHARED',name:'通用售后投诉',title:'提交邮件投诉',description:'请告诉我们这封售后邮件有什么问题。',required:false,revision:1},
 {id:'CF-DRAFT',name:'重复联系投诉',title:'投诉重复联系',description:'请说明这封邮件如何影响了您。',required:true,revision:1}
];
window.SES_SEED.tenants.filter(t=>t.id!=='TEN-017').forEach(t=>{t.complaintForm='CF-SHARED'});
