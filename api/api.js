export default async function handler(req, res) {
  try {
    let url = req.url;

    // 首页
    if (url === '/' || url === '') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(`
        <div style="text-align:center;padding:40px;font-family:Arial">
          <h1 style="color:green">✅ 代理服务运行正常</h1>
          <p>使用格式：https://你的域名/https://目标地址</p>
          <p>专为 IPTV/M3U/M3U8 优化</p>
        </div>
      `);
      return;
    }

    // 修复 Vercel 双斜杠变单斜杠的问题
    if (url.startsWith('/https:/') && !url.startsWith('/https://')) {
      url = url.replace('/https:/', '/https://');
    }
    if (url.startsWith('/http:/') && !url.startsWith('/http://')) {
      url = url.replace('/http:/', '/http://');
    }

    // 取出真实目标地址
    const target = url.substring(1);

    if (!target.startsWith('http')) {
      res.status(400).send('❌ 错误：请输入正确的网址');
      return;
    }

    // 请求目标地址
    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IPTV-Proxy)',
        'Referer': ''
      },
      redirect: 'follow'
    });

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'text/plain';

    // 跨域 + 直播流支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(arrayBuffer));

  } catch (err) {
    res.status(500).send('❌ 代理错误：' + err.message);
  }
}
