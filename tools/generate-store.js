// Regenerates store/params.json, store/datasets/*.json and the page upload copy from index.html.
// Run from the repo root: node tools/generate-store.js (needs a build/ folder).
const fs=require('fs');const h=fs.readFileSync('index.html','utf8');
const s1=/<script>([\s\S]*?)<\/script>/.exec(h)[1];
let P={};global.window={};global.dash={params:()=>P,setParams:(p)=>{P={...P,...p}}};
(new Function(s1))();
const today=new Date(Date.now()+19800000).toISOString().slice(0,10);
const p=window.psBuildParams(today,today,false);
p.date=null;p.from=null;p.to=null;p.all=false;
const save=(n,o)=>fs.writeFileSync(n,JSON.stringify(o));
save('store/params.json',p);
fs.writeFileSync('store/queries.txt',Object.keys(p).filter(k=>k.startsWith('q_')).map(k=>k+' :: '+p[k]).join('\n'));
const DS=(id,title,description,param)=>save('store/datasets/'+id+'.json',{title,description,source:{kind:'query',connector:'Salesforce',tool:'soqlQuery',args:{q:'{{'+param+'}}'}}});
DS('day','Report day and period','The To date’s task count, with the period’s From and To dates. Reads Task.','q_day');
DS('fresh_leads','Fresh enquiries, lead by lead','Inbound and Outbound leads of the period (each day 6:30 PM to 6:30 PM) with first-call time, for overnight leads called by 12 noon; only loaded for periods of up to 14 days. Reads Lead.','q_fresh');
DS('fresh_all','Fresh enquiries per owner and hour','Inbound and Outbound leads of the period counted per owner and creation hour (IST and UTC hour, to place 6:30 PM exactly). Reads Lead.','q_fresh_all');
DS('fresh_nc','Fresh enquiries not called','Fresh leads of the period with no first call, per owner and creation hour. Reads Lead.','q_fresh_nc');
DS('fresh_ok','Fresh enquiries called within 5 minutes','Fresh leads of the period whose first call came within 5 minutes (Salesforce’s TAT of lead creation to 1st connection, in minutes), per owner and creation hour. Reads Lead.','q_fresh_ok');
DS('fresh_missed_rows','Fresh enquiries that missed 5 minutes','Office-hours fresh leads of the period with no first call or a first call after 5 minutes, newest first (latest 2,000). Reads Lead.','q_fresh_missed');
DS('fresh_tat','Time to first call per owner and hour','Office and outside-hours fresh leads already called: count, total, fastest and slowest minutes from creation to first call (Salesforce TAT of lead creation to 1st connection), per owner and creation hour. Reads Lead.','q_fresh_tat');
DS('calls_sum','Calls per executive over the period','Logged calls (distinct call times) and leads called per executive, with Salesforce’s team total. Reads Task.','q_calls_sum');
DS('conn_sum','Connected customers per executive','Leads with at least one connected call result in the period, per executive and team. Reads Task.','q_conn_sum');
DS('reconnect','Reconnect requests','Salesforce "Reconnect with Customer." tasks of the period, one row per customer, with the lead’s details and its latest logged call. Reads Task and Lead.','q_reconnect');
DS('att_calls_daily','Calls per executive per day','Calls of any kind each executive logged per IST day, for the attendance log and weekly roster. Reads Task.','q_att_calls');
DS('att_fresh_daily','Fresh leads allocated per day','Inbound and Outbound leads assigned to each executive per IST day, for the attendance log. Reads Lead.','q_att_fresh');
save('build/files-index.html.json',{text:h}); // upload copy of the page for the artifact store (git-ignored)
console.log('ok',today,Object.keys(p).length);
