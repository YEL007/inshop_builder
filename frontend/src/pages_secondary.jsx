import React from "react";
import { ImageCarousel, ProductVisual } from "./components_shared";

const ProductCard = window.ProductCard;

// pages_secondary.jsx — Pre-Built, Peripherals, Cart, User Space


const SharedSidebar = ({ 
  inStockOnly, setInStockOnly, 
  priceRange, setPriceRange, minRating, setMinRating, 
  brands, setBrands, availableBrands, maxPrice = 5000, priceStep = 100 
}) => {
  const { t, formatPrice } = React.useContext(window.AppContext);
  const toggleBrand = (b) => setBrands(prev => prev.includes(b) ? prev.filter(x=>x!==b) : [...prev, b]);
  
  return (
    <aside style={secStyles.sidebar} className="rsp-catalog-sidebar">

      <div style={secStyles.filterGroup}>
        <div style={secStyles.filterLabel}>{t('filter_availability')}</div>
        <label style={secStyles.checkRow}>
          <input type="checkbox" checked={inStockOnly} onChange={e=>setInStockOnly(e.target.checked)} style={{ accentColor:'#e8001d' }}/>
          <span style={{ color:'#555555', fontSize:13 }}>{t('filter_in_stock_only')}</span>
        </label>
      </div>

      <div style={secStyles.filterGroup}>
        <div style={secStyles.filterLabel}>{t('filter_price')}</div>
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <div style={secStyles.priceInput}>{formatPrice(priceRange[0])}</div>
          <span style={{ color:'#888888', alignSelf:'center' }}>—</span>
          <div style={secStyles.priceInput}>{formatPrice(priceRange[1])}</div>
        </div>
        <input type="range" min={0} max={maxPrice} step={priceStep} value={priceRange[0]}
          onChange={e => setPriceRange([Math.min(+e.target.value, priceRange[1]-priceStep), priceRange[1]])}
          style={{ width:'100%', accentColor:'#e8001d', marginBottom:6 }}/>
        <input type="range" min={0} max={maxPrice} step={priceStep} value={priceRange[1]}
          onChange={e => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0]+priceStep)])}
          style={{ width:'100%', accentColor:'#e8001d' }}/>
      </div>

      <div style={secStyles.filterGroup}>
        <div style={secStyles.filterLabel}>{t('filter_min_rating')}</div>
        {[4, 3, 2].map(r => (
          <label key={r} style={secStyles.checkRow}>
            <input type="radio" name="rating" checked={minRating === r}
              onChange={() => setMinRating(minRating === r ? 0 : r)}
              style={{ accentColor:'#e8001d' }}/>
            <span style={{ color:'#e8001d', fontSize:12 }}>{'★'.repeat(r)}{'☆'.repeat(5-r)}</span>
            <span style={{ color:'#888888', fontSize:11 }}>&amp; +</span>
          </label>
        ))}
        {minRating > 0 && (
          <button style={{ ...secStyles.filterBtn, color:'#888888', fontSize:11, padding:0, marginTop:8 }}
            onClick={() => setMinRating(0)}>✕ {t('clear_filter')}</button>
        )}
      </div>

      {availableBrands.length > 0 && (
        <div style={secStyles.filterGroup}>
          <div style={secStyles.filterLabel}>{t('filter_brand')}</div>
          {availableBrands.map(b => (
            <label key={b} style={secStyles.checkRow}>
              <input type="checkbox" checked={brands.includes(b)} onChange={()=>toggleBrand(b)} style={{ accentColor:'#e8001d' }}/>
              <span style={{ color:'#555555', fontSize:13 }}>{b}</span>
            </label>
          ))}
        </div>
      )}
    </aside>
  );
};

