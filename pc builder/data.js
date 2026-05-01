// InShop Builder — Catalog Engine
// Les produits sont chargés depuis Odoo via api.js
// Données de démonstration (fallback) — remplacées par Odoo quand disponible

window.CATALOG = {
  cpu: [
    { id:'cpu-1', name:'AMD Ryzen 9 7950X', brand:'AMD', category:'cpu', price:549, rating:4.9, reviews:2340, stock:'in_stock', tags:['bestseller'], images:[], specs:{ cores:16, threads:32, baseClock:'4.5 GHz', boostClock:'5.7 GHz', socket:'AM5', tdp:170, cache:'64 MB', architecture:'Zen 4' }},
    { id:'cpu-2', name:'Intel Core i9-14900K', brand:'Intel', category:'cpu', price:589, rating:4.8, reviews:1890, stock:'in_stock', tags:['bestseller'], images:[], specs:{ cores:24, threads:32, baseClock:'3.2 GHz', boostClock:'6.0 GHz', socket:'LGA1700', tdp:253, cache:'36 MB', architecture:'Raptor Lake' }},
    { id:'cpu-3', name:'AMD Ryzen 7 7800X3D', brand:'AMD', category:'cpu', price:349, rating:4.9, reviews:3100, stock:'in_stock', tags:['bestseller'], images:[], specs:{ cores:8, threads:16, baseClock:'4.2 GHz', boostClock:'5.0 GHz', socket:'AM5', tdp:120, cache:'96 MB', architecture:'Zen 4' }},
    { id:'cpu-4', name:'Intel Core i7-14700K', brand:'Intel', category:'cpu', price:399, rating:4.7, reviews:1560, stock:'in_stock', tags:[], images:[], specs:{ cores:20, threads:28, baseClock:'3.4 GHz', boostClock:'5.6 GHz', socket:'LGA1700', tdp:253, cache:'33 MB', architecture:'Raptor Lake' }},
    { id:'cpu-5', name:'AMD Ryzen 5 7600X', brand:'AMD', category:'cpu', price:199, rating:4.7, reviews:4200, stock:'in_stock', tags:[], images:[], specs:{ cores:6, threads:12, baseClock:'4.7 GHz', boostClock:'5.3 GHz', socket:'AM5', tdp:105, cache:'32 MB', architecture:'Zen 4' }},
    { id:'cpu-6', name:'Intel Core i5-14600K', brand:'Intel', category:'cpu', price:249, rating:4.6, reviews:2800, stock:'in_stock', tags:[], images:[], specs:{ cores:14, threads:20, baseClock:'3.5 GHz', boostClock:'5.3 GHz', socket:'LGA1700', tdp:181, cache:'24 MB', architecture:'Raptor Lake' }},
  ],
  gpu: [
    { id:'gpu-1', name:'NVIDIA RTX 4090', brand:'NVIDIA', category:'gpu', price:1599, rating:4.9, reviews:1200, stock:'low_stock', tags:['bestseller'], images:[], specs:{ vram:'24 GB GDDR6X', tdp:450, boostClock:'2520 MHz', architecture:'Ada Lovelace', ports:'3x DP, 1x HDMI', ray_tracing:'Yes' }},
    { id:'gpu-2', name:'NVIDIA RTX 4080 Super', brand:'NVIDIA', category:'gpu', price:999, rating:4.8, reviews:980, stock:'in_stock', tags:['bestseller'], images:[], specs:{ vram:'16 GB GDDR6X', tdp:320, boostClock:'2550 MHz', architecture:'Ada Lovelace', ports:'3x DP, 1x HDMI', ray_tracing:'Yes' }},
    { id:'gpu-3', name:'AMD Radeon RX 7900 XTX', brand:'AMD', category:'gpu', price:899, rating:4.7, reviews:1450, stock:'in_stock', tags:[], images:[], specs:{ vram:'24 GB GDDR6', tdp:355, boostClock:'2500 MHz', architecture:'RDNA 3', ports:'2x DP, 1x HDMI, 1x USB-C', ray_tracing:'Yes' }},
    { id:'gpu-4', name:'NVIDIA RTX 4070 Ti Super', brand:'NVIDIA', category:'gpu', price:799, rating:4.7, reviews:2100, stock:'in_stock', tags:[], images:[], specs:{ vram:'16 GB GDDR6X', tdp:285, boostClock:'2610 MHz', architecture:'Ada Lovelace', ports:'3x DP, 1x HDMI', ray_tracing:'Yes' }},
    { id:'gpu-5', name:'AMD Radeon RX 7800 XT', brand:'AMD', category:'gpu', price:449, rating:4.6, reviews:1800, stock:'in_stock', tags:[], images:[], specs:{ vram:'16 GB GDDR6', tdp:263, boostClock:'2430 MHz', architecture:'RDNA 3', ports:'2x DP, 1x HDMI', ray_tracing:'Yes' }},
    { id:'gpu-6', name:'NVIDIA RTX 4060 Ti', brand:'NVIDIA', category:'gpu', price:399, rating:4.5, reviews:3200, stock:'in_stock', tags:[], images:[], specs:{ vram:'8 GB GDDR6', tdp:160, boostClock:'2535 MHz', architecture:'Ada Lovelace', ports:'3x DP, 1x HDMI', ray_tracing:'Yes' }},
  ],
  motherboard: [
    { id:'mb-1', name:'ASUS ROG Crosshair X670E Hero', brand:'ASUS', category:'motherboard', price:699, rating:4.8, reviews:450, stock:'in_stock', tags:['bestseller'], images:[], specs:{ socket:'AM5', formFactor:'ATX', ramType:'DDR5', ramSlots:4, maxRam:'128 GB', m2Slots:4, pcie:'PCIe 5.0', wifi:'WiFi 6E' }},
    { id:'mb-2', name:'MSI MAG Z790 Tomahawk WiFi', brand:'MSI', category:'motherboard', price:289, rating:4.7, reviews:1200, stock:'in_stock', tags:[], images:[], specs:{ socket:'LGA1700', formFactor:'ATX', ramType:'DDR5', ramSlots:4, maxRam:'128 GB', m2Slots:4, pcie:'PCIe 5.0', wifi:'WiFi 6E' }},
    { id:'mb-3', name:'Gigabyte B650 AORUS Elite AX', brand:'Gigabyte', category:'motherboard', price:199, rating:4.6, reviews:890, stock:'in_stock', tags:[], images:[], specs:{ socket:'AM5', formFactor:'ATX', ramType:'DDR5', ramSlots:4, maxRam:'128 GB', m2Slots:2, pcie:'PCIe 4.0', wifi:'WiFi 6E' }},
    { id:'mb-4', name:'ASRock B760M Pro RS WiFi', brand:'ASRock', category:'motherboard', price:129, rating:4.4, reviews:560, stock:'in_stock', tags:[], images:[], specs:{ socket:'LGA1700', formFactor:'mATX', ramType:'DDR5', ramSlots:2, maxRam:'64 GB', m2Slots:2, pcie:'PCIe 4.0', wifi:'WiFi 6' }},
  ],
  ram: [
    { id:'ram-1', name:'G.Skill Trident Z5 RGB 32GB', brand:'G.Skill', category:'ram', price:129, rating:4.8, reviews:2100, stock:'in_stock', tags:['bestseller'], images:[], specs:{ capacity:'32 GB (2x16)', speed:6000, timing:'CL30', type:'DDR5', voltage:'1.35V', rgb:'Yes' }},
    { id:'ram-2', name:'Corsair Dominator Platinum 64GB', brand:'Corsair', category:'ram', price:249, rating:4.7, reviews:780, stock:'in_stock', tags:[], images:[], specs:{ capacity:'64 GB (2x32)', speed:5600, timing:'CL36', type:'DDR5', voltage:'1.25V', rgb:'Yes' }},
    { id:'ram-3', name:'Kingston Fury Beast 32GB', brand:'Kingston', category:'ram', price:89, rating:4.6, reviews:3400, stock:'in_stock', tags:[], images:[], specs:{ capacity:'32 GB (2x16)', speed:5200, timing:'CL40', type:'DDR5', voltage:'1.25V', rgb:'No' }},
    { id:'ram-4', name:'TeamGroup T-Force Delta 16GB', brand:'TeamGroup', category:'ram', price:59, rating:4.5, reviews:1900, stock:'in_stock', tags:[], images:[], specs:{ capacity:'16 GB (2x8)', speed:5600, timing:'CL36', type:'DDR5', voltage:'1.25V', rgb:'Yes' }},
  ],
  storage: [
    { id:'sto-1', name:'Samsung 990 Pro 2TB', brand:'Samsung', category:'storage', price:179, rating:4.9, reviews:5600, stock:'in_stock', tags:['bestseller'], images:[], specs:{ capacity:'2 TB', type:'NVMe SSD', interface:'PCIe 4.0 x4', read:'7450 MB/s', write:'6900 MB/s', formFactor:'M.2 2280' }},
    { id:'sto-2', name:'WD Black SN850X 1TB', brand:'Western Digital', category:'storage', price:89, rating:4.8, reviews:4200, stock:'in_stock', tags:[], images:[], specs:{ capacity:'1 TB', type:'NVMe SSD', interface:'PCIe 4.0 x4', read:'7300 MB/s', write:'6300 MB/s', formFactor:'M.2 2280' }},
    { id:'sto-3', name:'Crucial T700 2TB', brand:'Crucial', category:'storage', price:259, rating:4.7, reviews:890, stock:'in_stock', tags:[], images:[], specs:{ capacity:'2 TB', type:'NVMe SSD', interface:'PCIe 5.0 x4', read:'12400 MB/s', write:'11800 MB/s', formFactor:'M.2 2280' }},
    { id:'sto-4', name:'Seagate Barracuda 4TB', brand:'Seagate', category:'storage', price:79, rating:4.4, reviews:8900, stock:'in_stock', tags:[], images:[], specs:{ capacity:'4 TB', type:'HDD', interface:'SATA III', read:'190 MB/s', write:'190 MB/s', formFactor:'3.5"' }},
  ],
  psu: [
    { id:'psu-1', name:'Corsair RM1000x', brand:'Corsair', category:'psu', price:189, rating:4.9, reviews:3200, stock:'in_stock', tags:['bestseller'], images:[], specs:{ wattage:1000, efficiency:'80+ Gold', modular:'Full Modular', fanSize:'135mm', protection:'OVP, UVP, OCP, SCP', warranty:'10 years' }},
    { id:'psu-2', name:'Seasonic PRIME TX-850', brand:'Seasonic', category:'psu', price:249, rating:4.9, reviews:1100, stock:'in_stock', tags:[], images:[], specs:{ wattage:850, efficiency:'80+ Titanium', modular:'Full Modular', fanSize:'135mm', protection:'OVP, UVP, OCP, SCP, OTP', warranty:'12 years' }},
    { id:'psu-3', name:'EVGA SuperNOVA 750 G7', brand:'EVGA', category:'psu', price:109, rating:4.6, reviews:2400, stock:'in_stock', tags:[], images:[], specs:{ wattage:750, efficiency:'80+ Gold', modular:'Full Modular', fanSize:'130mm', protection:'OVP, UVP, OCP, SCP', warranty:'10 years' }},
    { id:'psu-4', name:'be quiet! Straight Power 12 1200W', brand:'be quiet!', category:'psu', price:279, rating:4.8, reviews:670, stock:'low_stock', tags:[], images:[], specs:{ wattage:1200, efficiency:'80+ Platinum', modular:'Full Modular', fanSize:'135mm', protection:'OVP, UVP, OCP, SCP, OTP', warranty:'10 years' }},
  ],
  cooling: [
    { id:'cool-1', name:'Noctua NH-D15 chromax.black', brand:'Noctua', category:'cooling', price:109, rating:4.9, reviews:4500, stock:'in_stock', tags:['bestseller'], images:[], specs:{ type:'Air Cooler', size:'165mm', fans:'2x 140mm', tdpRating:250, noise:'24.6 dBA', sockets:['AM5','LGA1700','AM4'] }},
    { id:'cool-2', name:'NZXT Kraken X73 RGB', brand:'NZXT', category:'cooling', price:179, rating:4.7, reviews:2100, stock:'in_stock', tags:[], images:[], specs:{ type:'AIO Liquid 360mm', size:'360mm', fans:'3x 120mm', tdpRating:350, noise:'21.0 dBA', sockets:['AM5','LGA1700','AM4'] }},
    { id:'cool-3', name:'Corsair iCUE H150i Elite', brand:'Corsair', category:'cooling', price:169, rating:4.7, reviews:1800, stock:'in_stock', tags:[], images:[], specs:{ type:'AIO Liquid 360mm', size:'360mm', fans:'3x 120mm', tdpRating:350, noise:'20.0 dBA', sockets:['AM5','LGA1700','AM4'] }},
    { id:'cool-4', name:'Arctic Freezer 34 eSports DUO', brand:'Arctic', category:'cooling', price:39, rating:4.5, reviews:6200, stock:'in_stock', tags:[], images:[], specs:{ type:'Air Cooler', size:'157mm', fans:'2x 120mm', tdpRating:210, noise:'22.5 dBA', sockets:['AM5','LGA1700','AM4'] }},
  ],
  case: [
    { id:'case-1', name:'Lian Li O11 Dynamic EVO', brand:'Lian Li', category:'case', price:169, rating:4.8, reviews:3800, stock:'in_stock', tags:['bestseller'], images:[], specs:{ formFactors:['ATX','mATX','Mini-ITX'], maxGpuLength:420, maxCpuHeight:167, fans:'Up to 10', drive_bays:'3x 2.5", 2x 3.5"', material:'Aluminum + Glass' }},
    { id:'case-2', name:'NZXT H7 Flow', brand:'NZXT', category:'case', price:129, rating:4.7, reviews:2200, stock:'in_stock', tags:[], images:[], specs:{ formFactors:['ATX','mATX','Mini-ITX'], maxGpuLength:400, maxCpuHeight:185, fans:'Up to 10', drive_bays:'3x 2.5", 2x 3.5"', material:'Steel + Glass' }},
    { id:'case-3', name:'Corsair 4000D Airflow', brand:'Corsair', category:'case', price:94, rating:4.7, reviews:8900, stock:'in_stock', tags:[], images:[], specs:{ formFactors:['ATX','mATX'], maxGpuLength:360, maxCpuHeight:170, fans:'Up to 6', drive_bays:'2x 2.5", 2x 3.5"', material:'Steel + Glass' }},
    { id:'case-4', name:'Fractal Design Torrent', brand:'Fractal Design', category:'case', price:189, rating:4.8, reviews:1400, stock:'in_stock', tags:[], images:[], specs:{ formFactors:['ATX','mATX','Mini-ITX'], maxGpuLength:461, maxCpuHeight:188, fans:'Up to 7', drive_bays:'4x 2.5", 2x 3.5"', material:'Steel + Glass' }},
  ],
};

