/* ============================================================
   APP SHELL — minimal for single-scene PPT embed
   Now handles 6 views: overview + step1..step5 with Prev/Next nav
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

// ============================================================
// VIEW SWITCHING — overview / step1..step5
// ============================================================
const VIEWS = ['overview','step1','step2','step3','step4','step5','step6','step7'];
let currentView = 'overview';

function setView(viewId){
  if (!VIEWS.includes(viewId)) return;
  // Update view containers
  document.querySelectorAll('.step-view').forEach(v => {
    v.classList.toggle('active', v.dataset.view === viewId);
  });
  // Update nav tabs
  document.querySelectorAll('.step-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.view === viewId);
  });
  // Update Prev/Next button states
  const idx = VIEWS.indexOf(viewId);
  document.getElementById('btnPrev').disabled = (idx === 0);
  document.getElementById('btnNext').disabled = (idx === VIEWS.length - 1);
  // Notify the previous view (pause its animation if needed)
  if (currentView !== viewId && window.LPG.scenes[currentView]?.onLeave){
    try { window.LPG.scenes[currentView].onLeave(); } catch(e){}
  }
  currentView = viewId;
  // Notify the new view (start/resume its animation)
  if (window.LPG.scenes[viewId]?.onEnter){
    try { window.LPG.scenes[viewId].onEnter(); } catch(e){}
  }
}

// Wire up nav tab clicks
document.querySelectorAll('.step-tab').forEach(tab => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
});

// Prev/Next buttons
document.getElementById('btnPrev')?.addEventListener('click', () => {
  const idx = VIEWS.indexOf(currentView);
  if (idx > 0) setView(VIEWS[idx - 1]);
});
document.getElementById('btnNext')?.addEventListener('click', () => {
  const idx = VIEWS.indexOf(currentView);
  if (idx < VIEWS.length - 1) setView(VIEWS[idx + 1]);
});

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key;

  // Arrow keys for Prev/Next
  if (k === 'ArrowRight'){
    const idx = VIEWS.indexOf(currentView);
    if (idx < VIEWS.length - 1) setView(VIEWS[idx + 1]);
    e.preventDefault(); return;
  }
  if (k === 'ArrowLeft'){
    const idx = VIEWS.indexOf(currentView);
    if (idx > 0) setView(VIEWS[idx - 1]);
    e.preventDefault(); return;
  }

  // Number keys 0-7 jump to specific view
  if (k === '0'){ setView('overview'); e.preventDefault(); return; }
  if (k >= '1' && k <= '7'){
    setView('step' + k);
    e.preventDefault(); return;
  }

  // Delegate to current view scene module
  const cur = window.LPG.scenes[currentView];
  if (cur?.onKey && cur.onKey(e)){ e.preventDefault(); return; }

  // Fullscreen
  if (k === 'f' || k === 'F'){
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen().catch(()=>{});
    e.preventDefault();
  }
});

// Hash-based view navigation (e.g., #step1 opens step 1)
function loadFromHash(){
  const target = location.hash.replace('#','');
  if (target && VIEWS.includes(target)) setView(target);
}
window.addEventListener('hashchange', loadFromHash);

// Boot
window.addEventListener('DOMContentLoaded', () => {
  if (location.hash) loadFromHash();
  else setView('overview');
});
