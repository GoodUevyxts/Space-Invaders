/* IndexedDB outbox: commit locally BEFORE sending; delete only after server ACK. */
window.IOT_LEADERBOARD = (() => {
  let dbPromise, flushing = false;
  let status = 'Local scores ready', top = [], pending = 0;
  const endpoint = IOT_CONFIG.leaderboardUrl.replace(/\/$/, '');
  function db() {
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open('iot-arcade-v1', 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('outbox', { keyPath: 'id' });
        req.result.createObjectStore('meta');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  async function transaction(store, mode, op) {
    const database = await db();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(store, mode);
      const req = op(tx.objectStore(store));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Storage transaction aborted'));
    });
  }
  const all = () => transaction('outbox', 'readonly', s => s.getAll());
  const put = row => transaction('outbox', 'readwrite', s => s.put(row));
  const remove = id => transaction('outbox', 'readwrite', s => s.delete(id));
  async function refresh() {
    pending = (await all()).length;
    if (!endpoint) { status = 'Local only: set leaderboardUrl to enable upload'; return; }
    const response = await fetch(endpoint + '/leaderboard', { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('Leaderboard HTTP ' + response.status);
    const body = await response.json();
    if (!Array.isArray(body.top)) throw new Error('Invalid leaderboard response');
    top = body.top.slice(0, 10).filter(row => /^[A-Z0-9]{3,8}$/.test(row.name) && Number.isInteger(row.score));
    await transaction('meta', 'readwrite', s => s.put(top, 'top'));
  }
  async function flush() {
    if (flushing) return;
    flushing = true;
    try {
      const rows = await all();
      pending = rows.length;
      if (!endpoint) { status = 'Saved locally; server URL is not configured'; return; }
      for (const row of rows) {
        // Rejected submissions remain visible locally for operator investigation.
        if (row.rejected) continue;
        const { rejected, ...payload } = row;
        const response = await fetch(endpoint + '/scores', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload), signal: AbortSignal.timeout(15000)
        });
        if (!response.ok) {
          if ([400, 409, 413, 422].includes(response.status)) {
            await put({ ...row, rejected: response.status });
            status = 'A score was rejected; it remains in local storage';
            continue;
          }
          throw new Error('Upload HTTP ' + response.status);
        }
        const ack = await response.json();
        if (ack.id !== row.id || ack.ok !== true) throw new Error('Missing score acknowledgement');
        await remove(row.id);
      }
      pending = (await all()).length;
      await refresh();
      status = pending ? pending + ' score(s) need attention; retained locally' : 'All scores uploaded';
    } catch (error) {
      status = 'Offline / server unavailable: scores retained for retry';
      console.info('Leaderboard:', error.message);
    } finally { flushing = false; }
  }
  async function save(name, score, completed) {
    if (!/^[A-Z0-9]{3,8}$/.test(name)) throw new Error('Use 3-8 uppercase letters or numbers');
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    const id = hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
    await put({ id, name, score, completed, build: IOT_CONFIG.build });
    pending = (await all()).length;
    status = 'Score safely queued on this Pi';
    void flush();
  }
  async function start() {
    try {
      top = (await transaction('meta', 'readonly', s => s.get('top'))) || [];
      pending = (await all()).length;
      await flush();
    } catch { status = 'Storage unavailable: scores cannot be saved'; }
  }
  window.addEventListener('online', () => void flush());
  setInterval(() => void flush(), 60000);
  return { start, save, flush, snapshot: () => ({ status, top, pending }) };
})();
