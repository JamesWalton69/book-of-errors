// Shared helpers
const $ = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => [...r.querySelectorAll(q)];
const rand = a => a[Math.floor(Math.random()*a.length)];
const corruptText = s => s.replace(/[aeiou]/gi, v => ({a:'ä',e:'ë',i:'í',o:'ø',u:'ú'}[v.toLowerCase()]||v))
                          .replace(/\w(?=\w)/g, ch => (Math.random()<.2?ch+String.fromCharCode(0x200B):ch));

// Page transition
$$('a.link, .btn[href]').forEach(a=>{
  a.addEventListener('click',e=>{
    if(a.target==="_blank"||a.href.includes('#'))return;
    e.preventDefault();
    document.body.classList.add('page-out');
    setTimeout(()=>location.href=a.href,300);
  });
});

// Cursor "eye" follows
const eye = $('#eye');
window.addEventListener('mousemove', e=>{
  eye.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});

// Breadcrumb corruption (deeper pages)
$$('.crumbs.corrupt').forEach(c=>{
  setInterval(()=>{
    if(Math.random()<.5){
      c.textContent = corruptText(c.textContent);
    }
  }, 1500);
});

// Copy to clipboard (corrupted)
$$('.copy-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const target = $(btn.dataset.target);
    const payload = target?.dataset.copy || target?.innerText || '';
    const corrupted = corruptText(payload);
    navigator.clipboard.writeText(corrupted).then(()=>{
      btn.textContent = 'Copied (it changed)';
      setTimeout(()=>btn.textContent='Copy (safe)',1200);
    });
  });
});

// Typing effect (index)
if (document.body.dataset.page === 'index'){
  const code = $('#type-seq');
  if(code){
    const src = code.innerText.trim();
    code.innerText = '';
    let i=0;
    const t = setInterval(()=>{
      code.innerText += src[i++] || '';
      if(i>=src.length) clearInterval(t);
    }, 12);
  }
  const out = $('#term-out'), input = $('#term-in');
  const replies = {
    help: ['Available: bleed, whisper, mirror, corrupt, watch', 'Advice: do not run in the dark'],
    whoami: ['book@errors:~$ you', 'It knows your keys.'],
    run: ['running...', 'it is already running'],
    clear: ['clearing...', 'nothing clears completely']
  };
  input?.addEventListener('keydown', e=>{
    if(e.key==='Enter'){
      const v = (input.value||'').trim().toLowerCase();
      out.innerHTML += `<div>book@errors:~$ ${v}</div>`;
      const resp = replies[v]||['...','it replies when you look away'];
      out.innerHTML += `<div class="note">${rand(resp)}</div>`;
      out.scrollTop = out.scrollHeight;
      input.value='';
    }
  });
}

// Functions demos
if (document.body.dataset.page === 'functions'){
  const stage = $('#demo-stage');
  const demoMap = {
    bleed: () => { stage.innerHTML = `<span class="bleed">it drips</span>`; bleedAnim(stage); },
    whisper: () => { stage.innerHTML = `<span class="whisper">can you hear</span>`; whisperAnim(stage); },
    mirror: () => { stage.innerHTML = `<span class="mirror">mirror()</span>`; mirrorAnim(stage); },
    corrupt: () => { stage.textContent = 'uncorrupted text'; decay(stage); },
    watch: () => { stage.textContent = 'tracking... move the mouse'; watch(stage); }
  };
  $$('.demo').forEach(b=>{
    b.addEventListener('click',()=> demoMap[b.dataset.demo]?.());
  });
  function bleedAnim(el){
    el.querySelectorAll('.drop').forEach(d=>d.remove());
    const span = el.querySelector('.bleed');
    span.style.position='relative';
    for(let i=0;i<8;i++){
      const d = document.createElement('i');
      d.className='drop';
      d.style.position='absolute';
      d.style.left = (i*6)+'px';
      d.style.top = '1.2em';
      d.style.width='2px'; d.style.height='0px'; d.style.background='#f00';
      span.appendChild(d);
      setTimeout(()=>d.style.height='16px', 50*i);
    }
  }
  function whisperAnim(el){
    const s = el.querySelector('.whisper');
    s.style.opacity='0.2';
    let dir=1;
    setInterval(()=>{
      let o = parseFloat(s.style.opacity)||0.2;
      o += 0.1*dir; if(o>1||o<0.1) dir*=-1;
      s.style.opacity = o.toFixed(2);
    }, 120);
  }
  function mirrorAnim(el){
    const s = el.querySelector('.mirror');
    window.addEventListener('mousemove', e=>{
      s.style.transform = `scaleX(-1) translateX(${(e.clientX/window.innerWidth-0.5)*40}px)`;
    }, {once:true});
  }
  function decay(el){
    let t = 'uncorrupted text', i=0;
    const id = setInterval(()=>{
      t = corruptText(t);
      el.textContent = t;
      if(++i>15) clearInterval(id);
    }, 120);
  }
  function watch(el){
    const h = e => {
      el.style.textShadow = `0 0 8px #a00, ${e.clientX/50}px ${e.clientY/50}px 2px #400`;
    };
    window.addEventListener('mousemove', h);
    setTimeout(()=>window.removeEventListener('mousemove', h), 6000);
  }
}

// Errors: live-updating console
if (document.body.dataset.page === 'errors'){
  const consoleEl = $('#err-console');
  const msgs = [
    "Error: Variable 'hope' not found. Did you lose it somewhere?",
    "Warning: sleep() will never return.",
    "Fatal: The void stares back. Stack overflow in soul.",
    "Error: Cannot access 'memories' — forgotten by time.",
    "Warning: Infinite loop detected in despair.",
    "Segmentation fault: reality.exe",
    "I/O Warning: breathing too loud on input stream."
  ];
  const add = m => {
    const div = document.createElement('div');
    div.className = 'err';
    div.textContent = m;
    consoleEl.appendChild(div);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  };
  add(rand(msgs));
  const timer = setInterval(()=> add(corruptText(rand(msgs))), 1800);
  $('#inject')?.addEventListener('click', ()=> add(rand(msgs)));
  window.addEventListener('beforeunload', ()=>clearInterval(timer));
}

// 404 personalization
if (document.body.dataset.page === '404'){
  const p = $('#path');
  try { p.textContent = decodeURI(location.pathname) || '/'; } catch { p.textContent = '/'; }
}

// Self-rewriting (about)
if (document.body.dataset.page === 'about'){
  $$('.rewrite').forEach(n=>{
    setInterval(()=>{
      const t = n.textContent;
      n.textContent = (n.textContent===n.dataset.alt) ? n.getAttribute('data-alt').split('').reverse().join('') : n.dataset.alt;
      if(Math.random()<.3) n.textContent = corruptText(n.textContent);
    }, 2200 + Math.random()*1200);
  });
}
const audio = $('#horror-audio');
const toggle = $('#music-toggle');
const icon = $('#music-icon');
let playing = false;

function playMusic() {
  audio.volume = 0.33;
  audio.play();
  playing = true;
  icon.textContent = '🔊';
}
function pauseMusic() {
  audio.pause();
  playing = false;
  icon.textContent = '🔈';
}

toggle?.addEventListener('click', () => {
  playing ? pauseMusic() : playMusic();
});

// Auto-play on first user interaction for creepiness
window.addEventListener('pointerdown', () => {
  if (!playing) playMusic();
}, {once: true});
