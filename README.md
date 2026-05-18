# สถานีโรงบรรจุก๊าซ LPG — Animation Training

Interactive 2D animation training material for Thai LPG bottling plant operations.
Designed to fit in a single PowerPoint slide (16:9) and embeddable via Web Viewer add-in.

## 🌐 Live Demo
**https://netmer.github.io/lpg-training/**

## 🎯 What's animated

A continuous 16-second cycle showing:
1. LPG tanker truck arrives (0–2s)
2. Operator walks to truck and connects grounding cable (2–4.5s)
3. Vapor return hose connected (4.5–5.5s)
4. Liquid unload: truck level drops, bullet tank rises 30 → 85% (5.5–12s)
5. Hose disconnect, grounding removed (12–14s)
6. Truck departs (14–16s)

Continuously running (decoupled):
- Pump impeller (Centrifugal volute + 6-blade impeller cutaway)
- Vapor compressor (motor + belt drive + cylinder + pressure gauge)
- Filling carousel (6 stations on elliptical orbit, upright)
- Conveyor cylinders + leak detector booth
- Clouds, sun, wind sock on warehouse roof, beacons

## 🎛 Interactive controls

| Button | Function |
|---|---|
| ⏸ | Pause / Resume animation (Space key) |
| 💨 ไอ | Show heavy LPG vapor pooling demo |
| 🔥 ไฟ | Simulate fire detection → deluge spray activated |
| ⛶ | Fullscreen (F key) |

Click on any piece of equipment to see info panel.

## 📊 PowerPoint Embedding

### Method 1: Web Viewer 2.0 Add-in (recommended — fully interactive in slide)
1. **Insert → Get Add-ins → Store**
2. Search **"Web Viewer"** (by Microsoft Corporation) → **Add**
3. On your slide: **Insert → My Add-ins → Web Viewer**
4. Paste URL: `https://netmer.github.io/lpg-training/`
5. Click **Preview** — the page renders inside your slide
6. Resize the add-in to fill the slide
7. Press **F5** to present — buttons and animations work normally

### Method 2: Hyperlink (simpler — opens in browser)
1. Insert a shape or image on a slide
2. **Right-click → Hyperlink → Existing File or Web Page**
3. Paste the URL above
4. During presentation, click the shape — opens your default browser

## 🏗 Project structure
```
├── index.html          # Page shell (slim header + stage)
├── css/styles.css      # All styles (16:9 PPT layout)
├── js/
│   ├── app.js          # Tab/embed/keyboard
│   └── scene1.js       # Overview scene (animation choreography)
└── images/             # 17 real equipment photos (Wikimedia Commons CC BY-SA)
```

## 📚 Content reference
- กฎกระทรวงสถานที่บรรจุก๊าซปิโตรเลียมเหลว ประเภทโรงบรรจุ พ.ศ. 2564
- หลักสูตรผู้ปฏิบัติงานสถานที่บรรจุก๊าซปิโตรเลียมเหลว (กรมธุรกิจพลังงาน)
- มอก. 635-2554 / ISO 7010 safety signage

## 📷 Image credits
Equipment photos sourced from Wikimedia Commons under CC BY-SA / CC BY licenses. See individual image metadata in `images/` for attribution.

---
© 2026 NET Energy • Training material for educational use
