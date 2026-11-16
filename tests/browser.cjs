/* Run with Playwright available and the game served at localhost:8000. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:800,height:480}});
  const page=await context.newPage(); const errors=[];
  // A controller exposed to both JoyToKey and the browser must not double-trigger input.
  await page.addInitScript(()=>Object.defineProperty(navigator,'getGamepads',{value:()=>[{axes:[0,0],buttons:[{pressed:true}]}]}));
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.IOT_GAME_URL || 'http://localhost:8000');
  await page.waitForFunction(()=>window.IOT_CAMPAIGN);
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.phase),'title');
  const phase=()=>page.evaluate(()=>IOT_CAMPAIGN.state.phase);
  const press=async key=>{await page.keyboard.press(key);};
  const wait=expected=>page.waitForFunction(p=>IOT_CAMPAIGN.state.phase===p,expected);
  async function feedback(){await wait('feedback');await press('a');}
  async function answerCorrect(){
    await wait('question');
    const key=await page.evaluate(()=>['a','b','c','d'][IOT_CAMPAIGN.state.m.questions[IOT_CAMPAIGN.state.questionIndex].options.findIndex(o=>o[1])]);
    await press(key);await feedback();
  }
  async function acceptRisksAndLaunch(){
    await press('c');await press('c'); // Brief -> Kanban -> Risks
    await press('b');await feedback();
    await press('ArrowDown');await press('b');await feedback();
    await press('d');await wait('event');await press('b');await feedback();await wait('battle');
  }
  const bank=await page.evaluate(()=>IOT_MISSIONS.map(m=>({title:m.title,questions:m.decisions})));
  assert.equal(bank.length,10);assert.equal(bank.flatMap(m=>m.questions).length,60);
  for(const mission of bank) for(const q of mission.questions){assert.equal(q.options.length,4);assert.equal(q.options.filter(o=>o[1]).length,1);assert(q.options.every(o=>o[2].length>15));}
  await press('a');await wait('plan');
  await page.screenshot({path:require('node:path').join(require('node:os').tmpdir(),'iot-mission-brief.png')});
  // Kanban enforces one active task, charges actual delivered work and supports return.
  await press('c');await press('a');await feedback();
  await press('ArrowDown');await press('a');await feedback();
  assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.m.tasks[1].state),0);
  await press('ArrowUp');await press('b');await feedback();
  await press('a');await feedback();await press('a');await feedback();
  assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.m.spent),180);
  await press('ArrowLeft'); // Brief
  await acceptRisksAndLaunch();
  const initialX=await page.evaluate(()=>player.x);
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(100);await page.keyboard.up('ArrowRight');
  assert(await page.evaluate(x=>player.x>x,initialX));
  await press('a');assert(await page.evaluate(()=>player.lasers.length>0));
  const beforeHit = await page.evaluate(()=>({score,dx:Math.abs(enemies[0].dx),freq:enemies[0].shotFreq}));
  // A real collision invokes a question after losing a life.
  await page.evaluate(()=>{enemies[0].lasers.push(new Laser(player.x+5,player.y+1,0,6,6,true));laserHitCheck();});
  await wait('question'); assert.equal(await page.evaluate(()=>player.lives),4);
  await page.screenshot({path:require('node:path').join(require('node:os').tmpdir(),'iot-death-question.png')});
  assert.equal(await page.evaluate(()=>score),beforeHit.score-1100);
  assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.m.pressure),1);
  assert(await page.evaluate(dx=>Math.abs(enemies[0].dx)>dx,beforeHit.dx));
  assert(await page.evaluate(freq=>enemies[0].shotFreq<freq,beforeHit.freq));
  const frames=await page.evaluate(()=>IOT_CAMPAIGN.state.m.battleFrames);
  await page.waitForTimeout(150); assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.m.battleFrames),frames);
  await answerCorrect();await wait('battle');
  assert.equal(await page.evaluate(()=>score),beforeHit.score-1000);
  assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.m.pressure),0);
  assert.equal(await page.evaluate(()=>player.volleySize),2);
  await page.evaluate(()=>player.clearLasers());await press('a');
  assert.equal(await page.evaluate(()=>player.lasers.length),2);
  await page.evaluate(()=>IOT_CAMPAIGN.question('battle'));await answerCorrect();await wait('battle');
  assert.equal(await page.evaluate(()=>player.volleySize),3);
  await page.evaluate(()=>player.clearLasers());await press('a');
  assert.equal(await page.evaluate(()=>player.lasers.length),3);
  // Fatal collision still completes the security lesson and review before name entry.
  await page.evaluate(()=>{player.setLives(1);enemies[0].lasers.push(new Laser(player.x+5,player.y+1,0,6,6,true));laserHitCheck();});
  await wait('question');
  while(await phase()==='question')await answerCorrect();
  await wait('review');await press('a');await wait('name');
  await press('a');await press('ArrowRight');await press('a');await press('ArrowRight');await press('a');
  await context.setOffline(true);await press('d');await wait('leaderboard');
  assert.equal(await page.evaluate(()=>IOT_LEADERBOARD.snapshot().pending),1);
  await context.setOffline(false);await page.reload();await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>IOT_LEADERBOARD.snapshot().pending),1);
  // A fresh campaign clears all ten waves and requires at least three decisions each.
  await press('a');
  for(let wave=1;wave<=10;wave++){
    await wait('plan');assert.equal(await page.evaluate(()=>level),wave);
    await acceptRisksAndLaunch();
    await page.evaluate(()=>{enemies=[];numOfEnemies=0;});
    await wait('question');
    while(await phase()==='question') await answerCorrect();
    await wait('review');assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.m.answered.size),3);
    await press('a');
  }
  await wait('name');assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.completed),10);
  // Restore connectivity to a mock server: a wrong ACK retains the same UUID;
  // the next valid ACK removes it and refreshes the cached top ten.
  const ids=[]; let badAck=true;
  await context.route('**/Scripts/config.js',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('leaderboardUrl: ""','leaderboardUrl: "https://board.test"')});
  });
  await context.route('https://board.test/**',async route=>{
    const request=route.request();const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'};
    if(request.method()==='OPTIONS')return route.fulfill({status:204,headers});
    if(request.method()==='POST'){
      const body=request.postDataJSON();ids.push(body.id);
      return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({ok:true,id:badAck?'wrong-id':body.id})});
    }
    return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({top:[{name:'ABC',score:1000}]})});
  });
  await page.reload();
  await page.waitForFunction(()=>IOT_LEADERBOARD.snapshot().status.includes('retained for retry'));
  assert.equal(await page.evaluate(()=>IOT_LEADERBOARD.snapshot().pending),1);
  badAck=false;await page.evaluate(()=>IOT_LEADERBOARD.flush());
  assert.equal(await page.evaluate(()=>IOT_LEADERBOARD.snapshot().pending),0);
  assert.equal(ids.length,2);assert.equal(ids[0],ids[1]);
  assert.equal(await page.evaluate(()=>IOT_LEADERBOARD.snapshot().top[0].name),'ABC');
  // A generated static export extends only the matching mission and is visible in-game.
  await context.route('**/Scripts/generated-questions.js',route=>route.fulfill({contentType:'application/javascript',body:
    'IOT_MISSIONS[0].decisions.push({prompt:"A reviewed extra question for this mission?",options:[["Choice one",true,"A checked explanation for the correct choice."],["Choice two",false,"An explanation for an incorrect option."],["Choice three",false,"An explanation for another wrong option."],["Choice four",false,"An explanation for the final wrong option."]]});'}));
  await page.reload();await page.waitForFunction(()=>IOT_MISSIONS[0].decisions.length===7);
  assert.equal(await page.evaluate(()=>IOT_MISSIONS[1].decisions.length),6);
  await press('a');await wait('plan');
  // Practice retries cannot farm points or undo the recorded difficulty consequence.
  const wrong=await page.evaluate(()=>{IOT_CAMPAIGN.question('plan');return ['a','b','c','d'][IOT_CAMPAIGN.state.m.questions[IOT_CAMPAIGN.state.questionIndex].options.findIndex(o=>!o[1])];});
  await press(wrong);await feedback();assert.equal(await page.evaluate(()=>score),0);
  assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.m.pressure),1);
  const repeat=await page.evaluate(()=>{IOT_CAMPAIGN.state.phase='question';return ['a','b','c','d'][IOT_CAMPAIGN.state.m.questions[IOT_CAMPAIGN.state.questionIndex].options.findIndex(o=>o[1])];});
  await press(repeat);await feedback();assert.equal(await page.evaluate(()=>score),0);
  assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.m.pressure),1);
  assert.deepEqual(errors,[]); console.log('PASS: 60-question schema, four-button flow, Kanban limit, collisions, paused questions, offline persistence, ten reviews and victory.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
