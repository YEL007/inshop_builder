import React from "react";

const ImageCarousel = window.ImageCarousel;
const ProductVisual = window.ProductVisual;

// pages_onlyone_builder.jsx — Custom Only One PC Builder

const WIZARD_STEPS = [
  { key:'case',        num:1, catalog:'case' },
  { key:'motherboard', num:2, catalog:'motherboard' },
  { key:'cpu',         num:3, catalog:'cpu' },
  { key:'cooling',     num:4, catalog:'cooling' },
  { key:'ram',         num:5, catalog:'ram' },
  { key:'gpu',         num:6, catalog:'gpu' },
  { key:'storage',     num:7, catalog:'storage' },
  { key:'psu',         num:8, catalog:'psu' },
];

const getCompatNote = (step, product, build) => {
  const s = product.specs || {};

  // Similar checks as standard builder
  if (step.key === 'motherboard' && build.cpu) {
    if (s.socket !== build.cpu.specs.socket)
      return { ok:false, msg:`Socket carte mère (${s.socket}) ≠ CPU (${build.cpu.specs.socket})` };
  }
  if (step.key === 'cpu' && build.motherboard) {
    if (s.socket !== build.motherboard.specs.socket)
      return { ok:false, msg:`Socket CPU (${s.socket}) ≠ carte mère (${build.motherboard.specs.socket})` };
  }
  if (step.key === 'ram' && build.motherboard?.specs.ramType) {
    if (s.type && s.type !== build.motherboard.specs.ramType)
      return { ok:false, msg:`RAM ${s.type} incompatible avec carte mère ${build.motherboard.specs.ramType}` };
  }
  if (step.key === 'motherboard' && build.ram?.specs.type) {
    if (s.ramType && s.ramType !== build.ram.specs.type)
      return { ok:false, msg:`Carte mère ${s.ramType} incompatible avec RAM ${build.ram.specs.type}` };
  }
  return { ok:true };
};

