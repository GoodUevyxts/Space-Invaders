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
| Add | GAME/Scripts/generated-questions.js | Offline export of approved MCP questions |
| Add | GAME/data/generated-questions.json | Published generated-question source data |
| Add | GAME/Scripts/campaign.js | Briefs, Kanban, risk register, events, questions, reviews, name entry |
| Add | GAME/Scripts/leaderboard.js | IndexedDB score outbox, cached top ten and automatic retries |
| Add | serverless/src/worker.js | Validated submission and GitHub commits, with serialized writes |
| Add | serverless/package.json | Worker commands and dependencies |
| Add | serverless/package-lock.json | Reproducible Worker dependencies |
| Add | serverless/wrangler.toml | Cloudflare configuration; public settings only |
| Add | leaderboard.json | Initial empty board; copy to the dedicated scores branch |
| Add | tests/worker.test.mjs | Validation, retry, conflict, rate and ranking checks |
| Add | tests/browser.cjs | Browser flow and offline persistence checks |
| Add | .gitignore | Excludes local secrets, dependencies and unpublished drafts |
| Add | mcp.json | MCP client JSON template |
| Add | mcp/ | Question-generation server, config generator, dependency lock and protocol tests |
| Add | MCP_QUESTIONS.md | MCP setup and generation/review/export workflow |
| Add | CRITERIA_STATUS.md | Source implementation versus deployment status |
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

Space remains a fire/confirm alias for A; Enter remains a start/continue/submit alias for D; Escape aliases B. On a question screen those aliases also choose their numbered answer. Arrows highlight for orientation, but the four answer buttons select directly, as requested. No mouse or touch is needed. Change the key arrays in `Scripts/config.js` if your emitted keys differ. Optional browser Gamepad input is disabled by default so JoyToKey does not double-trigger actions. Set `gamepad.enabled` to true only when using direct Gamepad input instead of keyboard emulation.

## Gameplay and project management

Each mission starts with an objective, budget ($1,400 on missions 1-3, $1,200 thereafter), team capacity (18 hours), and deadline (12-14 simulated hours). The Kanban board has To Do, Doing and Done states and a Doing limit of one. Starting a task places it in Doing; completing it spends its stated money and hours. B returns a Doing task to To Do. Completion cannot exceed capacity. Two completed tasks add one extra simultaneous-laser slot. Correct answers also unlock multi-laser volleys as described below. Undelivered tasks remain visible and earn no review bonus.

Two risk entries start at likelihood x impact: 4x5=20 and 3x4=12. A mitigation costs money and two hours, lowers likelihood to one, and leaves impact unchanged. B explicitly accepts the exposure. Both risks must be decided before launch; you can launch with accepted risk or unfinished tasks. There is a short explanation after every consequential task, security, risk and event decision.

Each mission draws one random event at launch: added scope, a budget cut, a security incident, or a quiet window. A/B responses trade scope, money, deadline and risk. A budget cut cannot retroactively remove money already spent. There is no real-money spending.

Each criterion starts with six distinct questions (60 total), plus any approved MCP exports; question order and four answer positions are shuffled every mission. Questions appear after losing a life, including the final life. At least three different questions must be answered before the mission review, so clearing a wave without being hit still covers the criterion. The Security planning tab also offers questions. A secure answer reduces exposure by two points (with total exposure floored at zero). A wrong answer remains recorded and adds three exposure points; the explanation teaches the correct principle. Once every question in that mission bank is answered, later life losses use practice questions without changing the original result or awarding more points. This prevents farming repeated questions for bonuses.

Lower exposure sets a slower base enemy-bullet speed (4/6/7 pixels per simulation tick). A separate pressure value modifies enemy movement, shooting frequency and bullet speed: losing a life or giving a fresh wrong answer adds one pressure point; a fresh correct answer removes one. Pressure is bounded from -3 to +4 and resets for each mission. Each point changes formation speed by 6%, firing frequency by about 5%, and bullet speed by 0.3 pixels/tick, with a bullet-speed cap. Negative pressure is easier; positive pressure is harder. Normal enemy speed is retained for waves 1-3 and rises gently, with a cap, for waves 4-10. Menus and questions pause all combat and its clock. Shooter simulation runs at 60 ticks/second, preserving its frame-based movement across display refresh rates. Menus do not need a time limit on the small screen.

Review shows actual spending, tasks delivered, deadline met/missed and change in risk. Time is completed task/mitigation/event effort plus one simulated hour per 15 seconds of active combat. Security questions do not consume team hours. Risk reduction is the initial 32 exposure points minus current exposure, including security-answer reductions and wrong-answer additions. A negative reduction means risk increased. Deadline performance is assessed even on a failed mission; failure itself is shown separately.