window.PREBUILTS = [
  { id:'pre-1', name:'InShop Starter', price:899, rating:4.6, reviews:340, stock:'in_stock', tags:[], images:[], category:'prebuilt', specs:{ cpu:'Ryzen 5 7600X', gpu:'RTX 4060 Ti', ram:'16 GB DDR5', storage:'1 TB NVMe', psu:'650W Gold' }, components:['AMD Ryzen 5 7600X','NVIDIA RTX 4060 Ti','16GB DDR5','1TB NVMe SSD','650W PSU'] },
  { id:'pre-2', name:'InShop Performance', price:1599, rating:4.8, reviews:560, stock:'in_stock', tags:['bestseller'], images:[], category:'prebuilt', specs:{ cpu:'Ryzen 7 7800X3D', gpu:'RTX 4070 Ti Super', ram:'32 GB DDR5', storage:'2 TB NVMe', psu:'850W Gold' }, components:['AMD Ryzen 7 7800X3D','NVIDIA RTX 4070 Ti Super','32GB DDR5','2TB NVMe SSD','850W PSU'] },
  { id:'pre-3', name:'InShop Ultimate', price:2999, rating:4.9, reviews:180, stock:'low_stock', tags:['bestseller'], images:[], category:'prebuilt', specs:{ cpu:'Ryzen 9 7950X', gpu:'RTX 4090', ram:'64 GB DDR5', storage:'4 TB NVMe', psu:'1200W Platinum' }, components:['AMD Ryzen 9 7950X','NVIDIA RTX 4090','64GB DDR5','4TB NVMe SSD','1200W PSU'] },
];

