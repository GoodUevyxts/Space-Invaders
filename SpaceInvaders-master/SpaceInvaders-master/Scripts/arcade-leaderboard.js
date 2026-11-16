/* Optional score saving from the original end screen. Never interrupts shooting. */
window.ARCADE_BOARD = (() => {
  let state='',name='',letter=0,saving=false,error='';
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function handleKey(event){
    if(!state){
      if(gameStart&&(gameOver||gameWon)&&!DEATH_QUIZ.active&&['Digit3','Numpad3'].includes(event.code)&&!event.repeat){event.preventDefault();state='name';name='';letter=0;error='';return true;}
      return false;
    }
    event.preventDefault();if(event.repeat||saving)return true;
    const code=event.code;
    if(state==='name'){
      if(['ArrowUp','ArrowRight'].includes(code))letter=(letter+1)%alphabet.length;
      else if(['ArrowDown','ArrowLeft'].includes(code))letter=(letter+alphabet.length-1)%alphabet.length;
      else if(['Digit1','Numpad1'].includes(code)&&name.length<8)name+=alphabet[letter];
      else if(['Digit2','Numpad2'].includes(code))name=name.slice(0,-1);
      else if(['Digit4','Numpad4','Enter'].includes(code)){
        if(name.length<3){error='Add at least 3 characters.';return true;}
        saving=true;IOT_LEADERBOARD.save(name,score,levelsCleared).then(()=>state='top').catch(e=>error='NOT SAVED: '+e.message).finally(()=>saving=false);
      }else if(['Digit3','Numpad3','Escape'].includes(code))state='';
    }else if(['Digit4','Numpad4','Escape','Enter'].includes(code))state='';
    else if(['Digit2','Numpad2'].includes(code))void IOT_LEADERBOARD.flush();
    return true;
  }
  function draw(){
    if(!state)return false;
    drawBackground();context.fillStyle='white';context.font='23px monospace';
    context.fillText(state==='name'?'SAVE YOUR SCORE':'TOP 10',40,60);
    context.font='20px monospace';
    if(state==='name'){
      ['Score: '+score,'Name: '+name+'_','Selected character: '+alphabet[letter],'Stick: character | 1: add | 2: erase','4: submit | 3: back',error].forEach((line,i)=>context.fillText(line,40,135+i*55));
    }else{
      const board=IOT_LEADERBOARD.snapshot();
      board.top.forEach((row,i)=>context.fillText((i+1)+'. '+row.name+'  '+row.score,40,105+i*32));
      context.font='15px monospace';context.fillText(board.status,30,480);context.fillText('Pending: '+board.pending+' | 2: retry | 4: back',30,520);
    }
    return true;
  }
  return {handleKey,draw};
})();
