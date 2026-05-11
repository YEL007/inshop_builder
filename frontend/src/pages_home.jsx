import React from "react";
import { ImageCarousel, ProductVisual } from "./components_shared";

// pages_home.jsx — Home Page

const CATEGORY_CARDS = [
  { id:'cpu', color:'#e8793a' },
  { id:'gpu', color:'#6c5ce7' },
  { id:'motherboard', color:'#00b894' },
  { id:'ram', color:'#fdcb6e' },
  { id:'storage', color:'#74b9ff' },
  { id:'psu', color:'#e8001d' },
  { id:'cooling', color:'#55efc4' },
  { id:'case', color:'#b2bec3' },
];


const CARD_COLORS = {
  cpu:'#e8793a', gpu:'#6c5ce7', motherboard:'#00b894', ram:'#fdcb6e',
  storage:'#74b9ff', psu:'#e8001d', cooling:'#55efc4', case:'#b2bec3',
  mouse:'#a29bfe', keyboard:'#81ecec', microphone:'#fab1a0', webcam:'#ffeaa7',
  monitor:'#a29bfe', speaker:'#55efc4', headset:'#e8001d', usb:'#74b9ff',
  external_hdd:'#b2bec3', network:'#00b894', prebuilt:'#e8001d',
};
const CARD_LABELS = {
  cpu:'Processor', gpu:'Graphics Card', motherboard:'Motherboard', ram:'Memory',
  storage:'Storage', psu:'Power Supply', cooling:'Cooling', case:'Case',
  mouse:'Mouse', keyboard:'Keyboard', microphone:'Microphone', webcam:'Webcam',
  monitor:'Monitor', speaker:'Speaker', headset:'Headset', usb:'USB Drive',
  external_hdd:'Ext. Storage', network:'Network Card',
};

const ProductCard = ({ product, onAdd, onFav, onView, isFav }) => {
  const { t, formatPrice } = React.useContext(window.AppContext);
  const [hov, setHov] = React.useState(false);
  const color = CARD_COLORS[product.category] || '#e8001d';
  const label = t('label_' + product.category) || product.category;
  const specEntries = Object.entries(product.specs || {}).slice(0, 4);
  const badge = product.tags?.includes('bestseller') ? t('badge_bestseller')
    : product.stock === 'low_stock' ? t('badge_low_stock') : null;

  return (
    <div
      style={{ background:'#242424', border:`1px solid ${hov ? color : '#3c3c3c'}`, borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', transition:'all 0.25s', position:'relative' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

      <button style={{ position:'absolute', top:14, left:14, background:'rgba(14,14,14,0.85)', border:'none', cursor:'pointer', width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, color: isFav?'#e8001d':'#9f9f9f' }}
        onClick={e => { e.stopPropagation(); onFav(product); }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill={isFav?'#e8001d':'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {badge && (
        <div style={{ position:'absolute', top:14, right:14, background: badge==='BESTSELLER' ? color+'28' : '#88888828', color: badge==='BESTSELLER' ? color : '#888888', fontSize:9, fontWeight:700, padding:'3px 9px', borderRadius:4, letterSpacing:'0.1em', zIndex:1 }}>
          {badge}
        </div>
      )}

      <div style={{ height:190, background:`linear-gradient(135deg, ${color}14, #212121)`, overflow:'hidden', cursor:'pointer' }} onClick={() => onView(product)}>
        <ImageCarousel images={product.images} category={product.category} />
      </div>

      <div style={{ padding:'18px', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, cursor:'pointer' }} onClick={() => onView(product)}>
          <div style={{ flex:1, minWidth:0, paddingRight:10 }}>
            <div style={{ color, fontSize:10, fontWeight:700, letterSpacing:'0.15em', marginBottom:5 }}>{label?.toUpperCase()}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:'#ffffff', lineHeight:1.3 }}>{product.name}</div>
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:19, color:'#e8001d', flexShrink:0 }}>{formatPrice(product.price)}</div>
        </div>

        {specEntries.length > 0 && (
          <div style={{ background:'#212121', borderRadius:8, padding:'10px 12px', marginBottom:12, cursor:'pointer' }} onClick={() => onView(product)}>
            {specEntries.map(([k, v], i) => (
              <div key={k} style={{ display:'flex', gap:8, alignItems:'baseline', ...(i < specEntries.length-1 ? { marginBottom:5, borderBottom:'1px solid #2a2a2a', paddingBottom:5 } : {}) }}>
                <span style={{ color:'#9f9f9f', fontSize:11, minWidth:56 }}>{k}</span>
                <span style={{ color:'#c8c8c8', fontSize:12, fontFamily:"'DM Mono',monospace" }}>{Array.isArray(v)?v.join(', '):String(v)}</span>
              </div>
            ))}
          </div>
        )}

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

        <button
          disabled={product.stock === 'out_of_stock'}
          style={{ width:'100%', padding:'11px', background: product.stock === 'out_of_stock' ? '#3c3c3c' : color, color: product.stock === 'out_of_stock' ? '#666' : '#ffffff', border:'none', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, cursor: product.stock === 'out_of_stock' ? 'not-allowed' : 'pointer', transition:'opacity 0.2s', marginTop:'auto' }}
          onClick={e => { e.stopPropagation(); onAdd(product); }}
          onMouseEnter={e => { if (product.stock !== 'out_of_stock') e.currentTarget.style.opacity='0.8'; }}
          onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          {product.stock === 'out_of_stock' ? t('out_of_stock') : t('add_to_cart', formatPrice(product.price))}
        </button>
      </div>
    </div>
  );
};


