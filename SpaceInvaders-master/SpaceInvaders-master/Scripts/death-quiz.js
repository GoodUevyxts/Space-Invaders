/* A small overlay around the original shooter. begin() is called only by an enemy-bullet hit. */
window.DEATH_QUIZ = (() => {
  let state = '', current = null, chosen = -1, remaining = [], pressure = 0, correct = 0;
  const shuffle = source => {
    const items = [...source];
    for (let i=items.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]]; }
    return items;
  };
  function applyDifficulty() {
    if (player) { player.volleySize = 1+Math.min(2,correct); player.laserTotal = player.volleySize*2; }
    for (const enemy of enemies) {
      enemy.setDx((enemy.getDx()<0?-1:1)*enemy.baseSpeed*(1+pressure*0.06));
      enemy.bulletSpeed = 6+pressure*0.3;
      enemy.shotFreq = Math.max(100,Math.round(enemy.baseShotFreq/(1+pressure*0.05)));
      enemy.shotFrame = 0;
    }
  }
  function reset() { state='';current=null;chosen=-1;remaining=[];pressure=0;correct=0;applyDifficulty(); }
  function begin() {
    if (state) return;
    pressure=Math.min(4,pressure+1);applyDifficulty();
    if (!remaining.length) remaining=shuffle(IOT_MISSIONS.flatMap(category=>category.decisions.map(question=>({...question,category:category.title}))));
    current={...remaining.pop()};current.options=shuffle(current.options);chosen=-1;
    player.clearLasers();enemies.forEach(enemy=>enemy.clearLasers());activeKey=-1;gamePaused=true;state='question';
  }
  function answer(index) {
    if (state!=='question') return;
    chosen=index;
    if (current.options[index][1]) { score+=100;correct++;pressure=Math.max(-2,pressure-1); }
    else pressure=Math.min(4,pressure+1);
    applyDifficulty();state='explanation';
  }
  function resume() {
    state='';gamePaused=false;gamePausedDelay=0;activeKey=-1;
    player.clearLasers();enemies.forEach(enemy=>enemy.clearLasers());
    player.setX(canvas.width/2-25);player.explodingTick=0;
    player.srcX=player.ogSrcX;player.srcY=player.ogSrcY;player.srcWidth=player.ogSrcWidth;player.srcHeight=player.ogSrcHeight;
  }
  function handleKey(event) {
    if (!state) return false;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Enter','Digit1','Digit2','Digit3','Digit4','Numpad1','Numpad2','Numpad3','Numpad4'].includes(event.code)) event.preventDefault();
    if (event.repeat) return true;
    const match=/^(?:Digit|Numpad)([1-4])$/.exec(event.code);
    if (state==='question' && match) answer(Number(match[1])-1);
    else if (state==='explanation' && (match||['Space','Enter'].includes(event.code))) resume();
    return true;
  }
  function wrap(text,y,size=19,color='white') {
    context.font=size+'px monospace';context.fillStyle=color;
    let line='';
    for(const word of text.split(' ')) {
      if(context.measureText(line+word).width>590 && line){context.fillText(line.trim(),48,y);y+=size+7;line='';}
      line+=word+' ';
    }
    context.fillText(line.trim(),48,y);return y+size+7;
  }
  function draw() {
    context.fillStyle='black';context.fillRect(24,85,652,450);context.strokeStyle='white';context.strokeRect(24,85,652,450);
    let y=wrap(current.category,118,21,'#f2bb05');
    if(state==='question') {
      y=wrap('You were shot. Lives remaining: '+player.getLives(),y+8,18);
      y=wrap(current.prompt,y+18,20);
      current.options.forEach((option,i)=>y=wrap((i+1)+'. '+option[0],y+12,18));
      context.font='18px monospace';context.fillStyle='#f2bb05';context.fillText('Choose an answer: 1 / 2 / 3 / 4',48,515);
    } else {
      const option=current.options[chosen],best=current.options.find(o=>o[1]);
      y=wrap(option[1]?'Correct! +100 points':'Incorrect answer',y+12,22,option[1]?'#f2bb05':'white');
      y=wrap('Why this matters: '+option[2],y+16,18);
      if(!option[1]) y=wrap('Correct choice: '+best[0]+'. '+best[2],y+12,18);
      wrap('Laser volley: '+player.volleySize+' | Pressure: '+pressure,y+16,18,'#f2bb05');
      context.font='17px monospace';context.fillStyle='white';context.fillText(gameOver?'Press 1-4 to continue to Game Over':'Press 1-4 to return to shooting',48,515);
    }
  }
  return {reset,begin,applyDifficulty,handleKey,draw,get active(){return !!state;},get phase(){return state;},get question(){return current;},get pressure(){return pressure;}};
})();
