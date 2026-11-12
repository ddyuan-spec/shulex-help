'use strict';
window.SolveaBlacklist=(()=>{
 const base='solvea-contact-blacklist-demo-v1';
 const normalize=email=>String(email??'').trim().toLowerCase();
 const key=tenant=>tenant?base+':'+tenant:base;
 const empty=()=>({contacts:[],blacklist:[],audit:[],runs:[]});
 function load(tenant){
   try{const db=JSON.parse(localStorage.getItem(key(tenant)));return db&&['contacts','blacklist','audit','runs'].every(x=>Array.isArray(db[x]))?db:null}catch{return null}
 }
 function find(db,email){return db?.blacklist.find(x=>normalize(x.email)===normalize(email))}
 function add(db,{email,reason,note='',source,person,time}){
   email=normalize(email);if(!email||find(db,email))return false;
   const event={action:'加入黑名单',person,time,note:note||reason,source};
   db.audit.unshift({...event,email});
   db.blacklist.unshift({email,reason,note,source,person,time,history:[event]});
   return true;
 }
 function store(tenant,db){localStorage.setItem(key(tenant),JSON.stringify(db))}
 return {key,empty,load,find,add,store};
})();
