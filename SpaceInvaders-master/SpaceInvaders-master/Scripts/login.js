/* Requested training login only. This browser-side check is not production authentication. */
window.GAME_LOGIN = (() => {
  let unlocked = false, field = 0;
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
  let letter = alphabet.indexOf('u');
  const fields = [document.querySelector('#login-username'), document.querySelector('#login-password')];
  const form = document.querySelector('#login-form');
  function submit(event) {
    if (event) event.preventDefault();
    if (fields[0].value === 'user' && fields[1].value === 'user') {
      unlocked = true;
      document.querySelector('#login-panel').hidden = true;
      document.querySelector('#game-canvas').hidden = false;
      fields[1].value = ''; fields.forEach(f => f.blur());
    } else document.querySelector('#login-error').textContent = 'Incorrect username or password.';
  }
  fields.forEach((input,i) => input.addEventListener('focus',()=>field=i));
  form.addEventListener('submit',submit);
  document.addEventListener('keydown', event => {
    if (unlocked) return;
    const code = event.code;
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Digit1','Digit2','Digit3','Digit4','Numpad1','Numpad2','Numpad3','Numpad4','Enter'].includes(code)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (code === 'ArrowUp' || code === 'ArrowDown') {
      letter = (letter + (code === 'ArrowUp' ? 1 : alphabet.length - 1)) % alphabet.length;
      document.querySelector('#login-character').textContent = 'Selected character: ' + alphabet[letter];
    } else if (['ArrowLeft','ArrowRight','Digit3','Numpad3'].includes(code)) { field = 1-field; fields[field].focus(); }
    else if (!event.repeat && ['Digit1','Numpad1'].includes(code)) fields[field].value += alphabet[letter];
    else if (!event.repeat && ['Digit2','Numpad2'].includes(code)) fields[field].value = fields[field].value.slice(0,-1);
    else if (!event.repeat && ['Digit4','Numpad4','Enter'].includes(code)) submit();
  },true);
  return {get unlocked(){return unlocked;}};
})();
