import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
// Some launch environments export empty placeholders that otherwise mask .env values.
try {
  const localEnv = readFileSync(join(root, '.env'), 'utf8');
  for (const line of localEnv.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[2] === '') continue;
    const [, name, raw] = match;
    if (!process.env[name]) {
      const value = raw.length >= 2 && ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) ? raw.slice(1, -1) : raw;
      process.env[name] = value;
    }
  }
} catch {}
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const apiKey = process.env.YOUCAM_API_KEY;
const apiOrigin = (process.env.YOUCAM_API_ORIGIN || 'https://yce-api-01.makeupar.com').replace(/\/$/, '');
const fileApi = `${apiOrigin}/s2s/v2.0/file`;
const skinApi = `${apiOrigin}/s2s/v2.1/task/skin-analysis`;
const mimeTypes = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp' };
// Serve only files the product needs. In particular, never expose .env, source
// control metadata, or local work/output directories through the static route.
const staticFiles = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/styles.css', 'styles.css'],
  ['/app.js', 'app.js'],
  ['/public/synthetic-sample.png', 'public/synthetic-sample.png'],
  // Local-only captioned demo builder and the verified screens it uses.
  ['/record-demo.html', 'work/record-demo.html'],
  ['/demo/home.png', 'outputs/goodskin-live-01-home.png'],
  ['/demo/consent.png', 'outputs/goodskin-live-02-consent.png'],
  ['/demo/api-flow.png', 'outputs/goodskin-storyboard-03.png'],
  ['/demo/results.png', 'outputs/goodskin-live-03-results.png'],
  ['/demo/routine.png', 'outputs/goodskin-live-04-routine.png'],
  ['/demo/bag.png', 'outputs/goodskin-live-05-bag.png']
]);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const requestWindows = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

async function jsonFetch(url, options) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(30_000) });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text.slice(0, 500) }; }
  if (!response.ok) {
    const message = data?.error || data?.message || data?.error_code || `YouCam API returned ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function analyzePhoto(photo) {
  if (!apiKey) throw Object.assign(new Error('The YouCam API key is not configured yet. Add YOUCAM_API_KEY to the server environment to enable live analysis.'), { statusCode: 503 });
  const bytes = Buffer.from(await photo.arrayBuffer());
  const mediaType = photo.type === 'image/jpeg' ? 'image/jpg' : photo.type;
  const fileName = (photo.name || 'skin-check-in.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
  const init = await jsonFetch(fileApi, {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: [{ content_type: mediaType, file_name: fileName, file_size: bytes.length }] })
  });
  const file = init?.data?.files?.[0] || init?.files?.[0];
  const upload = file?.requests?.[0];
  if (!file?.file_id || !upload?.url) throw new Error('The file upload could not be prepared. Check the YouCam API account and region settings.');
  const uploadResponse = await fetch(upload.url, { method: upload.method || 'PUT', headers: { ...(upload.headers || {}), 'Content-Type': mediaType }, body: bytes, signal: AbortSignal.timeout(60_000) });
  if (!uploadResponse.ok) throw new Error(`Secure photo upload failed (${uploadResponse.status}). Please retry.`);

  const task = await jsonFetch(skinApi, {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ src_file_id: file.file_id, dst_actions: ['acne','pore','texture','redness','moisture'], miniserver_args: { enable_mask_overlay: true }, format: 'json' })
  });
  const taskId = task?.data?.task_id || task?.task_id;
  if (!taskId) throw new Error('YouCam did not return an analysis task ID. Please retry.');
  for (let attempt = 0; attempt < 30; attempt++) {
    await sleep(8000);
    const result = await jsonFetch(`${skinApi}/${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
    });
    const data = result?.data || result;
    const state = data?.task_status || data?.status;
    if (state === 'success' || data?.results?.output || data?.score_info) return data;
    if (state === 'error' || state === 'failed') {
      const code = String(data?.error || data?.error_code || '');
      const photoGuidance = {
        error_src_face_too_small: 'Move closer so your face fills most of the frame, with your full forehead and chin visible.',
        error_face_position_too_small: 'Move closer so your face fills most of the frame, with your full forehead and chin visible.',
        error_no_face: 'We could not find a face in this photo. Use a clear, front-facing photo with one person.',
        error_face_not_forward_facing: 'Face the camera directly and keep your full face in view.',
        error_face_position_invalid: 'Center your face and keep your full forehead and chin in view.',
        error_insufficient_lighting: 'Use even light from the front and avoid strong shadows.'
      };
      throw new Error(photoGuidance[code] || 'YouCam could not analyze this photo. Try a clear, front-facing photo in even light.');
    }
  }
  throw new Error('Analysis is taking longer than expected. Your photo was sent securely; please try again in a moment.');
}

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
  response.end(JSON.stringify(payload));
}

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/api/health' && request.method === 'GET') {
    return sendJson(response, 200, { ok: true, analysisReady: Boolean(apiKey) });
  }
  if (pathname === '/api/analyze' && request.method === 'POST') {
    try {
      const client = request.socket.remoteAddress || 'local';
      const now = Date.now();
      const window = requestWindows.get(client);
      if (!window || now - window.startedAt >= RATE_WINDOW_MS) requestWindows.set(client, { startedAt: now, count: 1 });
      else if (window.count >= RATE_LIMIT) throw Object.assign(new Error('You’ve reached the demo check-in limit. Please wait a minute and try again.'), { statusCode: 429 });
      else window.count++;

      let chunks = []; let size = 0;
      for await (const chunk of request) { size += chunk.length; if (size > 11 * 1024 * 1024) throw Object.assign(new Error('Photo is too large. Please choose an image under 10 MB.'), { statusCode: 413 }); chunks.push(chunk); }
      const body = Buffer.concat(chunks);
      const formRequest = new Request('http://localhost/api/analyze', { method:'POST', headers:request.headers, body, duplex:'half' });
      const form = await formRequest.formData();
      const photo = form.get('photo');
      if (!photo || typeof photo.arrayBuffer !== 'function') return sendJson(response, 400, { error:'Choose a photo to continue.' });
      if (photo.size > 10 * 1024 * 1024) return sendJson(response, 413, { error:'Photo is too large. Please choose an image under 10 MB.' });
      if (!['image/jpeg','image/png'].includes(photo.type)) return sendJson(response, 415, { error:'Use a JPG or PNG photo. The browser prepares supported images before upload.' });
      const result = await analyzePhoto(photo);
      return sendJson(response, 200, result);
    } catch (error) { return sendJson(response, error.statusCode || 502, { error:error.message || 'The check-in could not be completed.' }); }
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405); return response.end('Method not allowed'); }
  const relativePath = staticFiles.get(pathname);
  if (!relativePath) { response.writeHead(404); return response.end('Not found'); }
  const filePath = join(root, relativePath);
  try {
    const content = await readFile(filePath);
    response.writeHead(200, { 'Content-Type':mimeTypes[extname(filePath)] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin', 'X-Frame-Options':'SAMEORIGIN', 'Permissions-Policy':'camera=(), microphone=(), geolocation=()' });
    return response.end(request.method === 'HEAD' ? undefined : content);
  } catch { response.writeHead(404); return response.end('Not found'); }
});

server.listen(port, host, () => console.log(`Goodskin running on http://${host}:${port}`));
