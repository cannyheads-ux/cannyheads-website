import fs from 'node:fs/promises';
import {createRequire} from 'node:module'; const require=createRequire('/root/cannyheads-redesign/package.json'); const sharp=require('sharp');
import mongoose from '/root/getjobme/backend/node_modules/mongoose/index.js';
const root='/root/cannyheads-redesign';
await mongoose.connect('mongodb://localhost:27017/jobportal',{autoIndex:false,autoCreate:false});
const db=mongoose.connection.db, now=new Date();
const counts={atIST:now.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),jobs:await db.collection('jobs').countDocuments({status:{$in:['Open','Active']},$or:[{applicationDeadline:null},{applicationDeadline:{$gte:now}}]}),candidates:await db.collection('candidateprofiles').countDocuments({profileStatus:{$ne:'Inactive'},fullName:{$not:/^\s*(test|testing|demo|dummy|sample)\b/i}}),employers:await db.collection('employerprofiles').countDocuments({companyName:{$not:/^\s*(bigshopes|test|testing|demo|dummy|sample)\b/i}})};
await mongoose.disconnect();
counts.labels={jobs:Math.floor(counts.jobs/100)*100+'+',candidates:Math.floor(counts.candidates/100)*100+'+'};
await fs.writeFile(root+'/review/counts.json',JSON.stringify(counts,null,2));console.log(counts);
const photos=[];let composites=[];let idx=0;
for(const dir of ['main','business'])for(const file of await fs.readdir(root+'/site/public/'+dir)){if(!file.endsWith('.webp'))continue;const path=root+'/site/public/'+dir+'/'+file;const meta=await sharp(path).metadata();photos.push({file:dir+'/'+file,width:meta.width,height:meta.height,dpiAt100mm:Math.round(meta.width/100*25.4)});const thumb=await sharp(path).resize(300,190,{fit:'cover'}).extend({top:0,bottom:30,left:0,right:0,background:'white'}).composite([{input:Buffer.from(`<svg width="300" height="30"><text x="5" y="20" font-size="12">${file}</text></svg>`),left:0,top:190}]).png().toBuffer();composites.push({input:thumb,left:(idx%3)*300,top:Math.floor(idx/3)*220});idx++;}
await sharp({create:{width:900,height:Math.ceil(idx/3)*220,channels:3,background:'white'}}).composite(composites).png().toFile(root+'/review/source-photos.png');
await fs.writeFile(root+'/review/photo-resolution.json',JSON.stringify(photos,null,2));console.log(photos);