const HomePage = () => {
  const { setPage, cart, addToCart, favorites, toggleFav, t, formatPrice, config } = React.useContext(window.AppContext);
  const featured = [
    ...window.CATALOG.cpu.slice(0,2),
    ...window.CATALOG.gpu.slice(0,2),
    ...window.CATALOG.cooling.slice(0,1),
    ...window.CATALOG.ram.slice(0,1),
  ];

  return (
    <div style={homeStyles.page}>
      {/* Hero */}
      <section style={homeStyles.hero} className="home-hero">
        <video autoPlay loop muted playsInline style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', top: 0, left: 0, zIndex: 0, opacity: 0.4 }}>
          <source src="/Vidéo_Rouge_Blanc_Noir_Pour_Site.mp4" type="video/mp4" />
        </video>
        <div style={homeStyles.heroGrid}/>
        <div style={homeStyles.heroGlow}/>
        <div style={homeStyles.heroContent}>
          <div style={homeStyles.heroEyebrow}>{t('hero_eyebrow')}</div>
          <h1 style={homeStyles.heroTitle}>
            {config?.hero?.title || (
              <>
                {t('hero_title_1')}<br/>
                <span style={{ color:'#e8001d' }}>{t('hero_title_2')}</span>
              </>
            )}
          </h1>
          <p style={homeStyles.heroDesc}>
            {config?.hero?.subtitle || t('hero_desc')}
          </p>
          <div style={homeStyles.heroBtns} className="rsp-hero-btns">
            <button style={homeStyles.heroBtnPrimary}
              onClick={() => setPage('builder')}
              onMouseEnter={e => e.currentTarget.style.background='#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.background='#e8001d'}>
              {t('hero_btn_build')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button style={homeStyles.heroBtnSecondary}
              onClick={() => setPage('prebuilt')}
              onMouseEnter={e => { e.currentTarget.style.background='#2a2a2a'; e.currentTarget.style.borderColor='#444444'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#3c3c3c'; }}>
              {t('hero_btn_prebuilt')}
            </button>
          </div>
          <div style={homeStyles.heroStats}>
            {[['500+',t('hero_stat_products')],['99.9%',t('hero_stat_uptime')],['48h',t('hero_stat_delivery')],['5★',t('hero_stat_rating')]].map(([n,l])=>(
              <div key={l} style={homeStyles.heroStat}>
                <div style={{ color:'#ffffff', fontWeight:700, fontSize:20 }}>{n}</div>
                <div style={{ color:'#9f9f9f', fontSize:12 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={homeStyles.heroRight} className="hero-right">
          <div style={homeStyles.heroPC} className="hero-pc">
            <svg width="220" height="280" viewBox="0 0 220 280" fill="none">
              {/* Case outline */}
              <rect x="40" y="20" width="140" height="240" rx="12" fill="#242424" stroke="#e8001d" strokeWidth="1"/>
              <rect x="48" y="30" width="124" height="80" rx="6" fill="#2a2a2a"/>
              {/* GPU */}
              <rect x="52" y="120" width="112" height="28" rx="4" fill="#2a2a2a" stroke="#888888" strokeWidth="0.5"/>
              <circle cx="80" cy="134" r="10" fill="none" stroke="#888888" strokeWidth="1"/>
              <circle cx="110" cy="134" r="10" fill="none" stroke="#888888" strokeWidth="1"/>
              {/* RAM */}
              <rect x="85" y="36" width="8" height="44" rx="1" fill="#444444" opacity="0.5"/>
              <rect x="97" y="36" width="8" height="44" rx="1" fill="#444444" opacity="0.5"/>
              {/* RGB strip */}
              <rect x="40" y="160" width="6" height="80" rx="3" fill="url(#rgb)"/>
              <defs>
                <linearGradient id="rgb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8001d"/>
                  <stop offset="50%" stopColor="#6c5ce7"/>
                  <stop offset="100%" stopColor="#00b894"/>
                </linearGradient>
              </defs>
              {/* Fans */}
              <circle cx="80" cy="68" r="24" fill="none" stroke="#555555" strokeWidth="0.5"/>
              <circle cx="80" cy="68" r="8" fill="none" stroke="#555555" strokeWidth="1"/>
              {[0,60,120,180,240,300].map(a=>{const r=a*Math.PI/180; return <line key={a} x1={80+10*Math.cos(r)} y1={68+10*Math.sin(r)} x2={80+22*Math.cos(r)} y2={68+22*Math.sin(r)} stroke="#555555" strokeWidth="1" opacity="0.6"/>})}
              <circle cx="140" cy="68" r="24" fill="none" stroke="#555555" strokeWidth="0.5"/>
              <circle cx="140" cy="68" r="8" fill="none" stroke="#555555" strokeWidth="1"/>
              {[0,60,120,180,240,300].map(a=>{const r=a*Math.PI/180; return <line key={a} x1={140+10*Math.cos(r)} y1={68+10*Math.sin(r)} x2={140+22*Math.cos(r)} y2={68+22*Math.sin(r)} stroke="#555555" strokeWidth="1" opacity="0.6"/>})}
              {/* Power button */}
              <circle cx="155" cy="248" r="8" fill="none" stroke="#e8001d" strokeWidth="1"/>
              <circle cx="155" cy="248" r="4" fill="#e8001d" opacity="0.5"/>
              {/* USB ports */}
              <rect x="50" y="240" width="12" height="8" rx="1" fill="#2a2a2a" stroke="#9f9f9f" strokeWidth="0.5"/>
              <rect x="66" y="240" width="12" height="8" rx="1" fill="#2a2a2a" stroke="#9f9f9f" strokeWidth="0.5"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={homeStyles.section} className="rsp-section">
        <div style={homeStyles.sectionHeader}>
          <div>
            <div style={homeStyles.sectionEye}>{t('section_cat_eye')}</div>
            <h2 style={homeStyles.sectionTitle}>{t('section_cat_title')}</h2>
          </div>
        </div>
        <div style={homeStyles.categoriesGrid} className="home-grid">
          {CATEGORY_CARDS.map(cat => (
            <button key={cat.id} style={homeStyles.catCard}
              onClick={() => setPage('catalog', { category: cat.id })}
              onMouseEnter={e => { e.currentTarget.style.borderColor=cat.color; e.currentTarget.style.background='#242424'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#3c3c3c'; e.currentTarget.style.background='#212121'; }}>
              <div style={{ ...homeStyles.catIcon, background: cat.color + '20', color: cat.color }}>
                <ProductVisual category={cat.id} />
              </div>
              <div style={homeStyles.catLabel}>{t('cat_' + cat.id)}</div>
              <div style={homeStyles.catDesc}>
                {t('products_count', (window.CATALOG[cat.id]||[]).length)}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section style={homeStyles.section} className="rsp-section">
        <div style={homeStyles.sectionHeader}>
          <div>
            <div style={homeStyles.sectionEye}>{t('section_feat_eye')}</div>
            <h2 style={homeStyles.sectionTitle}>{t('section_feat_title')}</h2>
          </div>
          <button style={homeStyles.seeAll} onClick={() => setPage('catalog')}
            onMouseEnter={e => e.currentTarget.style.color='#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color='#e8001d'}>
            {t('view_all')}
          </button>
        </div>
        <div style={homeStyles.productsGrid} className="home-grid">
          {featured.map(p => (
            <ProductCard key={p.id} product={p}
              onAdd={() => addToCart(p)}
              onFav={() => toggleFav(p.id)}
              onView={(p) => setPage('product', { product: p })}
              isFav={favorites.has(p.id)} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={homeStyles.ctaBanner} className="rsp-cta">
        <div style={homeStyles.ctaBannerGlow}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={homeStyles.ctaEye}>{t('cta_eye')}</div>
          <h2 style={homeStyles.ctaTitle}>{t('cta_title')}</h2>
          <p style={homeStyles.ctaDesc}>{t('cta_desc')}</p>
          <button style={homeStyles.ctaBtn} onClick={() => setPage('builder')}
            onMouseEnter={e => e.currentTarget.style.background='#2a2a2a'}
            onMouseLeave={e => e.currentTarget.style.background='#e8001d'}>
            {t('cta_btn')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </section>
    </div>
  );
};

const homeStyles = {
  page: { paddingTop: 64 },
  hero: {
    position:'relative', minHeight:'90vh', display:'flex', alignItems:'center',
    padding:'80px 80px 80px 80px', overflow:'hidden',
    background:'linear-gradient(135deg, #1a1a1a 0%, #212121 50%, #1a1a1a 100%)',
  },
  heroGrid: {
    position:'absolute', inset:0, opacity:1,
    backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px)',
  },
  heroGlow: {
    position:'absolute', top:'20%', left:'10%', width:600, height:600,
    background:'radial-gradient(ellipse at 40% 50%, rgba(232,0,29,0.15) 0%, transparent 65%)',
    pointerEvents:'none',
  },
  heroContent: { position:'relative', zIndex:1, maxWidth:560 },
  heroEyebrow: { color:'#e8001d', fontSize:12, fontWeight:600, letterSpacing:'0.2em', marginBottom:16 },
  heroTitle: {
    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:64,
    color:'#ffffff', lineHeight:1.1, margin:'0 0 20px 0',
  },
  heroDesc: { color:'#a8a8a8', fontSize:17, lineHeight:1.6, margin:'0 0 36px 0' },
  heroBtns: { display:'flex', gap:12, marginBottom:52 },
  heroBtnPrimary: {
    display:'flex', alignItems:'center', gap:8,
    background:'#e8001d', color:'#ffffff', border:'none', cursor:'pointer',
    padding:'14px 28px', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif",
    fontWeight:700, fontSize:15, transition:'background 0.2s',
  },
  heroBtnSecondary: {
    background:'transparent', color:'#ffffff', border:'1px solid #3c3c3c', cursor:'pointer',
    padding:'14px 28px', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif",
    fontWeight:500, fontSize:15, transition:'all 0.2s',
  },
  heroStats: { display:'flex', gap:40 },
  heroStat: { textAlign:'center' },
  heroRight: { position:'absolute', right:80, top:'50%', transform:'translateY(-50%)', opacity:0.9 },
  heroPC: {
    filter:'drop-shadow(0 0 40px rgba(232,0,29,0.5)) drop-shadow(0 0 80px rgba(232,0,29,0.2))',
    animation:'float 4s ease-in-out infinite',
  },
  section: { padding:'80px 80px' },
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36 },
  sectionEye: { color:'#e8001d', fontSize:11, fontWeight:600, letterSpacing:'0.2em', marginBottom:8 },
  sectionTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:32, color:'#ffffff', margin:0 },
  seeAll: { background:'none', border:'none', cursor:'pointer', color:'#e8001d', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:500, transition:'color 0.2s' },
  categoriesGrid: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16 },
  catCard: {
    background:'#212121', border:'1px solid #3c3c3c', borderRadius:12,
    padding:'24px 20px', cursor:'pointer', textAlign:'left', transition:'all 0.2s',
    display:'flex', flexDirection:'column', gap:8,
  },
  catIcon: { width:64, height:64, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 },
  catLabel: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14, color:'#ffffff' },
  catDesc: { color:'#9f9f9f', fontSize:12 },
  productsGrid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20 },
  card: {
    background:'#242424', border:'1px solid #3c3c3c', borderRadius:12,
    overflow:'hidden', transition:'all 0.2s', cursor:'pointer',
  },
  cardHovered: { borderColor:'#444444', transform:'translateY(-2px)', boxShadow:'0 12px 40px rgba(0,0,0,0.1)' },
  cardImg: {
    height:160, display:'flex', alignItems:'center', justifyContent:'center',
    position:'relative',
  },
  favBtn: {
    position:'absolute', top:10, right:10, background:'rgba(14,14,14,0.8)',
    border:'none', cursor:'pointer', width:32, height:32, borderRadius:8,
    display:'flex', alignItems:'center', justifyContent:'center', transition:'color 0.2s',
  },
  bestsellerBadge: {
    position:'absolute', top:10, left:10,
    background:'#e8001d', color:'#ffffff',
    fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:4, letterSpacing:'0.1em',
  },
  cardBody: { padding:'16px' },
  cardBrand: { color:'#9f9f9f', fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 },
  cardName: { color:'#ffffff', fontWeight:600, fontSize:14, lineHeight:1.4, marginBottom:8 },
  cardRating: { color:'#ffffff', fontSize:12, marginBottom:10 },
  cardFooter: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  cardPrice: { color:'#ffffff', fontWeight:700, fontSize:20, fontFamily:"'Space Grotesk',sans-serif" },
  stockDot: { width:6, height:6, borderRadius:'50%' },
  addBtn: {
    width:'100%', padding:'10px', background:'#e8001d', color:'#ffffff',
    border:'none', cursor:'pointer', borderRadius:8,
    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, transition:'background 0.2s',
  },
  ctaBanner: {
    margin:'0 80px 80px', borderRadius:16,
    background:'linear-gradient(135deg, #242424, #2a2a2a)',
    border:'1px solid #3c3c3c', padding:'64px 80px', position:'relative', overflow:'hidden',
  },
  ctaBannerGlow: {
    position:'absolute', top:'-50%', right:'-10%', width:400, height:400,
    background:'radial-gradient(circle, rgba(232,0,29,0.12) 0%, transparent 70%)',
    pointerEvents:'none',
  },
  ctaEye: { color:'#e8001d', fontSize:11, fontWeight:600, letterSpacing:'0.2em', marginBottom:12 },
  ctaTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:40, color:'#ffffff', margin:'0 0 16px 0' },
  ctaDesc: { color:'#a8a8a8', fontSize:16, maxWidth:500, lineHeight:1.6, margin:'0 0 32px 0' },
  ctaBtn: {
    display:'inline-flex', alignItems:'center', gap:8,
    background:'#e8001d', color:'#ffffff', border:'none', cursor:'pointer',
    padding:'14px 28px', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif",
    fontWeight:700, fontSize:15, transition:'background 0.2s',
  },
};

Object.assign(window, { HomePage, ProductCard, ProductVisual, ImageCarousel, homeStyles, CARD_COLORS, CARD_LABELS });
