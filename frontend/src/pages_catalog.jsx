import React from "react";

// pages_catalog.jsx — Catalog, Product Detail, Compare

const CATEGORY_LABELS = {
  cpu: 'Processeurs', gpu: 'Cartes Graphiques', motherboard: 'Cartes Mères',
  ram: 'Mémoire RAM', storage: 'Stockage SSD/HDD', psu: 'Alimentations',
  case: 'Boîtiers', cooling: 'Refroidissement', monitor: 'Écrans',
  mouse: 'Souris', keyboard: 'Claviers', headset: 'Casques'
};

const getCategoryLabel = (t, c) => t('cat_' + c) || CATEGORY_LABELS[c] || c;
const ALL_CATEGORIES = ['all','cpu','gpu','motherboard','ram','storage','psu','cooling','case', 'monitor', 'keyboard', 'mouse', 'headset', 'webcam', 'speaker', 'laptop-gaming', 'laptop-pro'];

const ProductVisual = window.ProductVisual;
const ImageCarousel = window.ImageCarousel;
const ProductCard = window.ProductCard;

const CatalogPage = ({ initialCategory }) => {
  const { setPage, addToCart, toggleFav, favorites, compareList, toggleCompare, dataLoaded, t, formatPrice } = React.useContext(window.AppContext);
  const [category, setCategory] = React.useState(initialCategory || 'all');
  const [sortBy, setSortBy] = React.useState('featured');
  const [priceRange, setPriceRange] = React.useState([0, 20000]);
  const [brands, setBrands] = React.useState([]);
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [minRating, setMinRating] = React.useState(0);

  const allProducts = React.useMemo(() => {
    let prods = category === 'all'
      ? window.ALL_PRODUCTS
      : window.ALL_PRODUCTS.filter(p => p.category === category);
    
    if (search) prods = prods.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (inStockOnly) prods = prods.filter(p => p.stock_status !== 'out_of_stock');
    if (brands.length) prods = prods.filter(p => brands.includes(p.brand));
    prods = prods.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) prods = prods.filter(p => (p.rating || 0) >= minRating);
    if (sortBy === 'price_asc') prods = [...prods].sort((a,b) => a.price - b.price);
    else if (sortBy === 'price_desc') prods = [...prods].sort((a,b) => b.price - a.price);
    else if (sortBy === 'rating') prods = [...prods].sort((a,b) => b.rating - a.rating);
    else if (sortBy === 'reviews') prods = [...prods].sort((a,b) => (b.reviews || b.review_count || 0) - (a.reviews || a.review_count || 0));
    return prods;
  }, [category, sortBy, priceRange, brands, inStockOnly, search, minRating, dataLoaded]);

  const availableBrands = React.useMemo(() => {
    const prods = category === 'all' ? window.ALL_PRODUCTS : window.ALL_PRODUCTS.filter(p => p.category === category);
    return [...new Set(prods.map(p => p.brand).filter(Boolean))].sort();
  }, [category, dataLoaded]);

  const toggleBrand = (b) => setBrands(prev => prev.includes(b) ? prev.filter(x=>x!==b) : [...prev, b]);

  return (
    <div style={catStyles.page}>
      {/* Banner */}
      <div style={catStyles.banner} className="rsp-banner">
        <video autoPlay loop muted playsInline style={catStyles.bannerImg}>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div style={catStyles.bannerGrid} />
        <div style={catStyles.bannerGlow} />
        <div style={catStyles.bannerOverlay} />
        <div style={catStyles.bannerContent} className="rsp-banner-content">
          <div style={catStyles.bannerEye} className="rsp-banner-eye">{t('cat_banner_eye')}</div>
          <h1 style={catStyles.bannerTitle} className="rsp-banner-title">
            {category === 'all' ? t('all_components') : getCategoryLabel(t, category)}
          </h1>
        </div>
      </div>

      <div style={catStyles.layout} className="rsp-catalog">
        {/* Sidebar */}
        <aside style={catStyles.sidebar} className="rsp-catalog-sidebar">
          {/* Category filter */}
          <div style={catStyles.filterGroup}>
            <div style={catStyles.filterLabel}>{t('filter_category')}</div>
            {ALL_CATEGORIES.map(c => (
              <button key={c} style={{ ...catStyles.filterBtn, ...(category===c ? catStyles.filterBtnActive : {}) }}
                onClick={() => { setCategory(c); setBrands([]); }}>
                {c === 'all' ? t('all_components') : getCategoryLabel(t, c)}
              </button>
            ))}
          </div>

          {/* Stock filter */}
          <div style={catStyles.filterGroup}>
            <div style={catStyles.filterLabel}>{t('filter_availability')}</div>
            <label style={catStyles.checkRow}>
              <input type="checkbox" checked={inStockOnly} onChange={e=>setInStockOnly(e.target.checked)} style={{ accentColor:'#e8001d' }}/>
              <span style={{ color:'#b8b8b8', fontSize:13 }}>{t('filter_in_stock_only')}</span>
            </label>
          </div>

          {/* Price range — dual slider */}
          <div style={catStyles.filterGroup}>
            <div style={catStyles.filterLabel}>{t('filter_price')}</div>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <div style={catStyles.priceInput}>{formatPrice(priceRange[0])}</div>
              <span style={{ color:'#9f9f9f', alignSelf:'center' }}>—</span>
              <div style={catStyles.priceInput}>{formatPrice(priceRange[1])}</div>
            </div>
            <input type="range" min={0} max={5000} step={50} value={priceRange[0]}
              onChange={e => setPriceRange([Math.min(+e.target.value, priceRange[1]-50), priceRange[1]])}
              style={{ width:'100%', accentColor:'#e8001d', marginBottom:6 }}/>
            <input type="range" min={0} max={5000} step={50} value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0]+50)])}
              style={{ width:'100%', accentColor:'#e8001d' }}/>
          </div>

          {/* Rating filter */}
          <div style={catStyles.filterGroup}>
            <div style={catStyles.filterLabel}>{t('filter_min_rating')}</div>
            {[4, 3, 2].map(r => (
              <label key={r} style={catStyles.checkRow}>
                <input type="radio" name="rating" checked={minRating === r}
                  onChange={() => setMinRating(minRating === r ? 0 : r)}
                  style={{ accentColor:'#e8001d' }}/>
                <span style={{ color:'#e8001d', fontSize:12 }}>{'★'.repeat(r)}{'☆'.repeat(5-r)}</span>
                <span style={{ color:'#a8a8a8', fontSize:11 }}>&amp; +</span>
              </label>
            ))}
            {minRating > 0 && (
              <button style={{ ...catStyles.filterBtn, color:'#9f9f9f', fontSize:11 }}
                onClick={() => setMinRating(0)}>✕ {t('clear_filter')}</button>
            )}
          </div>

          {/* Brand filter */}
          {availableBrands.length > 0 && (
            <div style={catStyles.filterGroup}>
              <div style={catStyles.filterLabel}>{t('filter_brand')}</div>
              {availableBrands.map(b => (
                <label key={b} style={catStyles.checkRow}>
                  <input type="checkbox" checked={brands.includes(b)} onChange={()=>toggleBrand(b)} style={{ accentColor:'#e8001d' }}/>
                  <span style={{ color:'#b8b8b8', fontSize:13 }}>{b}</span>
                </label>
              ))}
            </div>
          )}

          {/* Compare list */}
          {compareList.length > 0 && (
            <div style={catStyles.comparePanel}>
              <div style={catStyles.filterLabel}>{t('compare_label', compareList.length)}</div>
              {compareList.map(p => (
                <div key={p.id} style={catStyles.compareItem}>
                  <span style={{ color:'#b0b0b0', fontSize:12, flex:1 }}>{p.name.slice(0,24)}…</span>
                  <button style={catStyles.removeBtn} onClick={() => toggleCompare(p)}>×</button>
                </div>
              ))}
              {compareList.length >= 2 && (
                <button style={catStyles.compareBtn} onClick={() => setPage('compare')}>{t('compare_now')}</button>
              )}
            </div>
          )}
        </aside>

        {/* Main */}
        <main style={catStyles.main}>
          {/* Toolbar */}
          <div style={catStyles.toolbar}>
            <input {...{placeholder:t("search_in_results")}} value={search} onChange={e=>setSearch(e.target.value)}
              style={catStyles.searchInput}/>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
              <span style={{ color:'#9f9f9f', fontSize:13 }}>{t('products_count', allProducts.length)}</span>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={catStyles.sortSelect}>
                {[["featured",t("sort_featured")],["price_asc",t("sort_price_asc")],["price_desc",t("sort_price_desc")],["rating",t("sort_rating")],["reviews",t("sort_reviews")]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                
                
                
                
              </select>
            </div>
          </div>

          {/* Grid */}
          {allProducts.length === 0 ? (
            <div style={catStyles.empty}>
              <div style={{ color:'#a8a8a8' }}>{t('no_products')}</div>
            </div>
          ) : (
            <div style={catStyles.grid} className="rsp-grid-3">
              {allProducts.map(p => (
                <CatalogProductCard key={p.id} product={p}
                  onView={() => setPage('product', { product: p })}
                  onAdd={() => addToCart(p)}
                  onFav={() => toggleFav(p.id)}
                  isFav={favorites.has(p.id)}
                  onCompare={() => toggleCompare(p)}
                  isCompared={compareList.some(c=>c.id===p.id)}
                  canCompare={compareList.length < 3 || compareList.some(c=>c.id===p.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const CatalogProductCard = ({ product, onView, onAdd, onFav, isFav, onCompare, isCompared, canCompare }) => {
  const { t, formatPrice } = React.useContext(window.AppContext);
  const [hov, setHov] = React.useState(false);
  const color = (window.CARD_COLORS||{})[product.category] || '#e8001d';
  const label = t('label_' + product.category) || product.category;
  const specEntries = Object.entries(product.specs||{}).slice(0, 4);
  const badge = product.tags?.includes('bestseller') ? t('badge_bestseller')
    : product.stock === 'low_stock' ? t('badge_low_stock')
    : product.stock === 'out_of_stock' ? t('badge_out_of_stock') : null;

  return (
    <div style={{ background:'#ffffff', border:`1px solid ${hov ? color : '#e0e0e0'}`, borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', transition:'all 0.25s', position:'relative', transform: hov ? 'translateY(-4px)' : 'none', boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>

      <button style={{ position:'absolute', top:14, left:14, background:'rgba(255,255,255,0.9)', border:'1px solid #e8e8e8', cursor:'pointer', width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, color: isFav?'#e8001d':'#999999' }}
        onClick={e=>{e.stopPropagation();onFav();}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill={isFav?'#e8001d':'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {badge && (
        <div style={{ position:'absolute', top:14, right:14, background: badge==='BESTSELLER' ? color+'28' : '#cc444428', color: badge==='BESTSELLER' ? color : '#cc4444', fontSize:9, fontWeight:700, padding:'3px 9px', borderRadius:4, letterSpacing:'0.1em', zIndex:1 }}>
          {badge}
        </div>
      )}

      <div style={{ height:200, background:`linear-gradient(135deg, ${color}10, #f8f8f8)`, overflow:'hidden', cursor:'pointer' }} onClick={onView}>
        <ImageCarousel images={product.images} category={product.category} />
      </div>

      <div style={{ padding:'20px', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, cursor:'pointer' }} onClick={onView}>
          <div style={{ flex:1, minWidth:0, paddingRight:10 }}>
            <div style={{ color, fontSize:10, fontWeight:700, letterSpacing:'0.15em', marginBottom:5 }}>{label?.toUpperCase()}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:20, color:'#111111', lineHeight:1.25 }}>{product.name}</div>
            {product.brand && <div style={{ color:'#888888', fontSize:11, marginTop:3 }}>{product.brand}</div>}
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'#e8001d', flexShrink:0 }}>{formatPrice(product.price)}</div>
        </div>

        {specEntries.length > 0 && (
          <div style={{ background:'#f5f5f5', borderRadius:8, padding:'9px 12px', marginBottom:12 }}>
            {specEntries.map(([k, v], i) => (
              <div key={k} style={{ display:'flex', gap:8, alignItems:'baseline', ...(i < specEntries.length - 1 ? { marginBottom:4, borderBottom:'1px solid #ebebeb', paddingBottom:4 } : {}) }}>
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
            <span style={{ color: product.stock==='out_of_stock'?'#cc4444':product.stock==='low_stock'?'#e8a020':'#666666', fontSize:11 }}>
              {product.stock==='in_stock'?t('in_stock'):product.stock==='low_stock'?t('low_stock'):t('out_of_stock')}
            </span>
          </div>
        </div>

        <div style={{ display:'flex', gap:8, marginTop:'auto' }} onClick={e=>e.stopPropagation()}>
          {canCompare && (
            <button style={{ width:36, height:36, border:`1px solid ${isCompared?color:'#3c3c3c'}`, borderRadius:8, background: isCompared?color+'20':'transparent', color: isCompared?color:'#9f9f9f', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}
              onClick={e=>{e.stopPropagation();onCompare();}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </button>
          )}
          <button style={{ flex:1, padding:'12px', background:color, color:'#ffffff', border:'none', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer', transition:'opacity 0.2s' }}
            onClick={e=>{e.stopPropagation();onAdd();}}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.8'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            {t('add_to_cart', formatPrice(product.price))}
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Detail Page
const ProductDetailPage = ({ product }) => {
  console.log('ProductDetailPage rendering', product);
  const { setPage, addToCart, toggleFav, favorites, addToBuild, currentUser, t, formatPrice } = React.useContext(window.AppContext);
  const [qty, setQty] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const isFav = favorites.has(product.id);
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
    return product.rating || 0;
  }, [reviews, product.rating]);

  const displayReviewsCount = React.useMemo(() => {
    if (reviews && reviews.length > 0) {
      return reviews.length;
    }
    return product.reviews || 0;
  }, [reviews, product.reviews]);

  React.useEffect(() => {
    if (!product.odoo_id) return;
    fetch(`/api/pc/product/${product.odoo_id}/related`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setRelatedProducts(d.related || []))
      .catch(() => {});
  }, [product.odoo_id]);

  React.useEffect(() => {
    if (!product.odoo_id) return;
    fetch(`/api/pc/reviews/${product.odoo_id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setReviews(d.reviews || []);
        if (currentUser && d.reviews) {
          const mine = d.reviews.find(r => r.user_name === currentUser.name);
          if (mine) { setMyRating(mine.rating); setMyComment(mine.comment); }
        }
      }).catch(() => {});
  }, [product.odoo_id, currentUser]);

  const submitReview = async () => {
    if (!myRating) return;
    setSubmitting(true);
    setReviewMsg(null);
    try {
      const data = await window.PcApi.submitReview({
        product_id: product.odoo_id,
        rating: myRating,
        comment: myComment
      });
      if (data.error) { setReviewMsg({ ok: false, text: data.error }); }
      else {
        setReviewMsg({ ok: true, text: 'Avis enregistré !' });
        const r2 = await fetch(`/api/pc/reviews/${product.odoo_id}`, { credentials: 'include' });
        const d2 = await r2.json();
        setReviews(d2.reviews || []);
      }
    } catch (e) {
      console.error('[Review] submit error:', e);
      setReviewMsg({ ok: false, text: 'Erreur réseau ou autorisation.' });
    }
    setSubmitting(false);
  };

  const catColors = window.CARD_COLORS || {};
  const catGrad = 'linear-gradient(135deg, #f0f0f0, #fafafa)';

  return (
    <div style={pdStyles.page}>
      {/* Back button + Product name */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
        <button onClick={()=>{
          const cat = product.category;
          if (cat === 'laptop') setPage('laptops');
          else if (['keyboard','mouse','microphone','webcam','monitor','speaker','headset','usb','external_hdd','network'].includes(cat)) setPage('peripherals');
          else setPage('catalog', { category: cat });
        }}
          style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:8, color:'#666666', cursor:'pointer', padding:'8px 14px', display:'flex', alignItems:'center', gap:6, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#e8001d';e.currentTarget.style.color='#e8001d';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#e0e0e0';e.currentTarget.style.color='#666666';}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'#111111', margin:0 }}>{product.name}</h2>
      </div>

      <div style={pdStyles.layout} className="rsp-pd-layout">
        {/* Image Area */}
        <div style={{ display:'flex', flexDirection:'row', gap:16, height: 500 }}>
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:10, overflowY:'auto', paddingRight:4, width: 80, flexShrink: 0 }}>
              {product.images.map((img, idx) => (
                <div 
                  key={idx} 
                  onMouseEnter={() => setSelectedImage(idx)}
                  onClick={() => setSelectedImage(idx)}
                  style={{ 
                    width: 76, 
                    height: 76, 
                    flexShrink: 0, 
                    borderRadius: 8, 
                    overflow: 'hidden', 
                    cursor: 'pointer', 
                    border: `2px solid ${idx === selectedImage ? '#e8001d' : 'transparent'}`,
                    background: '#ffffff',
                    transition: 'border-color 0.15s',
                    padding: 4
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
                </div>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div style={{ ...pdStyles.imgArea, background: catGrad, overflow:'hidden', padding:0, flex: 1, minHeight: 0, height: '100%' }}>
            {product.images && product.images.length > 0 ? (
              <img src={product.images[selectedImage] || product.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'contain', display:'block', padding: 24 }} onError={e => e.target.style.display='none'} />
            ) : (
              <ProductVisual category={product.category} />
            )}
            {product.tags?.map(t=>(
              <span key={t} style={pdStyles.tag}>{t}</span>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={pdStyles.info}>
          <div style={{ ...pdStyles.catBadge, background:(catColors[product.category]||'#e8001d')+'20', color:catColors[product.category]||'#e8001d' }}>
            {(CATEGORY_LABELS[product.category]||product.category)?.toUpperCase()}
          </div>
          <div style={pdStyles.brand}>{product.brand}</div>
          <h1 style={pdStyles.name}>{product.name}</h1>

          <div style={pdStyles.ratingRow}>
            <span style={{ color:'#e8001d' }}>{'★'.repeat(Math.round(Number(displayRating)))}</span>
            <span style={{ color:'#111111', fontWeight:600, marginLeft:6 }}>{displayRating}</span>
            <span style={{ color:'#888888', marginLeft:4 }}>({Number(displayReviewsCount).toLocaleString()} reviews)</span>
          </div>

          <div style={pdStyles.price}>{formatPrice(product.price)}</div>

          <div style={pdStyles.stockRow}>
            <div style={{ width:8, height:8, borderRadius:'50%', background: product.stock==='out_of_stock'?'#cc4444':product.stock==='low_stock'?'#e8a020':'#4caf70' }}/>
            <span style={{ color: product.stock==='out_of_stock'?'#cc4444':product.stock==='low_stock'?'#e8a020':'#b0b0b0', fontSize:14 }}>
              {product.stock==='in_stock'?t('in_stock'):t('low_stock_order')}
            </span>
          </div>

          <div style={pdStyles.qtyRow}>
            <button style={pdStyles.qtyBtn} onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
            <span style={{ color:'var(--black)', fontSize:16, fontWeight:600, minWidth:32, textAlign:'center' }}>{qty}</span>
            <button style={pdStyles.qtyBtn} onClick={()=>setQty(q=>q+1)}>+</button>
          </div>

          <div style={{ display:'flex', gap:12, marginBottom:24 }}>
            <button style={pdStyles.addCartBtn}
              onClick={()=>{ for(let i=0;i<qty;i++) addToCart(product); }}
              onMouseEnter={e=>e.currentTarget.style.background='#2a2a2a'}
              onMouseLeave={e=>e.currentTarget.style.background='#e8001d'}>
              Add to Cart
            </button>
            <button style={{ ...pdStyles.favBtn2, color: isFav?'#e8001d':'#666666', borderColor: isFav?'#e8001d':'#3c3c3c' }}
              onClick={()=>toggleFav(product.id)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav?'#e8001d':'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {['cpu','gpu','motherboard','ram','storage','psu','cooling','case'].includes(product.category) && (
            <button style={pdStyles.builderBtn} onClick={()=>{ addToBuild(product); setPage('builder'); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
              Add to PC Builder
            </button>
          )}
        </div>
      </div>

      {/* Specs table */}
      <div style={pdStyles.specsSection}>
        <h2 style={pdStyles.specsTitle}>Technical Specifications</h2>
        <div style={pdStyles.specsGrid}>
          {Object.entries(product.specs).map(([k,v])=>(
            <div key={k} style={pdStyles.specRow}>
              <div style={pdStyles.specKey}>{k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}</div>
              <div style={pdStyles.specVal}>{Array.isArray(v)?v.join(', '):String(v)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ borderTop:'1px solid #3c3c3c', paddingTop:48, marginTop:8 }}>
        <h2 style={pdStyles.specsTitle}>
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
            <textarea value={myComment} onChange={e=>setMyComment(e.target.value)} {...{placeholder:t("review_placeholder")}}
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
        <div style={{ borderTop:'1px solid #3c3c3c', paddingTop:48, marginTop:8 }}>
          <h2 style={pdStyles.specsTitle}>Produits similaires</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }} className="rsp-grid-4">
            {relatedProducts.map(rp => (
              <div key={rp.id}
                style={{ background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:12, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}
                onClick={() => { setPage('product', { product: rp }); window.scrollTo(0,0); }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='#e8001d'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e0e0e0'; e.currentTarget.style.transform='none'; }}>
                <div style={{ height:130, background:'linear-gradient(135deg,#f0f0f0,#fafafa)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {rp.images?.[0]
                    ? <img src={rp.images[0]} alt={rp.name} style={{ height:'100%', width:'100%', objectFit:'contain', padding:8 }} onError={e=>e.target.style.display='none'} />
                    : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="3"/></svg>
                  }
                </div>
                <div style={{ padding:'12px 14px' }}>
                  <div style={{ color:'#888888', fontSize:10, fontWeight:700, letterSpacing:'0.12em', marginBottom:4 }}>{rp.brand}</div>
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

// Compare Page
const ComparePage = () => {
  const { compareList, toggleCompare, setPage, addToCart, t, formatPrice } = React.useContext(window.AppContext);
  if (compareList.length < 2) return (
    <div style={{ paddingTop:64, padding:'120px 80px', textAlign:'center' }}>
      <div style={{ color:'#9f9f9f', fontSize:16 }}>Add at least 2 products to compare.</div>
      <button style={{ marginTop:20, ...window.homeStyles.heroBtnSecondary }} onClick={()=>setPage('catalog')}>Browse Catalog</button>
    </div>
  );

  const allKeys = [...new Set(compareList.flatMap(p=>Object.keys(p.specs)))];

  // Compute a performance score (0-100) based on numeric specs and price/rating
  const computeScore = (product) => {
    const numericVals = Object.values(product.specs).filter(v => typeof v === 'number' || !isNaN(parseFloat(v)));
    const specScore = numericVals.reduce((s, v) => s + Math.min(parseFloat(v) / 100, 1), 0) / Math.max(numericVals.length, 1);
    return Math.min(100, Math.round((specScore * 50) + ((product.rating || 0) / 5 * 30) + Math.min((product.reviews || 0) / 500 * 20, 20)));
  };

  const scores = compareList.map(p => computeScore(p));
  const maxScore = Math.max(...scores);

  // Check basic compatibility between components
  const getCompatibility = () => {
    if (compareList.length < 2) return [];
    const issues = [];
    const cpu = compareList.find(p => p.category === 'cpu');
    const mb = compareList.find(p => p.category === 'motherboard');
    const ram = compareList.find(p => p.category === 'ram');
    if (cpu && mb && cpu.specs?.socket && mb.specs?.socket && cpu.specs.socket !== mb.specs.socket)
      issues.push(`Socket incompatible : CPU ${cpu.specs.socket} ≠ Carte mère ${mb.specs.socket}`);
    if (ram && mb && ram.specs?.type && mb.specs?.ramType && ram.specs.type !== mb.specs.ramType)
      issues.push(`RAM incompatible : ${ram.specs.type} ≠ ${mb.specs.ramType}`);
    return issues;
  };
  const compatIssues = getCompatibility();

  return (
    <div style={{ paddingTop:64, padding:'64px 80px' }}>
      <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:32, color:'#111111', marginBottom:16 }}>Compare Products</h1>

      {/* Compatibility alerts */}
      {compatIssues.length > 0 && (
        <div style={{ background:'#cc444420', border:'1px solid #cc4444', borderRadius:10, padding:'12px 20px', marginBottom:32, display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ color:'#cc4444', fontWeight:700, fontSize:13, marginBottom:4 }}>⚠ Incompatibilités détectées</div>
          {compatIssues.map((issue, i) => (
            <div key={i} style={{ color:'#e8a8a8', fontSize:13 }}>• {issue}</div>
          ))}
        </div>
      )}
      {compatIssues.length === 0 && compareList.some(p=>['cpu','motherboard','ram'].includes(p.category)) && (
        <div style={{ background:'#4caf5020', border:'1px solid #4caf50', borderRadius:10, padding:'10px 20px', marginBottom:32 }}>
          <span style={{ color:'#4caf50', fontSize:13 }}>✓ Aucun problème de compatibilité détecté</span>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:`200px repeat(${compareList.length}, 1fr)`, gap:2, border:'1px solid #e0e0e0', borderRadius:12, overflow:'hidden', background:'#f5f5f5' }}>
        {/* Header */}
        <div style={cmpStyles.headerCell}/>
        {compareList.map((p, idx)=>(
          <div key={p.id} style={cmpStyles.productHeader}>
            <button style={cmpStyles.removeBtn} onClick={()=>toggleCompare(p)}>×</button>
            <div style={{ height:80, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {p.images?.[0]
                ? <img src={p.images[0]} alt={p.name} style={{ maxHeight:70, maxWidth:'100%', objectFit:'contain' }} onError={e=>e.target.style.display='none'} />
                : <ProductVisual category={p.category} />
              }
            </div>
            <div style={{ color:'#888888', fontSize:11, marginBottom:4 }}>{p.brand}</div>
            <div style={{ color:'#111111', fontWeight:600, fontSize:13, lineHeight:1.4, marginBottom:8 }}>{p.name}</div>
            <div style={{ color:'#e8001d', fontWeight:700, fontSize:18, marginBottom:12 }}>{formatPrice(p.price)}</div>
            <button style={cmpStyles.addBtn} onClick={()=>addToCart(p)}>Add to Cart</button>
          </div>
        ))}

        {/* Score de performance */}
        <div style={{ ...cmpStyles.labelCell, background:'#f0f0f0', color:'#e8001d', fontWeight:700 }}>SCORE PERF.</div>
        {compareList.map((p, idx) => {
          const score = scores[idx];
          const isBest = score === maxScore;
          return (
            <div key={p.id} style={{ ...cmpStyles.valueCell, background:'#f0f0f0', padding:'12px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ color: isBest ? '#55efc4' : '#ffffff', fontWeight:700, fontSize:16, fontFamily:"'Space Grotesk',sans-serif" }}>{score}</span>
                {isBest && <span style={{ background:'#55efc420', color:'#55efc4', fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3 }}>MEILLEUR</span>}
              </div>
              <div style={{ height:6, background:'var(--gray-200)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${score}%`, background: isBest ? '#22c55e' : 'var(--red)', borderRadius:3, transition:'width 0.4s ease' }} />
              </div>
            </div>
          );
        })}

        {/* Spec rows with visual bars for numeric values */}
        {allKeys.map((key,i)=>{
          const rawVals = compareList.map(p => p.specs[key]);
          const numVals = rawVals.map(v => v !== undefined && !isNaN(parseFloat(v)) ? parseFloat(v) : null);
          const maxVal = Math.max(...numVals.filter(v => v !== null));
          const hasNumeric = numVals.some(v => v !== null) && maxVal > 0;
          return (
            <React.Fragment key={key}>
              <div style={{ ...cmpStyles.labelCell, background: i%2===0?'#212121':'#242424' }}>
                {key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}
              </div>
              {compareList.map((p, pIdx)=>{
                const val = p.specs[key];
                const numVal = numVals[pIdx];
                const isTop = hasNumeric && numVal !== null && numVal === maxVal;
                return (
                  <div key={p.id} style={{ ...cmpStyles.valueCell, background: i%2===0?'#212121':'#242424', padding:'8px 16px' }}>
                    <div style={{ color: isTop ? '#22c55e' : 'var(--black)', fontWeight: isTop ? 600 : 400 }}>
                      {val !== undefined ? (Array.isArray(val)?val.join(', '):String(val)) : <span style={{ color:'var(--gray-300)' }}>—</span>}
                    </div>
                    {hasNumeric && numVal !== null && (
                      <div style={{ height:3, background:'var(--gray-200)', borderRadius:2, marginTop:5, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${(numVal/maxVal)*100}%`, background: isTop ? '#22c55e' : 'var(--gray-400)', borderRadius:2 }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const catStyles = {
  page: { paddingTop:64 },

  // Banner — on garde le fond sombre pour l'effet visuel
  banner: { position:'relative', height:360, overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', background:'#0a0a0a' },
  bannerImg: { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 40%', opacity: 0.4 },
  bannerGrid: {
    position:'absolute', inset:0, opacity:0.1, zIndex:1,
    backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.05) 39px, rgba(255,255,255,0.05) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.05) 39px, rgba(255,255,255,0.05) 40px)',
  },
  bannerGlow: {
    position:'absolute', top:'20%', left:'10%', width:600, height:600, zIndex:1,
    background:'radial-gradient(ellipse at 40% 50%, rgba(232,0,29,0.3) 0%, transparent 65%)',
    pointerEvents:'none',
  },
  bannerOverlay: {
    position:'absolute', inset:0,
    background:'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8) 100%)',
    zIndex:1
  },
  bannerContent: { position:'relative', zIndex:2, width:'100%', padding:'0 80px' },
  bannerEye: { color:'#e8001d', fontSize:12, fontWeight:600, letterSpacing:'0.2em', marginBottom:12 },
  bannerTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:48, color:'#ffffff', margin:'0 0 12px', lineHeight:1.1 },

  breadcrumb: { color:'#666666', fontSize:13, marginBottom:8, fontFamily:"'Space Grotesk',sans-serif" },
  pageTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:36, color:'#111111', margin:0 },
  layout: { display:'flex', gap:0 },
  sidebar: { width:240, flexShrink:0, padding:'28px 24px', borderRight:'1px solid #e0e0e0', minHeight:'100vh', background:'#f8f8f8' },
  filterGroup: { marginBottom:28 },
  filterLabel: { color:'#888888', fontSize:10, fontWeight:700, letterSpacing:'0.15em', marginBottom:10 },
  filterBtn: { display:'block', width:'100%', textAlign:'left', background:'none', border:'none', padding:'6px 10px', borderRadius:6, color:'#555555', fontSize:13, cursor:'pointer', transition:'all 0.15s', fontFamily:"'Space Grotesk',sans-serif" },
  filterBtnActive: { background:'#eeeeee', color:'#111111', borderLeft:'2px solid #e8001d', paddingLeft:8 },
  checkRow: { display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer' },
  priceInput: { background:'#ffffff', border:'1px solid #dddddd', borderRadius:6, padding:'4px 8px', color:'#333333', fontSize:12, minWidth:60, textAlign:'center' },
  comparePanel: { background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:10, padding:14, marginTop:16 },
  compareItem: { display:'flex', alignItems:'center', gap:8, marginBottom:8 },
  removeBtn: { background:'none', border:'none', cursor:'pointer', color:'#888888', fontSize:16, padding:'0 4px', flexShrink:0 },
  compareBtn: { width:'100%', padding:'8px', background:'#e8001d', color:'#ffffff', border:'none', borderRadius:6, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, cursor:'pointer', marginTop:4 },
  main: { flex:1, padding:'28px 32px' },
  toolbar: { display:'flex', alignItems:'center', gap:12, marginBottom:24, background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:10, padding:'12px 16px' },
  searchInput: { background:'transparent', border:'none', outline:'none', color:'#111111', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, flex:1, minWidth:0 },
  sortSelect: { background:'#ffffff', border:'1px solid #dddddd', color:'#333333', padding:'6px 10px', borderRadius:6, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, outline:'none' },
  grid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20 },
  empty: { textAlign:'center', padding:'80px 20px' },
  card: { background:'#ffffff', border:'1px solid #e0e0e0', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column', transition:'all 0.2s' },
  cardHov: { borderColor:'#cccccc', transform:'translateY(-2px)', boxShadow:'0 8px 30px rgba(0,0,0,0.08)' },
  cardImg: { height:140, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor:'pointer', flexShrink:0 },
  bsBadge: { position:'absolute', top:8, left:8, background:'#e8001d', color:'#ffffff', fontSize:8, fontWeight:700, padding:'2px 6px', borderRadius:3, letterSpacing:'0.1em' },
  favBtn: { position:'absolute', top:8, right:8, background:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer', width:28, height:28, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', transition:'color 0.2s' },
  cardBody: { padding:'14px 14px 0', cursor:'pointer', flex:1 },
  catTag: { fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, letterSpacing:'0.1em', display:'inline-block' },
  stockDot: { width:6, height:6, borderRadius:'50%' },
  brand: { color:'#888888', fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:8, marginBottom:2 },
  name: { color:'#111111', fontWeight:600, fontSize:13, lineHeight:1.4, marginBottom:6 },
  rating: { color:'#e8001d', fontSize:11, marginBottom:10 },
  specs: { borderTop:'1px solid #eeeeee', paddingTop:10, marginBottom:4 },
  specRow: { display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4, fontFamily:"'DM Mono',monospace" },
  cardFooter: { padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid #eeeeee', marginTop:'auto' },
  price: { color:'#111111', fontWeight:700, fontSize:18, fontFamily:"'Space Grotesk',sans-serif" },
  compareIconBtn: { width:32, height:32, border:'1px solid #e0e0e0', borderRadius:6, background:'transparent', color:'#888888', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' },
  addBtn: { background:'#e8001d', color:'#ffffff', border:'none', cursor:'pointer', padding:'6px 14px', borderRadius:6, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, transition:'background 0.2s' },
};

const pdStyles = {
  page: { paddingTop:64, padding:'64px 80px' },
  breadcrumb: { color:'#888888', fontSize:13, marginBottom:32, fontFamily:"'Space Grotesk',sans-serif" },
  layout: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, marginBottom:64 },
  imgArea: { borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', minHeight:360, position:'relative', overflow:'hidden' },
  tag: { position:'absolute', top:16, left:16, background:'rgba(255,255,255,0.9)', color:'#e8001d', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:4, letterSpacing:'0.1em', textTransform:'uppercase', marginRight:6 },
  info: { display:'flex', flexDirection:'column' },
  catBadge: { display:'inline-block', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:5, letterSpacing:'0.1em', marginBottom:12, width:'fit-content' },
  brand: { color:'#888888', fontSize:13, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 },
  name: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:28, color:'#111111', margin:'0 0 12px 0', lineHeight:1.3 },
  ratingRow: { display:'flex', alignItems:'center', marginBottom:20 },
  price: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:40, color:'#e8001d', marginBottom:16 },
  stockRow: { display:'flex', alignItems:'center', gap:8, marginBottom:24 },
  qtyRow: { display:'flex', alignItems:'center', gap:12, marginBottom:20 },
  qtyBtn: { width:36, height:36, border:'1px solid var(--gray-300)', background:'var(--white)', color:'var(--black)', borderRadius:8, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  addCartBtn: { flex:1, padding:'14px', background:'var(--red)', color:'#ffffff', border:'none', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', transition:'background 0.2s' },
  favBtn2: { width:48, height:48, border:'1px solid var(--gray-300)', background:'transparent', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', flexShrink:0 },
  builderBtn: { display:'flex', alignItems:'center', gap:8, background:'#f5f5f5', border:'1px solid #e0e0e0', color:'#e8001d', padding:'12px 20px', borderRadius:8, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14, transition:'all 0.2s', width:'100%', justifyContent:'center' },
  specsSection: { borderTop:'1px solid #e0e0e0', paddingTop:48 },
  specsTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#111111', marginBottom:24 },
  specsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, border:'1px solid #e0e0e0', borderRadius:10, overflow:'hidden' },
  specRow: { display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #eeeeee' },
  specKey: { padding:'12px 20px', color:'#888888', fontSize:13, background:'#f8f8f8', fontFamily:"'DM Mono',monospace" },
  specVal: { padding:'12px 20px', color:'#111111', fontSize:13, background:'#ffffff', fontFamily:"'DM Mono',monospace" },
};

const cmpStyles = {
  headerCell: { background:'#f8f8f8', padding:16 },
  productHeader: { background:'#ffffff', padding:20, position:'relative', borderLeft:'1px solid #e0e0e0', textAlign:'center' },
  removeBtn: { position:'absolute', top:8, right:8, background:'none', border:'none', color:'#888888', fontSize:18, cursor:'pointer' },
  labelCell: { padding:'12px 16px', color:'#888888', fontSize:13, fontFamily:"'DM Mono',monospace", borderBottom:'1px solid #eeeeee' },
  valueCell: { padding:'12px 16px', color:'#111111', fontSize:13, fontFamily:"'DM Mono',monospace", borderLeft:'1px solid #e0e0e0', borderBottom:'1px solid #eeeeee', textAlign:'center' },
  addBtn: { background:'#e8001d', color:'#ffffff', border:'none', borderRadius:6, padding:'7px 16px', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, cursor:'pointer', width:'100%' },
};

Object.assign(window, { CatalogPage, ProductDetailPage, ComparePage });
