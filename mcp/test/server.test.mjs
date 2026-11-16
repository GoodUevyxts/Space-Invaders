import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, readFile, rm, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CreateMessageRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { QuestionStore, QuestionSchema, CRITERIA } from '../src/questions.mjs';
const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const GAME='SpaceInvaders-master/SpaceInvaders-master';
const question=(suffix='')=>({
  prompt:'A replacement sensor requests a broker session'+suffix+'. Which check is required?',
  options:[
    ['Verify its independent device credential',true,'A separately verified credential establishes identity before broker access is granted.'],
    ['Trust the first device to connect',false,'Connection timing does not establish the identity of a device.'],
    ['Trust the advertised device label',false,'A public label can be copied and does not provide identity assurance.'],
    ['Allow it to claim administrator access',false,'A client cannot safely assign itself privileges or prove its identity by claiming a role.']
  ]
});
async function fixture(t){
  const root=await mkdtemp(path.join(tmpdir(),'iot-mcp-'));t.after(()=>rm(root,{recursive:true,force:true}));
  await mkdir(path.join(root,GAME,'Scripts'),{recursive:true});await mkdir(path.join(root,GAME,'data'),{recursive:true});
  for(const file of ['Scripts/missions.js','Scripts/question-bank.js','Scripts/generated-questions.js','data/generated-questions.json'])await cp(path.join(ROOT,GAME,file),path.join(root,GAME,file));
  return {root,store:new QuestionStore(root)};
}
test('all ten criteria expose their six existing questions and generation guidance',async t=>{
  const {store}=await fixture(t);const criteria=await store.criteria();assert.equal(criteria.length,10);
  for(const c of CRITERIA){
    const brief=await store.brief(c.id,3,'advanced');assert.equal(brief.existingPrompts.length,6);assert.equal(brief.count,3);
    assert.equal(brief.criterion.category,c.category);assert(brief.instructions.some(x=>x.includes('exactly one correct')));
  }
});
test('bad answer counts, duplicate choices, repeated prompts and long text are rejected',async t=>{
  const {store}=await fixture(t);
  const bad=question();bad.options[1][1]=true;assert.equal(QuestionSchema.safeParse(bad).success,false);
  const dup=question();dup.options[1][0]=dup.options[0][0];assert.equal(QuestionSchema.safeParse(dup).success,false);
  const long=question();long.prompt='x'.repeat(161);assert.equal(QuestionSchema.safeParse(long).success,false);
  await assert.rejects(()=>store.validate('authentication',[question(),question()]),/Duplicate question/);
  const original=(await store.baseMissions())[0].decisions[0];await assert.rejects(()=>store.validate('authentication',[original]),/Duplicate question/);
  await assert.rejects(()=>store.saveDraft({criterion:'invented-criterion',questions:[question()]}));
});
test('publication requires review, adds offline questions, and is idempotent',async t=>{
  const {store,root}=await fixture(t);const draft=await store.saveDraft({criterion:'authentication',questions:[question()]});
  assert.equal((await store.published()).entries.length,0);
  await assert.rejects(()=>store.publish({draftId:draft.id,reviewed:false,reviewNote:'Not reviewed'}),/Review/);
  const first=await store.publish({draftId:draft.id,reviewed:true,reviewNote:'Reviewed fixture for automated test'});
  const retry=await store.publish({draftId:draft.id,reviewed:true,reviewNote:'Retry after transport loss'});
  assert.equal(first.totalGenerated,1);assert.equal(retry.totalGenerated,1);
  assert.equal((await store.draft(draft.id)).status,'published');
  const globals={window:{}};vm.createContext(globals);
  vm.runInContext(await readFile(path.join(root,GAME,'Scripts/missions.js'),'utf8'),globals);globals.IOT_MISSIONS=globals.window.IOT_MISSIONS;
  vm.runInContext(await readFile(path.join(root,GAME,'Scripts/question-bank.js'),'utf8'),globals);
  vm.runInContext(await readFile(path.join(root,GAME,'Scripts/generated-questions.js'),'utf8'),globals);
  assert.equal(globals.IOT_MISSIONS[0].decisions.length,7);assert.equal(globals.IOT_MISSIONS[1].decisions.length,6);
});
test('an interrupted export can be retried without duplicating published entries',async t=>{
  const {store}=await fixture(t);const draft=await store.saveDraft({criterion:'authentication',questions:[question(' recovery')]});
  const write=store.writeGameScript.bind(store);store.writeGameScript=async()=>{throw Error('Simulated disk fault');};
  await assert.rejects(()=>store.publish({draftId:draft.id,reviewed:true,reviewNote:'Reviewed test fixture'}),/disk fault/);
  assert.equal((await store.published()).entries.length,1);assert.equal((await store.draft(draft.id)).status,'draft');
  store.writeGameScript=write;await store.publish({draftId:draft.id,reviewed:true,reviewNote:'Reviewed test fixture'});
  assert.equal((await store.published()).entries.length,1);assert.equal((await store.draft(draft.id)).status,'published');
});
test('draft path traversal, symlink access and concurrent writes are rejected',async t=>{
  const {store,root}=await fixture(t);
  await assert.rejects(()=>store.draft('../../secret'));
  await mkdir(path.join(root,'.question-drafts'));
  const outside=path.join(root,'outside.json');await writeFile(outside,'{}');
  const id='4a210b23-5f48-4f78-948d-123456789abc';await symlink(outside,path.join(root,'.question-drafts',id+'.json'));
  await assert.rejects(()=>store.draft(id),/Symlink/);
  await mkdir(path.join(root,'.question-drafts','.write-lock'));
  await assert.rejects(()=>store.saveDraft({criterion:'authentication',questions:[question()]}),/busy/);
});
async function connect(t,root,{sampling=false,badJson=false}={}){
  const client=new Client({name:'question-test-client',version:'1.0.0'},{capabilities:sampling?{sampling:{}}:{}});
  if(sampling)client.setRequestHandler(CreateMessageRequestSchema,async()=>({
    role:'assistant',model:'test-fixture',stopReason:'endTurn',content:{type:'text',text:badJson?'not JSON':JSON.stringify({questions:[question(' generated')]})}
  }));
  const transport=new StdioClientTransport({command:process.execPath,args:[path.join(ROOT,'mcp/server.mjs')],env:{...process.env,IOT_REPO_ROOT:root},stderr:'pipe'});
  await client.connect(transport);t.after(()=>client.close());return client;
}
const toolData=r=>JSON.parse(r.content[0].text);
test('real stdio MCP handshake discovers tools, prompt and resource without sampling',async t=>{
  const {root}=await fixture(t);const client=await connect(t,root);
  const tools=await client.listTools();assert.equal(tools.tools.length,9);
  assert((await client.listPrompts()).prompts.some(p=>p.name==='write-iot-questions'));
  assert((await client.listResources()).resources.some(r=>r.uri==='iot-questions://workflow'));
  assert.equal(toolData(await client.callTool({name:'list_security_criteria',arguments:{}})).length,10);
  const generated=toolData(await client.callTool({name:'generate_questions',arguments:{criterion:'authentication',count:1}}));
  assert.equal(generated.generated,false);assert.equal(generated.draftSaved,false);assert(generated.brief);
  const saved=toolData(await client.callTool({name:'save_question_draft',arguments:{criterion:'authentication',questions:[question(' client model')]}}));
  assert.equal(saved.status,'draft');
});
test('real MCP sampling generates and validates a draft, then exports after review',async t=>{
  const {root,store}=await fixture(t);const client=await connect(t,root,{sampling:true});
  const generated=toolData(await client.callTool({name:'generate_questions',arguments:{criterion:'authentication',count:1,difficulty:'beginner'}}));
  assert.equal(generated.generated,true);assert.equal(generated.draftSaved,true);assert.equal((await store.published()).entries.length,0);
  const published=await client.callTool({name:'publish_question_draft',arguments:{draftId:generated.draft.id,reviewed:true,reviewNote:'Reviewed fixture for protocol integration test'}});
  assert.notEqual(published.isError,true);assert.equal(toolData(published).totalGenerated,1);
});
test('bad model output reports an error and creates no draft or game change',async t=>{
  const {root,store}=await fixture(t);const client=await connect(t,root,{sampling:true,badJson:true});
  const response=await client.callTool({name:'generate_questions',arguments:{criterion:'authentication',count:1}});
  assert.equal(response.isError,true);assert.equal((await store.listDrafts()).length,0);assert.equal((await store.published()).entries.length,0);
});
