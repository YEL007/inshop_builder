// InShop Builder — Catalog Engine + Compatibility Engine
// Produits chargés exclusivement depuis Odoo via api.js (bootstrap).
// Ces objets sont initialisés vides et remplis par l'API au démarrage.

window.CATALOG = {
  cpu: [], gpu: [], motherboard: [], ram: [],
  storage: [], psu: [], cooling: [], case: [],
};

window.PREBUILTS = [];
window.ONLYONEPCS = [];
window.LAPTOPS = [];

window.PERIPHERALS_DATA = {
  keyboard: [], mouse: [], microphone: [], webcam: [],
  monitor: [], speaker: [], headset: [],
  usb: [], external_hdd: [], network: [],
};

window.ALL_PRODUCTS = [];

// ── Helpers internes ─────────────────────────────────────────────────────────
const _norm = (v) => String(v || '').trim().toUpperCase();
const _int  = (v) => v !== undefined && v !== null && v !== '' ? parseInt(v) : null;

// ── Règles de compatibilité ──────────────────────────────────────────────────
//  Chaque règle retourne null (OK) ou { code, msg, pair[], severity }
//  severity: 'error' = bloquant (rouge) | 'warning' = recommandation (orange)

const COMPAT_RULES = [

  // 1. Socket CPU ↔ Carte mère
  ({ cpu, motherboard }) => {
    if (!cpu || !motherboard) return null;
    const a = _norm(cpu.specs.socket), b = _norm(motherboard.specs.socket);
    if (!a || !b || a === b) return null;
    return { code:'CPU_MB_SOCKET', severity:'error', pair:['cpu','motherboard'],
      msg:`Socket CPU (${cpu.specs.socket}) ≠ carte mère (${motherboard.specs.socket})` };
  },

  // 2. RAM DDR type ↔ Carte mère
  ({ ram, motherboard }) => {
    if (!ram || !motherboard) return null;
    const a = _norm(ram.specs.type), b = _norm(motherboard.specs.ramType);
    if (!a || !b || a === b) return null;
    return { code:'RAM_MB_DDR', severity:'error', pair:['ram','motherboard'],
      msg:`RAM ${ram.specs.type} incompatible avec carte mère (${motherboard.specs.ramType})` };
  },

  // 3. RAM modules > slots disponibles
  ({ ram, motherboard }) => {
    if (!ram || !motherboard) return null;
    const slots   = _int(motherboard.specs.ramSlots);
    const modules = _int(ram.specs.modules);
    if (!slots || !modules || modules <= slots) return null;
    return { code:'RAM_SLOTS', severity:'error', pair:['ram','motherboard'],
      msg:`RAM a ${ram.specs.modules} barrettes mais la carte mère n'a que ${motherboard.specs.ramSlots} slots` };
  },

  // 4. Refroidissement socket ↔ CPU socket
  ({ cooling, cpu }) => {
    if (!cooling || !cpu) return null;
    const cpuSock  = _norm(cpu.specs.socket);
    const suppList = (cooling.specs.sockets || []).map(_norm);
    if (!cpuSock || suppList.length === 0) return null;
    if (suppList.includes(cpuSock)) return null;
    return { code:'COOL_CPU_SOCKET', severity:'error', pair:['cooling','cpu'],
      msg:`Refroidissement ne supporte pas socket ${cpu.specs.socket} (supporte : ${(cooling.specs.sockets||[]).join(', ')})` };
  },

  // 5. Refroidissement TDP ↔ CPU TDP (warning)
  ({ cooling, cpu }) => {
    if (!cooling || !cpu) return null;
    const coolerTdp = _int(cooling.specs.tdpRating);
    const cpuTdp    = _int(cpu.specs.tdp);
    if (!coolerTdp || !cpuTdp || coolerTdp >= cpuTdp) return null;
    return { code:'COOL_CPU_TDP', severity:'warning', pair:['cooling','cpu'],
      msg:`Refroidissement (${cooling.specs.tdpRating}W) insuffisant pour CPU (${cpu.specs.tdp}W TDP)` };
  },

  // 6. Refroidissement hauteur ↔ Boîtier maxCoolerHeight
  ({ cooling, case: pc_case }) => {
    if (!cooling || !pc_case) return null;
    const maxH    = _int(pc_case.specs.maxCoolerHeight);
    const coolerH = _int(cooling.specs.height);
    if (!maxH || !coolerH || coolerH <= maxH) return null;
    return { code:'COOL_CASE_HEIGHT', severity:'error', pair:['cooling','case'],
      msg:`Ventirad trop haut (${cooling.specs.height}mm) — max boîtier : ${pc_case.specs.maxCoolerHeight}mm` };
  },

  // 7. Alimentation puissance (erreur si < consommation, warning si < marge 25%)
  ({ psu, cpu, gpu }) => {
    if (!psu || (!cpu && !gpu)) return null;
    const psuWatt  = _int(psu.specs.wattage);
    if (!psuWatt) return null;
    const cpuTdp   = _int(cpu?.specs?.tdp)  || 0;
    const gpuTdp   = _int(gpu?.specs?.tdp)  || 0;
    const totalTdp = cpuTdp + gpuTdp + 50;
    const safeWatt = Math.ceil(totalTdp * 1.25);
    if (psuWatt < totalTdp)
      return { code:'PSU_TOO_LOW', severity:'error', pair:['psu'],
        msg:`Alimentation ${psu.specs.wattage}W insuffisante — consommation estimée ~${totalTdp}W` };
    if (psuWatt < safeWatt)
      return { code:'PSU_LOW_MARGIN', severity:'warning', pair:['psu'],
        msg:`Alimentation ${psu.specs.wattage}W — recommandé ~${safeWatt}W (marge 25%)` };
    return null;
  },

  // 8. Format carte mère ↔ Boîtier
  ({ case: pc_case, motherboard }) => {
    if (!pc_case || !motherboard) return null;
    const mbForm  = _norm(motherboard.specs.formFactor);
    const suppRaw = pc_case.specs.formFactors || pc_case.specs.supportedMB || [];
    const supp    = suppRaw.map(_norm);
    if (!mbForm || supp.length === 0) return null;
    if (supp.includes(mbForm)) return null;
    return { code:'CASE_MB_FORM', severity:'error', pair:['case','motherboard'],
      msg:`Boîtier ne supporte pas format ${motherboard.specs.formFactor} (supporte : ${suppRaw.join(', ')})` };
  },

  // 9. GPU longueur ↔ Boîtier longueur max GPU
  ({ gpu, case: pc_case }) => {
    if (!gpu || !pc_case) return null;
    const maxLen = _int(pc_case.specs.maxGpuLength);
    const gpuLen = _int(gpu.specs.length);
    if (!maxLen || !gpuLen || gpuLen <= maxLen) return null;
    return { code:'GPU_CASE_LENGTH', severity:'error', pair:['gpu','case'],
      msg:`GPU trop long (${gpu.specs.length}mm) — max boîtier : ${pc_case.specs.maxGpuLength}mm` };
  },

  // 10. Stockage NVMe ↔ Slots M.2 carte mère
  ({ storage, motherboard }) => {
    if (!storage || !motherboard) return null;
    const storType = _norm(storage.specs.type);
    const m2slots  = _int(motherboard.specs.m2Slots);
    if (!storType.includes('NVME')) return null;
    if (m2slots === null || m2slots > 0) return null;
    return { code:'STORAGE_NO_M2', severity:'error', pair:['storage','motherboard'],
      msg:`Carte mère sans slot M.2 NVMe — choisissez un SSD SATA ou une autre carte mère` };
  },
];

