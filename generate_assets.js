const fs = require('node:fs');
const path = require('node:path');

const imgDir = path.join(__dirname, 'public', 'images');
fs.mkdirSync(imgDir, { recursive: true });

const svgs = {
  'headphones.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
      <radialGradient id="r1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <circle cx="200" cy="200" r="140" fill="url(#r1)"/>
    <!-- Headband -->
    <path d="M 120 220 A 100 100 0 0 1 280 220" fill="none" stroke="url(#g1)" stroke-width="22" stroke-linecap="round"/>
    <path d="M 140 180 A 80 80 0 0 1 260 180" fill="none" stroke="#334155" stroke-width="8" stroke-linecap="round"/>
    <!-- Left Ear Cup -->
    <rect x="96" y="200" width="36" height="74" rx="18" fill="#3b82f6"/>
    <rect x="104" y="212" width="20" height="50" rx="10" fill="#1e293b"/>
    <!-- Right Ear Cup -->
    <rect x="268" y="200" width="36" height="74" rx="18" fill="#3b82f6"/>
    <rect x="276" y="212" width="20" height="50" rx="10" fill="#1e293b"/>
    <circle cx="200" cy="330" r="4" fill="#64748b"/>
    <text x="200" y="360" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">AURA PRO ANC</text>
  </svg>`,

  'smartwatch.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ec4899"/>
        <stop offset="100%" stop-color="#8b5cf6"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <circle cx="200" cy="200" r="130" fill="#ec4899" opacity="0.1"/>
    <!-- Straps -->
    <rect x="160" y="50" width="80" height="100" rx="8" fill="#1e293b"/>
    <rect x="160" y="250" width="80" height="100" rx="8" fill="#1e293b"/>
    <!-- Watch Body -->
    <rect x="135" y="125" width="130" height="150" rx="34" fill="#334155" stroke="url(#sg)" stroke-width="4"/>
    <rect x="145" y="135" width="110" height="130" rx="26" fill="#020617"/>
    <!-- Screen Elements -->
    <text x="200" y="195" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="32">10:42</text>
    <circle cx="175" cy="230" r="12" fill="none" stroke="#10b981" stroke-width="3"/>
    <path d="M 170 230 L 174 234 L 180 226" fill="none" stroke="#10b981" stroke-width="2"/>
    <circle cx="205" cy="230" r="12" fill="none" stroke="#ec4899" stroke-width="3"/>
    <circle cx="225" cy="230" r="12" fill="none" stroke="#3b82f6" stroke-width="3"/>
    <text x="200" y="375" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">HORIZON AMOLED</text>
  </svg>`,

  'keyboard.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="kg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#06b6d4"/>
        <stop offset="50%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#a855f7"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <!-- Keyboard base -->
    <rect x="55" y="130" width="290" height="150" rx="16" fill="#1e293b" stroke="url(#kg)" stroke-width="3"/>
    <rect x="65" y="140" width="270" height="130" rx="10" fill="#090d16"/>
    <!-- Key Rows -->
    <g fill="#334155" rx="3">
      <!-- Row 1 -->
      <rect x="75" y="150" width="22" height="18" rx="4"/>
      <rect x="103" y="150" width="22" height="18" rx="4"/>
      <rect x="131" y="150" width="22" height="18" rx="4"/>
      <rect x="159" y="150" width="22" height="18" rx="4"/>
      <rect x="187" y="150" width="22" height="18" rx="4"/>
      <rect x="215" y="150" width="22" height="18" rx="4"/>
      <rect x="243" y="150" width="22" height="18" rx="4"/>
      <rect x="271" y="150" width="22" height="18" rx="4"/>
      <rect x="299" y="150" width="26" height="18" rx="4" fill="#06b6d4"/>

      <!-- Row 2 -->
      <rect x="75" y="174" width="28" height="18" rx="4" fill="#3b82f6"/>
      <rect x="109" y="174" width="22" height="18" rx="4"/>
      <rect x="137" y="174" width="22" height="18" rx="4"/>
      <rect x="165" y="174" width="22" height="18" rx="4"/>
      <rect x="193" y="174" width="22" height="18" rx="4"/>
      <rect x="221" y="174" width="22" height="18" rx="4"/>
      <rect x="249" y="174" width="22" height="18" rx="4"/>
      <rect x="277" y="174" width="48" height="18" rx="4"/>

      <!-- Row 3 -->
      <rect x="75" y="198" width="34" height="18" rx="4"/>
      <rect x="115" y="198" width="22" height="18" rx="4"/>
      <rect x="143" y="198" width="22" height="18" rx="4"/>
      <rect x="171" y="198" width="22" height="18" rx="4"/>
      <rect x="199" y="198" width="22" height="18" rx="4"/>
      <rect x="227" y="198" width="22" height="18" rx="4"/>
      <rect x="255" y="198" width="70" height="18" rx="4" fill="#a855f7"/>

      <!-- Row 4 Spacebar -->
      <rect x="75" y="222" width="32" height="18" rx="4"/>
      <rect x="113" y="222" width="28" height="18" rx="4"/>
      <rect x="147" y="222" width="110" height="18" rx="4" fill="#6366f1"/>
      <rect x="263" y="222" width="28" height="18" rx="4"/>
      <rect x="297" y="222" width="28" height="18" rx="4"/>
    </g>
    <!-- Glow line -->
    <line x1="80" y1="290" x2="320" y2="290" stroke="url(#kg)" stroke-width="2" opacity="0.7"/>
    <text x="200" y="340" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">VORTEX RGB MECHANICAL</text>
  </svg>`,

  'mouse.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <defs>
      <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10b981"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    </defs>
    <!-- Ergonomic Mouse Body -->
    <ellipse cx="200" cy="200" rx="65" ry="95" fill="#1e293b" stroke="url(#mg)" stroke-width="4"/>
    <path d="M 200 105 L 200 180" stroke="#475569" stroke-width="2"/>
    <!-- Scroll Wheel -->
    <rect x="194" y="130" width="12" height="30" rx="6" fill="#10b981"/>
    <!-- Thumb Rest Flare -->
    <path d="M 135 180 Q 110 210 145 250" fill="#334155" opacity="0.6"/>
    <!-- DPI button -->
    <circle cx="200" cy="180" r="5" fill="#38bdf8"/>
    <text x="200" y="350" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">PULSE ERGONOMIC PRO</text>
  </svg>`,

  'monitor.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="scr" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
      <linearGradient id="code" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#818cf8"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <!-- Stand -->
    <rect x="188" y="240" width="24" height="60" rx="2" fill="#475569"/>
    <ellipse cx="200" cy="300" rx="60" ry="12" fill="#334155"/>
    <!-- UltraWide Curved Screen -->
    <rect x="40" y="100" width="320" height="150" rx="12" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
    <rect x="48" y="108" width="304" height="134" rx="8" fill="url(#scr)"/>
    <!-- Screen Graphics -->
    <line x1="70" y1="130" x2="180" y2="130" stroke="url(#code)" stroke-width="4" stroke-linecap="round"/>
    <line x1="70" y1="150" x2="140" y2="150" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/>
    <line x1="70" y1="170" x2="220" y2="170" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
    <line x1="70" y1="190" x2="160" y2="190" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
    <rect x="240" y="125" width="95" height="95" rx="6" fill="#334155" opacity="0.4"/>
    <circle cx="288" cy="172" r="24" fill="none" stroke="#a855f7" stroke-width="6"/>
    <text x="200" y="355" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">LUMINA 34" 4K HDR</text>
  </svg>`,

  'charger.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <!-- Base Plate -->
    <ellipse cx="200" cy="270" rx="130" ry="35" fill="#1e293b" stroke="#475569" stroke-width="3"/>
    <!-- Upright stand -->
    <path d="M 190 270 L 205 130" stroke="#64748b" stroke-width="12" stroke-linecap="round"/>
    <!-- MagSafe Disk -->
    <circle cx="205" cy="130" r="45" fill="#090d16" stroke="#38bdf8" stroke-width="4"/>
    <circle cx="205" cy="130" r="30" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 4"/>
    <polygon points="205,115 198,130 205,130 202,145 212,127 205,127" fill="#38bdf8"/>
    <!-- Earbuds Charging Pad on Base -->
    <ellipse cx="140" cy="270" rx="28" ry="12" fill="#090d16" stroke="#10b981" stroke-width="2"/>
    <text x="200" y="350" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">ZENPOD 3-IN-1 WIRELESS</text>
  </svg>`,

  'speaker.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="spk" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="100%" stop-color="#db2777"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <!-- Speaker Body (Cylinder) -->
    <rect x="135" y="110" width="130" height="180" rx="45" fill="#1e293b" stroke="url(#spk)" stroke-width="4"/>
    <!-- Mesh pattern -->
    <circle cx="200" cy="180" r="35" fill="none" stroke="#475569" stroke-width="3" stroke-dasharray="6 6"/>
    <circle cx="200" cy="180" r="20" fill="#f97316" opacity="0.8"/>
    <!-- Glowing LED Ring at Top -->
    <ellipse cx="200" cy="125" rx="50" ry="12" fill="#090d16" stroke="#38bdf8" stroke-width="3"/>
    <!-- Sound Waves -->
    <path d="M 95 160 Q 75 180 95 200" fill="none" stroke="#db2777" stroke-width="3" stroke-linecap="round"/>
    <path d="M 305 160 Q 325 180 305 200" fill="none" stroke="#f97316" stroke-width="3" stroke-linecap="round"/>
    <text x="200" y="350" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">ECHOBEAM HI-FI 360°</text>
  </svg>`,

  'backpack.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <!-- Handle -->
    <path d="M 175 100 Q 200 65 225 100" fill="none" stroke="#475569" stroke-width="8" stroke-linecap="round"/>
    <!-- Main Body -->
    <rect x="125" y="100" width="150" height="190" rx="35" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/>
    <!-- Front Pocket -->
    <rect x="140" y="180" width="120" height="95" rx="18" fill="#334155"/>
    <line x1="140" y1="205" x2="260" y2="205" stroke="#0ea5e9" stroke-width="3"/>
    <!-- Buckle / Accents -->
    <rect x="190" y="198" width="20" height="14" rx="3" fill="#f8fafc"/>
    <text x="200" y="345" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">NOMAD CARBON BACKPACK</text>
  </svg>`,

  'earbuds.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <!-- Open Charging Case -->
    <rect x="130" y="170" width="140" height="100" rx="30" fill="#1e293b" stroke="#8b5cf6" stroke-width="3"/>
    <!-- Open Lid reflection -->
    <path d="M 130 170 C 130 110, 270 110, 270 170" fill="none" stroke="#8b5cf6" stroke-width="3"/>
    <!-- Earbuds resting -->
    <circle cx="170" cy="180" r="14" fill="#c084fc"/>
    <rect x="166" y="185" width="8" height="24" rx="4" fill="#ffffff"/>
    <circle cx="230" cy="180" r="14" fill="#c084fc"/>
    <rect x="226" y="185" width="8" height="24" rx="4" fill="#ffffff"/>
    <circle cx="200" cy="225" r="4" fill="#10b981"/>
    <text x="200" y="340" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">SOLACE HYBRID ANC</text>
  </svg>`,

  'desk.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <!-- Bamboo Tabletop -->
    <rect x="60" y="160" width="280" height="22" rx="6" fill="#d97706" stroke="#b45309" stroke-width="2"/>
    <!-- Steel Legs -->
    <rect x="100" y="182" width="18" height="100" fill="#334155"/>
    <rect x="282" y="182" width="18" height="100" fill="#334155"/>
    <!-- Feet -->
    <rect x="80" y="280" width="58" height="12" rx="4" fill="#1e293b"/>
    <rect x="262" y="280" width="58" height="12" rx="4" fill="#1e293b"/>
    <!-- Control Keypad -->
    <rect x="290" y="164" width="30" height="12" rx="2" fill="#0f172a"/>
    <circle cx="296" cy="170" r="2" fill="#10b981"/>
    <!-- Up/Down arrows indicator -->
    <path d="M 200 135 L 205 145 L 195 145 Z" fill="#38bdf8"/>
    <path d="M 200 125 L 195 115 L 205 115 Z" fill="#38bdf8"/>
    <text x="200" y="350" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">AERODESK STANDING DESK</text>
  </svg>`,

  'lightbar.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <!-- Monitor Top Edge -->
    <rect x="80" y="200" width="240" height="90" rx="8" fill="#1e293b"/>
    <!-- Lightbar Housing -->
    <rect x="90" y="150" width="220" height="18" rx="6" fill="#475569" stroke="#64748b" stroke-width="2"/>
    <!-- Clamp -->
    <rect x="185" y="168" width="30" height="45" rx="4" fill="#334155"/>
    <!-- Light Glow Area -->
    <polygon points="95,168 50,280 350,280 305,168" fill="#fbbf24" opacity="0.15"/>
    <line x1="100" y1="168" x2="300" y2="168" stroke="#fef08a" stroke-width="4"/>
    <text x="200" y="340" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">NOVA GLOW DESK LIGHT</text>
  </svg>`,

  'tumbler.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" rx="24" fill="#0f172a"/>
    <!-- Tumbler Body -->
    <path d="M 155 130 L 165 280 Q 200 290 235 280 L 245 130 Z" fill="#334155" stroke="#94a3b8" stroke-width="3"/>
    <!-- Insulated Lid -->
    <rect x="150" y="110" width="100" height="20" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
    <!-- Magnetic Slider -->
    <rect x="185" y="104" width="30" height="10" rx="3" fill="#38bdf8"/>
    <!-- Titanium Emblem -->
    <circle cx="200" cy="200" r="16" fill="none" stroke="#64748b" stroke-width="2"/>
    <text x="200" y="205" text-anchor="middle" fill="#cbd5e1" font-size="11" font-weight="bold">Ti</text>
    <text x="200" y="345" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="2">TITANIUM THERMAL 20OZ</text>
  </svg>`
};

for (const [name, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(imgDir, name), content.trim());
}

console.log('Generated ' + Object.keys(svgs).length + ' SVG vector illustrations.');
