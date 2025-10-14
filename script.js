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
// optional glitch ambience
const audio = new Audio('assets/static.mp3');
audio.loop = true;
audio.volume = 0.03; // very low
audio.play().catch(() => {
  console.log("Audio playback waiting for user interaction...");
});

document.body.addEventListener('click', () => {
  audio.play();
});
