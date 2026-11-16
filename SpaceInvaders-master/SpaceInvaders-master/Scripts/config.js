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
