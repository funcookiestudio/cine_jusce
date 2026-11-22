// Cloudflare Worker do Cine Jusce.
//
// - Serve o site (index.html) como arquivo estático.
// - GET /turn-credentials: gera credenciais temporárias do TURN da Cloudflare
//   (Realtime > TURN Server), para o vídeo passar quando a conexão direta
//   entre as pessoas não é possível.
//
// As chaves ficam como SEGREDOS do Worker, nunca no código:
//   TURN_KEY_ID         -> "Turn Token ID" da chave TURN
//   TURN_KEY_API_TOKEN  -> "API Token" da chave TURN
// Configure em: Workers & Pages > cine-jusce > Settings > Variables and Secrets (tipo Secret).

// Sites que podem pedir credenciais (o próprio Worker e a cópia no GitHub Pages).
const ALLOWED_ORIGINS = [
  'https://cine-jusce.funcookiestudio.workers.dev',
  'https://funcookiestudio.github.io',
];

function json(body, status, origin) {
  const headers = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['access-control-allow-origin'] = origin;
    headers['vary'] = 'Origin';
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function turnCredentials(env, origin) {
  if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) return json([], 503, origin);

  const r = await fetch(
    `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ttl: 86400 }), // válidas por 24 h
    }
  );
  if (!r.ok) return json([], 502, origin);

  const data = await r.json();
  const list = Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers].filter(Boolean);

  // Navegadores bloqueiam a porta 53; a própria Cloudflare recomenda remover essas URLs.
  const servers = list
    .map(s => ({ ...s, urls: (Array.isArray(s.urls) ? s.urls : [s.urls]).filter(u => !/:53(\?|$)/.test(u)) }))
    .filter(s => s.urls.length);

  return json(servers, 200, origin);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/turn-credentials' && request.method === 'GET') {
      return turnCredentials(env, request.headers.get('Origin') || url.origin);
    }
    return env.ASSETS.fetch(request);
  },
};
