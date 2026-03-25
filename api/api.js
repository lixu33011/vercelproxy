export default async function handler(req, res) {
  try {
    // 获取真实目标地址（自动拼接 / 后的所有内容）
    const url = req.url.slice(1);

    // 安全校验
    if (!url || !url.startsWith('http')) {
      return res.status(400).send('请输入正确的URL');
    }

    // 请求目标资源
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': ''
      },
      redirect: 'follow'
    });

    // 返回流数据（支持 m3u8 / ts / mp4 / 直播流）
    const body = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // 解决跨域 + 直播流支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(body));
    
  } catch (err) {
    res.status(500).send('代理错误：' + err.message);
  }
}
