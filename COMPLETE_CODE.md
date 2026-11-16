# Complete copy-and-paste files

Each heading is a path relative to the repository root. Replace changed files in full and create added files at the shown paths. Keep the original runtime assets and unchanged scripts. See GAME_UPGRADE.md for installation, controls, Render settings and Worker secret setup. No GitHub token is included.

## .gitignore

```text
node_modules/
.wrangler/
.dev.vars
.env
.env.*
!.env.example
.DS_Store
```

## GAME_UPGRADE.md

````markdown
# Space Invaders IoT upgrade

This extends commit `df21dc9f46b9453034a17720494ddfab846faa1a` of GoodUevyxts/Space-Invaders. The original Player, Enemy, Character, GamePiece and Laser classes, sprites, sound effects, movement, shooting, hit scoring, five starting lives and first three wave constructors remain. Seven more waves reuse the original enemy factory. Security and project scenes surround those waves. None of the ten security criteria existed in the supplied repository, so all ten are additions. The original repository contains no question-after-death code or older question bank; these additions cannot preserve questions that were not present there.

## Exact repository changes

The existing game directory is `SpaceInvaders-master/SpaceInvaders-master/` (called GAME below).

| Action | Path | Purpose |
|---|---|---|
| Change | GAME/index.html | Loads additions around the existing scripts and canvases |
| Change | GAME/Scripts/script.js | Preserves original shooter; integrates scene flow, ten waves and input router; fixes cleared-laser collisions and laser cleanup |
| Change | GAME/Styles/main.css | Fits the original 700x600 canvas on a 7-inch screen; fixes font naming |
| Add | GAME/Scripts/config.js | Public endpoint and configurable A/B/C/D mappings |
| Add | GAME/Scripts/controls.js | Keyboard emulation and optional Gamepad fallback |
| Add | GAME/Scripts/missions.js | Ten criteria and 20 base questions |
| Add | GAME/Scripts/question-bank.js | 40 additional questions, four answers each |
| Add | GAME/Scripts/campaign.js | Briefs, Kanban, risk register, events, questions, reviews, name entry |
| Add | GAME/Scripts/leaderboard.js | IndexedDB score outbox, cached top ten and automatic retries |
| Add | serverless/src/worker.js | Validated submission and GitHub commits, with serialized writes |
| Add | serverless/package.json | Worker commands and dependencies |
| Add | serverless/package-lock.json | Reproducible Worker dependencies |
| Add | serverless/wrangler.toml | Cloudflare configuration; public settings only |
| Add | leaderboard.json | Initial empty board; copy to the dedicated scores branch |
| Add | tests/worker.test.mjs | Validation, retry, conflict, rate and ranking checks |
| Add | tests/browser.cjs | Browser flow and offline persistence checks |
| Add | .gitignore | Excludes local secrets and dependencies |
| Add | GAME_UPGRADE.md | This guide |

Keep the existing `Scripts/background.js`, `Images/`, `sounds/`, `fonts/`, `error.html`, existing README files and other assets. Keep the MIT licence; a copy is included at the repository root because it accompanied the supplied files. The download archive includes original runtime assets too.

## Software to install

On the Pi, use Raspberry Pi OS with Chromium and Python 3. No Node, npm, AI service, MCP, GitHub token or new controller driver is needed for the game. On Raspberry Pi OS versions with those package names:

```sh
sudo apt update
sudo apt install chromium python3 git
```

Keep your existing controller-to-keyboard setup. JoyToKey is a Windows application; if your current setup runs it on a separate machine, under a compatibility layer or through another mapper on the Pi, preserve that working arrangement. The game consumes the resulting keyboard events. Installing JoyToKey natively on Raspberry Pi OS is not part of this upgrade.

Serve the local game on a stable origin so saved scores persist between launches:

```sh
cd Space-Invaders/SpaceInvaders-master/SpaceInvaders-master
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000` in Chromium. For kiosk use, run in another terminal:

```sh
chromium --kiosk http://localhost:8000
```

Use `localhost` consistently: `localhost`, `127.0.0.1`, different ports and Render are different browser storage origins. Do not use `file://`, Incognito, or clear site data if you want queued scores to survive. Serve only the game directory on the Pi, not the repository root or serverless folder. Local static files support offline play; a Render page needs an internet connection for its initial load. This version does not add a service worker.

For Worker setup on a development computer, install a current supported Node LTS (Node 22.12+ or Node 24), npm, and have a Cloudflare account. Wrangler is installed as a project dependency below. Cloudflare account availability and any plan limits must support a SQLite-backed Durable Object. You do not need to install this tooling on the Pi.

## Controller mapping

Your stick emits all four arrow keys. Your four buttons emit letters A, B, C and D. Configure uppercase/lowercase normally in the mapper: the game uses physical browser codes `KeyA` through `KeyD`.

| Screen | Stick | A | B | C | D |
|---|---|---|---|---|---|
| Title | — | Start | — | Top ten | Start |
| Planning | Up/down selects; left/right changes tab | Start/complete task, mitigate risk or practise question | Return Doing task / accept selected risk | Next tab | Launch |
| Question | Highlight an answer | Answer 1 | Answer 2 | Answer 3 | Answer 4 |
| Explanation | — | Continue | — | — | Continue |
| Event | — | First response | Second response | — | — |
| Shooter | Left/right moves | Shoot | — | Pause | — |
| Pause | — | Resume | — | Resume | — |
| Review | — | Continue | — | — | Continue |
| Name entry | Cycle character | Add character | Delete character | — | Submit |
| Top ten | — | New game | Retry uploads | — | New game |

Space remains a fire/confirm alias for A; Enter remains a start/continue/submit alias for D; Escape aliases B. On a question screen those aliases also choose their numbered answer. Arrows highlight for orientation, but the four answer buttons select directly, as requested. No mouse or touch is needed. Change the key arrays in `Scripts/config.js` if your emitted keys differ. Optional browser Gamepad input is provided, but keyboard emulation is the intended setup. Avoid enabling two mappers for the same controller simultaneously.

## Gameplay and project management

Each mission starts with an objective, budget ($1,400 on missions 1-3, $1,200 thereafter), team capacity (18 hours), and deadline (12-14 simulated hours). The Kanban board has To Do, Doing and Done states and a Doing limit of one. Starting a task places it in Doing; completing it spends its stated money and hours. B returns a Doing task to To Do. Completion cannot exceed capacity. Two completed tasks increase the player's simultaneous laser limit from two to three. Undelivered tasks remain visible and earn no review bonus.

Two risk entries start at likelihood x impact: 4x5=20 and 3x4=12. A mitigation costs money and two hours, lowers likelihood to one, and leaves impact unchanged. B explicitly accepts the exposure. Both risks must be decided before launch; you can launch with accepted risk or unfinished tasks. There is a short explanation after every consequential task, security, risk and event decision.

Each mission draws one random event at launch: added scope, a budget cut, a security incident, or a quiet window. A/B responses trade scope, money, deadline and risk. A budget cut cannot retroactively remove money already spent. There is no real-money spending.

Each criterion has six distinct questions (60 total); question order and four answer positions are shuffled every mission. Questions appear after losing a life, including the final life. At least three different questions must be answered before the mission review, so clearing a wave without being hit still covers the criterion. The Security planning tab also offers questions. A secure answer reduces exposure by two points (with total exposure floored at zero). A wrong answer remains recorded and adds three exposure points; the explanation teaches the correct principle. Once all six are answered, later life losses use practice questions without changing the original recorded result. This prevents farming repeated questions for bonuses.

Lower exposure slows enemy bullets (4/6/7 pixels per original simulation tick). Normal enemy speed is retained for waves 1-3 and rises gently, with a cap, for waves 4-10. Menus and questions pause all combat and its clock. Shooter simulation runs at 60 ticks/second, preserving its frame-based movement across display refresh rates. Menus do not need a time limit on the small screen.

Review shows actual spending, tasks delivered, deadline met/missed and change in risk. Time is completed task/mitigation/event effort plus one simulated hour per 15 seconds of active combat. Security questions do not consume team hours. Risk reduction is the initial 32 exposure points minus current exposure, including security-answer reductions and wrong-answer additions. A negative reduction means risk increased. Deadline performance is assessed even on a failed mission; failure itself is shown separately.

Original scoring remains +100 per enemy hit and -1,100 per lost life. A cleared wave adds up to 700: 100 each for the first three secure answers, 100 per delivered task, and 100 when risk fell and the deadline was met. A failed wave earns no review bonus. Three secure answers restore one life after a cleared wave, capped at five. The maximum full-campaign score is 53,500. On failure or victory, enter a 3-8 character arcade name using the stick and A, then submit with D.

## GitHub leaderboard and Cloudflare Worker

No GitHub credential belongs in the game, Pi files, Render static-site variables, repository, `config.js`, or browser storage. Only the public Worker URL belongs in the game. The Worker must be deployed separately from the Render frontend.

1. Create a dedicated `scores` branch in `GoodUevyxts/Space-Invaders`. Put the supplied root `leaderboard.json` there. Keep score commits off the branch that Render deploys; this avoids redeploying the game after every score. `GITHUB_PATH` is `leaderboard.json` at repository root, **not** the nested game directory. If a scores branch was included with the delivered change, use that existing branch.
2. In GitHub's fine-grained personal access token settings, create a token limited to this repository, with **Contents: read and write**. Set an appropriate expiry and renewal reminder. A GitHub App installation token can also be used if you implement its renewal separately. This implementation reads the configured secret as a token; it does not renew expiring tokens.
3. On the development computer, configure and deploy:

```sh
cd Space-Invaders/serverless
npm ci
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
```

Paste the token only at that secret prompt. Do not place it in a shell command, chat, source file or the Pi. The secret is stored by Cloudflare. Do not commit `.dev.vars`.

4. Edit `serverless/wrangler.toml`: keep the repository, scores branch and root path correct. Add the exact Render origin to `ALLOWED_ORIGINS`, for example `https://YOUR-GAME.onrender.com`. Separate origins with commas; no paths or trailing slashes. The two local port-8000 origins are already listed. Preview origins must be added explicitly if used.
5. Validate and deploy:

```sh
npm test
npm run check
npm run deploy
```

6. Set `GAME/Scripts/config.js` `leaderboardUrl` to the resulting HTTPS Worker URL. Commit that public URL and redeploy the game. No client secret is required.

The Worker limits POST bodies to 1,024 bytes; usernames to `[A-Z0-9]{3,8}`; IDs to canonical version-4 UUIDs; builds to `iot-v1`; and mission counts to 0-10. Scores must be integers divisible by 100 within the campaign's maximum for the submitted cleared-wave count, with a lower bound of -20,000. Server timestamps are generated on receipt.

A single Durable Object serializes board operations. GitHub writes include the current blob SHA and retry conflicts up to three times. The submission UUID is stored in the JSON entry: retries return the original acknowledgement rather than creating another score. Reusing an ID for different data is rejected. An IP-based 30 requests/minute limit includes reads and writes. CORS restricts browser origins. Neither CORS nor numeric validation proves that someone played honestly: this is an educational arcade leaderboard, not a cheat-proof competition. A public client can fabricate a plausible score. Competitive anti-cheat needs server-authoritative play or separately verified trusted results; no secret stored on a Pi could fix that.

The JSON schema is `{ "version": 1, "entries": [...] }`. All accepted entries are retained up to 2,000 so duplicate IDs remain detectable; the game displays only the sorted top ten. On reaching capacity, the Worker returns a retryable 503 and scores remain on the Pi. Before capacity is reached, an operator should archive the board and deliberately migrate to a new season/build/branch; do not silently truncate entries, which would remove retry deduplication. Do not manually remove IDs while old Pi queues might retry them. An already accepted retry can still be acknowledged at capacity.

GitHub failures, expired tokens, rate limits, Worker failures or offline networking leave scores in IndexedDB. The client saves a score transactionally before any POST and removes it only after an acknowledgement containing the matching ID. It retries at startup, when networking returns, every 60 seconds and with B on the leaderboard. Failed 400/409/413/422 submissions remain locally marked for operator investigation; they are not endlessly resent. Server-unavailable and 429 responses retry later. The cached top ten is shown offline. Clearing browser storage, using an ephemeral kiosk profile, changing origins or SD-card loss can remove local data; keep a persistent Chromium profile. A storage failure shows NOT SAVED and leaves name entry available to retry.

## Updating questions on Render

Edit `GAME/Scripts/missions.js` or `GAME/Scripts/question-bank.js` in GitHub, commit to the deployed branch and use Render's auto deploy or Manual Deploy > Deploy latest commit. No Worker redeploy is required for wording or question changes. Keep exactly four choices and one correct choice per question, and provide a short reason for every answer. If score rules change, update both client scoring and Worker validation/build together.

This is plain HTML/CSS/JS: use an existing Render **Static Site**, with the nested GAME directory as its publish path. If the Render service root is the repository root, the publish path is `SpaceInvaders-master/SpaceInvaders-master`; a harmless build command is `echo static-game`. If its root directory is already the nested GAME directory, publish `.`. Keep the deployed branch as `main` (or your chosen reviewed code branch), never `scores`. If using a newly created feature branch, merge the reviewed changes into that deployed branch before expecting auto deploy. A Render service and its existing branch/settings have not been modified by these instructions.

## Validation

Worker checks:

```sh
cd Space-Invaders/serverless
npm ci
npm test
npm run check
```

