/* Regression checks for the restored original shooter and hit-only numeric questions. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:800,height:480}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.IOT_GAME_URL||'http://localhost:8000');
  await page.waitForFunction(()=>window.GAME_LOGIN&&window.DEATH_QUIZ);
  const press=key=>page.keyboard.press(key);
  assert.equal(await page.evaluate(()=>GAME_LOGIN.unlocked),false);
  await page.locator('#login-password').fill('wrong');await press('Enter');
  assert.equal(await page.evaluate(()=>GAME_LOGIN.unlocked),false);
  await page.locator('#login-password').fill('');
  await press('1');
  for(let i=0;i<2;i++)await press('ArrowDown');await press('1');
  for(let i=0;i<14;i++)await press('ArrowDown');await press('1');
  for(let i=0;i<13;i++)await press('ArrowUp');await press('1');
  assert.equal(await page.locator('#login-password').inputValue(),'user');await press('4');
  assert.equal(await page.evaluate(()=>GAME_LOGIN.unlocked),true);
  assert.equal(await page.evaluate(()=>gameStart),false);
  await press('4');await page.waitForFunction(()=>gameStart&&player);
  assert.equal(await page.evaluate(()=>levels.length),3);
  assert.equal(await page.evaluate(()=>player.lives),5);
  assert.equal(await page.evaluate(()=>DEATH_QUIZ.active),false);
  assert.equal(await page.evaluate(()=>document.querySelector('script[src*="campaign"]')),null);
  const x=await page.evaluate(()=>player.x);await page.keyboard.down('ArrowRight');await page.waitForTimeout(100);await page.keyboard.up('ArrowRight');assert(await page.evaluate(x=>player.x>x,x));
  await press('1');assert(await page.evaluate(()=>player.lasers.length>0));
  // Invaders reaching the bottom recycle without losing a life or creating a question.
  await page.evaluate(()=>{enemies[0].y=canvas.height-player.height;enemies[0].update();});
  await page.waitForTimeout(60);
  assert.equal(await page.evaluate(()=>player.lives),5);assert.equal(await page.evaluate(()=>DEATH_QUIZ.active),false);assert.equal(await page.evaluate(()=>gameOver),false);
  await page.screenshot({path:require('node:path').join(require('node:os').tmpdir(),'restored-shooter.png')});
  // A real enemy-bullet collision deducts one life and opens exactly one question.
  const before=await page.evaluate(()=>score);
  await page.evaluate(()=>{enemies[0].lasers.push(new Laser(player.x+5,player.y+1,0,6,6,true));laserHitCheck();});
  assert.equal(await page.evaluate(()=>player.lives),4);assert.equal(await page.evaluate(()=>score),before-1100);
  assert.equal(await page.evaluate(()=>DEATH_QUIZ.phase),'question');
  const frozen=await page.evaluate(()=>enemies[0].x);await press('ArrowRight');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>enemies[0].x),frozen);
  await press('a');await press('b');await press('c');await press('d');assert.equal(await page.evaluate(()=>DEATH_QUIZ.phase),'question');
  const correct=await page.evaluate(()=>String(DEATH_QUIZ.question.options.findIndex(o=>o[1])+1));await press(correct);
  assert.equal(await page.evaluate(()=>DEATH_QUIZ.phase),'explanation');assert.equal(await page.evaluate(()=>score),before-1000);
  await press('1');assert.equal(await page.evaluate(()=>DEATH_QUIZ.active),false);assert.equal(await page.evaluate(()=>player.volleySize),2);
  await page.evaluate(()=>player.clearLasers());await press('1');assert.equal(await page.evaluate(()=>player.lasers.length),2);
  // Clearing a wave advances directly to the next original wave, with no question.
  await page.evaluate(()=>{enemies=[];numOfEnemies=0;nextLevelDelay=249;});await page.waitForFunction(()=>level===2);
  assert.equal(await page.evaluate(()=>DEATH_QUIZ.active),false);assert.equal(await page.evaluate(()=>player.lives),4);
  // Numeric keypad answers work too; the final life still gets exactly its hit question.
  await page.evaluate(()=>{player.lives=1;enemies[0].lasers.push(new Laser(player.x+5,player.y+1,0,6,6,true));laserHitCheck();});
  assert.equal(await page.evaluate(()=>player.lives),0);assert.equal(await page.evaluate(()=>DEATH_QUIZ.phase),'question');
  await press('Numpad2');assert.equal(await page.evaluate(()=>DEATH_QUIZ.phase),'explanation');await press('4');assert.equal(await page.evaluate(()=>gameOver),true);
  await press('4');assert.equal(await page.evaluate(()=>player.lives),5);assert.equal(await page.evaluate(()=>level),1);assert.equal(await page.evaluate(()=>DEATH_QUIZ.active),false);
  // Winning the original third wave never opens a question.
  await page.evaluate(()=>{level=3;levelsCleared=2;enemies=[];numOfEnemies=0;levelBonusPaid=false;});await page.waitForFunction(()=>gameWon);
  assert.equal(await page.evaluate(()=>DEATH_QUIZ.active),false);
  assert.equal(await page.evaluate(()=>IOT_MISSIONS.flatMap(m=>m.decisions).length),60);
  assert.deepEqual(errors,[]);console.log('PASS: user/user login, original 3 waves, bullet-only life loss, hit-only questions, numeric 1-4/keypad answers, original restart and no questions on wave clear or victory.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
