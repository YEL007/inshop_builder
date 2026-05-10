// InShop Builder — Catalog Engine
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

// ── Compatibilité (résumé final du build complet) ────────────────────────────
window.checkCompatibility = (build) => {
  const issues = [];
  const warnings = [];
  const { cpu, motherboard, ram, gpu, psu, cooling, case: pc_case } = build;

  // Socket CPU ↔ Carte mère
  if (cpu && motherboard) {
    if (cpu.specs.socket !== motherboard.specs.socket)
      issues.push(`Socket CPU (${cpu.specs.socket}) incompatible avec la carte mère (${motherboard.specs.socket})`);
  }

  // RAM ↔ Carte mère : type DDR
  if (ram && motherboard?.specs.ramType) {
    if (ram.specs.type && ram.specs.type !== motherboard.specs.ramType)
      issues.push(`RAM ${ram.specs.type} incompatible avec la carte mère (${motherboard.specs.ramType})`);
  }

  // Refroidissement ↔ CPU : socket
  if (cooling && cpu) {
    if (cooling.specs.sockets && !cooling.specs.sockets.includes(cpu.specs.socket))
      issues.push(`Le refroidissement ne supporte pas le socket ${cpu.specs.socket}`);
  }

  // Refroidissement ↔ CPU : TDP
  if (cooling && cpu) {
    if (cooling.specs.tdpRating && cpu.specs.tdp && cooling.specs.tdpRating < cpu.specs.tdp)
      warnings.push(`Refroidissement (${cooling.specs.tdpRating}W) insuffisant pour le CPU (${cpu.specs.tdp}W TDP)`);
  }

  // Alimentation ↔ CPU + GPU : puissance
  if (psu && (cpu || gpu)) {
    const totalTdp = (cpu?.specs.tdp || 0) + (gpu?.specs.tdp || 0) + 50;
    const minWatt = Math.ceil(totalTdp * 1.2);
    if (psu.specs.wattage && psu.specs.wattage < minWatt)
      warnings.push(`Alimentation (${psu.specs.wattage}W) insuffisante — minimum ~${minWatt}W recommandé`);
  }

  // Boîtier ↔ Carte mère : format
  if (pc_case && motherboard?.specs.formFactor) {
    if (pc_case.specs.supportedMB && !pc_case.specs.supportedMB.includes(motherboard.specs.formFactor))
      issues.push(`Le boîtier ne supporte pas le format ${motherboard.specs.formFactor}`);
  }

  // Boîtier ↔ Refroidissement : hauteur ventirad
  if (pc_case && cooling?.specs.height) {
    const maxH = parseInt(pc_case.specs.maxCoolerHeight);
    const coolerH = parseInt(cooling.specs.height);
    if (coolerH && maxH && coolerH > maxH)
      issues.push(`Le ventirad (${cooling.specs.height}) dépasse la hauteur max du boîtier (${pc_case.specs.maxCoolerHeight})`);
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
