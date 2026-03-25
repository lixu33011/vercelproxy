export default async function handler(req, res) {
  try {
    const path = req.url;

    // 首页
    if (path === "/" || path === "") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>全能网页代理</title>
<style>
body{max-width:700px;margin:50px auto;padding:0 20px;font-family:Arial;background:#f5f7fa}
.card{background:white;padding:30px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.08)}
h1{color:#22a677;text-align:center}
input{width:100%;padding:14px;border:1px solid #ddd;border-radius:8px;font-size:16px;margin:10px 0;box-sizing:border-box}
button{width:100%;padding:14px;background:#22a677;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer}
.demo{background:#f9f9f9;padding:10px;border-radius:6px;margin-top:12px;font-size:14px;color:#555}
</style>
</head>
<body>
<div class="card">
<h1>✅ 全能网页代理已搭建成功</h1>
<input type="text" id="url" placeholder="输入网址 https://xxx.com">
<button onclick="go()">访问</button>
<div class="demo">
使用格式：https://你的域名/https://目标网址<br>
支持：网页、IPTV、M3U、直播、图片
</div>
</div>
<script>
function go(){
let u=document.getElementById("url").value;
if(u){location.href=location.origin+"/"+u;}
}
</script>
</body>
</html>
      `);
      return;
    }

    // 修复 Vercel 斜杠丢失问题（关键）
    let target = path.substring(1);
    target = target.replace(/^https:\//, "https://");
    target = target.replace(/^http:\//, "http://");

    if (!target.startsWith("http")) {
      res.status(400).send("❌ 请输入正确网址");
      return;
    }

    // 请求目标页面
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36",
        Accept: "*/*",
      },
      redirect: "follow",
    });

    const baseUrl = new URL(target).origin;
    const fullUrl = new URL(target).href;

    // 获取内容
    let body = await response.text();
    const contentType = response.headers.get("content-type") || "text/html";

    // 如果是网页，自动修复所有链接、资源、路径
    if (contentType.includes("text/html")) {
      const myDomain = `https://${req.headers.host}`;

      // 修复 a 链接
      body = body.replace(
        /href="\/([^\/])/g,
        `href="${myDomain}/${baseUrl}/$1`
      );
      body = body.replace(
        /href="(https?:\/\/)/g,
        `href="${myDomain}/$1`
      );

      // 修复图片、JS、CSS
      body = body.replace(
        /src="\/([^\/])/g,
        `src="${myDomain}/${baseUrl}/$1`
      );
      body = body.replace(
        /src="(https?:\/\/)/g,
        `src="${myDomain}/$1`
      );

      // 修复相对路径
      body = body.replace(
        /href="([^h])/g,
        `href="${myDomain}/${fullUrl}/$1`
      );
    }

    // 允许跨域 + 直播流支持
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Content-Type", contentType);
    res.send(body);
    
  } catch (e) {
    res.status(500).send("代理错误：" + e.message);
  }
}
