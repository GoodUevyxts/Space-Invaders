/* Cloudflare Worker + one Durable Object. No credentials ever reach the game. */
const MAX_BODY = 1024;
const MAX_ENTRIES = 2000;
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function validateScore(value) {
  const fields = ['id', 'name', 'score', 'completed', 'build'];
  if (!value || Array.isArray(value) || typeof value !== 'object' ||
      Object.keys(value).length !== fields.length || fields.some(k => !Object.hasOwn(value, k))) {
    throw new HttpError(400, 'Expected id, name, score, completed and build');
  }
  if (typeof value.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value.id)) {
    throw new HttpError(400, 'Invalid submission ID');
  }
  if (typeof value.name !== 'string' || !/^[A-Z0-9]{3,8}$/.test(value.name)) throw new HttpError(400, 'Invalid arcade name');
  if (!['iot-v1','iot-v2','iot-shooter-v1'].includes(value.build)) throw new HttpError(400, 'Unsupported game build');
  const shooter = value.build === 'iot-shooter-v1';
  const waves = shooter ? 3 : 10;
  if (!Number.isInteger(value.completed) || value.completed < 0 || value.completed > waves) throw new HttpError(400, 'Invalid mission count');
  let maximum = 0;
  for (let wave = 1; wave <= Math.min(value.completed + 1, waves); wave++) maximum += wave === 1 ? 2500 : wave === 2 ? 4000 : 5000;
  maximum += value.completed * (shooter ? 500 : value.build === 'iot-v2' ? 1300 : 700);
  if (shooter) maximum += 500;
  if (value.build === 'iot-v2' && value.completed < 10) maximum += 600;
  if (!Number.isSafeInteger(value.score) || value.score % 100 !== 0 || value.score < -20000 || value.score > maximum) {
    throw new HttpError(400, 'Score outside game bounds');
  }
  return value;
}
export function addScore(board, submission, now = new Date().toISOString()) {
  if (board?.version !== 1 || !Array.isArray(board.entries) || board.entries.length > MAX_ENTRIES) {
    throw new HttpError(503, 'Leaderboard requires operator repair');
  }
  for (const row of board.entries) {
    try { validateScore({ id: row.id, name: row.name, score: row.score, completed: row.completed, build: row.build }); }
    catch { throw new HttpError(503, 'Leaderboard contains an invalid entry'); }
  }
  const previous = board.entries.find(row => row.id === submission.id);
  if (previous) {
    if (['name','score','completed','build'].some(k => previous[k] !== submission[k])) throw new HttpError(409, 'ID already used for another score');
    return { board, duplicate: true };
  }
  if (board.entries.length >= MAX_ENTRIES) throw new HttpError(503, 'Leaderboard full; archive it before accepting more scores');
  return { board: { version: 1, entries: [...board.entries, { ...submission, createdAt: now }] }, duplicate: false };
}
export function topTen(board) {
  return [...board.entries].sort((a,b) => b.score-a.score || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
    .slice(0,10).map(({ name, score, completed, createdAt }) => ({ name, score, completed, createdAt }));
}
async function readJson(request) {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) throw new HttpError(415, 'Use application/json');
  if (Number(request.headers.get('Content-Length')) > MAX_BODY) throw new HttpError(413, 'Request too large');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Empty request');
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BODY) { await reader.cancel(); throw new HttpError(413, 'Request too large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new HttpError(400, 'Malformed JSON'); }
}
function json(body, status = 200) { return Response.json(body, { status }); }
function errorResponse(error) {
  return json({ error: error instanceof HttpError ? error.message : 'Leaderboard temporarily unavailable' }, error.status || 503);
}
function configuration(env) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(env.GITHUB_REPO || '') || !env.GITHUB_TOKEN || !env.GITHUB_BRANCH) {
    throw new HttpError(503, 'Leaderboard server is not configured');
  }
  const path = env.GITHUB_PATH || 'leaderboard.json';
  if (path.split('/').some(x => !x || x === '.' || x === '..')) throw new HttpError(503, 'Invalid leaderboard path');
  return path.split('/').map(encodeURIComponent).join('/');
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    // CORS reduces browser exposure; it is NOT client authentication or anti-cheat.
    if (!origin || !allowed.includes(origin)) return json({ error: 'Origin not allowed' }, 403);
    const headers = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '600', 'Vary': 'Origin',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'
    };
    let response;
    try {
      if (request.method === 'OPTIONS') response = new Response(null, { status: 204 });
      else {
        const pathname = new URL(request.url).pathname;
        if (!((pathname === '/scores' && request.method === 'POST') ||
              (pathname === '/leaderboard' && request.method === 'GET'))) throw new HttpError(404, 'Not found');
        configuration(env);
        const id = env.BOARD.idFromName('iot-v1-global');
        response = await env.BOARD.get(id).fetch(request);
      }
    } catch (error) { response = errorResponse(error); }
    const result = new Response(response.body, response);
    for (const [key,value] of Object.entries(headers)) result.headers.set(key,value);
    return result;
  }
};
export class Leaderboard {
  constructor(state, env) {
    this.state = state; this.env = env; this.queue = Promise.resolve(); this.cache = null;
  }
  fetch(request) {
    const work = this.queue.then(() => this.handle(request)).catch(errorResponse);
    this.queue = work.then(() => undefined, () => undefined);
    return work;
  }
  async rateLimit(request) {
    const ip = request.headers.get('CF-Connecting-IP') || 'local';
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
    const key = 'rate:' + Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2,'0')).join('');
    const minute = Math.floor(Date.now()/60000);
    const old = await this.state.storage.get(key);
    const count = old?.minute === minute ? old.count + 1 : 1;
    if (count > 30) throw new HttpError(429, 'Rate limit; retry in one minute');
    await this.state.storage.put(key, { minute, count });
    if (await this.state.storage.getAlarm() === null) await this.state.storage.setAlarm(Date.now()+86400000);
  }
  async alarm() {
    let cursor;
    do {
      const records = await this.state.storage.list({ prefix: 'rate:', limit: 500, ...(cursor ? { startAfter: cursor } : {}) });
      const keys = [...records.keys()];
      const expired = [...records].filter(([,v]) => v.minute < Math.floor(Date.now()/60000)-60).map(([k]) => k);
      if (expired.length) await this.state.storage.delete(expired);
      cursor = keys.length === 500 ? keys[keys.length-1] : undefined;
    } while (cursor);
    await this.state.storage.setAlarm(Date.now()+86400000);
  }
  async github(method = 'GET', payload) {
    const path = configuration(this.env);
    const base = 'https://api.github.com/repos/' + this.env.GITHUB_REPO + '/contents/' + path;
    return fetch(base + (method === 'GET' ? '?ref='+encodeURIComponent(this.env.GITHUB_BRANCH) : ''), {
      method, headers: {
        Authorization: 'Bearer ' + this.env.GITHUB_TOKEN,
        Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'iot-arcade-leaderboard', 'Content-Type': 'application/json'
      }, ...(payload ? { body: JSON.stringify(payload) } : {}), signal: AbortSignal.timeout(8000)
    });
  }
  async readBoard() {
    const response = await this.github();
    if (!response.ok) throw new HttpError(503, 'Cannot read GitHub leaderboard; retry later');
    const file = await response.json();
    if (!file.content || file.encoding !== 'base64') throw new HttpError(503, 'Invalid GitHub leaderboard file');
    try {
      const bytes = Uint8Array.from(atob(file.content.replace(/\s/g,'')), ch => ch.charCodeAt(0));
      const board = JSON.parse(new TextDecoder().decode(bytes));
      if (board.version !== 1 || !Array.isArray(board.entries) || board.entries.length > MAX_ENTRIES) throw new Error('schema');
      // Reuse full entry validation without mutating the board.
      if (board.entries.length) addScore(board, board.entries[0]);
      return { board, sha: file.sha };
    } catch { throw new HttpError(503, 'Invalid stored leaderboard'); }
  }
  async handle(request) {
    await this.rateLimit(request);
    if (request.method === 'GET') {
      if (!this.cache || Date.now()-this.cache.at > 15000) {
        const { board } = await this.readBoard(); this.cache = { at: Date.now(), top: topTen(board) };
      }
      return json({ top: this.cache.top });
    }
    const submission = validateScore(await readJson(request));
    for (let attempt = 0; attempt < 3; attempt++) {
      const { board, sha } = await this.readBoard();
      const result = addScore(board, submission);
      if (result.duplicate) return json({ ok: true, id: submission.id, duplicate: true });
      const content = btoa(JSON.stringify(result.board, null, 2) + '\n'); // All accepted fields are ASCII.
      const response = await this.github('PUT', {
        message: 'Record arcade score ' + submission.id + ' [skip ci]',
        branch: this.env.GITHUB_BRANCH, sha, content
      });
      if (response.ok) {
        this.cache = { at: Date.now(), top: topTen(result.board) };
        return json({ ok: true, id: submission.id });
      }
      if (![409,422].includes(response.status)) throw new HttpError(503, 'GitHub write failed; score remains queued');
    }
    throw new HttpError(503, 'Concurrent GitHub change; retry later');
  }
}
