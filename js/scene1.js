/* ============================================================
   SCENE 1 — LPG SITE OVERVIEW
   16:9 single-slide animation for PPT embed.

   MASTER TIMELINE (16-second loop, frame-accurate via rAF)
   ╔═══════════════════════════════════════════════════════════╗
   ║  0.0 – 2.0s   TRUCK APPROACH    (slides in from left)     ║
   ║  2.0 – 3.0s   TRUCK PARKED      (worker walks to truck)   ║
   ║  3.0 – 4.5s   GROUNDING         (clamp attached, ⚡ on)    ║
   ║  4.5 – 5.5s   HOSE CONNECTION   (worker connects hose)    ║
   ║  5.5 – 12.0s  UNLOADING         (liquid flows 6.5s)       ║
   ║ 12.0 – 13.0s  HOSE DISCONNECT                              ║
   ║ 13.0 – 14.0s  GROUNDING REMOVED                            ║
   ║ 14.0 – 16.0s  TRUCK DEPARTS                                ║
   ╚═══════════════════════════════════════════════════════════╝

   CONTINUOUS (decoupled CSS animations):
   - Pump impeller, compressor piston, cooling fan, carousel
   - Cylinders flowing on conveyor (animateMotion)
   - Clouds drifting, sun glow, wind sock swaying
   - Warning beacons on tank tops
============================================================ */

