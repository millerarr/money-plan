import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import webpush from 'web-push';

const {VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY,VAPID_SUBJECT,ALLOWED_ORIGIN='https://millerarr.github.io',PORT='3000',DATA_DIR='./data'}=process.env;
if(!VAPID_PUBLIC_KEY||!VAPID_PRIVATE_KEY||!VAPID_SUBJECT)throw new Error('set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT');
webpush.setVapidDetails(VAPID_SUBJECT,VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY);
fs.mkdirSync(DATA_DIR,{recursive:true});const dbPath=path.join(DATA_DIR,'subscriptions.json');
let db;try{db=JSON.parse(fs.readFileSync(dbPath,'utf8'))}catch{db={subscriptions:[]}}
function save(){fs.writeFileSync(dbPath+'.tmp',JSON.stringify(db));fs.renameSync(dbPath+'.tmp',dbPath)}
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':ALLOWED_ORIGIN,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'});res.end(JSON.stringify(obj))}
function readJson(req){return new Promise((resolve,reject)=>{let data='';req.on('data',chunk=>{data+=chunk;if(data.length>20000)reject(new Error('too large'))});req.on('end',()=>{try{resolve(JSON.parse(data))}catch{reject(new Error('bad json'))}})})}
http.createServer(async(req,res)=>{
 if(req.method==='OPTIONS')return send(res,204,{});
 if(req.headers.origin&&req.headers.origin!==ALLOWED_ORIGIN)return send(res,403,{error:'origin not allowed'});
 if(req.url==='/health'&&req.method==='GET')return send(res,200,{ok:true});
 if(req.method!=='POST'||!['/subscribe','/unsubscribe'].includes(req.url))return send(res,404,{error:'not found'});
 try{const body=await readJson(req);
 if(req.url==='/subscribe'){
 const {subscription,timezone}=body;
 if(!subscription?.endpoint?.startsWith('https://')||!subscription.keys?.p256dh||!subscription.keys?.auth)return send(res,400,{error:'invalid subscription'});
 try{new Intl.DateTimeFormat('en-GB',{timeZone:timezone})}catch{return send(res,400,{error:'invalid timezone'})}
 db.subscriptions=db.subscriptions.filter(x=>x.subscription.endpoint!==subscription.endpoint);
 db.subscriptions.push({subscription,timezone,sent:{}});save();return send(res,200,{ok:true});
 }
 db.subscriptions=db.subscriptions.filter(x=>x.subscription.endpoint!==body.endpoint);save();return send(res,200,{ok:true});
 }catch(e){return send(res,400,{error:e.message})}
}).listen(Number(PORT),()=>console.log('push server listening on',PORT));

async function tick(){const now=new Date();let changed=false;
 for(const record of [...db.subscriptions]){
 let parts;try{parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:record.timezone,weekday:'short',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]))}catch{continue}
 const hour=Number(parts.hour),minute=Number(parts.minute),day=Number(parts.day),date=`${parts.year}-${parts.month}-${parts.day}`;
 const jobs=[];
 if(parts.weekday==='Sun'&&hour===15&&minute<5)jobs.push(['sunday','sunday money check','your £10 arrived? if yes, log it and allocate £2 kenya, £5 reselling, £3 personal.']);
 if(parts.weekday==='Wed'&&hour===18&&minute<5)jobs.push(['wednesday','midweek money check','check your spending and update your balances.']);
 if(day===1&&hour===18&&minute<5)jobs.push(['monthly','monthly savings review','review your pots and record interest only if monzo has actually paid it.']);
 for(const [id,title,body] of jobs){const key=id+':'+date;if(record.sent[key])continue;
 try{await webpush.sendNotification(record.subscription,JSON.stringify({title,body}),{TTL:3600});record.sent[key]=true;changed=true}
 catch(e){if(e.statusCode===404||e.statusCode===410){db.subscriptions=db.subscriptions.filter(x=>x!==record);changed=true}else console.error('push failed',e.statusCode||e.message)}
 }
 const keys=Object.keys(record.sent);for(const key of keys)if(Date.parse(key.split(':')[1])<Date.now()-45*86400000){delete record.sent[key];changed=true}
 }
 if(changed)save();
}
setInterval(()=>tick().catch(console.error),60000);tick().catch(console.error);
