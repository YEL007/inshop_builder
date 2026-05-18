import React from "react";
import ReactDOM from "react-dom/client";
import { FR, EN } from './i18n.js';

// app.jsx — Main App: Context, Router, State Management

const AppContext = React.createContext(null);
window.AppContext = AppContext;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#e8001d",
  "accentBright": "#ffffff",
  "bgBase": "#ffffff",
  "fontHeading": "'Space Grotesk', sans-serif",
  "style": "white"
}/*EDITMODE-END*/;

const STYLE_PRESETS = {
  white: { accent: '#e8001d', bright: '#ffffff', bg: '#f5f5f5' },
  warm: { accent: '#e8e0d0', bright: '#f5f0e8', bg: '#0a0908' },
  cool: { accent: '#c8d8e8', bright: '#ddeeff', bg: '#080a0c' },
  dim: { accent: '#909090', bright: '#333333', bg: '#060606' },
};

const App = () => {
  console.log('[App] Component function executing');
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);
  const [tweakVisible, setTweakVisible] = React.useState(false);
  const [dataLoaded, setDataLoaded] = React.useState(0);
  const [config, setConfig] = React.useState(window.SITE_CONFIG || {});

  // Langue & devise
  const [lang, setLangRaw] = React.useState(() => localStorage.getItem('inshop_lang') || 'fr');
  const [xofRate, setXofRate] = React.useState(() => +localStorage.getItem('inshop_xof_rate') || 614);

  const setLang = React.useCallback((l) => {
    setLangRaw(l);
    localStorage.setItem('inshop_lang', l);
  }, []);

  React.useEffect(() => {
    const cached = localStorage.getItem('inshop_xof_rate');
    const cachedAt = +localStorage.getItem('inshop_xof_ts') || 0;
    if (cached && Date.now() - cachedAt < 3_600_000) { setXofRate(+cached); return; }
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => {
        const r = d?.rates?.XOF;
        if (r) {
          setXofRate(r);
          localStorage.setItem('inshop_xof_rate', String(r));
          localStorage.setItem('inshop_xof_ts', String(Date.now()));
        }
      })
      .catch(() => {});
  }, []);

  const dict = lang === 'fr' ? FR : EN;

  const t = React.useCallback((key, ...args) => {
    const val = (lang === 'fr' ? FR : EN)[key];
    if (typeof val === 'function') return val(...args);
    return val ?? key;
  }, [lang]);

  const formatPrice = React.useCallback((usdPrice) => {
    if (!usdPrice && usdPrice !== 0) return '';
    if (lang === 'fr') return Math.round(usdPrice * xofRate).toLocaleString('fr-FR') + ' CFA';
    return '$' + Number(usdPrice).toLocaleString('en-US');
  }, [lang, xofRate]);

  const [catalogError, setCatalogError] = React.useState(false);
  React.useEffect(() => {
    const handler = (e) => {
      const ok = e.detail?.ok !== false;
      if (!ok) setCatalogError(true);

      // Clean up cached build items that no longer exist in the backend
      setBuild(prevBuild => {
        const nextBuild = { ...prevBuild };
        let changed = false;
        const allIds = (window.ALL_PRODUCTS || []).map(p => p.id);
        for (const key of Object.keys(nextBuild)) {
          if (nextBuild[key] && !allIds.includes(nextBuild[key].id)) {
            delete nextBuild[key];
            changed = true;
          }
        }
        if (!ok || changed) {
          if (!ok) {
            localStorage.removeItem('inshop_build');
            return {};
          } else if (changed) {
            localStorage.setItem('inshop_build', JSON.stringify(nextBuild));
            return nextBuild;
          }
        }
        return prevBuild;
      });

      // Clean up cached cart items that no longer exist in the backend
      if (window.SITE_CONFIG) setConfig(window.SITE_CONFIG);
      setDataLoaded(Date.now()); // Force re-render with timestamp
      if (!ok) setCatalogError(true);

      cartRef.current = cartRef.current.filter(item => (window.ALL_PRODUCTS || []).some(p => p.id === item.id));
      if (!ok || cartRef.current.length !== cart.length) {
        if (!ok) {
          // Keep cart if offline? Maybe not if we can't verify prices
          // localStorage.removeItem('inshop_cart');
        } else {
          localStorage.setItem('inshop_cart', JSON.stringify(cartRef.current));
        }
        setCart(cartRef.current);
      }

      if (!ok) {
        setPageParams({});
        localStorage.removeItem('inshop_params');
      }
    };

    // If already loaded before mount
    if (window.ALL_PRODUCTS && window.ALL_PRODUCTS.length > 0) {
      setDataLoaded(Date.now());
    }

    window.addEventListener('catalog:loaded', handler);
    return () => window.removeEventListener('catalog:loaded', handler);
  }, []);

  // Router state
  const [page, setPageRaw] = React.useState(() => {
    // Read page from URL path on load (e.g. /catalog → 'catalog')
    const pathPage = window.location.pathname.replace('/', '') || 'home';
    const knownPages = ['home','catalog','prebuilt','onlyonepc','peripherals','laptops','builder','onlyone_builder','cart','checkout','user','product','prebuilt-detail','onlyonepc-detail','compare'];
    return knownPages.includes(pathPage) ? pathPage : (localStorage.getItem('inshop_page') || 'home');
  });
  const [pageParams, setPageParams] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('inshop_params') || '{}'); } catch { return {}; }
  });

  React.useEffect(() => {
    const handlePopState = (e) => {
      if (e.state) {
        setPageRaw(e.state.page);
        setPageParams(e.state.params);
        localStorage.setItem('inshop_page', e.state.page);
        localStorage.setItem('inshop_params', JSON.stringify(e.state.params));
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Sync initial history state with current URL
    const currentPage = window.location.pathname.replace('/', '') || 'home';
    window.history.replaceState({ page: currentPage, params: JSON.parse(localStorage.getItem('inshop_params') || '{}') }, '', window.location.pathname);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setPage = React.useCallback((p, params = {}, replace = false) => {
    setPageRaw(p);
    setPageParams(params);
    localStorage.setItem('inshop_page', p);
    localStorage.setItem('inshop_params', JSON.stringify(params));

    const urlPath = p === 'home' ? '/' : '/' + p;
    if (replace === true) {
      window.history.replaceState({ page: p, params }, '', urlPath);
    } else {
      window.history.pushState({ page: p, params }, '', urlPath);
    }
    window.scrollTo(0, 0);
  }, []);

  // Current user session
  const [currentUser, setCurrentUser] = React.useState(null);
  React.useEffect(() => {
    const sessionHandler = (e) => {
      if (e.detail?.authenticated) setCurrentUser(e.detail);
      else setCurrentUser(null);
    };
    const logoutHandler = () => setCurrentUser(null);
    window.addEventListener('pc:session', sessionHandler);
    window.addEventListener('pc:logout', logoutHandler);
    // Check session on mount
    window.PcApi?.me().then(d => { if (d.authenticated) setCurrentUser(d); }).catch(() => { });
    return () => {
      window.removeEventListener('pc:session', sessionHandler);
      window.removeEventListener('pc:logout', logoutHandler);
    };
  }, []);

  // Cart state
  const [cart, setCart] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('inshop_cart') || '[]'); } catch { return []; }
  });
  const cartRef = React.useRef(cart);

  const isNumericId = (id) => typeof id === 'number' || (typeof id === 'string' && /^\d+$/.test(id));

  const addToCart = React.useCallback((product) => {
    const prev = cartRef.current;
    const existing = prev.find(i => i.id === product.id);
    let next;
    if (existing) {
      next = prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
    } else {
      next = [...prev, { ...product, cartId: product.id + '_' + Date.now(), qty: 1 }];
    }
    localStorage.setItem('inshop_cart', JSON.stringify(next));
    cartRef.current = next;
    setCart(next);
    if (currentUser?.authenticated && window.PcApi) {
      const pid = product.odoo_id || product.id;
      if (isNumericId(pid)) {
        window.PcApi.cartAdd(pid, 1)
          .catch(e => console.warn('[Cart] cartAdd:', e.message));
      }
    }
  }, [currentUser]);

  const removeFromCart = React.useCallback((cartId) => {
    const item = cartRef.current.find(i => i.cartId === cartId);
    const next = cartRef.current.filter(i => i.cartId !== cartId);
    localStorage.setItem('inshop_cart', JSON.stringify(next));
    cartRef.current = next;
    setCart(next);
    if (currentUser?.authenticated && window.PcApi && item) {
      const pid = item.odoo_id || item.id;
      if (isNumericId(pid)) {
        window.PcApi.cartRemove(pid)
          .catch(e => console.warn('[Cart] cartRemove:', e.message));
      }
    }
  }, [currentUser]);

  const updateQty = React.useCallback((cartId, qty) => {
    if (qty <= 0) { removeFromCart(cartId); return; }
    const next = cartRef.current.map(i => i.cartId === cartId ? { ...i, qty } : i);
    localStorage.setItem('inshop_cart', JSON.stringify(next));
    cartRef.current = next;
    setCart(next);
    if (currentUser?.authenticated && window.PcApi) {
      const items = next.map(i => ({ product_id: i.odoo_id || i.id, qty: i.qty })).filter(i => isNumericId(i.product_id));
      if (items.length > 0) {
        window.PcApi.cartSync(items).catch(e => console.warn('[Cart] cartSync:', e.message));
      }
    }
  }, [removeFromCart, currentUser]);

  const clearCart = React.useCallback(() => {
    cartRef.current = [];
    setCart([]);
    localStorage.removeItem('inshop_cart');
    if (currentUser?.authenticated && window.PcApi) {
      window.PcApi.cartSync([]).catch(e => console.warn('[Cart] cartSync(clear):', e.message));
    }
  }, [currentUser]);

  // Favorites
  const [favorites, setFavorites] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('inshop_favs') || '[]')); } catch { return new Set(); }
  });

  const toggleFav = React.useCallback((id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('inshop_favs', JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Build state
  const [build, setBuild] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('inshop_build') || '{}'); } catch { return {}; }
  });

  const setBuildPersist = React.useCallback((updater) => {
    setBuild(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('inshop_build', JSON.stringify(next));
      return next;
    });
  }, []);

  const addToBuild = React.useCallback((product) => {
    setBuildPersist(prev => ({ ...prev, [product.category]: product }));
  }, [setBuildPersist]);

  // Compare list
  const [compareList, setCompareList] = React.useState([]);
  const toggleCompare = React.useCallback((product) => {
    setCompareList(prev => {
      if (prev.some(p => p.id === product.id)) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');


  // Tweaks message listener
  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweakVisible(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweakVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  // Apply accent color CSS variable
  React.useEffect(() => {
    const preset = STYLE_PRESETS[tweaks.style] || STYLE_PRESETS.white;
    document.documentElement.style.setProperty('--accent', tweaks.accentColor || preset.accent);
    document.documentElement.style.setProperty('--accent-bright', tweaks.accentBright || preset.bright);
    document.documentElement.style.setProperty('--bg-base', tweaks.bgBase || preset.bg);
  }, [tweaks]);

  const cartCount = React.useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const favCount = favorites.size;

  const ctxValue = {
    page, setPage, pageParams,
    cart, addToCart, removeFromCart, updateQty, clearCart,
    favorites, toggleFav,
    build, setBuild: setBuildPersist, addToBuild,
    compareList, toggleCompare,
    searchQuery, setSearchQuery,
    currentUser, setCurrentUser,
    dataLoaded, catalogError,
    lang, setLang, t, formatPrice,
    config,
  };

  const renderPage = () => {
    const Home = window.HomePage;
    const Catalog = window.CatalogPage;
    const Prebuilt = window.PrebuiltPage;
    const OnlyOnePc = window.OnlyOnePcPage;
    const Peripherals = window.PeripheralsPage;
    const Builder = window.BuilderPage;
    const Cart = window.CartPage;
    const Checkout = window.CheckoutPage;
    const User = window.UserPage;
    const ProductDetail = window.ProductDetailPage;
    const PrebuiltDetail = window.PrebuiltDetailPage;
    const OnlyOnePcDetail = window.OnlyOnePcDetailPage;
    const Compare = window.ComparePage;
    const Laptops = window.LaptopsPage;
    const Contact = window.ContactPage;

    switch (page) {
      case 'home': return Home ? <Home /> : null;
      case 'catalog': return Catalog ? <Catalog initialCategory={pageParams.category || 'all'} /> : null;
      case 'prebuilt': return Prebuilt ? <Prebuilt /> : null;
      case 'onlyonepc': return OnlyOnePc ? <OnlyOnePc /> : null;
      case 'onlyone_builder': return window.OnlyOneBuilderPage ? <window.OnlyOneBuilderPage /> : null;
      case 'peripherals': return Peripherals ? <Peripherals /> : null;
      case 'laptops': return Laptops ? <Laptops /> : null;
      case 'builder': return Builder ? <Builder /> : null;
      case 'cart': return Cart ? <Cart /> : null;
      case 'checkout': return Checkout ? <Checkout /> : null;
      case 'user': return User ? <User initialTab={pageParams.tab} /> : null;
      case 'contact': return Contact ? <Contact /> : null;
      case 'product': return pageParams.product && ProductDetail ? <ProductDetail product={pageParams.product} /> : <Home />;
      case 'prebuilt-detail': return pageParams.product && PrebuiltDetail ? <PrebuiltDetail product={pageParams.product} /> : <Prebuilt />;
      case 'onlyonepc-detail': return pageParams.product && OnlyOnePcDetail ? <OnlyOnePcDetail product={pageParams.product} /> : <OnlyOnePc />;
      case 'compare': return Compare ? <Compare /> : (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh', gap:16 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:700, color:'#3c3c3c' }}>Comparateur en construction</div>
          <div style={{ color:'#9f9f9f', fontSize:14 }}>Cette fonctionnalité sera bientôt disponible.</div>
          <button onClick={() => setPage('home')} style={{ marginTop:8, padding:'10px 24px', background:'#202020', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>Retour</button>
        </div>
      );
      default: return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh', gap:16 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:72, fontWeight:700, color:'#3c3c3c' }}>404</div>
          <div style={{ color:'#9f9f9f', fontSize:16 }}>{t('page_not_found') || 'Page introuvable'}</div>
          <button onClick={() => setPage('home')} style={{ marginTop:8, padding:'12px 28px', background:'#e8001d', color:'#fff', border:'none', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer' }}>
            {t('back_home') || 'Retour à l\'accueil'}
          </button>
        </div>
      );
    }
  };

  const Nav = window.Nav;

  return (
    <AppContext.Provider value={ctxValue}>
      <div style={{ minHeight: '100vh', background: tweaks.bgBase || '#ffffff', fontFamily: tweaks.fontHeading, color: '#000000', fontSize: '16px' }}>
        {Nav && <Nav
          page={page} setPage={setPage}
          cartCount={cartCount}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        />}
        {catalogError && (
          <div style={{ background:'#cc4444', color:'#fff', textAlign:'center', padding:'10px 16px', fontSize:13, fontFamily:"'Space Grotesk',sans-serif" }}>
            ⚠ Impossible de joindre le serveur — le catalogue est indisponible.
          </div>
        )}
        <main>{renderPage()}</main>

        {/* Footer */}
        <footer style={appStyles.footer} className="responsive-footer">
          <div style={appStyles.footerTop} className="responsive-footer-top rsp-footer-top">
            <div style={appStyles.footerBrand}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ marginRight: 10 }}>
                <rect x="1" y="1" width="20" height="20" rx="3" stroke="#e8001d" strokeWidth="1.5" />
                <rect x="5" y="5" width="5" height="5" fill="#e8001d" />
                <rect x="12" y="5" width="5" height="5" fill="#e8001d" opacity="0.5" />
                <rect x="5" y="12" width="5" height="5" fill="#e8001d" opacity="0.5" />
                <rect x="12" y="12" width="5" height="5" fill="#e8001d" />
              </svg>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--white)', letterSpacing: '0.1em' }}>INSHOP BUILDER</span>
            </div>
            <div style={appStyles.footerLinks} className="responsive-footer-links rsp-footer-links">
              {[
                { title: t('footer_col_components'), links: [
                  { label: 'CPU',                                              action: () => setPage('catalog', { category: 'cpu' }) },
                  { label: 'GPU',                                              action: () => setPage('catalog', { category: 'gpu' }) },
                  { label: lang==='fr'?'Cartes Mères':'Motherboards',         action: () => setPage('catalog', { category: 'motherboard' }) },
                  { label: lang==='fr'?'Mémoire':'Memory',                    action: () => setPage('catalog', { category: 'ram' }) },
                  { label: lang==='fr'?'Stockage':'Storage',                  action: () => setPage('catalog', { category: 'storage' }) },
                ]},
                { title: t('footer_col_products'), links: [
                  { label: t('nav_prebuilt'),    action: () => setPage('prebuilt') },
                  { label: t('nav_peripherals'), action: () => setPage('peripherals') },
                  { label: t('nav_builder'),     action: () => setPage('builder') },
                  { label: t('compare_title'),   action: () => setPage('compare') },
                ]},
                { title: t('footer_col_account'), links: [
                  { label: t('my_orders'),    action: () => setPage('user', { tab: 'orders' }) },
                  { label: t('my_favorites'), action: () => setPage('user', { tab: 'favorites' }) },
                  { label: t('profile_tab'),  action: () => setPage('user', { tab: 'profile' }) },
                  { label: t('settings_tab'), action: () => setPage('user', { tab: 'settings' }) },
                ]},
              ].map(({ title, links }) => (
                <div key={title}>
                  <div style={appStyles.footerColTitle}>{title}</div>
                  {links.map(({ label, action }) => (
                    <div key={label} style={appStyles.footerLink}
                      onClick={action}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    >{label}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={appStyles.footerBottom} className="responsive-footer-bottom rsp-footer-bottom">
            <span>{t('footer_copyright')}</span>
            <span>{t('footer_tagline')}</span>
          </div>
        </footer>

        {/* Tweaks Panel */}
        {tweakVisible && (
          <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} />
        )}
      </div>
    </AppContext.Provider>
  );
};

const TweaksPanel = ({ tweaks, setTweaks }) => {
  const update = (key, val) => {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
  };

  return (
    <div style={appStyles.tweaks}>
      <div style={appStyles.tweaksTitle}>⚙ Tweaks</div>
      <div style={appStyles.tweaksGroup}>
        <div style={appStyles.tweaksLabel}>Style Preset</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(STYLE_PRESETS).map(([name, preset]) => (
            <button key={name} style={{ ...appStyles.presetBtn, borderColor: tweaks.style === name ? preset.accent : '#3c3c3c' }}
              onClick={() => { update('style', name); update('accentColor', preset.accent); update('accentBright', preset.bright); }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: preset.accent }} />
              <span style={{ fontSize: 11, color: tweaks.style === name ? '#ffffff' : '#666666', textTransform: 'capitalize' }}>{name}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={appStyles.tweaksGroup}>
        <div style={appStyles.tweaksLabel}>Background</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['#1a1a1a', 'Dark'], ['#0e0e0e', 'IRONCLAD'], ['#111111', 'Deep Black']].map(([c, l]) => (
            <button key={c} style={{ ...appStyles.presetBtn, borderColor: tweaks.bgBase === c ? '#e8001d' : '#3c3c3c' }}
              onClick={() => update('bgBase', c)}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: c, border: '1px solid #444444' }} />
              <span style={{ fontSize: 11, color: tweaks.bgBase === c ? '#ffffff' : '#666666' }}>{l}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const appStyles = {
  footer: { background: '#4a4a4a', borderTop: '1px solid #5a5a5a', padding: '60px 80px 32px' },
  footerTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 48 },
  footerBrand: { display: 'flex', alignItems: 'center' },
  footerLinks: { display: 'flex', gap: 64 },
  footerColTitle: { color: '#ffffff', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 16 },
  footerLink: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 10, cursor: 'pointer', transition: 'all 0.15s' },
  footerBottom: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  tweaks: { position: 'fixed', bottom: 20, right: 20, background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 14, padding: '18px 20px', width: 220, zIndex: 9999, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' },
  tweaksTitle: { color: '#111111', fontWeight: 700, fontSize: 13, marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" },
  tweaksGroup: { marginBottom: 14 },
  tweaksLabel: { color: '#666666', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 8 },
  presetBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#f5f5f5', border: '1px solid', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', transition: 'border-color 0.15s' },
};

const rootEl = document.getElementById('root');
console.log('[App] Found root element:', rootEl);
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  console.log('[App] Created root, rendering...');
  root.render(<App />);
} else {
  console.error('[App] Root element #root NOT FOUND!');
}
