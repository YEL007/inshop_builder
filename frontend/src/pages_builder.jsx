import React from "react";

const ImageCarousel = window.ImageCarousel;
const ProductVisual = window.ProductVisual;

// pages_builder.jsx — Custom PC Builder — Wizard Step-by-Step Layout

const WIZARD_STEPS = [
  { key:'cpu',         num:1, catalog:'cpu' },
  { key:'motherboard', num:2, catalog:'motherboard' },
  { key:'ram',         num:3, catalog:'ram' },
  { key:'gpu',         num:4, catalog:'gpu' },
  { key:'storage',     num:5, catalog:'storage' },
  { key:'psu',         num:6, catalog:'psu' },
  { key:'case',        num:7, catalog:'case' },
  { key:'cooling',     num:8, catalog:'cooling' },
];

const getSpecSnippet = (product) => {
  const s = product.specs;
  switch(product.category) {
    case 'cpu':         return `Cores: ${s.cores}  |  Threads: ${s.threads}  |  Boost: ${s.boostClock}`;
    case 'motherboard': return `Socket: ${s.socket}  |  ${s.formFactor}  |  ${s.ramType}`;
    case 'ram':         return `${s.capacity}  |  ${s.speed} MHz  |  ${s.timing}`;
    case 'gpu':         return `${s.vram}  |  TDP: ${s.tdp}W  |  ${s.architecture}`;
    case 'storage':     return `${s.capacity}  |  Read: ${s.read}  |  ${s.type}`;
    case 'psu':         return `${s.wattage}W  |  ${s.efficiency}  |  ${s.modular}`;
    case 'case':        return `${s.formFactors?.join(', ')}  |  GPU max: ${s.maxGpuLength}mm`;
    case 'cooling':     return `${s.type}  |  ${s.size}  |  TDP: ${s.tdpRating}W`;
    default:            return '';
  }
};

const getCompatNote = (step, product, build) => {
  if (step.key === 'motherboard' && build.cpu) {
    if (product.specs.socket !== build.cpu.specs.socket)
      return { ok:false, msg:`Socket ${product.specs.socket} ≠ CPU ${build.cpu.specs.socket}` };
  }
  if (step.key === 'cpu' && build.motherboard) {
    if (product.specs.socket !== build.motherboard.specs.socket)
      return { ok:false, msg:`Socket ${product.specs.socket} ≠ MB ${build.motherboard.specs.socket}` };
  }
  if (step.key === 'cooling' && build.cpu) {
    if (!product.specs.sockets?.includes(build.cpu.specs.socket))
      return { ok:false, msg:`Socket ${build.cpu.specs.socket} non supporté` };
  }
  return { ok:true };
};

