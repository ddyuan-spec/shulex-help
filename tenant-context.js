/* Fixed review scope only. Production scope must come from a verified server session/site binding. */
(function(){'use strict';
 const scope=Object.freeze({tenantId:'tenant-shulex-home',knowledgeBaseId:'kb-shulex-home-help',tenantName:'Shulex Home'});
 function assertContext(){if(!scope.tenantId||!scope.knowledgeBaseId)throw Error('缺少租户或知识库上下文，已停止调用');return scope;}
 function owns(value){assertContext();return !!value&&value.tenantId===scope.tenantId&&value.knowledgeBaseId===scope.knowledgeBaseId;}
 function assert(value){if(!owns(value))throw Error('租户或知识库不匹配，已阻止访问');return value;}
 function bind(value){assertContext();if((value.tenantId!==undefined&&value.tenantId!==scope.tenantId)||(value.knowledgeBaseId!==undefined&&value.knowledgeBaseId!==scope.knowledgeBaseId))throw Error('禁止更改数据所属租户或知识库');return {...value,...scope};}
 const key=base=>{assertContext();return base+':'+encodeURIComponent(scope.tenantId)+':'+encodeURIComponent(scope.knowledgeBaseId);};
 function checkLink(){const p=new URL(location.href).searchParams;for(const name of ['tenantId','knowledgeBaseId'])if(p.has(name)&&p.get(name)!==scope[name])throw Error('链接所属租户或知识库与当前上下文不匹配');}
 function link(path){const url=new URL(path,location.href);url.searchParams.set('tenantId',scope.tenantId);url.searchParams.set('knowledgeBaseId',scope.knowledgeBaseId);return url.pathname+url.search+url.hash;}
 window.Tenant=Object.freeze({scope,assertContext,owns,assert,bind,key,checkLink,link});
 try{assertContext();checkLink();}catch(error){document.body.replaceChildren();const p=document.createElement('p');p.setAttribute('role','alert');p.textContent=error.message+'。请从所属帮助中心重新进入。';document.body.append(p);throw error;}
})();
