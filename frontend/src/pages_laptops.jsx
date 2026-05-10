import React from "react";

const ImageCarousel = window.ImageCarousel;

// pages_laptops.jsx — PC Portables catalog page

const LaptopsPage = () => {
  const { setPage, addToCart, toggleFav, favorites, dataLoaded, t, formatPrice } = React.useContext(window.AppContext);

  const [sortBy,       setSortBy]       = React.useState('featured');
  const [search,       setSearch]       = React.useState('');
  const [priceRange,   setPriceRange]   = React.useState([0, 5000]);
  const [brands,       setBrands]       = React.useState([]);
  const [inStockOnly,  setInStockOnly]  = React.useState(false);
  const [minRating,    setMinRating]    = React.useState(0);

  const filtered = React.useMemo(() => {
    let prods = window.LAPTOPS || [];
    if (search)
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(search.toLowerCase())
      );
    if (inStockOnly)  prods = prods.filter(p => p.stock !== 'out_of_stock');
    if (brands.length) prods = prods.filter(p => brands.includes(p.brand));
    prods = prods.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) prods = prods.filter(p => (p.rating || 0) >= minRating);
    if (sortBy === 'price_asc')  prods = [...prods].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') prods = [...prods].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating')     prods = [...prods].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'reviews')    prods = [...prods].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    return prods;
  }, [search, inStockOnly, brands, priceRange, minRating, sortBy, dataLoaded]);

  const availableBrands = React.useMemo(() => {
    const prods = window.LAPTOPS || [];
    return [...new Set(prods.map(p => p.brand).filter(Boolean))].sort();
  }, [dataLoaded]);

  const toggleBrand = (b) =>
    setBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

  return (
    <div style={ls.page}>

      {/* ── Banner ── */}
      <div style={ls.banner} className="rsp-banner">
        <video autoPlay loop muted playsInline style={ls.bannerVideo}>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div style={ls.bannerOverlay} />
        <div style={ls.bannerContent} className="rsp-banner-content">
          <div style={ls.bannerEye} className="rsp-banner-eye">{t('laptops_eye')}</div>
          <h1 style={ls.bannerTitle} className="rsp-banner-title">{t('laptops_title')}</h1>
          <p style={ls.bannerDesc}>{t('laptops_desc')}</p>
        </div>
      </div>

      <div style={ls.layout} className="rsp-catalog">

        {/* ── Sidebar filtres ── */}
        <aside style={ls.sidebar} className="rsp-catalog-sidebar">

          {/* Stock */}
          <div style={ls.filterGroup}>
            <div style={ls.filterLabel}>{t('filter_availability')}</div>
            <label style={ls.checkRow}>
              <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} style={{ accentColor: '#e8001d' }} />
              <span style={{ color: '#b8b8b8', fontSize: 13 }}>{t('filter_in_stock_only')}</span>
            </label>
          </div>

          {/* Prix */}
          <div style={ls.filterGroup}>
            <div style={ls.filterLabel}>{t('filter_price')}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={ls.priceInput}>{formatPrice(priceRange[0])}</div>
              <span style={{ color: '#9f9f9f', alignSelf: 'center' }}>—</span>
              <div style={ls.priceInput}>{formatPrice(priceRange[1])}</div>
            </div>
            <input type="range" min={0} max={5000} step={50} value={priceRange[0]}
              onChange={e => setPriceRange([Math.min(+e.target.value, priceRange[1] - 50), priceRange[1]])}
              style={{ width: '100%', accentColor: '#e8001d', marginBottom: 6 }} />
            <input type="range" min={0} max={5000} step={50} value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0] + 50)])}
              style={{ width: '100%', accentColor: '#e8001d' }} />
          </div>

          {/* Note */}
          <div style={ls.filterGroup}>
            <div style={ls.filterLabel}>{t('filter_min_rating')}</div>
            {[4, 3, 2].map(r => (
              <label key={r} style={ls.checkRow}>
                <input type="radio" name="laptop_rating" checked={minRating === r}
                  onChange={() => setMinRating(minRating === r ? 0 : r)}
                  style={{ accentColor: '#e8001d' }} />
                <span style={{ color: '#e8001d', fontSize: 12 }}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
                <span style={{ color: '#a8a8a8', fontSize: 11 }}>&amp; +</span>
              </label>
            ))}
            {minRating > 0 && (
              <button style={{ ...ls.filterBtn, color: '#9f9f9f', fontSize: 11, padding: 0, marginTop: 8 }}
                onClick={() => setMinRating(0)}>✕ {t('clear_filter')}</button>
            )}
          </div>

          {/* Marques — viennent d'Odoo via pc_brand */}
          {availableBrands.length > 0 && (
            <div style={ls.filterGroup}>
              <div style={ls.filterLabel}>{t('filter_brand')}</div>
              {availableBrands.map(b => (
                <label key={b} style={ls.checkRow}>
                  <input type="checkbox" checked={brands.includes(b)} onChange={() => toggleBrand(b)} style={{ accentColor: '#e8001d' }} />
                  <span style={{ color: '#b8b8b8', fontSize: 13 }}>{b}</span>
                </label>
              ))}
            </div>
          )}
        </aside>

        {/* ── Contenu principal ── */}
        <main style={ls.main}>

          {/* Toolbar */}
          <div style={ls.toolbar}>
            <input
              placeholder={t('laptops_search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={ls.searchInput}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <span style={{ color: '#9f9f9f', fontSize: 13 }}>{t('products_count', filtered.length)}</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={ls.sortSelect}>
                <option value="featured">{t('sort_featured')}</option>
                <option value="price_asc">{t('sort_price_asc')}</option>
                <option value="price_desc">{t('sort_price_desc')}</option>
                <option value="rating">{t('sort_rating')}</option>
                <option value="reviews">{t('sort_reviews')}</option>
              </select>
            </div>
          </div>

          {/* Grille */}
          {filtered.length === 0 ? (
            <div style={ls.empty}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>💻</div>
              <div style={{ color: '#a8a8a8' }}>{t('no_products')}</div>
            </div>
          ) : (
            <div style={ls.grid} className="rsp-grid-3">
              {filtered.map(p => (
                <LaptopCard
                  key={p.id}
                  product={p}
                  onView={() => setPage('product', { product: p })}
                  onAdd={() => addToCart(p)}
                  onFav={() => toggleFav(p.id)}
                  isFav={favorites.has(p.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ── Carte produit portable ────────────────────────────────────────────────────

const LaptopCard = ({ product, onView, onAdd, onFav, isFav }) => {
  const { t, formatPrice } = React.useContext(window.AppContext);
  const [hov, setHov] = React.useState(false);
  const color = '#6c5ce7'; // violet dédié portables
  const specEntries = Object.entries(product.specs || {}).slice(0, 4);
  const badge = product.tags?.includes('bestseller') ? t('badge_bestseller')
    : product.stock === 'low_stock'     ? t('badge_low_stock')
    : product.stock === 'out_of_stock'  ? t('badge_out_of_stock') : null;

  return (
    <div
      style={{
        background: '#242424',
        border: `1px solid ${hov ? color : '#3c3c3c'}`,
        borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.25s', position: 'relative',
        transform: hov ? 'translateY(-4px)' : 'none',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Favori */}
      <button
        style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(14,14,14,0.85)', border: 'none', cursor: 'pointer', width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, color: isFav ? '#e8001d' : '#9f9f9f' }}
        onClick={e => { e.stopPropagation(); onFav(); }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill={isFav ? '#e8001d' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {badge && (
        <div style={{ position: 'absolute', top: 14, right: 14, background: badge === t('badge_bestseller') ? color + '28' : '#cc444428', color: badge === t('badge_bestseller') ? color : '#cc4444', fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 4, letterSpacing: '0.1em', zIndex: 1 }}>
          {badge}
        </div>
      )}

      {/* Image */}
      <div style={{ height: 200, background: `linear-gradient(135deg, ${color}14, #212121)`, overflow: 'hidden', cursor: 'pointer' }} onClick={onView}>
        <ImageCarousel images={product.images} category={product.category} />
      </div>

      {/* Infos */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }} onClick={onView}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
            <div style={{ color, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 5 }}>{t('label_laptop').toUpperCase()}</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: '#ffffff', lineHeight: 1.3 }}>{product.name}</div>
            {product.brand && <div style={{ color: '#9f9f9f', fontSize: 11, marginTop: 3 }}>{product.brand}</div>}
          </div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: '#e8001d', flexShrink: 0 }}>{formatPrice(product.price)}</div>
        </div>

        {/* Specs — viennent du JSON Odoo */}
        {specEntries.length > 0 && (
          <div style={{ background: '#1e1e1e', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
            {specEntries.map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'baseline', ...(i < specEntries.length - 1 ? { marginBottom: 5, borderBottom: '1px solid #2a2a2a', paddingBottom: 5 } : {}) }}>
                <span style={{ color: '#9f9f9f', fontSize: 10, minWidth: 60, flexShrink: 0 }}>{k}</span>
                <span style={{ color: '#cccccc', fontSize: 11, fontFamily: "'DM Mono',monospace" }}>{Array.isArray(v) ? v.join(', ') : String(v)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <span style={{ color: '#e8001d', fontSize: 12 }}>{'★'.repeat(Math.round(product.rating || 0))}</span>
            <span style={{ color: '#9f9f9f', marginLeft: 5, fontSize: 11 }}>{product.rating || 0} ({(product.reviews || 0).toLocaleString()})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: product.stock === 'out_of_stock' ? '#cc4444' : product.stock === 'low_stock' ? '#e8a020' : '#4caf70' }} />
            <span style={{ color: product.stock === 'out_of_stock' ? '#cc4444' : product.stock === 'low_stock' ? '#e8a020' : '#b0b0b0', fontSize: 11 }}>
              {product.stock === 'in_stock' ? t('in_stock') : product.stock === 'low_stock' ? t('low_stock') : t('out_of_stock')}
            </span>
          </div>
        </div>

        <button
          style={{ width: '100%', padding: '12px', background: color, color: '#ffffff', border: 'none', borderRadius: 8, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'opacity 0.2s', marginTop: 'auto' }}
          onClick={e => { e.stopPropagation(); onAdd(); }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {t('add_to_cart', formatPrice(product.price))}
        </button>
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const ls = {
  page:   { paddingTop: 64, minHeight: '100vh', background: '#1a1a1a' },

  banner: { position: 'relative', height: 220, overflow: 'hidden', borderBottom: '1px solid #2a2a2a' },
  bannerVideo:   { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 },
  bannerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.88) 0%, transparent 65%, rgba(0,0,0,0.6) 100%)' },
  bannerContent: { position: 'relative', zIndex: 2, padding: '40px 80px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  bannerEye:   { color: '#6c5ce7', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', marginBottom: 8 },
  bannerTitle: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 32, color: '#ffffff', margin: '0 0 6px' },
  bannerDesc:  { color: '#a8a8a8', fontSize: 14, margin: 0 },

  layout:  { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 0, alignItems: 'start' },

  sidebar: { borderRight: '1px solid #2a2a2a', padding: '28px 20px', position: 'sticky', top: 64, maxHeight: 'calc(100vh - 64px)', overflowY: 'auto', background: '#1a1a1a' },
  filterGroup: { marginBottom: 28 },
  filterLabel: { color: '#9f9f9f', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 12 },
  checkRow:    { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' },
  priceInput:  { flex: 1, background: '#242424', border: '1px solid #3c3c3c', borderRadius: 6, padding: '5px 8px', color: '#b8b8b8', fontSize: 11, textAlign: 'center' },
  filterBtn:   { background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", transition: 'color 0.15s' },

  main:    { padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 20 },
  toolbar: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  searchInput: {
    flex: 1, minWidth: 180,
    background: '#242424', border: '1px solid #3c3c3c', borderRadius: 8,
    padding: '10px 14px', color: '#ffffff',
    fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, outline: 'none',
  },
  sortSelect: {
    background: '#242424', border: '1px solid #3c3c3c', borderRadius: 8,
    padding: '9px 12px', color: '#b8b8b8',
    fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, outline: 'none', cursor: 'pointer',
  },
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
};

Object.assign(window, { LaptopsPage });
