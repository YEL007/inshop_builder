// Mock data for INSHOP BUILDER admin prototype
window.MOCK = (function () {
  const now = new Date('2026-05-12T14:32:00');
  const ago = (mins) => new Date(now.getTime() - mins * 60000);
  const fmtDate = (d) =>
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const categories = [
    { id: 1, sequence: 10, name: 'Processeurs', code: 'CPU', type: 'Composant interne', peri_group: '—', icon: 'cpu', active: true, products: 42 },
    { id: 2, sequence: 20, name: 'Cartes graphiques', code: 'GPU', type: 'Composant interne', peri_group: '—', icon: 'gpu', active: true, products: 38 },
    { id: 3, sequence: 30, name: 'Mémoire RAM', code: 'RAM', type: 'Composant interne', peri_group: '—', icon: 'memory', active: true, products: 56 },
    { id: 4, sequence: 40, name: 'Stockage SSD', code: 'SSD', type: 'Composant interne', peri_group: '—', icon: 'ssd', active: true, products: 71 },
    { id: 5, sequence: 50, name: 'Cartes mères', code: 'MOBO', type: 'Composant interne', peri_group: '—', icon: 'board', active: true, products: 29 },
    { id: 6, sequence: 60, name: 'Alimentations', code: 'PSU', type: 'Composant interne', peri_group: '—', icon: 'psu', active: true, products: 24 },
    { id: 7, sequence: 70, name: 'Boîtiers', code: 'CASE', type: 'Composant interne', peri_group: '—', icon: 'case', active: true, products: 33 },
    { id: 8, sequence: 80, name: 'Refroidissement', code: 'COOL', type: 'Composant interne', peri_group: '—', icon: 'fan', active: true, products: 47 },
    { id: 9, sequence: 90, name: 'Écrans', code: 'SCREEN', type: 'Périphérique', peri_group: 'Affichage', icon: 'monitor', active: true, products: 31 },
    { id: 10, sequence: 100, name: 'Claviers', code: 'KB', type: 'Périphérique', peri_group: 'Saisie', icon: 'keyboard', active: true, products: 22 },
    { id: 11, sequence: 110, name: 'Souris', code: 'MOUSE', type: 'Périphérique', peri_group: 'Saisie', icon: 'mouse', active: true, products: 19 },
    { id: 12, sequence: 120, name: 'Casques audio', code: 'HEAD', type: 'Périphérique', peri_group: 'Audio', icon: 'head', active: false, products: 14 },
    { id: 13, sequence: 130, name: 'Portables Gaming', code: 'LAP-G', type: 'Ordinateur portable', peri_group: '—', icon: 'laptop', active: true, products: 18 },
    { id: 14, sequence: 140, name: 'Portables Pro', code: 'LAP-P', type: 'Ordinateur portable', peri_group: '—', icon: 'laptop', active: true, products: 12 },
  ];

  const products = [
    { id: 'PRD-2841', name: 'AMD Ryzen 9 7950X', category: 'Processeurs', price: 549.00, stock: 23, status: 'En stock', updated: ago(15) },
    { id: 'PRD-2840', name: 'NVIDIA RTX 5080 Founders Edition', category: 'Cartes graphiques', price: 1199.00, stock: 4, status: 'Stock faible', updated: ago(42) },
    { id: 'PRD-2839', name: 'Corsair Vengeance 32GB DDR5-6000', category: 'Mémoire RAM', price: 159.90, stock: 87, status: 'En stock', updated: ago(94) },
    { id: 'PRD-2838', name: 'Samsung 990 Pro 2TB NVMe', category: 'Stockage SSD', price: 189.00, stock: 0, status: 'Rupture', updated: ago(180) },
    { id: 'PRD-2837', name: 'ASUS ROG Strix X670E-E', category: 'Cartes mères', price: 489.00, stock: 11, status: 'En stock', updated: ago(220) },
    { id: 'PRD-2836', name: 'Lian Li O11 Dynamic EVO', category: 'Boîtiers', price: 169.00, stock: 6, status: 'Stock faible', updated: ago(310) },
    { id: 'PRD-2835', name: 'Noctua NH-D15 chromax.black', category: 'Refroidissement', price: 109.90, stock: 32, status: 'En stock', updated: ago(420) },
    { id: 'PRD-2834', name: 'LG 27GP950-B 4K 144Hz', category: 'Écrans', price: 729.00, stock: 8, status: 'En stock', updated: ago(540) },
    { id: 'PRD-2833', name: 'Logitech MX Master 3S', category: 'Souris', price: 99.99, stock: 41, status: 'En stock', updated: ago(720) },
    { id: 'PRD-2832', name: 'Keychron Q1 Pro Hot-swappable', category: 'Claviers', price: 199.00, stock: 17, status: 'En stock', updated: ago(900) },
    { id: 'PRD-2831', name: 'Seasonic Prime TX-1000', category: 'Alimentations', price: 289.00, stock: 9, status: 'En stock', updated: ago(1100) },
    { id: 'PRD-2830', name: 'WD Black SN850X 4TB', category: 'Stockage SSD', price: 349.00, stock: 14, status: 'En stock', updated: ago(1380) },
  ];

  const orders = [
    { id: '#10428', client: 'Lucas Bertrand', email: 'l.bertrand@gmail.com', total: 2649.90, items: 4, status: 'Payée', method: 'CB', created: ago(8) },
    { id: '#10427', client: 'Sofia Marchetti', email: 'sofia.m@outlook.fr', total: 1199.00, items: 1, status: 'Expédiée', method: 'CB', created: ago(34) },
    { id: '#10426', client: 'Karim Benali', email: 'karim.benali@yahoo.fr', total: 489.00, items: 1, status: 'Payée', method: 'PayPal', created: ago(67) },
    { id: '#10425', client: 'Emma Lefèvre', email: 'emma.lf@protonmail.com', total: 3289.50, items: 7, status: 'En préparation', method: 'CB', created: ago(120) },
    { id: '#10424', client: 'Hugo Tremblay', email: 'h.tremblay@gmail.com', total: 159.90, items: 1, status: 'Livrée', method: 'CB', created: ago(220) },
    { id: '#10423', client: 'Inès Moreau', email: 'ines.moreau@free.fr', total: 729.00, items: 1, status: 'Annulée', method: 'CB', created: ago(310) },
    { id: '#10422', client: 'Théo Garnier', email: 'theo.g@gmail.com', total: 5849.00, items: 1, status: 'Livrée', method: 'Virement', created: ago(460) },
    { id: '#10421', client: 'Naya Diallo', email: 'n.diallo@hotmail.fr', total: 99.99, items: 1, status: 'Livrée', method: 'CB', created: ago(720) },
    { id: '#10420', client: 'Maxime Faure', email: 'm.faure@laposte.net', total: 1888.00, items: 3, status: 'Remboursée', method: 'CB', created: ago(1100) },
    { id: '#10419', client: 'Léa Vidal', email: 'lea.vidal@gmail.com', total: 289.00, items: 1, status: 'Livrée', method: 'PayPal', created: ago(1500) },
  ];

  const prebuilts = [
    { id: 'PB-014', name: 'Forge Starter R5', tier: 'Entrée de gamme', price: 899, cpu: 'Ryzen 5 7600', gpu: 'RTX 4060', stock: 12, active: true },
    { id: 'PB-013', name: 'Forge Mid Tower R7', tier: 'Performance', price: 1599, cpu: 'Ryzen 7 7800X3D', gpu: 'RTX 4070 Super', stock: 8, active: true },
    { id: 'PB-012', name: 'Forge Pro X9', tier: 'Haut de gamme', price: 2799, cpu: 'Ryzen 9 7900X', gpu: 'RTX 4080 Super', stock: 5, active: true },
    { id: 'PB-011', name: 'Forge Elite Titan', tier: 'Premium', price: 4499, cpu: 'Ryzen 9 7950X3D', gpu: 'RTX 5090', stock: 3, active: true },
    { id: 'PB-010', name: 'Forge Compact Mini', tier: 'Entrée de gamme', price: 1099, cpu: 'Ryzen 5 8600G', gpu: 'iGPU', stock: 18, active: false },
    { id: 'PB-009', name: 'Forge Creator Studio', tier: 'Performance', price: 2199, cpu: 'Intel Core Ultra 9', gpu: 'RTX 4070 Ti', stock: 6, active: true },
  ];

  const onlyOne = [
    { id: 'ONE-007', name: 'Build « Nebula » — RTX 5090 watercooled', price: 6890, sold: false, owner: '—', created: ago(2400) },
    { id: 'ONE-006', name: 'Build « Onyx » — Threadripper Pro', price: 8990, sold: false, owner: '—', created: ago(4200) },
    { id: 'ONE-005', name: 'Build « Aurora » — Dual GPU édition', price: 12990, sold: true, owner: 'L. Bertrand', created: ago(10800) },
    { id: 'ONE-004', name: 'Build « Phoenix » — Custom loop RGB', price: 5290, sold: true, owner: 'E. Lefèvre', created: ago(20000) },
  ];

  const reviews = [
    { id: 1, product: 'AMD Ryzen 9 7950X', author: 'Lucas B.', rating: 5, content: 'Performances exceptionnelles, parfait pour mon usage 3D.', published: true, created: ago(60) },
    { id: 2, product: 'NVIDIA RTX 5080 FE', author: 'Sofia M.', rating: 4, content: 'Très bonne carte mais bruyante en charge.', published: true, created: ago(140) },
    { id: 3, product: 'Lian Li O11 Dynamic', author: 'Karim B.', rating: 5, content: 'Le boîtier le plus beau que j\'aie monté.', published: true, created: ago(280) },
    { id: 4, product: 'Logitech MX Master 3S', author: 'Emma L.', rating: 3, content: 'Bonne souris mais trop chère pour ce qu\'elle propose.', published: false, created: ago(380) },
    { id: 5, product: 'Samsung 990 Pro 2TB', author: 'Hugo T.', rating: 5, content: 'Vitesse de fou. Aucun regret.', published: true, created: ago(520) },
    { id: 6, product: 'Keychron Q1 Pro', author: 'Inès M.', rating: 2, content: 'Reçu défectueux, support client lent à réagir.', published: false, created: ago(720) },
  ];

  const contacts = [
    { id: 1, name: 'Antoine Rocher', email: 'antoine.r@gmail.com', subject: 'Question sur la garantie RTX 5080', read: false, created: ago(12) },
    { id: 2, name: 'Camille Dupré', email: 'c.dupre@outlook.fr', subject: 'Compatibilité CPU/Carte mère', read: false, created: ago(45) },
    { id: 3, name: 'Yanis Boucher', email: 'yanis.b@yahoo.fr', subject: 'Délai de livraison commande #10422', read: true, created: ago(180) },
    { id: 4, name: 'Mathilde Olivier', email: 'mathilde.o@free.fr', subject: 'Demande de devis pour 5 PCs', read: true, created: ago(420) },
    { id: 5, name: 'Sébastien Lambert', email: 's.lambert@gmail.com', subject: 'Problème connexion site', read: true, created: ago(900) },
  ];

  const users = [
    { id: 1, username: 'admin', email: 'admin@inshop.fr', role: 'Super-admin', last_login: ago(5), active: true },
    { id: 2, username: 'marie.dupont', email: 'm.dupont@inshop.fr', role: 'Gestionnaire', last_login: ago(120), active: true },
    { id: 3, username: 'paul.martin', email: 'p.martin@inshop.fr', role: 'Vendeur', last_login: ago(380), active: true },
    { id: 4, username: 'sophie.chen', email: 's.chen@inshop.fr', role: 'Support', last_login: ago(820), active: true },
    { id: 5, username: 'old.account', email: 'old@inshop.fr', role: 'Vendeur', last_login: ago(80000), active: false },
  ];

  const groups = [
    { id: 1, name: 'Administrateurs', members: 1, permissions: 124 },
    { id: 2, name: 'Gestionnaires', members: 3, permissions: 86 },
    { id: 3, name: 'Vendeurs', members: 5, permissions: 32 },
    { id: 4, name: 'Support client', members: 2, permissions: 18 },
  ];

  const recentActions = [
    { who: 'admin', verb: 'a modifié', what: 'Product · AMD Ryzen 9 7950X', kind: 'edit', when: ago(15) },
    { who: 'marie.dupont', verb: 'a ajouté', what: 'Prebuilt · Forge Elite Titan', kind: 'add', when: ago(94) },
    { who: 'admin', verb: 'a supprimé', what: 'Review #38 (spam)', kind: 'delete', when: ago(180) },
    { who: 'paul.martin', verb: 'a modifié', what: 'Order #10425 → En préparation', kind: 'edit', when: ago(310) },
    { who: 'admin', verb: 'a ajouté', what: 'Category · Refroidissement', kind: 'add', when: ago(720) },
    { who: 'sophie.chen', verb: 'a répondu à', what: 'Contact message #847', kind: 'edit', when: ago(1100) },
  ];

  // 14-day revenue sparkline
  const revenueSeries = [3200, 4100, 3850, 5200, 4900, 6100, 7300, 5800, 6400, 7900, 8200, 7100, 9400, 8650];

  return {
    fmtDate, ago, now,
    categories, products, orders, prebuilts, onlyOne, reviews, contacts, users, groups,
    recentActions, revenueSeries,
    stats: {
      revenue: { value: 84260, delta: +12.4, label: 'Revenu (30j)' },
      orders: { value: 428, delta: +8.2, label: 'Commandes (30j)' },
      products: { value: 463, delta: +3, label: 'Produits actifs' },
      users: { value: 2841, delta: +5.8, label: 'Utilisateurs' },
    },
    models: [
      { app: 'Catalogue', items: [
        { key: 'components',  label: 'Composants PC',  icon: 'cpu',    count: 0, addable: true },
        { key: 'prebuilts',   label: 'PC Pré-montés',  icon: 'box',    count: 0, addable: true },
        { key: 'onlyone',     label: 'Only One PCs',   icon: 'gem',    count: 0, addable: true },
        { key: 'laptops',     label: 'PC Portables',   icon: 'laptop', count: 0, addable: true },
        { key: 'peripherals', label: 'Périphériques',  icon: 'mouse',  count: 0, addable: true },
        { key: 'categories',  label: 'Catégories',     icon: 'tag',    count: 0, addable: true },
      ]},
      { app: 'Commandes & Clients', items: [
        { key: 'orders',   label: 'Commandes',    icon: 'cart', count: 0 },
        { key: 'reviews',  label: 'Avis clients', icon: 'star', count: 0 },
        { key: 'contacts', label: 'Messages',     icon: 'mail', count: 0, badge: 2 },
      ]},
      { app: 'Administration', items: [
        { key: 'users',      label: 'Utilisateurs',  icon: 'user',   count: 0, addable: true },
        { key: 'groups',     label: 'Groupes',       icon: 'shield', count: 0 },
        { key: 'siteconfig', label: 'Configuration', icon: 'gear',   count: 0 },
      ]},
    ],
  };
})();
