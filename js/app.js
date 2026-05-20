/* ============================================================
   APP SHELL — single overview scene for PPT embed
============================================================ */

window.LPG = {
  scenes: {},
  current: 'overview',
  registerScene(id, hooks){ this.scenes[id] = hooks; },
};

// Embed mode detection (?embed=1 OR iframed in PowerPoint Web Viewer)
const params = new URLSearchParams(location.search);
const isEmbedded = params.has('embed') || (window.self !== window.top);
if (isEmbedded) document.body.classList.add('embed');

// Fullscreen toggle
document.getElementById('btnFullscreen')?.addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
  else document.exitFullscreen().catch(()=>{});
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key;
  const cur = window.LPG.scenes.overview;
  if (cur?.onKey && cur.onKey(e)){ e.preventDefault(); return; }
  if (k === 'f' || k === 'F'){
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen().catch(()=>{});
    e.preventDefault();
  }
});

// Boot
window.addEventListener('DOMContentLoaded', () => {
  if (window.LPG.scenes.overview?.onEnter) window.LPG.scenes.overview.onEnter();
});