window.PERIPHERALS_DATA = {
  keyboard: [
    { id:'kb-1', name:'Corsair K100 RGB', brand:'Corsair', category:'keyboard', price:229, rating:4.8, reviews:1200, stock:'in_stock', tags:['bestseller'], images:[], specs:{ type:'Mechanical', switches:'OPX', backlight:'RGB', layout:'Full Size', connectivity:'Wired + Wireless' }},
    { id:'kb-2', name:'Logitech G Pro X', brand:'Logitech', category:'keyboard', price:149, rating:4.7, reviews:2400, stock:'in_stock', tags:[], images:[], specs:{ type:'Mechanical', switches:'GX Blue', backlight:'RGB', layout:'TKL', connectivity:'Wired' }},
  ],
  mouse: [
    { id:'ms-1', name:'Logitech G Pro X Superlight 2', brand:'Logitech', category:'mouse', price:159, rating:4.9, reviews:3400, stock:'in_stock', tags:['bestseller'], images:[], specs:{ sensor:'HERO 2', dpi:32000, weight:'60g', buttons:5, connectivity:'Wireless' }},
    { id:'ms-2', name:'Razer DeathAdder V3 Pro', brand:'Razer', category:'mouse', price:149, rating:4.8, reviews:2100, stock:'in_stock', tags:[], images:[], specs:{ sensor:'Focus Pro 30K', dpi:30000, weight:'63g', buttons:5, connectivity:'Wireless' }},
  ],
  microphone: [
    { id:'mic-1', name:'Blue Yeti X', brand:'Blue', category:'microphone', price:149, rating:4.6, reviews:890, stock:'in_stock', tags:[], images:[], specs:{ type:'Condenser', pattern:'Multi', sampleRate:'48 kHz/24-bit', connectivity:'USB' }},
  ],
  webcam: [
    { id:'wc-1', name:'Logitech C920 HD Pro', brand:'Logitech', category:'webcam', price:79, rating:4.5, reviews:12000, stock:'in_stock', tags:[], images:[], specs:{ resolution:'1080p', fps:30, fov:'78°', autofocus:'Yes' }},
  ],
  monitor: [
    { id:'mon-1', name:'LG 27GP850-B UltraGear', brand:'LG', category:'monitor', price:399, rating:4.8, reviews:2300, stock:'in_stock', tags:['bestseller'], images:[], specs:{ size:'27"', resolution:'2560x1440', refreshRate:'165 Hz', panel:'Nano IPS', responseTime:'1ms', hdr:'HDR400' }},
    { id:'mon-2', name:'Samsung Odyssey G7 32"', brand:'Samsung', category:'monitor', price:549, rating:4.7, reviews:1800, stock:'in_stock', tags:[], images:[], specs:{ size:'32"', resolution:'2560x1440', refreshRate:'240 Hz', panel:'VA', responseTime:'1ms', hdr:'HDR600' }},
  ],
  speaker: [
    { id:'spk-1', name:'Creative Pebble V3', brand:'Creative', category:'speaker', price:39, rating:4.4, reviews:5600, stock:'in_stock', tags:[], images:[], specs:{ type:'2.0', power:'16W', connectivity:'USB-C + Bluetooth 5.0' }},
  ],
  headset: [
    { id:'hs-1', name:'SteelSeries Arctis Nova Pro', brand:'SteelSeries', category:'headset', price:349, rating:4.8, reviews:1400, stock:'in_stock', tags:['bestseller'], images:[], specs:{ type:'Over-ear', driver:'40mm', anc:'Yes', connectivity:'Wireless', battery:'22h' }},
    { id:'hs-2', name:'HyperX Cloud III', brand:'HyperX', category:'headset', price:99, rating:4.6, reviews:3200, stock:'in_stock', tags:[], images:[], specs:{ type:'Over-ear', driver:'53mm', anc:'No', connectivity:'Wired', impedance:'32 Ohm' }},
  ],
  usb: [],
  external_hdd: [],
  network: [],
};

