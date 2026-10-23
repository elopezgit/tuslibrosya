const fs=require('fs'); const a=JSON.parse(fs.readFileSync('_missing_authors.json','utf8'));
for(const x of a){ if(x.saga) console.log(`${x.name}  ::  ${x.autor}  ::  ${x.saga}`); }
