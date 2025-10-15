/* app.js — central JS for navigation, effects, errors, popups */
/* Put this in the root and reference as <script defer src="app.js"></script> */

(() => {
  'use strict';

  /* -------------------------
     Config & globals
     ------------------------- */
  const errorMessages = [
    "SEGMENTATION FAULT: memory kept a secret",
    "UNHANDLED EXCEPTION: the name was not found",
    "WATCHER: heartbeat missed",
    "ERR: permission denied — to forget",
    "WARNING: do not close this tab",
    "TRACE: you were here",
    "RUNTIME: logging you"
  ];

  const activeIntervals = [];
  const activeTimeouts = [];
  let autoSpawn = false;

  /* -------------------------
     Utilities
     ------------------------- */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  function randInt(max){ return Math.floor(Math.random()*max); }

  /* -------------------------
     NAV TRANSITION for static pages
     ------------------------- */
  function setupNavTransitions(){
    $$('.nav-link').forEach(a=>{
      a.addEventListener('click', (e)=>{
        // allow external or target links to behave normally
        if (a.target && a.target !== '') return;
        const url = a.getAttribute('href');
        if (!url || url.startsWith('#')) return;
        e.preventDefault();
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-glitch';
        document.body.appendChild(overlay);
        // small delay to show overlay
        setTimeout(()=> {
          // navigate after animation
          window.location.href = url;
        }, 220);
      });
    });
  }

  /* -------------------------
     Hover reveal (typing + flicker)
     Requires elements with .hover-reveal containing .hidden-text
     ------------------------- */
  function setupHoverReveal(){
    $$('.hover-reveal').forEach(card=>{
      card.addEventListener('mouseenter', ()=> {
        const hidden = card.querySelector('.hidden-text');
        if (!hidden) return;
        // flicker
        card.classList.add('flicker');
        activeTimeouts.push(setTimeout(()=> card.classList.remove('flicker'), 900));

        // typed reveal (if not already full)
        const text = hidden.dataset.origin || hidden.textContent;
        if (!hidden.dataset.origin) hidden.dataset.origin = text;
        hidden.textContent = '';
        hidden.style.opacity = 1;
        let i = 0;
        const t = setInterval(()=>{
          hidden.textContent += (text[i++] || '');
          if (i > text.length) clearInterval(t);
        }, 28);
        activeIntervals.push(t);
      });
      card.addEventListener('mouseleave', ()=> {
        // (leave visible; could hide if desired)
      });
    });
  }

  /* -------------------------
     Horror popup spawner
     ------------------------- */
  function spawnHorrorPopup(msg){
    const popup = document.createElement('div');
    popup.className = 'horror-popup';
    popup.textContent = msg || errorMessages[randInt(errorMessages.length)];
    document.body.appendChild(popup);
    // random-ish position
    popup.style.left = `${8 + Math.random() * 84}%`;
    popup.style.top = `${8 + Math.random() * 72}%`;
    // trigger animation by setting style and keyframes used in CSS
    popup.style.animation = 'popupFade 4s forwards';
    // remove after life
    activeTimeouts.push(setTimeout(()=> popup.remove(), 4200));
  }

  /* -------------------------
     Error console features
     ------------------------- */
  function emitErrorLine(msg){
    const out = $('#error-output');
    if (!out) return;
    const el = document.createElement('div');
    el.className = 'error-line';
    el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    out.prepend(el);
  }

  function generateRandomError(){
    const msg = errorMessages[randInt(errorMessages.length)];
    emitErrorLine(msg);
    // sometimes spawn popup
    if (Math.random() < 0.35) spawnHorrorPopup(msg);
  }

  /* -------------------------
     Watcher / Easter-egg
     ------------------------- */
  function triggerEasterEgg(){
    // escalate: many popups and a persistent log entry
    for (let i=0;i<8;i++){
      activeTimeouts.push(setTimeout(()=> spawnHorrorPopup(errorMessages[randInt(errorMessages.length)]), i*200));
    }
    activeTimeouts.push(setTimeout(()=> {
      emitErrorLine("WATCHER: escalation complete — it's recording.");
      // optionally more visual effects
      document.body.classList.add('watched');
      activeTimeouts.push(setTimeout(()=> document.body.classList.remove('watched'), 6000));
    }, 2000));
  }

  /* -------------------------
     Auto spawn toggler
     ------------------------- */
  function setupAutoSpawner(){
    const checkbox = $('#auto-spawn');
    if (!checkbox) return;
    checkbox.addEventListener('change', (e)=>{
      autoSpawn = e.target.checked;
      if (autoSpawn){
        const id = setInterval(()=>{
          generateRandomError();
        }, 3500);
        activeIntervals.push(id);
      } else {
        // clear intervals
        activeIntervals.splice(0).forEach(clearInterval);
      }
    });
  }

  /* -------------------------
     Wire up control buttons (generate/clear/taunt)
     ------------------------- */
  function setupErrorPageButtons(){
    $('#generate-error')?.addEventListener('click', generateRandomError);
    $('#clear-errors')?.addEventListener('click', ()=> {
      const out = $('#error-output');
      if (out) out.innerHTML = '';
      spawnHorrorPopup("CLEARED: the log is hungry.");
    });
    $('#taunt-btn')?.addEventListener('click', ()=>{
      // provoke watcher
      for (let i=0;i<5;i++) activeTimeouts.push(setTimeout(()=> spawnHorrorPopup(), i*260));
      activeTimeouts.push(setTimeout(triggerEasterEgg, 1200));
    });
    $('#taunt-btn-404')?.addEventListener('click', ()=>{
      // 404 taunt — small effect before navigating automatically (link will navigate)
      for (let i=0;i<3;i++) activeTimeouts.push(setTimeout(()=> spawnHorrorPopup(), i*220));
    });

    // small action buttons on functions page
    $$('[data-action="summon"]').forEach(btn => {
      btn.addEventListener('click', ()=> {
        emitErrorLine("SUMMON: ephemeral file created");
        spawnHorrorPopup("SUMMON: it answers back");
      });
    });
    $$('[data-action="toggle-watcher"]').forEach(btn=>{
      btn.addEventListener('click', ()=> {
        document.body.classList.toggle('watched');
        emitErrorLine("WATCHER: toggled");
        spawnHorrorPopup("WATCHER: toggled");
      });
    });
  }

  /* -------------------------
     Small initial visual tweaks
     ------------------------- */
  function initGlitchText(){
    $$('h1.glitch-text, h2.glitch-text').forEach(h=>{
      // copy text into data-text attr for pseudo-elements (used by CSS)
      h.setAttribute('data-text', h.textContent);
    });
  }

  /* -------------------------
     Periodic random spawn (background ambience)
     ------------------------- */
  function startAmbientSpawn(){
    const id = setInterval(()=>{
      if (Math.random() < 0.16) spawnHorrorPopup();
    }, 3800);
    activeIntervals.push(id);
  }

  /* -------------------------
     Clean up on unload
     ------------------------- */
  function clearAll(){
    activeIntervals.splice(0).forEach(clearInterval);
    activeTimeouts.splice(0).forEach(clearTimeout);
  }

  /* -------------------------
     Init all
     ------------------------- */
  function init(){
    setupNavTransitions();
    setupHoverReveal();
    initGlitchText();
    setupAutoSpawner();
    setupErrorPageButtons();
    startAmbientSpawn();

    // if error page is loaded and auto-spawn was previously checked (not persisted) do nothing; rely on user.
    window.addEventListener('beforeunload', clearAll);
  }

  // run
  document.addEventListener('DOMContentLoaded', init);

  // expose some functions for debugging/console
  window.Archive = {
    spawnHorrorPopup, generateRandomError, triggerEasterEgg, emitErrorLine
  };

})();