const BuilderPage = () => {
  const { build, setBuild, addToCart, dataLoaded, t, formatPrice } = React.useContext(window.AppContext);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [addedAll, setAddedAll] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('featured');

  const step = WIZARD_STEPS[currentStep];
  const products = React.useMemo(() => {
    let p = window.CATALOG[step.catalog] || [];
    if (sortBy === 'price_asc') p = [...p].sort((a,b)=>a.price-b.price);
    else if (sortBy === 'price_desc') p = [...p].sort((a,b)=>b.price-a.price);
    else if (sortBy === 'rating') p = [...p].sort((a,b)=>b.rating-a.rating);
    return p;
  }, [step, sortBy, dataLoaded]);

  const completedCount = WIZARD_STEPS.filter(s => build[s.key]).length;
  const total = window.calcBuildTotal(build);

  const handleSelect = (product) => {
    const compat = getCompatNote(step, product, build);
    if (!compat.ok) return;
    setBuild(prev => ({ ...prev, [step.key]: product }));
  };

  const handleAddAll = () => {
    Object.values(build).forEach(p => { if (p) addToCart(p); });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  const canGoNext = currentStep < WIZARD_STEPS.length - 1;
  const canGoPrev = currentStep > 0;

  return (
    <div style={wiz.page}>
      {/* Title bar */}
      <div style={wiz.titleBar}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8001d" strokeWidth="1.5">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <div>
            <h1 style={wiz.title}>{t('builder_title')}</h1>
            <p style={wiz.subtitle}>{t('builder_subtitle')}</p>
          </div>
        </div>
      </div>

      <div style={wiz.body}>
        {/* Left sidebar */}
        <aside style={wiz.sidebar}>
          <div style={wiz.stepList}>
            {WIZARD_STEPS.map((s, i) => {
              const isActive = i === currentStep;
              const isDone = !!build[s.key];
              return (
                <button
                  key={s.key}
                  style={{
                    ...wiz.stepItem,
                    ...(isActive ? wiz.stepItemActive : {}),
                    ...(isDone && !isActive ? wiz.stepItemDone : {}),
                  }}
                  onClick={() => setCurrentStep(i)}
                >
                  <div style={{ ...wiz.stepNum, ...(isActive ? wiz.stepNumActive : {}), ...(isDone && !isActive ? wiz.stepNumDone : {}) }}>
                    {isDone && !isActive
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : s.num
                    }
                  </div>
                  <span style={wiz.stepLabel}>{t('step_label_' + s.key)}</span>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft:'auto' }}>
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  )}
                  {isDone && !isActive && (
                    <span style={wiz.stepPrice}>{formatPrice(build[s.key].price)}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom summary */}
          <div style={wiz.summaryBox}>
            <div style={wiz.summaryTop}>
              <span style={{ color:'#666666', fontSize:12 }}>{completedCount}/{WIZARD_STEPS.length} components</span>
            </div>
            <div style={wiz.summaryTotal}>{formatPrice(total)}</div>
            <button
              style={{ ...wiz.addAllBtn, ...(completedCount===0?wiz.addAllBtnDisabled:{}), ...(addedAll?wiz.addAllBtnSuccess:{}) }}
              disabled={completedCount===0}
              onClick={handleAddAll}
            >
              {addedAll ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Added!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  Add all to cart
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={wiz.main}>
          {/* Step header */}
          <div style={wiz.stepHeader}>
            <div>
              <h2 style={wiz.stepTitle}>{t('step_label_' + step.key)}</h2>
              <p style={wiz.stepHint}>
                {build[step.key]
                  ? <><span style={{ color:'#e8001d' }}>✓ {t('selected')}: </span>{build[step.key].name}</>
                  : t('select_component') + ' — ' + t('step_label_' + step.key)}
              </p>
            </div>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={wiz.sortSelect}>
              <option value="featured">Featured</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Product grid */}
          <div style={wiz.productGrid}>
            {products.map(product => {
              const compat = getCompatNote(step, product, build);
              const isSelected = build[step.key]?.id === product.id;
              return (
                <ProductWizardCard
                  key={product.id}
                  product={product}
                  isSelected={isSelected}
                  compat={compat}
                  onSelect={() => handleSelect(product)}
                />
              );
            })}
          </div>

          {/* Navigation */}
          <div style={wiz.navRow}>
            <button
              style={{ ...wiz.navBtn, ...(canGoPrev ? {} : wiz.navBtnDisabled) }}
              disabled={!canGoPrev}
              onClick={() => setCurrentStep(i => i - 1)}
            >
              ← Previous
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {WIZARD_STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i===currentStep?24:6, height:6, borderRadius:3,
                  background: i===currentStep?'#e8001d': build[WIZARD_STEPS[i].key]?'#9f9f9f':'#3c3c3c',
                  transition:'all 0.2s', cursor:'pointer',
                }} onClick={() => setCurrentStep(i)}/>
              ))}
            </div>
            <button
              style={{ ...wiz.navBtnPrimary, ...(canGoNext ? {} : wiz.navBtnPrimaryDone) }}
              onClick={() => canGoNext && setCurrentStep(i => i + 1)}
            >
              {canGoNext ? t('next_step') : t('done')}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

