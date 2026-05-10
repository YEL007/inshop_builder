import React from "react";

// Nav.jsx — InShop Builder Navigation

const Nav = ({ page, setPage, cartCount, searchQuery, setSearchQuery }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState([]);
  const { favorites, lang, setLang, t, currentUser } = React.useContext(window.AppContext);

  const navLinks = [
    { id: 'catalog', label: t('nav_components') },
    { id: 'prebuilt', label: t('nav_prebuilt') },
    { id: 'onlyonepc', label: t('nav_onlyonepc') },
    { id: 'laptops', label: t('nav_laptops') },
    { id: 'peripherals', label: t('nav_peripherals') },
    { id: 'builder', label: t('nav_builder'), highlight: true },
    { id: 'guided', label: lang === 'fr' ? 'Configurateur' : 'Configurator' },
  ];

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const results = window.ALL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.brand.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 6);
    setSearchResults(results);
  };

  const goToProduct = (p) => {
    setPage('product', { product: p });
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const catColors = {
    cpu:'#e8793a', gpu:'#6c5ce7', motherboard:'#00b894', ram:'#fdcb6e',
    storage:'#74b9ff', psu:'#fd79a8', cooling:'#55efc4', case:'#b2bec3',
    monitor:'#a29bfe', mouse:'#fd79a8', headset:'#ffeaa7', keyboard:'#81ecec',
  };

  return (
    <nav style={navStyles.nav} className="responsive-nav">
      {/* Logo */}
      <div style={navStyles.logo} onClick={() => setPage('home')} role="button">
        <div style={navStyles.logoMark}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="1" width="20" height="20" rx="3" stroke="var(--red)" strokeWidth="1.5"/>
            <rect x="5" y="5" width="5" height="5" fill="var(--red)"/>
            <rect x="12" y="5" width="5" height="5" fill="var(--red)" opacity="0.5"/>
            <rect x="5" y="12" width="5" height="5" fill="var(--red)" opacity="0.5"/>
            <rect x="12" y="12" width="5" height="5" fill="var(--red)"/>
          </svg>
        </div>
        <div>
          <div style={navStyles.logoText}>INSHOP</div>
          <div style={navStyles.logoSub}>BUILDER</div>
        </div>
      </div>

      {/* Desktop links */}
      <div style={navStyles.links} className="nav-links rsp-nav-links">
        {navLinks.map(link => {
          const isActive =
            link.id === 'onlyonepc'
              ? page === 'onlyonepc' || page === 'onlyonepc-detail' || page === 'onlyone_builder'
              : link.id === 'prebuilt'
                ? page === 'prebuilt' || page === 'prebuilt-detail'
                : page === link.id;
          return (
            <button
              key={link.id}
              style={{
                ...navStyles.link,
                ...(link.highlight ? navStyles.linkHighlight : {}),
                ...(isActive ? navStyles.linkActive : {}),
              }}
              onClick={() => setPage(link.id)}
            >
              {link.label}
              {link.highlight && <span style={navStyles.newBadge}>{t('nav_new_badge')}</span>}
            </button>
          );
        })}
      </div>

      {/* Mobile hamburger */}
      <button
        className="rsp-nav-mobile-btn"
        style={navStyles.iconBtn}
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileOpen
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
          }
        </svg>
      </button>
      {mobileOpen && (
        <div style={{ position:'fixed', top:64, left:0, right:0, background:'rgba(14,14,14,0.98)', borderBottom:'1px solid var(--border2)', padding:'16px 20px', zIndex:999 }}>
          {navLinks.map(link => {
            const isActive =
              link.id === 'onlyonepc'
                ? page === 'onlyonepc' || page === 'onlyonepc-detail' || page === 'onlyone_builder'
                : link.id === 'prebuilt'
                  ? page === 'prebuilt' || page === 'prebuilt-detail'
                  : page === link.id;
            return (
              <button key={link.id}
                style={{ ...navStyles.link, display:'block', width:'100%', textAlign:'left', padding:'12px 16px', marginBottom:4, fontSize:15,
                  ...(isActive ? navStyles.linkActive : {}),
                  ...(link.highlight ? navStyles.linkHighlight : {}),
                }}
                onClick={() => { setPage(link.id); setMobileOpen(false); }}>
                {link.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Right actions */}
      <div style={navStyles.actions} className="rsp-nav-actions">
        {/* Search */}
        <div style={{ position:'relative' }}>
          <button style={navStyles.iconBtn} onClick={() => setSearchOpen(v => !v)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          {searchOpen && (
            <div style={navStyles.searchDropdown}>
              <input
                autoFocus
                placeholder={t('nav_search')}
                style={navStyles.searchInput}
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div>
                  {searchResults.map(p => (
                    <div key={p.id} style={navStyles.searchResult} onClick={() => goToProduct(p)}
                      onMouseEnter={e => e.currentTarget.style.background='var(--metal2)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <div style={{ ...navStyles.searchDot, background: catColors[p.category] || 'var(--red)' }}/>
                      <div>
                        <div style={{ color:'var(--white)', fontSize:13 }}>{p.name}</div>
                        <div style={{ color:'var(--gray)', fontSize:11 }}>{p.category.toUpperCase()} · ${p.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart */}
        <button style={{ ...navStyles.iconBtn, position:'relative' }} onClick={() => setPage('cart')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {cartCount > 0 && <span style={{ ...navStyles.badge, background:'var(--red)', color:'var(--dark)' }}>{cartCount}</span>}
        </button>

        {/* Language / Currency toggle */}
        <button
          className="lang-flags"
          style={{ ...navStyles.iconBtn, ...navStyles.langBtn, ...(lang === 'fr' ? navStyles.langActive : {}) }}
          onClick={() => setLang('fr')}
          title="Français — Prix CFA">
          🇫🇷
        </button>
        <button
          className="lang-flags"
          style={{ ...navStyles.iconBtn, ...navStyles.langBtn, ...(lang === 'en' ? navStyles.langActive : {}) }}
          onClick={() => setLang('en')}
          title="English — USD prices">
          🇺🇸
        </button>

        {/* User / Connexion */}
        {currentUser ? (
          <button style={{ ...navStyles.iconBtn, ...navStyles.userBtn }} onClick={() => setPage('user')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        ) : (
          <button
            style={{ background:'none', border:'1px solid #3c3c3c', borderRadius:8, cursor:'pointer',
              color:'#ffffff', fontFamily:"'Space Grotesk',sans-serif", fontSize:12,
              fontWeight:700, letterSpacing:'0.1em', padding:'7px 18px',
              transition:'all 0.15s' }}
            onClick={() => setPage('user')}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='#e8001d'; e.currentTarget.style.color='#e8001d'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='#3c3c3c'; e.currentTarget.style.color='#ffffff'; }}
          >
            {t('sign_in').toUpperCase()}
          </button>
        )}
      </div>
    </nav>
  );
};

const navStyles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', gap: 0,
    padding: '0 32px', height: 64,
    background: 'rgba(14,14,14,0.96)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border2)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    cursor: 'pointer', marginRight: 40, flexShrink: 0,
  },
  logoMark: { display:'flex', alignItems:'center' },
  logoText: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--white)', letterSpacing:'0.12em', lineHeight:1.1 },
  logoSub: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:300, fontSize:9, color:'var(--red)', letterSpacing:'0.25em', lineHeight:1.1 },
  links: { display:'flex', alignItems:'center', gap:4, flex:1 },
  link: {
    background:'none', border:'none', cursor:'pointer',
    padding:'6px 14px', borderRadius:6,
    fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:500,
    color:'var(--offwhite)', transition:'all 0.15s', position:'relative',
  },
  linkActive: { color:'var(--white)', background:'var(--metal2)' },
  linkHighlight: { color:'var(--red)' },
  newBadge: {
    position:'absolute', top:-6, right:2,
    background:'var(--red)', color:'var(--dark)',
    fontSize:8, fontWeight:700, padding:'1px 4px', borderRadius:3, letterSpacing:'0.05em',
  },
  actions: { display:'flex', alignItems:'center', gap:4, marginLeft:'auto' },
  iconBtn: {
    background:'none', border:'none', cursor:'pointer',
    width:38, height:38, borderRadius:8,
    display:'flex', alignItems:'center', justifyContent:'center',
    color:'var(--offwhite)', position:'relative', transition:'all 0.15s',
  },
  userBtn: { background:'var(--metal2)', border:'1px solid var(--metal)', color:'var(--offwhite)' },
  langBtn: { fontSize:18, background:'none', border:'1px solid transparent', opacity:0.5, transition:'all 0.15s' },
  langActive: { opacity:1, border:'1px solid var(--metal)', background:'var(--metal2)' },
  badge: {
    position:'absolute', top:4, right:4,
    width:16, height:16, borderRadius:'50%',
    background:'var(--red)', color:'var(--dark)',
    fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center',
  },
  searchDropdown: {
    position:'absolute', top:'calc(100% + 8px)', right:0,
    width:340, background:'var(--panel)', border:'1px solid var(--metal)',
    borderRadius:10, overflow:'hidden', boxShadow:'0 20px 40px rgba(0,0,0,0.12)',
  },
  searchInput: {
    width:'100%', padding:'12px 16px', background:'transparent',
    border:'none', borderBottom:'1px solid var(--metal)',
    color:'var(--white)', fontFamily:"'Space Grotesk',sans-serif", fontSize:14,
    outline:'none', boxSizing:'border-box',
  },
  searchResult: {
    display:'flex', alignItems:'center', gap:12,
    padding:'10px 16px', cursor:'pointer', transition:'background 0.1s',
  },
  searchDot: { width:8, height:8, borderRadius:'50%', flexShrink:0 },
};

Object.assign(window, { Nav });
