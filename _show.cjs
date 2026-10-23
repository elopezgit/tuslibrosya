const fs=require('fs');
const r=JSON.parse(fs.readFileSync('_desc_v2_report.json','utf8')).results;
const v3=JSON.parse(fs.readFileSync('_desc_v3_retry.json','utf8'));
const m=new Map(r.map(x=>[x.id,x])); for(const x of v3) if(x.id) m.set(x.id,x);
const names=['38 caras de Rockefeller','Rota se sigue igual','TDA y ansiedad en adultos','Un pacto con el rey de los elfos','La barrera de romper el no'];
for(const n of names){const x=[...m.values()].find(y=>y.name===n); console.log('=== '+n+' ['+x?.status+']'); console.log(x?.description||'(sin texto)'); console.log();}