Browser checks need Playwright on a development computer (not the Pi): install it into a temporary test environment, with Chromium installed. Serve GAME on `localhost:8000`, make `playwright` resolvable to Node, then run `node tests/browser.cjs` from the repository root. `CHROMIUM_PATH` overrides `/usr/bin/chromium`. The checks exercise keyboard control, real laser collisions and life loss, paused questions, Kanban capacity, offline queue persistence after reload, all ten wave reviews and victory. Wave completion is forced during the campaign-flow test so it verifies transitions without an automated shooter bot. Manual playtesting on the physical Pi/Joy-Con is still needed. No live GitHub score commits or production Worker deployment are performed by the automated tests.

## Criteria mapping

| Criterion | Mission | Playable decisions |
|---|---:|---|
| Authentication | 1 | Device identity, failed logins, broker identity, independent revocation |
| Authorisation | 2 | Device roles, operator removal, temporary privileges, trusted enforcement |
| TLS encryption | 3 | Verified MQTT TLS, hostname mismatch, protocol versions, clock errors |
| Access Control Lists | 4 | Narrow publish rules, default deny, subscription limits, negative tests |
| Strong credentials | 5 | Unique random secrets, leaked-secret rotation, storage, decommissioning |
| Certificate management | 6 | Renewal, stolen-key replacement, trust anchors, expiry monitoring |
| Network segmentation | 7 | IoT VLANs, controlled routing, management isolation, boundary tests |
| Firewall configuration | 8 | Required egress, management gateway, rule testing, expiring exceptions |
| Secure topic design | 9 | Per-device/tenant namespaces, command separation, freshness, no secrets in topics |
| Input validation | 10 | Schema/type/range/size checks, no shell evaluation, strict fields, validation boundaries |
````

## LICENSE

