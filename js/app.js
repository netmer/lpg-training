/* ============================================================
   APP SHELL — minimal for single-scene PPT embed
============================================================ */

window.LPG = {
  scenes: {},
  current: null,
  registerScene(id, hooks){ this.scenes[id] = hooks; },
};

// Embed mode detection
const params = new URLSearchParams(location.search);
const isEmbedded = params.has('embed') || (window.self !== window.top);
if (isEmbedded) document.body.classList.add('embed');

// Fullscreen toggle
document.getElementById('btnFullscreen')?.addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
  else document.exitFullscreen().catch(()=>{});
});

// Keyboard shortcuts (minimal)
document.addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key;
  // Delegate to scene
  const cur = window.LPG.scenes[window.LPG.current];
  if (cur?.onKey && cur.onKey(e)){ e.preventDefault(); return; }
  // Global
  if (k === 'f' || k === 'F'){
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen().catch(()=>{});
    e.preventDefault();
  }
});

// Boot — activate the only scene
window.addEventListener('DOMContentLoaded', () => {
  window.LPG.current = 'overview';
  if (window.LPG.scenes.overview?.onEnter) window.LPG.scenes.overview.onEnter();
});