const ProductWizardCard = ({ product, isSelected, compat, onSelect }) => {
  const { t, formatPrice } = React.useContext(window.AppContext);
  const [hov, setHov] = React.useState(false);
  const color = (window.CARD_COLORS||{})[product.category] || '#e8001d';
  const label = (window.CARD_LABELS||{})[product.category] || product.category;
  const specEntries = Object.entries(product.specs||{}).slice(0, 4);

  return (
    <div
      style={{
        background: isSelected ? color+'12' : '#242424',
        border: `2px solid ${isSelected ? color : !compat.ok ? '#cc444440' : hov ? color+'80' : '#3c3c3c'}`,
        borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column',
        transition:'all 0.2s', position:'relative',
        opacity: !compat.ok ? 0.45 : 1,
        cursor: compat.ok ? 'pointer' : 'not-allowed',
      }}
      onClick={compat.ok ? onSelect : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {isSelected && (
        <div style={{ position:'absolute', top:12, right:12, width:24, height:24, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}

      <div style={{ height:160, background:`linear-gradient(135deg, ${color}14, #212121)`, overflow:'hidden' }}>
        <ImageCarousel images={product.images} category={product.category} />
      </div>

      <div style={{ padding:'16px', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div style={{ flex:1, minWidth:0, paddingRight:8 }}>
            <div style={{ color, fontSize:10, fontWeight:700, letterSpacing:'0.15em', marginBottom:4 }}>{label.toUpperCase()}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'#ffffff', lineHeight:1.3 }}>{product.name}</div>
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:17, color:'#e8001d', flexShrink:0 }}>{formatPrice(product.price)}</div>
        </div>

        {specEntries.length > 0 && (
          <div style={{ background:'#212121', borderRadius:7, padding:'8px 10px', marginBottom:10 }}>
            {specEntries.map(([k, v], i) => (
              <div key={k} style={{ display:'flex', gap:6, alignItems:'baseline', ...(i < specEntries.length-1 ? { marginBottom:4, borderBottom:'1px solid #2a2a2a', paddingBottom:4 } : {}) }}>
                <span style={{ color:'#9f9f9f', fontSize:10, minWidth:52 }}>{k}</span>
                <span style={{ color:'#666666', fontSize:11, fontFamily:"'DM Mono',monospace" }}>{Array.isArray(v)?v.join(', '):String(v)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto' }}>
          <div>
            <span style={{ color:'#e8001d', fontSize:11 }}>{'★'.repeat(Math.round(product.rating))}</span>
            <span style={{ color:'#9f9f9f', marginLeft:4, fontSize:10 }}>{product.rating}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background: product.stock==='out_of_stock'?'#cc4444':'#555' }} />
            <span style={{ color: product.stock==='out_of_stock'?'#cc4444':'#9f9f9f', fontSize:10 }}>
              {product.stock==='in_stock'?t('in_stock'):product.stock==='low_stock'?t('low_stock'):t('out_of_stock')}
            </span>
          </div>
        </div>

        {!compat.ok && (
          <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:8, padding:'6px 8px', background:'#cc444415', borderRadius:6, color:'#cc4444', fontSize:11 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#cc4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {compat.msg}
          </div>
        )}
      </div>
    </div>
  );
};

const wiz = {
  page: { paddingTop:64, minHeight:'100vh', background:'#1a1a1a', display:'flex', flexDirection:'column' },
  titleBar: { padding:'32px 40px 24px', borderBottom:'1px solid #333333' },
  title: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:26, color:'#ffffff', margin:0, lineHeight:1.2 },
  subtitle: { color:'#9f9f9f', fontSize:13, marginTop:4 },
  body: { display:'grid', gridTemplateColumns:'280px 1fr', flex:1, minHeight:0 },

  // Sidebar
  sidebar: { borderRight:'1px solid #333333', display:'flex', flexDirection:'column', background:'#1e1e1e' },
  stepList: { flex:1, padding:'16px 12px' },
  stepItem: {
    display:'flex', alignItems:'center', gap:10, width:'100%',
    padding:'10px 12px', borderRadius:8, border:'none',
    background:'transparent', cursor:'pointer', transition:'all 0.15s',
    marginBottom:2, textAlign:'left',
  },
  stepItemActive: { background:'#e8001d', color:'#ffffff' },
  stepItemDone: { background:'#222222' },
  stepNum: {
    width:24, height:24, borderRadius:'50%', background:'#333333',
    color:'#9f9f9f', fontSize:11, fontWeight:700,
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  stepNumActive: { background:'#ffffff', color:'#e8001d' },
  stepNumDone: { background:'#444444', color:'#909090' },
  stepLabel: { fontSize:13, fontWeight:600, color:'inherit', flex:1, fontFamily:"'Space Grotesk',sans-serif" },
  stepPrice: { color:'#9f9f9f', fontSize:11, fontFamily:"'DM Mono',monospace", marginLeft:'auto' },

  summaryBox: { padding:'16px', borderTop:'1px solid #333333', background:'#212121' },
  summaryTop: { marginBottom:4 },
  summaryTotal: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:28, color:'#ffffff', marginBottom:12 },
  addAllBtn: {
    width:'100%', padding:'10px', background:'#e8001d', color:'#ffffff',
    border:'none', borderRadius:8, cursor:'pointer',
    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13,
    display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s',
  },
  addAllBtnDisabled: { background:'#333333', color:'#9f9f9f', cursor:'not-allowed' },
  addAllBtnSuccess: { background:'#909090', color:'#ffffff' },

  // Main
  main: { padding:'28px 36px', display:'flex', flexDirection:'column', gap:20, overflowY:'auto' },
  stepHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  stepTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#ffffff', margin:'0 0 4px' },
  stepHint: { color:'#9f9f9f', fontSize:13 },
  sortSelect: { background:'#222222', border:'1px solid #3c3c3c', borderRadius:7, padding:'7px 12px', color:'#666666', fontFamily:"'Space Grotesk',sans-serif", fontSize:12, outline:'none', cursor:'pointer' },

  productGrid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 },

  prodCard: {
    display:'flex', gap:0, background:'#242424', border:'1px solid #333333',
    borderRadius:10, overflow:'hidden', cursor:'pointer', transition:'all 0.15s', position:'relative',
  },
  prodCardHov: { borderColor:'#444444', background:'#2e2e2e' },
  prodCardSelected: { borderColor:'#e8001d', background:'#222222' },
  prodCardIncompat: { opacity:0.5, cursor:'not-allowed' },
  prodImg: {
    width:90, height:90, flexShrink:0,
    display:'flex', alignItems:'center', justifyContent:'center',
    borderRight:'1px solid #333333',
  },
  prodInfo: { padding:'12px 14px', flex:1, minWidth:0 },
  prodBrand: { color:'#9f9f9f', fontSize:10, fontWeight:700, letterSpacing:'0.12em', marginBottom:2 },
  prodName: { color:'#ffffff', fontWeight:600, fontSize:13, lineHeight:1.3, marginBottom:6 },
  prodSpecs: { color:'#9f9f9f', fontSize:11, fontFamily:"'DM Mono',monospace", lineHeight:1.5, marginBottom:8 },
  prodFooter: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  prodPrice: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'#ffffff' },
  incompatNote: { display:'flex', alignItems:'center', gap:6, marginTop:6, color:'#cc4444', fontSize:11 },
  selectedCheck: {
    position:'absolute', top:8, right:8, width:20, height:20, borderRadius:'50%',
    background:'#e8001d', display:'flex', alignItems:'center', justifyContent:'center',
  },

  navRow: { display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:8, marginTop:'auto' },
  navBtn: {
    background:'#222222', border:'1px solid #3c3c3c', color:'#666666',
    padding:'10px 24px', borderRadius:8, cursor:'pointer',
    fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14, transition:'all 0.15s',
  },
  navBtnDisabled: { opacity:0.3, cursor:'not-allowed' },
  navBtnPrimary: {
    background:'#e8001d', color:'#ffffff', border:'none',
    padding:'10px 28px', borderRadius:8, cursor:'pointer',
    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, transition:'all 0.15s',
  },
  navBtnPrimaryDone: { background:'#909090' },
};

Object.assign(window, { BuilderPage });
