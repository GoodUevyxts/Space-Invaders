/* New scenes wrap the original shooter. GamePiece/Character/Player/Enemy remain in script.js. */
window.IOT_CAMPAIGN = (() => {
  const C = { phase: 'title', tab: 0, selected: 0, completed: 0, reviews: [], m: null };
  const tabs = ['Brief', 'Kanban', 'Risks', 'Security'];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  function say(title, message, next) {
    C.phase = 'feedback'; C.message = { title, message, next };
  }
  function startMission() {
    C.tab = 0; C.selected = 0; C.phase = 'plan';
    const source = IOT_MISSIONS[level - 1];
    C.m = {
      source, budget: level <= 3 ? 1400 : 1200, spent: 0, hours: 0, teamLimit: 18, deadline: 12 + level % 3,
      battleFrames: 0, safe: 0, answered: new Map(), required: 3, event: null,
      questions: shuffle(source.decisions).map(q => ({ ...q, options: shuffle(q.options) })),
      tasks: [
        { name: 'Design device policy', cost: 180, hours: 2, state: 0 },
        { name: 'Implement controls', cost: 280, hours: 3, state: 0 },
        { name: 'Test allowed and denied paths', cost: 220, hours: 3, state: 0 }
      ],
      risks: [
        { name: source.risk, likelihood: 4, impact: 5, initial: 20, choice: null, cost: 180 },
        { name: 'Delivery delay leaves a rushed deployment.', likelihood: 3, impact: 4, initial: 12, choice: null, cost: 120 }
      ]
    };
  }
  function start() {
    gameOver = false; gameWon = false; gameStart = true;
    gamePaused = false; gamePausedDelay = 0; nextLevelDelay = 0; moveDownNextTick = false;
    init(); C.completed = 0; C.reviews = []; startMission();
  }
  function affordable(cost, hours) {
    return C.m.spent + cost <= C.m.budget && C.m.hours + hours <= C.m.teamLimit;
  }
  function spend(cost, hours) { C.m.spent += cost; C.m.hours += hours; }
  function remainingRisk() {
    return Math.max(0, C.m.risks.reduce((sum, r) => sum + r.likelihood * r.impact, 0) + (C.m.answered.size - C.m.safe) * 3 - C.m.safe * 2);
  }
  function question(returnTo = 'battle') {
    const index = C.m.questions.findIndex((_, i) => !C.m.answered.has(i));
    C.questionIndex = index < 0 ? Math.floor(Math.random() * C.m.questions.length) : index;
    C.returnTo = returnTo; C.phase = 'question'; C.selected = 0;
  }
  function answer(index) {
    const m = C.m, q = m.questions[C.questionIndex], option = q.options[index];
    if (!option) return;
    const fresh = !m.answered.has(C.questionIndex);
    if (fresh) { m.answered.set(C.questionIndex, option[1]); if (option[1]) m.safe++; }
    const next = () => {
      if (C.returnTo === 'review') {
        if (m.answered.size < m.required) question('review'); else finishReview(false);
      } else if (C.returnTo === 'final') {
        if (m.answered.size < m.required) question('final'); else finishReview(true);
      } else if (C.returnTo === 'battle') resumeBattle();
      else C.phase = 'plan';
    };
    const effect = fresh
      ? (option[1] ? 'Secure decision recorded: threat pressure falls.' : 'Risky decision recorded: threat pressure increases.')
      : 'Practice answer: the original result stays recorded.';
    const correct = q.options.find(o => o[1]);
    const explanation = option[1] ? option[2] : option[2] + '\n\nBetter choice: ' + correct[0] + '. ' + correct[2];
    say(option[1] ? 'Correct decision' : 'Risky decision', explanation + '\n\n' + effect, next);
  }
  function changeTask() {
    const task = C.m.tasks[C.selected];
    if (task.state === 2) {
      say('Task complete', 'Completed tasks provide evidence that the control was delivered and tested.', () => C.phase = 'plan');
    } else if (task.state === 0) {
      if (C.m.tasks.some(t => t.state === 1)) {
        say('Team busy', 'The team has a work-in-progress limit of one. Finish or return the current task before starting another.', () => C.phase = 'plan');
      } else {
        task.state = 1;
        say('Task started', 'Limiting work in progress helps the team finish useful work before starting more tasks.', () => C.phase = 'plan');
      }
    } else if (affordable(task.cost, task.hours)) {
      spend(task.cost, task.hours); task.state = 2;
      say('Task delivered', 'This work uses finite team time and money. Leaving capacity for testing and incidents reduces delivery risk.', () => C.phase = 'plan');
    } else {
      say('Capacity limit', 'This task exceeds the remaining budget or team hours. Return it with B or launch with the delivery risk recorded.', () => C.phase = 'plan');
    }
  }
  function risk(mitigate) {
    const r = C.m.risks[C.selected];
    if (r.choice === 'mitigate') {
      say('Mitigation in place', 'Mitigation has already consumed resources and reduced this risk; it cannot be refunded.', () => C.phase = 'plan');
      return;
    }
    if (mitigate && !affordable(r.cost, 2)) {
      say('Mitigation unavailable', 'There is not enough budget or team time. You can explicitly accept the remaining risk with B.', () => C.phase = 'plan');
      return;
    }
    r.choice = mitigate ? 'mitigate' : 'accept';
    if (mitigate) { spend(r.cost, 2); r.likelihood = 1; }
    say(mitigate ? 'Risk mitigated' : 'Risk accepted', mitigate
      ? 'Spending effort on a control lowers likelihood. Impact remains the same if the incident still happens.'
      : 'Acceptance saves resources but keeps the likelihood x impact exposure. Accepted risk remains visible in the review.', () => C.phase = 'plan');
  }
  function launch() {
    if (C.m.risks.some(r => !r.choice)) {
      say('Risk decision needed', 'Choose mitigate or accept for both risks before deployment. Explicit ownership prevents risks being silently ignored.', () => { C.phase = 'plan'; C.tab = 2; C.selected = 0; });
      return;
    }
    if (!C.m.event) {
      C.m.event = shuffle(['scope', 'cut', 'incident', 'stable'])[0];
      C.phase = 'event'; return;
    }
    resumeBattle();
  }
  function eventAction(index) {
    const m = C.m;
    if (m.event === 'scope') {
      if (index === 0) {
        if (!affordable(160, 2)) {
          say('Scope does not fit', 'The added work exceeds capacity. Defer it with B and preserve the agreed scope.', () => C.phase = 'event'); return;
        }
        spend(160, 2);
        m.risks[1].likelihood = Math.max(1, m.risks[1].likelihood - 1);
      }
      say('Scope change', index === 0
        ? 'The added monitoring work consumes money and team time, but lowers delivery uncertainty.'
        : 'Deferring extra scope protects the agreed budget and deadline. The original objectives still apply.', resumeBattle);
    } else if (m.event === 'cut') {
      m.budget = Math.max(m.spent, m.budget - 240);
      if (index === 0) m.deadline += 2;
      else m.risks[1].likelihood = Math.min(5, m.risks[1].likelihood + 1);
      say('Budget cut', index === 0
        ? 'The budget fell. Agreeing a later deadline makes the cost/schedule tradeoff explicit.'
        : 'Keeping the original deadline after a cut increases delivery risk.', resumeBattle);
    } else if (m.event === 'incident') {
      if (index === 0 && !affordable(160, 2)) {
        say('Response does not fit', 'There is insufficient response capacity. B records acceptance of the increased incident risk.', () => C.phase = 'event'); return;
      }
      if (index === 0) { spend(160, 2); m.risks[0].likelihood = 1; }
      else m.risks[0].likelihood = Math.min(5, m.risks[0].likelihood + 1);
      say('Incident response', index === 0
        ? 'Investigating and containing the alert costs resources, but reduces the chance of a wider incident.'
        : 'Proceeding without investigation keeps resources available but increases security exposure.', resumeBattle);
    } else {
      say('No disruption', 'A quiet delivery window leaves contingency available. Keeping a reserve helps when later levels encounter incidents.', resumeBattle);
    }
  }
  function resumeBattle() {
    gamePaused = false; gamePausedDelay = 0; activeKey = -1;
    player.clearLasers(); enemies.forEach(e => e.clearLasers());
    // Delivering controls/testing and making secure choices has a visible shooter effect.
    const done = C.m.tasks.filter(t => t.state === 2).length;
    player.laserTotal = done >= 2 ? 3 : 2;
    const exposure = remainingRisk();
    enemies.forEach(e => e.bulletSpeed = exposure <= 12 ? 4 : exposure > 30 ? 7 : 6);
    C.phase = 'battle';
  }
  function loss() {
    if (C.phase !== 'battle') return;
    player.clearLasers(); enemies.forEach(e => e.clearLasers());
    if (gameOver) question('final'); else question('battle');
  }
  function cleared() {
    if (C.phase !== 'battle') return;
    if (C.m.answered.size < C.m.required) question('review'); else finishReview(false);
  }
  function finishReview(failed) {
    const m = C.m;
    if (m.reviewed) return;
    m.reviewed = true;
    const done = m.tasks.filter(t => t.state === 2).length;
    const duration = m.hours + Math.ceil(m.battleFrames / 900);
    const onTime = duration <= m.deadline;
    const reduced = 32 - remainingRisk();
    const bonus = failed ? 0 : 100 * Math.min(3, m.safe) + done * 100 + (reduced > 0 && onTime ? 100 : 0);
    score += bonus;
    if (!failed) {
      C.completed++;
      if (m.safe >= 3) player.setLives(Math.min(5, player.getLives() + 1));
    }
    C.review = { failed, done, duration, onTime, reduced, bonus, level, spent: m.spent, budget: m.budget };
    C.reviews.push(C.review); C.phase = 'review';
  }
  function nameEntry() {
    C.phase = 'name'; C.name = ''; C.letter = 0; C.saving = false; C.error = '';
  }
  async function submit() {
    if (C.saving) return;
    if (C.name.length < 3) { C.error = 'Confirm at least 3 characters with A.'; return; }
    C.saving = true;
    try {
      await IOT_LEADERBOARD.save(C.name, score, C.completed);
      C.phase = 'leaderboard';
    } catch (error) { C.error = 'NOT SAVED: ' + error.message; }
    finally { C.saving = false; }
  }
  function input(key) {
    if (C.phase === 'title') {
      if (key === 'a' || key === 'y') start();
      else if (key === 'x') { C.phase = 'leaderboard'; void IOT_LEADERBOARD.flush(); }
    } else if (C.phase === 'feedback') {
      if (key === 'a' || key === 'y') C.message.next();
    } else if (C.phase === 'question') {
      if (key === 'up' || key === 'left') C.selected = (C.selected + 3) % 4;
      else if (key === 'down' || key === 'right') C.selected = (C.selected + 1) % 4;
      else if (['a','b','x','y'].includes(key)) answer(['a','b','x','y'].indexOf(key));
    } else if (C.phase === 'event') {
      if (key === 'a' || key === 'b') eventAction(key === 'a' ? 0 : 1);
    } else if (C.phase === 'plan') {
      if (key === 'left' || key === 'right' || key === 'x') {
        C.tab = (C.tab + (key === 'left' ? 3 : 1)) % 4; C.selected = 0;
      } else if (key === 'up' || key === 'down') {
        const length = C.tab === 1 ? C.m.tasks.length : C.tab === 2 ? 2 : 1;
        C.selected = (C.selected + (key === 'up' ? length - 1 : 1)) % length;
      } else if (key === 'y') launch();
      else if (C.tab === 1 && key === 'a') changeTask();
      else if (C.tab === 1 && key === 'b') {
        const t = C.m.tasks[C.selected];
        if (t.state === 1) {
          t.state = 0;
          say('Task returned', 'Returning unfinished work frees the team to prioritise another task. Undelivered work still carries delivery risk.', () => C.phase = 'plan');
        }
      } else if (C.tab === 2 && ['a','b'].includes(key)) risk(key === 'a');
      else if (C.tab === 3 && key === 'a') question('plan');
    } else if (C.phase === 'battle') {
      if (key === 'a' && !gamePaused && !gameOver) player.addLaser();
      else if (key === 'x') { C.phase = 'pause'; activeKey = -1; }
    } else if (C.phase === 'pause') {
      if (key === 'a' || key === 'x') C.phase = 'battle';
    } else if (C.phase === 'review' && (key === 'a' || key === 'y')) {
      if (C.review.failed || level === 10) { gameWon = !C.review.failed; nameEntry(); }
      else {
        level++; nextLevelDelay = 0; moveDownNextTick = false; audioTick = 0;
        levels[level - 1](); player.clearLasers(); player.setX(canvas.width / 2 - 25); startMission();
      }
    } else if (C.phase === 'name' && !C.saving) {
      if (['up','right'].includes(key)) C.letter = (C.letter + 1) % alphabet.length;
      else if (['down','left'].includes(key)) C.letter = (C.letter + alphabet.length - 1) % alphabet.length;
      else if (key === 'a' && C.name.length < 8) { C.name += alphabet[C.letter]; C.error = ''; }
      else if (key === 'b') C.name = C.name.slice(0,-1);
      else if (key === 'y') void submit();
    } else if (C.phase === 'leaderboard') {
      if (key === 'a' || key === 'y') start();
      else if (key === 'b') void IOT_LEADERBOARD.flush();
    }
  }
  function line(text, x, y, color = 'white', size = 20) {
    context.font = size + 'px monospace'; context.fillStyle = color; context.fillText(text, x, y);
  }
  function wrap(text, y, color = 'white', size = 20, width = 630, x = 34) {
    context.font = size + 'px monospace'; context.fillStyle = color;
    for (const paragraph of text.split('\n')) {
      let current = '';
      for (const word of paragraph.split(' ')) {
        if (context.measureText(current + word).width > width && current) {
          context.fillText(current.trim(), x, y); y += size + 7; current = '';
        }
        current += word + ' ';
      }
      context.fillText(current.trim(), x, y); y += size + 7;
    }
    return y;
  }
  function page(title, footer) {
    drawBackground();
    line(title, 28, 40, '#f2bb05', 26);
    context.strokeStyle = 'white'; context.strokeRect(16, 58, 668, 480);
    line(footer, 24, 570, '#f0f0c9', 17);
  }
  function draw() {
    const m = C.m;
    if (C.phase === 'battle') {
      line('L' + level + ' ' + m.source.title + ' | C: pause', 20, 76, '#f2bb05', 16); return;
    }
    if (C.phase === 'title') {
      page('SPACE INVADERS: IoT DEFENCE', 'A / D: start     C: top 10');
      let y = wrap('Your original ship, invaders, lasers and lives. Ten IoT security missions.', 110);
      y = wrap('Stick: arrow keys\nA: fire / confirm\nB: back / accept risk\nC: planning tab / pause\nD: launch / submit', y + 20);
      wrap('Questions after a lost life: A / B / C / D select answers 1 / 2 / 3 / 4.', y + 20, '#f2bb05');
    } else if (C.phase === 'plan') {
      page('L' + level + ': ' + m.source.title, 'Stick: move/tab  A/B: act  C: tab  D: launch');
      line(tabs.map((t,i) => i === C.tab ? '['+t+']' : t).join('  '), 30, 91, '#f2bb05', 18);
      line('Budget $' + (m.budget-m.spent) + '  Team ' + (m.teamLimit-m.hours) + 'h  Due ' + m.deadline + 'h', 30, 125, 'white', 18);
      if (C.tab === 0) {
        let y = wrap('Objective: ' + m.source.objective, 175);
        y = wrap('Deliver policy, implementation and tests. Plan team time and record both risks before launch.', y + 15);
        y = wrap('Deadline includes team work plus one simulated hour per 15 seconds of combat. Menus pause the clock.', y + 15);
        wrap('Secure answers and mitigations slow enemy shots. Completed tasks can add a third laser.', y + 15, '#f0f0c9');
      } else if (C.tab === 1) {
        line('To Do  >  Doing  >  Done    (Doing limit: 1)', 30, 175, '#f0f0c9', 18);
        m.tasks.forEach((t,i) => {
          const y = 225 + i * 85;
          line((C.selected===i?'> ':'  ') + t.name, 28, y, C.selected===i?'#f2bb05':'white', 18);
          line('  ' + ['To Do','Doing','Done'][t.state] + ' | $' + t.cost + ' | ' + t.hours + ' team hours', 28, y+28, 'white', 18);
        });
        wrap('A: start/complete   B: return Doing task\nCosts are charged on completion. Unfinished tasks earn no delivery bonus.', 465, '#f0f0c9', 17);
      } else if (C.tab === 2) {
        const r = m.risks[C.selected];
        let y = wrap('Risk '+(C.selected+1)+'/2: ' + r.name, 180);
        y = wrap('Likelihood '+r.likelihood+' x Impact '+r.impact+' = '+(r.likelihood*r.impact)+' (was '+r.initial+')', y+15, '#f2bb05');
        y = wrap('Decision: '+(r.choice||'UNDECIDED'), y+15);
        wrap('A: mitigate for $'+r.cost+' and 2h\nB: accept for $0 and 0h\nStick up/down: choose risk', y+25);
      } else {
        let y = wrap('Question bank: 6 for this criterion. At least 3 decisions per mission.', 180);
        y = wrap('Answered: '+m.answered.size+' / 6\nSecure answers: '+m.safe, y+20, '#f2bb05');
        wrap('A: practise a configuration decision now. You will also answer after losing a life and before the wave review.', y+25);
      }
    } else if (C.phase === 'question') {
      page('L'+level+': '+m.source.title, 'A = 1     B = 2     C = 3     D = 4');
      const q = m.questions[C.questionIndex];
      let y = wrap(q.prompt, 102, '#f2bb05', 21);
      q.options.forEach((option,i) => {
        y = wrap((C.selected === i ? '> ' : '  ') + (i+1)+'. '+option[0], y+16, 'white', 19);
      });
    } else if (C.phase === 'feedback') {
      page(C.message.title, 'A / D: continue');
      line('WHY THIS MATTERS', 34, 112, '#f2bb05', 21);
      wrap(C.message.message, 158);
    } else if (C.phase === 'event') {
      page('Project event', 'A: first option     B: second option');
      const events = {
        scope: 'Scope change: supplier requests more monitoring.\n\nA: deliver extra work ($160 / 2h)\nB: defer to a future release',
        cut: 'Budget cut: available funding falls by $240, down to the amount already spent.\n\nA: renegotiate deadline (+2h)\nB: keep deadline (+delivery risk)',
        incident: 'Incident: suspicious device activity reported.\n\nA: investigate and contain ($160 / 2h)\nB: accept increased incident risk',
        stable: 'No disruption this time.\n\nA / B: preserve contingency and launch'
      };
      wrap(events[m.event], 115);
    } else if (C.phase === 'pause') {
      page('Mission paused', 'A / C: resume');
      wrap('Score '+score+'  Lives '+player.getLives()+'\n\nTeam hours: '+m.hours+' / '+m.teamLimit+'\nBudget spent: $'+m.spent+' / $'+m.budget+'\nCurrent risk exposure: '+remainingRisk(), 120);
    } else if (C.phase === 'review') {
      const r = C.review;
      page(r.failed ? 'Mission ended: review' : 'Mission complete: review', 'A / D: continue');
      wrap('Budget spent: $'+r.spent+' / $'+r.budget+'\nTasks Done: '+r.done+' / 3\nDelivery time: '+r.duration+'h / '+m.deadline+'h\nDeadline: '+(r.onTime?'MET':'MISSED')+'\nRisk reduced: '+r.reduced+' points\nSecurity answers: '+m.safe+' / '+m.answered.size+'\nReview bonus: '+r.bonus+'\nTotal score: '+score, 110);
      wrap('Secure answers reduce exposure by 2; unsafe ones add 3. A negative reduction means exposure rose.', 430, '#f0f0c9', 18);
    } else if (C.phase === 'name') {
      page(gameWon ? 'YOU WIN! Enter arcade name' : 'GAME OVER: enter arcade name', 'Stick: letter  A: add  B: erase  D: submit');
      wrap('Score: '+score+'\nMissions cleared: '+C.completed+' / 10\n\nName: '+C.name+'_'+ '\nNext character: [ '+alphabet[C.letter]+' ]\n\nUse 3-8 letters/numbers.', 112);
      if (C.error) wrap(C.error, 420, '#f2bb05');
      if (C.saving) line('Saving locally...', 34, 490, '#f2bb05');
    } else if (C.phase === 'leaderboard') {
      const board = IOT_LEADERBOARD.snapshot();
      page('IoT ARCADE: TOP 10', 'A / D: new game     B: retry upload');
      if (!board.top.length) wrap('No cached leaderboard yet. Your queued scores stay on this Pi.', 105);
      board.top.forEach((row,i) => line(String(i+1).padStart(2)+'  '+row.name.padEnd(8)+'  '+row.score, 55, 100+i*32, 'white', 21));
      wrap(board.status+'\nLocal pending: '+board.pending, 455, '#f2bb05', 17);
    }
  }
  return { state: C, start, input, draw, loss, cleared, startMission, question,
    tick() { if (C.phase === 'battle') C.m.battleFrames++; } };
})();