const OnlyOneBuilderPage = () => {
  const { addToCart, dataLoaded, t, formatPrice, setPage } = React.useContext(window.AppContext);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [addedAll, setAddedAll] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('featured');
  
  // Local build state for Only One
  const [build, setBuild] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('inshop_onlyone_build') || '{}'); } catch { return {}; }
  });

  const updateBuild = (updater) => {
    setBuild(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('inshop_onlyone_build', JSON.stringify(next));
      return next;
    });
  };

  const step = WIZARD_STEPS[currentStep];
  const products = React.useMemo(() => {
    let p = (window.ONLYONE_CATALOG || {})[step.catalog] || [];
    if (sortBy === 'price_asc') p = [...p].sort((a,b)=>a.price-b.price);
    else if (sortBy === 'price_desc') p = [...p].sort((a,b)=>b.price-a.price);
    else if (sortBy === 'rating') p = [...p].sort((a,b)=>(b.rating||0)-(a.rating||0));
    return p;
  }, [step, sortBy, dataLoaded]);

  const completedCount = WIZARD_STEPS.filter(s => build[s.key]).length;
  const total = Object.values(build).reduce((sum, p) => sum + (p?.price || 0), 0);

  const handleSelect = (product) => {
    // Toggle: clicking the already-selected product deselects it
    if (build[step.key]?.id === product.id) {
      updateBuild(prev => ({ ...prev, [step.key]: null }));
      return;
    }
    const compat = getCompatNote(step, product, build);
    if (!compat.ok) return;
    updateBuild(prev => ({ ...prev, [step.key]: product }));
  };

  const handleAddAll = () => {
    Object.values(build).forEach(p => { if (p) addToCart({ ...p, category: 'onlyonepc' }); });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  const canGoNext = currentStep < WIZARD_STEPS.length - 1;
  const canGoPrev = currentStep > 0;

  return (
    <div style={wiz.page}>
      <div style={wiz.heroBanner} className="rsp-banner">
        <video autoPlay loop muted playsInline style={wiz.heroBannerImg}>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div style={wiz.heroBannerGrid} />
        <div style={wiz.heroBannerGlow} />
        <div style={wiz.heroBannerOverlay} />
        <div style={wiz.heroBannerContent} className="rsp-banner-content">
          <div style={wiz.headerEye} className="rsp-banner-eye">{t('onlyone_builder_eyebrow')}</div>
          <h1 style={wiz.pageTitle} className="rsp-banner-title">{t('nav_onlyonepc')}</h1>
          <p style={wiz.pageDesc}>{t('onlyone_builder_desc')}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, borderBottom: '1px solid var(--border)', background: 'var(--white)', marginBottom: 0 }}>
        <button onClick={() => setPage('onlyonepc')}
          style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: 'var(--gray-text)', fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--black)'} onMouseLeave={e=>e.currentTarget.style.color='var(--gray-text)'}>
          {t('onlyone_unique_tab')}
        </button>
        <button onClick={() => {}}
          style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: '2px solid var(--accent)', color: 'var(--black)', fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          {t('onlyone_custom_tab')}
        </button>
      </div>

      <div style={wiz.body} className="wizard-body">
        {/* Left sidebar */}
        <aside style={wiz.sidebar} className="wizard-sidebar">
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
                    {s.num}
                  </div>
                  <span style={wiz.stepLabel}>{t('step_label_' + s.key)}</span>
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
              <span style={{ color:'var(--gray-text)', fontSize:12 }}>{t('complete_steps', completedCount, WIZARD_STEPS.length)}</span>
            </div>
            <div style={wiz.summaryTotal}>{formatPrice(total)}</div>
            <button
              style={{ ...wiz.addAllBtn, ...(completedCount===0?wiz.addAllBtnDisabled:{}), ...(addedAll?wiz.addAllBtnSuccess:{}) }}
              disabled={completedCount===0}
              onClick={handleAddAll}
            >
              {addedAll ? t('added_to_cart') : t('onlyone_add_config')}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={wiz.main} className="wizard-main">
          {/* Step header */}
          <div style={wiz.stepHeader} className="wizard-step-header">
            <div>
              <h2 style={wiz.stepTitle}>{t('step_label_' + step.key)}</h2>
              <p style={wiz.stepHint}>
                {build[step.key]
                  ? <><span style={{ color:'var(--accent)' }}>✓ {t('selected')}: </span>{build[step.key].name}</>
                  : t('onlyone_select_hint') + ' — ' + t('step_label_' + step.key)}
              </p>
            </div>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={wiz.sortSelect}>
              <option value="featured">{t('sort_featured')}</option>
              <option value="price_asc">{t('sort_price_asc')}</option>
              <option value="price_desc">{t('sort_price_desc')}</option>
              <option value="rating">{t('sort_rating')}</option>
            </select>
          </div>

          {/* Product grid */}
          <div style={wiz.productGrid} className="wizard-grid">
            {products.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-text)' }}>
                {t('onlyone_no_products')}
              </div>
            ) : products.map(product => {
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
              {t('prev')}
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {WIZARD_STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i===currentStep?24:6, height:6, borderRadius:3,
                  background: i===currentStep?'var(--accent)': build[WIZARD_STEPS[i].key]?'var(--gray-text)':'var(--border)',
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
  const { t, formatPrice, toggleFav, favorites } = React.useContext(window.AppContext);
  const [hov, setHov] = React.useState(false);
  const color = (window.CARD_COLORS||{})[product.category] || 'var(--accent)';
  const label = (window.CARD_LABELS||{})[product.category] || product.category;
  const specEntries = Object.entries(product.specs||{}).slice(0, 4);

  return (
    <div
      style={{
        background: isSelected ? color+'12' : 'var(--white)',
        border: `2px solid ${isSelected ? color : !compat.ok ? '#cc444440' : hov ? color+'80' : 'var(--border)'}`,
        borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column',
        transition:'all 0.2s', position:'relative',
        opacity: !compat.ok ? 0.45 : 1,
        cursor: compat.ok ? 'pointer' : 'not-allowed',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.06)' : 'none',
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

      <div style={{ height:160, background:`linear-gradient(135deg, ${color}14, var(--gray-50))`, overflow:'hidden' }}>
        <ImageCarousel images={product.images} category={product.category} />
      </div>

      <div style={{ padding:'16px', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div style={{ flex:1, minWidth:0, paddingRight:8 }}>
            <div style={{ color, fontSize:10, fontWeight:700, letterSpacing:'0.15em', marginBottom:4 }}>ONLY ONE {label?.toUpperCase()}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--black)', lineHeight:1.3 }}>{product.name}</div>
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:17, color:'var(--accent)', flexShrink:0 }}>{formatPrice(product.price)}</div>
        </div>

        {specEntries.length > 0 && (
          <div style={{ background:'var(--gray-50)', borderRadius:7, padding:'8px 10px', marginBottom:10 }}>
            {specEntries.map(([k, v], i) => (
              <div key={k} style={{ display:'flex', gap:6, alignItems:'baseline', ...(i < specEntries.length-1 ? { marginBottom:4, borderBottom:'1px solid var(--border)', paddingBottom:4 } : {}) }}>
                <span style={{ color:'var(--gray-text)', fontSize:10, minWidth:52 }}>{k}</span>
                <span style={{ color:'var(--black)', fontSize:11, fontFamily:"'DM Mono',monospace" }}>{Array.isArray(v)?v.join(', '):String(v)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto' }}>
          <div>
            <span style={{ color:'var(--accent)', fontSize:11 }}>{'★'.repeat(Math.round(product.rating||0))}</span>
            <span style={{ color:'var(--gray-text)', marginLeft:4, fontSize:10 }}>{product.rating||0}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background: product.stock==='out_of_stock'?'#cc4444':'#555' }} />
            <span style={{ color: product.stock==='out_of_stock'?'#cc4444':'var(--gray-text)', fontSize:10 }}>
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
  page: { paddingTop:64, minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' },

  // Bannière hero
  heroBanner: { position:'relative', height:400, overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', background:'#0a0a0a' },
  heroBannerImg: { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 25%', opacity: 0.4 },
  heroBannerGrid: {
    position:'absolute', inset:0, opacity:0.1, zIndex:1,
    backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.05) 39px, rgba(255,255,255,0.05) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.05) 39px, rgba(255,255,255,0.05) 40px)',
  },
  heroBannerGlow: {
    position:'absolute', top:'20%', left:'10%', width:600, height:600, zIndex:1,
    background:'radial-gradient(ellipse at 40% 50%, rgba(232,0,29,0.3) 0%, transparent 65%)',
    pointerEvents:'none',
  },
  heroBannerOverlay: { position:'absolute', inset:0, background:'linear-gradient(90deg, #0a0a0a 0%, transparent 50%, #0a0a0a 100%)', zIndex:1 },
  heroBannerContent: { position:'relative', zIndex:2, width:'100%', padding:'0 80px' },
  headerEye: { color:'var(--accent)', fontSize:12, fontWeight:600, letterSpacing:'0.2em', marginBottom:12 },
  pageTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:48, color:'#ffffff', margin:'0 0 12px', lineHeight:1.1 },
  pageDesc: { color:'rgba(255,255,255,0.7)', fontSize:17, maxWidth:600, lineHeight:1.6, margin:0 },

  body: { display:'grid', gridTemplateColumns:'280px 1fr', flex:1, minHeight:0, borderTop: '1px solid var(--border)' },

  // Sidebar
  sidebar: { borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', background:'var(--gray-50)' },
  stepList: { flex:1, padding:'16px 12px' },
  stepItem: {
    display:'flex', alignItems:'center', gap:10, width:'100%',
    padding:'10px 12px', borderRadius:8, border:'none',
    background:'transparent', cursor:'pointer', transition:'all 0.15s',
    marginBottom:2, textAlign:'left',
  },
  stepItemActive: { background:'var(--black)', color:'var(--white)' },
  stepItemDone: { background:'var(--white)', border:'1px solid var(--border)' },
  stepNum: {
    width:24, height:24, borderRadius:'50%', background:'var(--border)',
    color:'var(--gray-text)', fontSize:11, fontWeight:700,
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  stepNumActive: { background:'var(--accent)', color:'var(--white)' },
  stepNumDone: { background:'var(--black)', color:'var(--white)' },
  stepLabel: { fontSize:13, fontWeight:600, color:'inherit', flex:1, fontFamily:"'Space Grotesk',sans-serif" },
  stepPrice: { color:'var(--gray-text)', fontSize:11, fontFamily:"'DM Mono',monospace", marginLeft:'auto' },

  summaryBox: { padding:'16px', borderTop:'1px solid var(--border)', background:'var(--white)' },
  summaryTop: { marginBottom:4 },
  summaryTotal: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:28, color:'var(--black)', marginBottom:12 },
  addAllBtn: {
    width:'100%', padding:'10px', background:'var(--accent)', color:'var(--white)',
    border:'none', borderRadius:8, cursor:'pointer',
    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13,
    display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s',
  },
  addAllBtnDisabled: { background:'var(--border)', color:'var(--gray-text)', cursor:'not-allowed' },
  addAllBtnSuccess: { background:'var(--black)', color:'var(--white)' },

  // Main
  main: { padding:'28px 36px', display:'flex', flexDirection:'column', gap:20, overflowY:'auto', background:'var(--bg)' },
  stepHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  stepTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'var(--black)', margin:'0 0 4px' },
  stepHint: { color:'var(--gray-text)', fontSize:13 },
  sortSelect: { background:'var(--white)', border:'1px solid var(--border)', borderRadius:7, padding:'7px 12px', color:'var(--gray-text)', fontFamily:"'Space Grotesk',sans-serif", fontSize:12, outline:'none', cursor:'pointer' },

  productGrid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 },

  navRow: { display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:8, marginTop:'auto' },
  navBtn: {
    background:'var(--white)', border:'1px solid var(--border)', color:'var(--gray-text)',
    padding:'10px 24px', borderRadius:8, cursor:'pointer',
    fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14, transition:'all 0.15s',
  },
  navBtnDisabled: { opacity:0.3, cursor:'not-allowed' },
  navBtnPrimary: {
    background:'var(--accent)', color:'var(--white)', border:'none',
    padding:'10px 28px', borderRadius:8, cursor:'pointer',
    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, transition:'all 0.15s',
  },
  navBtnPrimaryDone: { background:'var(--black)' },
};

Object.assign(window, { OnlyOneBuilderPage });
