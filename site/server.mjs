import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),assetRoot=path.join(root,'dist');
const port=Number(process.env.PORT||4180);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.woff2':'font/woff2','.ttf':'font/ttf','.mp4':'video/mp4','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain'};
const googleTagManagerId = "GTM-PXSZPNGN";
const googleTagManagerHead = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');</script>
<!-- End Google Tag Manager -->`;
const googleTagManagerBody = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

async function sendResponse(res, response, method = "GET") {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  if (!response.body || method === "HEAD") return res.end();
  for await (const chunk of response.body) res.write(chunk);
  res.end();
}

async function withGoldAppraiserLeadCapture(response, method) {
  if (
    method !== "GET" ||
    !String(response.headers.get("content-type") || "").includes("text/html")
  ) return response;

  const html = await response.text();
  const assets = '<link rel="stylesheet" href="/gold-appraiser-lead.css"><script defer src="/gold-appraiser-lead.js?v=20260903-navigation-fix"></script>';
  const body = html.includes("</body>") ? html.replace("</body>", `${assets}</body>`) : `${html}${assets}`;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "no-cache");
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}

async function withGoogleTagManager(response, method) {
  if (
    method !== "GET" ||
    !String(response.headers.get("content-type") || "").includes("text/html")
  ) return response;

  const html = await response.text();
  const withHead = html.includes(googleTagManagerId)
    ? html
    : html.replace(/<head([^>]*)>/i, `<head$1>${googleTagManagerHead}`);
  const withBody = withHead.includes(`ns.html?id=${googleTagManagerId}`)
    ? withHead
    : withHead.replace(/<body([^>]*)>/i, `<body$1>${googleTagManagerBody}`);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "no-cache");
  return new Response(withBody, { status: response.status, statusText: response.statusText, headers });
}


http.createServer(async(req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname);
 if(process.env.PREVIEW==='true'){res.setHeader('X-Robots-Tag','noindex, nofollow');if(pathname==='/robots.txt'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('User-agent: *\nDisallow: /\n');}}
 const legal=['privacy-policy','terms-and-conditions','cancellation-refund-policy'];
 let candidate=legal.includes(pathname.replaceAll('/',''))?path.join('/var/www/cannyheads-legal',pathname.replaceAll('/','')+'.html'):path.resolve(assetRoot,'.'+pathname);
 if(candidate!==assetRoot&&!candidate.startsWith(assetRoot+path.sep)&&!candidate.startsWith('/var/www/cannyheads-legal/')){res.writeHead(404);return res.end('Not found');}
 try{if((await fs.stat(candidate)).isDirectory())candidate=path.join(candidate,'index.html');}catch{}
 let data;try{data=await fs.readFile(candidate);}catch{res.writeHead(404,{'Content-Type':'text/plain'});return res.end('Page not found');}
 const type=mime[path.extname(candidate)]||'application/octet-stream';
 let response=new Response(data,{headers:{'content-type':type,'X-Content-Type-Options':'nosniff','Cache-Control':type.startsWith('text/html')?'no-cache':'public,max-age=3600'}});
 response=await withGoldAppraiserLeadCapture(response,req.method);response=await withGoogleTagManager(response,req.method);
 if(process.env.PREVIEW==='true'&&String(response.headers.get('content-type')).includes('text/html')&&process.env.CANNYHEADS_MOCK_FORM_TEST!=='true'){
   const notice='<aside style="padding:12px 5%;background:#174A7E;color:white;font:14px Arial" role="status">Private preview: training enquiry/payment submission is disabled. No real lead will be sent.</aside><script>document.addEventListener("submit",function(event){if(event.target.id==="gold-appraiser-lead-form"){event.preventDefault();event.stopImmediatePropagation();var status=event.target.querySelector(".gjm-lead-status");if(status)status.textContent="Preview only: no enquiry was sent. The preserved live form was tested separately with mocked responses.";}},true);document.addEventListener("click",function(event){if(event.target.closest(".gjm-booking-pay")){event.preventDefault();event.stopImmediatePropagation();}},true);</script>';
   response=new Response((await response.text()).replace(/<body([^>]*)>/i,'<body$1>'+notice),{status:response.status,headers:response.headers});
 }
 await sendResponse(res,response,req.method);
}catch(error){console.error(error.message);res.writeHead(500);res.end('Unable to load page');}}).listen(port,'127.0.0.1',()=>console.log('Canny Heads preview listening on '+port));
