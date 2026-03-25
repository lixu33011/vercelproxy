export default async function handler(req, res) {
  try {
    const url = req.url.slice(1);

    // 首页不代理，直接返回空，交给 index.html
    if (!url || url === '' || url === '/') {
      res.status(200).send('');
      return;
    }

    // 非法地址拦截
    if (!url.startsWith('http')) {
      res.status(400).send('错误：请输入正确的URL地址');
      return;
    }

    // 请求目标资源
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36',
        'Referer': ''
      },
      redirect: 'follow'
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // 跨域 + 流支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Content-Type', contentType);
    res.send(buffer);

  } catch (err) {
    res.status(500).send('代理服务异常：' + err.message);
  }
}
