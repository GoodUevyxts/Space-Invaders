# Current game scope

The game uses the original three shooter waves. The ten security criteria are question categories in the shared bank, not ten additional levels or a mandatory campaign. A question appears only after an enemy bullet removes a life. Players who clear a wave without being shot do not get a question.

| Security criterion | Questions in base bank | MCP generation |
|---|---:|---|
| Authentication | 6 | Supported |
| Authorisation | 6 | Supported |
| TLS encryption | 6 | Supported |
| Access Control Lists | 6 | Supported |
| Strong credentials | 6 | Supported |
| Certificate management | 6 | Supported |
| Network segmentation | 6 | Supported |
| Firewall configuration | 6 | Supported |
| Secure topic design | 6 | Supported |
| Input validation | 6 | Supported |

The `user` / `user` login is a requested training demonstration; it is not strong authentication. Question selection uses number keys 1-4, replacing A-D. The enlarged planning/campaign screens have been removed from the active game; the previous implementation remains on `codex/iot-security-campaign`.

The MCP server, configuration template, offline question exports, optional leaderboard and offline outbox remain. A live leaderboard still needs the Cloudflare Worker deployed and its public URL configured. The original end screen opens optional score saving with button 3. See GAME_UPGRADE.md for the actual current flow and deployment instructions.