```text
MIT License

Copyright (c) 2018 yojoecool

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## SpaceInvaders-master/SpaceInvaders-master/Scripts/campaign.js

```javascript
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
```

## SpaceInvaders-master/SpaceInvaders-master/Scripts/config.js

```javascript
/* Public settings only. NEVER put a GitHub token here or anywhere on the Pi. */
window.IOT_CONFIG = Object.freeze({
  leaderboardUrl: "", // e.g. https://iot-leaderboard.YOUR-SUBDOMAIN.workers.dev
  // JoyToKey / keyboard emulator: change these to the keys your buttons send.
  // Space and Enter retain their original functions. No keyboard is needed to play.
  keys: { a: ["KeyA", "Space"], b: ["KeyB", "Escape"], x: ["KeyC"], y: ["KeyD", "Enter"] },
  // Optional browser Gamepad fallback. Ignored unless a gamepad is connected.
  gamepad: { axisX: 0, axisY: 1, a: 0, b: 1, x: 2, y: 3, deadzone: 0.45 },
  build: "iot-v1"
});
```

## SpaceInvaders-master/SpaceInvaders-master/Scripts/controls.js

```javascript
/* One input router for JoyToKey keyboard events and optional Gamepad input. */
window.IOT_INPUT = (() => {
  const held = new Set();
  let handler = () => {}, padPrevious = {}, repeatAt = 0;
  const directions = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
  const action = code => directions[code] || Object.keys(IOT_CONFIG.keys).find(k => IOT_CONFIG.keys[k].includes(code));
  document.addEventListener("keydown", event => {
    const key = action(event.code);
    if (!key) return;
    event.preventDefault();
    const first = !held.has(key);
    held.add(key);
    if (first || (event.repeat && directions[event.code])) handler(key);
  });
  document.addEventListener("keyup", event => {
    const key = action(event.code);
    if (key) { event.preventDefault(); held.delete(key); }
  });
  window.addEventListener("blur", () => held.clear());
  let padHeld = {};
  function poll(now) {
    const pad = navigator.getGamepads && Array.from(navigator.getGamepads()).find(Boolean);
    const g = IOT_CONFIG.gamepad;
    const current = {};
    if (pad) {
      const ax = pad.axes[g.axisX] || 0, ay = pad.axes[g.axisY] || 0;
      current.left = ax < -g.deadzone || !!pad.buttons[14]?.pressed;
      current.right = ax > g.deadzone || !!pad.buttons[15]?.pressed;
      current.up = ay < -g.deadzone || !!pad.buttons[12]?.pressed;
      current.down = ay > g.deadzone || !!pad.buttons[13]?.pressed;
      for (const key of ["a", "b", "x", "y"]) current[key] = !!pad.buttons[g[key]]?.pressed;
    }
    for (const [key, pressed] of Object.entries(current)) {
      if (pressed && !padPrevious[key]) { handler(key); repeatAt = now + 350; }
      else if (pressed && ["left", "right", "up", "down"].includes(key) && now >= repeatAt) {
        handler(key); repeatAt = now + 140;
      }
    }
    padPrevious = current;
    padHeld = current;
  }
  return { bind(fn) { handler = fn; }, down(key) { return held.has(key) || !!padHeld[key]; }, poll };
})();
```

## SpaceInvaders-master/SpaceInvaders-master/Scripts/leaderboard.js

```javascript
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
```

## SpaceInvaders-master/SpaceInvaders-master/Scripts/missions.js

```javascript
/* Ten missions and their first two questions. Each option is [text, correct, why]. */
window.IOT_MISSIONS = [
  {
    "title": "Authentication",
    "objective": "Identify each sensor before connecting to MQTT.",
    "risk": "An unknown device impersonates a trusted sensor.",
    "decisions": [
      {
        "prompt": "A new sensor requests a broker connection. Choose identity checks.",
        "options": [
          [
            "Trust its IP address",
            false,
            "Addresses can change or be spoofed; they do not prove identity."
          ],
          [
            "Verify a unique device identity",
            true,
            "Authentication proves which device is connecting before a session is created."
          ],
          [
            "Allow anonymous connections",
            false,
            "Anonymous clients let an attacker join without proving an identity."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping authentication leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "A sensor fails its identity check. What should the broker do?",
        "options": [
          [
            "Deny and log the connection",
            true,
            "Failing closed blocks unauthenticated devices and leaves evidence for investigation."
          ],
          [
            "Allow access during an outage",
            false,
            "A fail-open path bypasses authentication when the system is under stress."
          ],
          [
            "Trust its device display name",
            false,
            "A display name is a claim, not cryptographic proof of identity."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping authentication leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Authorisation",
    "objective": "Limit the actions an authenticated sensor may perform.",
    "risk": "A compromised sensor changes an actuator setting.",
    "decisions": [
      {
        "prompt": "The temperature sensor is authenticated. Assign its role.",
        "options": [
          [
            "Broker administrator",
            false,
            "An authenticated device still needs restricted permissions; identity is not permission."
          ],
          [
            "Read and write every topic",
            false,
            "Broad permissions let one compromised identity control unrelated devices."
          ],
          [
            "Publish its own telemetry only",
            true,
            "Least privilege limits what a known device can do after authentication."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping authorisation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "An operator leaves the team. How do you handle their permissions?",
        "options": [
          [
            "Keep access for convenience",
            false,
            "Unused permissions leave an avoidable route into the system."
          ],
          [
            "Revoke access immediately",
            true,
            "Permissions must follow current responsibilities, including removal when someone leaves."
          ],
          [
            "Share their account with a replacement",
            false,
            "Shared accounts prevent reliable attribution and individual revocation."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping authorisation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "TLS encryption",
    "objective": "Protect MQTT traffic on an untrusted network.",
    "risk": "A nearby attacker reads or alters sensor traffic.",
    "decisions": [
      {
        "prompt": "Choose the MQTT transport for the public network.",
        "options": [
          [
            "Plain MQTT on port 1883",
            false,
            "Plain MQTT exposes messages and credentials to observers on the network."
          ],
          [
            "TLS 1.2+ with peer verification",
            true,
            "TLS protects confidentiality and integrity when the peer certificate is verified."
          ],
          [
            "Base64-encode the payload",
            false,
            "Base64 is reversible encoding and provides no encryption or integrity protection."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping tls encryption leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "TLS reports a hostname mismatch. Choose a response.",
        "options": [
          [
            "Disable certificate verification",
            false,
            "Encryption without peer verification can connect securely to an attacker."
          ],
          [
            "Fall back to plain MQTT",
            false,
            "Downgrading the connection exposes traffic instead of resolving the trust failure."
          ],
          [
            "Reject; fix the hostname/certificate",
            true,
            "Hostname verification binds the certificate to the intended broker."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping tls encryption leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Access Control Lists",
    "objective": "Implement exact MQTT publish and subscribe permissions.",
    "risk": "A wildcard ACL exposes other devices' messages.",
    "decisions": [
      {
        "prompt": "Write sensor-07's publish ACL.",
        "options": [
          [
            "Allow publish factory/#",
            false,
            "A broad wildcard grants access to unrelated topics and future devices."
          ],
          [
            "Allow publish factory/s07/telemetry",
            true,
            "A narrow ACL enforces the specific resource permission assigned to this identity."
          ],
          [
            "Allow publish #",
            false,
            "A global wildcard lets a compromised client publish almost anywhere."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping access control lists leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "No ACL rule matches a request. Choose the default.",
        "options": [
          [
            "Deny unmatched operations",
            true,
            "Default deny keeps new resources closed until an explicit rule allows access."
          ],
          [
            "Allow unmatched operations",
            false,
            "Default allow makes missing ACL rules a silent grant of access."
          ],
          [
            "Let the client decide",
            false,
            "The broker must enforce ACLs; an untrusted client cannot enforce its own limits."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping access control lists leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Strong credentials",
    "objective": "Provision unique credentials and replace exposed secrets.",
    "risk": "A leaked shared password compromises the whole fleet.",
    "decisions": [
      {
        "prompt": "Choose credentials for 100 new sensors.",
        "options": [
          [
            "Factory default admin/admin",
            false,
            "Known defaults are easy to guess and are often tested automatically by attackers."
          ],
          [
            "One long password for every sensor",
            false,
            "A shared secret turns a single-device leak into a fleet-wide compromise."
          ],
          [
            "Unique random secret per device",
            true,
            "Unique high-entropy credentials resist guessing and limit the reach of one leak."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping strong credentials leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "A device secret appears in a public log. Choose a response.",
        "options": [
          [
            "Only delete the log",
            false,
            "Copies may already exist; deleting a log does not revoke the exposed secret."
          ],
          [
            "Revoke and replace that secret",
            true,
            "Rotation ends the usefulness of the leaked secret; investigate how it escaped too."
          ],
          [
            "Append a digit to the old secret",
            false,
            "A predictable variation is easier to guess than a newly generated independent secret."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping strong credentials leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Certificate management",
    "objective": "Maintain trusted, valid certificates throughout their lifecycle.",
    "risk": "An expired or stolen certificate disrupts trusted connections.",
    "decisions": [
      {
        "prompt": "The broker certificate expires in seven days. Plan maintenance.",
        "options": [
          [
            "Automate renewal and expiry alerts",
            true,
            "Renewal plus monitoring prevents expiry outages and catches failed renewal jobs."
          ],
          [
            "Wait until clients disconnect",
            false,
            "Waiting for expiry creates an avoidable outage and pressures teams to bypass verification."
          ],
          [
            "Accept expired certificates",
            false,
            "Ignoring validity removes an essential part of certificate trust checks."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping certificate management leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "A device private key is stolen. Choose the recovery action.",
        "options": [
          [
            "Renew using the same key",
            false,
            "A new certificate with the stolen key still lets the attacker impersonate the device."
          ],
          [
            "Change only the device name",
            false,
            "Renaming the device does not invalidate the stolen cryptographic identity."
          ],
          [
            "Revoke; generate a new key/cert",
            true,
            "Revocation and a fresh key stop reuse; distribute revocation enforcement to peers."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping certificate management leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Network segmentation",
    "objective": "Separate IoT devices from management and office networks.",
    "risk": "A compromised IoT device moves into the office network.",
    "decisions": [
      {
        "prompt": "Choose a network layout for the sensor fleet.",
        "options": [
          [
            "Put everything on one flat LAN",
            false,
            "A flat network makes lateral movement easier after any device is compromised."
          ],
          [
            "IoT VLAN with controlled routing",
            true,
            "Segmentation creates boundaries; controlled inter-VLAN routing enforces them."
          ],
          [
            "Give devices different hostnames",
            false,
            "Names do not create a network boundary or limit connectivity."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping network segmentation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "An office laptop needs sensor data. Choose its access path.",
        "options": [
          [
            "Approved broker gateway only",
            true,
            "A narrow, monitored path reduces exposure across the network boundary."
          ],
          [
            "Bridge the VLANs together",
            false,
            "Bridging removes the isolation the VLAN design was meant to provide."
          ],
          [
            "Allow every inter-VLAN connection",
            false,
            "Permissive routing defeats segmentation even when VLAN labels are present."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping network segmentation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Firewall configuration",
    "objective": "Permit necessary traffic and close unneeded network paths.",
    "risk": "An exposed management port allows remote intrusion.",
    "decisions": [
      {
        "prompt": "Set the IoT network's outbound firewall policy.",
        "options": [
          [
            "Allow all destinations and ports",
            false,
            "Unrestricted egress gives malware more routes for control and data theft."
          ],
          [
            "Block all traffic, including MQTT",
            false,
            "A firewall must support required service paths while denying unnecessary ones."
          ],
          [
            "Allow broker:8883 and approved services",
            true,
            "Explicit destinations and ports limit exposure while preserving required connectivity."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping firewall configuration leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "A supplier requests public SSH to every sensor.",
        "options": [
          [
            "Open port 22 to the internet",
            false,
            "Public management interfaces attract scanning and credential attacks."
          ],
          [
            "Use a restricted management gateway",
            true,
            "A controlled management path limits who can reach administrative interfaces."
          ],
          [
            "Open all inbound ports temporarily",
            false,
            "A temporary broad rule creates unnecessary exposure and may be forgotten."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping firewall configuration leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Secure topic design",
    "objective": "Separate telemetry and commands with predictable narrow namespaces.",
    "risk": "Ambiguous topics mix device data and actuator commands.",
    "decisions": [
      {
        "prompt": "Choose the topic namespace for sensor 07.",
        "options": [
          [
            "factory/s07/telemetry and /commands",
            true,
            "Separate per-device channels make precise ACLs and monitoring possible; ACLs still enforce access."
          ],
          [
            "One global data topic for everything",
            false,
            "A shared topic makes per-device permissions and command separation difficult."
          ],
          [
            "Put the password inside the topic",
            false,
            "Topics appear in logs and subscriptions; topic names must not carry secrets."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping secure topic design leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "Choose how actuator commands should be delivered.",
        "options": [
          [
            "Retain every command indefinitely",
            false,
            "A newly connected actuator may replay a stale retained command."
          ],
          [
            "Use the same topic as telemetry",
            false,
            "Mixing commands and readings makes authority and message handling ambiguous."
          ],
          [
            "Separate commands; check freshness",
            true,
            "Dedicated command topics plus expiry/sequence checks reduce accidental stale-command execution."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping secure topic design leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Input validation",
    "objective": "Validate untrusted MQTT payloads before using them.",
    "risk": "A malformed payload crashes or manipulates an actuator.",
    "decisions": [
      {
        "prompt": "An actuator receives {temperature: 'hot'}. Choose validation.",
        "options": [
          [
            "Trust it because MQTT used TLS",
            false,
            "TLS protects transport, but an authenticated sender can still send invalid data."
          ],
          [
            "Check schema, type, range and size",
            true,
            "Explicit validation rejects malformed, oversized or out-of-range data before it reaches control logic."
          ],
          [
            "Convert any string to a command",
            false,
            "Implicit conversion can turn unexpected input into unintended actions."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping input validation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "A payload contains shell text. Choose a processing method.",
        "options": [
          [
            "Execute it to discover its meaning",
            false,
            "Executing message text turns untrusted data into arbitrary code execution."
          ],
          [
            "Remove spaces, then execute it",
            false,
            "Simple text filtering does not make shell execution safe."
          ],
          [
            "Reject it; use a fixed command allowlist",
            true,
            "Treat payloads as data and map validated values to predefined actions, without shell evaluation."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping input validation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  }
];
```

## SpaceInvaders-master/SpaceInvaders-master/Scripts/question-bank.js

```javascript
/* Four more questions per mission. Edit wording/options here; one correct answer each. */
(() => {
  const extra = [
  [
    {
      "prompt": "Two sensors connect using the same client ID. What establishes identity?",
      "options": [
        [
          "A separately verified credential for each device",
          true,
          "Client IDs label sessions; independently verified credentials establish identity."
        ],
        [
          "The client ID alone",
          false,
          "An attacker can copy a client ID; it is not proof of identity."
        ],
        [
          "The most recent connection",
          false,
          "Connection timing does not prove which device is legitimate."
        ],
        [
          "The strongest Wi-Fi signal",
          false,
          "Signal strength cannot authenticate an MQTT client."
        ]
      ]
    },
    {
      "prompt": "A laptop asks a sensor to trust a new broker. What must the sensor verify?",
      "options": [
        [
          "The broker certificate and expected hostname",
          true,
          "Authentication is needed in both directions: devices must identify their intended broker."
        ],
        [
          "Only the broker display name",
          false,
          "Display names can be copied by an impostor."
        ],
        [
          "That the broker replies quickly",
          false,
          "A fast response provides no identity assurance."
        ],
        [
          "That port 8883 is open",
          false,
          "A port number does not prove the service behind it is trusted."
        ]
      ]
    },
    {
      "prompt": "Which design supports revoking one compromised device identity?",
      "options": [
        [
          "A separate identity and credential per device",
          true,
          "Independent identities let you revoke one device without disabling the fleet."
        ],
        [
          "One shared fleet account",
          false,
          "Revoking a shared account disrupts every device that uses it."
        ],
        [
          "Anonymous MQTT sessions",
          false,
          "Anonymous sessions provide no per-device identity to revoke."
        ],
        [
          "A shared serial number",
          false,
          "A shared public label is not a separately revocable credential."
        ]
      ]
    },
    {
      "prompt": "Many failed device logins appear. Choose a broker response.",
      "options": [
        [
          "Rate-limit attempts and alert operators",
          true,
          "Rate limits slow guessing; monitoring helps detect attacks without silently removing checks."
        ],
        [
          "Disable authentication",
          false,
          "Removing authentication lets the attacker connect without guessing."
        ],
        [
          "Print passwords into logs",
          false,
          "Logging secrets creates another source of credential exposure."
        ],
        [
          "Automatically trust repeat attempts",
          false,
          "Repeated failures should not increase trust."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "A dashboard user can read temperatures. May they reset a motor?",
      "options": [
        [
          "Only with an explicit motor-control permission",
          true,
          "Authorisation checks each action against the permissions assigned to that identity."
        ],
        [
          "Yes, because they are logged in",
          false,
          "Authentication does not grant every action."
        ],
        [
          "Yes, if they know the topic name",
          false,
          "Knowing a resource name does not confer permission."
        ],
        [
          "Yes, from the office Wi-Fi",
          false,
          "Network location alone is not an action permission."
        ]
      ]
    },
    {
      "prompt": "A maintenance role is needed for one hour. Choose access handling.",
      "options": [
        [
          "Time-limit the role and revoke it afterwards",
          true,
          "Short-lived permissions reduce the time a privileged account can be misused."
        ],
        [
          "Grant permanent administrator access",
          false,
          "Permanent broad privileges exceed a temporary maintenance need."
        ],
        [
          "Share an existing administrator password",
          false,
          "Shared administrator credentials reduce accountability and are difficult to revoke individually."
        ],
        [
          "Allow every sensor to perform maintenance",
          false,
          "Maintenance privileges should be limited to the identities that need them."
        ]
      ]
    },
    {
      "prompt": "Where should command authorisation be enforced?",
      "options": [
        [
          "At the broker and relevant service boundary",
          true,
          "Enforcement must happen in trusted components before a protected operation is performed."
        ],
        [
          "Only by hiding dashboard buttons",
          false,
          "A client can bypass a user interface and send requests directly."
        ],
        [
          "Only inside an untrusted sensor app",
          false,
          "A compromised client can remove its own checks."
        ],
        [
          "Only in the README",
          false,
          "Documentation cannot enforce permissions on a request."
        ]
      ]
    },
    {
      "prompt": "A device changes its requested role to admin in a message. What happens?",
      "options": [
        [
          "Ignore the claim; use server-assigned permissions",
          true,
          "Clients cannot grant themselves roles; a trusted policy determines their authority."
        ],
        [
          "Grant admin because it asked",
          false,
          "Trusting a role claimed by the caller permits privilege escalation."
        ],
        [
          "Grant admin if the message is JSON",
          false,
          "Valid JSON says nothing about whether a caller has permission."
        ],
        [
          "Grant admin if TLS is enabled",
          false,
          "TLS protects transport, not the legitimacy of requested privileges."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "Which property does TLS provide for messages in transit?",
      "options": [
        [
          "Confidentiality and integrity with verified peers",
          true,
          "Correctly configured TLS protects traffic in transit and authenticates the peer."
        ],
        [
          "Automatic payload range checking",
          false,
          "TLS does not validate application data ranges."
        ],
        [
          "Automatic MQTT topic permissions",
          false,
          "ACLs and authorisation remain separate from transport encryption."
        ],
        [
          "Encryption of every stored database record",
          false,
          "TLS protects transit; stored data needs its own protection."
        ]
      ]
    },
    {
      "prompt": "A connection offers only obsolete TLS versions. Choose a policy.",
      "options": [
        [
          "Require supported TLS 1.2 or 1.3 settings",
          true,
          "Modern supported configurations avoid known weaknesses in obsolete protocols."
        ],
        [
          "Enable every obsolete protocol",
          false,
          "Legacy protocol support can expose known weaknesses."
        ],
        [
          "Use plain MQTT instead",
          false,
          "Removing TLS exposes the whole transport."
        ],
        [
          "Hide the port number",
          false,
          "An obscure port does not fix weak cryptography."
        ]
      ]
    },
    {
      "prompt": "A trusted sensor sends an unsafe command over TLS. Is it safe to execute?",
      "options": [
        [
          "No; validate and authorise the command",
          true,
          "Transport protection does not make an unsafe or unauthorised command acceptable."
        ],
        [
          "Yes; TLS validates all commands",
          false,
          "TLS does not understand the safety rules of your application."
        ],
        [
          "Yes; any encrypted data is harmless",
          false,
          "Malicious and invalid data can be encrypted too."
        ],
        [
          "Yes; JSON inside TLS is executable",
          false,
          "A data format and transport do not establish command safety."
        ]
      ]
    },
    {
      "prompt": "A TLS handshake fails because the Pi clock is wrong. Choose a fix.",
      "options": [
        [
          "Correct trusted time and retry verification",
          true,
          "Certificate validity depends on time; fix the clock rather than bypassing the check."
        ],
        [
          "Ignore every certificate date",
          false,
          "Ignoring dates also accepts certificates outside their valid lifetime."
        ],
        [
          "Disable TLS permanently",
          false,
          "A clock fault should not remove transport protection."
        ],
        [
          "Change to port 1883",
          false,
          "Changing to plain MQTT avoids the symptom by exposing traffic."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "A sensor needs to publish but never subscribe. Choose its ACL.",
      "options": [
        [
          "Grant publish only on its telemetry topic",
          true,
          "Publish and subscribe are separate permissions and should match the device need."
        ],
        [
          "Grant read/write on all topics",
          false,
          "That gives far more access than required."
        ],
        [
          "Grant subscribe only",
          false,
          "That prevents the required publish operation and grants an unnecessary operation."
        ],
        [
          "Disable the ACL engine",
          false,
          "Without enforcement the resource permissions disappear."
        ]
      ]
    },
    {
      "prompt": "A developer asks for a temporary # subscription. Choose a review.",
      "options": [
        [
          "Use a narrow diagnostic topic and time limit",
          true,
          "A global subscription can expose data across devices and tenants."
        ],
        [
          "Grant # to all developers forever",
          false,
          "Permanent global access increases exposure across the system."
        ],
        [
          "Allow it because subscriptions are read-only",
          false,
          "Reading confidential messages is itself a sensitive capability."
        ],
        [
          "Trust the topic to stay secret",
          false,
          "Topic names are not an access-control boundary."
        ]
      ]
    },
    {
      "prompt": "Which ACL test gives useful evidence?",
      "options": [
        [
          "Test allowed actions and forbidden cross-device actions",
          true,
          "Negative tests verify that the ACL actually rejects access outside the intended scope."
        ],
        [
          "Only check that the broker starts",
          false,
          "Startup does not verify per-client resource permissions."
        ],
        [
          "Only test as an administrator",
          false,
          "An administrator does not exercise the restricted device policy."
        ],
        [
          "Only count lines in the ACL file",
          false,
          "Rule quantity does not show whether the policy is correct."
        ]
      ]
    },
    {
      "prompt": "A new device topic has no matching permission. What should happen?",
      "options": [
        [
          "Reject until an explicit rule is approved",
          true,
          "Default deny stops new resources from becoming accessible by accident."
        ],
        [
          "Copy the administrator ACL",
          false,
          "That grants unnecessary access and bypasses policy review."
        ],
        [
          "Allow because the topic is new",
          false,
          "New resources are not automatically trustworthy."
        ],
        [
          "Let any existing client subscribe",
          false,
          "Existing clients still need explicit permission for the new resource."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "Where should production device secrets be kept?",
      "options": [
        [
          "In protected per-device storage, outside source code",
          true,
          "Restricting access and excluding secrets from repositories reduces accidental disclosure."
        ],
        [
          "In a public GitHub repository",
          false,
          "Public source makes the secret available to anyone."
        ],
        [
          "Inside MQTT topic names",
          false,
          "Topic names are frequently exposed in logs and tooling."
        ],
        [
          "In a shared screenshot",
          false,
          "A screenshot is an uncontrolled copy of the secret."
        ]
      ]
    },
    {
      "prompt": "Choose a credential provisioning method for a new fleet.",
      "options": [
        [
          "Generate independent random credentials securely",
          true,
          "Independent high-entropy credentials make guessing and fleet-wide reuse harder."
        ],
        [
          "Use the device model number",
          false,
          "Model numbers are public and predictable."
        ],
        [
          "Use password plus the device number",
          false,
          "A predictable pattern lets an attacker derive other credentials."
        ],
        [
          "Use the same default until an incident",
          false,
          "Known defaults invite compromise before an incident is detected."
        ]
      ]
    },
    {
      "prompt": "Which password is appropriate for a human maintenance account?",
      "options": [
        [
          "A long unique password with MFA where supported",
          true,
          "Length, uniqueness and an additional factor improve resistance to common account attacks."
        ],
        [
          "The account name twice",
          false,
          "Repeating public information is easy to guess."
        ],
        [
          "The same password as personal email",
          false,
          "Reuse lets a breach of another service compromise this account."
        ],
        [
          "A short password changed every day",
          false,
          "Frequent changes do not compensate for easily guessed credentials."
        ]
      ]
    },
    {
      "prompt": "A sensor is retired. What happens to its credential?",
      "options": [
        [
          "Revoke it and remove active broker access",
          true,
          "Decommissioning must close the old identity so it cannot be reused later."
        ],
        [
          "Reuse it for the next device",
          false,
          "Reuse mixes identities and preserves the value of old leaked copies."
        ],
        [
          "Leave it active indefinitely",
          false,
          "An unused valid credential remains an avoidable entry point."
        ],
        [
          "Post it in the asset register",
          false,
          "An asset register should track status, not expose usable secrets."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "Which certificate checks belong in broker verification?",
      "options": [
        [
          "Trust chain, hostname and validity period",
          true,
          "These checks establish whether the certificate is trusted, current and for the intended endpoint."
        ],
        [
          "Only that the file ends in .pem",
          false,
          "A filename extension provides no cryptographic trust."
        ],
        [
          "Only that some certificate exists",
          false,
          "Any attacker can generate a certificate."
        ],
        [
          "Only that its text looks official",
          false,
          "Appearance does not prove a certificate is valid or trusted."
        ]
      ]
    },
    {
      "prompt": "A root CA is being replaced. Choose a safe rollout.",
      "options": [
        [
          "Stage the new trust anchor, test, then retire the old one",
          true,
          "A planned trust transition avoids outages while removing obsolete trust at the end."
        ],
        [
          "Delete all trust anchors first",
          false,
          "Devices may become unable to establish any trusted connection."
        ],
        [
          "Trust every CA presented by clients",
          false,
          "An untrusted peer cannot choose what your device should trust."
        ],
        [
          "Disable verification during the whole rollout",
          false,
          "A verification bypass exposes clients during the transition."
        ]
      ]
    },
    {
      "prompt": "Where does a certificate private key belong?",
      "options": [
        [
          "Protected on the device or in secure key storage",
          true,
          "The private key must remain secret because possession allows impersonation."
        ],
        [
          "Bundled with the public certificate on GitHub",
          false,
          "The certificate may be public; the corresponding private key must not be."
        ],
        [
          "Inside the topic name",
          false,
          "Topic names are not confidential key storage."
        ],
        [
          "Shared in every support email",
          false,
          "Each uncontrolled copy increases the chance of key exposure."
        ]
      ]
    },
    {
      "prompt": "How do you know automated renewal is working?",
      "options": [
        [
          "Monitor expiry, renewal results and deployed certificates",
          true,
          "A successful renewal job is insufficient if the live service still serves the old certificate."
        ],
        [
          "Assume the scheduler always succeeds",
          false,
          "Jobs can fail or fail to install the renewed certificate."
        ],
        [
          "Only check after an outage",
          false,
          "That discovers renewal failures too late to prevent disruption."
        ],
        [
          "Set alerts to ignore expiry",
          false,
          "Ignoring expiry hides the operational risk."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "A compromised camera scans the office subnet. What should stop it?",
      "options": [
        [
          "An enforced inter-segment deny policy",
          true,
          "A segment boundary needs routing or firewall enforcement to block lateral access."
        ],
        [
          "A different subnet label alone",
          false,
          "Address labels alone do not enforce isolation."
        ],
        [
          "A hidden Wi-Fi network name",
          false,
          "Hiding a name does not block routed access."
        ],
        [
          "Changing the camera wallpaper",
          false,
          "A cosmetic change creates no network boundary."
        ]
      ]
    },
    {
      "prompt": "Where should broker administration be reachable?",
      "options": [
        [
          "From a restricted management segment",
          true,
          "Separating administration reduces exposure to ordinary IoT and user devices."
        ],
        [
          "From every guest device",
          false,
          "Guest access expands the set of potential attackers."
        ],
        [
          "From every sensor on the LAN",
          false,
          "Sensors normally do not require broker administration access."
        ],
        [
          "From the whole internet without restrictions",
          false,
          "Unrestricted public management creates unnecessary exposure."
        ]
      ]
    },
    {
      "prompt": "How should you verify VLAN isolation?",
      "options": [
        [
          "Test permitted routes and blocked cross-VLAN paths",
          true,
          "Connectivity tests must show both required access and effective isolation."
        ],
        [
          "Only inspect the VLAN names",
          false,
          "Names do not prove that routing rules enforce separation."
        ],
        [
          "Only ping within the same VLAN",
          false,
          "That says nothing about cross-segment exposure."
        ],
        [
          "Assume a switch default is secure",
          false,
          "Default settings may not enforce the intended boundary."
        ]
      ]
    },
    {
      "prompt": "A sensor needs updates from an approved server. Choose a route.",
      "options": [
        [
          "Allow only the required update path through policy",
          true,
          "Segmentation can preserve necessary services with explicit controlled exceptions."
        ],
        [
          "Connect it to every segment",
          false,
          "Broad connectivity removes the containment benefit."
        ],
        [
          "Bridge the guest and management networks",
          false,
          "A bridge opens a path between networks with different trust levels."
        ],
        [
          "Disable every boundary permanently",
          false,
          "An update requirement does not justify removing all isolation."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "A firewall change is ready. What should happen before rollout?",
      "options": [
        [
          "Test required traffic and denied traffic, with rollback",
          true,
          "Validation and rollback reduce both accidental outages and unintended exposure."
        ],
        [
          "Deploy without checking rule order",
          false,
          "Rule ordering can change the effective policy."
        ],
        [
          "Allow all first and forget to restore rules",
          false,
          "An allow-all rule can defeat every intended restriction."
        ],
        [
          "Only check that the file saves",
          false,
          "A saved configuration may still be incorrect or unapplied."
        ]
      ]
    },
    {
      "prompt": "A temporary vendor firewall exception has expired. What now?",
      "options": [
        [
          "Remove it and verify access is closed",
          true,
          "Time-limited exceptions need cleanup so temporary access does not become permanent."
        ],
        [
          "Keep it just in case",
          false,
          "Unneeded access increases exposure over time."
        ],
        [
          "Widen it to all sources",
          false,
          "A wider rule makes the stale exception more dangerous."
        ],
        [
          "Rename the rule to permanent",
          false,
          "Renaming does not justify the underlying access."
        ]
      ]
    },
    {
      "prompt": "Which traffic should a sensor normally accept from the internet?",
      "options": [
        [
          "Only explicitly justified inbound traffic, usually none",
          true,
          "Minimising inbound services reduces the exposed attack surface."
        ],
        [
          "Every port below 1024",
          false,
          "A port range does not define a justified service need."
        ],
        [
          "Every connection with a large packet",
          false,
          "Packet size is not a trust decision."
        ],
        [
          "Every connection at night",
          false,
          "Time of day alone does not make unsolicited inbound traffic safe."
        ]
      ]
    },
    {
      "prompt": "A firewall blocks MQTT after a rule change. Choose a fix.",
      "options": [
        [
          "Inspect logs and narrowly correct the required rule",
          true,
          "Diagnose the intended path instead of removing unrelated protection."
        ],
        [
          "Disable the firewall forever",
          false,
          "That restores traffic by exposing unnecessary paths."
        ],
        [
          "Open all inbound and outbound ports",
          false,
          "An overbroad fix defeats the policy."
        ],
        [
          "Publish the broker password online",
          false,
          "Leaking credentials cannot repair a routing or firewall rule."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "Two customers use the same broker. Choose a topic design.",
      "options": [
        [
          "Separate tenant namespaces with enforced ACLs",
          true,
          "Namespaces support clear ownership; broker ACLs must enforce tenant isolation."
        ],
        [
          "One shared customer/# write permission",
          false,
          "That permits cross-tenant access."
        ],
        [
          "Put customer passwords in the topic",
          false,
          "Topic names can leak secrets through logs and subscriptions."
        ],
        [
          "Rely on customers not guessing names",
          false,
          "Obscurity does not provide access control."
        ]
      ]
    },
    {
      "prompt": "Should a telemetry topic name contain a personal email address?",
      "options": [
        [
          "Avoid personal data; use a non-secret device identifier",
          true,
          "Topics can be logged and widely observed, so minimise personal and sensitive information."
        ],
        [
          "Yes, because all topic names are secret",
          false,
          "Topic names are often visible to brokers and monitoring tools."
        ],
        [
          "Yes, and include the password too",
          false,
          "Adding credentials increases the exposure."
        ],
        [
          "Only if the topic is very long",
          false,
          "Length does not make personal data confidential."
        ]
      ]
    },
    {
      "prompt": "A device reconnects and sees an old retained unlock command. What is safer?",
      "options": [
        [
          "Reject stale commands using freshness checks",
          true,
          "Actuator commands need explicit expiry or sequencing so reconnects do not replay unsafe actions."
        ],
        [
          "Execute every retained command immediately",
          false,
          "That may repeat an action that is no longer intended."
        ],
        [
          "Treat retained messages as newly authorised",
          false,
          "Retention does not refresh the authority or relevance of a command."
        ],
        [
          "Use the telemetry timestamp as a password",
          false,
          "A public timestamp is not an authentication secret."
        ]
      ]
    },
    {
      "prompt": "What is the role of a well-designed MQTT topic hierarchy?",
      "options": [
        [
          "Make ownership and purpose clear for narrow ACLs",
          true,
          "A hierarchy supports policy and operations, but the broker still needs to enforce permissions."
        ],
        [
          "Replace all broker authentication",
          false,
          "A topic name cannot prove the identity of a client."
        ],
        [
          "Encrypt every payload automatically",
          false,
          "Topic structure does not encrypt message contents."
        ],
        [
          "Guarantee every payload is valid",
          false,
          "Input validation remains necessary regardless of topic design."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "A temperature reading is 999999 degrees. Choose handling.",
      "options": [
        [
          "Reject it against an explicit permitted range",
          true,
          "Range validation prevents nonsensical data from reaching control decisions."
        ],
        [
          "Accept because it is numeric",
          false,
          "A correct type does not guarantee a sensible or safe value."
        ],
        [
          "Execute it as a shell command",
          false,
          "Sensor data must never become arbitrary code."
        ],
        [
          "Silently disable the alarm",
          false,
          "That hides the validation fault and can undermine safety."
        ]
      ]
    },
    {
      "prompt": "A client sends a 50 MB JSON payload to a small Pi. What helps?",
      "options": [
        [
          "Enforce message size limits before expensive parsing",
          true,
          "Early limits protect memory and CPU before the payload consumes excessive resources."
        ],
        [
          "Parse first, then check the size",
          false,
          "The expensive allocation has already happened."
        ],
        [
          "Trust all authenticated clients to be small",
          false,
          "Compromised or faulty trusted clients can still exhaust resources."
        ],
        [
          "Remove every validation limit",
          false,
          "That increases the denial-of-service exposure."
        ]
      ]
    },
    {
      "prompt": "A command JSON includes an unexpected admin field. Choose a policy.",
      "options": [
        [
          "Reject unknown fields under a strict schema",
          true,
          "A strict schema stops unexpected data from silently changing application behaviour."
        ],
        [
          "Copy every field into server settings",
          false,
          "Blind field copying can overwrite sensitive configuration."
        ],
        [
          "Accept it because JSON parsed",
          false,
          "Syntactic validity does not imply the data follows the intended schema."
        ],
        [
          "Execute the field name",
          false,
          "Executing field names turns input into code."
        ]
      ]
    },
    {
      "prompt": "Where should untrusted payload validation happen?",
      "options": [
        [
          "At each trusted boundary before use",
          true,
          "Server-side validation remains necessary even if a client already checks its own input."
        ],
        [
          "Only in the dashboard browser",
          false,
          "An attacker can bypass the browser and send messages directly."
        ],
        [
          "Only in a user manual",
          false,
          "Documentation does not reject malformed messages."
        ],
        [
          "Only after the actuator has moved",
          false,
          "Validation must happen before an unsafe effect."
        ]
      ]
    }
  ]
];
  IOT_MISSIONS.forEach((mission, i) => mission.decisions.push(...extra[i]));
})();
```

## SpaceInvaders-master/SpaceInvaders-master/Scripts/script.js

```javascript
console.log("script loaded");

let canvas = document.querySelector("#game-canvas");

/* Global Variables */
let context = canvas.getContext("2d");

let spriteSheet = "Images/invaders.gif";

let ded = "  _____" + "\n" +
" /     \\" + "\n" +
"| () () |" + "\n" +
" \\  ^  /" + "\n" +
"  |||||" + "\n" +
"  |||||" + "\n";

let colorArray = [
  "#124e78",
  "#f0f0c9",
  "#f2bb05",
  "#d74e09",
  "#6e0e0a"
];

let enemySprites = [
  {
    char: "SmaInv",
    x1: 312,
    y1: 14,
    x2: 428,
    y2: 14,
    height: 80,
    width: 80,
    animate: 35,
    hits: 1
  },
  {
    char: "LarInv",
    x1: 19,
    y1: 134,
    x2: 160,
    y2: 134,
    height: 80,
    width: 120,
    animate: 100,
    hits: 3
  },
  {
    char: "MedInv",
    x1: 19,
    y1: 14,
    x2: 165,
    y2: 14,
    height: 80,
    width: 110,
    animate: 70,
    hits: 2
  },
];

let explosion = new Audio("sounds/explosion.wav");
let invaderKilled = new Audio("sounds/invaderkilled.wav");
let shoot = new Audio("sounds/shoot.wav");
let enemySounds = [
  new Audio("sounds/fastinvader4.wav"),
  new Audio("sounds/fastinvader2.wav"),
  new Audio("sounds/fastinvader3.wav"),
  new Audio("sounds/fastinvader1.wav")
];
let invaderHit = new Audio("sounds/invaderhit3.wav");

let audioTick = 0;
let enemyAudioTrack = 0;
let activeKey = 0;
let gameOver = false;
let gameWon = false;
let moveDownNextTick = false;
let gameStart = false;
let gamePaused = false;
let score = 0;
let numOfEnemies = 0;
let level = 1;
let nextLevelDelay = 0;
let gamePausedDelay = 0;

/* Base Functions (not used for game loop) */
let playSounds = function(sound) {
  if (sound.currentTime > 0) {
    sound.pause();
    sound.currentTime = 0;
  }
  if (sound.paused) sound.play().catch(() => {});
}

let drawBackground = function() {
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "black";
  context.fill();
}

/* Classes */
class GamePiece {
  constructor(x, y, dx, dy, width, height, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  getY() {
    return this.y;
  }

  getDy() {
    return this.dy;
  }

  getX() {
    return this.x;
  }

  getDx() {
    return this.dx;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  setY(y) {
    this.y = y;
  }

  setX(x) {
    this.x = x;
  }

  setDx(dx) {
    this.dx = dx;
  }

  setDy(dy) {
    this.dy = dy;
  }

  draw() {
    // be default, draw a rectangle
    context.fillStyle = this.color;
    context.beginPath();
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fill();
  }
}

class Character extends GamePiece {
  constructor(x, y, dx, dy, width, height, color, laserTotal, enemy, bulletSpeed, imgSrc = "", srcX = 0, srcY = 0, srcWidth = 0, srcHeight = 0) {
    super(x, y, dx, dy, width, height, color);

    // limit the number of shots a character can have on the screen
    this.laserTotal = laserTotal;
    this.lasers = [];
    this.enemy = enemy;
    this.bulletSpeed = bulletSpeed;
    //default sprite to null. if an image source is passed in, set sprite to the image
    this.sprite = null;
    if (imgSrc != "") {
      this.sprite = new Image();
      this.sprite.src = imgSrc;
    }
    this.srcX = srcX;
    this.srcY = srcY;
    this.srcWidth = srcWidth;
    this.srcHeight = srcHeight;
    this.lives = 0;
  }

  setSrcX(srcX) {
    this.srcX = srcX;
  }

  setSrcY(srcY) {
    this.srcY = srcY;
  }

  setSrcWidth(srcWidth) {
    this.srcWidth = srcWidth;
  }

  setSrcHeight(srcHeight) {
    this.srcHeight = srcHeight;
  }

  getLasers() {
    return this.lasers;
  }

  getLives() {
    return this.lives;
  }

  setLives(lives) {
    this.lives = lives;
  }

  //add laser to the character's laser array if the number of lasers on screen are less than the max number of lasers
  addLaser() {
    if (this.lasers.length < this.laserTotal)
      this.lasers.push(new Laser(Math.floor(this.x + this.width / 2) - 3, this.y, this.bulletSpeed, 6, 6, this.enemy));
  }

  clearLasers() {
    for (let i = 0; i < this.lasers.length; i++) {
      this.lasers[i].clear();
    }
    this.lasers = [];
  }

  //remove lasers from the characther's laser array as they disappear from the screen
  removeLasers() {
    for (const laser of this.lasers) laser.update();
    this.lasers = this.lasers.filter(laser => !laser.getHit() &&
      (this.enemy ? laser.getY() < canvas.height : laser.getY() > 50));
  }

  //if an image for the sprite hasn't been passed in, draw a rectangle. otherwise, draw the sprite
  draw() {
    if (this.sprite === null) {
      super.draw();
    }
    else {
      context.drawImage(this.sprite, this.srcX, this.srcY, this.srcWidth, this.srcHeight, this.x, this.y, this.width, this.height);
    }
  }
}

class Laser extends GamePiece {
  constructor(x, y, dy, width, height, enemyLaser) {
    super(x, y, 0, dy, width, height, '#ff0000');
    this.enemyLaser = enemyLaser;
    this.hit = false;
  }

  getHit() {
    return this.hit;
  }

  setHit(hit) {
    this.hit = hit;
  }

  //removes the laser from play
  clear() {
    this.x = -500;
    this.hit = true;
  }

  //updates the laser's location
  update() {
      if (!this.enemyLaser) {
        if (this.y > 0)
          this.y -= this.dy;
      }
      else this.y += this.dy;

      if (!this.hit && this.x > 0 && this.y > 0)
        this.draw();
  }
}

class Player extends Character {
  constructor(x, dx, width, height, imgSrc = "", srcX = 0, srcY = 0, srcWidth = 0, srcHeight = 0) {
    let color = colorArray[Math.floor(Math.random() * colorArray.length)];
    let y = canvas.height - height;

    super(x, y, dx, 0, width, height, color, 2, false, 9, imgSrc, srcX, srcY, srcWidth, srcHeight);

    this.lives = 5;
    this.ogSrcX = srcX;
    this.ogSrcY = srcY;
    this.ogSrcWidth = srcWidth;
    this.ogSrcHeight = srcHeight;
    this.explodingImg = null;
    this.explodingImgX = 241;
    this.explodingImgY = 634;
    this.explodingImgWidth = 105;
    this.explodingImgHeight = 60;
    this.explodingTick = 0;
  }

  // add laser and player sound effect
  addLaser() {
    let laserCount = this.lasers.length;
    super.addLaser();

    if (this.lasers.length > laserCount) {
      playSounds(shoot);
    }
  }

  // remove life from player
  loseLife() {
    console.log("You've been hit!");
    this.lives--;

    this.srcX = this.explodingImgX;
    this.srcY = this.explodingImgY;
    this.srcWidth = this.explodingImgWidth;
    this.srcHeight = this.explodingImgHeight;
    this.explodingTick++;

    playSounds(explosion);
    if (this.lives === 0) {
      console.log(ded);
      gameOver = true;
    }
  }

  //update location of player based on which arrow button is pressed. prevent movement that would be out of bounds
  update(keycode) {
    if (!gameOver) {
      if (this.explodingTick === 150) {
        this.srcX = this.ogSrcX;
        this.srcY = this.ogSrcY;
        this.srcWidth = this.ogSrcWidth;
        this.srcHeight = this.ogSrcHeight;
        this.explodingTick = 0;
      }
      else if (this.explodingTick != 0) {
        this.explodingTick++;
      }

      if (keycode === 39 && this.x + this.width + this.dx <= canvas.width)
        this.x += this.dx;
      else if (keycode === 37 && this.x - this.dx >= 0)
        this.x -= this.dx;
      this.draw();

      // check if any lasers need to be removed and remove them if necessary
      this.removeLasers();
    }
  }
}

class Enemy extends Character {
  constructor(x, y, dx, dy, width, height, shotFreq, imgSrc = "", enemyType = 0) {
    let color = colorArray[Math.floor(Math.random() * colorArray.length)];

    // get sprite info based on what type of enemy it is
    let spriteInfo = enemySprites[enemyType];
    let srcX = spriteInfo.x1;
    let srcY = spriteInfo.y1;
    let srcWidth = spriteInfo.width;
    let srcHeight = spriteInfo.height;

    super(x, y, dx, dy, width, height, color, 4, true, 6, imgSrc, srcX, srcY, srcWidth, srcHeight);

    this.enemyType = enemyType;
    //number of frames between shots
    this.shotFrame = 0;
    this.shotFreq = shotFreq;

    this.hit = false;
    this.hitFrames = 0;
    this.killFrames = 0;
    //number of frames between animations
    this.animationFrame = 0;
    this.animationFreq = enemySprites[enemyType].animate;
    //decides which frame to animate to
    this.firstAniFrame = true;
    this.spriteInfo = spriteInfo;

    //nunber of lives is based on enemy type and what level it is.
    //if the enemy type is greater than the level, the max lives is the level count
    //if the enemy type is less than or equal to the level, then lives are set to the enemy type
    this.lives = spriteInfo.hits > level ? level : spriteInfo.hits;
  }

  getHit() {
    return this.hit;
  }

  setHit(hit) {
    this.hit = hit;
  }

  getEnemyType() {
    return this.enemyType;
  }

  //if an ememy is hit, it loses a life. if it runs out of lives, it and its lasers are removed from the screen
  clear() {
    this.lives--;
    if (this.lives === 0) {
      for (let i = 0; i < this.lasers.length; i++) {
        this.lasers[i].clear();
      }
      numOfEnemies--;
      playSounds(invaderKilled);
      this.killFrames++;
      this.hit = true;

      this.srcX = 360;
      this.srcY = 632;
      this.srcWidth = 96;
      this.srcHeight = 58;
    }
    else {
      this.hitFrames++;
      playSounds(invaderHit);
    }
  }

  //update enemies each tick
  update() {
    if (this.x >= -300 && !gamePaused) {
      this.x += this.dx;

      //if an edge is hit, moveDownNextTick lets all enemies know to move down a level
      if ((this.x + this.width >= canvas.width || this.x <= 0)) {
        moveDownNextTick = true;
      }
    }

    if (!gameOver && !this.hit && !gamePaused) {
      //when the number of frames to shoot is met, add a laser to the enemy's array
      this.shotFrame++;
      if (this.shotFrame === this.shotFreq) {
        this.shotFrame = 0;
        this.addLaser();
      }

      //get the next necessary frame for animation if the number of frames necessary is met
      this.animationFrame++;
      if (this.animationFrame === this.animationFreq) {
        this.srcWidth = this.spriteInfo.width;
        this.srcHeight = this.spriteInfo.height;

        if (this.firstAniFrame) {
          this.srcX = this.spriteInfo.x2;
          this.srcY = this.spriteInfo.y2;
          this.firstAniFrame = false;
        }
        else {
          this.srcX = this.spriteInfo.x1;
          this.srcY = this.spriteInfo.y1;
          this.firstAniFrame = true;
        }

        this.animationFrame = 0
      }

      //check if any lasers need to be removed
      this.removeLasers();

      //if the enemy reaches the bottom of the screen, it's an automatic game over
      if (this.y + this.height > canvas.height - (player.getHeight())) {
        gameOver = true;
        player.setLives(0);
        playSounds(explosion);
        console.log(ded);
      }

      //draw the new image
      if (this.hitFrames > 0 && this.hitFrames < 7) {
        this.hitFrames++;
      }
      else {
        this.draw();
        this.hitFrames = 0;
      }
    }

    else if (this.hit && this.killFrames < 15) {
      this.killFrames++;
      this.draw();
    }

    else if (this.hit) {
      this.x = -500;
      this.y = -500;
    }
  }
}

/* Game logic */
let player;
let enemies = [];
let levels = [];
let enemyWidth = canvas.width / 19;
let enemyHeight = canvas.height / 20;

// Creates enemies for each level
let createEnemies = function(speed) {
  numOfEnemies = 0;
  enemies = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      let enemyType = j % 3;
      let fireRate = Math.floor(Math.random() * 1000) + 200;
      let x = i * (2 * enemyWidth * 1.15);
      let y = j * (1.5 * enemyHeight) + 55;

      enemies.push(new Enemy(x, y, speed, Math.ceil(enemyHeight * (1 / 2.5)), enemyWidth, enemyHeight, fireRate, spriteSheet, enemyType));
      numOfEnemies++;
    }
  }
}

// levels differ by the speed of the enemies and the number of lives of some enemies
let level1 = function() {
  level = 1;
  let speed = 2;
  createEnemies(speed);
}

let level2 = function() {
  level = 2;
  let speed = 3;
  createEnemies(speed);
}

let level3 = function() {
  level = 3;
  let speed = 4;
  createEnemies(speed);
}

levels.push(level1);
levels.push(level2);
levels.push(level3);
// Seven additional missions reuse the original wave constructor, with bounded speed.
for (let mission = 4; mission <= 10; mission++) {
  levels.push(function() {
    level = mission;
    createEnemies(Math.min(4.6, 4 + (mission - 3) * 0.1));
  });
}

// initialize the start of the game
let init = function() {
  levels[0]();
  level = 1;
  score = 0;
  audioTick = 0;

  let playerWidth = canvas.width / 16;
  let playerHeight = canvas.height / 18;
  player = new Player((canvas.width / 2) - 25, 10, playerWidth, playerHeight, spriteSheet, 150, 637, 73, 53);
}

// check collisions
let laserHitCheck = function() {
  let playerLasers = player.getLasers();
  let enemyLasers = [];

  // get all of the enemies' lasers
  for (let i = 0; i < enemies.length; i++) {
    enemyLasers = enemyLasers.concat(enemies[i].getLasers());
  }

  //check if player hit an enemy
  for (let i = 0; i < playerLasers.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (playerLasers[i].getX() >= enemies[j].getX() && playerLasers[i].getX() + playerLasers[i].getWidth() <= enemies[j].getX() + enemies[j].getWidth() &&
          playerLasers[i].getY() >= enemies[j].getY() && playerLasers[i].getY() + playerLasers[i].getHeight() <= enemies[j].getY() + enemies[j].getHeight() &&
          !enemies[j].getHit() && !playerLasers[i].getHit()) {
        playerLasers[i].clear();

        score += 100;
        enemies[j].clear();
      }
    }
  }

  //check if enemy hit the player
  for (let i = 0; i < enemyLasers.length; i++) {
    if (!gamePaused && !gameOver && !enemyLasers[i].getHit() && enemyLasers[i].getX() >= player.getX() && enemyLasers[i].getX() + enemyLasers[i].getWidth() <= player.getX() + player.getWidth() &&
      enemyLasers[i].getY() >= player.getY() && enemyLasers[i].getY() + enemyLasers[i].getHeight() <= player.getY() + player.getHeight()) {
        enemyLasers[i].clear();

        score -= 1100;
        gamePaused = true;
        player.loseLife();
    }
  }
}

//if an edge has been hit, all eneies will be moved down when they update this tick
function moveAllEnemiesDownCheck() {
  if (moveDownNextTick) {
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].setY(enemies[i].getY() + enemies[i].getDy());
      enemies[i].setDx(enemies[i].getDx() * -1);
    }
    moveDownNextTick = false;
  }
}

//draw the "Press Enter To Start" screen when the user navigates to the screen
//the text appears when "flash" is true
var flash = false;
let drawStart = function() {
  drawBackground();
  if (flash) {
    let text = "Press Enter To Start";
    let fontSize = "28px"
    // if (window.innerWidth >= 1000) {
    //   text += " To Start";
    // }
    // if (window.innerWidth >= 1400) {
    //   fontSize = "28px";
    // }
    context.font = `${fontSize} 'Press Start 2P', cursive`;
    context.fillStyle = "white";
    context.fillText(text, canvas.width / 10, canvas.height / 2);
    flash = false;
  }
  else flash = true;
}

//draw prompt to restart game
let drawRestart = function() {
  context.font = "15px 'Press Start 2P', cursive";
  context.fillStyle = "white";
  context.fillText("Press Enter to restart game", canvas.width / 2 - 200, canvas.height / 2 + 100);
}

//draw the number of lives at the top of the screen along with the line separating the top portion from the game
let life = new Image();
life.src = spriteSheet;
let drawLives = function() {
  context.beginPath();
  context.moveTo(0, 45);
  context.lineTo(canvas.width, 45);
  context.strokeStyle = "white";
  context.stroke();

  context.font = "15px 'Press Start 2P', cursive";
  context.fillStyle = "white";
  context.fillText("Lives", canvas.width - 350, 31);

  for (let i = 0; i < player.getLives(); i++) {
    context.drawImage(life, 150, 637, 73, 53, canvas.width - 250 + (i * 50), 8, 30, 25);
  }
}

//draw the user's score
let drawScore = function() {
  context.font = "15px 'Press Start 2P', cursive";
  context.fillStyle = "white";
  context.fillText(`Score: ${score}`, 30, 30);
}

//draw the text to indicate the user has made it to the next level
let drawNextLevel = function() {
  let levelDisplayed = level + 1;
  context.font = "30px 'Press Start 2P', cursive";
  context.fillStyle = "white";
  context.fillText(`Level ${levelDisplayed}`, canvas.width / 2 - 110, canvas.height / 2);
}

//draw the text indicating that the user has won
let youWin = function() {
  context.font = "40px 'Press Start 2P', cursive";
  context.fillStyle = "white";
  context.fillText("You Win!!!", canvas.width / 2 - 190, canvas.height / 2);
  drawRestart();

  gameWon = true;
}

//draw the text indicating that the user has won
let checkGamePaused = function() {
  if (gamePaused && !gameOver) {
    if (gamePausedDelay < 150) {
      activeKey = -1;
      player.clearLasers();
      for (let i = 0; i < enemies.length; i++) {
        enemies[i].clearLasers();
      }
      gamePausedDelay++;
      context.font = "40px 'Press Start 2P', cursive";
      context.fillStyle = "white";
      context.fillText(`Lives: ${player.getLives()}`, canvas.width / 2 - 160, canvas.height / 2);
    }
    else {
      gamePausedDelay = 0;
      gamePaused = false;
      player.setX((canvas.width / 2) - 25);
    }
  }
}

//if gameOver has been set to true, display the game over screen
let checkGameOver = function() {
  if (gameOver) {
    context.font = "40px 'Press Start 2P', cursive";
    context.fillStyle = "white";
    context.fillText("Game Over", canvas.width / 2 - 175, canvas.height / 2);
    drawRestart();
  }
}

//check if all enemies have been defeated. If they have, check if all levels have been beaten
//if all levels have been beaten, display "you win" text. otherwise, display "next level" text and reset necessary variables
let endOfLevelCheck = function() {
  if (numOfEnemies === 0) {
    if (level < levels.length) {
      //nextLevelDelay is used to keep track of the number of ticks between the end of one level and start of the next
      nextLevelDelay++;
      if (nextLevelDelay === 250) {
        level++;
        nextLevelDelay = 0;
        audioTick = 0;
        levels[level - 1]();
      }
      else drawNextLevel();
    }
    else {
      youWin();
    }
  }
}

//function to play enemy sounds while they move
let playEnemyMovementSounds = function() {
  // ticks between sounds decreases by the level
  let maxTick = 15 + Math.floor(50 / level);

  //only play sound or increment the tick count between plays if this condition is met
  let gameCondition = gameStart && !gameOver && !gameWon && !gamePaused && nextLevelDelay === 0;
  if (audioTick === maxTick && gameCondition) {
    playSounds(enemySounds[enemyAudioTrack]);
    enemyAudioTrack = (enemyAudioTrack + 1) % 4;
    audioTick = 0;
  }
  else if (gameCondition) audioTick++;
  else enemyAudioTrack = 0;
}

//funtion that's run to play game
//updates all of the necessary components to keep game running
// A fixed 60 Hz simulation preserves the original frame-based speeds on any display.
let previousFrame = 0;
let simulationBank = 0;
let gameLoop = function(now) {
  requestAnimationFrame(gameLoop);
  IOT_INPUT.poll(now);
  if (IOT_CAMPAIGN.state.phase !== "battle") {
    previousFrame = now; simulationBank = 0;
    IOT_CAMPAIGN.draw();
    return;
  }
  const elapsed = previousFrame ? Math.min(83, now - previousFrame) : 16.67;
  previousFrame = now;
  simulationBank += elapsed;
  if (simulationBank < 1000 / 60) return;
  while (simulationBank >= 1000 / 60 && IOT_CAMPAIGN.state.phase === "battle") {
    simulationBank -= 1000 / 60;
    drawBackground();
    IOT_CAMPAIGN.tick();
    activeKey = IOT_INPUT.down("right") ? 39 : IOT_INPUT.down("left") ? 37 : -1;
    if (!gameWon && !gameOver) {
      player.update(activeKey);
      moveAllEnemiesDownCheck();
      for (const enemy of enemies) enemy.update();
      laserHitCheck();
    }
    if (gameOver || gamePaused) IOT_CAMPAIGN.loss();
    else if (numOfEnemies === 0) IOT_CAMPAIGN.cleared();
    playEnemyMovementSounds();
  }
  drawScore();
  drawLives();
  IOT_CAMPAIGN.draw();
};

// The single router also handles the original arrow/Space/Enter keys.
IOT_INPUT.bind(IOT_CAMPAIGN.input);
void IOT_LEADERBOARD.start();
requestAnimationFrame(gameLoop);
```

## SpaceInvaders-master/SpaceInvaders-master/Styles/main.css

```css
@font-face {
  font-family: "Press Start 2P";
  src: url("../fonts/PressStart2P.ttf");
  font-display: swap;
}
html, body { width: 100%; height: 100%; overflow: hidden; }
body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: black;
  color: white;
  overscroll-behavior: none;
}
canvas { font-family: "Press Start 2P", monospace; }
#game-canvas {
  outline: 1px solid white;
  width: min(100vw, 116.6667vh);
  height: min(100vh, 85.7143vw);
  object-fit: contain;
  image-rendering: pixelated;
}
#background-canvas {
  border: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  inset: 0;
  z-index: -1;
}
```

## SpaceInvaders-master/SpaceInvaders-master/index.html

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#000000">
    <title>Space Invaders — IoT Defence</title>
    <link rel="stylesheet" href="Styles/main.css">
  </head>
  <body>
    <canvas id="background-canvas" aria-hidden="true"></canvas>
    <canvas id="game-canvas" width="700" height="600" aria-label="Space Invaders IoT Defence. Use arrow keys and A B C D buttons."></canvas>
    <script src="Scripts/config.js"></script>
    <script src="Scripts/missions.js"></script>
    <script src="Scripts/question-bank.js"></script>
    <script src="Scripts/controls.js"></script>
    <script src="Scripts/leaderboard.js"></script>
    <script src="Scripts/campaign.js"></script>
    <script src="Scripts/background.js"></script>
    <script src="Scripts/script.js"></script>
  </body>
</html>
```

## leaderboard.json

```json
{
  "version": 1,
  "entries": []
}
```

## serverless/package-lock.json

```json
{
  "name": "iot-arcade-leaderboard",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "iot-arcade-leaderboard",
      "devDependencies": {
        "wrangler": "^4.0.0"
      }
    },
    "node_modules/@cloudflare/kv-asset-handler": {
      "version": "0.5.0",
      "resolved": "https://registry.npmjs.org/@cloudflare/kv-asset-handler/-/kv-asset-handler-0.5.0.tgz",
      "integrity": "sha512-jxQYkj8dSIzc0cD6cMMNdOc1UVjqSqu8BZdor5s8cGjW2I8BjODt/kWPVdY+u9zj3ms75Q5qaZgnxUad83+eAg==",
      "dev": true,
      "license": "MIT OR Apache-2.0",
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@cloudflare/unenv-preset": {
      "version": "2.16.2",
      "resolved": "https://registry.npmjs.org/@cloudflare/unenv-preset/-/unenv-preset-2.16.2.tgz",
      "integrity": "sha512-JBP1+Z7ZSNG/d4mRP+y8VC5dka3tZVMLEZRvS+rzQ4DGV1EoxRFQckcJTTkXbHSQiTj0DtNI01Zwb/V2fX0mvQ==",
      "dev": true,
      "license": "MIT OR Apache-2.0",
      "peerDependencies": {
        "unenv": "2.0.0-rc.24",
        "workerd": ">1.20260305.0 <2.0.0-0"
      },
      "peerDependenciesMeta": {
        "workerd": {
          "optional": true
        }
      }
    },
    "node_modules/@cloudflare/workerd-darwin-64": {
      "version": "1.20261113.1",
      "resolved": "https://registry.npmjs.org/@cloudflare/workerd-darwin-64/-/workerd-darwin-64-1.20261113.1.tgz",
      "integrity": "sha512-UcShHyWJVZNbuI8jL3F5QZXMrJm7oScge33D5p3hAyhIIkoVj72+bior+VcUcr1SBWkh5w3Umnrx179WE7Wvpw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@cloudflare/workerd-darwin-arm64": {
      "version": "1.20261113.1",
      "resolved": "https://registry.npmjs.org/@cloudflare/workerd-darwin-arm64/-/workerd-darwin-arm64-1.20261113.1.tgz",
      "integrity": "sha512-bKfFcpueb9GOg0NZSR4x7dpEJZMsQOwCk0XzsAoXoBfG4osFRQcFxtAhrXvB1y445zXFLhrEkDJ/+LvGAMkPSg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@cloudflare/workerd-linux-64": {
      "version": "1.20261113.1",
      "resolved": "https://registry.npmjs.org/@cloudflare/workerd-linux-64/-/workerd-linux-64-1.20261113.1.tgz",
      "integrity": "sha512-3VCnXzi7apwPSMwkiTIeEc5z/UWWGQXBZZNHCBBCXPlavWCR06SQ77tO0rEoKonfjBGW0MQaHNZ7U1pCPe4v3g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@cloudflare/workerd-linux-arm64": {
      "version": "1.20261113.1",
      "resolved": "https://registry.npmjs.org/@cloudflare/workerd-linux-arm64/-/workerd-linux-arm64-1.20261113.1.tgz",
      "integrity": "sha512-phnb1686FTIVSr4qxQFOt7MyiWMotqsVUyZVnQl579/bCrqWaYUcRnikN5f6bBpDbxCk1OvOvYz0ykjT1lvYpg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@cloudflare/workerd-windows-64": {
      "version": "1.20261113.1",
      "resolved": "https://registry.npmjs.org/@cloudflare/workerd-windows-64/-/workerd-windows-64-1.20261113.1.tgz",
      "integrity": "sha512-WtQakCAIzUQJ6dQDPn7kIGlFJ9yjB0ooNx2WFqEHLYNAT7TLCNyaORem2WVM38TceVR8flCP5UWgYm6ht3dlIw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@cspotcode/source-map-support": {
      "version": "0.8.1",
      "resolved": "https://registry.npmjs.org/@cspotcode/source-map-support/-/source-map-support-0.8.1.tgz",
      "integrity": "sha512-IchNf6dN4tHoMFIn/7OE8LWZ19Y6q/67Bmf6vnGREv8RSbBVb9LPJxEcnwrcwX6ixSvaiGoomAUvu4YSxXrVgw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/trace-mapping": "0.3.9"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@emnapi/runtime": {
      "version": "1.11.3",
      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.11.3.tgz",
      "integrity": "sha512-Xz4Tpyki7XyrpbUK1jR1AhdAdaXyhhY4lZ3neLodmhpuWfy2PAQN5B46sAiU4liOXGLkHypn/qU+jvfWSCYYLA==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz",
      "integrity": "sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz",
      "integrity": "sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz",
      "integrity": "sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz",
      "integrity": "sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz",
      "integrity": "sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz",
      "integrity": "sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz",
      "integrity": "sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz",
      "integrity": "sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz",
      "integrity": "sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz",
      "integrity": "sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz",
      "integrity": "sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz",
      "integrity": "sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz",
      "integrity": "sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz",
      "integrity": "sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz",
      "integrity": "sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz",
      "integrity": "sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz",
      "integrity": "sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz",
      "integrity": "sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz",
      "integrity": "sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz",
      "integrity": "sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz",
      "integrity": "sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz",
      "integrity": "sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz",
      "integrity": "sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz",
      "integrity": "sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@img/colour": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@img/colour/-/colour-1.1.0.tgz",
      "integrity": "sha512-Td76q7j57o/tLVdgS746cYARfSyxk8iEfRxewL9h4OMzYhbW4TAcppl0mT4eyqXddh6L/jwoM75mo7ixa/pCeQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@img/sharp-darwin-arm64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-arm64/-/sharp-darwin-arm64-0.35.5.tgz",
      "integrity": "sha512-QRUlFQ0WxvdWyqqG/WtI3iupfD5rBzmCHXSdPsY91sAtVtTo7Q4cb6zOccZ3gqEqkr0f1As1ehLqmEpDsRf+lg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-darwin-arm64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-darwin-x64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-x64/-/sharp-darwin-x64-0.35.5.tgz",
      "integrity": "sha512-+BR255RhDlpygUpOc/Jdt1nT6DQ3XG/ERo5wbcdOf5Q320dKtPCKPLR1LJs9VGXRaMa8l1uUa0tkCNOXiAxZUw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-darwin-x64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-freebsd-wasm32": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-freebsd-wasm32/-/sharp-freebsd-wasm32-0.35.5.tgz",
      "integrity": "sha512-Y/z91nEZ4uIBX5X3nfTovjU9lHNKFYbL2lpHCLVNmXQK03VIZvXBBt0KxbPGp2SdGSF+2mQU4e+hQaWOt86iAw==",
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "dependencies": {
        "@img/sharp-wasm32": "0.35.5"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-darwin-arm64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-arm64/-/sharp-libvips-darwin-arm64-1.3.4.tgz",
      "integrity": "sha512-5R89nBYiRdUlSWJxPhO+GVtaXzXSxKnRu/xqMn3KTA3L9EB9Oy/P+Nn2f2vlhPuUdy/Zusb2DarbyTpGCfEDuw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "darwin"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-darwin-x64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-x64/-/sharp-libvips-darwin-x64-1.3.4.tgz",
      "integrity": "sha512-iR2OKH80yi0U+dUplyh3/xdpFvps6YkCwsXenIJxqxR1v9o+xtKTGbS9H7cps+2Vxjc8B1j96p75NmTGjIhtpQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "darwin"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-arm": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm/-/sharp-libvips-linux-arm-1.3.4.tgz",
      "integrity": "sha512-LmRtTsOHuvM2+wlO2Db37dx5MiZhB0FvSunciw48YjdOkZz9KAiRbm8ujeMOA1INqmei5NapFxYEK1D1ZSidmw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-arm64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.3.4.tgz",
      "integrity": "sha512-Y3dgX/6lE2QhQb+Gxy0WZxfg9MEm/JBjamZpS2IklP7xIQoKN4hzAm7KcMVGtaVDt3neE9OKBC7vAfonA/Lr1A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-ppc64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-ppc64/-/sharp-libvips-linux-ppc64-1.3.4.tgz",
      "integrity": "sha512-Le6boB8Tai0Nis+gIxIpKx68UDVVIqdR8Tin5Yf1z2LJJQLDJvCDRqRu+jC2qCoD+eIomonmOwB4smBRxfVpYQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-riscv64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-riscv64/-/sharp-libvips-linux-riscv64-1.3.4.tgz",
      "integrity": "sha512-aHkkIEHPRdQEegJN20MLmGtxYD9R2wQr3Cwpddnu5+YKMt6Uzax7S9h5gpZTo8wyrGuZSlfQ63OevL5mTyOC7Q==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-s390x": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-s390x/-/sharp-libvips-linux-s390x-1.3.4.tgz",
      "integrity": "sha512-ra/mB6MikESDUO7Yg+Mi95bFBb9GsObURuhnOv3OqknjGe9sZrG8tCe9q0xSIGrtLgvgw0gKnFWcK4blSgQOuQ==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-x64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-1.3.4.tgz",
      "integrity": "sha512-GJ//SSXbnwSDes02umB3nDJLFcQzw8a18V8fyhqr6tV515tOEMdImjjxj1AoafMRz56F3PHgftnj1QEKSU1zkw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linuxmusl-arm64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-arm64/-/sharp-libvips-linuxmusl-arm64-1.3.4.tgz",
      "integrity": "sha512-hvulFwtjUcagsis6BBxHwGFwWoNZjgYmULGVrZcyfNbjA8hKILbRxGg15/7w5HDyXHXUos/j6baAWqnCyQ2DWA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linuxmusl-x64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-x64/-/sharp-libvips-linuxmusl-x64-1.3.4.tgz",
      "integrity": "sha512-6zXKeE/p39I1AmA3cJG35eyBGNqNddLnUXjhwBnsGjFPWqf5VKkDBEqaEkPDoTEtkxwi2vv8Tcr2mDyP4So7Fg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-linux-arm": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm/-/sharp-linux-arm-0.35.5.tgz",
      "integrity": "sha512-LEaXK2WdXVK5ykcw0buWyPMsmLLL2vpHLD6yrNSW+JGEL3BZPA4tpKN6iaMc4AxTTAoaX/sU1rOL51lcIz48ZQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-arm": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linux-arm64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm64/-/sharp-linux-arm64-0.35.5.tgz",
      "integrity": "sha512-LYVx5JTsOM2CBzmxreh+nl64/3H6Xb09iSLknqH47z2T2DFFxDeFLP5y4dJwe6H7uGQlHPyEEtIqyo3DYsRwdQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-arm64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linux-ppc64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-ppc64/-/sharp-linux-ppc64-0.35.5.tgz",
      "integrity": "sha512-QVxAAq8evVRI9ia2vqgwrmWucn5Dfv+JdWzj75pD8omHLPSP7f8p20O8jxzjCcuCEQEOtYOZUmX1hkiZ0kdevA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-ppc64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linux-riscv64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-riscv64/-/sharp-linux-riscv64-0.35.5.tgz",
      "integrity": "sha512-LtdreXguaavKODPIfzJ4kffx7UNt1omwtK0rch4EBbbSTXPnxWmYSayXdLJw0fJzQ97kHt1gL/yh4tvU+nCyRQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-riscv64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linux-s390x": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-s390x/-/sharp-linux-s390x-0.35.5.tgz",
      "integrity": "sha512-UZasTOFiYzotTsGOCu42BfUzP6Tu6Do/947iRm1RsLKvlllxwGcn4RN27LibGWceix4Y+Pmw3jsnTcCQIgWjqA==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-s390x": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linux-x64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-x64/-/sharp-linux-x64-0.35.5.tgz",
      "integrity": "sha512-SxFtLTeJInhAA9Q836kux2vZNeOBQEx658qvbboZScr0wIARym3IcGmW7KpVD5sbVg0Ojy+udFQdayYIZyoNog==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-x64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linuxmusl-arm64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-arm64/-/sharp-linuxmusl-arm64-0.35.5.tgz",
      "integrity": "sha512-9HbMclmI1zlNkFRs3z9/eBtDjfD0sGlrX1z6b1qwmiFY5ElDLh4BC0LPBdVp7z1DXFiKlIcznf+ZlsuZzLxQqg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linuxmusl-arm64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linuxmusl-x64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-x64/-/sharp-linuxmusl-x64-0.35.5.tgz",
      "integrity": "sha512-4KOphqB035HrVdqLZfCgMzzERrQkkzOwRhl4OAkRO1YCldbaFjySXMaK534Mo0V+LndnlJk+sbUyLeU0ULyD1A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linuxmusl-x64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-wasm32": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-wasm32/-/sharp-wasm32-0.35.5.tgz",
      "integrity": "sha512-Ptsga1su4tQx+LLF1ECS9U6nz5kmrXKo6XVbtR48Ke3ZRxxgaWBu7IDtEe1quo8hiupwm6WFqxVlXaSf7IINGQ==",
      "dev": true,
      "license": "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/runtime": "^1.11.3"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-webcontainers-wasm32": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-webcontainers-wasm32/-/sharp-webcontainers-wasm32-0.35.5.tgz",
      "integrity": "sha512-hfhF/FmoQyTUkA0bIKFOtw536BQSeBMe6BF6QyWlrPxT754+TFLaZ7sKKTfvvM0yJgKgaYTwnFCIZ/GuDw5SUA==",
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "@img/sharp-wasm32": "0.35.5"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-arm64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-arm64/-/sharp-win32-arm64-0.35.5.tgz",
      "integrity": "sha512-X4t7g+7ZA5DKblCBEXGjUqqemj4vczING/5viFwAL8h4N3qYeyjwdCvRLHi4EdOUI+2Z7UFlp1VM+p/AuEtm6Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-ia32": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-ia32/-/sharp-win32-ia32-0.35.5.tgz",
      "integrity": "sha512-5Zm82LoBc43nhwNybZlG7Y1KO//Zhsn306fQl29ZOuStHLGTo3BWL83q3cznX0poxSAMuYL1On/BHBxkBeKr6A==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-x64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-x64/-/sharp-win32-x64-0.35.5.tgz",
      "integrity": "sha512-x76eH0vEiHlcMQu8Y8IenntaACtddpT6W0wmXtWrnKcnKI7ME5DdgqhAD6SEWOEl1v2zDvkZDhFA9KnURwpfqg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.3.tgz",
      "integrity": "sha512-lhTtjtoEArWBjismtfS761S9Hlyn+nIZqOZVYoZ1Xn82PMNMVnk+jj/NhC4fAXGTs7ydONcJiR5vyQBTMDu27g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz",
      "integrity": "sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.9",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.9.tgz",
      "integrity": "sha512-3Belt6tdc8bPgAtbcmdtNJlirVoTmEb5e2gC94PnkwEW9jI6CAHUeoG85tjWP5WquqfavoMtMwiG4P926ZKKuQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.0.3",
        "@jridgewell/sourcemap-codec": "^1.4.10"
      }
    },
    "node_modules/@poppinss/colors": {
      "version": "4.1.6",
      "resolved": "https://registry.npmjs.org/@poppinss/colors/-/colors-4.1.6.tgz",
      "integrity": "sha512-H9xkIdFswbS8n1d6vmRd8+c10t2Qe+rZITbbDHHkQixH5+2x1FDGmi/0K+WgWiqQFKPSlIYB7jlH6Kpfn6Fleg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "kleur": "^4.1.5"
      }
    },
    "node_modules/@poppinss/dumper": {
      "version": "0.6.5",
      "resolved": "https://registry.npmjs.org/@poppinss/dumper/-/dumper-0.6.5.tgz",
      "integrity": "sha512-NBdYIb90J7LfOI32dOewKI1r7wnkiH6m920puQ3qHUeZkxNkQiFnXVWoE6YtFSv6QOiPPf7ys6i+HWWecDz7sw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@poppinss/colors": "^4.1.5",
        "@sindresorhus/is": "^7.0.2",
        "supports-color": "^10.0.0"
      }
    },
    "node_modules/@poppinss/exception": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@poppinss/exception/-/exception-1.2.3.tgz",
      "integrity": "sha512-dCED+QRChTVatE9ibtoaxc+WkdzOSjYTKi/+uacHWIsfodVfpsueo3+DKpgU5Px8qXjgmXkSvhXvSCz3fnP9lw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@sindresorhus/is": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/@sindresorhus/is/-/is-7.2.0.tgz",
      "integrity": "sha512-P1Cz1dWaFfR4IR+U13mqqiGsLFf1KbayybWwdd2vfctdV6hDpUkgCY0nKOLLTMSoRd/jJNjtbqzf13K8DCCXQw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sindresorhus/is?sponsor=1"
      }
    },
    "node_modules/@speed-highlight/core": {
      "version": "1.2.24",
      "resolved": "https://registry.npmjs.org/@speed-highlight/core/-/core-1.2.24.tgz",
      "integrity": "sha512-qeW2e1l78afw8VhRPfPQ1Gjj+KU5XFQ/OFV5ti6eTa9bruO7mJyZtA4vw0ofqmA3tKCkROE9xLk3VZoeRc98nw==",
      "dev": true,
      "license": "CC0-1.0"
    },
    "node_modules/blake3-wasm": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/blake3-wasm/-/blake3-wasm-2.1.5.tgz",
      "integrity": "sha512-F1+K8EbfOZE49dtoPtmxUQrpXaBIl3ICvasLh+nJta0xkz+9kF/7uet9fLnwKqhDrmj6g+6K3Tw9yQPUg2ka5g==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cookie": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/error-stack-parser-es": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/error-stack-parser-es/-/error-stack-parser-es-1.0.5.tgz",
      "integrity": "sha512-5qucVt2XcuGMcEGgWI7i+yZpmpByQ8J1lHhcL7PwqCwu9FPP3VUXzT4ltHe5i2z9dePwEHcDVOAfSnHsOlCXRA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/antfu"
      }
    },
    "node_modules/esbuild": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz",
      "integrity": "sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.28.2",
        "@esbuild/android-arm": "0.28.2",
        "@esbuild/android-arm64": "0.28.2",
        "@esbuild/android-x64": "0.28.2",
        "@esbuild/darwin-arm64": "0.28.2",
        "@esbuild/darwin-x64": "0.28.2",
        "@esbuild/freebsd-arm64": "0.28.2",
        "@esbuild/freebsd-x64": "0.28.2",
        "@esbuild/linux-arm": "0.28.2",
        "@esbuild/linux-arm64": "0.28.2",
        "@esbuild/linux-ia32": "0.28.2",
        "@esbuild/linux-loong64": "0.28.2",
        "@esbuild/linux-mips64el": "0.28.2",
        "@esbuild/linux-ppc64": "0.28.2",
        "@esbuild/linux-riscv64": "0.28.2",
        "@esbuild/linux-s390x": "0.28.2",
        "@esbuild/linux-x64": "0.28.2",
        "@esbuild/netbsd-arm64": "0.28.2",
        "@esbuild/netbsd-x64": "0.28.2",
        "@esbuild/openbsd-arm64": "0.28.2",
        "@esbuild/openbsd-x64": "0.28.2",
        "@esbuild/openharmony-arm64": "0.28.2",
        "@esbuild/sunos-x64": "0.28.2",
        "@esbuild/win32-arm64": "0.28.2",
        "@esbuild/win32-ia32": "0.28.2",
        "@esbuild/win32-x64": "0.28.2"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/kleur": {
      "version": "4.1.5",
      "resolved": "https://registry.npmjs.org/kleur/-/kleur-4.1.5.tgz",
      "integrity": "sha512-o+NO+8WrRiQEE4/7nwRJhN1HWpVmJm511pBHUxPLtp0BUISzlBplORYSmTclCnJvQq2tKu/sgl3xVpkc7ZWuQQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/miniflare": {
      "version": "5.20261113.0-beta",
      "resolved": "https://registry.npmjs.org/miniflare/-/miniflare-5.20261113.0-beta.tgz",
      "integrity": "sha512-Kg+SarKNSn0lkhR88OHI29rIXJvmKs/c9hmxFXvEqK1J9aHu+AFl6CdaBq/k3iOTyMbm2p4h1HGLs7vXaLYMWA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@cspotcode/source-map-support": "0.8.1",
        "sharp": "0.35.5",
        "undici": "7.30.1",
        "workerd": "1.20261113.1",
        "ws": "8.21.0",
        "youch": "4.1.0-beta.10"
      },
      "engines": {
        "node": ">=22.12.0"
      },
      "peerDependencies": {
        "kerberos": "^2.0.0"
      },
      "peerDependenciesMeta": {
        "kerberos": {
          "optional": true
        }
      }
    },
    "node_modules/path-to-regexp": {
      "version": "6.3.0",
      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-6.3.0.tgz",
      "integrity": "sha512-Yhpw4T9C6hPpgPeA28us07OJeqZ5EzQTkbfwuhsUg0c237RomFoETJgmp2sa3F/41gfLE6G5cqcYwznmeEeOlQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/pathe": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
      "integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "7.8.6",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.6.tgz",
      "integrity": "sha512-9lpSSU4Mly3mrtruwLs1eLK6+gzbzqeBFwRNjIjE+9LuDpWdYctrQlQ3ej1Ilgi7gknpsTRnPoLP8DpCHqHIJw==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/sharp": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/sharp/-/sharp-0.35.5.tgz",
      "integrity": "sha512-Ywn4OnzGukp7CDMrp08RQ50YKmuwG47brZgIVPTvBaaAfQlRlygrRqSrxdCiL9M+LlzLBiJ68IR1QqvzHyjC7g==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@img/colour": "^1.1.0",
        "detect-libc": "^2.1.2",
        "semver": "^7.8.5"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-darwin-arm64": "0.35.5",
        "@img/sharp-darwin-x64": "0.35.5",
        "@img/sharp-freebsd-wasm32": "0.35.5",
        "@img/sharp-libvips-darwin-arm64": "1.3.4",
        "@img/sharp-libvips-darwin-x64": "1.3.4",
        "@img/sharp-libvips-linux-arm": "1.3.4",
        "@img/sharp-libvips-linux-arm64": "1.3.4",
        "@img/sharp-libvips-linux-ppc64": "1.3.4",
        "@img/sharp-libvips-linux-riscv64": "1.3.4",
        "@img/sharp-libvips-linux-s390x": "1.3.4",
        "@img/sharp-libvips-linux-x64": "1.3.4",
        "@img/sharp-libvips-linuxmusl-arm64": "1.3.4",
        "@img/sharp-libvips-linuxmusl-x64": "1.3.4",
        "@img/sharp-linux-arm": "0.35.5",
        "@img/sharp-linux-arm64": "0.35.5",
        "@img/sharp-linux-ppc64": "0.35.5",
        "@img/sharp-linux-riscv64": "0.35.5",
        "@img/sharp-linux-s390x": "0.35.5",
        "@img/sharp-linux-x64": "0.35.5",
        "@img/sharp-linuxmusl-arm64": "0.35.5",
        "@img/sharp-linuxmusl-x64": "0.35.5",
        "@img/sharp-webcontainers-wasm32": "0.35.5",
        "@img/sharp-win32-arm64": "0.35.5",
        "@img/sharp-win32-ia32": "0.35.5",
        "@img/sharp-win32-x64": "0.35.5"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        }
      }
    },
    "node_modules/supports-color": {
      "version": "10.2.2",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-10.2.2.tgz",
      "integrity": "sha512-SS+jx45GF1QjgEXQx4NJZV9ImqmO2NPz5FNsIHrsDjh2YsHnawpan7SNQ1o8NuhrbHZy9AZhIoCUiCeaW/C80g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/chalk/supports-color?sponsor=1"
      }
    },
    "node_modules/tslib": {
      "version": "2.9.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.9.1.tgz",
      "integrity": "sha512-a4Ux9VKuIMHsOS7ENbEq6hK2ZGYIT27Rtl0E4eD9KqwxhKiQeMZE/9xb3IdYwWaSOyIBQLExhQgXDTYoiCxnWA==",
      "dev": true,
      "license": "0BSD",
      "optional": true
    },
    "node_modules/undici": {
      "version": "7.30.1",
      "resolved": "https://registry.npmjs.org/undici/-/undici-7.30.1.tgz",
      "integrity": "sha512-03KrMbjIFDWQR5RNPrSw3bd1r12JpyFQl9/yxjUbJtqkjmllqC5lFjZh6ujeuJCKr8EOQvRW872Oy/az+nLYxg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=20.18.1"
      }
    },
    "node_modules/unenv": {
      "version": "2.0.0-rc.24",
      "resolved": "https://registry.npmjs.org/unenv/-/unenv-2.0.0-rc.24.tgz",
      "integrity": "sha512-i7qRCmY42zmCwnYlh9H2SvLEypEFGye5iRmEMKjcGi7zk9UquigRjFtTLz0TYqr0ZGLZhaMHl/foy1bZR+Cwlw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "pathe": "^2.0.3"
      }
    },
    "node_modules/workerd": {
      "version": "1.20261113.1",
      "resolved": "https://registry.npmjs.org/workerd/-/workerd-1.20261113.1.tgz",
      "integrity": "sha512-FJP8Bm1jiiJTE2xpSIhT9JkMaKzU54y9Jk0q7n3BLWyWdUNsn35QGCqARcqXGwO3FGkvahhYqUEG2bJzlgcfhw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "bin": {
        "workerd": "bin/workerd"
      },
      "engines": {
        "node": ">=16"
      },
      "optionalDependencies": {
        "@cloudflare/workerd-darwin-64": "1.20261113.1",
        "@cloudflare/workerd-darwin-arm64": "1.20261113.1",
        "@cloudflare/workerd-linux-64": "1.20261113.1",
        "@cloudflare/workerd-linux-arm64": "1.20261113.1",
        "@cloudflare/workerd-windows-64": "1.20261113.1"
      }
    },
    "node_modules/wrangler": {
      "version": "4.162.0",
      "resolved": "https://registry.npmjs.org/wrangler/-/wrangler-4.162.0.tgz",
      "integrity": "sha512-jUnlzHKlWdW4MFXPgeYbe0+c4oTy/AAZfL/IUz921+dZBY5nJ48xjpvwff5djUR1MXoJRevzntAP/U97TUhPEw==",
      "dev": true,
      "license": "MIT OR Apache-2.0",
      "dependencies": {
        "@cloudflare/kv-asset-handler": "0.5.0",
        "@cloudflare/unenv-preset": "2.16.2",
        "@cspotcode/source-map-support": "0.8.1",
        "blake3-wasm": "2.1.5",
        "esbuild": "0.28.2",
        "miniflare": "5.20261113.0-beta",
        "path-to-regexp": "6.3.0",
        "unenv": "2.0.0-rc.24",
        "workerd": "1.20261113.1"
      },
      "bin": {
        "cf-wrangler": "bin/cf-wrangler.js",
        "wrangler": "bin/wrangler.js",
        "wrangler2": "bin/wrangler.js"
      },
      "engines": {
        "node": ">=22.12.0"
      },
      "optionalDependencies": {
        "fsevents": "2.3.3"
      },
      "peerDependencies": {
        "@cloudflare/workers-types": "^5.20261113.1"
      },
      "peerDependenciesMeta": {
        "@cloudflare/workers-types": {
          "optional": true
        }
      }
    },
    "node_modules/ws": {
      "version": "8.21.0",
      "resolved": "https://registry.npmjs.org/ws/-/ws-8.21.0.tgz",
      "integrity": "sha512-Vsp28b7DRcimFQvrqu2Wek3z1iYxDCWqHYB8Qsnk/S4RfaCQzPGPyBNuVjJV3cd6UiKtUtp6sNM77gWvzcCH+g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": ">=5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/youch": {
      "version": "4.1.0-beta.10",
      "resolved": "https://registry.npmjs.org/youch/-/youch-4.1.0-beta.10.tgz",
      "integrity": "sha512-rLfVLB4FgQneDr0dv1oddCVZmKjcJ6yX6mS4pU82Mq/Dt9a3cLZQ62pDBL4AUO+uVrCvtWz3ZFUL2HFAFJ/BXQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@poppinss/colors": "^4.1.5",
        "@poppinss/dumper": "^0.6.4",
        "@speed-highlight/core": "^1.2.7",
        "cookie": "^1.0.2",
        "youch-core": "^0.3.3"
      }
    },
    "node_modules/youch-core": {
      "version": "0.3.3",
      "resolved": "https://registry.npmjs.org/youch-core/-/youch-core-0.3.3.tgz",
      "integrity": "sha512-ho7XuGjLaJ2hWHoK8yFnsUGy2Y5uDpqSTq1FkHLK4/oqKtyUU1AFbOOxY4IpC9f0fTLjwYbslUz0Po5BpD1wrA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@poppinss/exception": "^1.2.2",
        "error-stack-parser-es": "^1.0.5"
      }
    }
  }
}
```

## serverless/package.json

```json
{
  "name": "iot-arcade-leaderboard",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "check": "wrangler deploy --dry-run",
    "test": "node --test ../tests/worker.test.mjs"
  },
  "devDependencies": { "wrangler": "^4.0.0" }
}
```

## serverless/src/worker.js

```javascript
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
  if (value.build !== 'iot-v1') throw new HttpError(400, 'Unsupported game build');
  if (!Number.isInteger(value.completed) || value.completed < 0 || value.completed > 10) throw new HttpError(400, 'Invalid mission count');
  let maximum = 0;
  for (let wave = 1; wave <= Math.min(value.completed + 1, 10); wave++) maximum += wave === 1 ? 2500 : wave === 2 ? 4000 : 5000;
  maximum += value.completed * 700;
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
```

## serverless/wrangler.toml

```toml
name = "iot-leaderboard"
main = "src/worker.js"
compatibility_date = "2026-01-01"

[vars]
GITHUB_REPO = "GoodUevyxts/Space-Invaders"
GITHUB_BRANCH = "scores"
GITHUB_PATH = "leaderboard.json"
# Add your exact Render HTTPS origin, without a trailing slash.
ALLOWED_ORIGINS = "http://localhost:8000,http://127.0.0.1:8000"

[[durable_objects.bindings]]
name = "BOARD"
class_name = "Leaderboard"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["Leaderboard"]
```

## tests/browser.cjs

```javascript
/* Run with Playwright available and the game served at localhost:8000. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:800,height:480}});
  const page=await context.newPage(); const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:8000');
  await page.waitForFunction(()=>window.IOT_CAMPAIGN);
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
  // A real collision invokes a question after losing a life.
  await page.evaluate(()=>{enemies[0].lasers.push(new Laser(player.x+5,player.y+1,0,6,6,true));laserHitCheck();});
  await wait('question'); assert.equal(await page.evaluate(()=>player.lives),4);
  await page.screenshot({path:require('node:path').join(require('node:os').tmpdir(),'iot-death-question.png')});
  const frames=await page.evaluate(()=>IOT_CAMPAIGN.state.m.battleFrames);
  await page.waitForTimeout(150); assert.equal(await page.evaluate(()=>IOT_CAMPAIGN.state.m.battleFrames),frames);
  await answerCorrect();await wait('battle');
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
  assert.deepEqual(errors,[]); console.log('PASS: 60-question schema, four-button flow, Kanban limit, collisions, paused questions, offline persistence, ten reviews and victory.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
```

## tests/worker.test.mjs

```javascript
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
```

