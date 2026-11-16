# Implementation and deployment status

The linked repository originally contained a plain three-wave shooter and no IoT criteria or question bank. The ten missions, 60 base questions and project scenes have been added around that shooter. All ten security criteria are implemented in source; none needs a duplicate mission.

| Criterion | Mission | Existing upgrade questions | New MCP generation/export |
|---|---:|---:|---|
| Authentication | 1 | 6 | Supported |
| Authorisation | 2 | 6 | Supported |
| TLS encryption | 3 | 6 | Supported |
| Access Control Lists | 4 | 6 | Supported |
| Strong credentials | 5 | 6 | Supported |
| Certificate management | 6 | 6 | Supported |
| Network segmentation | 7 | 6 | Supported |
| Firewall configuration | 8 | 6 | Supported |
| Secure topic design | 9 | 6 | Supported |
| Input validation | 10 | 6 | Supported |

The project brief, constrained Kanban, likelihood x impact risk register, random events, decision explanations and level reviews are implemented. The game uses arrow-key movement and A/B/C/D question selection. Version iot-v2 adds immediate correct-answer bonuses, two-/three-laser volleys and bounded pressure changes after life loss and decisions.

The leaderboard Worker, score validation, top-ten display, duplicate-resistant submissions and offline outbox are implemented. The dedicated GitHub `scores` branch contains the initial leaderboard file. Real submissions still require deploying the Worker, setting its Cloudflare-only GitHub secret and allowed origins, and entering its public URL in the game. The game must then be merged into Render's deployed branch or deployed from the reviewed branch. These external setup steps are not completed by having source code or passing local tests.

The new MCP server and JSON client template are implemented. Its actual stdio protocol is tested with an SDK client. Connecting it to your chosen desktop AI client still requires adding the generated configuration there. See MCP_QUESTIONS.md. The original Pi question bank was not supplied, so exact older questions cannot be claimed as preserved.

Physical Pi/controller performance, live Cloudflare/GitHub score commits and the production Render deployment must be verified in their real environments. See GAME_UPGRADE.md for setup; no token should be sent in chat or placed on the Pi.
