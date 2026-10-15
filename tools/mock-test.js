// Mock run of the page's query builder, loaders and calcs on made-up Salesforce answers.
// Run from the repo root: node tools/mock-test.js
const fs=require('fs');const h=fs.readFileSync('index.html','utf8');
const scripts=[];const re=/<script>([\s\S]*?)<\/script>/g;let m;while((m=re.exec(h)))scripts.push(m[1]);
let P={};const loaders={},calcs={};
global.window={};
global.dash={params:()=>P,setParams:(p)=>{P={...P,...p}},loader:(id,o)=>{loaders[id]=o},calc:(id,o)=>{calcs[id]=o},data:()=>({}),onData(){},setLink(){}};
for(let i=0;i<3;i++) (new Function(scripts[i]))();
const out=(...a)=>console.log(...a);
out('init params from/to/all', P.from,P.to,P.all);
const p=window.psBuildParams('2025-10-01','2026-10-14',true);
for (const k of ['q_day','q_att_calls','q_reconnect','q_fresh_all','q_fresh_missed','q_fresh','q_calls_sum']) out(k,'::',p[k]);
(async()=>{
 // day loader
 out('day', JSON.stringify(loaders.day.fn({answer:{totalSize:1,done:true,records:[{d:'2026-10-14',n:5}]},args:{q:p.q_day}})));
 const p1=window.psBuildParams('2026-10-14','2026-10-14');
 out('day1', JSON.stringify(loaders.day.fn({answer:{records:[]},args:{q:p1.q_day}})));
 // windowed
 const qs=[];
 const r=await loaders.att_calls_daily.fn({answer:{records:[{OwnerId:'a',d:'2025-10-01',n:3}]},args:{q:p.q_att_calls},call:async(t,a)=>{qs.push(a.q.match(/CreatedDate >= \S+ AND CreatedDate < \S+ AND CreatedDate < \S+/)[0]);return {records:[{OwnerId:'b',d:'2026-05-01',n:1}]}}});
 out('windows', qs, r.rows.length);
 // reconnect loader
 let calls=0;
 const mk=(n,start)=>Array.from({length:n},(_,i)=>({Id:'T'+String(start+i).padStart(6,'0'),CreatedDate:'2026-10-0'+(1+(i%9))+'T05:00:00.000+0000',WhoId:i%10===0?null:'00Q'+(i%700),Owner:{Name:'X'}}));
 const rc=await loaders.reconnect.fn({answer:{records:mk(2000,0)},args:{q:p.q_reconnect},call:async(t,a)=>{calls++; if(a.q.startsWith('SELECT Id, CreatedDate')) return {records:mk(500,2000)}; const ids=[...a.q.matchAll(/'(00Q\d+)'/g)].map(x=>x[1]); return {records:ids.map((id,j)=>({Id:id,Name:'N'+id,Owner:{Name:j%2?'Rima Debnath':'Sangita Biswas'},MobilePhone:'+919800000000',Status:j%5===0?'Closed Lost':'Follow-up',Inq_rltn_Project_Society__r:{Name:'NEW KOLKATA - SANGAM'},Tasks:j%3?{records:[{CreatedDate:'2026-10-12T05:00:00.000+0000',CallDisposition:'Call Not Received'}]}:null}))}}});
 out('reconnect rows',rc.rows.length,'calls',calls,JSON.stringify(rc.meta));
 const rl=calcs.reconnect_list.fn(rc.rows);
 const cnt={};rl.forEach(x=>cnt[x.outcome]=(cnt[x.outcome]||0)+1);out('outcomes',JSON.stringify(cnt));
 out('sample',JSON.stringify(rl.find(x=>x.outcome==='Missed')));
 const bo=calcs.reconnect_by_owner.fn(rl);out('by owner',JSON.stringify(bo.slice(0,3)),JSON.stringify(bo[bo.length-1]));
 // fresh
 const fa=[{o:'Rima Debnath',hi:11,hu:5,n:10},{o:'Rima Debnath',hi:18,hu:12,n:2},{o:'Rima Debnath',hi:18,hu:13,n:3},{o:'Rima Debnath',hi:2,hu:20,n:4}];
 const fb=calcs.fresh_by_owner.fn(fa,[{o:'Rima Debnath',hi:11,hu:5,n:1}],[{o:'Rima Debnath',hi:11,hu:5,n:7},{o:'Rima Debnath',hi:18,hu:12,n:1},{o:'Rima Debnath',hi:2,hu:20,n:4}],[]);
 out('fresh',JSON.stringify(fb));
 const cb=calcs.calls_by_exec.fn([{OwnerId:'0058Z000008aD4wQAE',c:10,l:8},{OwnerId:null,c:30,l:20}],[{OwnerId:'0058Z000008aD4wQAE',l:3},{OwnerId:null,l:9}]);
 out('calls',JSON.stringify(cb.slice(3)));
 const al=calcs.attendance_log.fn([{d:'2026-10-14',from:'2026-10-01',to:'2026-10-14'}],[{OwnerId:'0058Z000008aD4wQAE',d:'2026-10-02',n:5}],[]);
 out('att rows',al.length,al.filter(x=>x.in_period==='Yes').length, JSON.stringify(calcs.attendance_month.fn(al).slice(-1)));
 const k=calcs.kpis.fn([{executive:'Team (present)',target:1,called:1}],fb,cb,rl);out('kpis',JSON.stringify(k[0]).slice(0,600));
 out('ins',JSON.stringify(calcs.insights.fn([],fb,cb,rl)));
})().catch(e=>console.log('ERR',e.stack));
