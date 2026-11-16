import { fileURLToPath } from 'node:url';
const entry = fileURLToPath(new URL('./server.mjs', import.meta.url));
if (process.argv.includes('--codex')) {
  console.log('[mcp_servers.iot-questions]\ncommand = "node"\nargs = [' + JSON.stringify(entry) + ']');
} else {
  console.log(JSON.stringify({mcpServers:{'iot-questions':{command:'node',args:[entry]}}},null,2));
}
