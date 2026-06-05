// Cloudflare Pages Function: 代理彩云天气 API（解决浏览器 CORS 限制）
// 前端调用: /caiyun-proxy?path=/v2.6/{key}/{lng},{lat}/weather?alert=false&hourlysteps=24

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // OPTIONS 预检请求
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const path = url.searchParams.get('path');
  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing path param' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 安全限制：只允许代理到彩云 API
  if (!path.startsWith('/v2.5/') && !path.startsWith('/v2.6/')) {
    return new Response(JSON.stringify({ error: 'Invalid path' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const targetUrl = 'https://api.caiyunapp.com' + path;
    const resp = await fetch(targetUrl);
    const data = await resp.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
