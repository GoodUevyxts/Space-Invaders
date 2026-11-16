# Question-generation MCP server

The new server is `mcp/server.mjs`; the requested client JSON template is `mcp.json`. It uses the official Model Context Protocol SDK over local standard input/output. It reads and writes this repository's question files on your development computer. It does not run inside the game, open a network port, need a GitHub token, or change the JoyToKey controls. The game still runs offline on the Pi with its 60 original upgrade questions and any approved exports.

## Install and connect

Install Node.js 22.12+ or Node 24 on the development computer. From the repository root:

```sh
npm ci --prefix mcp
node mcp/configure.mjs > mcp.local.json
```

`mcp.local.json` contains the real absolute path for your computer; it is ignored by Git. Copy its `iot-questions` entry into your MCP client's configuration, preserving any other servers. The committed `mcp.json` is the same format with a path placeholder:

```json
{
  "mcpServers": {
    "iot-questions": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/Space-Invaders/mcp/server.mjs"]
    }
  }
}
```

For Claude Desktop, merge this entry into its MCP configuration. For Cursor, merge it into the project's `.cursor/mcp.json`. Use the generated absolute path, not a guessed working directory. Restart/reload the client's MCP servers after saving. If `node` is not on that client's PATH, use the absolute path to the Node executable as `command`.

Codex uses TOML instead of the shared JSON format. Generate a matching entry:

```sh
node mcp/configure.mjs --codex > mcp.local.toml
```

Merge that `[mcp_servers.iot-questions]` section into your Codex configuration. The generated snippet contains the absolute server path. Do not replace other configured servers. This delivery supplies and verifies the server; it does not alter your personal MCP-client settings or claim an account plugin is installed.

No separate model API key is needed. The server uses the connected AI client's model in either of these ways:

- If the client supports **MCP sampling**, `generate_questions` requests model output through that protocol, validates it and saves an unpublished draft.
- Otherwise, `get_generation_brief` supplies the instructions and format; the client's own AI writes questions and calls `save_question_draft`. `generate_questions` returns this fallback brief with `generated: false` when sampling is unavailable. It never pretends questions were generated.

The server cannot generate text by itself without an AI client/model. It does not silently call a paid external AI API. Sampling permissions remain controlled by your client.

## Use it

In the connected AI client, ask:

> Use iot-questions to draft four intermediate questions for TLS encryption. Show all choices, correct answers and explanations for review. Keep them as drafts until I approve publication.

The workflow is:

1. `list_security_criteria` identifies the exact criterion ID and current question count.
2. `generate_questions`, or `get_generation_brief` followed by `save_question_draft`, creates a draft in `.question-drafts/`.
3. Inspect the draft with `get_question_draft`; review technical accuracy, answer ambiguity, reading level and wording. Automated validation checks structure, not factual truth.
4. After review, call `publish_question_draft` with its ID, `reviewed: true` and a review note. It appends questions to the matching mission and rebuilds the static question script.
5. Review and commit the two exported game files; merge the changes into the branch Render deploys. The Pi uses those static files after its local copy is updated. Neither platform needs to contact MCP during gameplay.

The prompt `write-iot-questions` and resource `iot-questions://workflow` expose the same workflow to compatible clients. Tools are discoverable through the standard MCP handshake.

## Tools

| Tool | Purpose |
|---|---|
| `list_security_criteria` | List all ten missions and their question counts |
| `get_generation_brief` | Provide model instructions, format and existing prompts |
| `generate_questions` | Generate through client sampling, validate and save a draft, or return fallback instructions |
| `validate_questions` | Check structure, lengths, answer uniqueness and duplicate prompts |
| `save_question_draft` | Save AI-written questions without changing the game |
| `list_question_drafts` | List local drafts and publication status |
| `get_question_draft` | Read a complete draft for review |
| `publish_question_draft` | Export reviewed questions into the local game |
| `rebuild_game_question_script` | Repair/rebuild the static script from published JSON |

Criterion IDs: `authentication`, `authorisation`, `tls-encryption`, `access-control-lists`, `strong-credentials`, `certificate-management`, `network-segmentation`, `firewall-configuration`, `secure-topic-design`, `input-validation`.

## Question format and validation

Tools accept questions in the same structure as the existing game:

```json
{
  "criterion": "authentication",
  "difficulty": "intermediate",
  "questions": [
    {
      "prompt": "A replacement sensor connects to MQTT. What should the broker verify?",
      "options": [
        ["The sensor's unique credential", true, "A verified per-device credential establishes identity before a broker session is granted."],
        ["The sensor's display name only", false, "Display names can be copied and do not prove a device's identity."],
        ["Which sensor connected first", false, "Connection timing does not establish that a device is legitimate."],
        ["Whether its message is JSON", false, "A message format does not authenticate the device that sent it."]
      ]
    }
  ]
}
```

A draft contains 1-10 questions. Every question has exactly four distinct answers and exactly one correct answer. All choices need an explanation. Prompt length is 12-160 characters, answer length 3-110, and explanation length 15-180, with single printable lines. Normalised prompt duplicates are rejected against base and published questions. Near-duplicates and factual mistakes still need review.

The original files remain `Scripts/missions.js` and `Scripts/question-bank.js`. Published additions use:

- `SpaceInvaders-master/SpaceInvaders-master/data/generated-questions.json`: tracked source of truth, including criterion, review note and timestamp.
- `SpaceInvaders-master/SpaceInvaders-master/Scripts/generated-questions.js`: tracked static export loaded after the base bank.

There is a 250-question limit for generated additions across the game, independent of the original 60. Mission counts update automatically. Question difficulty labels guide writing; gameplay difficulty follows the separate pressure mechanic in GAME_UPGRADE.md.

Unpublished drafts and generated client configuration stay out of Git. The server never commits, pushes, merges or deploys changes. Publication is idempotent: retrying the same draft repairs an interrupted export without duplicating its questions. Whole files are replaced atomically; a short filesystem lock prevents competing server processes from overwriting each other's changes. After a crash, stop all question-server processes before removing an abandoned empty `.question-drafts/.write-lock` directory. Normal operations remove it automatically. Symlink and path traversal access is rejected; repository JavaScript is parsed as JSON data rather than executed by the server.

## Tests

```sh
npm ci --prefix mcp
npm test --prefix mcp
```

The integration tests start the actual server as a child process and use the official MCP client to test initialization, discovery, the sampling request/response, draft validation, publication, export recovery and a client without sampling. Test model responses are deterministic fixtures; tests do not call an AI provider or publish fixture questions to the real game. No live client/account installation is implied by passing these tests.

A Render Static Site cannot host this stdio MCP process. Use the development-computer workflow above to produce static questions for Render. A remote HTTP MCP deployment would be a separate server with authentication and hosting, and is not required for this game workflow.