// ── checkCompatibility : analyse complète du build ──────────────────────────
window.checkCompatibility = (build) => {
  const issues   = [];
  const warnings = [];
  for (const rule of COMPAT_RULES) {
    const result = rule(build);
    if (!result) continue;
    if (result.severity === 'error')   issues.push(result);
    else                               warnings.push(result);
  }
  return { issues, warnings, ok: issues.length === 0 };
};

// ── getCompatNote : vérifie un produit candidat vs le build en cours ─────────
//  Retourne { ok, warning, msg }
window.getCompatNote = (stepKey, product, build) => {
  const tempBuild = { ...build, [stepKey]: product };
  const { issues, warnings } = window.checkCompatibility(tempBuild);

  const relIssues = issues.filter(i => i.pair && i.pair.includes(stepKey));
  if (relIssues.length > 0) return { ok: false, warning: false, msg: relIssues[0].msg };

  const relWarns = warnings.filter(w => w.pair && w.pair.includes(stepKey));
  if (relWarns.length > 0) return { ok: true, warning: true, msg: relWarns[0].msg };

  return { ok: true, warning: false, msg: null };
};

// ── calcBuildScore ───────────────────────────────────────────────────────────
window.calcBuildScore = (build) => {
  let score = 0, weight = 0;
  if (build.cpu?.specs?.cores)  { score += Math.min(build.cpu.specs.cores / 16, 1) * 30; weight += 30; }
  if (build.gpu?.price)         { score += Math.min(build.gpu.price / 2000, 1) * 50;      weight += 50; }
  if (build.ram?.specs?.speed)  { score += Math.min(build.ram.specs.speed / 7000, 1) * 20; weight += 20; }
  return weight > 0 ? Math.round(score / weight * 100) : 0;
};

// ── calcBuildTotal ───────────────────────────────────────────────────────────
window.calcBuildTotal = (build) => {
  return Object.values(build).reduce((s, p) => s + (p?.price || 0), 0);
};
