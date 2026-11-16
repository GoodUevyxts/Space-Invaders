import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { validateScore, addScore, topTen, Leaderboard } from '../serverless/src/worker.js';
const base = { id: '2dd0a397-ed02-4c8a-833a-123456789abc', name: 'ACE', score: 1000, completed: 0, build: 'iot-v1' };
const empty = () => ({ version: 1, entries: [] });
test('score schema rejects spoofed types, invalid names, extra fields and impossible values', () => {
  assert.deepEqual(validateScore(base), base);
  for (const patch of [{name:'<script>'},{name:'ab'},{score:'1000'},{score:123},{score:2600},{score:-20100},{completed:11},{id:'bad'},{build:'v2'},{token:'secret'}]) {
    assert.throws(() => validateScore({...base,...patch}));
  }
  assert.equal(validateScore({...base,score:53500,completed:10}).score,53500);
  assert.throws(() => validateScore({...base,score:53600,completed:10}));
});
test('v2 bonuses have distinct bounds while queued v1 scores remain valid',()=>{
  assert.equal(validateScore({...base,build:'iot-v2',score:3100}).score,3100);
  assert.throws(()=>validateScore({...base,build:'iot-v2',score:3200}));
  assert.equal(validateScore({...base,build:'iot-v2',score:59500,completed:10}).score,59500);
  assert.throws(()=>validateScore({...base,build:'iot-v2',score:59600,completed:10}));
  assert.throws(()=>validateScore({...base,score:59500,completed:10}));
});
test('a retry is idempotent and an ID collision cannot replace an accepted score', () => {
  const first = addScore(empty(), base);
  assert.equal(first.board.entries.length,1);
  assert.equal(addScore(first.board,base).duplicate,true);
  assert.throws(() => addScore(first.board,{...base,name:'BAD'}), /ID already/);
});
test('top ten is sorted deterministically and excludes submission IDs', () => {
  const entries = Array.from({length:15},(_,i)=>({...base,id:String(i).padStart(2,'0'),score:i*100,createdAt:'2026-01-01T00:00:00Z'}));
  const top = topTen({version:1,entries});
  assert.equal(top.length,10); assert.equal(top[0].score,1400); assert.equal(top[9].score,500);
  assert.equal('id' in top[0],false);
});
test('origin allowlist and preflight do not expose GitHub credentials', async () => {
  const env={ALLOWED_ORIGINS:'http://localhost:8000',GITHUB_TOKEN:'not-for-client'};
  const deny=await worker.fetch(new Request('https://test/scores',{method:'POST'}),env);
  assert.equal(deny.status,403);
  const pre=await worker.fetch(new Request('https://test/scores',{method:'OPTIONS',headers:{Origin:'http://localhost:8000'}}),env);
  assert.equal(pre.status,204); assert.equal(pre.headers.get('Access-Control-Allow-Origin'),'http://localhost:8000');
});
function objectEnv() {
  const records=new Map(); let alarm=null;
  return {storage:{ get:async k=>records.get(k),put:async(k,v)=>records.set(k,v),getAlarm:async()=>alarm,setAlarm:async x=>alarm=x }};
}
function scoreRequest(data=base) {
  return new Request('https://test/scores',{method:'POST',headers:{'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1'},body:JSON.stringify(data)});
}
test('Durable Object retries a GitHub SHA conflict without losing the score',async()=>{
  const board=new Leaderboard(objectEnv(),{}); let writes=0;
  board.readBoard=async()=>({board:empty(),sha:'head'});
  board.github=async()=>new Response('{}',{status:++writes===1?409:200});
  const response=await board.fetch(scoreRequest());
  assert.equal(response.status,200); assert.equal(writes,2); assert.equal((await response.json()).id,base.id);
});
test('duplicate server retry performs no second GitHub write',async()=>{
  const board=new Leaderboard(objectEnv(),{}); let writes=0;
  board.readBoard=async()=>({board:addScore(empty(),base).board,sha:'head'});
  board.github=async()=>{writes++;return new Response('{}');};
  assert.equal((await board.fetch(scoreRequest())).status,200); assert.equal(writes,0);
});
test('oversized JSON and GitHub outages never acknowledge an unsaved score',async()=>{
  const board=new Leaderboard(objectEnv(),{});
  assert.equal((await board.fetch(scoreRequest({...base,padding:'x'.repeat(2000)}))).status,413);
  board.readBoard=async()=>({board:empty(),sha:'head'});
  board.github=async()=>new Response('{}',{status:503});
  assert.equal((await board.fetch(scoreRequest())).status,503);
});
test('server rate limits a burst from one source',async()=>{
  const board=new Leaderboard(objectEnv(),{}); board.readBoard=async()=>({board:empty(),sha:'head'});
  board.github=async()=>new Response('{}');
  for(let i=0;i<30;i++) assert.equal((await board.fetch(scoreRequest())).status,200);
  assert.equal((await board.fetch(scoreRequest())).status,429);
});
