# Original Space Invaders with small additions

The playable game has been restored around the original three-wave shooter from commit `df21dc9f46b9453034a17720494ddfab846faa1a`. It uses the original ship, invaders, sprite sheet, sounds, movement, collision code and level constructors. The expanded ten-mission campaign and planning screens have been removed from the active game. That earlier work is preserved on `codex/iot-security-campaign`.

## Flow

1. Log in with username `user` and password `user`.
2. Start the original shooter with Enter or button 4.
3. Shoot invaders and progress through the original three waves.
4. Only an invader bullet can remove a life. One hit removes one life, deducts 1,100 points and pauses for exactly one security question.
5. Answer using keys 1, 2, 3 or 4. Read the short explanation and press a numbered button to resume shooting. A hit that removes the final life still gets its one question, followed by the original Game Over screen.

There are no questions at startup, between waves or on victory. Surviving invaders that reach the bottom recycle to their original row heights without removing a life or opening a question.

## Controls

Map the four JoyToKey buttons to **1, 2, 3 and 4**, replacing the earlier A-D mapping. The top-row number keys and numeric keypad both work.

| Screen | Controls |
|---|---|
| Login | Keyboard entry, or stick up/down selects a character; left/right selects a field; 1 adds; 2 erases; 3 changes field; 4 logs in |
| Original title | Enter or 4 starts |
| Shooter | Left/right moves; Space or 1 fires |
| Question after a hit | 1, 2, 3 or 4 selects that answer |
| Explanation | Any numbered button, Space or Enter returns to shooting |
| Original end screen | Enter or 4 restarts; 3 optionally opens score saving |
| Arcade name | Stick cycles characters; 1 adds; 2 erases; 4 submits; 3 goes back |
| Top ten | 2 retries queued uploads; 4 returns to the original end screen |

The requested `user` / `user` login is a browser-side training demonstration. It is not production authentication and does not protect publicly served source files.

## Points and difficulty

Original enemy-hit scoring remains +100. An enemy-bullet hit deducts 1,100 points, removes one life and raises bounded pressure. A correct answer gives +100, lowers pressure and upgrades the parallel laser volley to two beams after the first correct answer and three after the second. Pressure modifies enemy movement and firing gently and is bounded. Clearing a wave gives a one-time 500-point bonus; it does not open a review screen. Restart begins with the original five lives.

The game identifies scores as `iot-shooter-v1`, with three completed waves maximum. The Worker also accepts previously queued `iot-v1` and `iot-v2` scores under their earlier limits. Question categories do not create extra shooter levels.

## Files

All game paths below are inside `SpaceInvaders-master/SpaceInvaders-master/`.

| File | Change |
|---|---|
| `index.html` | Original canvases and shooter entrypoint, plus login and small add-ons |
| `Scripts/script.js` | Original shooter with an enemy-bullet question hook and numeric button aliases |
| `Styles/main.css` | Original styling, Pi canvas scaling and login styling |
| `Scripts/login.js` | Requested user/user login |
| `Scripts/death-quiz.js` | Hit-only question overlay, explanations and small rewards |
| `Scripts/arcade-leaderboard.js` | Optional score saving from the original end screen |
| `Scripts/config.js` | Public Worker URL and score build ID |
| `Scripts/missions.js`, `Scripts/question-bank.js` | Existing bank of 60 questions across ten criteria |
| `Scripts/generated-questions.js`, `data/generated-questions.json` | Approved offline MCP question exports |
| `Scripts/leaderboard.js` | Existing IndexedDB queue and retry logic |

`Scripts/campaign.js` and `Scripts/controls.js` have been removed. The original `background.js`, images, sounds and fonts remain. Root `mcp.json`, `mcp/`, `MCP_QUESTIONS.md`, `serverless/` and `leaderboard.json` remain available. `COMPLETE_CODE.md` contains complete current files.

## Run on the Pi

Install Chromium, Python 3 and Git if missing. Keep the existing controller mapper, changing its four button outputs to 1-4.

```sh
cd Space-Invaders/SpaceInvaders-master/SpaceInvaders-master
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000` in Chromium. The game itself needs no Node, MCP process, AI key or GitHub token. Use a persistent browser profile and the same origin to preserve queued scores.

## GitHub and Render

The updated playable files belong on `main`. For a Render Static Site with repository-root service settings, publish `SpaceInvaders-master/SpaceInvaders-master`; if the service root is already that directory, publish `.`. A build command such as `echo static-game` is sufficient. Deploy the latest main commit, then reload the page. Keep the score-data branch separate from the deployed game branch.

The optional leaderboard still needs its separate Cloudflare Worker setup:

```sh
cd Space-Invaders/serverless
npm ci
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
```

Enter the token only at the Cloudflare prompt, never in chat or on the Pi. Restrict the GitHub token to this repository with Contents read/write. In `wrangler.toml`, use the existing `scores` branch, root `leaderboard.json`, and exact allowed localhost/Render origins. Deploy the updated Worker with `npm run deploy`, then put only its public HTTPS URL in `Scripts/config.js`. With no URL configured, scores remain local. Numeric validation is not proof of honest play.

The question-generation MCP setup remains in `MCP_QUESTIONS.md`. Generated questions are reviewed and exported into static game files; the game never contacts AI during play.

## Validation

```sh
npm ci --prefix mcp
npm test --prefix mcp
node --test tests/worker.test.mjs
```

With Playwright available and the game served locally, run `node tests/browser.cjs`. `IOT_GAME_URL` changes the test URL and `CHROMIUM_PATH` changes the Chromium executable. Browser tests cover login, original shooting, bullet-only life loss, hit-only questions, numeric answers, wave progression, victory and restart. Physical Pi/controller and production deployments still need verification.
