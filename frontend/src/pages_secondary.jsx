import React from "react";

const ImageCarousel = window.ImageCarousel;
const ProductVisual = window.ProductVisual;
const ProductCard = window.ProductCard;

// pages_secondary.jsx — Pre-Built, Peripherals, Cart, User Space

// ─── PRE-BUILT PCs ───────────────────────────────────────────────────────────
const PrebuiltPage = () => {
  const { setPage, addToCart, t, formatPrice } = React.useContext(window.AppContext);
  const tierColors = { Budget: '#888888', 'Mid-Range': '#909090', 'High-End': '#333333', Flagship: '#ffffff' };

  return (
    <div style={secStyles.page}>
      <div style={secStyles.pageHeader}>
        <div style={secStyles.headerEye}>READY TO SHIP</div>
        <h1 style={secStyles.pageTitle}>Pre-Built PCs</h1>
        <p style={secStyles.pageDesc}>Professionally assembled, tested, and ready to go.</p>
      </div>

      <div style={secStyles.pbGrid}>
        {window.PREBUILTS.map(pc => {
          const color = tierColors[pc.tier] || '#e8001d';
          return (
            <div key={pc.id} style={{ ...secStyles.pbCard, cursor:'pointer' }}
              onClick={() => setPage('prebuilt-detail', { product: pc })}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#3c3c3c'; e.currentTarget.style.transform = 'none'; }}>
              {pc.badge && <div style={{ ...secStyles.pbBadge, background: color + '20', color }}>{pc.badge}</div>}
              {/* Visual */}
              <div style={{ ...secStyles.pbVisual, background: `linear-gradient(135deg, ${color}10, #242424)` }}>
                <svg width="120" height="160" viewBox="0 0 120 160" fill="none">
                  <rect x="20" y="10" width="80" height="140" rx="8" fill="#242424" stroke={color} strokeWidth="1" />
                  <rect x="28" y="20" width="64" height="40" rx="4" fill="#2a2a2a" />
                  <circle cx="50" cy="40" r="14" fill="none" stroke={color} strokeWidth="0.8" />
                  <circle cx="50" cy="40" r="6" fill={color} opacity="0.3" />
                  {[0, 60, 120, 180, 240, 300].map(a => { const r = a * Math.PI / 180; return <line key={a} x1={50 + 7 * Math.cos(r)} y1={40 + 7 * Math.sin(r)} x2={50 + 13 * Math.cos(r)} y2={40 + 13 * Math.sin(r)} stroke={color} strokeWidth="0.8" opacity="0.5" /> })}
                  <circle cx="80" cy="40" r="12" fill="none" stroke={color} strokeWidth="0.8" />
                  <circle cx="80" cy="40" r="5" fill={color} opacity="0.3" />
                  <rect x="28" y="72" width="64" height="14" rx="3" fill="#2a2a2a" stroke={color} strokeWidth="0.5" />
                  <rect x="30" y="75" width="20" height="8" rx="1" fill={color} opacity="0.15" />
                  <rect x="34" y="90" width="20" height="8" rx="2" fill="#444444" opacity="0.3" />
                  <rect x="58" y="90" width="20" height="8" rx="2" fill="#444444" opacity="0.3" />
                  <rect x="20" y="100" width="5" height="40" rx="2" fill={color} opacity="0.5" />
                  <circle cx="95" cy="140" r="7" fill="none" stroke={color} strokeWidth="1" />
                  <circle cx="95" cy="140" r="3" fill={color} opacity="0.4" />
                  <rect x="28" y="136" width="10" height="6" rx="1" fill="#2a2a2a" stroke="#9f9f9f" strokeWidth="0.5" />
                  <rect x="42" y="136" width="10" height="6" rx="1" fill="#2a2a2a" stroke="#9f9f9f" strokeWidth="0.5" />
                </svg>
              </div>

              <div style={secStyles.pbBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ ...secStyles.pbTier, color }}>{pc.tier.toUpperCase()}</div>
                    <div style={secStyles.pbName}>{pc.name}</div>
                  </div>
                  <div style={secStyles.pbPrice}>{formatPrice(pc.price)}</div>
                </div>


                <div style={secStyles.pbPerf}>
                  <div style={secStyles.pbPerfItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    <span style={{ color: '#b8b8b8', fontSize: 12 }}>{pc.gaming}</span>
                  </div>
                  <div style={secStyles.pbPerfItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                    <span style={{ color: '#b8b8b8', fontSize: 12 }}>{pc.workflow}</span>
                  </div>
                </div>

                <div style={secStyles.pbRating}>
                  <span style={{ color: '#e8001d' }}>{'★'.repeat(Math.round(pc.rating))}</span>
                  <span style={{ color: '#9f9f9f', marginLeft: 6, fontSize: 12 }}>{pc.rating} ({pc.reviews} reviews)</span>
                </div>

                <button style={{ ...secStyles.pbAddBtn, background: color }}
                  onClick={() => addToCart({ ...pc, category: 'prebuilt', price: pc.price })}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  {t('prebuilt_add_cart')} — {formatPrice(pc.price)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── PRE-BUILT DETAIL PAGE ──────────────────────────────────────────────────
const PrebuiltDetailPage = ({ product: pc }) => {
  const { setPage, addToCart, t, formatPrice } = React.useContext(window.AppContext);
  const [qty, setQty] = React.useState(1);
  const tierColors = { Budget: '#888888', 'Mid-Range': '#909090', 'High-End': '#333333', Flagship: '#ffffff' };
  const color = tierColors[pc.tier] || '#e8001d';

  // Build a specs-like object from the prebuilt's components
  const components = pc.components || {};
  const componentEntries = Object.entries(components);

  return (
    <div style={{ paddingTop: 64, padding: '64px 80px' }}>
      {/* Back button + Name */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
        <button onClick={() => setPage('prebuilt')}
          style={{ background:'#242424', border:'1px solid #3c3c3c', borderRadius:8, color:'#9f9f9f', cursor:'pointer', padding:'8px 14px', display:'flex', alignItems:'center', gap:6, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#e8001d';e.currentTarget.style.color='#ffffff';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#3c3c3c';e.currentTarget.style.color='#9f9f9f';}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'#ffffff', margin:0 }}>{pc.name}</h2>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, marginBottom:64 }}>
        {/* Visual */}
        <div style={{ background:`linear-gradient(135deg, ${color}10, #242424)`, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, position:'relative' }}>
          {pc.badge && <div style={{ position:'absolute', top:20, left:20, background: color + '20', color, fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:5, letterSpacing:'0.1em', zIndex:1 }}>{pc.badge}</div>}
          <svg width="180" height="240" viewBox="0 0 120 160" fill="none">
            <rect x="20" y="10" width="80" height="140" rx="8" fill="#242424" stroke={color} strokeWidth="1.5" />
            <rect x="28" y="20" width="64" height="40" rx="4" fill="#2a2a2a" />
            <circle cx="50" cy="40" r="14" fill="none" stroke={color} strokeWidth="0.8" />
            <circle cx="50" cy="40" r="6" fill={color} opacity="0.3" />
            {[0, 60, 120, 180, 240, 300].map(a => { const r = a * Math.PI / 180; return <line key={a} x1={50 + 7 * Math.cos(r)} y1={40 + 7 * Math.sin(r)} x2={50 + 13 * Math.cos(r)} y2={40 + 13 * Math.sin(r)} stroke={color} strokeWidth="0.8" opacity="0.5" /> })}
            <circle cx="80" cy="40" r="12" fill="none" stroke={color} strokeWidth="0.8" />
            <circle cx="80" cy="40" r="5" fill={color} opacity="0.3" />
            <rect x="28" y="72" width="64" height="14" rx="3" fill="#2a2a2a" stroke={color} strokeWidth="0.5" />
            <rect x="30" y="75" width="20" height="8" rx="1" fill={color} opacity="0.15" />
            <rect x="34" y="90" width="20" height="8" rx="2" fill="#444444" opacity="0.3" />
            <rect x="58" y="90" width="20" height="8" rx="2" fill="#444444" opacity="0.3" />
            <rect x="20" y="100" width="5" height="40" rx="2" fill={color} opacity="0.5" />
            <circle cx="95" cy="140" r="7" fill="none" stroke={color} strokeWidth="1" />
            <circle cx="95" cy="140" r="3" fill={color} opacity="0.4" />
            <rect x="28" y="136" width="10" height="6" rx="1" fill="#2a2a2a" stroke="#9f9f9f" strokeWidth="0.5" />
            <rect x="42" y="136" width="10" height="6" rx="1" fill="#2a2a2a" stroke="#9f9f9f" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Info */}
        <div style={{ display:'flex', flexDirection:'column' }}>
          <div style={{ display:'inline-block', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:5, letterSpacing:'0.1em', marginBottom:12, width:'fit-content', background: color + '20', color }}>
            {pc.tier.toUpperCase()} PRE-BUILT
          </div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:28, color:'#ffffff', margin:'0 0 12px 0', lineHeight:1.3 }}>{pc.name}</h1>

          <div style={{ display:'flex', alignItems:'center', marginBottom:20 }}>
            <span style={{ color:'#e8001d' }}>{'★'.repeat(Math.round(pc.rating))}</span>
            <span style={{ color:'#ffffff', fontWeight:600, marginLeft:6 }}>{pc.rating}</span>
            <span style={{ color:'#9f9f9f', marginLeft:4 }}>({pc.reviews} reviews)</span>
          </div>

          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:40, color:'#ffffff', marginBottom:16 }}>{formatPrice(pc.price)}</div>

          {/* Performance indicators */}
          <div style={{ display:'flex', gap:20, marginBottom:24 }}>
            <div style={{ background:'#242424', border:'1px solid #3c3c3c', borderRadius:10, padding:'14px 20px', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                <span style={{ color:'#9f9f9f', fontSize:11, fontWeight:600, letterSpacing:'0.1em' }}>GAMING</span>
              </div>
              <div style={{ color:'#ffffff', fontSize:14, fontWeight:600 }}>{pc.gaming}</div>
            </div>
            <div style={{ background:'#242424', border:'1px solid #3c3c3c', borderRadius:10, padding:'14px 20px', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                <span style={{ color:'#9f9f9f', fontSize:11, fontWeight:600, letterSpacing:'0.1em' }}>WORKFLOW</span>
              </div>
              <div style={{ color:'#ffffff', fontSize:14, fontWeight:600 }}>{pc.workflow}</div>
            </div>
          </div>

          {/* Stock */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#909090' }}/>
            <span style={{ color:'#909090', fontSize:14 }}>In Stock — Ready to Ship</span>
          </div>

          {/* Quantity */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <button style={{ width:36, height:36, border:'1px solid #3c3c3c', background:'#242424', color:'#ffffff', borderRadius:8, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span style={{ color:'#ffffff', fontSize:16, fontWeight:600, minWidth:32, textAlign:'center' }}>{qty}</span>
            <button style={{ width:36, height:36, border:'1px solid #3c3c3c', background:'#242424', color:'#ffffff', borderRadius:8, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={() => setQty(q => q + 1)}>+</button>
          </div>

          {/* Add to Cart */}
          <button style={{ width:'100%', padding:'14px', background:'#e8001d', color:'#ffffff', border:'none', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', transition:'background 0.2s', marginBottom:12 }}
            onClick={() => { for (let i = 0; i < qty; i++) addToCart({ ...pc, category: 'prebuilt' }); }}
            onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
            onMouseLeave={e => e.currentTarget.style.background = '#e8001d'}>
            {t('prebuilt_add_cart')} — {formatPrice(pc.price * qty)}
          </button>
        </div>
      </div>

      {/* Components / Specs table */}
      {componentEntries.length > 0 && (
        <div style={{ borderTop:'1px solid #3c3c3c', paddingTop:48, marginBottom:48 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#ffffff', marginBottom:24 }}>Components Included</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, border:'1px solid #3c3c3c', borderRadius:10, overflow:'hidden' }}>
            {componentEntries.map(([key, val], i) => (
              <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom: i < componentEntries.length - 1 ? '1px solid #242424' : 'none' }}>
                <div style={{ padding:'12px 20px', color:'#9f9f9f', fontSize:13, background:'#212121', fontFamily:"'DM Mono',monospace", textTransform:'capitalize' }}>{key.replace(/_/g, ' ')}</div>
                <div style={{ padding:'12px 20px', color:'#ffffff', fontSize:13, background:'#242424', fontFamily:"'DM Mono',monospace" }}>{Array.isArray(val) ? val.join(', ') : String(val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specs if any */}
      {pc.specs && Object.keys(pc.specs).length > 0 && (
        <div style={{ borderTop:'1px solid #3c3c3c', paddingTop:48, marginBottom:48 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#ffffff', marginBottom:24 }}>Technical Specifications</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, border:'1px solid #3c3c3c', borderRadius:10, overflow:'hidden' }}>
            {Object.entries(pc.specs).map(([key, val], i) => (
              <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #242424' }}>
                <div style={{ padding:'12px 20px', color:'#9f9f9f', fontSize:13, background:'#212121', fontFamily:"'DM Mono',monospace" }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</div>
                <div style={{ padding:'12px 20px', color:'#ffffff', fontSize:13, background:'#242424', fontFamily:"'DM Mono',monospace" }}>{Array.isArray(val) ? val.join(', ') : String(val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PERIPHERALS ─────────────────────────────────────────────────────────────
const getPeriGroups = (t) => [
  {
    id: 'input',
    label: t('input_devices'),
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" /></svg>,
    tabs: [
      { key: 'keyboard',    label: t('label_keyboard') },
      { key: 'mouse',       label: t('label_mouse') },
      { key: 'microphone',  label: t('label_microphone') },
      { key: 'webcam',      label: t('label_webcam') },
    ],
  },
  {
    id: 'output',
    label: t('output_devices'),
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>,
    tabs: [
      { key: 'monitor',  label: 'Écran' },
      { key: 'speaker',  label: t('label_speaker') },
      { key: 'headset',  label: t('label_headset') },
    ],
  },
  {
    id: 'mixed',
    label: t('io_devices'),
    desc: 'Échangent des données dans les deux sens',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    tabs: [
      { key: 'usb',          label: t('label_usb') },
      { key: 'external_hdd', label: t('label_external_hdd') },
      { key: 'network',      label: t('label_network') },
    ],
  },
];

const PERI_VISUALS = {
  mouse: <svg width="44" height="64" viewBox="0 0 44 64"><path d="M6 24C6 12 14 4 22 4s16 8 16 20v20C38 55 30 60 22 60S6 55 6 44z" fill="none" stroke="#555555" strokeWidth="1.5" /><line x1="22" y1="4" x2="22" y2="28" stroke="#555555" strokeWidth="1" opacity="0.5" /><circle cx="22" cy="20" r="3" fill="#555555" opacity="0.5" /></svg>,
  keyboard: <svg width="80" height="44" viewBox="0 0 80 44"><rect x="4" y="8" width="72" height="28" rx="4" fill="none" stroke="#555555" strokeWidth="1.5" />{[10, 18, 26, 34, 42, 50, 58, 66].map(x => [12, 20, 28].map(y => <rect key={`${x}${y}`} x={x} y={y} width="6" height="5" rx="1" fill="#555555" opacity="0.25" />))}<rect x="24" y="30" width="32" height="5" rx="2" fill="#555555" opacity="0.2" /></svg>,
  microphone: <svg width="40" height="72" viewBox="0 0 40 72"><rect x="13" y="4" width="14" height="30" rx="7" fill="none" stroke="#555555" strokeWidth="1.5" /><path d="M6 28c0 7.7 6.3 14 14 14s14-6.3 14-14" fill="none" stroke="#555555" strokeWidth="1.5" /><line x1="20" y1="42" x2="20" y2="56" stroke="#555555" strokeWidth="1.5" /><line x1="10" y1="56" x2="30" y2="56" stroke="#555555" strokeWidth="1.5" />{[10, 16, 22, 28].map(y => <line key={y} x1="14" y1={y} x2="26" y2={y} stroke="#555555" strokeWidth="0.8" opacity="0.4" />)}</svg>,
  webcam: <svg width="60" height="60" viewBox="0 0 60 60"><rect x="8" y="12" width="44" height="32" rx="6" fill="none" stroke="#555555" strokeWidth="1.5" /><circle cx="30" cy="28" r="10" fill="none" stroke="#555555" strokeWidth="1.5" /><circle cx="30" cy="28" r="5" fill="#555555" opacity="0.2" /><circle cx="30" cy="28" r="2" fill="#555555" opacity="0.5" /><line x1="20" y1="44" x2="40" y2="44" stroke="#555555" strokeWidth="1.5" /><line x1="30" y1="44" x2="30" y2="52" stroke="#555555" strokeWidth="1.5" /><line x1="18" y1="52" x2="42" y2="52" stroke="#555555" strokeWidth="1.5" /></svg>,
  monitor: <svg width="80" height="60" viewBox="0 0 80 60"><rect x="4" y="4" width="72" height="46" rx="4" fill="none" stroke="#555555" strokeWidth="1.5" /><rect x="8" y="8" width="64" height="38" rx="2" fill="#555555" opacity="0.1" /><rect x="30" y="50" width="20" height="4" rx="2" fill="#555555" opacity="0.4" /><rect x="24" y="54" width="32" height="3" rx="1.5" fill="#555555" opacity="0.4" /></svg>,
  headset: <svg width="64" height="64" viewBox="0 0 64 64"><path d="M12 36c0-11 9-20 20-20s20 9 20 20" fill="none" stroke="#555555" strokeWidth="1.5" /><rect x="6" y="34" width="10" height="16" rx="5" fill="none" stroke="#555555" strokeWidth="1.5" /><rect x="48" y="34" width="10" height="16" rx="5" fill="none" stroke="#555555" strokeWidth="1.5" /></svg>,
  speaker: <svg width="56" height="64" viewBox="0 0 56 64"><rect x="8" y="8" width="40" height="48" rx="6" fill="none" stroke="#555555" strokeWidth="1.5" /><circle cx="28" cy="28" r="10" fill="none" stroke="#555555" strokeWidth="1.5" /><circle cx="28" cy="28" r="5" fill="#555555" opacity="0.2" /><circle cx="28" cy="46" r="4" fill="none" stroke="#555555" strokeWidth="1" /><circle cx="28" cy="46" r="1.5" fill="#555555" opacity="0.4" /></svg>,
  usb: <svg width="32" height="72" viewBox="0 0 32 72"><rect x="8" y="4" width="16" height="40" rx="4" fill="none" stroke="#555555" strokeWidth="1.5" /><rect x="10" y="6" width="12" height="6" rx="2" fill="#555555" opacity="0.3" /><rect x="8" y="44" width="16" height="20" rx="2" fill="none" stroke="#555555" strokeWidth="1" opacity="0.5" /></svg>,
  external_hdd: <svg width="72" height="52" viewBox="0 0 72 52"><rect x="4" y="8" width="64" height="36" rx="6" fill="none" stroke="#555555" strokeWidth="1.5" /><circle cx="52" cy="26" r="10" fill="none" stroke="#555555" strokeWidth="1" /><circle cx="52" cy="26" r="4" fill="#555555" opacity="0.3" /><rect x="12" y="20" width="28" height="4" rx="2" fill="#555555" opacity="0.3" /><rect x="12" y="28" width="20" height="3" rx="1.5" fill="#555555" opacity="0.2" /></svg>,
  network: <svg width="64" height="56" viewBox="0 0 64 56"><rect x="4" y="16" width="56" height="28" rx="4" fill="none" stroke="#555555" strokeWidth="1.5" /><path d="M20 8 L20 16" stroke="#555555" strokeWidth="2" /><path d="M32 4 L32 16" stroke="#555555" strokeWidth="2" /><path d="M44 8 L44 16" stroke="#555555" strokeWidth="2" />{[14, 22, 30, 38, 46, 52].map(x => <rect key={x} x={x} y="22" width="4" height="16" rx="2" fill="#555555" opacity="0.25" />)}</svg>,
};

const PeripheralsPage = () => {
  const { setPage, addToCart, toggleFav, favorites, t, formatPrice } = React.useContext(window.AppContext);
  const PERI_GROUPS = getPeriGroups(t);
  const [activeGroup, setActiveGroup] = React.useState('input');
  const [activeTab, setActiveTab] = React.useState('mouse');

  const currentGroup = PERI_GROUPS.find(g => g.id === activeGroup);
  const products = window.PERIPHERALS_DATA[activeTab] || [];

  const handleGroupSwitch = (gid) => {
    setActiveGroup(gid);
    const grp = PERI_GROUPS.find(g => g.id === gid);
    setActiveTab(grp.tabs[0].key);
  };

  return (
    <div style={secStyles.page}>
      {/* Header */}
      <div style={secStyles.pageHeader}>
        <div style={secStyles.headerEye}>COMPLÉTEZ VOTRE SETUP</div>
        <h1 style={secStyles.pageTitle}>Périphériques</h1>
        <p style={secStyles.pageDesc}>Entrée, sortie, mixte — tout ce qui se connecte à votre PC.</p>
      </div>

      {/* Group tabs */}
      <div style={periStyles.groupBar}>
        {PERI_GROUPS.map(g => (
          <button key={g.id}
            style={{ ...periStyles.groupBtn, ...(activeGroup === g.id ? periStyles.groupBtnActive : {}) }}
            onClick={() => handleGroupSwitch(g.id)}>
            <span style={{ color: activeGroup === g.id ? '#1a1a1a' : '#9f9f9f' }}>{g.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: activeGroup === g.id ? '#1a1a1a' : '#ffffff' }}>{g.label}</div>
              <div style={{ fontSize: 11, color: activeGroup === g.id ? '#333' : '#9f9f9f', marginTop: 1 }}>{g.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ padding: '0 48px' }}>
        {/* Sub-tabs */}
        <div style={periStyles.subTabs}>
          {currentGroup.tabs.map(t => (
            <button key={t.key}
              style={{ ...periStyles.subTab, ...(activeTab === t.key ? periStyles.subTabActive : {}) }}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
              <span style={{ ...periStyles.subTabCount, color: activeTab === t.key ? '#1a1a1a' : '#9f9f9f' }}>
                {(window.PERIPHERALS_DATA[t.key] || []).length}
              </span>
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div style={periStyles.grid}>
          {products.map(p => (
            <PeriProductCard key={p.id} product={p}
              visual={PERI_VISUALS[p.category]}
              onAdd={() => addToCart(p)}
              onFav={() => toggleFav(p.id)}
              onView={() => setPage('product', { product: p })}
              isFav={favorites.has(p.id)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PeriProductCard = ({ product, visual, onAdd, onFav, onView, isFav }) => {
  const { t, formatPrice } = React.useContext(window.AppContext);
  const [hov, setHov] = React.useState(false);
  const color = (window.CARD_COLORS||{})[product.category] || '#e8001d';
  const label = (window.CARD_LABELS||{})[product.category] || product.category;
  const specEntries = Object.entries(product.specs||{}).slice(0, 4);
  const badge = product.tags?.includes('bestseller') ? t('badge_bestseller')
    : product.stock === 'low_stock' ? t('badge_low_stock')
    : product.stock === 'out_of_stock' ? t('badge_out_of_stock') : null;

  return (
    <div style={{ background:'#242424', border:`1px solid ${hov ? color : '#3c3c3c'}`, borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', transition:'all 0.25s', position:'relative' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

      <button style={{ position:'absolute', top:14, left:14, background:'rgba(14,14,14,0.85)', border:'none', cursor:'pointer', width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, color: isFav?'#e8001d':'#9f9f9f' }}
        onClick={e => { e.stopPropagation(); onFav(); }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill={isFav?'#e8001d':'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {badge && (
        <div style={{ position:'absolute', top:14, right:14, background: badge==='BESTSELLER' ? color+'28' : '#cc444428', color: badge==='BESTSELLER' ? color : '#cc4444', fontSize:9, fontWeight:700, padding:'3px 9px', borderRadius:4, letterSpacing:'0.1em', zIndex:1 }}>
          {badge}
        </div>
      )}

      <div style={{ height:190, background:`linear-gradient(135deg, ${color}14, #212121)`, overflow:'hidden', cursor:'pointer' }} onClick={onView}>
        <ImageCarousel images={product.images} category={product.category} />
      </div>

      <div style={{ padding:'18px', flex:1, display:'flex', flexDirection:'column' }} onClick={onView}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div style={{ flex:1, minWidth:0, paddingRight:10 }}>
            <div style={{ color, fontSize:10, fontWeight:700, letterSpacing:'0.15em', marginBottom:5 }}>{label.toUpperCase()}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:'#ffffff', lineHeight:1.3 }}>{product.name}</div>
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:19, color:'#e8001d', flexShrink:0 }}>{formatPrice(product.price)}</div>
        </div>


        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <span style={{ color:'#e8001d', fontSize:12 }}>{'★'.repeat(Math.round(product.rating))}</span>
            <span style={{ color:'#9f9f9f', marginLeft:5, fontSize:11 }}>{product.rating} ({product.reviews?.toLocaleString()})</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background: product.stock==='out_of_stock'?'#cc4444':product.stock==='low_stock'?'#e8a020':'#4caf70' }} />
            <span style={{ color: product.stock==='out_of_stock'?'#cc4444':product.stock==='low_stock'?'#e8a020':'#b0b0b0', fontSize:11 }}>
              {product.stock==='in_stock'?t('in_stock'):product.stock==='low_stock'?t('low_stock'):t('out_of_stock')}
            </span>
          </div>
        </div>

        <button style={{ width:'100%', padding:'11px', background:color, color:'#ffffff', border:'none', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer', transition:'opacity 0.2s', marginTop:'auto' }}
          onClick={e => { e.stopPropagation(); onAdd(); }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          Add to Cart — {formatPrice(product.price)}
        </button>
      </div>
    </div>
  );
};

// ─── CART ─────────────────────────────────────────────────────────────────────
const CartPage = () => {
  const { cart, removeFromCart, updateQty, setPage, t, formatPrice } = React.useContext(window.AppContext);
  const [coupon, setCoupon] = React.useState('');
  const [couponApplied, setCouponApplied] = React.useState(false);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 500 ? 0 : 19.99;
  const total = subtotal - discount + shipping;

  if (cart.length === 0) return (
    <div style={{ paddingTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 16 }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3c3c3c" strokeWidth="1.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 20, color: '#9f9f9f' }}>{t('cart_empty')}</div>
      <button style={{ ...window.homeStyles.heroBtnPrimary, marginTop: 8 }} onClick={() => setPage('catalog')}>{t('browse_catalog')}</button>
    </div>
  );

  return (
    <div style={{ paddingTop: 64, padding: '64px 80px' }}>
      <h1 style={secStyles.pageTitle2}>{t('cart_title')} <span style={{ color: '#9f9f9f', fontWeight: 400, fontSize: 20 }}>({cart.length})</span></h1>
      <div style={secStyles.cartLayout}>
        {/* Items */}
        <div style={{ flex: 1 }}>
          {cart.map(item => (
            <div key={item.cartId} style={secStyles.cartItem}>
              <div style={{ ...secStyles.cartImg, background: `linear-gradient(135deg,#242424,#2a2a2a)` }}>
                <ProductVisual category={item.category} imageUrl={item.image_url} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#9f9f9f', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{item.brand || item.tier || item.category}</div>
                <div style={{ color: '#ffffff', fontWeight: 600, fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{item.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={secStyles.qtyControl}>
                    <button style={secStyles.qtyBtnSm} onClick={() => updateQty(item.cartId, item.qty - 1)}>−</button>
                    <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                    <button style={secStyles.qtyBtnSm} onClick={() => updateQty(item.cartId, item.qty + 1)}>+</button>
                  </div>
                  <button style={secStyles.removeItemBtn} onClick={() => removeFromCart(item.cartId)} title="Remove item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 20, fontFamily: "'Space Grotesk',sans-serif" }}>{formatPrice(item.price * item.qty)}</div>
                {item.qty > 1 && <div style={{ color: '#9f9f9f', fontSize: 12 }}>{formatPrice(item.price)} each</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={secStyles.cartSummary}>
          <div style={secStyles.summaryTitle}>{t('order_summary')}</div>
          <div style={secStyles.summaryRow}>
            <span style={{ color: '#b8b8b8' }}>{t('cart_subtotal')}</span>
            <span style={{ color: '#ffffff' }}>{formatPrice(subtotal)}</span>
          </div>
          {couponApplied && (
            <div style={secStyles.summaryRow}>
              <span style={{ color: '#909090' }}>Coupon (INSHOP10)</span>
              <span style={{ color: '#909090' }}>−{formatPrice(discount)}</span>
            </div>
          )}
          <div style={secStyles.summaryRow}>
            <span style={{ color: '#b8b8b8' }}>{t('cart_shipping')}</span>
            <span style={{ color: shipping === 0 ? '#909090' : '#ffffff' }}>{shipping === 0 ? t('cart_free') : formatPrice(shipping)}</span>
          </div>
          {subtotal < 500 && <div style={{ color: '#9f9f9f', fontSize: 11, marginBottom: 12 }}>Free shipping on orders over {formatPrice(500)}</div>}
          <div style={secStyles.summaryDivider} />
          <div style={{ ...secStyles.summaryRow, marginBottom: 20 }}>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 16 }}>{t('cart_total')}</span>
            <span style={{ color: '#e8001d', fontWeight: 700, fontSize: 24, fontFamily: "'Space Grotesk',sans-serif" }}>{formatPrice(total)}</span>
          </div>
          {/* Coupon */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input {...{placeholder:t("coupon_placeholder")}} value={coupon} onChange={e => setCoupon(e.target.value)}
              style={secStyles.couponInput} />
            <button style={secStyles.couponBtn}
              onClick={() => { if (coupon.toUpperCase() === 'INSHOP10') setCouponApplied(true); }}>{t('apply')}</button>
          </div>
          <button style={secStyles.checkoutBtn}
            onClick={() => setPage('checkout')}
            onMouseEnter={e => e.currentTarget.style.background = '#a80015'}
            onMouseLeave={e => e.currentTarget.style.background = '#e8001d'}>
            {t('proceed_checkout')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
          <button style={secStyles.continueBtn} onClick={() => setPage('catalog')}>{t('browse_catalog')}</button>
        </div>
      </div>
    </div>
  );
};

// ─── USER SPACE ───────────────────────────────────────────────────────────────
const ODOO_STATUS_MAP = { draft:'processing', sent:'processing', sale:'processing', done:'delivered', cancel:'cancelled' };
const STATUS_COLORS = { delivered:'#55efc4', shipped:'#74b9ff', processing:'#fdcb6e', cancelled:'#cc4444' };

function formatOrderDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { year:'numeric', month:'short', day:'numeric' });
}

// Gaming PC background image
const StarBg = () => {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <React.Fragment>
      <img src="/gaming-pc-bg.png" alt="" onLoad={() => setLoaded(true)}
        style={{ position:'fixed', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0, pointerEvents:'none', display:'block', opacity: loaded ? 1 : 0, transition:'opacity 0.8s ease' }} />
      {/* Dark overlay for readability */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.75) 100%)' }} />
      {/* Red accent glow */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 70% 60%, rgba(232,0,29,0.08) 0%, transparent 60%)' }} />
    </React.Fragment>
  );
};

// Tile décoratif sous le formulaire — with real images
const LoginTile = ({ label, accentColor, imgSrc }) => (
  <div style={{
    flex:1, height:105, borderRadius:12, overflow:'hidden', position:'relative',
    background:'#0e0e0e', border:'1px solid #1e1e1e',
    display:'flex', alignItems:'flex-end', cursor:'default',
  }}>
    <img src={imgSrc} alt={label}
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.35, filter:'brightness(0.7)' }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:`linear-gradient(to top, ${accentColor}55, transparent)` }} />
    <div style={{ position:'relative', padding:'10px 14px', color:'#ffffff', fontSize:10, fontWeight:700, letterSpacing:'0.18em', textShadow:'0 1px 4px rgba(0,0,0,0.7)' }}>
      {label}
    </div>
  </div>
);

const AuthForm = ({ onSuccess }) => {
  const { t } = React.useContext(window.AppContext);
  const [mode, setMode] = React.useState('login');
  const [form, setForm] = React.useState({ name:'', email:'', password:'' });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    if (!form.email || !form.password) { setError('Email et mot de passe requis'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Adresse email invalide'); return; }
    setError(''); setLoading(true);
    try {
      const res = mode === 'login'
        ? await window.PcApi.login(form.email, form.password)
        : await window.PcApi.register(form.name, form.email, form.password);
      if (res.uid) onSuccess({ authenticated:true, uid:res.uid, name:res.name, email:res.email });
      else setError('Authentification échouée');
    } catch (e) {
      setError(e.message || (mode === 'login' ? t('auth_error_default_login') : t('auth_error_default_register')));
    } finally { setLoading(false); }
  };

  const authInp = {
    width:'100%', padding:'13px 16px',
    background:'#f5f0e3', border:'1.5px solid transparent',
    borderRadius:10, color:'#1a1a1a',
    fontFamily:"'Space Grotesk',sans-serif", fontSize:14,
    outline:'none', boxSizing:'border-box', transition:'border-color 0.15s',
  };

  return (
    <div style={{ width:380, background:'rgba(17,17,17,0.85)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(232,0,29,0.15)', borderRadius:20, padding:'44px 40px', boxShadow:'0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(232,0,29,0.05)' }}>
      <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:28, color:'#ffffff', marginBottom:8, marginTop:0 }}>
        {mode === 'login' ? t('sign_in_title') : t('create_account')}
      </h2>
      <p style={{ color:'#a8a8a8', fontSize:14, marginBottom:32, marginTop:0, lineHeight:1.6 }}>
        {mode === 'login' ? t('sign_in_sub') : t('register_sub')}
      </p>

      {mode === 'register' && (
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', color:'#b8b8b8', fontSize:11, fontWeight:700, letterSpacing:'0.13em', marginBottom:8 }}>NOM COMPLET</label>
          <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Jean Dupont" style={authInp}
            onFocus={e=>e.target.style.borderColor='#e8001d'} onBlur={e=>e.target.style.borderColor='transparent'} />
        </div>
      )}

      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', color:'#b8b8b8', fontSize:11, fontWeight:700, letterSpacing:'0.13em', marginBottom:8 }}>EMAIL</label>
        <input type="email" value={form.email} onChange={e=>set('email',e.target.value)}
          placeholder="votre@email.com" style={authInp}
          onFocus={e=>e.target.style.borderColor='#e8001d'} onBlur={e=>e.target.style.borderColor='transparent'} />
      </div>

      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <label style={{ color:'#b8b8b8', fontSize:11, fontWeight:700, letterSpacing:'0.13em' }}>PASSWORD</label>
          {mode === 'login' && (
            <span style={{ color:'#e8001d', fontSize:11, fontWeight:700, letterSpacing:'0.1em', cursor:'pointer' }}>OUBLIÉ ?</span>
          )}
        </div>
        <input type="password" value={form.password} onChange={e=>set('password',e.target.value)}
          placeholder="••••••••" style={authInp}
          onFocus={e=>e.target.style.borderColor='#e8001d'} onBlur={e=>e.target.style.borderColor='transparent'}
          onKeyDown={e=>e.key==='Enter'&&handle()} />
      </div>

      {error && (
        <div style={{ color:'#cc4444', fontSize:12, marginBottom:16, padding:'10px 14px', background:'#cc444415', borderRadius:8 }}>{error}</div>
      )}

      <button
        style={{ width:'100%', padding:'14px', background:'#e8001d', border:'none', borderRadius:10,
          color:'#ffffff', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13,
          letterSpacing:'0.12em', cursor:loading?'not-allowed':'pointer',
          transition:'background 0.15s', opacity:loading?0.7:1 }}
        onClick={handle} disabled={loading}
        onMouseEnter={e=>{ if(!loading) e.currentTarget.style.background='#c50019'; }}
        onMouseLeave={e=>{ if(!loading) e.currentTarget.style.background='#e8001d'; }}
      >
        {loading ? '...' : mode==='login' ? t('sign_in').toUpperCase() : t('create_account').toUpperCase()}
      </button>

      <div style={{ textAlign:'center', marginTop:24, color:'#a8a8a8', fontSize:13 }}>
        {mode === 'login' ? t('no_account') : t('already_account')}
        <span style={{ color:'#e8001d', cursor:'pointer', fontWeight:600 }}
          onClick={() => { setMode(m=>m==='login'?'register':'login'); setError(''); }}>
          {mode === 'login' ? t('register_link') : t('signin_link')}
        </span>
      </div>
    </div>
  );
};

const ProfileTab = ({ currentUser, setCurrentUser }) => {
  const { t } = React.useContext(window.AppContext);
  const [form, setForm] = React.useState({
    name: currentUser.name || '',
    phone: currentUser.phone || '',
    street: currentUser.street || ''
  });
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const res = await window.PcApi.updateProfile(form);
      if (res.ok) {
        setCurrentUser(prev => ({ ...prev, ...res.user }));
        setMsg(t('profile_saved'));
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (e) {
      setMsg('Error updating profile: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 540 }}>
      <h2 style={secStyles.tabTitle}>{t('profile_tab')}</h2>

      <div style={secStyles.profileField}>
        <label style={secStyles.fieldLabel}>{t('display_name')}</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder={t('display_name')} style={secStyles.fieldInput} />
      </div>

      <div style={secStyles.profileField}>
        <label style={secStyles.fieldLabel}>{t('email')}</label>
        <input value={currentUser.email} disabled style={{ ...secStyles.fieldInput, opacity: 0.6, cursor: 'not-allowed' }} />
      </div>

      <div style={secStyles.profileField}>
        <label style={secStyles.fieldLabel}>{t('phone')}</label>
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
          placeholder={t('phone')} style={secStyles.fieldInput} />
      </div>

      <div style={secStyles.profileField}>
        <label style={secStyles.fieldLabel}>{t('address')}</label>
        <textarea value={form.street} onChange={e => setForm({ ...form, street: e.target.value })}
          placeholder={t('address')} style={{ ...secStyles.fieldInput, height: 80, resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button style={{ ...secStyles.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
          {saving ? t('saving') : t('save_changes')}
        </button>
        {msg && <div style={{ fontSize: 13, color: msg.includes('Error') ? '#cc4444' : '#55efc4' }}>{msg}</div>}
      </div>
    </div>
  );
};

const UserPage = ({ initialTab }) => {
  const { favorites, setPage, addToCart, toggleFav, currentUser, setCurrentUser, t, formatPrice } = React.useContext(window.AppContext);
  const [tab, setTab] = React.useState(initialTab || 'orders');
  const [orders, setOrders] = React.useState([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const tabs = ['orders', 'favorites', 'profile', 'settings'];

  const loadOrders = () => {
    if (!currentUser) return;
    setOrdersLoading(true);
    window.PcApi.getOrders().then(res => {
      setOrders(res.orders || []);
    }).catch(() => setOrders([])).finally(() => setOrdersLoading(false));
  };

  React.useEffect(() => { loadOrders(); }, [currentUser]);

  const handleLogout = async () => {
    try { await window.PcApi.logout(); } catch(_) {}
    setCurrentUser(null);
    window.dispatchEvent(new CustomEvent('pc:logout'));
  };

  const favProducts = window.ALL_PRODUCTS.filter(p => favorites.has(p.id));
  const avatarInitial = currentUser?.name ? currentUser.name[0].toUpperCase() : '?';

  const TAB_LABELS = {
    orders: t('my_orders'),
    favorites: t('my_favorites'),
    profile: t('profile_tab'),
    settings: t('settings_tab'),
  };

  if (!currentUser) {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:5, overflowY:'auto', display:'flex', alignItems:'flex-start', justifyContent:'center' }}>
        <StarBg />
        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'120px 20px 80px' }}>
          <AuthForm onSuccess={user => setCurrentUser(user)} />

          {/* Tiles décoratives */}
          <div style={{ display:'flex', gap:12, marginTop:12, width:380 }}>
            <LoginTile label="PERFORMANCE" accentColor="#e8001d" imgSrc="/performance-tile.png" />
            <LoginTile label="PRÉCISION" accentColor="#74b9ff" imgSrc="/precision-tile.png" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={secStyles.page}>
      <div style={secStyles.pageHeader}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <div style={secStyles.avatarLg}>{avatarInitial}</div>
            <div>
              <div style={secStyles.headerEye}>{t('my_account').toUpperCase()}</div>
              <h1 style={{ ...secStyles.pageTitle, margin:0 }}>{currentUser.name}</h1>
              <div style={{ color:'#9f9f9f', fontSize:13, marginTop:2 }}>{currentUser.email}</div>
            </div>
          </div>
          <button style={{ background:'transparent', border:'1px solid #3c3c3c', borderRadius:8, color:'#9f9f9f', cursor:'pointer', padding:'9px 20px', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, transition:'all 0.15s' }}
            onClick={handleLogout}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#cc4444';e.currentTarget.style.color='#cc4444';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#3c3c3c';e.currentTarget.style.color='#9f9f9f';}}>
            {t('logout')}
          </button>
        </div>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid #3c3c3c', padding:'0 80px' }}>
        {tabs.map(tabKey => (
          <button key={tabKey} style={{ ...secStyles.userTab, ...(tab===tabKey?secStyles.userTabActive:{}) }} onClick={() => setTab(tabKey)}>
            {TAB_LABELS[tabKey]}
            {tabKey === 'favorites' && favProducts.length > 0 && <span style={secStyles.tabCount}>{favProducts.length}</span>}
            {tabKey === 'orders' && orders.length > 0 && <span style={secStyles.tabCount}>{orders.length}</span>}
          </button>
        ))}
      </div>

      <div style={{ padding:'40px 80px' }}>
        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <h2 style={secStyles.tabTitle}>{t('my_orders')}</h2>
            {ordersLoading ? (
              <div style={{ color:'#a8a8a8', padding:'40px 0' }}>Chargement…</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3c3c3c" strokeWidth="1.5" style={{ marginBottom:16 }}>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <div style={{ color:'#9f9f9f', fontSize:15, marginBottom:8 }}>{t('no_orders')}</div>
                <button style={secStyles.addBtn} onClick={() => setPage('catalog')}>{t('browse_catalog')} →</button>
              </div>
            ) : orders.map(order => {
              const status = ODOO_STATUS_MAP[order.state] || 'processing';
              const statusColor = STATUS_COLORS[status] || '#fdcb6e';
              return (
                <div key={order.id} style={secStyles.orderCard}>
                  <div style={secStyles.orderHeader}>
                    <div>
                      <div style={{ color:'#ffffff', fontWeight:600, fontSize:15 }}>{order.name || `#${order.id}`}</div>
                      <div style={{ color:'#9f9f9f', fontSize:13, marginTop:2 }}>{formatOrderDate(order.date)}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                      <div style={{ ...secStyles.statusBadge, background: statusColor+'20', color: statusColor }}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                      <div style={{ color:'#e8001d', fontWeight:700, fontSize:18, fontFamily:"'Space Grotesk',sans-serif" }}>
                        {formatPrice(Number(order.total||0))}
                      </div>
                    </div>
                  </div>
                  <div style={secStyles.orderItems}>
                    {(order.items||[]).map((item, i) => (
                      <div key={i} style={secStyles.orderItemRow}>
                        <span style={{ color:'#c0c0c0', fontSize:13 }}>{item.name}</span>
                        <span style={{ color:'#9f9f9f', fontSize:13 }}>×{item.qty} · {formatPrice(Number(item.price||0))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAVORITES */}
        {tab === 'favorites' && (
          <div>
            <h2 style={secStyles.tabTitle}>{t('my_favorites')} <span style={{ color:'#9f9f9f', fontWeight:400 }}>({favProducts.length})</span></h2>
            {favProducts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px' }}>
                <div style={{ color:'#9f9f9f', fontSize:16, marginBottom:16 }}>{t('no_favorites')}</div>
                <button style={window.homeStyles.heroBtnSecondary} onClick={() => setPage('catalog')}>{t('browse_catalog')}</button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                {favProducts.map(p => (
                  <ProductCard key={p.id} product={p}
                    onAdd={() => addToCart(p)}
                    onFav={() => toggleFav(p)}
                    onView={() => setPage('product', { product:p })}
                    isFav={true} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {tab === 'profile' && (
          <ProfileTab currentUser={currentUser} setCurrentUser={setCurrentUser} />
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div style={{ maxWidth:540 }}>
            <h2 style={secStyles.tabTitle}>{t('settings_tab')}</h2>
            {[[t('email_notifs'),t('email_notifs_desc')],[t('newsletter'),t('newsletter_desc')],[t('two_factor'),t('two_factor_desc')]].map(([title, desc]) => (
              <div key={title} style={secStyles.settingRow}>
                <div>
                  <div style={{ color:'#ffffff', fontWeight:500, fontSize:14 }}>{title}</div>
                  <div style={{ color:'#9f9f9f', fontSize:12, marginTop:2 }}>{desc}</div>
                </div>
                <Toggle />
              </div>
            ))}
            <div style={secStyles.dangerZone}>
              <button style={secStyles.deleteBtn} onClick={handleLogout}>{t('logout')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Toggle = () => {
  const [on, setOn] = React.useState(true);
  return (
    <div style={{ width: 44, height: 24, borderRadius: 12, background: on ? '#e8001d' : '#3c3c3c', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
      onClick={() => setOn(v => !v)}>
      <div style={{ position: 'absolute', top: 3, left: on ? 20 : 3, width: 18, height: 18, borderRadius: '50%', background: '#ffffff', transition: 'left 0.2s' }} />
    </div>
  );
};

const periStyles = {
  groupBar: { display: 'flex', gap: 12, padding: '24px 48px', borderBottom: '1px solid #333333' },
  groupBtn: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
    background: '#242424', border: '1px solid #3c3c3c', borderRadius: 10,
    cursor: 'pointer', transition: 'all 0.15s', flex: 1, textAlign: 'left',
  },
  groupBtnActive: { background: '#e8001d', borderColor: '#e8001d' },
  subTabs: { display: 'flex', gap: 4, padding: '20px 0 0', marginBottom: 24 },
  subTab: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
    background: 'transparent', border: '1px solid #3c3c3c', borderRadius: 8,
    color: '#a8a8a8', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    fontFamily: "'Space Grotesk',sans-serif", transition: 'all 0.15s',
  },
  subTabActive: { background: '#333333', borderColor: '#e8001d', color: '#ffffff' },
  subTabCount: { background: '#333333', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, paddingBottom: 60 },
  card: { background: '#242424', border: '1px solid #333333', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' },
  cardHov: { borderColor: '#444444', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
  cardImg: { height: 150, background: '#212121', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' },
  favBtn: { position: 'absolute', top: 8, right: 8, background: 'rgba(14,14,14,0.8)', border: 'none', cursor: 'pointer', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 8, left: 8, background: '#e8001d', color: '#1a1a1a', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, letterSpacing: '0.1em' },
  cardBody: { padding: '14px', flex: 1, cursor: 'pointer' },
  brand: { color: '#9f9f9f', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 3 },
  name: { color: '#ffffff', fontWeight: 600, fontSize: 14, lineHeight: 1.3, marginBottom: 6 },
  rating: { color: '#e8001d', fontSize: 11, marginBottom: 10 },
  specs: { borderTop: '1px solid #2a2a2a', paddingTop: 8 },
  specRow: { display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontFamily: "'DM Mono',monospace" },
  cardFooter: { padding: '12px 14px', borderTop: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: '#ffffff', fontWeight: 700, fontSize: 18, fontFamily: "'Space Grotesk',sans-serif" },
  addBtn: { background: '#e8001d', color: '#1a1a1a', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 7, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12, transition: 'background 0.15s' },
};

const secStyles = {
  page: { paddingTop: 64 },
pageHeader: { background: 'linear-gradient(135deg,#1a1a1a,#242424)', borderBottom: '1px solid #3c3c3c', padding: '48px 80px 36px' },
headerEye: { color: '#e8001d', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', marginBottom: 8 },
pageTitle: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 36, color: '#ffffff', margin: '0 0 8px' },
pageTitle2: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 32, color: '#ffffff', margin: '0 0 32px', paddingTop: 64 },
pageDesc: { color: '#a8a8a8', fontSize: 15, margin: 0 },
pbGrid: { padding: '48px 80px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 },
pbCard: { background: '#242424', border: '1px solid #3c3c3c', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.25s', position: 'relative' },
pbBadge: { position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, letterSpacing: '0.1em', zIndex: 1 },
pbVisual: { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
pbBody: { padding: '20px' },
pbTier: { fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 4 },
pbName: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: '#ffffff', marginBottom: 16 },
pbPrice: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: '#e8001d' },
pbSpecs: { background: '#212121', borderRadius: 8, padding: '10px 14px', marginBottom: 14 },
pbSpecRow: { display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 6, borderBottom: '1px solid #2a2a2a', paddingBottom: 6 },
pbPerf: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
pbPerfItem: { display: 'flex', alignItems: 'center', gap: 8 },
pbRating: { marginBottom: 16 },
pbAddBtn: { width: '100%', padding: '12px', color: '#1a1a1a', border: 'none', borderRadius: 8, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'opacity 0.2s' },
tabs: { display: 'flex', gap: 4, marginBottom: 32 },
tab: { padding: '10px 20px', background: 'none', border: '1px solid #3c3c3c', borderRadius: 8, color: '#a8a8a8', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 500, transition: 'all 0.15s' },
tabActive: { background: '#2a2a2a', color: '#ffffff', borderColor: '#e8001d' },
periGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, paddingBottom: 60 },
cartLayout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, paddingBottom: 60 },
cartItem: { display: 'flex', gap: 20, padding: '20px 0', borderBottom: '1px solid #3c3c3c', alignItems: 'flex-start' },
cartImg: { width: 80, height: 80, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
qtyControl: { display: 'flex', alignItems: 'center', gap: 8, background: '#242424', border: '1px solid #3c3c3c', borderRadius: 7, padding: '4px 8px' },
qtyBtnSm: { background: 'none', border: 'none', color: '#a8a8a8', cursor: 'pointer', fontSize: 16, padding: '0 2px', fontFamily: "'Space Grotesk',sans-serif" },
removeItemBtn: { background: 'none', border: '1px solid #3c3c3c', borderRadius: 8, color: '#9f9f9f', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s, border-color 0.15s' },
cartSummary: { background: '#242424', border: '1px solid #3c3c3c', borderRadius: 16, padding: '24px', height: 'fit-content', position: 'sticky', top: 80 },
summaryTitle: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: '#ffffff', marginBottom: 20 },
summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 14 },
summaryDivider: { height: 1, background: '#3c3c3c', margin: '16px 0' },
couponInput: { flex: 1, background: '#2a2a2a', border: '1px solid #3c3c3c', borderRadius: 7, padding: '9px 12px', color: '#ffffff', fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, outline: 'none' },
couponBtn: { background: '#2a2a2a', border: '1px solid #3c3c3c', borderRadius: 7, padding: '9px 16px', color: '#e8001d', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13 },
checkoutBtn: { width: '100%', padding: '14px', background: '#e8001d', color: '#1a1a1a', border: 'none', borderRadius: 9, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s', marginBottom: 10 },
continueBtn: { width: '100%', padding: '11px', background: 'transparent', color: '#a8a8a8', border: '1px solid #3c3c3c', borderRadius: 9, fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, cursor: 'pointer' },
avatarLg: { width: 64, height: 64, borderRadius: '50%', background: '#2a2a2a', border: '2px solid #e8001d', color: '#e8001d', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' },
userTab: { padding: '14px 24px', background: 'none', border: 'none', color: '#9f9f9f', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 500, borderBottom: '2px solid transparent', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 },
userTabActive: { color: '#ffffff', borderBottomColor: '#e8001d' },
tabCount: { background: '#e8001d', color: '#1a1a1a', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 },
tabTitle: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: '#ffffff', marginBottom: 24, marginTop: 0 },
orderCard: { background: '#242424', border: '1px solid #3c3c3c', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #2a2a2a' },
statusBadge: { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 },
orderItems: { padding: '12px 20px' },
orderItemRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #212121' },
orderActionBtn: { background: '#2a2a2a', border: '1px solid #3c3c3c', borderRadius: 6, padding: '7px 14px', color: '#a0a0a0', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, transition: 'all 0.15s' },
profileField: { marginBottom: 16 },
fieldLabel: { display: 'block', color: '#9f9f9f', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 },
fieldInput: { width: '100%', background: '#242424', border: '1px solid #3c3c3c', borderRadius: 8, padding: '10px 14px', color: '#ffffff', fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' },
saveBtn: { background: '#e8001d', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '11px 28px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 },
settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #3c3c3c' },
dangerZone: { marginTop: 32, padding: 20, border: '1px solid #cc444430', borderRadius: 10, background: '#cc444408' },
deleteBtn: { background: 'transparent', border: '1px solid #cc4444', color: '#cc4444', borderRadius: 7, padding: '8px 20px', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600 },
};

Object.assign(window, { PrebuiltPage, PrebuiltDetailPage, PeripheralsPage, CartPage, UserPage });
