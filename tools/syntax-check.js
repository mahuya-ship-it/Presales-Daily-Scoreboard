// Checks that every <script> block in a page parses. Usage: node tools/syntax-check.js index.html
const fs=require('fs');const h=fs.readFileSync(process.argv[2],'utf8');
const re=/<script>([\s\S]*?)<\/script>/g;let m,i=0;while((m=re.exec(h))){i++;try{new Function(m[1]);console.log('script',i,'OK')}catch(e){console.log('script',i,'ERR',e.message)}}