Original scoring remains +100 per enemy hit and -1,100 per lost life. Each of the first six fresh correct answers in a mission immediately adds 100 points, even if that wave is later lost; further questions still affect pressure and exposure but add no more answer points. Repeating an answered question gives no point or pressure reward. The first fresh correct answer unlocks a two-laser parallel volley from one fire press; the second unlocks a three-laser volley. Two volleys can be on screen at once, with an extra laser slot for completing two Kanban tasks. Weapons are recalculated per mission. A cleared wave adds a separate review bonus of up to 700: 100 each for the first three secure answers, 100 per delivered task, and 100 when risk fell and the deadline was met. A failed wave earns no review bonus. Three secure answers restore one life after a cleared wave, capped at five. The iot-v2 maximum full-campaign score is 59,500: 46,500 from enemy hits, up to 6,000 immediate answer bonuses and up to 7,000 review bonuses. The Worker also accepts queued iot-v1 scores under their older 53,500 maximum. On failure or victory, enter a 3-8 character arcade name using the stick and A, then submit with D.

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

The Worker limits POST bodies to 1,024 bytes; usernames to `[A-Z0-9]{3,8}`; IDs to canonical version-4 UUIDs; builds to `iot-v1` or `iot-v2`; and mission counts to 0-10. Scores must be integers divisible by 100 within the build-specific maximum for the submitted cleared-wave count (including up to 600 answer points for an in-progress v2 wave), with a lower bound of -20,000. Server timestamps are generated on receipt.

A single Durable Object serializes board operations. GitHub writes include the current blob SHA and retry conflicts up to three times. The submission UUID is stored in the JSON entry: retries return the original acknowledgement rather than creating another score. Reusing an ID for different data is rejected. An IP-based 30 requests/minute limit includes reads and writes. CORS restricts browser origins. Neither CORS nor numeric validation proves that someone played honestly: this is an educational arcade leaderboard, not a cheat-proof competition. A public client can fabricate a plausible score. Competitive anti-cheat needs server-authoritative play or separately verified trusted results; no secret stored on a Pi could fix that.

The JSON schema is `{ "version": 1, "entries": [...] }`. All accepted entries are retained up to 2,000 so duplicate IDs remain detectable; the game displays only the sorted top ten. On reaching capacity, the Worker returns a retryable 503 and scores remain on the Pi. Before capacity is reached, an operator should archive the board and deliberately migrate to a new season/build/branch; do not silently truncate entries, which would remove retry deduplication. Do not manually remove IDs while old Pi queues might retry them. An already accepted retry can still be acknowledged at capacity.

GitHub failures, expired tokens, rate limits, Worker failures or offline networking leave scores in IndexedDB. The client saves a score transactionally before any POST and removes it only after an acknowledgement containing the matching ID. It retries at startup, when networking returns, every 60 seconds and with B on the leaderboard. Failed 400/409/413/422 submissions remain locally marked for operator investigation; they are not endlessly resent. Server-unavailable and 429 responses retry later. The cached top ten is shown offline. Clearing browser storage, using an ephemeral kiosk profile, changing origins or SD-card loss can remove local data; keep a persistent Chromium profile. A storage failure shows NOT SAVED and leaves name entry available to retry.

## Updating questions on Render

Edit `GAME/Scripts/missions.js` or `GAME/Scripts/question-bank.js` in GitHub, or generate and review additions using `MCP_QUESTIONS.md`, commit to the deployed branch and use Render's auto deploy or Manual Deploy > Deploy latest commit. No Worker redeploy is required for wording or question changes. Deploy the updated Worker when first upgrading the game to iot-v2 so the new answer bonuses are accepted; old queued v1 submissions remain supported. Keep exactly four choices and one correct choice per question, and provide a short reason for every answer. If score rules change, update both client scoring and Worker validation/build together.

This is plain HTML/CSS/JS: use an existing Render **Static Site**, with the nested GAME directory as its publish path. If the Render service root is the repository root, the publish path is `SpaceInvaders-master/SpaceInvaders-master`; a harmless build command is `echo static-game`. If its root directory is already the nested GAME directory, publish `.`. Keep the deployed branch as `main` (or your chosen reviewed code branch), never `scores`. If using a newly created feature branch, merge the reviewed changes into that deployed branch before expecting auto deploy. A Render service and its existing branch/settings have not been modified by these instructions.

## Validation

Worker checks:

```sh
cd Space-Invaders/serverless
npm ci
npm test
npm run check
```

Browser checks need Playwright on a development computer (not the Pi): install it into a temporary test environment, with Chromium installed. Serve GAME on `localhost:8000`, make `playwright` resolvable to Node, then run `node tests/browser.cjs` from the repository root. `CHROMIUM_PATH` overrides `/usr/bin/chromium`; `IOT_GAME_URL` overrides the local test URL. The checks exercise keyboard control, real laser collisions, life-loss penalties and pressure increases, immediate correct-answer bonuses, multi-laser volleys, paused questions, Kanban capacity, offline queue persistence after reload, all ten wave reviews and victory. Wave completion is forced during the campaign-flow test so it verifies transitions without an automated shooter bot. Manual playtesting on the physical Pi/Joy-Con is still needed. No live GitHub score commits or production Worker deployment are performed by the automated tests.

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
