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