// ─── PRE-BUILT PCs ───────────────────────────────────────────────────────────
const PrebuiltPage = () => {
  const { setPage, addToCart, toggleFav, favorites, t, formatPrice, dataLoaded } = React.useContext(window.AppContext);
  const tierColors = { Budget: '#888888', 'Mid-Range': '#0077cc', 'High-End': '#7c3aed', Flagship: '#e8001d' };
  const [search, setSearch] = React.useState('');
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState([0, 20000]);
  const [minRating, setMinRating] = React.useState(0);
  const [brands, setBrands] = React.useState([]);
  const [sortBy, setSortBy] = React.useState('featured');

  const filtered = React.useMemo(() => {
    let prods = window.PREBUILTS || [];
    if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (inStockOnly) prods = prods.filter(p => p.stock !== 'out_of_stock');
    if (brands.length) prods = prods.filter(p => brands.includes(p.brand));
    prods = prods.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) prods = prods.filter(p => (p.rating || 0) >= minRating);
    if (sortBy === 'price_asc') prods = [...prods].sort((a,b) => a.price - b.price);
    else if (sortBy === 'price_desc') prods = [...prods].sort((a,b) => b.price - a.price);
    else if (sortBy === 'rating') prods = [...prods].sort((a,b) => (b.rating||0) - (a.rating||0));
    else if (sortBy === 'reviews') prods = [...prods].sort((a,b) => (b.reviews||0) - (a.reviews||0));
    return prods;
  }, [search, inStockOnly, priceRange, minRating, brands, sortBy, dataLoaded]);

  const availableBrands = React.useMemo(() => [...new Set((window.PREBUILTS||[]).map(p => p.brand).filter(Boolean))].sort(), [dataLoaded]);


  return (
    <div style={secStyles.page}>
      {/* Prebuilt Banner */}
      <div style={secStyles.heroBanner} className="rsp-banner">
        <video autoPlay loop muted playsInline style={secStyles.heroBannerImg}>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div style={secStyles.heroBannerGrid} />
        <div style={secStyles.heroBannerGlow} />
        <div style={secStyles.heroBannerOverlay} />
        <div style={secStyles.heroBannerContent} className="rsp-banner-content">
          <div style={secStyles.headerEye} className="rsp-banner-eye">{t('prebuilt_banner_eye')}</div>
          <h1 style={{ ...secStyles.pageTitle, color:'#ffffff' }} className="rsp-banner-title">{t('prebuilt_title')}</h1>
          <p style={{ ...secStyles.pageDesc, color:'rgba(255,255,255,0.7)' }}>{t('prebuilt_banner_desc')}</p>
        </div>
      </div>

      <div style={secStyles.layout} className="rsp-catalog">
        <SharedSidebar inStockOnly={inStockOnly} setInStockOnly={setInStockOnly} priceRange={priceRange} setPriceRange={setPriceRange} minRating={minRating} setMinRating={setMinRating} brands={brands} setBrands={setBrands} availableBrands={availableBrands} maxPrice={5000} priceStep={100} />
        <main style={secStyles.main}>
          <div style={secStyles.toolbar}>
            <input placeholder={t("search_in_results") || "Rechercher..."} value={search} onChange={e=>setSearch(e.target.value)} style={secStyles.searchInput} />
            <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
              <span style={{ color:'#888888', fontSize:13 }}>{t('products_count', filtered.length) || `${filtered.length} produits`}</span>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={secStyles.sortSelect}>
                {[["featured",t("sort_featured")||"En vedette"],["price_asc",t("sort_price_asc")||"Prix croissant"],["price_desc",t("sort_price_desc")||"Prix décroissant"],["rating",t("sort_rating")||"Meilleures notes"],["reviews",t("sort_reviews")||"Plus commentés"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={secStyles.pbGrid} className="rsp-pb-grid">
            {filtered.length === 0 ? (
              <div style={secStyles.empty}>
                <div style={{ color:'#888888' }}>{t('no_products') || 'Aucun produit'}</div>
              </div>
            ) : filtered.map(pc => {
          const color = tierColors[pc.tier] || '#e8001d';
          return (
            <div key={pc.id} style={{ ...secStyles.pbCard, cursor:'pointer' }}
              onClick={() => setPage('prebuilt-detail', { product: pc })}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.transform = 'none'; }}>
              {pc.badge && <div style={{ ...secStyles.pbBadge, background: color + '20', color }}>{pc.badge}</div>}
              <button style={{ position:'absolute', top:14, left:14, background:'rgba(255,255,255,0.9)', border:'1px solid #e0e0e0', cursor:'pointer', width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, color: favorites.has(pc.id)?'#e8001d':'#9f9f9f' }}
                onClick={e => { e.stopPropagation(); toggleFav(pc.id); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={favorites.has(pc.id)?'#e8001d':'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              {/* Visual */}
              <div style={{ ...secStyles.pbVisual, background: `linear-gradient(135deg, ${color}18, #f8f8f8)` }}>
                <ImageCarousel images={pc.images} category="prebuilt" height={160} />
              </div>

              <div style={secStyles.pbBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ ...secStyles.pbTier, color }}>{pc.tier?.toUpperCase()}</div>
                    <div style={secStyles.pbName}>{pc.name}</div>
                  </div>
                  <div style={secStyles.pbPrice}>{formatPrice(pc.price)}</div>
                </div>


                <div style={secStyles.pbPerf}>
                  <div style={secStyles.pbPerfItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    <span style={{ color: '#666666', fontSize: 12 }}>{pc.gaming}</span>
                  </div>
                  <div style={secStyles.pbPerfItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                    <span style={{ color: '#666666', fontSize: 12 }}>{pc.workflow}</span>
                  </div>
                </div>

                <div style={secStyles.pbRating}>
                  <span style={{ color: '#e8001d' }}>{'★'.repeat(Math.round(pc.rating))}</span>
                  <span style={{ color: '#888888', marginLeft: 6, fontSize: 12 }}>{pc.rating} ({pc.reviews} reviews)</span>
                </div>

                <button style={{ ...secStyles.pbAddBtn, background: color }}
                  onClick={e => { e.stopPropagation(); addToCart({ ...pc, category: 'prebuilt', price: pc.price }); }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  {t('prebuilt_add_cart')} — {formatPrice(pc.price)}
                </button>
              </div>
            </div>
          );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

// ─── PRE-BUILT DETAIL PAGE ──────────────────────────────────────────────────
const PrebuiltDetailPage = ({ product: pc }) => {
  const { setPage, addToCart, toggleFav, favorites, t, formatPrice, currentUser } = React.useContext(window.AppContext);
  const [qty, setQty] = React.useState(1);
  const tierColors = { Budget: '#888888', 'Mid-Range': '#0077cc', 'High-End': '#7c3aed', Flagship: '#e8001d' };
  const color = tierColors[pc.tier] || '#e8001d';

  // Reviews & Related Products state
  const [reviews, setReviews] = React.useState([]);
  const [myRating, setMyRating] = React.useState(0);
  const [myComment, setMyComment] = React.useState('');
  const [hoverStar, setHoverStar] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [reviewMsg, setReviewMsg] = React.useState(null);
  const [relatedProducts, setRelatedProducts] = React.useState([]);

  const displayRating = React.useMemo(() => {
    if (reviews && reviews.length > 0) {
      return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    }
    return pc.rating || 0;
  }, [reviews, pc.rating]);

  const displayReviewsCount = React.useMemo(() => {
    if (reviews && reviews.length > 0) {
      return reviews.length;
    }
    return pc.reviews || 0;
  }, [reviews, pc.reviews]);

  React.useEffect(() => {
    if (!pc.id) return;
    fetch(`/api/pc/reviews/${pc.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setReviews(d.reviews || []);
        if (currentUser && d.reviews) {
          const mine = d.reviews.find(r => r.user_name === currentUser.name);
          if (mine) { setMyRating(mine.rating); setMyComment(mine.comment); }
        }
      }).catch(() => {});
  }, [pc.id, currentUser]);

  React.useEffect(() => {
    const related = (window.PREBUILTS || []).filter(p => p.id !== pc.id && p.tier === pc.tier).slice(0, 4);
    setRelatedProducts(related);
  }, [pc.id, pc.tier]);

  const submitReview = async () => {
    if (!myRating) return;
    setSubmitting(true);
    setReviewMsg(null);
    try {
      const data = await window.PcApi.submitReview({ product_id: pc.id, rating: myRating, comment: myComment });
      if (data.error) setReviewMsg({ ok: false, text: data.error });
      else {
        setReviewMsg({ ok: true, text: 'Avis enregistré !' });
        const r2 = await fetch(`/api/pc/reviews/${pc.id}`, { credentials: 'include' });
        const d2 = await r2.json();
        setReviews(d2.reviews || []);
      }
    } catch (e) {
      setReviewMsg({ ok: false, text: 'Erreur réseau.' });
    }
    setSubmitting(false);
  };

  // Build a specs-like object from the prebuilt's components
  const components = pc.components || {};
  const componentEntries = Object.entries(components);

  return (
    <div style={{ paddingTop: 64, padding: '64px 80px' }} className="rsp-cart-pad">
      {/* Back button + Name */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
        <button onClick={() => setPage('prebuilt')}
          style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:8, color:'#666666', cursor:'pointer', padding:'8px 14px', display:'flex', alignItems:'center', gap:6, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#e8001d';e.currentTarget.style.color='#e8001d';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#e0e0e0';e.currentTarget.style.color='#666666';}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {t('back')}
        </button>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'#111111', margin:0 }}>{pc.name}</h2>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, marginBottom:64 }}>
        {/* Visual */}
        <div style={{ background:`linear-gradient(135deg, ${color}10, #f0f0f0)`, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, position:'relative' }}>
          {pc.badge && <div style={{ position:'absolute', top:20, left:20, background: color + '20', color, fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:5, letterSpacing:'0.1em', zIndex:1 }}>{pc.badge}</div>}
          <ImageCarousel images={pc.images} category="prebuilt" height={360} />
        </div>

        {/* Info */}
        <div style={{ display:'flex', flexDirection:'column' }}>
          <div style={{ display:'inline-block', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:5, letterSpacing:'0.1em', marginBottom:12, width:'fit-content', background: color + '20', color }}>
            {pc.tier?.toUpperCase()} PRE-BUILT
          </div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:28, color:'#111111', margin:'0 0 12px 0', lineHeight:1.3 }}>{pc.name}</h1>

          <div style={{ display:'flex', alignItems:'center', marginBottom:20 }}>
            <span style={{ color:'#e8001d' }}>{'★'.repeat(Math.round(Number(displayRating)))}</span>
            <span style={{ color:'#111111', fontWeight:600, marginLeft:6 }}>{displayRating}</span>
            <span style={{ color:'#888888', marginLeft:4 }}>({Number(displayReviewsCount).toLocaleString()} reviews)</span>
          </div>

          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:40, color:'#e8001d', marginBottom:16 }}>{formatPrice(pc.price)}</div>

          {/* Performance indicators */}
          <div style={{ display:'flex', gap:20, marginBottom:24 }}>
            <div style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:10, padding:'14px 20px', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                <span style={{ color:'#888888', fontSize:11, fontWeight:600, letterSpacing:'0.1em' }}>GAMING</span>
              </div>
              <div style={{ color:'#111111', fontSize:14, fontWeight:600 }}>{pc.gaming}</div>
            </div>
            <div style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:10, padding:'14px 20px', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                <span style={{ color:'#888888', fontSize:11, fontWeight:600, letterSpacing:'0.1em' }}>WORKFLOW</span>
              </div>
              <div style={{ color:'#111111', fontSize:14, fontWeight:600 }}>{pc.workflow}</div>
            </div>
          </div>

          {/* Stock */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#4caf70' }}/>
            <span style={{ color:'#555555', fontSize:14 }}>In Stock — Ready to Ship</span>
          </div>

          {/* Quantity */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <button style={{ width:36, height:36, border:'1px solid #e0e0e0', background:'#ffffff', color:'#111111', borderRadius:8, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span style={{ color:'#111111', fontSize:16, fontWeight:600, minWidth:32, textAlign:'center' }}>{qty}</span>
            <button style={{ width:36, height:36, border:'1px solid #e0e0e0', background:'#ffffff', color:'#111111', borderRadius:8, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={() => setQty(q => q + 1)}>+</button>
          </div>

          {/* Add to Cart + Fav */}
          <div style={{ display:'flex', gap:10, marginBottom:12 }}>
            <button style={{ flex:1, padding:'14px', background:'#e8001d', color:'#ffffff', border:'none', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', transition:'background 0.2s' }}
              onClick={() => { for (let i = 0; i < qty; i++) addToCart({ ...pc, category: 'prebuilt' }); }}
              onMouseEnter={e => e.currentTarget.style.background = '#a80015'}
              onMouseLeave={e => e.currentTarget.style.background = '#e8001d'}>
              {t('prebuilt_add_cart')} — {formatPrice(pc.price * qty)}
            </button>
            <button style={{ width:50, height:50, border:`1px solid ${favorites.has(pc.id)?'#e8001d':'#e0e0e0'}`, background:'transparent', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: favorites.has(pc.id)?'#e8001d':'#999999', flexShrink:0, transition:'all 0.2s' }}
              onClick={() => toggleFav(pc.id)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.has(pc.id)?'#e8001d':'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      {(() => {
        const SPEC_KEYS = ['cpu', 'socket', 'gpu', 'gpu_vram', 'ram', 'ram_type', 'ram_speed', 'ram_capacity', 'storage', 'storage_type', 'storage_capacity', 'psu', 'psu_wattage', 'psu_efficiency', 'case', 'cooling'];
        const specRows = SPEC_KEYS.map(k => {
          const val = pc[k] || (pc.specs && pc.specs[k]);
          return { key: k, label: t(`spec_${k}`) || k.replace('_', ' ').toUpperCase(), val };
        }).filter(r => r.val);
        if (!specRows.length) return null;
        return (
          <div style={{ borderTop:'1px solid #e0e0e0', paddingTop:48, marginBottom:48 }}>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#111111', marginBottom:24 }}>{t('technical_specs')}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, border:'1px solid #e0e0e0', borderRadius:10, overflow:'hidden' }}>
              {specRows.map((row, i) => (
                <div key={row.key} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom: i < specRows.length - 1 ? '1px solid #eeeeee' : 'none' }}>
                  <div style={{ padding:'12px 20px', color:'#888888', fontSize:13, background:'#f8f8f8', fontFamily:"'DM Mono',monospace" }}>{row.label}</div>
                  <div style={{ padding:'12px 20px', color:'#111111', fontSize:13, background:'#ffffff', fontFamily:"'DM Mono',monospace" }}>{String(row.val)}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Reviews */}
      <div style={{ borderTop:'1px solid #e0e0e0', paddingTop:48, marginBottom:48 }}>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#111111', marginBottom:24 }}>
          Avis clients
          {reviews.length > 0 && (
            <span style={{ color:'#9f9f9f', fontWeight:400, fontSize:16, marginLeft:12 }}>
              {'★'.repeat(Math.round(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length))}
              {' '}{(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)} / 5
              {' '}({reviews.length} avis)
            </span>
          )}
        </h2>

        {/* Submit form */}
        {currentUser ? (
          <div style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:12, padding:24, marginBottom:32 }}>
            <div style={{ color:'#111111', fontWeight:600, marginBottom:16, fontFamily:"'Space Grotesk',sans-serif" }}>
              Votre avis
            </div>
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ fontSize:28, cursor:'pointer', color: (hoverStar||myRating) >= n ? '#e8001d' : '#3c3c3c', transition:'color 0.1s' }}
                  onMouseEnter={()=>setHoverStar(n)} onMouseLeave={()=>setHoverStar(0)}
                  onClick={()=>setMyRating(n)}>★</span>
              ))}
              {myRating > 0 && <span style={{ color:'#9f9f9f', fontSize:13, alignSelf:'center', marginLeft:8 }}>{myRating} / 5</span>}
            </div>
            <textarea value={myComment} onChange={e=>setMyComment(e.target.value)} placeholder={t("review_placeholder")}
              style={{ width:'100%', minHeight:90, background:'#f8f8f8', border:'1px solid #e0e0e0', borderRadius:8, color:'#111111', padding:'10px 14px', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, resize:'vertical', boxSizing:'border-box', outline:'none' }} />
            <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:12 }}>
              <button onClick={submitReview} disabled={!myRating||submitting}
                style={{ background: myRating ? '#e8001d' : '#3c3c3c', color:'#ffffff', border:'none', borderRadius:8, padding:'10px 24px', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, cursor: myRating ? 'pointer' : 'not-allowed', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? t('submitting') : t('submit_review')}
              </button>
              {reviewMsg && <span style={{ color: reviewMsg.ok ? '#4caf50' : '#e8001d', fontSize:13 }}>{reviewMsg.text}</span>}
            </div>
          </div>
        ) : (
          <div style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:12, padding:20, marginBottom:32, color:'#666666', fontSize:14 }}>
            <span style={{ color:'#e8001d', cursor:'pointer', fontWeight:600 }} onClick={()=>setPage('user')}>Connectez-vous</span> pour laisser un avis.
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div style={{ color:'#a8a8a8', fontSize:14 }}>Aucun avis pour le moment. Soyez le premier !</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:12, padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <span style={{ color:'#111111', fontWeight:600, fontFamily:"'Space Grotesk',sans-serif" }}>{r.user_name}</span>
                    <span style={{ color:'#e8001d', marginLeft:12, fontSize:16 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                  </div>
                  <span style={{ color:'#888888', fontSize:12 }}>{r.date}</span>
                </div>
                {r.comment && <p style={{ color:'#555555', fontSize:14, margin:0, lineHeight:1.6 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Produits similaires */}
      {relatedProducts.length > 0 && (
        <div style={{ borderTop:'1px solid #e0e0e0', paddingTop:48 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#111111', marginBottom:24 }}>Produits similaires</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }} className="rsp-grid-4">
            {relatedProducts.map(rp => (
              <div key={rp.id}
                style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:12, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}
                onClick={() => { setPage('prebuilt-detail', { product: rp }); window.scrollTo(0,0); }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='#e8001d'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e0e0e0'; e.currentTarget.style.transform='none'; }}>
                <div style={{ height:130, background:'linear-gradient(135deg,#f0f0f0,#fafafa)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {rp.images?.[0]
                    ? <img src={rp.images[0]} alt={rp.name} style={{ height:'100%', width:'100%', objectFit:'contain', padding:8 }} onError={e=>e.target.style.display='none'} />
                    : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="3"/></svg>
                  }
                </div>
                <div style={{ padding:'12px 14px' }}>
                  <div style={{ color:'#888888', fontSize:10, fontWeight:700, letterSpacing:'0.12em', marginBottom:4 }}>PRE-BUILT</div>
                  <div style={{ color:'#111111', fontWeight:600, fontSize:13, lineHeight:1.3, marginBottom:6 }}>{rp.name.length>40?rp.name.slice(0,40)+'…':rp.name}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:'#e8001d', fontSize:11 }}>{'★'.repeat(Math.round(rp.rating||0))}</span>
                    <span style={{ color:'#e8001d', fontWeight:700, fontSize:15, fontFamily:"'Space Grotesk',sans-serif" }}>{formatPrice(rp.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ONLY ONE PC PAGE ────────────────────────────────────────────────────────
const OnlyOnePcPage = () => {
  const { setPage, addToCart, toggleFav, favorites, t, formatPrice, dataLoaded } = React.useContext(window.AppContext);
  const tierColors = { Budget: '#888888', 'Mid-Range': '#0077cc', 'High-End': '#7c3aed', Flagship: '#e8001d' };
  const [search, setSearch] = React.useState('');
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState([0, 30000]);
  const [minRating, setMinRating] = React.useState(0);
  const [brands, setBrands] = React.useState([]);
  const [sortBy, setSortBy] = React.useState('featured');

  const filtered = React.useMemo(() => {
    let prods = window.ONLYONEPCS || [];
    if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (inStockOnly) prods = prods.filter(p => p.stock !== 'out_of_stock');
    if (brands.length) prods = prods.filter(p => brands.includes(p.brand));
    prods = prods.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) prods = prods.filter(p => (p.rating || 0) >= minRating);
    if (sortBy === 'price_asc') prods = [...prods].sort((a,b) => a.price - b.price);
    else if (sortBy === 'price_desc') prods = [...prods].sort((a,b) => b.price - a.price);
    else if (sortBy === 'rating') prods = [...prods].sort((a,b) => (b.rating||0) - (a.rating||0));
    else if (sortBy === 'reviews') prods = [...prods].sort((a,b) => (b.reviews||0) - (a.reviews||0));
    return prods;
  }, [search, inStockOnly, priceRange, minRating, brands, sortBy, dataLoaded]);

  const availableBrands = React.useMemo(() => [...new Set((window.ONLYONEPCS||[]).map(p => p.brand).filter(Boolean))].sort(), [dataLoaded]);

  return (
    <div style={secStyles.page}>
      <div style={secStyles.heroBanner} className="rsp-banner">
        <video autoPlay loop muted playsInline style={secStyles.heroBannerImg}>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div style={secStyles.heroBannerGrid} />
        <div style={secStyles.heroBannerGlow} />
        <div style={secStyles.heroBannerOverlay} />
        <div style={secStyles.heroBannerContent} className="rsp-banner-content">
          <div style={secStyles.headerEye} className="rsp-banner-eye">UNIQUE BUILDS</div>
          <h1 style={{ ...secStyles.pageTitle, color:'#ffffff' }} className="rsp-banner-title">{t('onlyone_title')}</h1>
          <p style={{ ...secStyles.pageDesc, color:'rgba(255,255,255,0.7)' }}>{t('onlyone_banner_desc')}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, borderBottom: '1px solid #e0e0e0', marginBottom: 24, background: '#ffffff' }}>
        <button onClick={() => setPage('onlyonepc')}
          style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: '2px solid #e8001d', color: '#111111', fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Configurations Uniques
        </button>
        <button onClick={() => setPage('onlyone_builder')}
          style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#888888', fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e=>e.currentTarget.style.color='#111111'} onMouseLeave={e=>e.currentTarget.style.color='#888888'}>
          Configurateur Sur Mesure
        </button>
      </div>

      <div style={secStyles.layout} className="rsp-catalog">
        <SharedSidebar inStockOnly={inStockOnly} setInStockOnly={setInStockOnly} priceRange={priceRange} setPriceRange={setPriceRange} minRating={minRating} setMinRating={setMinRating} brands={brands} setBrands={setBrands} availableBrands={availableBrands} maxPrice={15000} priceStep={500} />
        <main style={secStyles.main}>
          <div style={secStyles.toolbar}>
            <input placeholder={t("search_in_results") || "Rechercher..."} value={search} onChange={e=>setSearch(e.target.value)} style={secStyles.searchInput} />
            <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
              <span style={{ color:'#888888', fontSize:13 }}>{t('products_count', filtered.length) || `${filtered.length} produits`}</span>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={secStyles.sortSelect}>
                {[["featured",t("sort_featured")||"En vedette"],["price_asc",t("sort_price_asc")||"Prix croissant"],["price_desc",t("sort_price_desc")||"Prix décroissant"],["rating",t("sort_rating")||"Meilleures notes"],["reviews",t("sort_reviews")||"Plus commentés"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={secStyles.pbGrid} className="rsp-pb-grid">
            {filtered.length === 0 ? (
              <div style={secStyles.empty}>
                <div style={{ color:'#888888' }}>{t('no_products') || 'Aucun produit'}</div>
              </div>
            ) : filtered.map(pc => {
          const color = tierColors[pc.tier] || '#6c5ce7';
          return (
            <div key={pc.id} style={{ ...secStyles.pbCard, cursor:'pointer' }}
              onClick={() => setPage('onlyonepc-detail', { product: pc })}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.transform = 'none'; }}>
              {pc.badge && <div style={{ ...secStyles.pbBadge, background: color + '20', color }}>{pc.badge}</div>}
              <button style={{ position:'absolute', top:14, left:14, background:'rgba(255,255,255,0.9)', border:'1px solid #e0e0e0', cursor:'pointer', width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, color: favorites.has(pc.id)?'#e8001d':'#9f9f9f' }}
                onClick={e => { e.stopPropagation(); toggleFav(pc.id); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={favorites.has(pc.id)?'#e8001d':'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              {/* Visual - Premium Aquarium Case */}
              <div style={{ ...secStyles.pbVisual, background: `linear-gradient(135deg, ${color}18, #f8f8f8)`, height:180 }}>
                <ImageCarousel images={pc.images} category="case" height={180} />
              </div>

              <div style={secStyles.pbBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ ...secStyles.pbTier, color }}>{pc.tier?.toUpperCase()}</div>
                    <div style={secStyles.pbName}>{pc.name}</div>
                  </div>
                  <div style={secStyles.pbPrice}>{formatPrice(pc.price)}</div>
                </div>

                <div style={secStyles.pbPerf}>
                  <div style={secStyles.pbPerfItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    <span style={{ color: '#666666', fontSize: 12 }}>{pc.gaming}</span>
                  </div>
                  <div style={secStyles.pbPerfItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                    <span style={{ color: '#666666', fontSize: 12 }}>{pc.workflow}</span>
                  </div>
                </div>

                <div style={secStyles.pbRating}>
                  <span style={{ color: '#e8001d' }}>{'★'.repeat(Math.round(pc.rating))}</span>
                  <span style={{ color: '#888888', marginLeft: 6, fontSize: 12 }}>{pc.rating} ({pc.reviews} reviews)</span>
                </div>

                <button style={{ ...secStyles.pbAddBtn, background: color }}
                  onClick={e => { e.stopPropagation(); addToCart({ ...pc, category: 'onlyonepc', price: pc.price }); }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  {t('prebuilt_add_cart')} — {formatPrice(pc.price)}
                </button>
              </div>
            </div>
          );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

// ─── ONLY ONE PC DETAIL PAGE ────────────────────────────────────────────────
const OnlyOnePcDetailPage = ({ product: pc }) => {
  const { setPage, addToCart, toggleFav, favorites, t, formatPrice, currentUser } = React.useContext(window.AppContext);
  const tierColors = { Budget: '#888888', 'Mid-Range': '#0077cc', 'High-End': '#7c3aed', Flagship: '#e8001d' };
  const color = tierColors[pc.tier] || '#6c5ce7';

  // Reviews & Related Products state
  const [reviews, setReviews] = React.useState([]);
  const [myRating, setMyRating] = React.useState(0);
  const [myComment, setMyComment] = React.useState('');
  const [hoverStar, setHoverStar] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [reviewMsg, setReviewMsg] = React.useState(null);
  const [relatedProducts, setRelatedProducts] = React.useState([]);

  const displayRating = React.useMemo(() => {
    if (reviews && reviews.length > 0) {
      return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    }
    return pc.rating || 0;
  }, [reviews, pc.rating]);

  const displayReviewsCount = React.useMemo(() => {
    if (reviews && reviews.length > 0) {
      return reviews.length;
    }
    return pc.reviews || 0;
  }, [reviews, pc.reviews]);

  React.useEffect(() => {
    if (!pc.id) return;
    fetch(`/api/pc/reviews/${pc.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setReviews(d.reviews || []);
        if (currentUser && d.reviews) {
          const mine = d.reviews.find(r => r.user_name === currentUser.name);
          if (mine) { setMyRating(mine.rating); setMyComment(mine.comment); }
        }
      }).catch(() => {});
  }, [pc.id, currentUser]);

  React.useEffect(() => {
    const related = (window.ONLYONEPCS || []).filter(p => p.id !== pc.id && p.tier === pc.tier).slice(0, 4);
    setRelatedProducts(related);
  }, [pc.id, pc.tier]);

  const submitReview = async () => {
    if (!myRating) return;
    setSubmitting(true);
    setReviewMsg(null);
    try {
      const data = await window.PcApi.submitReview({ product_id: pc.id, rating: myRating, comment: myComment });
      if (data.error) setReviewMsg({ ok: false, text: data.error });
      else {
        setReviewMsg({ ok: true, text: 'Avis enregistré !' });
        const r2 = await fetch(`/api/pc/reviews/${pc.id}`, { credentials: 'include' });
        const d2 = await r2.json();
        setReviews(d2.reviews || []);
      }
    } catch (e) {
      setReviewMsg({ ok: false, text: 'Erreur réseau.' });
    }
    setSubmitting(false);
  };

  return (
    <div style={{ paddingTop: 64, padding: '64px 80px' }} className="rsp-cart-pad">
      {/* Back button + Name */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
        <button onClick={() => setPage('onlyonepc')}
          style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:8, color:'#666666', cursor:'pointer', padding:'8px 14px', display:'flex', alignItems:'center', gap:6, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#e8001d';e.currentTarget.style.color='#e8001d';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#e0e0e0';e.currentTarget.style.color='#666666';}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {t('back')}
        </button>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'#111111', margin:0 }}>{pc.name}</h2>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, marginBottom:64 }}>
        {/* Visual */}
        <div style={{ background:`linear-gradient(135deg, ${color}10, #f0f0f0)`, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, position:'relative' }}>
          {pc.badge && <div style={{ position:'absolute', top:20, left:20, background: color + '20', color, fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:5, letterSpacing:'0.1em', zIndex:1 }}>{pc.badge}</div>}
          <ImageCarousel images={pc.images} category="case" height={360} />
        </div>

        {/* Info */}
        <div style={{ display:'flex', flexDirection:'column' }}>
          <div style={{ display:'inline-block', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:5, letterSpacing:'0.1em', marginBottom:12, width:'fit-content', background: color + '20', color }}>
            {pc.tier?.toUpperCase()} ONLY ONE PC
          </div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:28, color:'#111111', margin:'0 0 12px 0', lineHeight:1.3 }}>{pc.name}</h1>

          <div style={{ display:'flex', alignItems:'center', marginBottom:20 }}>
            <span style={{ color:'#e8001d' }}>{'★'.repeat(Math.round(Number(displayRating)))}</span>
            <span style={{ color:'#111111', fontWeight:600, marginLeft:6 }}>{displayRating}</span>
            <span style={{ color:'#888888', marginLeft:4 }}>({Number(displayReviewsCount).toLocaleString()} reviews)</span>
          </div>

          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:40, color:'#e8001d', marginBottom:16 }}>{formatPrice(pc.price)}</div>

          {/* Performance indicators */}
          <div style={{ display:'flex', gap:20, marginBottom:24 }}>
            <div style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:10, padding:'14px 20px', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                <span style={{ color:'#888888', fontSize:11, fontWeight:600, letterSpacing:'0.1em' }}>GAMING</span>
              </div>
              <div style={{ color:'#111111', fontSize:14, fontWeight:600 }}>{pc.gaming}</div>
            </div>
            <div style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:10, padding:'14px 20px', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                <span style={{ color:'#888888', fontSize:11, fontWeight:600, letterSpacing:'0.1em' }}>WORKFLOW</span>
              </div>
              <div style={{ color:'#111111', fontSize:14, fontWeight:600 }}>{pc.workflow}</div>
            </div>
          </div>

          {/* Stock */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#4caf70' }}/>
            <span style={{ color:'#555555', fontSize:14 }}>Unique Build — Ready to Ship</span>
          </div>

          {/* Add to Cart + Fav */}
          <div style={{ display:'flex', gap:10, marginBottom:12 }}>
            <button style={{ flex:1, padding:'14px', background:'#e8001d', color:'#ffffff', border:'none', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', transition:'background 0.2s' }}
              onClick={() => { addToCart({ ...pc, category: 'onlyonepc' }); }}
              onMouseEnter={e => e.currentTarget.style.background = '#a80015'}
              onMouseLeave={e => e.currentTarget.style.background = '#e8001d'}>
              {t('prebuilt_add_cart')} — {formatPrice(pc.price)}
            </button>
            <button style={{ width:50, height:50, border:`1px solid ${favorites.has(pc.id)?'#e8001d':'#e0e0e0'}`, background:'transparent', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: favorites.has(pc.id)?'#e8001d':'#999999', flexShrink:0, transition:'all 0.2s' }}
              onClick={() => toggleFav(pc.id)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.has(pc.id)?'#e8001d':'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      {(() => {
        const SPEC_KEYS = ['cpu', 'socket', 'gpu', 'gpu_vram', 'ram', 'ram_type', 'ram_speed', 'ram_capacity', 'storage', 'storage_type', 'storage_capacity', 'psu', 'psu_wattage', 'psu_efficiency', 'case', 'cooling'];
        const specRows = SPEC_KEYS.map(k => {
          const val = pc[k] || (pc.specs && pc.specs[k]);
          return { key: k, label: t(`spec_${k}`) || k.replace('_', ' ').toUpperCase(), val };
        }).filter(r => r.val);
        if (!specRows.length) return null;
        return (
          <div style={{ borderTop:'1px solid #e0e0e0', paddingTop:48, marginBottom:48 }}>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#111111', marginBottom:24 }}>{t('technical_specs')}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, border:'1px solid #e0e0e0', borderRadius:10, overflow:'hidden' }}>
              {specRows.map((row, i) => (
                <div key={row.key} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom: i < specRows.length - 1 ? '1px solid #eeeeee' : 'none' }}>
                  <div style={{ padding:'12px 20px', color:'#888888', fontSize:13, background:'#f8f8f8', fontFamily:"'DM Mono',monospace" }}>{row.label}</div>
                  <div style={{ padding:'12px 20px', color:'#111111', fontSize:13, background:'#ffffff', fontFamily:"'DM Mono',monospace" }}>{String(row.val)}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Reviews */}
      <div style={{ borderTop:'1px solid #e0e0e0', paddingTop:48, marginBottom:48 }}>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#111111', marginBottom:24 }}>
          Avis clients
          {reviews.length > 0 && (
            <span style={{ color:'#9f9f9f', fontWeight:400, fontSize:16, marginLeft:12 }}>
              {'★'.repeat(Math.round(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length))}
              {' '}{(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)} / 5
              {' '}({reviews.length} avis)
            </span>
          )}
        </h2>

        {/* Submit form */}
        {currentUser ? (
          <div style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:12, padding:24, marginBottom:32 }}>
            <div style={{ color:'#111111', fontWeight:600, marginBottom:16, fontFamily:"'Space Grotesk',sans-serif" }}>
              Votre avis
            </div>
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ fontSize:28, cursor:'pointer', color: (hoverStar||myRating) >= n ? '#e8001d' : '#3c3c3c', transition:'color 0.1s' }}
                  onMouseEnter={()=>setHoverStar(n)} onMouseLeave={()=>setHoverStar(0)}
                  onClick={()=>setMyRating(n)}>★</span>
              ))}
              {myRating > 0 && <span style={{ color:'#9f9f9f', fontSize:13, alignSelf:'center', marginLeft:8 }}>{myRating} / 5</span>}
            </div>
            <textarea value={myComment} onChange={e=>setMyComment(e.target.value)} placeholder={t("review_placeholder")}
              style={{ width:'100%', minHeight:90, background:'#f8f8f8', border:'1px solid #e0e0e0', borderRadius:8, color:'#111111', padding:'10px 14px', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, resize:'vertical', boxSizing:'border-box', outline:'none' }} />
            <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:12 }}>
              <button onClick={submitReview} disabled={!myRating||submitting}
                style={{ background: myRating ? '#e8001d' : '#3c3c3c', color:'#ffffff', border:'none', borderRadius:8, padding:'10px 24px', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, cursor: myRating ? 'pointer' : 'not-allowed', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? t('submitting') : t('submit_review')}
              </button>
              {reviewMsg && <span style={{ color: reviewMsg.ok ? '#4caf50' : '#e8001d', fontSize:13 }}>{reviewMsg.text}</span>}
            </div>
          </div>
        ) : (
          <div style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:12, padding:20, marginBottom:32, color:'#666666', fontSize:14 }}>
            <span style={{ color:'#e8001d', cursor:'pointer', fontWeight:600 }} onClick={()=>setPage('user')}>Connectez-vous</span> pour laisser un avis.
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div style={{ color:'#a8a8a8', fontSize:14 }}>Aucun avis pour le moment. Soyez le premier !</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:12, padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <span style={{ color:'#111111', fontWeight:600, fontFamily:"'Space Grotesk',sans-serif" }}>{r.user_name}</span>
                    <span style={{ color:'#e8001d', marginLeft:12, fontSize:16 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                  </div>
                  <span style={{ color:'#888888', fontSize:12 }}>{r.date}</span>
                </div>
                {r.comment && <p style={{ color:'#555555', fontSize:14, margin:0, lineHeight:1.6 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Produits similaires */}
      {relatedProducts.length > 0 && (
        <div style={{ borderTop:'1px solid #e0e0e0', paddingTop:48 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#111111', marginBottom:24 }}>Configurations similaires</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }} className="rsp-grid-4">
            {relatedProducts.map(rp => (
              <div key={rp.id}
                style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:12, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}
                onClick={() => { setPage('onlyonepc-detail', { product: rp }); window.scrollTo(0,0); }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='#e8001d'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e0e0e0'; e.currentTarget.style.transform='none'; }}>
                <div style={{ height:130, background:'linear-gradient(135deg,#f0f0f0,#fafafa)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {rp.images?.[0]
                    ? <img src={rp.images[0]} alt={rp.name} style={{ height:'100%', width:'100%', objectFit:'contain', padding:8 }} onError={e=>e.target.style.display='none'} />
                    : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="3"/></svg>
                  }
                </div>
                <div style={{ padding:'12px 14px' }}>
                  <div style={{ color:'#888888', fontSize:10, fontWeight:700, letterSpacing:'0.12em', marginBottom:4 }}>ONLY ONE PC</div>
                  <div style={{ color:'#111111', fontWeight:600, fontSize:13, lineHeight:1.3, marginBottom:6 }}>{rp.name.length>40?rp.name.slice(0,40)+'…':rp.name}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:'#e8001d', fontSize:11 }}>{'★'.repeat(Math.round(rp.rating||0))}</span>
                    <span style={{ color:'#e8001d', fontWeight:700, fontSize:15, fontFamily:"'Space Grotesk',sans-serif" }}>{formatPrice(rp.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PERIPHERALS ─────────────────────────────────────────────────────────────
const getPeriGroups = (t) => {
  const cats = window.PC_CATEGORIES_DATA || [];
  let peris = cats.filter(c => c.type === 'peripheral');

  // If no categories from backend, provide defaults to avoid empty UI
  if (peris.length === 0) {
    peris = [
      { code: 'keyboard', name: t('label_keyboard'), peri_group: 'input', sequence: 1 },
      { code: 'mouse', name: t('label_mouse'), peri_group: 'input', sequence: 2 },
      { code: 'microphone', name: t('label_microphone'), peri_group: 'input', sequence: 3 },
      { code: 'webcam', name: t('label_webcam'), peri_group: 'input', sequence: 4 },
      { code: 'monitor', name: t('label_monitor'), peri_group: 'output', sequence: 1 },
      { code: 'speaker', name: t('label_speaker'), peri_group: 'output', sequence: 2 },
      { code: 'headset', name: t('label_headset'), peri_group: 'output', sequence: 3 },
      { code: 'usb', name: t('label_usb'), peri_group: 'io', sequence: 1 },
      { code: 'external_hdd', name: t('label_external_hdd'), peri_group: 'io', sequence: 2 },
      { code: 'network', name: t('label_network'), peri_group: 'io', sequence: 3 },
    ];
  }

  return [
    {
      id: 'input', label: t('input_devices'), icon: '⌨️',
      tabs: peris.filter(c => c.peri_group === 'input').sort((a,b) => (a.sequence||10) - (b.sequence||10)).map(c => ({ key: c.code, label: c.name })),
    },
    {
      id: 'output', label: t('output_devices'), icon: '🔊',
      tabs: peris.filter(c => c.peri_group === 'output').sort((a,b) => (a.sequence||10) - (b.sequence||10)).map(c => ({ key: c.code, label: c.name })),
    },
    {
      id: 'io', label: t('io_devices'), icon: '🔌',
      tabs: peris.filter(c => c.peri_group === 'io').sort((a,b) => (a.sequence||10) - (b.sequence||10)).map(c => ({ key: c.code, label: c.name })),
    },
  ];
};

const PERI_VISUALS = {};

const PeripheralsPage = () => {
  const { setPage, addToCart, toggleFav, favorites, t, formatPrice, dataLoaded, searchQuery } = React.useContext(window.AppContext);
  const PERI_GROUPS = getPeriGroups(t);

  const [activeGroup, setActiveGroup] = React.useState('input');
  const [activeTab, setActiveTab] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState([0, 5000]);
  const [minRating, setMinRating] = React.useState(0);
  const [brands, setBrands] = React.useState([]);
  const [sortBy, setSortBy] = React.useState('featured');

  // Sync activeTab when group changes or data loads
  React.useEffect(() => {
    if (PERI_GROUPS.length > 0) {
      const g = PERI_GROUPS.find(x => x.id === activeGroup) || PERI_GROUPS[0];
      if (!activeTab || !g.tabs.find(t => t.key === activeTab)) {
        if (g.tabs.length > 0) setActiveTab(g.tabs[0].key);
      }
    }
  }, [activeGroup, PERI_GROUPS, dataLoaded]);

  const filtered = React.useMemo(() => {
    if (!activeTab) return [];
    let prods = window.PERIPHERALS_DATA[activeTab] || [];
    const q = (search || searchQuery || '').toLowerCase();
    if (q) {
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    if (inStockOnly) prods = prods.filter(p => p.stock !== 'out_of_stock');
    if (brands.length) prods = prods.filter(p => brands.includes(p.brand));
    prods = prods.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) prods = prods.filter(p => (p.rating || 0) >= minRating);
    if (sortBy === 'price_asc') prods = [...prods].sort((a,b) => a.price - b.price);
    else if (sortBy === 'price_desc') prods = [...prods].sort((a,b) => b.price - a.price);
    else if (sortBy === 'rating') prods = [...prods].sort((a,b) => (b.rating||0) - (a.rating||0));
    else if (sortBy === 'reviews') prods = [...prods].sort((a,b) => (b.reviews||0) - (a.reviews||0));
    return prods;
  }, [activeTab, search, searchQuery, inStockOnly, priceRange, minRating, brands, sortBy, dataLoaded]);

  const availableBrands = React.useMemo(() => {
    if (!activeTab) return [];
    return [...new Set((window.PERIPHERALS_DATA[activeTab]||[]).map(p => p.brand).filter(Boolean))].sort();
  }, [activeTab, dataLoaded]);

  const currentGroup = PERI_GROUPS.find(g => g.id === activeGroup) || PERI_GROUPS[0];
  if (!currentGroup || !dataLoaded) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', color: '#666', background: '#f5f5f5', minHeight: '80vh' }}>
        <p style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Chargement des périphériques...</p>
      </div>
    );
  }


  const handleGroupSwitch = (gid) => {
    setActiveGroup(gid);
    const grp = PERI_GROUPS.find(g => g.id === gid);
    setActiveTab(grp.tabs[0].key);
  };

  return (
    <div style={secStyles.page}>
      {/* Peripherals Banner */}
      <div style={secStyles.heroBanner} className="rsp-banner">
        <video autoPlay loop muted playsInline style={secStyles.heroBannerImg}>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div style={secStyles.heroBannerGrid} />
        <div style={secStyles.heroBannerGlow} />
        <div style={secStyles.heroBannerOverlay} />
        <div style={secStyles.heroBannerContent} className="rsp-banner-content">
          <div style={secStyles.headerEye} className="rsp-banner-eye">COMPLÉTEZ VOTRE SETUP</div>
          <h1 style={{ ...secStyles.pageTitle, color:'#ffffff' }} className="rsp-banner-title">Périphériques</h1>
          <p style={{ ...secStyles.pageDesc, color:'rgba(255,255,255,0.7)' }}>Entrée, sortie, mixte — tout ce qui se connecte à votre PC.</p>
        </div>
      </div>

      {/* Group tabs */}
      <div style={periStyles.groupBar}>
        {PERI_GROUPS.map(g => (
          <button key={g.id}
            style={{ ...periStyles.groupBtn, ...(activeGroup === g.id ? periStyles.groupBtnActive : {}) }}
            onClick={() => handleGroupSwitch(g.id)}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: activeGroup === g.id ? '#ffffff' : '#333333' }}>{g.label}</div>
              <div style={{ fontSize: 11, color: activeGroup === g.id ? '#ffcccc' : '#888888', marginTop: 1 }}>{g.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={secStyles.layout} className="rsp-catalog">
        <SharedSidebar inStockOnly={inStockOnly} setInStockOnly={setInStockOnly} priceRange={priceRange} setPriceRange={setPriceRange} minRating={minRating} setMinRating={setMinRating} brands={brands} setBrands={setBrands} availableBrands={availableBrands} maxPrice={2000} priceStep={50} />
        <main style={secStyles.main}>
          <div style={secStyles.toolbar}>
            <input placeholder={t("search_in_results") || "Rechercher..."} value={search} onChange={e=>setSearch(e.target.value)} style={secStyles.searchInput} />
            <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
              <span style={{ color:'#888888', fontSize:13 }}>{t('products_count', filtered.length) || `${filtered.length} produits`}</span>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={secStyles.sortSelect}>
                {[["featured",t("sort_featured")||"En vedette"],["price_asc",t("sort_price_asc")||"Prix croissant"],["price_desc",t("sort_price_desc")||"Prix décroissant"],["rating",t("sort_rating")||"Meilleures notes"],["reviews",t("sort_reviews")||"Plus commentés"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={periStyles.subTabs}>
            {currentGroup.tabs.map(t => (
              <button key={t.key}
                style={{ ...periStyles.subTab, ...(activeTab === t.key ? periStyles.subTabActive : {}) }}
                onClick={() => { setActiveTab(t.key); setBrands([]); }}>
                {t.label}
                <span style={{ ...periStyles.subTabCount, color: activeTab === t.key ? '#111111' : '#888888' }}>
                  {(window.PERIPHERALS_DATA[t.key] || []).length}
                </span>
              </button>
            ))}
          </div>
          <div style={periStyles.grid} className="rsp-grid-3">
            {filtered.length === 0 ? (
              <div style={secStyles.empty}>
                <div style={{ color:'#888888' }}>{t('no_products') || 'Aucun produit'}</div>
              </div>
            ) : filtered.map(p => (
            <PeriProductCard key={p.id} product={p}
              visual={PERI_VISUALS[p.category]}
              onAdd={() => addToCart(p)}
              onFav={() => toggleFav(p.id)}
              onView={() => setPage('product', { product: p })}
              isFav={favorites.has(p.id)} />
          ))}
          </div>
        </main>
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
    <div style={{ background:'#ffffff', border:`1px solid ${hov ? color : '#e0e0e0'}`, borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', transition:'all 0.25s', position:'relative', transform: hov ? 'translateY(-4px)' : 'none', boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

      <button style={{ position:'absolute', top:14, left:14, background:'rgba(255,255,255,0.9)', border:'1px solid #e0e0e0', cursor:'pointer', width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, color: isFav?'#e8001d':'#9f9f9f' }}
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

      <div style={{ height:200, background:`linear-gradient(135deg, ${color}18, #f8f8f8)`, overflow:'hidden', cursor:'pointer' }} onClick={onView}>
        <ImageCarousel images={product.images} category={product.category} />
      </div>

      <div style={{ padding:'20px', flex:1, display:'flex', flexDirection:'column' }} onClick={onView}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div style={{ flex:1, minWidth:0, paddingRight:10 }}>
            <div style={{ color, fontSize:10, fontWeight:700, letterSpacing:'0.15em', marginBottom:5 }}>{label?.toUpperCase()}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'#111111', lineHeight:1.3 }}>{product.name}</div>
            {product.brand && <div style={{ color:'#888888', fontSize:11, marginTop:3 }}>{product.brand}</div>}
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'#e8001d', flexShrink:0 }}>{formatPrice(product.price)}</div>
        </div>

        {specEntries.length > 0 && (
          <div style={{ background:'#f5f5f5', borderRadius:8, padding:'9px 12px', marginBottom:12 }}>
            {specEntries.map(([k, v], i) => (
              <div key={k} style={{ display:'flex', gap:8, alignItems:'baseline', ...(i < specEntries.length - 1 ? { marginBottom:4, borderBottom:'1px solid #eeeeee', paddingBottom:4 } : {}) }}>
                <span style={{ color:'#888888', fontSize:10, minWidth:56, flexShrink:0 }}>{k}</span>
                <span style={{ color:'#333333', fontSize:11, fontFamily:"'DM Mono',monospace" }}>{Array.isArray(v) ? v.join(', ') : String(v)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <span style={{ color:'#e8001d', fontSize:12 }}>{'★'.repeat(Math.round(product.rating))}</span>
            <span style={{ color:'#888888', marginLeft:5, fontSize:11 }}>{product.rating} ({product.reviews?.toLocaleString()})</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background: product.stock==='out_of_stock'?'#cc4444':product.stock==='low_stock'?'#e8a020':'#4caf70' }} />
            <span style={{ color: product.stock==='out_of_stock'?'#cc4444':product.stock==='low_stock'?'#e8a020':'#b0b0b0', fontSize:11 }}>
              {product.stock==='in_stock'?t('in_stock'):product.stock==='low_stock'?t('low_stock'):t('out_of_stock')}
            </span>
          </div>
        </div>

        <button style={{ width:'100%', padding:'12px', background:color, color:'#ffffff', border:'none', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer', transition:'opacity 0.2s', marginTop:'auto' }}
          onClick={e => { e.stopPropagation(); onAdd(); }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          {t('add_to_cart', formatPrice(product.price))}
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
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="1.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 20, color: '#888888' }}>{t('cart_empty')}</div>
      <button style={{ ...window.homeStyles.heroBtnPrimary, marginTop: 8 }} onClick={() => setPage('catalog')}>{t('browse_catalog')}</button>
    </div>
  );

  return (
    <div style={{ paddingTop: 64, padding: '64px 80px' }} className="rsp-cart-pad">
      <h1 style={secStyles.pageTitle2}>{t('cart_title')} <span style={{ color: '#888888', fontWeight: 400, fontSize: 20 }}>({cart.length})</span></h1>
      <div style={secStyles.cartLayout} className="rsp-cart">
        {/* Items */}
        <div style={{ flex: 1 }}>
          {cart.map(item => (
            <div key={item.cartId} style={secStyles.cartItem}>
              <div style={{ ...secStyles.cartImg, background: `linear-gradient(135deg,#f0f0f0,#e8e8e8)` }}>
                <ProductVisual category={item.category} imageUrl={item.image_url} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#888888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{item.brand || item.tier || item.category}</div>
                <div style={{ color: '#111111', fontWeight: 600, fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{item.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={secStyles.qtyControl}>
                    <button style={secStyles.qtyBtnSm} onClick={() => updateQty(item.cartId, item.qty - 1)}>−</button>
                    <span style={{ color: '#111111', fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
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
                <div style={{ color: '#111111', fontWeight: 700, fontSize: 20, fontFamily: "'Space Grotesk',sans-serif" }}>{formatPrice(item.price * item.qty)}</div>
                {item.qty > 1 && <div style={{ color: '#888888', fontSize: 12 }}>{formatPrice(item.price)} each</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={secStyles.cartSummary}>
          <div style={secStyles.summaryTitle}>{t('order_summary')}</div>
          <div style={secStyles.summaryRow}>
            <span style={{ color: '#888888' }}>{t('cart_subtotal')}</span>
            <span style={{ color: '#111111' }}>{formatPrice(subtotal)}</span>
          </div>
          {couponApplied && (
            <div style={secStyles.summaryRow}>
              <span style={{ color: '#909090' }}>Coupon (INSHOP10)</span>
              <span style={{ color: '#909090' }}>−{formatPrice(discount)}</span>
            </div>
          )}
          <div style={secStyles.summaryRow}>
            <span style={{ color: '#888888' }}>{t('cart_shipping')}</span>
            <span style={{ color: shipping === 0 ? '#4caf70' : '#111111' }}>{shipping === 0 ? t('cart_free') : formatPrice(shipping)}</span>
          </div>
          {subtotal < 500 && <div style={{ color: '#888888', fontSize: 11, marginBottom: 12 }}>Free shipping on orders over {formatPrice(500)}</div>}
          <div style={secStyles.summaryDivider} />
          <div style={{ ...secStyles.summaryRow, marginBottom: 20 }}>
            <span style={{ color: '#111111', fontWeight: 700, fontSize: 16 }}>{t('cart_total')}</span>
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
const STATUS_COLORS = { delivered:'#55efc4', shipped:'#74b9ff', preparing:'#a29bfe', processing:'#fdcb6e', cancelled:'#cc4444' };
const STATUS_LABELS = { processing:'Reçue', preparing:'En préparation', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' };

const ORDER_TIMELINE_STEPS = ['Reçue', 'Préparation', 'Expédiée', 'Livrée'];
const STATE_TO_STEP = {
  draft: 1, sent: 1, sale: 1, done: 4, cancel: 0,
  processing: 1, preparing: 2, shipped: 3, delivered: 4,
};

const OrderTimeline = ({ state }) => {
  const doneSteps = STATE_TO_STEP[state] ?? 1;
  if (state === 'cancel') return (
    <div style={{ padding:'12px 20px', background:'#fff5f5', borderTop:'1px solid #ffe0e0', display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:'#cc4444' }} />
      <span style={{ color:'#cc4444', fontSize:12, fontWeight:600 }}>Commande annulée</span>
    </div>
  );
  return (
    <div style={{ display:'flex', alignItems:'center', padding:'14px 20px', background:'var(--gray-50)', borderTop:'1px solid var(--border)', gap:0 }}>
      {ORDER_TIMELINE_STEPS.map((label, i) => {
        const done = i < doneSteps;
        const active = i === doneSteps - 1;
        return (
          <React.Fragment key={i}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, flexShrink:0 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700,
                background: done ? '#27ae60' : 'var(--gray-200)',
                border: `2px solid ${done ? '#27ae60' : active ? 'var(--accent)' : 'var(--border)'}`,
                color: done ? 'var(--white)' : 'var(--gray-500)' }}>
                {done ? '✓' : i+1}
              </div>
              <div style={{ color: done ? 'var(--black)' : 'var(--gray-600)', fontSize:10, whiteSpace:'nowrap', fontWeight: active ? 600 : 400 }}>{label}</div>
            </div>
            {i < ORDER_TIMELINE_STEPS.length - 1 && (
              <div style={{ flex:1, height:2, background: i < doneSteps - 1 ? '#27ae60' : 'var(--border)', marginBottom:14, minWidth:16 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

function formatOrderDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { year:'numeric', month:'short', day:'numeric' });
}

// Gaming PC background image
    <React.Fragment>
      {/* Background disabled or lightened for white theme */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'var(--bg)' }} />
      {/* Red accent glow */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 70% 60%, rgba(232,0,29,0.05) 0%, transparent 60%)' }} />
    </React.Fragment>

// Tile décoratif sous le formulaire — with real images
const LoginTile = ({ label, accentColor, imgSrc }) => (
  <div style={{
    flex:1, height:105, borderRadius:12, overflow:'hidden', position:'relative',
    background:'var(--gray-800)', border:'1px solid var(--gray-700)',
    display:'flex', alignItems:'flex-end', cursor:'default',
  }}>
    <img src={imgSrc} alt={label}
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.2, filter:'grayscale(1)' }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:`linear-gradient(to top, ${accentColor}30, transparent)` }} />
    <div style={{ position:'relative', padding:'10px 14px', color:'var(--white)', fontSize:10, fontWeight:700, letterSpacing:'0.18em' }}>
      {label}
    </div>
  </div>
);

const StarBg = () => (
  <div style={{ position:'fixed', inset:0, background:'var(--gray-900)', zIndex:0 }}>
    <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 50%, rgba(232,0,29,0.05), transparent 70%)' }} />
  </div>
);

const AuthForm = ({ onSuccess }) => {
  const { t } = React.useContext(window.AppContext);
  const [mode, setMode] = React.useState('login'); // 'login' | 'register' | 'forgot' | 'reset_confirm'
  const [form, setForm] = React.useState({ name:'', email:'', password:'', phone:'', address:'' });
  const [resetCode, setResetCode] = React.useState('');
  const [resetPassword, setResetPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    if (mode === 'forgot') {
      if (!form.email) { setError('Email requis'); return; }
      setError(''); setLoading(true);
      try {
        const res = await window.PcApi.resetPasswordRequest(form.email);
        if (res.ok) {
          setMode('reset_confirm');
          setError(res.debug_code ? 'Mode Dev : Le code a été pré-rempli automatiquement !' : '');
          if (res.debug_code) {
            setResetCode(res.debug_code);
          }
        } else {
          setError(res.error || 'Erreur lors de la demande.');
        }
      } catch (e) {
        setError(e.message);
      } finally { setLoading(false); }
      return;
    }

    if (mode === 'reset_confirm') {
      if (!resetCode || !resetPassword) { setError('Code et nouveau mot de passe requis'); return; }
      setError(''); setLoading(true);
      try {
        const res = await window.PcApi.resetPasswordConfirm(form.email, resetCode, resetPassword);
        if (res.ok) {
          setMode('login');
          setError('');
          setForm(f => ({ ...f, password: resetPassword }));
          alert('Votre mot de passe a été modifié avec succès ! Vous pouvez maintenant vous connecter.');
        } else {
          setError(res.error || 'Erreur lors de la réinitialisation.');
        }
      } catch (e) {
        setError(e.message);
      } finally { setLoading(false); }
      return;
    }

    if (!form.email || !form.password) { setError('Email et mot de passe requis'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Adresse email invalide'); return; }
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        const res = await window.PcApi.login(form.email, form.password);
        if (res.uid) onSuccess({ authenticated:true, uid:res.uid, name:res.name, email:res.email, phone:res.phone||'', street:res.street||'' });
        else setError(t('auth_error_default_login'));
      } else {
        const reg = await window.PcApi.register(form.name, form.email, form.password, form.phone, form.address);
        if (reg.created || reg.uid) {
          const login = await window.PcApi.login(form.email, form.password);
          if (login.uid) onSuccess({ authenticated:true, uid:login.uid, name:login.name, email:login.email, phone:login.phone||'', street:login.street||'' });
          else setError('Inscription réussie — veuillez vous connecter.');
        } else {
          setError(t('auth_error_default_register'));
        }
      }
    } catch (e) {
      setError(e.message || (mode === 'login' ? t('auth_error_default_login') : t('auth_error_default_register')));
    } finally { setLoading(false); }
  };

  const authInp = {
    width:'100%', padding:'13px 16px',
    background:'var(--gray-700)', border:'1.5px solid var(--gray-600)',
    borderRadius:10, color:'var(--white)',
    fontFamily:"'Space Grotesk',sans-serif", fontSize:14,
    outline:'none', boxSizing:'border-box', transition:'all 0.15s',
  };

  return (
    <div style={{ width:380, background:'var(--gray-800)', border:'1px solid var(--gray-700)', borderRadius:20, padding:'44px 40px', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
      <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:28, color:'var(--white)', marginBottom:8, marginTop:0 }}>
        {mode === 'login' && t('sign_in_title')}
        {mode === 'register' && t('create_account')}
        {mode === 'forgot' && "Mot de passe oublié"}
        {mode === 'reset_confirm' && "Nouveau mot de passe"}
      </h2>
      <p style={{ color:'var(--gray-400)', fontSize:14, marginBottom:32, marginTop:0, lineHeight:1.6 }}>
        {mode === 'login' && t('sign_in_sub')}
        {mode === 'register' && t('register_sub')}
        {mode === 'forgot' && "Entrez votre adresse email pour recevoir un code de réinitialisation."}
        {mode === 'reset_confirm' && "Saisissez le code à 6 chiffres reçu et votre nouveau mot de passe."}
      </p>

      {mode === 'register' && (
        <>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', color:'#b8b8b8', fontSize:11, fontWeight:700, letterSpacing:'0.13em', marginBottom:8 }}>NOM</label>
            <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Jean Dupont" style={authInp}
              onFocus={e=>e.target.style.borderColor='#e8001d'} onBlur={e=>e.target.style.borderColor='transparent'} />
          </div>
        </>
      )}

      {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', color:'#b8b8b8', fontSize:11, fontWeight:700, letterSpacing:'0.13em', marginBottom:8 }}>EMAIL</label>
          <input type="email" value={form.email} onChange={e=>set('email',e.target.value)}
            placeholder="votre@email.com" style={authInp}
            onFocus={e=>e.target.style.borderColor='#e8001d'} onBlur={e=>e.target.style.borderColor='transparent'} />
        </div>
      )}

      {mode === 'reset_confirm' && (
        <>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', color:'#b8b8b8', fontSize:11, fontWeight:700, letterSpacing:'0.13em', marginBottom:8 }}>CODE DE RÉINITIALISATION</label>
            <input value={resetCode} onChange={e=>setResetCode(e.target.value)} placeholder="Ex: 123456" style={authInp}
              onFocus={e=>e.target.style.borderColor='#e8001d'} onBlur={e=>e.target.style.borderColor='transparent'} />
          </div>
          <div style={{ marginBottom:28 }}>
            <label style={{ display:'block', color:'#b8b8b8', fontSize:11, fontWeight:700, letterSpacing:'0.13em', marginBottom:8 }}>NOUVEAU MOT DE PASSE</label>
            <input type="password" value={resetPassword} onChange={e=>setResetPassword(e.target.value)}
              placeholder="••••••••" style={authInp}
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--gray-600)'}
              onKeyDown={e=>e.key==='Enter'&&handle()} />
          </div>
        </>
      )}

      {(mode === 'login' || mode === 'register') && (
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <label style={{ color:'#b8b8b8', fontSize:11, fontWeight:700, letterSpacing:'0.13em' }}>PASSWORD</label>
            {mode === 'login' && (
              <span style={{ color:'#e8001d', fontSize:11, fontWeight:700, letterSpacing:'0.1em', cursor:'pointer' }}
                onClick={() => { setMode('forgot'); setError(''); }}>OUBLIÉ ?</span>
            )}
          </div>
          <input type="password" value={form.password} onChange={e=>set('password',e.target.value)}
            placeholder="••••••••" style={authInp}
            onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--gray-600)'}
            onKeyDown={e=>e.key==='Enter'&&handle()} />
        </div>
      )}

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
        {loading ? '...' : mode==='login' ? t('sign_in').toUpperCase() : mode==='register' ? t('create_account').toUpperCase() : mode==='forgot' ? 'ENVOYER LE CODE' : 'RÉINITIALISER'}
      </button>

      <div style={{ textAlign:'center', marginTop:24, color:'#a8a8a8', fontSize:13 }}>
        {(mode === 'login' || mode === 'register') && (
          <>
            {mode === 'login' ? t('no_account') : t('already_account')}
            {' '}
            <span style={{ color:'#e8001d', cursor:'pointer', fontWeight:600 }}
              onClick={() => { setMode(m=>m==='login'?'register':'login'); setError(''); }}>
              {mode === 'login' ? t('register_link') : t('signin_link')}
            </span>
          </>
        )}
        {(mode === 'forgot' || mode === 'reset_confirm') && (
          <span style={{ color:'#e8001d', cursor:'pointer', fontWeight:600 }}
            onClick={() => { setMode('login'); setError(''); }}>
            RETOURNER À LA CONNEXION
          </span>
        )}
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
  const { favorites, setPage, addToCart, toggleFav, currentUser, setCurrentUser, t, formatPrice, catalogError } = React.useContext(window.AppContext);
  const [tab, setTab] = React.useState(initialTab || 'orders');
  const [orders, setOrders] = React.useState([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [shareMsg, setShareMsg] = React.useState(null);
  const guestMode = !currentUser && !!catalogError;
  const tabs = guestMode ? ['favorites', 'settings'] : ['orders', 'favorites', 'profile', 'settings'];

  // Load shared favorites from URL on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('share');
    if (shared) {
      shared.split(',').map(Number).filter(Boolean).forEach(id => {
        if (!favorites.has(id)) toggleFav(id);
      });
      setTab('favorites');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadOrders = () => {
    if (!currentUser) return;
    setOrdersLoading(true);
    window.PcApi.getOrders().then(res => {
      setOrders(res.orders || []);
    }).catch(() => setOrders([])).finally(() => setOrdersLoading(false));
  };

  React.useEffect(() => { loadOrders(); }, [currentUser]);

  React.useEffect(() => {
    if (guestMode && !['favorites', 'settings'].includes(tab)) setTab('favorites');
  }, [guestMode]);

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

  if (!currentUser && !catalogError) {
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
      {guestMode && (
        <div style={{ background:'#fff9db', borderBottom:'1px solid #ffec99', padding:'10px 80px', display:'flex', alignItems:'center', gap:10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59f00" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{ color:'#856404', fontSize:13, fontFamily:"'Space Grotesk',sans-serif" }}>
            Mode hors-ligne — Commandes et profil indisponibles. Connectez-vous une fois le serveur accessible.
          </span>
        </div>
      )}
      <div style={secStyles.pageHeader}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <div style={secStyles.avatarLg}>{avatarInitial}</div>
            <div>
              <div style={secStyles.headerEye}>{guestMode ? 'INVITÉ' : t('my_account').toUpperCase()}</div>
              <h1 style={{ ...secStyles.pageTitle, margin:0 }}>{guestMode ? 'Mode hors-ligne' : currentUser.name}</h1>
              {!guestMode && <div style={{ color:'#9f9f9f', fontSize:13, marginTop:2 }}>{currentUser.email}</div>}
            </div>
          </div>
          {!guestMode && (
            <button style={{ background:'transparent', border:'1px solid #3c3c3c', borderRadius:8, color:'#9f9f9f', cursor:'pointer', padding:'9px 20px', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, transition:'all 0.15s' }}
              onClick={handleLogout}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#cc4444';e.currentTarget.style.color='#cc4444';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#3c3c3c';e.currentTarget.style.color='#9f9f9f';}}>
              {t('logout')}
            </button>
          )}
        </div>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid #e0e0e0', padding:'0 80px', background:'#ffffff' }}>
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
        {tab === 'orders' && !guestMode && (
          <div>
            <h2 style={secStyles.tabTitle}>{t('my_orders')}</h2>
            {ordersLoading ? (
              <div style={{ color:'#888888', padding:'40px 0' }}>Chargement…</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="1.5" style={{ marginBottom:16 }}>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <div style={{ color:'#888888', fontSize:15, marginBottom:8 }}>{t('no_orders')}</div>
                <button style={secStyles.addBtn} onClick={() => setPage('catalog')}>{t('browse_catalog')} →</button>
              </div>
            ) : orders.map(order => {
              const status = order.pc_delivery_status || ODOO_STATUS_MAP[order.state] || 'processing';
              const statusColor = STATUS_COLORS[status] || '#fdcb6e';
              const statusLabel = STATUS_LABELS[status] || status;
              return (
                <div key={order.id} style={secStyles.orderCard}>
                  <div style={secStyles.orderHeader}>
                    <div>
                      <div style={{ color:'#111111', fontWeight:600, fontSize:15 }}>{order.name || `#${order.id}`}</div>
                      <div style={{ color:'#888888', fontSize:13, marginTop:2 }}>{formatOrderDate(order.date)}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                      <div style={{ ...secStyles.statusBadge, background: statusColor+'20', color: statusColor }}>
                        {statusLabel}
                      </div>
                      <div style={{ color:'#e8001d', fontWeight:700, fontSize:18, fontFamily:"'Space Grotesk',sans-serif" }}>
                        {formatPrice(Number(order.total||0))}
                      </div>
                    </div>
                  </div>
                  {/* Tracking timeline uses pc_delivery_status when available */}
                  <OrderTimeline state={order.pc_delivery_status || order.state} />
                  <div style={secStyles.orderItems}>
                    {(order.items||[]).map((item, i) => (
                      <div key={i} style={{ ...secStyles.orderItemRow, display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:32, height:32, flexShrink:0, background:'var(--gray-50)', borderRadius:4, overflow:'hidden' }}>
                          <ProductVisual category={item.category} imageUrl={item.image_url} />
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ color:'#333333', fontSize:13 }}>{item.name}</div>
                          <div style={{ color:'#888888', fontSize:12 }}>×{item.qty} · {formatPrice(Number(item.price||0))}</div>
                        </div>
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
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ ...secStyles.tabTitle, margin:0 }}>{t('my_favorites')} <span style={{ color:'#888888', fontWeight:400 }}>({favProducts.length})</span></h2>
              {favProducts.length > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  {shareMsg && <span style={{ color:'#4caf70', fontSize:13 }}>{shareMsg}</span>}
                  <button
                    style={{ background:'#f5f5f5', border:'1px solid #e0e0e0', borderRadius:8, color:'#555555', cursor:'pointer', padding:'8px 16px', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}
                    onClick={() => {
                      const ids = [...favorites].join(',');
                      const url = window.location.origin + '/user?share=' + ids;
                      navigator.clipboard.writeText(url).then(() => {
                        setShareMsg('Lien copié !');
                        setTimeout(() => setShareMsg(null), 2500);
                      }).catch(() => {
                        setShareMsg(url);
                        setTimeout(() => setShareMsg(null), 4000);
                      });
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#e8001d';e.currentTarget.style.color='#e8001d';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#e0e0e0';e.currentTarget.style.color='#555555';}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Partager ma liste
                  </button>
                </div>
              )}
            </div>
            {favProducts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px' }}>
                <div style={{ color:'#888888', fontSize:16, marginBottom:16 }}>{t('no_favorites')}</div>
                <button style={window.homeStyles.heroBtnSecondary} onClick={() => setPage('catalog')}>{t('browse_catalog')}</button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }} className="rsp-grid-4">
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
        {tab === 'profile' && !guestMode && (
          <ProfileTab currentUser={currentUser} setCurrentUser={setCurrentUser} />
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div style={{ maxWidth:540 }}>
            <h2 style={secStyles.tabTitle}>{t('settings_tab')}</h2>
            {[[t('email_notifs'),t('email_notifs_desc')],[t('newsletter'),t('newsletter_desc')],[t('two_factor'),t('two_factor_desc')]].map(([title, desc]) => (
              <div key={title} style={secStyles.settingRow}>
                <div>
                  <div style={{ color:'#111111', fontWeight:500, fontSize:14 }}>{title}</div>
                  <div style={{ color:'#888888', fontSize:12, marginTop:2 }}>{desc}</div>
                </div>
                <Toggle />
              </div>
            ))}
            {!guestMode && (
              <div style={secStyles.dangerZone}>
                <button style={secStyles.deleteBtn} onClick={handleLogout}>{t('logout')}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Toggle = () => {
  const [on, setOn] = React.useState(true);
  return (
    <div style={{ width: 44, height: 24, borderRadius: 12, background: on ? '#e8001d' : '#cccccc', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
      onClick={() => setOn(v => !v)}>
      <div style={{ position: 'absolute', top: 3, left: on ? 20 : 3, width: 18, height: 18, borderRadius: '50%', background: '#ffffff', transition: 'left 0.2s' }} />
    </div>
  );
};

const periStyles = {
  groupBar: { display: 'flex', gap: 12, padding: '24px 48px', borderBottom: '1px solid #e5e5e5', overflowX:'auto', whiteSpace:'nowrap' },
  groupBtn: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
    background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 10,
    cursor: 'pointer', transition: 'all 0.15s', flexShrink:0, textAlign: 'left',
  },
  groupBtnActive: { background: '#e8001d', borderColor: '#e8001d' },
  subTabs: { display: 'flex', gap: 4, padding: '20px 0 0', marginBottom: 24, overflowX:'auto', whiteSpace:'nowrap' },
  subTab: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
    background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 8,
    color: '#666666', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    fontFamily: "'Space Grotesk',sans-serif", transition: 'all 0.15s',
  },
  subTabActive: { background: '#eeeeee', borderColor: '#e8001d', color: '#111111' },
  subTabCount: { background: '#eeeeee', color: '#555555', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, paddingBottom: 60 },
  card: { background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardHov: { borderColor: '#cccccc', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
  cardImg: { height: 150, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' },
  favBtn: { position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', border: '1px solid #eeeeee', cursor: 'pointer', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 8, left: 8, background: '#e8001d', color: '#ffffff', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, letterSpacing: '0.1em' },
  cardBody: { padding: '14px', flex: 1, cursor: 'pointer' },
  brand: { color: '#888888', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 3 },
  name: { color: '#111111', fontWeight: 600, fontSize: 14, lineHeight: 1.3, marginBottom: 6 },
  rating: { color: '#e8001d', fontSize: 11, marginBottom: 10 },
  specs: { borderTop: '1px solid #eeeeee', paddingTop: 8 },
  specRow: { display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontFamily: "'DM Mono',monospace" },
  cardFooter: { padding: '12px 14px', borderTop: '1px solid #eeeeee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: '#111111', fontWeight: 700, fontSize: 18, fontFamily: "'Space Grotesk',sans-serif" },
  addBtn: { background: '#e8001d', color: '#ffffff', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 7, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12, transition: 'background 0.15s' },
};

const secStyles = {
  page: { paddingTop: 64 },
  layout: { display:'flex', gap:0 },
  sidebar: { width:240, flexShrink:0, padding:'28px 24px', borderRight:'1px solid #e0e0e0', minHeight:'100vh', background:'#f8f8f8' },
  filterGroup: { marginBottom:28 },
  filterLabel: { color:'#888888', fontSize:10, fontWeight:700, letterSpacing:'0.15em', marginBottom:10 },
  filterBtn: { display:'block', width:'100%', textAlign:'left', background:'none', border:'none', padding:'6px 10px', borderRadius:6, color:'#555555', fontSize:13, cursor:'pointer', transition:'all 0.15s', fontFamily:"'Space Grotesk',sans-serif" },
  filterBtnActive: { background:'#eeeeee', color:'#111111', borderLeft:'2px solid #e8001d', paddingLeft:8 },
  checkRow: { display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer' },
  priceInput: { background:'#ffffff', border:'1px solid #dddddd', borderRadius:6, padding:'4px 8px', color:'#333333', fontSize:12, minWidth:60, textAlign:'center' },

  main: { flex:1, minWidth:0, padding:'28px 32px' },
  toolbar: { display:'flex', alignItems:'center', gap:12, marginBottom:24, background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:10, padding:'12px 16px' },
  searchInput: { background:'transparent', border:'none', outline:'none', color:'#111111', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, flex:1, minWidth:0 },
  sortSelect: { background:'#ffffff', border:'1px solid #dddddd', color:'#333333', padding:'6px 10px', borderRadius:6, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, outline:'none' },


  // Hero banner
  heroBanner: { position:'relative', height:360, overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', background:'#0a0a0a', borderBottom:'1px solid var(--border)' },
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

pageHeader: { background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '64px 80px 48px' },
headerEye: { color: 'var(--accent)', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', marginBottom: 12 },
pageTitle: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 48, color: 'var(--black)', margin: '0 0 12px', lineHeight: 1.1 },
pageTitle2: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 32, color: 'var(--black)', margin: '0 0 32px', paddingTop: 64 },
pageDesc: { color: 'var(--gray-text)', fontSize: 17, maxWidth: 600, lineHeight: 1.6, margin: 0 },
pbGrid: { padding: '48px 80px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 },
pbCard: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.25s', position: 'relative', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
pbBadge: { position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, letterSpacing: '0.1em', zIndex: 1 },
pbVisual: { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
pbBody: { padding: '20px' },
pbTier: { fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 4 },
pbName: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--black)', marginBottom: 16 },
pbPrice: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--accent)' },
pbSpecs: { background: 'var(--gray-50)', borderRadius: 8, padding: '10px 14px', marginBottom: 14 },
pbSpecRow: { display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 6, borderBottom: '1px solid var(--border)', paddingBottom: 6 },
pbPerf: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
pbPerfItem: { display: 'flex', alignItems: 'center', gap: 8 },
pbRating: { marginBottom: 16 },
pbAddBtn: { width: '100%', padding: '12px', color: 'var(--white)', border: 'none', borderRadius: 8, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'opacity 0.2s' },
tabs: { display: 'flex', gap: 4, marginBottom: 32 },
tab: { padding: '10px 20px', background: 'none', border: '1px solid #e0e0e0', borderRadius: 8, color: '#666666', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 500, transition: 'all 0.15s' },
tabActive: { background: '#eeeeee', color: '#111111', borderColor: '#e8001d' },
periGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, paddingBottom: 60 },
cartLayout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, paddingBottom: 60 },
cartItem: { display: 'flex', gap: 20, padding: '20px 0', borderBottom: '1px solid #eeeeee', alignItems: 'flex-start' },
cartImg: { width: 80, height: 80, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
qtyControl: { display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 7, padding: '4px 8px' },
qtyBtnSm: { background: 'none', border: 'none', color: '#666666', cursor: 'pointer', fontSize: 16, padding: '0 2px', fontFamily: "'Space Grotesk',sans-serif" },
removeItemBtn: { background: 'none', border: '1px solid #e0e0e0', borderRadius: 8, color: '#888888', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s, border-color 0.15s' },
cartSummary: { background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 16, padding: '24px', height: 'fit-content', position: 'sticky', top: 80, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
summaryTitle: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: '#111111', marginBottom: 20 },
summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 14 },
summaryDivider: { height: 1, background: '#e5e5e5', margin: '16px 0' },
couponInput: { flex: 1, background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 7, padding: '9px 12px', color: '#111111', fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, outline: 'none' },
couponBtn: { background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 7, padding: '9px 16px', color: '#e8001d', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13 },
checkoutBtn: { width: '100%', padding: '14px', background: '#e8001d', color: '#ffffff', border: 'none', borderRadius: 9, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s', marginBottom: 10 },
continueBtn: { width: '100%', padding: '11px', background: 'transparent', color: '#666666', border: '1px solid #e0e0e0', borderRadius: 9, fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, cursor: 'pointer' },
avatarLg: { width: 64, height: 64, borderRadius: '50%', background: '#f5f5f5', border: '2px solid #e8001d', color: '#e8001d', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' },
userTab: { padding: '14px 24px', background: 'none', border: 'none', color: '#888888', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 500, borderBottom: '2px solid transparent', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 },
userTabActive: { color: '#111111', borderBottomColor: '#e8001d' },
tabCount: { background: '#e8001d', color: '#ffffff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 },
tabTitle: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: '#111111', marginBottom: 24, marginTop: 0 },
orderCard: { background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 12, marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eeeeee' },
statusBadge: { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 },
orderItems: { padding: '12px 20px' },
orderItemRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f5f5f5' },
orderActionBtn: { background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, padding: '7px 14px', color: '#555555', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, transition: 'all 0.15s' },
profileField: { marginBottom: 16 },
fieldLabel: { display: 'block', color: '#888888', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 },
fieldInput: { width: '100%', background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', color: '#111111', fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' },
saveBtn: { background: '#e8001d', color: '#ffffff', border: 'none', borderRadius: 8, padding: '11px 28px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 },
settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #e5e5e5' },
dangerZone: { marginTop: 32, padding: 20, border: '1px solid #cc444430', borderRadius: 10, background: '#cc444408' },
deleteBtn: { background: 'transparent', border: '1px solid #cc4444', color: '#cc4444', borderRadius: 7, padding: '8px 20px', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600 },
};

Object.assign(window, { PrebuiltPage, PrebuiltDetailPage, OnlyOnePcPage, OnlyOnePcDetailPage, PeripheralsPage, CartPage, UserPage });
