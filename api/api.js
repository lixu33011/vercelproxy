export default async function handler(req, res) {
  try {
    const url = req.url;

    // 首页
    if (url === '/' || url === '') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>全能网页代理</title>
<style>
body{max-width:600px;margin:50px auto;padding:30px;font-family:Arial;background:#f7f8fa}
.box{background:white;padding:30px;border-radius:16px;box-shadow:0 2px 10px #00000010}
h1{color:#0070f3;text-align:center}
input{width:100%;padding:14px;margin:10px 0;border:1px solid #ddd;border-radius:8px;font-size:15px}
button{width:100%;padding:14px;background:#0070f3;color:white;border:none;border-radius:8px;font-size:15px;cursor:pointer}
</style>
</head>
<body>
<div class="box">
<h1>✅ 代理服务运行中</h1>
<input type="text" id="link" placeholder="输入网址 https://xxx.com">
<button onclick="visit()">访问</button>
<p>使用格式：https://你的域名/https://目标地址</p>
</div>
<script>
function visit(){
let u=document.getElementById('link').value;
if(u) location.href=location.origin+'/'+u;
}
</script>
</body>
</html>
      `);
      return;
    }

    // ✅ 终极修复：强制把被吃掉的斜杠补回来
    let target = url.replace(/^\/https:/, '/https:__').replace(/__/g, '/');
    target = target.replace(/^\/http:/, '/http:__').replace(/__/g, '/');
    target = target.substring(1);

    // 安全判断
    if (!target.startsWith('http')) {
      res.status(400).send('❌ 错误：请输入正确网址');
      return;
    }

    // 请求目标地址
    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': ''
      },
      redirect: 'follow'
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    const buffer = Buffer.from(await response.arrayBuffer());

    // 跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Content-Type', contentType);
    res.send(buffer);

  } catch (err) {
    res.status(500).send('❌ 代理错误：' + err.message);
  }
}
