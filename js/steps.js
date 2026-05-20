/* ============================================================
   STEPS — 5 close-up animations for cylinder bottling process
   ============================================================
   1. ตรวจเช็คสภาพถัง   (Inspection — magnifying glass + 5 check points)
   2. ชั่งน้ำหนักเปล่า   (Tare — counter 0 → 14.5 kg)
   3. อัด LPG          (Fill — liquid level rises, weight 14.5 → 29.5 kg)
   4. ชั่งหลังบรรจุ      (Check-weigh — verify 29.5 kg ± 0.1)
   5. ทดสอบรั่วซึม      (Leak test — 3 sensors, PPM = 0)
============================================================ */

(function(){
  const VIEWBOX = '0 0 1600 840';

  // ============================================================
  // SHARED DEFS (gradients, symbols) used by all step SVGs
  // ============================================================
  const SHARED_DEFS = `
    <defs>
      <linearGradient id="stSky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#0c1729"/>
        <stop offset="1" stop-color="#050810"/>
      </linearGradient>
      <linearGradient id="stCylBody" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%"  stop-color="#3a0d10"/>
        <stop offset="15%" stop-color="#7a1822"/>
        <stop offset="50%" stop-color="#c93545"/>
        <stop offset="85%" stop-color="#7a1822"/>
        <stop offset="100%" stop-color="#3a0d10"/>
      </linearGradient>
      <linearGradient id="stLiq" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#9fe2ff"/>
        <stop offset="1" stop-color="#0d3a66"/>
      </linearGradient>
      <linearGradient id="stMetal" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#cdd5e3"/>
        <stop offset="1" stop-color="#4a5266"/>
      </linearGradient>
      <radialGradient id="stHighlight" cx="30%" cy="20%">
        <stop offset="0" stop-color="#fff" stop-opacity=".5"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <filter id="stShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
        <feOffset dx="0" dy="4"/>
        <feComponentTransfer><feFuncA type="linear" slope=".5"/></feComponentTransfer>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  `;

  // ============================================================
  // SHARED — large cylinder SVG (used by multiple steps)
  // Centered at (cx, cy), parameters: w=cylinder body width, h=body height
  // ============================================================
  function bigCylinder(cx, cy, w, h, opts){
    opts = opts || {};
    const liqPct = opts.liqPct || 0;     // 0..1 fill level
    const x = cx - w/2;
    const yTop = cy - h/2;
    const yBot = cy + h/2;
    const yFootStart = yBot - 14;
    const bodyTop = yTop + 36;
    const liqTop = yFootStart - (yFootStart - bodyTop) * liqPct;
    return `
      <!-- Drop shadow -->
      <ellipse cx="${cx}" cy="${yBot + 8}" rx="${w/2 + 8}" ry="10" fill="#000" opacity=".55"/>
      <!-- Foot ring -->
      <rect x="${x - 6}" y="${yFootStart}" width="${w + 12}" height="14" rx="3" fill="#2a0608"/>
      <rect x="${x - 6}" y="${yFootStart}" width="${w + 12}" height="6" rx="3" fill="#3a0d10"/>
      <!-- Body -->
      <rect x="${x}" y="${bodyTop}" width="${w}" height="${yFootStart - bodyTop}" rx="6" fill="url(#stCylBody)" stroke="#1a0508" stroke-width="1.5"/>
      <!-- Top dome -->
      <rect x="${x}" y="${yTop + 14}" width="${w}" height="26" rx="6" fill="#5a1015"/>
      <!-- Brand label rectangle -->
      <rect x="${x + w*0.15}" y="${bodyTop + 30}" width="${w*0.7}" height="${h*0.16}" rx="3" fill="#fff" opacity=".08"/>
      <text x="${cx}" y="${bodyTop + 30 + h*0.10}" text-anchor="middle" font-family="Sarabun,sans-serif"
        font-size="${Math.round(w/6)}" font-weight="800" fill="#fff" opacity=".45">LPG</text>
      <text x="${cx}" y="${bodyTop + 30 + h*0.16}" text-anchor="middle" font-family="Consolas,monospace"
        font-size="${Math.round(w/12)}" fill="#fff" opacity=".35">15 kg </text>
      <!-- Cutaway window for liquid level (if liqPct > 0) -->
      ${liqPct > 0 ? `
        <clipPath id="stClip${cx}_${cy}">
          <rect x="${x + 6}" y="${bodyTop + 4}" width="${w - 12}" height="${yFootStart - bodyTop - 4}" rx="3"/>
        </clipPath>
        <g clip-path="url(#stClip${cx}_${cy})">
          <rect x="${x + 6}" y="${liqTop}" width="${w - 12}" height="${yFootStart - liqTop}" fill="url(#stLiq)"/>
          <line x1="${x + 6}" y1="${liqTop}" x2="${x + w - 6}" y2="${liqTop}" stroke="#fff" stroke-width="1.5" opacity=".5"/>
        </g>
      ` : ''}
      <!-- Highlight reflection -->
      <rect x="${x + 6}" y="${bodyTop}" width="${w * 0.32}" height="${yFootStart - bodyTop}" rx="6" fill="url(#stHighlight)" pointer-events="none"/>
      <!-- Valve assembly on top -->
      <rect x="${cx - 22}" y="${yTop}" width="44" height="18" rx="2" fill="#5a6577"/>
      <rect x="${cx - 14}" y="${yTop - 12}" width="28" height="14" rx="2" fill="url(#stMetal)"/>
      <!-- Hand wheel -->
      <g transform="translate(${cx}, ${yTop - 18})">
        <circle r="11" fill="#cdd5e3" stroke="#3a4258" stroke-width="1.5"/>
        <circle r="3" fill="#3a4258"/>
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#3a4258" stroke-width="2"/>
        <line x1="0" y1="-10" x2="0" y2="10" stroke="#3a4258" stroke-width="2"/>
      </g>
      <!-- Dust cap -->
      <circle cx="${cx + 22}" cy="${yTop - 4}" r="6" fill="#1a1d2a" stroke="#3a4258" stroke-width="1"/>
    `;
  }

  // ============================================================
  // STEP HEADER — used by all 5 steps
  // ============================================================
  function stepHeader(n, titleTh, titleEn){
    return `
      <g transform="translate(40, 40)">
        <rect x="0" y="0" width="60" height="60" rx="12" fill="var(--accent)" stroke="#1a0f00" stroke-width="2"/>
        <text x="30" y="44" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="36" font-weight="800" fill="#1a0f00">${n}</text>
      </g>
      <text x="120" y="60" font-family="Sarabun,sans-serif" font-size="32" font-weight="800" fill="var(--ink)">${titleTh}</text>
      <text x="120" y="86" font-family="Sarabun,sans-serif" font-size="18" font-weight="500" fill="var(--muted)">${titleEn}</text>
    `;
  }

  // ============================================================
  // STEP 1: ตรวจเช็คสภาพถัง (Inspection)
  // Layout: Cylinder on LEFT, callouts stacked on RIGHT — no overlap with body
  // ============================================================
  function buildStep1(){
    const stage = document.getElementById('stageStep1');
    if (!stage) return;
    // Cylinder positioned on LEFT side of viewBox
    const cx = 400, cy = 470, w = 220, h = 430;
    const yTop = cy - h/2;
    const yBot = cy + h/2;
    const bodyTop = yTop + 36;

    // Inspection points — each has its target point ON the cylinder + a callout slot on the right
    // calloutY: where the callout box sits on the right side (stacked vertically)
    // cylX, cylY: target point on the cylinder for the magnifying glass to focus
    const calloutX = 750;
    const calloutW = 780;
    const points = [
      { id:1, label:'วาล์วทองเหลือง',  desc:'',
        cylX:cx,             cylY:yTop - 14, calloutY:170 },
      { id:2, label:'ป้าย Name plate',    desc:'',
        cylX:cx + w/2 - 20,  cylY:bodyTop + 80, calloutY:270 },
      { id:3, label:'ตัวถัง (Body)',      desc:'',
        cylX:cx,             cylY:bodyTop + 160, calloutY:370 },
      { id:4, label:'Re-test stamp',      desc:'',
        cylX:cx + w/2 - 30,  cylY:bodyTop + 240, calloutY:470 },
      
    ];

    stage.innerHTML = `
      <svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid meet">
        ${SHARED_DEFS}
        <rect width="1600" height="840" fill="url(#stSky)"/>
        ${stepHeader(1, 'ตรวจสภาพถัง', '')}

        <!-- Big cylinder on LEFT -->
        <g filter="url(#stShadow)">${bigCylinder(cx, cy, w, h, {liqPct:0})}</g>

        <!-- Connector dot indicators on cylinder (where magnifying glass focuses) -->
        ${points.map(p => `
          <circle id="st1Dot${p.id}" cx="${p.cylX}" cy="${p.cylY}" r="8"
                  fill="var(--accent)" stroke="#1a0f00" stroke-width="2" opacity=".5"/>
          <text x="${p.cylX}" y="${p.cylY + 4}" text-anchor="middle" font-family="Consolas,monospace"
                font-size="11" font-weight="800" fill="#1a0f00" pointer-events="none">${p.id}</text>
        `).join('')}

        <!-- Magnifying glass (animated — moves to each check point on cylinder) -->
        <g id="st1Mag" style="transition:transform .6s cubic-bezier(.4,.6,.4,1)">
          <circle cx="0" cy="0" r="42" fill="rgba(255,179,71,.18)" stroke="var(--accent)" stroke-width="5"/>
          <circle cx="0" cy="0" r="38" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/>
          <line x1="30" y1="30" x2="64" y2="64" stroke="var(--accent)" stroke-width="8" stroke-linecap="round"/>
        </g>

        <!-- Callouts on the RIGHT side (5 stacked, no overlap with cylinder) -->
        ${points.map(p => `
          <g id="st1Pt${p.id}" data-pt="${p.id}" opacity=".55">
            <!-- Connector line from cylinder point to callout left edge -->
            <line x1="${p.cylX + 14}" y1="${p.cylY}" x2="${calloutX - 8}" y2="${p.calloutY + 40}"
                  stroke="var(--accent)" stroke-width="2" stroke-dasharray="6 4" opacity=".6"/>
            <!-- Callout box (wider + taller for big text) -->
            <rect x="${calloutX}" y="${p.calloutY}" width="${calloutW}" height="80" rx="10"
                  fill="rgba(8,14,28,.95)" stroke="var(--accent)" stroke-width="2"/>
            <!-- Number badge (bigger) -->
            <circle cx="${calloutX + 36}" cy="${p.calloutY + 40}" r="22" fill="var(--accent)" stroke="#1a0f00" stroke-width="2"/>
            <text x="${calloutX + 36}" y="${p.calloutY + 48}" text-anchor="middle" font-family="Consolas,monospace"
                  font-size="22" font-weight="800" fill="#1a0f00">${p.id}</text>
            <!-- Title (bigger Thai font) -->
            <text x="${calloutX + 76}" y="${p.calloutY + 32}" font-family="Sarabun,sans-serif"
                  font-size="22" font-weight="700" fill="var(--accent)">${p.label}</text>
            <!-- Description (readable size) -->
            <text x="${calloutX + 76}" y="${p.calloutY + 60}" font-family="Sarabun,sans-serif"
                  font-size="15" fill="var(--ink-2)">${p.desc}</text>
            <!-- Check mark (revealed when this point has been inspected) -->
            <g id="st1Check${p.id}" opacity="0">
              <circle cx="${calloutX + calloutW - 36}" cy="${p.calloutY + 40}" r="22" fill="var(--good)" stroke="#1a4221" stroke-width="2"/>
              <text x="${calloutX + calloutW - 36}" y="${p.calloutY + 49}" text-anchor="middle" font-size="26" font-weight="800" fill="#04210f">✓</text>
            </g>
          </g>
        `).join('')}

        <!-- Worker on far right side (lower corner) — observing/holding clipboard -->
        <g transform="translate(1470, 660)">
          <path d="M-15 0 L15 0 L20 38 L8 38 L7 22 L-7 22 L-8 38 L-20 38 Z" fill="#ffae3d" stroke="#a06030" stroke-width=".6"/>
          <rect x="-13" y="6" width="26" height="2" fill="#fff" opacity=".7"/>
          <rect x="-13" y="20" width="26" height="2" fill="#fff" opacity=".7"/>
          <circle cx="0" cy="-10" r="10" fill="#ffce8a"/>
          <path d="M-10 -13 Q0 -24 10 -13 L10 -8 L-10 -8 Z" fill="#ff7a45"/>
          <!-- Safety glasses -->
          <rect x="-6" y="-9" width="4" height="2" fill="#3a4258"/>
          <rect x="2" y="-9" width="4" height="2" fill="#3a4258"/>
          <!-- Clipboard -->
          <rect x="15" y="8" width="14" height="20" fill="#fff" stroke="#3a4258"/>
          <line x1="17" y1="13" x2="27" y2="13" stroke="#3a4258" stroke-width=".5"/>
          <line x1="17" y1="17" x2="27" y2="17" stroke="#3a4258" stroke-width=".5"/>
          <line x1="17" y1="21" x2="27" y2="21" stroke="#3a4258" stroke-width=".5"/>
          <rect x="-12" y="38" width="8" height="14" fill="#1a1d2a"/>
          <rect x="4" y="38" width="8" height="14" fill="#1a1d2a"/>
        </g>

        <!-- Status bar at bottom -->
        <rect x="40" y="760" width="1520" height="60" rx="10" fill="rgba(8,14,28,.9)" stroke="var(--line)" stroke-width="1.5"/>
        <text id="st1Status" x="800" y="800" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="22" font-weight="700" fill="var(--ink)">⏳ กำลังตรวจสอบจุดที่ 1...</text>
      </svg>
    `;

    return { points };
  }

  let st1Data = null;
  let st1Raf = null;
  function animateStep1(){
    st1Data = buildStep1();
    cancelAnimationFrame(st1Raf);
    const start = performance.now();
    const dur = 3500; // ms per point
    const total = 5;
    function tick(t){
      const elapsed = (t - start);
      const cycle = elapsed % (dur * total + 2000); // 5 points + 2s "complete" hold
      const idx = Math.min(total - 1, Math.floor(cycle / dur));
      const isComplete = cycle >= dur * total;
      const phase = (cycle % dur) / dur;

      // Update each callout's opacity + check mark
      for (let i = 1; i <= total; i++){
        const pt = document.getElementById('st1Pt' + i);
        const chk = document.getElementById('st1Check' + i);
        const dot = document.getElementById('st1Dot' + i);
        const isActive = !isComplete && i === idx + 1;
        const isPast = i < idx + 1 || isComplete;
        if (pt) pt.setAttribute('opacity', isActive ? 1 : (isPast ? 0.9 : 0.55));
        if (chk) chk.setAttribute('opacity', isPast ? 1 : 0);
        if (dot) dot.setAttribute('opacity', isActive ? 1 : (isPast ? 0.85 : 0.4));
      }
      // Cycle reset: hide check marks at start of new cycle
      if (cycle < 100){
        for (let i = 1; i <= total; i++){
          const chk = document.getElementById('st1Check' + i);
          if (chk) chk.setAttribute('opacity', 0);
        }
      }

      // Move magnifying glass to current point (smooth ease)
      const target = st1Data.points[idx];
      const mag = document.getElementById('st1Mag');
      if (mag && target){
        const moveT = Math.min(1, phase / 0.35);
        const eased = moveT < 0.5 ? 2 * moveT * moveT : 1 - Math.pow(-2 * moveT + 2, 2) / 2;
        const prevIdx = (idx - 1 + total) % total;
        const prev = st1Data.points[prevIdx];
        const mx = prev.cylX + (target.cylX - prev.cylX) * eased;
        const my = prev.cylY + (target.cylY - prev.cylY) * eased;
        mag.setAttribute('transform', `translate(${mx}, ${my})`);
      }

      // Update status text
      const status = document.getElementById('st1Status');
      if (status){
        if (isComplete){
          status.textContent = '✓ ผ่านการตรวจสอบสภาพถัง — APPROVED ส่งต่อไปขั้นตอนถัดไป';
          status.setAttribute('fill', 'var(--good)');
        } else {
          status.textContent = `🔍 กำลังตรวจจุดที่ ${idx + 1} / 5: ${target.label}`;
          status.setAttribute('fill', 'var(--ink)');
        }
      }

      st1Raf = requestAnimationFrame(tick);
    }
    st1Raf = requestAnimationFrame(tick);
  }

  // ============================================================
  // STEP 2: ชั่งน้ำหนักเปล่า (Tare)
  // ============================================================
  function buildStep2(){
    const stage = document.getElementById('stageStep2');
    if (!stage) return;
    stage.innerHTML = `
      <svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid meet">
        ${SHARED_DEFS}
        <rect width="1600" height="840" fill="url(#stSky)"/>
        ${stepHeader(2, 'ชั่งน้ำหนักถังเปล่า', '')}

        <!-- Cylinder on scale (left) -->
        <g filter="url(#stShadow)">${bigCylinder(500, 400, 200, 400, {liqPct:0})}</g>

        <!-- Scale platform under cylinder -->
        <g filter="url(#stShadow)">
          <rect x="320" y="618" width="360" height="30" rx="3" fill="#3a4258" stroke="#0a1322" stroke-width="1.5"/>
          <rect x="320" y="618" width="360" height="6" fill="#5a6577"/>
          <!-- Scale legs/columns -->
          <rect x="340" y="648" width="14" height="30" fill="#3a4258"/>
          <rect x="646" y="648" width="14" height="30" fill="#3a4258"/>
          <!-- Base -->
          <rect x="300" y="676" width="400" height="14" rx="2" fill="#252e44"/>
        </g>

        <!-- Big digital display panel (right) -->
        <g filter="url(#stShadow)">
          <rect x="850" y="280" width="640" height="320" rx="14" fill="#0a1322" stroke="#3a4258" stroke-width="3"/>
          <rect x="850" y="280" width="640" height="50" fill="#1a1d2a"/>
          <text x="1170" y="313" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="22" font-weight="700" fill="var(--liquid)">น้ำหนักถังเปล่า</text>

          <!-- 7-segment style readout -->
          <rect x="900" y="360" width="540" height="160" rx="8" fill="#000"/>
          <text id="st2Display" x="1170" y="488" text-anchor="middle" font-family="Consolas,monospace" font-size="110" font-weight="800" fill="var(--good)">0.0</text>
          <text x="1380" y="488" font-family="Sarabun,sans-serif" font-size="36" fill="var(--good)" opacity=".75">kg</text>

          <!-- Sub info -->
          <text x="900" y="555" font-family="Sarabun,sans-serif" font-size="16" fill="var(--muted)"> </text>
          <text x="1280" y="555" font-family="Consolas,monospace" font-size="22" font-weight="700" fill="var(--accent)"></text>

          <text id="st2Status" x="1170" y="585" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="14" fill="var(--muted)">⏳ กำลังชั่ง...</text>
        </g>

        <!-- Status bar at bottom -->
        <rect x="40" y="760" width="1520" height="60" rx="10" fill="rgba(8,14,28,.9)" stroke="var(--line)" stroke-width="1.5"/>
        <text x="800" y="800" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="20" font-weight="600" fill="var(--ink-2)"></text>
      </svg>
    `;
  }

  let st2Raf = null;
  function animateStep2(){
    buildStep2();
    cancelAnimationFrame(st2Raf);
    const start = performance.now();
    const dur = 5000;     // ms to count up
    const target = 14.5;
    function tick(t){
      const elapsed = (t - start) % (dur + 3000);   // 5s count, 3s hold, repeat
      const display = document.getElementById('st2Display');
      const status = document.getElementById('st2Status');
      if (!display) return;
      if (elapsed < dur){
        const p = elapsed / dur;
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        display.textContent = val.toFixed(1);
        display.setAttribute('fill', 'var(--good)');
        if (status){ status.textContent = '⏳ กำลังชั่ง...'; status.setAttribute('fill','var(--muted)'); }
      } else {
        display.textContent = target.toFixed(1);
        display.setAttribute('fill', 'var(--good)');
        if (status){ status.textContent = ''; status.setAttribute('fill','var(--good)'); }
      }
      st2Raf = requestAnimationFrame(tick);
    }
    st2Raf = requestAnimationFrame(tick);
  }

  // ============================================================
  // STEP 3: อัด LPG เข้าถัง (Fill)
  // ============================================================
  function buildStep3(){
    const stage = document.getElementById('stageStep3');
    if (!stage) return;
    stage.innerHTML = `
      <svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid meet">
        ${SHARED_DEFS}
        <rect width="1600" height="840" fill="url(#stSky)"/>
        ${stepHeader(3, 'อัด LPG เข้าถัง', '')}

        <!-- Filling head from above (moved down 40px so it doesn't overlap title/subtitle) -->
        <g filter="url(#stShadow)">
          <!-- LPG supply pipe (top, descends to cylinder) -->
          <rect x="490" y="170" width="20" height="100" fill="#7d8aa3" stroke="#1a1d2a" stroke-width="1.5"/>
          <text x="408" y="160" font-family="Sarabun,sans-serif" font-size="15" font-weight="700" fill="var(--liquid)">⬇ LPG จากปั๊ม</text>
          <!-- Filling head/lance -->
          <rect x="470" y="270" width="60" height="40" rx="4" fill="#3a4258" stroke="#1a1d2a" stroke-width="1.5"/>
          <rect x="475" y="310" width="50" height="16" rx="2" fill="#5a6577"/>
          <rect x="492" y="326" width="16" height="14" fill="#7d8aa3"/>
          <!-- Vapor return pipe (to the right, exits) -->
          <rect x="490" y="260" width="10" height="2" fill="#7d8aa3"/>
          <path d="M 530 290 L 620 290 L 620 170" stroke="#7d8aa3" stroke-width="12" fill="none" stroke-linecap="round"/>
          <text x="640" y="160" font-family="Sarabun,sans-serif" font-size="15" font-weight="700" fill="var(--vapor)"></text>
          <!-- Animated vapor puffs going up the return pipe -->
          <circle cx="626" cy="200" r="4" fill="var(--vapor)" opacity=".7">
            <animate attributeName="cy" values="290;170" dur="1.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".8;0" dur="1.4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="626" cy="200" r="3" fill="var(--vapor)" opacity=".7">
            <animate attributeName="cy" values="290;170" dur="1.4s" begin="-.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".8;0" dur="1.4s" begin="-.5s" repeatCount="indefinite"/>
          </circle>
        </g>

        <!-- Cylinder (large, with cutaway showing rising liquid) — moved down 40px -->
        <g filter="url(#stShadow)">
          ${bigCylinder(500, 520, 200, 400, {liqPct:0.5})}
        </g>
        <!-- Override liquid level dynamically (also shifted down 40) -->
        <clipPath id="st3LiqClip">
          <rect x="406" y="346" width="188" height="372" rx="3"/>
        </clipPath>
        <g clip-path="url(#st3LiqClip)">
          <rect id="st3Liq" x="406" y="590" width="188" height="128" fill="url(#stLiq)"/>
          <line id="st3LiqTop" x1="406" y1="590" x2="594" y2="590" stroke="#fff" stroke-width="1.5" opacity=".5"/>
        </g>

        <!-- LPG flow animation inside vertical supply pipe (y shifted +90) -->
        <circle cx="500" cy="190" r="5" fill="var(--liquid)" opacity=".85">
          <animate attributeName="cy" values="170;270" dur=".8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;.9;.9;0" dur=".8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="500" cy="190" r="5" fill="var(--liquid)" opacity=".85">
          <animate attributeName="cy" values="170;270" dur=".8s" begin="-.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;.9;.9;0" dur=".8s" begin="-.4s" repeatCount="indefinite"/>
        </circle>

        <!-- Right side: weight display + status -->
        <g filter="url(#stShadow)">
          <rect x="850" y="280" width="640" height="320" rx="14" fill="#0a1322" stroke="#3a4258" stroke-width="3"/>
          <rect x="850" y="280" width="640" height="50" fill="#1a1d2a"/>
          <text x="1170" y="313" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="22" font-weight="700" fill="var(--liquid)">FILLING • กำลังบรรจุ</text>

          <rect x="900" y="360" width="540" height="120" rx="8" fill="#000"/>
          <text id="st3Display" x="1170" y="455" text-anchor="middle" font-family="Consolas,monospace" font-size="84" font-weight="800" fill="var(--accent)">14.5</text>
          <text x="1380" y="455" font-family="Sarabun,sans-serif" font-size="28" fill="var(--accent)" opacity=".75">kg</text>

          <!-- Progress bar -->
          <rect x="900" y="510" width="540" height="22" rx="4" fill="#1a1d2a" stroke="#3a4258"/>
          <rect id="st3Bar" x="900" y="510" width="0" height="22" rx="4" fill="var(--accent)"/>
          <text x="900" y="552" font-family="Sarabun,sans-serif" font-size="14" fill="var(--muted)"" font-weight="700"></tspan></text>
          <text id="st3Status" x="1440" y="552" text-anchor="end" font-family="Sarabun,sans-serif" font-size="14" fill="var(--muted)">⏳ ไหลเข้า...</text>

          <!-- Pressure indicator -->
          <text x="900" y="585" font-family="Sarabun,sans-serif" font-size="13" fill="var(--muted)"><tspan fill="var(--good)" font-weight="700">บรรจุไม่เกิน 85%</tspan></text>
        </g>

        <!-- Status bar at bottom -->
        <rect x="40" y="760" width="1520" height="60" rx="10" fill="rgba(8,14,28,.9)" stroke="var(--line)" stroke-width="1.5"/>
        <text id="st3StatusBottom" x="800" y="800" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="19" font-weight="600" fill="var(--ink-2)"></text>
      </svg>
    `;
  }

  let st3Raf = null;
  function animateStep3(){
    buildStep3();
    cancelAnimationFrame(st3Raf);
    const start = performance.now();
    const dur = 8000;
    function tick(t){
      const elapsed = (t - start) % (dur + 4000);
      const display = document.getElementById('st3Display');
      const bar = document.getElementById('st3Bar');
      const liq = document.getElementById('st3Liq');
      const liqTop = document.getElementById('st3LiqTop');
      const status = document.getElementById('st3Status');
      const statusBottom = document.getElementById('st3StatusBottom');
      if (!display) return;

      if (elapsed < dur){
        const p = elapsed / dur;
        const val = 14.5 + (29.5 - 14.5) * p;
        display.textContent = val.toFixed(1);
        if (bar) bar.setAttribute('width', 540 * p);
        // Liquid level rises: cylinder body y=346 to y=718, height=372
        // Range in cylinder: y=346 to y=718 (after 40px down-shift)
        // 85% fill = 372 * 0.85 = 316
        // Starts at 50% (mid) and rises to 85%
        const liqH = 128 + (316 - 128) * p;
        const liqY = 718 - liqH;
        if (liq){ liq.setAttribute('y', liqY); liq.setAttribute('height', liqH); }
        if (liqTop) liqTop.setAttribute('y1', liqY), liqTop.setAttribute('y2', liqY);
        if (status){ status.textContent = '⏳ ไหลเข้า...'; status.setAttribute('fill', 'var(--accent)'); }
      } else {
        display.textContent = '29.5';
        display.setAttribute('fill', 'var(--good)');
        if (bar){ bar.setAttribute('width', 540); bar.setAttribute('fill', 'var(--good)'); }
        if (liq){ liq.setAttribute('y', 402); liq.setAttribute('height', 316); }
        if (liqTop){ liqTop.setAttribute('y1', 402); liqTop.setAttribute('y2', 402); }
        if (status){ status.textContent = '✓ AUTO-CUT — ปิดวาล์วอัตโนมัติ'; status.setAttribute('fill', 'var(--good)'); }
      }
      st3Raf = requestAnimationFrame(tick);
    }
    st3Raf = requestAnimationFrame(tick);
  }

  // ============================================================
  // STEP 4: ชั่งน้ำหนักหลังจากบรรจุ (Check-weigh)
  // ============================================================
  function buildStep4(){
    const stage = document.getElementById('stageStep4');
    if (!stage) return;
    stage.innerHTML = `
      <svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid meet">
        ${SHARED_DEFS}
        <rect width="1600" height="840" fill="url(#stSky)"/>
        ${stepHeader(4, 'ชั่งซ้ำหลังบรรจุ', '')}

        <!-- Filled cylinder on check-weigher (left) -->
        <g filter="url(#stShadow)">${bigCylinder(500, 400, 200, 400, {liqPct:0.82})}</g>

        <!-- Check-weigher scale -->
        <g filter="url(#stShadow)">
          <rect x="320" y="618" width="360" height="30" rx="3" fill="#3a4258" stroke="#0a1322" stroke-width="1.5"/>
          <rect x="320" y="618" width="360" height="6" fill="#3ddc84"/>
          <!-- Indicator light -->
          <circle cx="350" cy="633" r="6" fill="var(--good)" class="pulse"/>
          <text x="365" y="638" font-family="Consolas,monospace" font-size="12" font-weight="700" fill="var(--good)">CHK</text>
          <rect x="340" y="648" width="14" height="30" fill="#3a4258"/>
          <rect x="646" y="648" width="14" height="30" fill="#3a4258"/>
          <rect x="300" y="676" width="400" height="14" rx="2" fill="#252e44"/>
        </g>

        <!-- Display panel -->
        <g filter="url(#stShadow)">
          <rect x="850" y="240" width="640" height="380" rx="14" fill="#0a1322" stroke="#3a4258" stroke-width="3"/>
          <rect x="850" y="240" width="640" height="50" fill="#1a1d2a"/>
          <text x="1170" y="273" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="22" font-weight="700" fill="var(--liquid)">ตรวจสอบน้ำหนักรวม LPG</text>

          <rect x="900" y="320" width="540" height="160" rx="8" fill="#000"/>
          <text id="st4Display" x="1170" y="448" text-anchor="middle" font-family="Consolas,monospace" font-size="110" font-weight="800" fill="var(--good)">--.- </text>
          <text x="1380" y="448" font-family="Sarabun,sans-serif" font-size="36" fill="var(--good)" opacity=".75">kg</text>

          <!-- Tolerance bar -->
          <text x="900" y="510" font-family="Sarabun,sans-serif" font-size="14" fill="var(--muted)"></text>
          <!-- Pass/Reject indicator -->
          <rect x="900" y="525" width="540" height="50" rx="8" fill="#1a1d2a" stroke="#3a4258"/>
          <text id="st4Result" x="1170" y="558" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="22" font-weight="800" fill="var(--muted)">⏳ ตรวจสอบ...</text>

          <text x="900" y="600" font-family="Sarabun,sans-serif" font-size="13" fill="var(--muted)"></text>
        </g>

        <!-- Status bar at bottom -->
        <rect x="40" y="760" width="1520" height="60" rx="10" fill="rgba(8,14,28,.9)" stroke="var(--line)" stroke-width="1.5"/>
        <text x="800" y="800" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="20" font-weight="600" fill="var(--ink-2)"></text>
      </svg>
    `;
  }

  let st4Raf = null;
  function animateStep4(){
    buildStep4();
    cancelAnimationFrame(st4Raf);
    const start = performance.now();
    const dur = 3000;
    function tick(t){
      const elapsed = (t - start) % (dur + 4000);
      const display = document.getElementById('st4Display');
      const result = document.getElementById('st4Result');
      if (!display) return;
      if (elapsed < dur){
        const p = elapsed / dur;
        const eased = 1 - Math.pow(1 - p, 3);
        const val = 29.5 * eased;
        display.textContent = val.toFixed(1);
        if (result){ result.textContent = '⏳ ตรวจสอบ...'; result.setAttribute('fill', 'var(--muted)'); }
      } else {
        display.textContent = '29.5';
        if (result){ result.textContent = ''; result.setAttribute('fill', 'var(--good)'); }
      }
      st4Raf = requestAnimationFrame(tick);
    }
    st4Raf = requestAnimationFrame(tick);
  }

  // ============================================================
  // STEP 5: ทดสอบการรั่วซึม (Leak test)
  // ============================================================
  function buildStep5(){
    const stage = document.getElementById('stageStep5');
    if (!stage) return;
    stage.innerHTML = `
      <svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid meet">
        ${SHARED_DEFS}
        <rect width="1600" height="840" fill="url(#stSky)"/>
        ${stepHeader(5, 'ทดสอบการรั่วซึม', '')}

        <!-- Leak detection booth (enclosure around cylinder) -->
        <g filter="url(#stShadow)">
          <!-- Booth frame -->
          <rect x="280" y="200" width="500" height="540" rx="12" fill="rgba(8,14,28,.4)" stroke="#5a6577" stroke-width="3"/>
          <!-- Booth header -->
          <rect x="280" y="200" width="500" height="50" fill="#1a1d2a"/>
          <text x="530" y="232" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="20" font-weight="700" fill="var(--liquid)">ทดสอบด้วยฟองสบู่ หรือน้ำ</text>
          <!-- Vent hood on top -->
          <polygon points="380,200 530,170 680,200" fill="#3a4258"/>
          <rect x="520" y="140" width="20" height="40" fill="#7d8aa3"/>
        </g>

        <!-- Cylinder inside booth -->
        <g filter="url(#stShadow)">${bigCylinder(530, 480, 180, 380, {liqPct:0.82})}</g>

        <!-- 3 SENSOR PROBES + status indicators -->

    `;
  }

  let st5Raf = null;
  function animateStep5(){
    buildStep5();
    cancelAnimationFrame(st5Raf);
    const start = performance.now();
    function tick(t){
      const elapsed = (t - start) % 10000;   // 10s loop
      // Phase 0-1s: idle (all gray)
      // Phase 1-3s: sensor 1 activates
      // Phase 3-5s: sensor 2 activates
      // Phase 5-7s: sensor 3 activates
      // Phase 7-10s: all green, PASS displayed

      const s1On = elapsed > 1500;
      const s2On = elapsed > 3500;
      const s3On = elapsed > 5500;

      function setLight(num, on){
        const light = document.getElementById('st5S' + num + 'Light');
        const tick = document.getElementById('st5S' + num + 'Tick');
        if (light) light.setAttribute('fill', on ? 'var(--good)' : '#3a4258');
        if (tick) tick.setAttribute('opacity', on ? 1 : 0);
      }
      setLight(1, s1On);
      setLight(2, s2On);
      setLight(3, s3On);

      const display = document.getElementById('st5Display');
      const result = document.getElementById('st5Result');
      if (display) display.textContent = '0';
      if (result){
        if (s1On && s2On && s3On){
          result.textContent = '✓ NO LEAK • ผ่านการทดสอบทั้ง 3 จุด';
          result.setAttribute('fill', 'var(--good)');
        } else {
          result.textContent = '⏳ ทดสอบเซ็นเซอร์ ' + ((s1On?1:0)+(s2On?1:0)+(s3On?1:0)) + '/3';
          result.setAttribute('fill', 'var(--muted)');
        }
      }
      st5Raf = requestAnimationFrame(tick);
    }
    st5Raf = requestAnimationFrame(tick);
  }

  // ============================================================
  // STEP 6: ปิดซีล + อุปกรณ์บนหัวถัง (Seal + Cap)
  // Per Thai LPG industry practice — body is PAINTED with brand (no stickers/QR).
  // After filling, 4 things happen on the valve area only:
  //   1. ฝาครอบวาล์วพลาสติก (Plastic dust cap)
  //   2. ซีลพลาสติกหดกันแกะ (Heat-shrink tamper seal)
  //   3. ป้ายห้อยกระดาษ (Hang tag — lot/date/distributor)
  //   4. ตรวจขั้นสุดท้าย (Final visual inspection)
  // ============================================================
  function buildStep6(){
    const stage = document.getElementById('stageStep6');
    if (!stage) return;
    const cx = 480, cy = 470, w = 220, h = 430;
    const yTop = cy - h/2;
    stage.innerHTML = `
      <svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid meet">
        ${SHARED_DEFS}
        <rect width="1600" height="840" fill="url(#stSky)"/>
        ${stepHeader(6, 'ปิดซีล + อุปกรณ์บนหัวถัง', '')}

        <!-- Cylinder (filled) with painted brand (NOT a sticker — Thai cylinders are painted) -->
        <g filter="url(#stShadow)">${bigCylinder(cx, cy, w, h, {liqPct:0.82})}</g>

        <!-- 1. PLASTIC DUST CAP — snap-on plastic cover for valve nozzle -->
        <g id="st6Cap" opacity="0">
          <!-- Cap body (yellow plastic — common color for Thai LPG) -->
          <ellipse cx="${cx}" cy="${yTop - 26}" rx="18" ry="5" fill="#1a0f00" opacity=".4"/>
          <rect x="${cx - 16}" y="${yTop - 34}" width="32" height="12" rx="2.5" fill="#ffce39" stroke="#a06030" stroke-width="1.2"/>
          <rect x="${cx - 14}" y="${yTop - 33}" width="28" height="3" fill="#ffe9a3"/>
          <!-- Cap top knob -->
          <rect x="${cx - 8}" y="${yTop - 40}" width="16" height="6" rx="1.5" fill="#ffce39" stroke="#a06030" stroke-width=".8"/>
        </g>

        <!-- 2. HEAT-SHRINK TAMPER SEAL — thin colored plastic film around valve neck -->
        <g id="st6Seal" opacity="0">
          <!-- Translucent heat-shrunk film -->
          <rect x="${cx - 24}" y="${yTop - 4}" width="48" height="18" rx="1" fill="#a82530" stroke="#5a0d10" stroke-width="1"/>
          <!-- Bumpy heat-shrink texture lines -->
          <g stroke="#5a0d10" stroke-width=".5" opacity=".5">
            <line x1="${cx - 22}" y1="${yTop + 1}" x2="${cx + 22}" y2="${yTop + 1}"/>
            <line x1="${cx - 22}" y1="${yTop + 5}" x2="${cx + 22}" y2="${yTop + 5}"/>
            <line x1="${cx - 22}" y1="${yTop + 9}" x2="${cx + 22}" y2="${yTop + 9}"/>
          </g>
          <text x="${cx}" y="${yTop + 7}" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="8" font-weight="800" fill="#fff">SEAL</text>
        </g>

        <!-- 3. HANG TAG — paper card on string around valve neck -->
        <g id="st6Tag" opacity="0">
          <!-- String -->
          <path d="M ${cx + 18} ${yTop + 2} Q ${cx + 30} ${yTop + 12} ${cx + 36} ${yTop + 30}" stroke="#7d8aa3" stroke-width="1" fill="none"/>
          <!-- Paper tag -->
          <rect x="${cx + 32}" y="${yTop + 32}" width="56" height="78" rx="3" fill="#fff9e6" stroke="#a06030" stroke-width="1.5"/>
          <!-- Hole at top -->
          <circle cx="${cx + 60}" cy="${yTop + 38}" r="2" fill="#0a1322"/>
          <!-- Tag content -->
          <text x="${cx + 60}" y="${yTop + 54}" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="8" font-weight="800" fill="#5a1015">NET ENERGY</text>
          <line x1="${cx + 36}" y1="${yTop + 58}" x2="${cx + 84}" y2="${yTop + 58}" stroke="#a06030" stroke-width=".5"/>
          <text x="${cx + 60}" y="${yTop + 70}" text-anchor="middle" font-family="Consolas,monospace" font-size="6" fill="#1a1d2a">LOT: A2026</text>
          <text x="${cx + 60}" y="${yTop + 80}" text-anchor="middle" font-family="Consolas,monospace" font-size="6" fill="#1a1d2a">DATE 18/5/26</text>
          <text x="${cx + 60}" y="${yTop + 90}" text-anchor="middle" font-family="Consolas,monospace" font-size="6" fill="#1a1d2a">WT 15.0 kg</text>
          <text x="${cx + 60}" y="${yTop + 102}" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="6" font-weight="700" fill="#5a1015">ผ่าน QC ✓</text>
        </g>

        <!-- 4. FINAL VISUAL CHECK — worker icon with checkmark stamp -->
        <g id="st6QC" opacity="0">
          <!-- Stamp graphic floating near cylinder body -->
          <g transform="translate(${cx + 50}, ${cy + 80})">
            <circle r="36" fill="rgba(61,220,132,.18)" stroke="var(--good)" stroke-width="3"/>
            <text y="-2" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="11" font-weight="800" fill="var(--good)">QC PASS</text>
            <text y="14" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="22" font-weight="800" fill="var(--good)">✓</text>
          </g>
        </g>

        <!-- Worker on right (sealing operator) -->
        <g transform="translate(800, 600)">
          <path d="M-15 0 L15 0 L20 38 L8 38 L7 22 L-7 22 L-8 38 L-20 38 Z" fill="#ffae3d" stroke="#a06030" stroke-width=".6"/>
          <rect x="-13" y="6" width="26" height="2" fill="#fff" opacity=".7"/>
          <circle cx="0" cy="-10" r="9" fill="#ffce8a"/>
          <path d="M-9 -12 Q0 -22 9 -12 L9 -8 L-9 -8 Z" fill="#ff7a45"/>
          <rect x="-6" y="-9" width="4" height="2" fill="#3a4258"/>
          <rect x="2" y="-9" width="4" height="2" fill="#3a4258"/>
          <rect x="-12" y="38" width="8" height="14" fill="#1a1d2a"/>
          <rect x="4" y="38" width="8" height="14" fill="#1a1d2a"/>
        </g>

        

        <!-- Status bar at bottom -->
        <rect x="40" y="760" width="1520" height="60" rx="10" fill="rgba(8,14,28,.9)" stroke="var(--line)" stroke-width="1.5"/>
        <text id="st6Status" x="800" y="800" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="20" font-weight="700" fill="var(--ink)">🔧 กำลังติดตั้งฝาครอบวาล์ว...</text>
      </svg>
    `;
  }

  let st6Raf = null;
  function animateStep6(){
    buildStep6();
    cancelAnimationFrame(st6Raf);
    const start = performance.now();
    const dur = 2200;
    const total = 4;
    const ids = ['Cap','Seal','Tag','QC'];

    function tick(t){
      const elapsed = (t - start) % (dur * total + 4000);
      const idx = Math.min(total - 1, Math.floor(elapsed / dur));
      const isComplete = elapsed >= dur * total;

      for (let i = 0; i < total; i++){
        const el = document.getElementById('st6' + ids[i]);
        const item = document.getElementById('st6Item' + (i+1));
        const chk = document.getElementById('st6Check' + (i+1));
        const isPast = i < idx || isComplete;
        const isActive = !isComplete && i === idx;
        if (el) el.setAttribute('opacity', (isPast || isActive) ? 1 : 0);
        if (item) item.setAttribute('opacity', isActive ? 1 : (isPast ? .9 : .45));
        if (chk) chk.setAttribute('opacity', isPast ? 1 : 0);
      }

      const status = document.getElementById('st6Status');
      if (status){
        if (isComplete){
          status.textContent = '';
          status.setAttribute('fill', 'var(--good)');
        } else {
          status.textContent = `🔧 (${idx+1}/4) ${labels[idx]}`;
          status.setAttribute('fill', 'var(--ink)');
        }
      }
      st6Raf = requestAnimationFrame(tick);
    }
    st6Raf = requestAnimationFrame(tick);
  }

  // ============================================================
  // STEP 7: กระจายสินค้าออกสู่ตลาด (Distribution)
  // Animation: cylinders moved from warehouse onto delivery truck, truck drives away
  // to various customer types (restaurant, household, factory)
  // ============================================================
  function buildStep7(){
    const stage = document.getElementById('stageStep7');
    if (!stage) return;
    stage.innerHTML = `
      <svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid meet">
        ${SHARED_DEFS}
        <rect width="1600" height="840" fill="url(#stSky)"/>
        ${stepHeader(7, 'จัดจำหน่ายสู่ตลาด', '')}

        <!-- Ground -->
        <rect y="640" width="1600" height="200" fill="#1a1d2a"/>
        <!-- Road -->
        <rect y="710" width="1600" height="50" fill="#0a0a14"/>
        <g stroke="#ffce8a" stroke-width="3" stroke-dasharray="22 18">
          <line x1="0" y1="735" x2="1600" y2="735"/>
        </g>

        <!-- Warehouse on LEFT -->
        <g filter="url(#stShadow)">
          <rect x="80" y="340" width="320" height="300" fill="#3a4a6e" stroke="#0a1322" stroke-width="2"/>
          <polygon points="80,340 240,260 400,340" fill="#252e44"/>
          <line x1="240" y1="260" x2="240" y2="640" stroke="#0a1322" stroke-width="2"/>
          <!-- Open door (visible loading bay) -->
          <rect x="190" y="500" width="100" height="140" fill="#0a0a14"/>
          <!-- Sign -->
          <rect x="160" y="320" width="160" height="26" rx="3" fill="var(--accent)"/>
          <text x="240" y="338" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="15" font-weight="800" fill="#1a0f00">WAREHOUSE</text>
          <!-- Cylinders inside -->
          ${[0,1,2,3,4].map(i => `
            <rect x="${100 + i*22}" y="${570 + (i%2)*36}" width="18" height="34" rx="2" fill="url(#stCylBody)" stroke="#3a0d10" stroke-width=".8"/>
            <rect x="${107 + i*22}" y="${567 + (i%2)*36}" width="4" height="4" fill="#7d8aa3"/>
          `).join('')}
        </g>

        <!-- Destinations (drawn FIRST so truck renders ON TOP when passing by) -->
        <g filter="url(#stShadow)">
          <!-- Restaurant -->
          <g transform="translate(1080, 380)">
            <rect x="0" y="40" width="120" height="200" fill="#5a6577" stroke="#0a1322"/>
            <polygon points="0,40 60,0 120,40" fill="#a82530"/>
            <rect x="42" y="160" width="36" height="80" fill="#1a1d2a"/>
            <rect x="20" y="80" width="30" height="30" fill="#88c5ff" opacity=".7"/>
            <rect x="70" y="80" width="30" height="30" fill="#88c5ff" opacity=".7"/>
            <rect x="20" y="120" width="30" height="30" fill="#88c5ff" opacity=".7"/>
            <rect x="70" y="120" width="30" height="30" fill="#88c5ff" opacity=".7"/>
            <text x="60" y="270" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="16" font-weight="700" fill="var(--ink)">🍴 ร้านอาหาร</text>
            <text x="60" y="288" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="12" fill="var(--muted)">Restaurant</text>
          </g>
          <!-- Household -->
          <g transform="translate(1240, 420)">
            <rect x="0" y="40" width="120" height="160" fill="#3a4258" stroke="#0a1322"/>
            <polygon points="0,40 60,-10 120,40" fill="#a82530"/>
            <rect x="44" y="140" width="32" height="60" fill="#1a1d2a"/>
            <rect x="18" y="70" width="30" height="30" fill="#88c5ff" opacity=".7"/>
            <rect x="72" y="70" width="30" height="30" fill="#88c5ff" opacity=".7"/>
            <text x="60" y="230" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="16" font-weight="700" fill="var(--ink)">🏠 บ้านพัก</text>
            <text x="60" y="248" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="12" fill="var(--muted)">Household</text>
          </g>
          <!-- Factory -->
          <g transform="translate(1400, 350)">
            <rect x="0" y="40" width="150" height="220" fill="#3a4a6e" stroke="#0a1322"/>
            <!-- Chimneys -->
            <rect x="20" y="10" width="20" height="40" fill="#5a6577"/>
            <rect x="110" y="0" width="20" height="50" fill="#5a6577"/>
            <!-- Windows pattern -->
            <g fill="#ffce8a" opacity=".5">
              <rect x="14" y="80" width="20" height="14"/>
              <rect x="44" y="80" width="20" height="14"/>
              <rect x="74" y="80" width="20" height="14"/>
              <rect x="104" y="80" width="20" height="14"/>
              <rect x="14" y="110" width="20" height="14"/>
              <rect x="44" y="110" width="20" height="14"/>
              <rect x="74" y="110" width="20" height="14"/>
              <rect x="104" y="110" width="20" height="14"/>
            </g>
            <rect x="56" y="180" width="40" height="80" fill="#1a1d2a"/>
            <text x="75" y="290" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="16" font-weight="700" fill="var(--ink)">🏭 โรงงาน</text>
            <text x="75" y="308" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="12" fill="var(--muted)">Factory</text>
          </g>
        </g>

        <!-- Delivery truck (animated — slides right, drawn AFTER buildings so it appears in front) -->
        <g id="st7Truck">
          <!-- Shadow -->
          <ellipse cx="200" cy="690" rx="180" ry="6" fill="#000" opacity=".5"/>
          <!-- Tanker box truck (cargo container) -->
          <rect x="40" y="540" width="280" height="120" fill="#fff" stroke="#3a4258" stroke-width="2"/>
          <rect x="40" y="540" width="280" height="22" fill="var(--accent)"/>
          <text x="180" y="557" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="15" font-weight="800" fill="#1a0f00">NET ENERGY • LPG DELIVERY</text>
          <!-- Cylinders visible through side -->
          <g id="st7Cargo">
            ${[0,1,2,3,4,5,6].map(i => `
              <rect x="${52 + i*36}" y="572" width="28" height="46" rx="2" fill="url(#stCylBody)" stroke="#3a0d10" stroke-width=".8"/>
              <rect x="${64 + i*36}" y="568" width="6" height="4" fill="#7d8aa3"/>
            `).join('')}
          </g>
          <!-- Cab on RIGHT (facing direction of motion = right) -->
          <rect x="324" y="556" width="60" height="104" fill="#2d3e62" stroke="#0a1322"/>
          <rect x="334" y="568" width="40" height="28" fill="#88c5ff" opacity=".8"/>
          <rect x="378" y="568" width="6" height="40" fill="#1a2a48"/>
          <ellipse cx="383" cy="580" rx="3" ry="5" fill="#ffe9a3"/>
          <!-- Wheels -->
          <circle cx="80" cy="660" r="14" fill="#1a1a1a"/><circle cx="80" cy="660" r="4" fill="#6a7488"/>
          <circle cx="170" cy="660" r="14" fill="#1a1a1a"/><circle cx="170" cy="660" r="4" fill="#6a7488"/>
          <circle cx="240" cy="660" r="14" fill="#1a1a1a"/><circle cx="240" cy="660" r="4" fill="#6a7488"/>
          <circle cx="340" cy="660" r="14" fill="#1a1a1a"/><circle cx="340" cy="660" r="4" fill="#6a7488"/>
        </g>

        <!-- Status bar at bottom -->
        <rect x="40" y="760" width="1520" height="60" rx="10" fill="rgba(8,14,28,.9)" stroke="var(--line)" stroke-width="1.5"/>
        <text id="st7Status" x="800" y="800" text-anchor="middle" font-family="Sarabun,sans-serif" font-size="20" font-weight="700" fill="var(--ink)">🚛 รถบรรทุก LPG เตรียมขนส่งสู่ลูกค้า...</text>
      </svg>
    `;
  }

  let st7Raf = null;
  function animateStep7(){
    buildStep7();
    cancelAnimationFrame(st7Raf);
    const start = performance.now();
    function tick(t){
      const elapsed = (t - start) % 10000; // 10s loop
      const truck = document.getElementById('st7Truck');
      const status = document.getElementById('st7Status');
      if (!truck) return;
      // Phase 0-2s: truck parked at warehouse
      // Phase 2-8s: truck drives right toward destinations
      // Phase 8-10s: truck behind destinations / cycle
      let tx = 0;
      let phase = '';
      if (elapsed < 2000){
        tx = 0;
        phase = '🚛 รถบรรทุก LPG กำลังโหลดถังจากโกดัง...';
      } else if (elapsed < 8000){
        const p = (elapsed - 2000) / 6000;
        // Smooth easing
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        tx = eased * 900;
        phase = '🚛 รถบรรทุกขับกระจายสินค้าไปยังลูกค้า — ร้านอาหาร / บ้าน / โรงงาน';
      } else {
        tx = 900;
        phase = '✓ ส่งถึงลูกค้าเรียบร้อย — รอบใหม่กำลังเริ่ม';
      }
      truck.setAttribute('transform', `translate(${tx},0)`);
      if (status) status.textContent = phase;
      st7Raf = requestAnimationFrame(tick);
    }
    st7Raf = requestAnimationFrame(tick);
  }

  // ============================================================
  // REGISTER ALL 7 STEPS
  // ============================================================
  window.LPG.registerScene('step1', {
    onEnter(){ animateStep1(); },
    onLeave(){ cancelAnimationFrame(st1Raf); st1Raf = null; }
  });
  window.LPG.registerScene('step2', {
    onEnter(){ animateStep2(); },
    onLeave(){ cancelAnimationFrame(st2Raf); st2Raf = null; }
  });
  window.LPG.registerScene('step3', {
    onEnter(){ animateStep3(); },
    onLeave(){ cancelAnimationFrame(st3Raf); st3Raf = null; }
  });
  window.LPG.registerScene('step4', {
    onEnter(){ animateStep4(); },
    onLeave(){ cancelAnimationFrame(st4Raf); st4Raf = null; }
  });
  window.LPG.registerScene('step5', {
    onEnter(){ animateStep5(); },
    onLeave(){ cancelAnimationFrame(st5Raf); st5Raf = null; }
  });
  window.LPG.registerScene('step6', {
    onEnter(){ animateStep6(); },
    onLeave(){ cancelAnimationFrame(st6Raf); st6Raf = null; }
  });
  window.LPG.registerScene('step7', {
    onEnter(){ animateStep7(); },
    onLeave(){ cancelAnimationFrame(st7Raf); st7Raf = null; }
  });
})();
