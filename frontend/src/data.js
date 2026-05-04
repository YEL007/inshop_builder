// InShop Builder — Catalog Engine
// Produits chargés exclusivement depuis Odoo via api.js (bootstrap).
// Ces objets sont initialisés vides et remplis par l'API au démarrage.

window.CATALOG = {
  cpu: [], gpu: [], motherboard: [], ram: [],
  storage: [], psu: [], cooling: [], case: [],
};

window.PREBUILTS = [];

window.PERIPHERALS_DATA = {
  keyboard: [], mouse: [], microphone: [], webcam: [],
  monitor: [], speaker: [], headset: [],
  usb: [], external_hdd: [], network: [],
};

window.ALL_PRODUCTS = [];

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