(function(){
  const root = document.querySelector('.scene[data-scene="overview"]');
  if (!root) return;

  // ============================================================
  // EQUIPMENT METADATA (for info panel on click)
  // ============================================================
  const EQUIP = {
    bullet: {
      title:'ถังเก็บ LPG (Bullet Tank)',
      role:'STORAGE',
      desc:'ถังทรงกระบอกแนวนอน รับความดัน 17-20 บาร์ บรรจุ LPG เหลวสูงสุด 85% เว้นช่องว่าง (ullage) 15% เผื่อการขยายตัวของก๊าซเมื่ออุณหภูมิสูงขึ้น ติดตั้ง PSV ที่จุดสูงสุด',
      img:'./images/bullet.jpg'
    },
    tanker: {
      title:'รถบรรทุก LPG (Tank Truck)',
      role:'INBOUND',
      desc:'รถขนส่ง LPG เหลวจากคลังก๊าซ ความจุ 12-25 ตัน ใช้คอมเพรสเซอร์อัดไอเพื่อสร้างความดันต่าง ดันของเหลวลงถังเก็บ ใช้เวลาถ่าย 60-90 นาที',
      img:'./images/tanker.jpg'
    },
    pump: {
      title:'ปั๊ม LPG (Centrifugal Pump)',
      role:'TRANSFER',
      desc:'ปั๊มหอยโข่งดูดของเหลวจากถังเก็บส่งไปยังหัวบรรจุ ใช้ใบพัดหมุนสร้างความดัน 8-10 บาร์ มี mechanical seal ทนของเหลว LPG และวาล์วบายพาส (by-pass valve) ป้องกัน dead-head',
      img:'./images/pump.jpg'
    },
    compressor: {
      title:'คอมเพรสเซอร์ไอ (Vapor Compressor)',
      role:'TRANSFER',
      desc:'อัดไอ LPG ระหว่างถ่ายเทเหลวจากรถขนส่งไปถังเก็บ สร้างความดันต่างให้ของเหลวไหลได้ เป็นแบบ reciprocating piston หรือ sliding vane',
      img:'./images/compressor.jpg'
    },
    carousel: {
      title:'แท่นบรรจุหมุน (Filling Carousel)',
      role:'FILLING',
      desc:'แท่นหมุน 8-24 หัวบรรจุ แต่ละหัวมีตาชั่ง load cell คุมการตัดวาล์วอัตโนมัติเมื่อถึงน้ำหนัก ความสามารถ 600-1500 ถัง/ชั่วโมง',
      img:'./images/carousel.jpg'
    },
    leak: {
      title:'ตู้ตรวจรอยรั่ว (Leak Detector)',
      role:'QUALITY',
      desc:'ตู้ปิดที่มีเซ็นเซอร์ก๊าซตรวจที่ 3 จุด: O-ring คอวาล์ว / บ่าวาล์ว (valve seat) / รอยเชื่อมตัวถัง ตรวจได้ระดับ 100 ppm ภายใน 3 วินาที',
      img:'./images/detector.jpg'
    },
    warehouse: {
      title:'โกดังเก็บถังบรรจุแล้ว',
      role:'DISPATCH',
      desc:'พื้นที่จัดเก็บถัง LPG ที่ผ่านการตรวจสอบ แยกตามขนาด/ลูกค้า มีระบบระบายอากาศ • ห้ามวางปนกับถังเปล่า • ห่างจากแหล่งความร้อน',
      img:'./images/conveyor.jpg'
    }
  };

  // ============================================================
  // BUILD THE STAGE
  // ============================================================
  const stage = root.querySelector('.stage');
  stage.innerHTML = `
    <div class="info-panel" id="ovInfoPanel">
      <button class="close" id="ovInfoClose" aria-label="close">×</button>
      <div class="role" id="ovInfoRole"></div>
      <h3 id="ovInfoTitle"></h3>
      <p id="ovInfoDesc"></p>
      <div class="photo-mini" id="ovInfoPhoto"></div>
    </div>

    <div class="time-control">
      <span>⏱</span>
      <span class="clock" id="ovClock">0.0s</span>
      <span>|</span>
      <span class="phase" id="ovPhase">⏳ กำลังโหลด...</span>
    </div>

    <svg id="ovSvg" viewBox="0 0 1600 840" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Sky gradient (early evening) -->
        <linearGradient id="skyG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stop-color="#1a2956"/>
          <stop offset="50%" stop-color="#2a3a6b"/>
          <stop offset="85%" stop-color="#4a3f6b"/>
          <stop offset="100%" stop-color="#6b4a4a"/>
        </linearGradient>
        <linearGradient id="groundG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#2c3854"/>
          <stop offset="1" stop-color="#0d1424"/>
        </linearGradient>
        <linearGradient id="padG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#404a60"/>
          <stop offset="1" stop-color="#252e44"/>
        </linearGradient>
        <linearGradient id="tankG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stop-color="#f5f7fb"/>
          <stop offset="35%" stop-color="#c9d2e0"/>
          <stop offset="60%" stop-color="#7a8499"/>
          <stop offset="100%" stop-color="#3a4258"/>
        </linearGradient>
        <linearGradient id="tankRim" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#9ba6b9"/>
          <stop offset="1" stop-color="#4a5266"/>
        </linearGradient>
        <radialGradient id="sunG" cx="50%" cy="50%">
          <stop offset="0" stop-color="#ffaf5b" stop-opacity=".7"/>
          <stop offset="60%" stop-color="#ffaf5b" stop-opacity=".15"/>
          <stop offset="100%" stop-color="#ffaf5b" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="pipeG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#a8b3c8"/>
          <stop offset="50%" stop-color="#6a7488"/>
          <stop offset="1" stop-color="#404a60"/>
        </linearGradient>
        <linearGradient id="liqG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#7ad8ff"/>
          <stop offset="1" stop-color="#1a4a78"/>
        </linearGradient>
        <linearGradient id="redCyl" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#5a1015"/>
          <stop offset="50%" stop-color="#c93545"/>
          <stop offset="100%" stop-color="#5a1015"/>
        </linearGradient>

        <!-- Cylinder symbol -->
        <symbol id="cyl" viewBox="0 0 30 50">
          <rect x="4" y="8" width="22" height="38" rx="3" fill="url(#redCyl)" stroke="#3a0d10" stroke-width=".8"/>
          <rect x="11" y="2" width="8" height="8" rx="1.5" fill="#7d8aa3" stroke="#3a4258" stroke-width=".4"/>
          <rect x="4" y="14" width="22" height="2.5" fill="#1a0508" opacity=".55"/>
          <rect x="4" y="40" width="22" height="2.5" fill="#1a0508" opacity=".55"/>
          <rect x="6" y="19" width="18" height="5" fill="#fff" opacity=".18"/>
        </symbol>

        <!-- Worker with full PPE (FRC suit, hardhat, glasses, gloves, boots) -->
        <symbol id="worker" viewBox="0 0 24 44">
          <!-- Body (FRC suit orange) -->
          <path d="M4 16 L20 16 L22 32 L17 32 L16 24 L8 24 L7 32 L2 32 Z" fill="#ffae3d" stroke="#a06030" stroke-width=".5"/>
          <rect x="3" y="20" width="18" height="1.5" fill="#fff" opacity=".6"/>
          <rect x="3" y="27" width="18" height="1.5" fill="#fff" opacity=".6"/>
          <!-- Head -->
          <circle cx="12" cy="9" r="4.5" fill="#ffce8a"/>
          <!-- Hard hat -->
          <path d="M6 7 Q12 1 18 7 L18 9 L6 9 Z" fill="#ff7a45" stroke="#a04020" stroke-width=".5"/>
          <rect x="6" y="9" width="12" height="1.5" fill="#a04020"/>
          <!-- Safety glasses -->
          <rect x="7" y="9.5" width="4" height="2" rx=".5" fill="#3a4258" opacity=".7"/>
          <rect x="13" y="9.5" width="4" height="2" rx=".5" fill="#3a4258" opacity=".7"/>
          <!-- Gloves -->
          <rect x="2" y="23" width="2" height="3" fill="#5a1015"/>
          <rect x="20" y="23" width="2" height="3" fill="#5a1015"/>
          <!-- Boots -->
          <rect x="5"  y="32" width="4" height="9" fill="#1a1d2a"/>
          <rect x="15" y="32" width="4" height="9" fill="#1a1d2a"/>
          <rect x="5"  y="39" width="4" height="2" fill="#dde3ee"/>
          <rect x="15" y="39" width="4" height="2" fill="#dde3ee"/>
        </symbol>

        <!-- Inspector with clipboard -->
        <symbol id="inspector" viewBox="0 0 24 44">
          <path d="M4 16 L20 16 L22 32 L17 32 L16 24 L8 24 L7 32 L2 32 Z" fill="#5ac8fa" stroke="#1a6ca8" stroke-width=".5"/>
          <rect x="3" y="20" width="18" height="1.5" fill="#fff" opacity=".6"/>
          <circle cx="12" cy="9" r="4.5" fill="#ffce8a"/>
          <path d="M6 7 Q12 1 18 7 L18 9 L6 9 Z" fill="#fff" stroke="#5a6577" stroke-width=".5"/>
          <rect x="6" y="9" width="12" height="1.5" fill="#5a6577"/>
          <!-- Clipboard -->
          <rect x="20" y="20" width="5" height="7" fill="#fff" stroke="#3a4258" stroke-width=".5"/>
          <line x1="21" y1="22" x2="24" y2="22" stroke="#3a4258" stroke-width=".3"/>
          <line x1="21" y1="24" x2="24" y2="24" stroke="#3a4258" stroke-width=".3"/>
          <rect x="5"  y="32" width="4" height="9" fill="#1a1d2a"/>
          <rect x="15" y="32" width="4" height="9" fill="#1a1d2a"/>
        </symbol>

        <!-- Cloud -->
        <symbol id="cloud" viewBox="0 0 100 30">
          <ellipse cx="20" cy="20" rx="20" ry="10" fill="#fff" opacity=".07"/>
          <ellipse cx="45" cy="15" rx="25" ry="12" fill="#fff" opacity=".09"/>
          <ellipse cx="75" cy="20" rx="20" ry="10" fill="#fff" opacity=".07"/>
        </symbol>

        <!-- Truck cab -->
        <symbol id="truckCab" viewBox="0 0 70 70">
          <rect x="0" y="20" width="50" height="40" fill="#2d3e62" stroke="#0a1322"/>
          <rect x="8" y="28" width="30" height="18" fill="#88c5ff" opacity=".8"/>
          <rect x="0" y="20" width="6" height="40" fill="#1a2a48"/>
          <!-- Headlight -->
          <ellipse cx="2" cy="34" rx="2" ry="3" fill="#fff"/>
          <!-- Cab roof -->
          <rect x="3" y="18" width="44" height="3" fill="#1a2a48"/>
        </symbol>

        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="3"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- ====================== SKY ====================== -->
      <rect width="1600" height="540" fill="url(#skyG)"/>
      <!-- Sun -->
      <circle cx="1340" cy="120" r="180" fill="url(#sunG)"/>
      <circle cx="1340" cy="120" r="34" fill="#ffd166" opacity=".95"/>
      <circle cx="1340" cy="120" r="46" fill="#ffd166" opacity=".25"/>

      <!-- Drifting clouds (3 parallax layers) -->
      <g class="cloud-c"><use href="#cloud" x="-220" y="50"  width="200" height="55" opacity=".4"/></g>
      <g class="cloud-b"><use href="#cloud" x="-280" y="110" width="240" height="62" opacity=".55"/></g>
      <g class="cloud-a"><use href="#cloud" x="-160" y="180" width="160" height="45" opacity=".45"/></g>
      <g class="cloud-c"><use href="#cloud" x="-400" y="80"  width="180" height="50" opacity=".35"/></g>
      <g class="cloud-b"><use href="#cloud" x="-520" y="210" width="200" height="55" opacity=".5"/></g>

      <!-- Distant hills -->
      <path d="M0,420 Q200,360 400,400 Q650,330 900,395 Q1150,340 1400,390 Q1500,400 1600,395 L1600,540 L0,540 Z" fill="#1a2546" opacity=".6"/>
      <path d="M0,470 Q300,430 600,450 Q900,410 1200,455 Q1400,430 1600,450 L1600,540 L0,540 Z" fill="#0d1730" opacity=".7"/>

      <!-- ====================== GROUND ====================== -->
      <rect y="540" width="1600" height="300" fill="url(#groundG)"/>

      <!-- Concrete pads -->
      <rect x="80"  y="430" width="340" height="220" fill="url(#padG)" opacity=".7"/>
      <rect x="700" y="450" width="380" height="200" fill="url(#padG)" opacity=".7"/>
      <rect x="1180" y="430" width="340" height="220" fill="url(#padG)" opacity=".7"/>

      <!-- Asphalt road -->
      <rect y="700" width="1600" height="56" fill="#1a1d2a"/>
      <g stroke="#ffce8a" stroke-width="3" stroke-dasharray="22 18">
        <line x1="0" y1="728" x2="1600" y2="728"/>
      </g>

      <!-- Perimeter fence -->
      <g stroke="#3a4a6e" stroke-width="1.5" opacity=".5">
        <line x1="0" y1="540" x2="1600" y2="540"/>
        <line x1="60" y1="520" x2="60" y2="700"/>
        <line x1="1540" y1="520" x2="1540" y2="700"/>
        <g stroke-dasharray="0 14" stroke-linecap="round" stroke-width="2.5">
          <line x1="60" y1="530" x2="1540" y2="530"/>
        </g>
      </g>

      <!-- ====================== STORAGE BULLET TANKS (clickable hot-zone) ====================== -->
      <g class="hot-zone" data-eq="bullet">
        <rect class="hover-ring" x="80" y="270" width="340" height="180" rx="8" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 5"/>

        <!-- Tank-A (rear) -->
        <g filter="url(#softShadow)">
          <ellipse cx="120" cy="320" rx="22" ry="46" fill="url(#tankRim)"/>
          <rect x="120" y="274" width="260" height="92" fill="url(#tankG)" stroke="#3a4258"/>
          <ellipse cx="380" cy="320" rx="22" ry="46" fill="url(#tankG)"/>
          <rect x="160" y="366" width="22" height="32" fill="#5a6577"/>
          <rect x="320" y="366" width="22" height="32" fill="#5a6577"/>
          <line x1="120" y1="298" x2="380" y2="298" stroke="#fff" opacity=".25"/>
          <line x1="120" y1="342" x2="380" y2="342" stroke="#fff" opacity=".25"/>
          <!-- PSV -->
          <rect x="243" y="260" width="14" height="20" fill="#a82530"/>
          <rect x="237" y="248" width="26" height="14" rx="3" fill="#3a4258"/>
          <circle cx="250" cy="245" r="3.5" fill="#ffae3d" class="beacon"/>
          <!-- Level gauge (wider for PPT visibility) -->
          <rect x="178" y="290" width="20" height="60" rx="2" fill="#0a1322" stroke="#3a4258"/>
          <rect id="ovTankA" x="180" y="320" width="16" height="30" fill="url(#liqG)"/>
          <!-- Tick marks on gauge -->
          <g stroke="#fff" stroke-width=".8" opacity=".4">
            <line x1="178" y1="305" x2="186" y2="305"/>
            <line x1="178" y1="320" x2="186" y2="320"/>
            <line x1="178" y1="335" x2="186" y2="335"/>
          </g>
          <text id="ovTankAPct" class="label-num" x="207" y="320" font-size="13" fill="#1a0f00" font-weight="700">50%</text>
          <text class="label-num" x="250" y="338" text-anchor="middle" fill="#1a0f00" font-weight="700">TANK-A</text>
        </g>

        <!-- Tank-B (front — this is the one being filled by the truck) -->
        <g filter="url(#softShadow)">
          <ellipse cx="120" cy="430" rx="24" ry="50" fill="url(#tankRim)"/>
          <rect x="120" y="380" width="280" height="100" fill="url(#tankG)" stroke="#3a4258"/>
          <ellipse cx="400" cy="430" rx="24" ry="50" fill="url(#tankG)"/>
          <rect x="170" y="480" width="24" height="34" fill="#5a6577"/>
          <rect x="340" y="480" width="24" height="34" fill="#5a6577"/>
          <line x1="120" y1="406" x2="400" y2="406" stroke="#fff" opacity=".25"/>
          <line x1="120" y1="454" x2="400" y2="454" stroke="#fff" opacity=".25"/>
          <rect x="253" y="366" width="14" height="20" fill="#a82530"/>
          <rect x="247" y="354" width="26" height="14" rx="3" fill="#3a4258"/>
          <circle cx="260" cy="351" r="3.5" fill="#ffae3d" class="beacon"/>
          <!-- Level gauge — Tank-B fills during unload phase (wider for PPT visibility) -->
          <rect x="188" y="396" width="22" height="68" rx="2" fill="#0a1322" stroke="#3a4258"/>
          <rect id="ovTankB" x="190" y="444" width="18" height="20" fill="url(#liqG)"/>
          <!-- Tick marks -->
          <g stroke="#fff" stroke-width=".8" opacity=".4">
            <line x1="188" y1="413" x2="198" y2="413"/>
            <line x1="188" y1="430" x2="198" y2="430"/>
            <line x1="188" y1="447" x2="198" y2="447"/>
          </g>
          <text id="ovTankBPct" class="label-num" x="220" y="430" font-size="13" fill="#1a0f00" font-weight="700">30%</text>
          <text class="label-num" x="260" y="445" text-anchor="middle" fill="#1a0f00" font-weight="700">TANK-B</text>
        </g>

        <!-- Yard label moved LEFT (x=170) + DOWN slightly so hose path doesn't block it -->
        <text class="label" x="170" y="540" text-anchor="middle">ลานถังเก็บ LPG</text>
        <text class="label-sm" x="170" y="560" text-anchor="middle">Storage Bullet Yard</text>
      </g>

      <!-- ====================== TANK TRUCK (cab on RIGHT, faces right = direction of motion) ====================== -->
      <g id="ovTruck" transform="translate(-300, 600)">
        <!-- Shadow -->
        <ellipse cx="180" cy="100" rx="180" ry="6" fill="#000" opacity=".4"/>
        <!-- Tanker body (LEFT side) -->
        <ellipse cx="14" cy="68" rx="14" ry="32" fill="url(#tankG)"/>
        <rect x="14" y="36" width="220" height="64" fill="url(#tankG)" stroke="#3a4258"/>
        <ellipse cx="234" cy="68" rx="14" ry="32" fill="url(#tankG)"/>
        <line x1="14" y1="52" x2="234" y2="52" stroke="#fff" opacity=".22"/>
        <line x1="14" y1="84" x2="234" y2="84" stroke="#fff" opacity=".22"/>
        <text x="124" y="74" text-anchor="middle" class="label-num" fill="#1a0f00" font-size="14">LPG TANKER</text>
        <!-- Tanker liquid level (drops during unload) -->
        <rect id="ovTruckLiquid" x="14" y="60" width="220" height="40" fill="url(#liqG)" opacity=".7"/>
        <!-- Cab (RIGHT side, facing right) -->
        <rect x="240" y="42" width="56" height="58" fill="#2d3e62" stroke="#0a1322"/>
        <!-- Roof line (slight overhang) -->
        <rect x="240" y="38" width="50" height="5" fill="#1a2a48"/>
        <!-- Windshield (FRONT-right of cab) -->
        <rect x="266" y="50" width="22" height="18" fill="#88c5ff" opacity=".85"/>
        <!-- Side window -->
        <rect x="248" y="52" width="14" height="14" fill="#88c5ff" opacity=".55"/>
        <!-- Front bumper -->
        <rect x="294" y="68" width="6" height="30" fill="#1a2a48"/>
        <!-- Headlight -->
        <ellipse cx="297" cy="74" rx="2.5" ry="4" fill="#ffe9a3"/>
        <!-- Grille -->
        <rect x="292" y="80" width="3" height="12" fill="#0a1322"/>
        <!-- Wheels (tanker has 4, cab has 2 — 6 total) -->
        <circle cx="40"  cy="100" r="9" fill="#1a1a1a"/><circle cx="40"  cy="100" r="3" fill="#6a7488"/>
        <circle cx="70"  cy="100" r="9" fill="#1a1a1a"/><circle cx="70"  cy="100" r="3" fill="#6a7488"/>
        <circle cx="180" cy="100" r="9" fill="#1a1a1a"/><circle cx="180" cy="100" r="3" fill="#6a7488"/>
        <circle cx="210" cy="100" r="9" fill="#1a1a1a"/><circle cx="210" cy="100" r="3" fill="#6a7488"/>
        <circle cx="255" cy="100" r="9" fill="#1a1a1a"/><circle cx="255" cy="100" r="3" fill="#6a7488"/>
        <circle cx="285" cy="100" r="9" fill="#1a1a1a"/><circle cx="285" cy="100" r="3" fill="#6a7488"/>
      </g>

      <!-- Grounding cable + earth indicator (driven by rAF). Drawn LATE so it sits over truck. -->
      <g id="ovGround" opacity="0">
        <!-- Cable glow halo (under) -->
        <path d="M 360 640 L 360 690 L 320 730" stroke="#3ddc84" stroke-width="9" fill="none" stroke-linecap="round" opacity=".35"/>
        <!-- Cable (over) -->
        <path d="M 360 640 L 360 690 L 320 730" stroke="#7df0a8" stroke-width="5" fill="none" stroke-linecap="round"/>
        <!-- Clamp on truck chassis -->
        <circle cx="360" cy="640" r="8" fill="#7df0a8" stroke="#1a4221" stroke-width="2"/>
        <circle cx="360" cy="640" r="3" fill="#1a4221"/>
        <!-- Ground rod -->
        <rect x="312" y="724" width="16" height="14" fill="#7df0a8" stroke="#1a4221" stroke-width="1.5"/>
        <line x1="320" y1="730" x2="320" y2="748" stroke="#1a4221" stroke-width="2"/>
        <!-- Thai label near grounding point (callout above the cable) -->
        <g transform="translate(370, 660)">
          <rect x="0" y="0" width="160" height="22" rx="4" fill="rgba(61,220,132,.95)" stroke="#1a4221" stroke-width="1.5"/>
          <text x="80" y="15" text-anchor="middle" font-size="13" font-weight="700" fill="#04210f" font-family="Sarabun,sans-serif">⚡ เชื่อมต่อสายกราวด์</text>
          <!-- Pointer arrow toward clamp -->
          <path d="M 0 12 L -10 -8" stroke="#3ddc84" stroke-width="2" fill="none"/>
        </g>
        <!-- Big readable badge in upper sky area near truck bay (clear of ESD, hose, truck) -->
        <g transform="translate(620, 180)">
          <rect x="0" y="0" width="240" height="40" rx="6" fill="#3ddc84" stroke="#1a4221" stroke-width="2"/>
          <circle cx="24" cy="20" r="14" fill="#fff"/>
          <text x="24" y="26" text-anchor="middle" font-size="18" font-weight="800" fill="#3ddc84">⚡</text>
          <text x="140" y="17" text-anchor="middle" font-size="14" font-weight="700" fill="#04210f" font-family="Sarabun,sans-serif">EARTH CONNECTED</text>
          <text x="140" y="33" text-anchor="middle" font-size="11" font-weight="600" fill="#04210f" font-family="Sarabun,sans-serif">Earthing R &lt; 10 Ω ✓</text>
        </g>
      </g>

      <!-- Hose + flow. Connects from TOP of tanker (manifold) up to Tank-B inlet. Truck parked at translate(140,600). -->
      <g id="ovHoseGroup" opacity="0">
        <!-- Coupling at truck-top manifold (top of tanker, when truck is at parked x=140) -->
        <rect x="252" y="628" width="24" height="14" rx="2" fill="#5a6577" stroke="#1a1d2a" stroke-width="1.5"/>
        <rect x="256" y="626" width="16" height="6" fill="#3a4258"/>
        <!-- Glow halo -->
        <path d="M 264 632 C 264 580, 290 510, 370 460" stroke="#5ac8fa" stroke-width="26" fill="none" stroke-linecap="round" opacity=".30"/>
        <!-- Outer hose (steel braided) -->
        <path d="M 264 632 C 264 580, 290 510, 370 460" stroke="#5a6577" stroke-width="18" fill="none" stroke-linecap="round"/>
        <!-- Inner hose -->
        <path d="M 264 632 C 264 580, 290 510, 370 460" stroke="#a8b3c8" stroke-width="13" fill="none" stroke-linecap="round"/>
        <!-- Animated flow indicator -->
        <path id="ovHoseFlow" d="M 264 632 C 264 580, 290 510, 370 460" stroke="#5ac8fa" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="18 14" class="flow"/>
        <!-- INLET label + coupling at Tank-B -->
        <rect x="362" y="453" width="24" height="14" rx="2" fill="#5a6577" stroke="#1a1d2a" stroke-width="1.5"/>
        <rect x="366" y="451" width="16" height="4" fill="#3a4258"/>
        <rect x="388" y="453" width="16" height="14" rx="1" fill="#a82530" stroke="#5a1015"/>
        <text x="396" y="464" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="Sarabun,sans-serif">IN</text>
        <!-- Flow direction arrow on hose -->
        <g transform="translate(290, 545) rotate(-40)">
          <polygon points="0,-10 14,0 0,10" fill="#5ac8fa" stroke="#1a4a78" stroke-width="1.5"/>
        </g>
      </g>

      <!-- ====================== PIPE NETWORK ====================== -->
      <!-- Tank-B → Pump suction pipe — enters volute at viewBox (640, 548) -->
      <path d="M 420 470 L 540 470 L 540 548 L 640 548" stroke="url(#pipeG)" stroke-width="13" fill="none" stroke-linecap="round"/>
      <path d="M 420 470 L 540 470 L 540 548 L 640 548" stroke="#5ac8fa" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="14 10" class="flow" opacity=".8"/>

      <!-- Pump discharge → Carousel overhead manifold — exits volute at viewBox (683, 498) -->
      <path d="M 683 498 L 683 470 L 800 470 L 800 380 L 840 380" stroke="url(#pipeG)" stroke-width="13" fill="none" stroke-linecap="round"/>
      <path d="M 683 498 L 683 470 L 800 470 L 800 380 L 840 380" stroke="#5ac8fa" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="14 10" class="flow" opacity=".8"/>

      <!-- Compressor vapor return pipe (to Tank-B top) — aligned with new inlet at viewBox (533, 320) -->
      <path d="M 533 320 L 533 285 L 380 285 L 380 320" stroke="url(#pipeG)" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 533 320 L 533 285 L 380 285 L 380 320" stroke="var(--vapor)" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 12" class="flow-vapor" opacity=".7"/>

      <!-- ====================== CENTRIFUGAL PUMP (realistic Corken/Blackmer-style) ======================
           Layout: Suction (left) → Volute casing with impeller cutaway → Coupling guard → Motor → Baseplate
           Suction inlet: viewBox (640, 548) — larger diameter (LPG centrifugal best-practice)
           Discharge outlet: viewBox (683, 498) — tangential off volute, going up to manifold
           Animations: impeller spins (6 backward-curved blades) + pressure gauge needle vibrates -->
      <g class="hot-zone" data-eq="pump" transform="translate(640, 490)">
        <rect class="hover-ring" x="-10" y="-10" width="120" height="135" rx="8" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 5"/>

        <g filter="url(#softShadow)">
          <!-- ════════ SKID BASEPLATE ════════ -->
          <rect x="0" y="100" width="100" height="12" rx="1" fill="#3a4258" stroke="#1a1d2a" stroke-width="1"/>
          <rect x="0" y="107" width="100" height="5" fill="#1a1d2a"/>
          <rect x="6" y="108" width="6" height="4" fill="#0a0a14"/>
          <rect x="88" y="108" width="6" height="4" fill="#0a0a14"/>

          <!-- ════════ SUCTION FLANGE + PIPE (left, large diameter) ════════ -->
          <rect x="-4" y="50" width="6" height="18" fill="#5a6577" stroke="#1a1d2a" stroke-width=".5"/>
          <rect x="-3" y="48" width="2" height="22" fill="#3a4258"/>
          <!-- Bolt heads on flange -->
          <circle cx="-1" cy="51" r=".8" fill="#0a0a14"/>
          <circle cx="-1" cy="67" r=".8" fill="#0a0a14"/>
          <!-- Suction pipe entering volute -->
          <rect x="2" y="52" width="12" height="14" fill="#7d8aa3" stroke="#1a1d2a" stroke-width=".5"/>

          <!-- ════════ VOLUTE CASING (snail/spiral shape) ════════ -->
          <!-- Outer volute body — asymmetric spiral -->
          <path d="M 14 52
                   Q 14 36, 28 30
                   Q 48 26, 56 42
                   Q 60 56, 56 66
                   Q 50 78, 38 80
                   Q 22 80, 14 70 Z"
                fill="#1a4a78" stroke="#0a1322" stroke-width="1.5"/>
          <!-- Volute "tongue" — where discharge starts -->
          <path d="M 38 28 Q 50 30, 56 42 L 50 46 Q 42 32, 38 28 Z"
                fill="#2a5fa0" stroke="#0a1322" stroke-width="1"/>
          <!-- Highlight (3D look) -->
          <path d="M 16 50 Q 18 38, 28 34" stroke="#5ac8fa" stroke-width="2" fill="none" opacity=".35"/>

          <!-- ════════ INNER CAVITY (cutaway showing impeller) ════════ -->
          <circle cx="32" cy="56" r="16" fill="#0a1322" stroke="#3a4258" stroke-width="1.2"/>
          <!-- Casing wear ring -->
          <circle cx="32" cy="56" r="14" fill="none" stroke="#5a6577" stroke-width=".5" opacity=".5"/>

          <!-- ════════ IMPELLER (6 backward-curved blades, spinning) ════════ -->
          <g transform="translate(32, 56)">
            <g style="transform-box:fill-box;transform-origin:center" class="spin-pump">
              <path d="M 0 -13 Q -4 -6 -1 -1 L 2 -1 Q 6 -6 3 -13 Z" fill="var(--accent)"/>
              <path d="M 0 -13 Q -4 -6 -1 -1 L 2 -1 Q 6 -6 3 -13 Z" fill="var(--accent)" transform="rotate(60)"/>
              <path d="M 0 -13 Q -4 -6 -1 -1 L 2 -1 Q 6 -6 3 -13 Z" fill="var(--accent)" transform="rotate(120)"/>
              <path d="M 0 -13 Q -4 -6 -1 -1 L 2 -1 Q 6 -6 3 -13 Z" fill="var(--accent)" transform="rotate(180)"/>
              <path d="M 0 -13 Q -4 -6 -1 -1 L 2 -1 Q 6 -6 3 -13 Z" fill="var(--accent)" transform="rotate(240)"/>
              <path d="M 0 -13 Q -4 -6 -1 -1 L 2 -1 Q 6 -6 3 -13 Z" fill="var(--accent)" transform="rotate(300)"/>
              <!-- Hub -->
              <circle r="4" fill="#1a0f00" stroke="#3a4258" stroke-width=".5"/>
              <circle r="1.5" fill="#5a6577"/>
            </g>
          </g>

          <!-- ════════ DISCHARGE PIPE (top — tangential off volute) ════════ -->
          <rect x="38" y="12" width="10" height="20" fill="#7d8aa3" stroke="#1a1d2a" stroke-width=".5"/>
          <rect x="34" y="8" width="18" height="5" rx="1" fill="#5a6577" stroke="#1a1d2a" stroke-width=".5"/>
          <!-- Flange bolts -->
          <circle cx="37" cy="10.5" r=".8" fill="#0a0a14"/>
          <circle cx="49" cy="10.5" r=".8" fill="#0a0a14"/>

          <!-- ════════ PRESSURE GAUGE (on discharge) ════════ -->
          <g transform="translate(62, 26)">
            <circle r="7" fill="#fff" stroke="#0a1322" stroke-width="1.2"/>
            <circle r="6" fill="#fff"/>
            <g stroke="#1a0f00" stroke-width=".4">
              <line x1="-4" y1="-2.5" x2="-4.5" y2="-3"/>
              <line x1="-2.5" y1="-4.5" x2="-3" y2="-5"/>
              <line x1="0" y1="-5.5" x2="0" y2="-6"/>
              <line x1="2.5" y1="-4.5" x2="3" y2="-5"/>
              <line x1="4" y1="-2.5" x2="4.5" y2="-3"/>
            </g>
            <circle r=".9" fill="#1a0f00"/>
            <line x1="0" y1="0" x2="3.5" y2="-3.5" stroke="#a82530" stroke-width="1.2" stroke-linecap="round">
              <animate attributeName="x2" values="3.5;3.2;3.7;3.5" dur=".4s" repeatCount="indefinite"/>
              <animate attributeName="y2" values="-3.5;-3.8;-3.2;-3.5" dur=".4s" repeatCount="indefinite"/>
            </line>
          </g>

          <!-- ════════ COUPLING GUARD (between volute and motor) ════════ -->
          <rect x="56" y="50" width="14" height="24" rx="2" fill="#252e44" stroke="#3a4a6e" stroke-width="1"/>
          <!-- Yellow safety stripe -->
          <rect x="56" y="50" width="14" height="3" fill="#ffce39"/>
          <!-- Coupling visible through guard slots -->
          <g stroke="#3a4a6e" stroke-width=".4" opacity=".4">
            <line x1="56" y1="58" x2="70" y2="58"/>
            <line x1="56" y1="64" x2="70" y2="64"/>
            <line x1="56" y1="70" x2="70" y2="70"/>
            <line x1="60" y1="53" x2="60" y2="74"/>
            <line x1="64" y1="53" x2="64" y2="74"/>
            <line x1="68" y1="53" x2="68" y2="74"/>
          </g>

          <!-- ════════ ELECTRIC MOTOR (right) ════════ -->
          <rect x="70" y="46" width="28" height="32" rx="3" fill="#2a5fa0" stroke="#0a1322" stroke-width="1"/>
          <!-- Cooling fins -->
          <g stroke="#0a1322" stroke-width=".6" opacity=".75">
            <line x1="72" y1="50" x2="72" y2="74"/>
            <line x1="75" y1="50" x2="75" y2="74"/>
            <line x1="78" y1="50" x2="78" y2="74"/>
            <line x1="81" y1="50" x2="81" y2="74"/>
            <line x1="84" y1="50" x2="84" y2="74"/>
            <line x1="87" y1="50" x2="87" y2="74"/>
            <line x1="90" y1="50" x2="90" y2="74"/>
            <line x1="93" y1="50" x2="93" y2="74"/>
            <line x1="96" y1="50" x2="96" y2="74"/>
          </g>
          <!-- Motor nameplate -->
          <rect x="74" y="58" width="22" height="6" rx="1" fill="#0a1322"/>
          <text x="85" y="63" text-anchor="middle" font-size="5" fill="var(--liquid)" font-family="Consolas,monospace">5.5 kW</text>
          <!-- Motor end cap (right) -->
          <rect x="98" y="50" width="3" height="24" fill="#1a4a78"/>
          <!-- Fan cover at end -->
          <circle cx="100" cy="62" r="3" fill="#0a1322"/>
          <g transform="translate(100,62)" class="spin-fan">
            <line x1="-2" y1="0" x2="2" y2="0" stroke="#5a6577" stroke-width=".6"/>
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#5a6577" stroke-width=".6"/>
          </g>
          <!-- Motor mount feet -->
          <rect x="72" y="76" width="4" height="4" fill="#0a0a14"/>
          <rect x="94" y="76" width="4" height="4" fill="#0a0a14"/>

          <!-- ════════ TITLE BAR ════════ -->
          <rect x="6" y="2" width="42" height="13" rx="2" fill="#0a1322" stroke="#3a4a6e" stroke-width=".5"/>
          <text x="27" y="11" text-anchor="middle" class="label-num" font-size="10" fill="var(--liquid)">PUMP-01</text>

          <!-- RUN indicator -->
          <circle cx="78" cy="86" r="2.5" fill="var(--good)" class="pulse"/>
          <text x="83" y="89" font-size="6.5" font-weight="700" fill="var(--good)" font-family="Consolas,monospace">RUN</text>
        </g>

        <!-- Label moved ABOVE the pump body (was below — got covered by carousel) -->
        <text class="label" x="50" y="-22" text-anchor="middle" font-size="16">ปั๊ม LPG</text>
        <text class="label-sm" x="50" y="-8" text-anchor="middle" font-size="12" opacity=".8">Centrifugal Pump</text>
      </g>

      <!-- ====================== VAPOR COMPRESSOR (realistic Corken-style reciprocating) ======================
           Layout (left → right): Electric Motor (with cooling fins) → Belt Drive (guard + 2 pulleys + V-belt)
           → Compressor Cylinder (vertical, with finned head + pressure gauge) → Skid base
           Animations: 2 pulleys spinning at different rates, gauge needle pulsates (vibration of running unit) -->
      <g class="hot-zone" data-eq="compressor" transform="translate(440, 320)">
        <rect class="hover-ring" x="-10" y="-10" width="140" height="120" rx="8" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 5"/>

        <g filter="url(#softShadow)">
          <!-- ════════ SKID BASE ════════ -->
          <rect x="0" y="80" width="120" height="14" rx="1" fill="#3a4258" stroke="#1a1d2a" stroke-width="1.2"/>
          <rect x="0" y="87" width="120" height="7" fill="#1a1d2a"/>
          <!-- Mounting feet bolted to ground -->
          <rect x="6" y="91" width="7" height="5" fill="#0a0a14"/>
          <rect x="50" y="91" width="7" height="5" fill="#0a0a14"/>
          <rect x="107" y="91" width="7" height="5" fill="#0a0a14"/>

          <!-- ════════ ELECTRIC MOTOR (left) ════════ -->
          <!-- End cap (left, fan housing) -->
          <rect x="0" y="42" width="3" height="38" fill="#1a4a78" stroke="#0a1322" stroke-width=".5"/>
          <!-- Motor body -->
          <rect x="3" y="40" width="32" height="40" rx="3" fill="#2a5fa0" stroke="#0a1322" stroke-width="1"/>
          <!-- Cooling fins (vertical strips along motor body) -->
          <g stroke="#0a1322" stroke-width=".7" opacity=".7">
            <line x1="6"  y1="44" x2="6"  y2="76"/>
            <line x1="9"  y1="44" x2="9"  y2="76"/>
            <line x1="12" y1="44" x2="12" y2="76"/>
            <line x1="15" y1="44" x2="15" y2="76"/>
            <line x1="18" y1="44" x2="18" y2="76"/>
            <line x1="21" y1="44" x2="21" y2="76"/>
            <line x1="24" y1="44" x2="24" y2="76"/>
            <line x1="27" y1="44" x2="27" y2="76"/>
            <line x1="30" y1="44" x2="30" y2="76"/>
            <line x1="33" y1="44" x2="33" y2="76"/>
          </g>
          <!-- Motor nameplate -->
          <rect x="6" y="56" width="26" height="8" rx="1" fill="#0a1322" stroke="#3a4258" stroke-width=".4"/>
          <text x="19" y="62" text-anchor="middle" font-size="6" fill="var(--liquid)" font-family="Consolas,monospace">7.5 kW</text>
          <text x="19" y="68" text-anchor="middle" font-size="4.5" fill="var(--liquid)" opacity=".7" font-family="Consolas,monospace">1450 rpm</text>
          <!-- Motor mount feet -->
          <rect x="4" y="78" width="5" height="4" fill="#0a0a14"/>
          <rect x="29" y="78" width="5" height="4" fill="#0a0a14"/>
          <!-- Shaft exiting motor -->
          <rect x="35" y="59" width="6" height="4" fill="#5a6577"/>

          <!-- ════════ BELT DRIVE (middle) ════════ -->
          <!-- Belt guard (mesh enclosure) -->
          <rect x="38" y="42" width="32" height="38" rx="3" fill="#252e44" stroke="#3a4a6e" stroke-width="1.2"/>
          <!-- Guard mesh pattern -->
          <g stroke="#3a4a6e" stroke-width=".4" opacity=".5">
            <line x1="38" y1="50" x2="70" y2="50"/>
            <line x1="38" y1="58" x2="70" y2="58"/>
            <line x1="38" y1="66" x2="70" y2="66"/>
            <line x1="38" y1="74" x2="70" y2="74"/>
            <line x1="44" y1="42" x2="44" y2="80"/>
            <line x1="50" y1="42" x2="50" y2="80"/>
            <line x1="56" y1="42" x2="56" y2="80"/>
            <line x1="62" y1="42" x2="62" y2="80"/>
            <line x1="68" y1="42" x2="68" y2="80"/>
          </g>
          <!-- Yellow safety stripe on guard -->
          <rect x="38" y="42" width="32" height="3" fill="#ffce39" stroke="#1a0f00" stroke-width=".4"/>

          <!-- Small motor pulley (left, fast spinning) -->
          <circle cx="42" cy="61" r="5" fill="#0a1322" stroke="#3a4258" stroke-width=".6"/>
          <g transform="translate(42,61)">
            <g style="transform-box:fill-box;transform-origin:center" class="spin-comp">
              <circle r="4" fill="#3a4258"/>
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#a8b3c8" stroke-width=".8"/>
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#a8b3c8" stroke-width=".8"/>
              <circle r="1" fill="#1a0f00"/>
            </g>
          </g>

          <!-- Large compressor pulley (right, slower) -->
          <circle cx="62" cy="61" r="9" fill="#0a1322" stroke="#3a4258" stroke-width=".8"/>
          <g transform="translate(62,61)">
            <g style="transform-box:fill-box;transform-origin:center" class="spin-fan">
              <circle r="7" fill="#3a4258"/>
              <line x1="-7" y1="0" x2="7" y2="0" stroke="#a8b3c8" stroke-width="1.2"/>
              <line x1="0" y1="-7" x2="0" y2="7" stroke="#a8b3c8" stroke-width="1.2"/>
              <line x1="-5" y1="-5" x2="5" y2="5" stroke="#a8b3c8" stroke-width=".8" opacity=".6"/>
              <line x1="-5" y1="5"  x2="5" y2="-5" stroke="#a8b3c8" stroke-width=".8" opacity=".6"/>
              <circle r="1.6" fill="#1a0f00"/>
            </g>
          </g>

          <!-- V-belt connecting pulleys (top + bottom strands) -->
          <path d="M 42 56 L 62 52" stroke="#0a0a14" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          <path d="M 42 66 L 62 70" stroke="#0a0a14" stroke-width="2.2" fill="none" stroke-linecap="round"/>

          <!-- ════════ COMPRESSOR CYLINDER (right, vertical with finned head) ════════ -->
          <!-- Cylinder body -->
          <rect x="76" y="30" width="32" height="50" rx="3" fill="#1a4a78" stroke="#0a1322" stroke-width="1.2"/>
          <!-- Cooling fins (horizontal across cylinder) -->
          <g stroke="#0a1322" stroke-width=".7">
            <line x1="74" y1="34" x2="110" y2="34"/>
            <line x1="74" y1="38" x2="110" y2="38"/>
            <line x1="74" y1="42" x2="110" y2="42"/>
            <line x1="74" y1="46" x2="110" y2="46"/>
            <line x1="74" y1="50" x2="110" y2="50"/>
            <line x1="74" y1="54" x2="110" y2="54"/>
            <line x1="74" y1="58" x2="110" y2="58"/>
            <line x1="74" y1="62" x2="110" y2="62"/>
            <line x1="74" y1="66" x2="110" y2="66"/>
            <line x1="74" y1="70" x2="110" y2="70"/>
            <line x1="74" y1="74" x2="110" y2="74"/>
          </g>
          <!-- Highlight strip (3D appearance) -->
          <rect x="78" y="30" width="3" height="48" fill="#5ac8fa" opacity=".25"/>
          <!-- Cylinder head (top, with bolt pattern) -->
          <rect x="74" y="22" width="36" height="10" rx="2" fill="#252e44" stroke="#0a1322" stroke-width="1"/>
          <!-- Bolt heads on cylinder head -->
          <g fill="#0a0a14">
            <circle cx="78" cy="27" r="1.2"/>
            <circle cx="86" cy="27" r="1.2"/>
            <circle cx="98" cy="27" r="1.2"/>
            <circle cx="106" cy="27" r="1.2"/>
          </g>
          <!-- Valve cover/boss on top -->
          <rect x="86" y="17" width="14" height="6" rx="1" fill="#3a4258" stroke="#0a1322" stroke-width=".5"/>

          <!-- ════════ PRESSURE GAUGE (on cylinder head, vibrating) ════════ -->
          <g transform="translate(93, 13)">
            <circle r="6" fill="#fff" stroke="#0a1322" stroke-width="1.2"/>
            <circle r="5" fill="#fff"/>
            <!-- Tick marks -->
            <g stroke="#1a0f00" stroke-width=".4">
              <line x1="-3.5" y1="-2" x2="-4" y2="-2.5"/>
              <line x1="-2" y1="-4" x2="-2.5" y2="-4.5"/>
              <line x1="0" y1="-4.5" x2="0" y2="-5"/>
              <line x1="2" y1="-4" x2="2.5" y2="-4.5"/>
              <line x1="3.5" y1="-2" x2="4" y2="-2.5"/>
            </g>
            <!-- Center pivot -->
            <circle r=".8" fill="#1a0f00"/>
            <!-- Needle — animated to vibrate (pressure pulsations from running compressor) -->
            <line x1="0" y1="0" x2="3" y2="-3" stroke="#a82530" stroke-width="1.2" stroke-linecap="round">
              <animate attributeName="x2" values="3;2.5;3.2;3;2.8;3;3.3;3" dur="0.4s" repeatCount="indefinite"/>
              <animate attributeName="y2" values="-3;-3.4;-2.8;-3;-3.2;-3;-2.8;-3" dur="0.4s" repeatCount="indefinite"/>
            </line>
          </g>

          <!-- ════════ INLET PIPE (top — vapor return from storage tank) ════════ -->
          <rect x="89" y="0" width="8" height="22" fill="#7d8aa3" stroke="#1a1d2a" stroke-width=".7"/>
          <rect x="85" y="0" width="16" height="4" rx="1" fill="#5a6577" stroke="#1a1d2a" stroke-width=".5"/>
          <!-- "IN" arrow indicator -->
          <polygon points="93,9 90,14 96,14" fill="var(--vapor)" opacity=".8"/>

          <!-- ════════ OUTLET PIPE (bottom — compressed vapor going to tanker) ════════ -->
          <rect x="76" y="80" width="36" height="4" fill="#7d8aa3" stroke="#1a1d2a" stroke-width=".5"/>
          <rect x="108" y="78" width="4" height="14" fill="#7d8aa3" stroke="#1a1d2a" stroke-width=".5"/>

          <!-- ════════ TITLE BAR + STATUS ════════ -->
          <rect x="8" y="4" width="52" height="13" rx="2" fill="#0a1322" stroke="#3a4a6e" stroke-width=".6"/>
          <text x="34" y="13" text-anchor="middle" class="label-num" font-size="10" fill="var(--liquid)">COMP-01</text>

          <!-- Running indicator -->
          <circle cx="48" cy="84" r="2.5" fill="var(--good)" class="pulse"/>
          <text x="55" y="86" font-size="6.5" font-weight="700" fill="var(--good)" font-family="Consolas,monospace">RUN</text>
        </g>

        <text class="label-sm" x="60" y="110" text-anchor="middle">Vapor Compressor</text>
        <text class="label-sm" x="60" y="125" text-anchor="middle" font-size="11" opacity=".7">Reciprocating Piston</text>
      </g>

      <!-- ====================== CAROUSEL FILLING MACHINE (เน้นเป็นจุดเด่นกลางจอ) ====================== -->
      <!-- Detailed 8-station LPG filling carousel — modeled on real industrial design:
           floor pad → safety rail → rotating disc → 8 stations (post + display + arm + cylinder)
           → center hub → vertical supply column → overhead gas manifold -->
      <g class="hot-zone" data-eq="carousel" transform="translate(840, 520)">
        <rect class="hover-ring" x="-130" y="-180" width="260" height="320" rx="10" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="6 5"/>

        <!-- Concrete floor pad (ellipse — slight 3D tilt) -->
        <ellipse cx="0" cy="118" rx="125" ry="22" fill="#000" opacity=".55"/>
        <ellipse cx="0" cy="115" rx="120" ry="20" fill="#1a1d2a"/>
        <ellipse cx="0" cy="112" rx="120" ry="20" fill="#3a4258"/>

        <!-- Yellow safety rail (warning stripes around perimeter) -->
        <ellipse cx="0" cy="108" rx="115" ry="18" fill="none" stroke="#ffce39" stroke-width="3"/>
        <ellipse cx="0" cy="108" rx="115" ry="18" fill="none" stroke="#1a0f00" stroke-width="3" stroke-dasharray="10 6"/>

        <!-- Carousel turntable disc (rotating base) -->
        <ellipse cx="0" cy="105" rx="108" ry="16" fill="#0a3a66"/>
        <ellipse cx="0" cy="100" rx="108" ry="16" fill="#1a6ca8"/>
        <ellipse cx="0" cy="95"  rx="108" ry="16" fill="#2a8fc8"/>

        <!-- Top surface of disc (subtle directional indicator showing rotation) -->
        <g transform="translate(0,95)">
          <ellipse cx="0" cy="0" rx="100" ry="14" fill="#3aa0d8"/>
          <g stroke="#0a3a66" stroke-width="1.5" opacity=".35" fill="none">
            <ellipse cx="0" cy="0" rx="82" ry="11"/>
            <ellipse cx="0" cy="0" rx="60" ry="8"/>
            <ellipse cx="0" cy="0" rx="36" ry="5"/>
          </g>
        </g>

        <!-- ============================================================
             HORIZONTAL ROTATION SYSTEM
             Stations orbit on an ELLIPSE (tilted-top-down perspective).
             - All stations stay UPRIGHT (post on top, cylinder below).
             - Position computed in JS rAF: (a·cos θ, b·sin θ + 95)
             - Depth scaling: back stations smaller, front stations larger
             - Z-order: stations split into BACK group (drawn before column)
               and FRONT group (drawn after column) for proper depth occlusion
        ============================================================ -->

        <!-- BACK STATIONS (rendered behind central column) -->
        <g id="ovStBack"></g>

        <!-- CENTER COLUMN (between back and front stations) -->
        <rect x="-7" y="-130" width="14" height="220" fill="#0a3a66" stroke="#1a1d2a" stroke-width="1.5"/>
        <rect x="-5" y="-130" width="10" height="220" fill="#1a6ca8"/>
        <line x1="0" y1="-130" x2="0" y2="90" stroke="#5ac8fa" stroke-width="4" stroke-dasharray="10 8" class="flow-slow" opacity=".7"/>

        <!-- CENTER HUB (motor + slip ring) -->
        <ellipse cx="0" cy="90" rx="26" ry="9" fill="#1a1d2a"/>
        <ellipse cx="0" cy="86" rx="24" ry="9" fill="#3a4258"/>
        <ellipse cx="0" cy="83" rx="24" ry="9" fill="#5a6577"/>
        <circle cx="0" cy="83" r="6" fill="var(--accent)" class="pulse"/>

        <!-- FRONT STATIONS (rendered in front of central column) -->
        <g id="ovStFront">
          <!-- All 6 stations initially placed here; JS moves them to Back/Front by depth.
               Each station drawn UPRIGHT with anchor at platform-bottom-center (0, 0).
               Reduced from 8 → 6 for visual clarity (real carousels come in 6/8/12-head variants). -->
          ${[1,2,3,4,5,6].map(i => `
            <g id="ovSt${i}" data-idx="${i}">
              <!-- Base platform -->
              <rect x="-22" y="-2" width="44" height="10" rx="2" fill="#0a3a66" stroke="#1a1d2a" stroke-width="1.4"/>
              <rect x="-20" y="-1" width="40" height="3" fill="#1a6ca8"/>
              <ellipse cx="0" cy="8" rx="22" ry="3" fill="#000" opacity=".4"/>
              <!-- Side guards (vertical bars) -->
              <rect x="-15" y="-26" width="3" height="26" fill="#a8b3c8" stroke="#1a1d2a" stroke-width=".5"/>
              <rect x="12"  y="-26" width="3" height="26" fill="#a8b3c8" stroke="#1a1d2a" stroke-width=".5"/>
              <!-- LPG Cylinder (upright, red) -->
              <rect x="-10" y="-30" width="20" height="30" rx="2" fill="url(#redCyl)" stroke="#3a0d10" stroke-width="1.2"/>
              <rect x="-10" y="-26" width="20" height="2" fill="#1a0508" opacity=".6"/>
              <rect x="-10" y="-6"  width="20" height="2" fill="#1a0508" opacity=".6"/>
              <rect x="-7"  y="-22" width="14" height="6" fill="#fff" opacity=".18"/>
              <!-- Cylinder valve on top -->
              <rect x="-3" y="-34" width="6" height="5" rx="1" fill="#7d8aa3" stroke="#3a4258" stroke-width=".5"/>
              <!-- Tall filling POST (load-cell column, behind cylinder) -->
              <rect x="14" y="-52" width="10" height="52" fill="#0a3a66" stroke="#1a1d2a" stroke-width=".8"/>
              <rect x="15" y="-52" width="8"  height="52" fill="#1a6ca8"/>
              <rect x="14" y="-52" width="10" height="3" fill="#3a4258"/>
              <!-- Touch screen on post -->
              <rect x="4" y="-65" width="22" height="14" rx="2" fill="#252e44" stroke="#1a1d2a" stroke-width=".8"/>
              <rect x="6" y="-63" width="18" height="10" fill="#0a1322"/>
              <rect x="6" y="-63" width="18" height="10" fill="#5ac8fa" opacity=".55"/>
              <text x="15" y="-56" text-anchor="middle" font-size="5.5" font-weight="700" fill="#0a1322" font-family="Consolas,monospace">15.0kg</text>
              <!-- Pneumatic filling arm from post over to cylinder valve -->
              <line x1="15" y1="-30" x2="3" y2="-34" stroke="#7d8aa3" stroke-width="3.2" stroke-linecap="round"/>
              <rect x="-1" y="-37" width="6" height="6" fill="#3a4258" stroke="#1a1d2a" stroke-width=".5"/>
              <!-- Station number badge -->
              <circle cx="-19" cy="-44" r="6" fill="var(--accent)" stroke="#1a0f00" stroke-width=".5"/>
              <text x="-19" y="-41" text-anchor="middle" font-size="7" font-weight="700" fill="#1a0f00" font-family="Consolas,monospace">${i}</text>
            </g>
          `).join('')}
        </g>

        <!-- OVERHEAD MANIFOLD (gas supply header above carousel) -->
        <g transform="translate(0, -150)">
          <!-- Vertical supply pipe coming from above (off-canvas) -->
          <rect x="-5" y="-30" width="10" height="34" fill="#7d8aa3" stroke="#1a1d2a" stroke-width="1"/>
          <!-- Horizontal header drum -->
          <ellipse cx="-60" cy="8" rx="6" ry="8" fill="#5a6577"/>
          <ellipse cx="60"  cy="8" rx="6" ry="8" fill="#5a6577"/>
          <rect x="-60" y="0" width="120" height="16" rx="3" fill="#7d8aa3" stroke="#1a1d2a" stroke-width="1.5"/>
          <rect x="-60" y="0" width="120" height="4" fill="#a8b3c8"/>
          <text x="0" y="11" text-anchor="middle" font-size="8" font-weight="700" fill="#1a0f00" font-family="Sarabun,sans-serif">GAS SUPPLY HEADER • 6-WAY</text>
          <!-- 6 small valves visible on header (one per filling station) -->
          ${[-45,-27,-9,9,27,45].map(x => `
            <rect x="${x-2}" y="14" width="4" height="6" fill="#a82530"/>
            <circle cx="${x}" cy="22" r="2" fill="#ffae3d" class="pulse"/>
          `).join('')}
          <!-- Valve to center column -->
          <rect x="-3" y="20" width="6" height="14" fill="#a82530"/>
        </g>

        <!-- LABEL (carousel title — prominent, with accent color) -->
        <text class="label" x="0" y="155" text-anchor="middle" fill="var(--accent)" font-size="20">เครื่องบรรจุก๊าซแบบหมุนวน</text>
        <text class="label-sm" x="0" y="178" text-anchor="middle">Filling Carousel • 6 หัวบรรจุ • 600–1500 ถัง/ชั่วโมง</text>
      </g>

      <!-- ====================== CONVEYOR (LEFT-TO-RIGHT) ====================== -->
      <g transform="translate(930,605)">
        <rect x="0" y="0" width="180" height="22" rx="3" fill="#252e44" stroke="#3a4a6e"/>
        <rect x="0" y="0" width="180" height="6" fill="#16223a"/>
        <g fill="#5a6577">
          ${[12,32,52,72,92,112,132,152,172].map(x => `<circle cx="${x}" cy="11" r="2"/>`).join('')}
        </g>
        <!-- Cylinders moving along conveyor (animateMotion for smoothness) -->
        <g>
          <use href="#cyl" width="20" height="34" y="-20">
            <animate attributeName="x" from="-30" to="200" dur="6s" repeatCount="indefinite"/>
          </use>
          <use href="#cyl" width="20" height="34" y="-20">
            <animate attributeName="x" from="-30" to="200" dur="6s" begin="-2s" repeatCount="indefinite"/>
          </use>
          <use href="#cyl" width="20" height="34" y="-20">
            <animate attributeName="x" from="-30" to="200" dur="6s" begin="-4s" repeatCount="indefinite"/>
          </use>
        </g>
      </g>

      <!-- ====================== LEAK DETECTION BOOTH (realistic enclosure) ======================
           Cylinders pass through this booth after filling. Multiple sensor probes detect gas leakage
           at: (1) O-ring at valve neck, (2) valve seat, (3) cylinder body.
           Vent hood on top exhausts any leaked gas safely. -->
      <g class="hot-zone" data-eq="leak" transform="translate(1005, 478)">
        <rect class="hover-ring" x="-10" y="-22" width="140" height="135" rx="8" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 5"/>

        <g filter="url(#softShadow)">
          <!-- ════════ VENT HOOD (top — exhausts any leaked gas) ════════ -->
          <path d="M 30 -8 L 25 -16 L 95 -16 L 90 -8 Z" fill="#3a4258" stroke="#0a1322" stroke-width="1"/>
          <rect x="56" y="-32" width="8" height="16" fill="#7d8aa3" stroke="#1a1d2a" stroke-width=".6"/>
          <!-- Exhaust vapor puffs going up -->
          <circle cx="60" cy="-35" r="2.5" fill="#a8b3c8" opacity=".5">
            <animate attributeName="cy" values="-35;-50" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".55;0" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="r" values="2.5;4" dur="1.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="60" cy="-35" r="2" fill="#a8b3c8" opacity=".5">
            <animate attributeName="cy" values="-35;-48" dur="1.8s" begin="-.6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".55;0" dur="1.8s" begin="-.6s" repeatCount="indefinite"/>
          </circle>
          <circle cx="60" cy="-35" r="2" fill="#a8b3c8" opacity=".5">
            <animate attributeName="cy" values="-35;-46" dur="1.8s" begin="-1.2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".55;0" dur="1.8s" begin="-1.2s" repeatCount="indefinite"/>
          </circle>

          <!-- ════════ MAIN BOOTH ENCLOSURE ════════ -->
          <rect x="0" y="-8" width="120" height="100" rx="3" fill="#252e44" stroke="#3a4a6e" stroke-width="1.5"/>

          <!-- ════════ TOP DISPLAY PANEL ════════ -->
          <rect x="0" y="-8" width="120" height="22" fill="#0a1322" stroke="#3a4258" stroke-width="1"/>
          <text x="60" y="5" text-anchor="middle" class="label-num" font-size="11" fill="var(--liquid)">LEAK DETECTOR • LDX-2000</text>

          <!-- ════════ PPM READOUT (digital display) ════════ -->
          <rect x="6" y="18" width="50" height="22" rx="2" fill="#0a1322" stroke="#3a4258" stroke-width="1"/>
          <text x="31" y="27" text-anchor="middle" font-size="6" fill="#5a6577" font-family="Consolas,monospace">METHANE PPM</text>
          <text x="31" y="38" text-anchor="middle" font-size="13" font-weight="700" fill="var(--good)" font-family="Consolas,monospace">0.0</text>

          <!-- ════════ STATUS INDICATOR ════════ -->
          <rect x="60" y="18" width="54" height="22" rx="2" fill="#0a1322" stroke="#3a4258" stroke-width="1"/>
          <circle cx="72" cy="29" r="4" fill="var(--good)" class="pulse"/>
          <text x="93" y="33" text-anchor="middle" font-size="10" font-weight="700" fill="var(--good)" font-family="Consolas,monospace">PASS</text>

          <!-- ════════ INSPECTION WINDOW (showing cylinder inside booth) ════════ -->
          <rect x="20" y="44" width="80" height="40" rx="2" fill="#0a1322" stroke="#3a4258" stroke-width="1.5"/>
          <!-- Glass reflection -->
          <rect x="22" y="46" width="76" height="3" fill="#5ac8fa" opacity=".15"/>

          <!-- ════════ CYLINDER UNDER TEST (visible through window) ════════ -->
          <rect x="55" y="48" width="14" height="34" rx="1.5" fill="url(#redCyl)" stroke="#3a0d10" stroke-width="1"/>
          <rect x="59" y="44" width="6" height="5" rx="1" fill="#7d8aa3" stroke="#3a4258" stroke-width=".5"/>
          <rect x="55" y="52" width="14" height="1.5" fill="#1a0508" opacity=".6"/>
          <rect x="55" y="78" width="14" height="1.5" fill="#1a0508" opacity=".6"/>
          <rect x="57" y="56" width="10" height="3" fill="#fff" opacity=".18"/>

          <!-- ════════ SENSOR PROBE 1: O-ring at valve neck (top, pointing down) ════════ -->
          <rect x="60" y="40" width="4" height="6" fill="#5a6577" stroke="#1a1d2a" stroke-width=".5"/>
          <line x1="62" y1="46" x2="62" y2="48" stroke="var(--good)" stroke-width="2">
            <animate attributeName="opacity" values=".3;1;.3" dur=".8s" repeatCount="indefinite"/>
          </line>
          <text x="62" y="38" text-anchor="middle" font-size="5.5" fill="var(--good)" font-family="Consolas,monospace">S1</text>

          <!-- ════════ SENSOR PROBE 2: valve seat (right side) ════════ -->
          <rect x="76" y="52" width="6" height="4" fill="#5a6577" stroke="#1a1d2a" stroke-width=".5"/>
          <line x1="76" y1="54" x2="70" y2="54" stroke="var(--good)" stroke-width="2">
            <animate attributeName="opacity" values=".3;1;.3" dur=".8s" begin="-.3s" repeatCount="indefinite"/>
          </line>
          <text x="86" y="56" text-anchor="middle" font-size="5.5" fill="var(--good)" font-family="Consolas,monospace">S2</text>

          <!-- ════════ SENSOR PROBE 3: cylinder body weld seam (left side) ════════ -->
          <rect x="42" y="64" width="6" height="4" fill="#5a6577" stroke="#1a1d2a" stroke-width=".5"/>
          <line x1="48" y1="66" x2="54" y2="66" stroke="var(--good)" stroke-width="2">
            <animate attributeName="opacity" values=".3;1;.3" dur=".8s" begin="-.5s" repeatCount="indefinite"/>
          </line>
          <text x="38" y="68" text-anchor="middle" font-size="5.5" fill="var(--good)" font-family="Consolas,monospace">S3</text>

          <!-- ════════ WARNING BEACON (on top corner — green when clear, red if leak) ════════ -->
          <rect x="108" y="-22" width="6" height="14" fill="#5a6577"/>
          <circle cx="111" cy="-26" r="5" fill="#a82530" opacity=".3"/>
          <circle cx="111" cy="-26" r="3.5" fill="var(--good)" class="pulse"/>

          <!-- ════════ CONVEYOR EXIT (right side) ════════ -->
          <rect x="118" y="84" width="14" height="8" rx="1" fill="#1a1d2a"/>
        </g>

        <!-- Label moved ABOVE the booth (was below — got covered by carousel) -->
        <text class="label" x="60" y="-58" text-anchor="middle" font-size="16">ตู้ตรวจรอยรั่ว</text>
        <text class="label-sm" x="60" y="-44" text-anchor="middle" font-size="12" opacity=".8">Leak Detector</text>
      </g>

      <!-- ====================== WAREHOUSE ====================== -->
      <g class="hot-zone" data-eq="warehouse" transform="translate(1200,380)">
        <rect class="hover-ring" x="-10" y="-10" width="320" height="290" rx="8" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 5"/>
        <g filter="url(#softShadow)">
          <rect x="0" y="60" width="300" height="200" fill="#3a4a6e" stroke="#0a1322"/>
          <polygon points="0,60 150,10 300,60" fill="#252e44"/>
          <line x1="150" y1="10" x2="150" y2="260" stroke="#0a1322" stroke-width="2"/>
          <rect x="130" y="200" width="40" height="60" fill="#16223a" stroke="#0a1322"/>
          <g fill="#1a1d2a">
            <rect x="20" y="80" width="40" height="6" rx="2"/>
            <rect x="20" y="92" width="40" height="6" rx="2"/>
            <rect x="20" y="104" width="40" height="6" rx="2"/>
            <rect x="240" y="80" width="40" height="6" rx="2"/>
            <rect x="240" y="92" width="40" height="6" rx="2"/>
            <rect x="240" y="104" width="40" height="6" rx="2"/>
          </g>
          <!-- Stacked cylinders inside -->
          <g transform="translate(70,160)">
            ${[0,26,52,78,104,130].map((x,i) => `<use href="#cyl" x="${x}" y="0" width="22" height="36"/>`).join('')}
            ${[13,39,65,91,117].map((x,i) => `<use href="#cyl" x="${x}" y="40" width="22" height="36"/>`).join('')}
          </g>
          <rect x="100" y="36" width="100" height="20" rx="3" fill="var(--accent)"/>
          <text x="150" y="50" text-anchor="middle" font-weight="700" fill="#1a0f00" font-size="14" font-family="Sarabun, sans-serif">WAREHOUSE</text>
        </g>
        <text class="label-sm" x="150" y="280" text-anchor="middle">โกดังถังบรรจุแล้ว</text>
      </g>

      <!-- ====================== WATER DELUGE RING ====================== -->
      <g id="ovDeluge">
        <g stroke="#5ac8fa" stroke-width="2" fill="none" opacity=".4">
          <line x1="100" y1="270" x2="400" y2="270" stroke-dasharray="6 4"/>
          <line x1="100" y1="425" x2="420" y2="425" stroke-dasharray="6 4"/>
        </g>
        <g fill="#3a8fc8">
          ${[150,220,290,360].map(x => `<polygon points="${x},270 ${x+6},278 ${x-6},278"/>`).join('')}
          ${[150,220,290,370].map(x => `<polygon points="${x},425 ${x+6},433 ${x-6},433"/>`).join('')}
        </g>
        <text class="label-sm" x="250" y="260" text-anchor="middle" fill="var(--liquid)" font-size="14">💧 Water Deluge Ring</text>
      </g>

      <!-- ====================== FIRE + DELUGE DEMO (toggled by btnFire) ====================== -->
      <g id="ovFireScene" opacity="0">
        <g transform="translate(250,260)">
          <path d="M 0 0 Q 10 -20 0 -40 Q -8 -25 -10 -10 Q -6 0 0 0 Z" fill="#ff7a45">
            <animate attributeName="d" values="M 0 0 Q 10 -20 0 -40 Q -8 -25 -10 -10 Q -6 0 0 0 Z;
                                                M 0 0 Q 12 -28 2 -50 Q -10 -30 -12 -10 Q -6 0 0 0 Z;
                                                M 0 0 Q 10 -20 0 -40 Q -8 -25 -10 -10 Q -6 0 0 0 Z" dur=".4s" repeatCount="indefinite"/>
          </path>
          <path d="M 8 0 Q 18 -16 12 -36 Q 4 -22 2 -8 Q 4 0 8 0 Z" fill="#ffd166">
            <animate attributeName="d" values="M 8 0 Q 18 -16 12 -36 Q 4 -22 2 -8 Q 4 0 8 0 Z;
                                                M 8 0 Q 22 -22 14 -44 Q 4 -28 2 -10 Q 4 0 8 0 Z;
                                                M 8 0 Q 18 -16 12 -36 Q 4 -22 2 -8 Q 4 0 8 0 Z" dur=".4s" begin="-.2s" repeatCount="indefinite"/>
          </path>
        </g>
        <!-- Active deluge water spray -->
        <g stroke="#5ac8fa" stroke-width="2" opacity=".75">
          ${[150,220,290,360].flatMap(x => [
            `<line x1="${x}" y1="278" x2="${x-12}" y2="320"><animate attributeName="opacity" values=".3;.95;.3" dur=".5s" repeatCount="indefinite"/></line>`,
            `<line x1="${x}" y1="278" x2="${x}"    y2="324"><animate attributeName="opacity" values=".3;.95;.3" dur=".5s" begin="-.1s" repeatCount="indefinite"/></line>`,
            `<line x1="${x}" y1="278" x2="${x+12}" y2="320"><animate attributeName="opacity" values=".3;.95;.3" dur=".5s" begin="-.2s" repeatCount="indefinite"/></line>`,
          ]).join('')}
        </g>
        <rect x="450" y="100" width="450" height="60" rx="8" fill="rgba(255,61,87,.88)" stroke="var(--hot)" stroke-width="2" class="pulse"/>
        <text x="675" y="130" text-anchor="middle" font-size="20" font-weight="700" fill="#fff" font-family="Sarabun,sans-serif">🔥 FIRE DETECTED — DELUGE ACTIVATED</text>
        <text x="675" y="150" text-anchor="middle" font-size="13" fill="#ffd5dc" font-family="Sarabun,sans-serif">ฉีดน้ำหล่อเย็นถัง ป้องกัน BLEVE — ESD ตัดระบบทันที</text>
      </g>

      <!-- ====================== HEAVY VAPOR CLOUD DEMO ====================== -->
      <g id="ovVaporCloud" opacity="0">
        <ellipse cx="380" cy="700" rx="0" ry="0" fill="var(--vapor)" opacity=".55">
          <animate attributeName="rx" values="0;260" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="0;28" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="cx" values="380;780" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".6;0" dur="3s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="380" cy="710" rx="0" ry="0" fill="var(--vapor)" opacity=".5">
          <animate attributeName="rx" values="0;220" dur="3s" begin="-1.5s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="0;24" dur="3s" begin="-1.5s" repeatCount="indefinite"/>
          <animate attributeName="cx" values="380;730" dur="3s" begin="-1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".55;0" dur="3s" begin="-1.5s" repeatCount="indefinite"/>
        </ellipse>
        <text class="label-num" x="500" y="660" text-anchor="middle" fill="var(--hot)" font-size="14" font-weight="700">⚠ ไอ LPG หนักกว่าอากาศ 1.5× — สะสมต่ำ ไหลตามลม</text>
      </g>

      <!-- ====================== SAFETY EQUIPMENT (gas detectors, ESD, fire monitor) ====================== -->
      <g transform="translate(220,360)">
        <rect x="-7" y="-13" width="14" height="22" rx="2" fill="#252e44" stroke="#3a4a6e"/>
        <circle r="3.5" fill="var(--good)" class="pulse"/>
        <text class="label-num" x="0" y="22" text-anchor="middle" font-size="13" fill="var(--good)">DET-1</text>
      </g>
      <g transform="translate(720,478)">
        <rect x="-7" y="-13" width="14" height="22" rx="2" fill="#252e44" stroke="#3a4a6e"/>
        <circle r="3.5" fill="var(--good)" class="pulse"/>
        <text class="label-num" x="0" y="22" text-anchor="middle" font-size="13" fill="var(--good)">DET-2</text>
      </g>
      <g transform="translate(1080,560)">
        <rect x="-7" y="-13" width="14" height="22" rx="2" fill="#252e44" stroke="#3a4a6e"/>
        <circle r="3.5" fill="var(--good)" class="pulse"/>
        <text class="label-num" x="0" y="22" text-anchor="middle" font-size="13" fill="var(--good)">DET-3</text>
      </g>

      <!-- ESD station -->
      <g transform="translate(500,615)">
        <rect x="-12" y="-10" width="54" height="60" rx="4" fill="#252e44" stroke="#3a4a6e"/>
        <circle cx="15" cy="12" r="15" fill="var(--hot)" stroke="#5a1015" stroke-width="2" class="pulse"/>
        <text x="15" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">STOP</text>
        <text class="label-sm" x="15" y="44" text-anchor="middle">ESD</text>
      </g>

      <!-- Fire water monitor — moved to bullet tank yard (where the highest-risk asset is) -->
      <g transform="translate(460,460)">
        <rect x="-3" y="0" width="6" height="38" fill="#5a6577"/>
        <rect x="-13" y="38" width="26" height="12" rx="2" fill="#a82530"/>
        <rect x="-2" y="-9" width="14" height="10" fill="#a82530"/>
        <text class="label-sm" x="0" y="62" text-anchor="middle" fill="#ff8a8a">Fire Monitor</text>
      </g>


      <!-- ====================== SAFETY SIGN BOARD (ISO 7010 / มอก. 635-2554) ======================
           Compliant Thai safety signage for LPG bottling plants per กฎกระทรวง พ.ศ. 2564
           - Prohibition (P002, P003): red circle + slash, white bg
           - Warning (W021): yellow triangle, black border
           - Mandatory (M001): blue circle, white icon
           - NFPA 704 included as supplementary international ID
       -->
      <g transform="translate(20, 488)">
        <!-- Mounting post -->
        <rect x="32" y="0" width="6" height="220" fill="#5a6577" stroke="#1a1d2a"/>

        <!-- Red title banner -->
        <rect x="0" y="0" width="76" height="18" rx="2" fill="#a82530" stroke="#5a0d10" stroke-width="1.5"/>
        <text x="38" y="13" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="Sarabun,sans-serif">⚠ DANGER ZONE</text>

        <!-- Sign 1: P002 ห้ามสูบบุหรี่ -->
        <g transform="translate(0, 22)">
          <rect width="76" height="44" rx="2" fill="#fff" stroke="#0a1322" stroke-width="1.2"/>
          <g transform="translate(8, 5)">
            <circle cx="14" cy="14" r="12.5" fill="#fff" stroke="#a82530" stroke-width="3"/>
            <!-- Cigarette -->
            <rect x="3" y="13" width="16" height="2.5" fill="#1a1d2a"/>
            <rect x="19" y="12" width="3" height="4.5" fill="#ffae3d"/>
            <line x1="3.5" y1="3.5" x2="24.5" y2="24.5" stroke="#a82530" stroke-width="3.5" stroke-linecap="round"/>
          </g>
          <text x="44" y="16" font-size="9" font-weight="700" fill="#a82530" font-family="Sarabun,sans-serif">ห้ามสูบ</text>
          <text x="44" y="27" font-size="9" font-weight="700" fill="#a82530" font-family="Sarabun,sans-serif">บุหรี่</text>
          <text x="44" y="39" font-size="6.5" font-weight="600" fill="#7a8499" font-family="Consolas,monospace">ISO P002</text>
        </g>

        <!-- Sign 2: P003 ห้ามใช้เปลวไฟ -->
        <g transform="translate(0, 70)">
          <rect width="76" height="44" rx="2" fill="#fff" stroke="#0a1322" stroke-width="1.2"/>
          <g transform="translate(8, 5)">
            <circle cx="14" cy="14" r="12.5" fill="#fff" stroke="#a82530" stroke-width="3"/>
            <!-- Flame icon -->
            <path d="M14 5 Q19 10 17 17 Q14 14 14 19 Q10 14 13 10 Q11 7 14 5 Z" fill="#1a1d2a"/>
            <line x1="3.5" y1="3.5" x2="24.5" y2="24.5" stroke="#a82530" stroke-width="3.5" stroke-linecap="round"/>
          </g>
          <text x="44" y="16" font-size="9" font-weight="700" fill="#a82530" font-family="Sarabun,sans-serif">ห้ามใช้</text>
          <text x="44" y="27" font-size="9" font-weight="700" fill="#a82530" font-family="Sarabun,sans-serif">เปลวไฟ</text>
          <text x="44" y="39" font-size="6.5" font-weight="600" fill="#7a8499" font-family="Consolas,monospace">ISO P003</text>
        </g>

        <!-- Sign 3: W021 ก๊าซไวไฟ (yellow warning triangle) -->
        <g transform="translate(0, 118)">
          <rect width="76" height="44" rx="2" fill="#fff" stroke="#0a1322" stroke-width="1.2"/>
          <g transform="translate(7, 5)">
            <polygon points="14,2 27,25 1,25" fill="#ffd166" stroke="#1a1d2a" stroke-width="2.2"/>
            <path d="M14 11 Q19 16 17 22 Q14 19 14 23 Q10 19 13 16 Q11 13 14 11 Z" fill="#1a1d2a"/>
          </g>
          <text x="44" y="16" font-size="9" font-weight="700" fill="#a06030" font-family="Sarabun,sans-serif">วัตถุ</text>
          <text x="44" y="27" font-size="9" font-weight="700" fill="#a06030" font-family="Sarabun,sans-serif">ไวไฟ</text>
          <text x="44" y="39" font-size="6.5" font-weight="600" fill="#7a8499" font-family="Consolas,monospace">ISO W021</text>
        </g>

        <!-- Sign 4: M001+M004 PPE บังคับ (blue mandatory) -->
        <g transform="translate(0, 166)">
          <rect width="76" height="44" rx="2" fill="#fff" stroke="#0a1322" stroke-width="1.2"/>
          <g transform="translate(8, 5)">
            <circle cx="14" cy="14" r="13" fill="#1a4a78"/>
            <!-- Hard hat icon -->
            <path d="M5 14 Q14 5 23 14 L23 17 L5 17 Z" fill="#fff"/>
            <rect x="4" y="17" width="20" height="2" fill="#fff"/>
            <!-- chin strap -->
            <path d="M9 17 L9 22" stroke="#fff" stroke-width="1.2" fill="none"/>
            <path d="M19 17 L19 22" stroke="#fff" stroke-width="1.2" fill="none"/>
          </g>
          <text x="44" y="16" font-size="9" font-weight="700" fill="#1a4a78" font-family="Sarabun,sans-serif">ต้องสวม</text>
          <text x="44" y="27" font-size="9" font-weight="700" fill="#1a4a78" font-family="Sarabun,sans-serif">PPE</text>
          <text x="44" y="39" font-size="6.5" font-weight="600" fill="#7a8499" font-family="Consolas,monospace">ISO M001</text>
        </g>
      </g>

      <!-- ====================== WIND SOCK (mounted on WAREHOUSE roof peak) ======================
           Warehouse at translate(1200, 380) — roof peak at viewBox (1350, 390).
           Wind sock mast rises from roof peak, sock sways with wind. -->
      <g transform="translate(1350, 388)">
        <!-- Mounting bracket on roof -->
        <polygon points="-6,4 6,4 4,0 -4,0" fill="#1a1d2a"/>
        <!-- Vertical mast going UP from roof peak -->
        <rect x="-1.5" y="-55" width="3" height="55" fill="#7d8aa3" stroke="#3a4258" stroke-width=".5"/>
        <!-- Mast cap -->
        <circle cx="0" cy="-55" r="2.5" fill="#3a4258"/>
        <!-- Horizontal pivot arm -->
        <rect x="-2" y="-54" width="14" height="2" fill="#5a6577"/>
        <!-- Wind sock (with stripes, swaying in wind) -->
        <g class="sway" style="transform-box:fill-box;transform-origin:left">
          <polygon points="12,-56 38,-58 48,-52 38,-46 12,-48" fill="var(--accent)" opacity=".95" stroke="#a04020" stroke-width=".5"/>
          <!-- Stripe 1 -->
          <polygon points="18,-57.5 22,-57.6 22,-46.7 18,-46.5" fill="#fff" opacity=".4"/>
          <!-- Stripe 2 -->
          <polygon points="28,-58 32,-58 32,-46.2 28,-46.5" fill="#fff" opacity=".4"/>
          <!-- End opening (white inside) -->
          <ellipse cx="48" cy="-52" rx="2" ry="3" fill="#fff" opacity=".5"/>
        </g>
        <!-- Wind label -->
        <text class="label-sm" x="20" y="-66" text-anchor="middle" font-size="11" fill="var(--ink)">Wind</text>
      </g>

      <!-- ====================== WORKERS ====================== -->
      <!-- Operator (the one handling truck) — controlled by rAF (position varies by phase) -->
      <use id="ovOpr" href="#worker" x="0" y="0" width="22" height="40" transform="translate(440,610)"/>

      <!-- Filling operator (static near carousel) -->
      <use href="#worker" x="0" y="0" width="20" height="36" transform="translate(770,602)"/>

      <!-- Inspector (static near leak booth) -->
      <use href="#inspector" x="0" y="0" width="20" height="36" transform="translate(1110,605)"/>

      <!-- Birds -->
      <g fill="none" stroke="#1a1d2a" stroke-width="1.5">
        <path d="M0,0 Q3,-3 6,0 Q9,-3 12,0">
          <animateMotion dur="40s" repeatCount="indefinite" path="M -50 130 C 300 100, 700 140, 1100 110 C 1300 100, 1500 120, 1700 110"/>
        </path>
        <path d="M0,0 Q3,-3 6,0 Q9,-3 12,0">
          <animateMotion dur="60s" begin="-25s" repeatCount="indefinite" path="M -50 90 C 400 70, 800 100, 1200 80 C 1400 70, 1600 90, 1800 80"/>
        </path>
      </g>
    </svg>
  `;

  // ============================================================
  // STATE
  // ============================================================
  const CYCLE = 16; // seconds
  let pausedAt = null;
  let pauseOffset = 0;
  let rafId = null;

  const $ = id => document.getElementById(id);
  const truck      = $('ovTruck');
  const truckLiq   = $('ovTruckLiquid');
  const tankBLiq   = $('ovTankB');
  const tankALiq   = $('ovTankA');
  const ground     = $('ovGround');
  const hose       = $('ovHoseGroup');
  const opr        = $('ovOpr');
  const clock      = $('ovClock');
  const phase      = $('ovPhase');

  // Easing utilities
  const lerp = (a,b,t) => a + (b-a) * t;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const easeInOut = t => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;

  // ============================================================
  // CAROUSEL ANIMATION — elliptical horizontal rotation
  // Stations orbit on ellipse; stay UPRIGHT (no rotation), scale with depth,
  // and are re-parented to back/front groups for correct z-order.
  // ============================================================
  const STATION_COUNT  = 6;     // 6 หัวบรรจุ (real carousels: 6/8/12 — 6 = clearest 2D layout)
  const CAROUSEL_PERIOD = 18;   // seconds per full rotation (slower for educational viewing)
  const ORBIT_A = 100;          // ellipse horizontal radius (wider spread = less crowded)
  const ORBIT_B = 28;           // ellipse vertical radius (clear front/back depth)
  const ORBIT_CY = 90;          // ellipse center Y (sits on disc top)
  const stBack  = document.getElementById('ovStBack');
  const stFront = document.getElementById('ovStFront');
  const stEls   = [];
  for (let i = 1; i <= STATION_COUNT; i++) stEls.push(document.getElementById('ovSt' + i));

  function updateCarousel(tNow){
    const cycle = (tNow / CAROUSEL_PERIOD) % 1;
    const baseAng = cycle * 2 * Math.PI;
    const step = (2 * Math.PI) / STATION_COUNT;   // angular step between stations
    for (let i = 0; i < STATION_COUNT; i++){
      const el = stEls[i];
      if (!el) continue;
      const a = baseAng + (i * step);
      const sinA = Math.sin(a);
      const cosA = Math.cos(a);
      const sx = cosA * ORBIT_A;
      const sy = ORBIT_CY + sinA * ORBIT_B;
      // Depth scale: back (sinA=-1) → 0.55, front (sinA=+1) → 1.05
      const scale = 0.55 + 0.50 * (sinA + 1) / 2;
      el.setAttribute('transform', `translate(${sx},${sy}) scale(${scale})`);
      // Z-order: stations with sinA < 0 go to BACK group, else FRONT
      const targetParent = sinA < 0 ? stBack : stFront;
      if (el.parentElement !== targetParent){
        targetParent.appendChild(el);
      }
    }
  }

  // ============================================================
  // MASTER FRAME UPDATER
  // Drives: truck pos, worker pos, ground/hose visibility, levels, carousel
  // ============================================================
  function update(){
    const tNow = (performance.now() - pauseOffset) / 1000;
    const t = tNow % CYCLE;

    updateCarousel(tNow);

    // ---- TRUCK POSITION ----
    // Approach 0→2s: x slides -300 → 140 (smooth ease)
    // Park    2→14s: stays at 140
    // Depart  14→16s: x slides 140 → 1900
    let truckX;
    if (t < 2)          truckX = lerp(-300, 140, easeInOut(t / 2));
    else if (t < 14)    truckX = 140;
    else                truckX = lerp(140, 1700, easeInOut((t-14) / 2));   // 1700, not 1900 → truck cab still onscreen at t=15.5s
    truck.setAttribute('transform', `translate(${truckX}, 600)`);

    // ---- WORKER (operator) POSITION ----
    // Home base: (440, 610) — between pump and ESD
    // Walks to truck position (320, 612) at 2-3s, stays through unload, returns 13-14s
    let oprX = 440, oprY = 610;
    if (t < 2){
      // Home base
      oprX = 440; oprY = 610;
    } else if (t < 3){
      // Walk to truck (440 → 320)
      const k = (t - 2);
      oprX = lerp(440, 320, k);
      oprY = lerp(610, 612, k);
    } else if (t < 13){
      // Stay near truck
      oprX = 320; oprY = 612;
    } else if (t < 14){
      // Walk back home (320 → 440)
      const k = (t - 13);
      oprX = lerp(320, 440, k);
      oprY = lerp(612, 610, k);
    } else {
      oprX = 440; oprY = 610;
    }
    opr.setAttribute('transform', `translate(${oprX}, ${oprY})`);

    // ---- GROUNDING CABLE VISIBILITY ----
    // Appears 3s, stays until 13s (during entire unload + connect/disconnect)
    const groundVis = (t >= 3 && t < 13) ? 1 : 0;
    ground.setAttribute('opacity', groundVis);

    // ---- HOSE VISIBILITY ----
    // Appears 4.5s, stays until 12s (during unload only)
    const hoseVis = (t >= 4.5 && t < 12) ? 1 : 0;
    hose.setAttribute('opacity', hoseVis);

    // ---- LIQUID LEVELS ----
    // Tank-B gauge geometry: gauge box y=396 to y=464 (height=68). MAX safe fill = 85% = 58 px.
    // Tank-B starts at 30 (≈44%), fills to 58 (=85%) during unload — never overflows past gauge.
    let tankBHeight = 30, truckLiqHeight = 40;
    if (t < 5.5){
      tankBHeight = 30;
      truckLiqHeight = 40;
    } else if (t < 12){
      const k = clamp((t - 5.5) / 6.5, 0, 1);
      tankBHeight = lerp(30, 58, k);   // 30 → 58 (85% — กฎ 85% ห้ามเกิน)
      truckLiqHeight = lerp(40, 8, k);
    } else {
      tankBHeight = 58;       // capped at 85%
      truckLiqHeight = 8;
    }
    tankBLiq.setAttribute('height', tankBHeight);
    tankBLiq.setAttribute('y', 464 - tankBHeight);
    truckLiq.setAttribute('height', truckLiqHeight);
    truckLiq.setAttribute('y', 100 - truckLiqHeight);
    // Tank-B percent readout (30/68=44%, 58/68=85%)
    const tankBPct = Math.round((tankBHeight / 68) * 100);
    const tankBPctEl = document.getElementById('ovTankBPct');
    if (tankBPctEl) tankBPctEl.textContent = tankBPct + '%';

    // ---- Tank-A subtle "production drain" (slowly drops over cycle to show usage) ----
    const longCycle = ((performance.now() - pauseOffset) / 1000) % 32;
    const tankAH = longCycle < 16 ? lerp(35, 22, longCycle/16) : lerp(22, 35, (longCycle-16)/16);
    tankALiq.setAttribute('height', tankAH);
    tankALiq.setAttribute('y', 350 - tankAH);          // gauge box y=290 height=60; baseline y=350
    const tankAPct = Math.round((tankAH / 60) * 100);
    const tankAPctEl = document.getElementById('ovTankAPct');
    if (tankAPctEl) tankAPctEl.textContent = tankAPct + '%';

    // ---- CLOCK + PHASE INDICATOR ----
    clock.textContent = t.toFixed(1) + 's';
    let phaseTxt;
    if      (t < 2)    phaseTxt = '🚛 รถบรรทุก LPG เข้าจอด';
    else if (t < 3)    phaseTxt = '👷 พนักงานเดินไปต่อสายดิน';
    else if (t < 4.5)  phaseTxt = '⚡ ต่อสายดิน Earthing R<10Ω';
    else if (t < 5.5)  phaseTxt = '🔧 ต่อสายส่ง LPG';
    else if (t < 12)   phaseTxt = '💧 กำลังถ่าย LPG เข้าถังเก็บ';
    else if (t < 13)   phaseTxt = '🔧 ถอดสายส่ง LPG';
    else if (t < 14)   phaseTxt = '👷 ถอดสายดิน + เดินกลับสถานี';
    else               phaseTxt = '🚛 รถบรรทุกออกจากโรงงาน';
    phase.textContent = phaseTxt;

    rafId = requestAnimationFrame(update);
  }

  // ============================================================
  // INFO PANEL — click hot zones
  // ============================================================
  const panel    = $('ovInfoPanel');
  const pTitle   = $('ovInfoTitle');
  const pDesc    = $('ovInfoDesc');
  const pRole    = $('ovInfoRole');
  const pPhoto   = $('ovInfoPhoto');
  const pClose   = $('ovInfoClose');

  function openPanel(eqId){
    const info = EQUIP[eqId];
    if (!info) return;
    pTitle.textContent = info.title;
    pDesc.textContent  = info.desc;
    pRole.textContent  = info.role;
    pPhoto.style.backgroundImage = `url('${info.img}')`;
    panel.classList.add('show');
  }
  function closePanel(){ panel.classList.remove('show'); }

  document.querySelectorAll('.hot-zone[data-eq]').forEach(el => {
    el.addEventListener('click', () => openPanel(el.dataset.eq));
  });
  pClose.addEventListener('click', closePanel);

  // ============================================================
  // PAUSE / PLAY
  // ============================================================
  const svg     = $('ovSvg');
  const btnPause = $('ovPause');

  function togglePause(){
    if (pausedAt === null){
      pausedAt = performance.now();
      if (rafId){ cancelAnimationFrame(rafId); rafId = null; }
      try { svg.pauseAnimations(); } catch(e){}
      document.body.classList.add('paused');     // also halts CSS keyframes
      btnPause.textContent = '▶';
      btnPause.title = 'เล่น (Space)';
    } else {
      pauseOffset += (performance.now() - pausedAt);
      pausedAt = null;
      try { svg.unpauseAnimations(); } catch(e){}
      document.body.classList.remove('paused');
      btnPause.textContent = '⏸';
      btnPause.title = 'หยุด (Space)';
      update();
    }
  }
  btnPause.addEventListener('click', togglePause);

  // ============================================================
  // SCENE HOOKS (vapor + fire button handlers removed — buttons no longer in UI)
  // ============================================================
  window.LPG.registerScene('overview', {
    onEnter(){ if (!rafId && pausedAt === null) update(); },
    onLeave(){
      if (rafId){ cancelAnimationFrame(rafId); rafId = null; }
      closePanel();
    },
    onKey(e){
      if (e.key === 'Escape' && panel.classList.contains('show')){ closePanel(); return true; }
      if (e.key === ' ' || e.key === 'p' || e.key === 'P'){ togglePause(); return true; }
      return false;
    }
  });

  // Auto-start (app.js will also call onEnter on DOMContentLoaded but this catches early loads)
  update();
})();