window.ALL_PRODUCTS = [
  ...Object.values(window.CATALOG).flat(),
  ...Object.values(window.PERIPHERALS_DATA).flat(),
];

// ── Compatibilité ────────────────────────────────────────────────────────────
window.checkCompatibility = (build) => {
  const issues = [];
  const warnings = [];
  const { cpu, motherboard, ram, psu, cooling } = build;
  if (cpu && motherboard) {
    if (cpu.specs.socket !== motherboard.specs.socket)
      issues.push(`CPU socket (${cpu.specs.socket}) ne correspond pas à la carte mère (${motherboard.specs.socket})`);
  }
  if (cpu && cooling) {
    if (cooling.specs.sockets && !cooling.specs.sockets.includes(cpu.specs.socket))
      issues.push(`Le refroidissement ne supporte pas le socket ${cpu.specs.socket}`);
    if (cooling.specs.tdpRating && cpu.specs.tdp && cooling.specs.tdpRating < cpu.specs.tdp)
      warnings.push(`TDP CPU (${cpu.specs.tdp}W) dépasse la capacité du refroidissement (${cooling.specs.tdpRating}W)`);
  }
  if (psu && (cpu || build.gpu)) {
    const totalTdp = (cpu?.specs.tdp || 0) + (build.gpu?.specs.tdp || 0) + 60;
    if (psu.specs.wattage && psu.specs.wattage < totalTdp * 1.2)
      warnings.push(`Alimentation (${psu.specs.wattage}W) insuffisante (~${totalTdp}W nécessaires)`);
  }
  return { issues, warnings, ok: issues.length === 0 };
};

window.calcBuildScore = (build) => {
  let score = 0, weight = 0;
  if (build.cpu?.specs?.cores)  { score += Math.min(build.cpu.specs.cores / 16, 1) * 30; weight += 30; }
  if (build.gpu?.price)         { score += Math.min(build.gpu.price / 2000, 1) * 50;      weight += 50; }
  if (build.ram?.specs?.speed)  { score += Math.min(build.ram.specs.speed / 7000, 1) * 20; weight += 20; }
  return weight > 0 ? Math.round(score / weight * 100) : 0;
};

window.calcBuildTotal = (build) => {
  return Object.values(build).reduce((s, p) => s + (p?.price || 0), 0);
};
