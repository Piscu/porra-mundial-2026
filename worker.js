// Cloudflare Worker — proxy para football-data.org
// 1. Ve a https://dash.cloudflare.com → Workers & Pages → Create application → Create Worker
// 2. Copia y pega este codigo
// 3. Deploy → copia la URL (ej: https://porra-proxy.nombre.workers.dev)
// 4. Pega esa URL en Admin → Proxy URL

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const apiPath = url.pathname + url.search;
    const targetUrl = 'https://api.football-data.org/v4' + apiPath;

    const headers = new Headers(request.headers);
    headers.set('Origin', 'http://localhost');

    const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
    });

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
    });
}
