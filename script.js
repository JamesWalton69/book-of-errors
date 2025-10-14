// Random glitch flicker
setInterval(() => {
  const title = document.querySelector('.glitch-text');
  if (Math.random() > 0.8) {
    title.style.textShadow = `0 0 10px #${Math.random().toString(16).slice(2, 8)}`;
  } else {
    title.style.textShadow = '';
  }
}, 500);

// creepy console whisper
console.log("%c[ERROR] Unexpected entity detected...", "color: red; font-weight: bold;");
console.log("%c> Do not execute 'bleed()' after midnight.", "color: gray;");
