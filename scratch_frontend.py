import re

with open('/home/essis/Videos/INSHOP_BUILDER/frontend/src/pages_secondary.jsx', 'r') as f:
    content = f.read()

# 1. Inject SharedSidebar definition at the top, right after imports
sidebar_code = """
const SharedSidebar = ({ 
  search, setSearch, inStockOnly, setInStockOnly, 
  priceRange, setPriceRange, minRating, setMinRating, 
  brands, setBrands, availableBrands, maxPrice = 5000, priceStep = 100 
}) => {
  const { t, formatPrice } = React.useContext(window.AppContext);
  const toggleBrand = (b) => setBrands(prev => prev.includes(b) ? prev.filter(x=>x!==b) : [...prev, b]);
  
  return (
    <aside style={secStyles.sidebar} className="rsp-catalog-sidebar">
      <div style={secStyles.filterGroup}>
        <div style={secStyles.filterLabel}>RECHERCHE</div>
        <input placeholder={t("search_in_results") || "Rechercher..."} value={search} onChange={e=>setSearch(e.target.value)} style={secStyles.searchInput} />
      </div>

      <div style={secStyles.filterGroup}>
        <div style={secStyles.filterLabel}>AVAILABILITY</div>
        <label style={secStyles.checkRow}>
          <input type="checkbox" checked={inStockOnly} onChange={e=>setInStockOnly(e.target.checked)} style={{ accentColor:'#e8001d' }}/>
          <span style={{ color:'#b8b8b8', fontSize:13 }}>In Stock Only</span>
        </label>
      </div>

      <div style={secStyles.filterGroup}>
        <div style={secStyles.filterLabel}>PRICE RANGE</div>
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <div style={secStyles.priceInput}>{formatPrice(priceRange[0])}</div>
          <span style={{ color:'#9f9f9f', alignSelf:'center' }}>—</span>
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
        <div style={secStyles.filterLabel}>NOTE MINIMUM</div>
        {[4, 3, 2].map(r => (
          <label key={r} style={secStyles.checkRow}>
            <input type="radio" name="rating" checked={minRating === r}
              onChange={() => setMinRating(minRating === r ? 0 : r)}
              style={{ accentColor:'#e8001d' }}/>
            <span style={{ color:'#e8001d', fontSize:12 }}>{'★'.repeat(r)}{'☆'.repeat(5-r)}</span>
            <span style={{ color:'#a8a8a8', fontSize:11 }}>&amp; +</span>
          </label>
        ))}
        {minRating > 0 && (
          <button style={{ ...secStyles.filterBtn, color:'#9f9f9f', fontSize:11, padding:0, marginTop:8 }}
            onClick={() => setMinRating(0)}>✕ Effacer</button>
        )}
      </div>

      {availableBrands.length > 0 && (
        <div style={secStyles.filterGroup}>
          <div style={secStyles.filterLabel}>BRAND</div>
          {availableBrands.map(b => (
            <label key={b} style={secStyles.checkRow}>
              <input type="checkbox" checked={brands.includes(b)} onChange={()=>toggleBrand(b)} style={{ accentColor:'#e8001d' }}/>
              <span style={{ color:'#b8b8b8', fontSize:13 }}>{b}</span>
            </label>
          ))}
        </div>
      )}
    </aside>
  );
};
"""
content = content.replace('// ─── PRE-BUILT PCs ───────────────────────────────────────────────────────────', sidebar_code + '\n// ─── PRE-BUILT PCs ───────────────────────────────────────────────────────────')

# 2. Modify PrebuiltPage
pb_states = """  const tierColors = { Budget: '#888888', 'Mid-Range': '#909090', 'High-End': '#333333', Flagship: '#ffffff' };
  const [search, setSearch] = React.useState('');
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState([0, 5000]);
  const [minRating, setMinRating] = React.useState(0);
  const [brands, setBrands] = React.useState([]);

  const filtered = React.useMemo(() => {
    let prods = window.PREBUILTS || [];
    if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (inStockOnly) prods = prods.filter(p => p.stock !== 'out_of_stock');
    if (brands.length) prods = prods.filter(p => brands.includes(p.brand));
    prods = prods.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) prods = prods.filter(p => (p.rating || 0) >= minRating);
    return prods;
  }, [search, inStockOnly, priceRange, minRating, brands]);

  const availableBrands = React.useMemo(() => [...new Set((window.PREBUILTS||[]).map(p => p.brand).filter(Boolean))].sort(), []);
"""
content = content.replace("  const tierColors = { Budget: '#888888', 'Mid-Range': '#909090', 'High-End': '#333333', Flagship: '#ffffff' };", pb_states, 1)

pb_grid_start = """      <div style={secStyles.layout} className="rsp-catalog">
        <SharedSidebar search={search} setSearch={setSearch} inStockOnly={inStockOnly} setInStockOnly={setInStockOnly} priceRange={priceRange} setPriceRange={setPriceRange} minRating={minRating} setMinRating={setMinRating} brands={brands} setBrands={setBrands} availableBrands={availableBrands} maxPrice={5000} priceStep={100} />
        <main style={secStyles.main}>
          <div style={secStyles.pbGrid} className="rsp-pb-grid">
            {filtered.length === 0 ? (
              <div style={secStyles.empty}>
                <div style={{ fontSize:40, marginBottom:12, opacity:0.3 }}>🔍</div>
                <div style={{ color:'#a8a8a8' }}>{t('no_products') || 'Aucun produit'}</div>
              </div>
            ) : filtered.map(pc => {"""
content = content.replace("""      <div style={secStyles.pbGrid} className="rsp-pb-grid">
        {window.PREBUILTS.map(pc => {""", pb_grid_start)

content = content.replace("""        })}
      </div>
    </div>
  );
};

// ─── PRE-BUILT DETAIL PAGE""", """            })}
          </div>
        </main>
      </div>
    </div>
  );
};

// ─── PRE-BUILT DETAIL PAGE""")

# 3. Modify OnlyOnePcPage
opc_states = """  const tierColors = { Budget: '#888888', 'Mid-Range': '#909090', 'High-End': '#333333', Flagship: '#ffffff' };
  const [search, setSearch] = React.useState('');
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState([0, 15000]);
  const [minRating, setMinRating] = React.useState(0);
  const [brands, setBrands] = React.useState([]);

  const filtered = React.useMemo(() => {
    let prods = window.ONLYONEPCS || [];
    if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (inStockOnly) prods = prods.filter(p => p.stock !== 'out_of_stock');
    if (brands.length) prods = prods.filter(p => brands.includes(p.brand));
    prods = prods.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) prods = prods.filter(p => (p.rating || 0) >= minRating);
    return prods;
  }, [search, inStockOnly, priceRange, minRating, brands]);

  const availableBrands = React.useMemo(() => [...new Set((window.ONLYONEPCS||[]).map(p => p.brand).filter(Boolean))].sort(), []);
"""
content = content.replace("  const tierColors = { Budget: '#888888', 'Mid-Range': '#909090', 'High-End': '#333333', Flagship: '#ffffff' };", opc_states, 1)

opc_grid_start = """      <div style={secStyles.layout} className="rsp-catalog">
        <SharedSidebar search={search} setSearch={setSearch} inStockOnly={inStockOnly} setInStockOnly={setInStockOnly} priceRange={priceRange} setPriceRange={setPriceRange} minRating={minRating} setMinRating={setMinRating} brands={brands} setBrands={setBrands} availableBrands={availableBrands} maxPrice={15000} priceStep={500} />
        <main style={secStyles.main}>
          <div style={secStyles.pbGrid} className="rsp-pb-grid">
            {filtered.length === 0 ? (
              <div style={secStyles.empty}>
                <div style={{ fontSize:40, marginBottom:12, opacity:0.3 }}>🔍</div>
                <div style={{ color:'#a8a8a8' }}>{t('no_products') || 'Aucun produit'}</div>
              </div>
            ) : filtered.map(pc => {"""
content = content.replace("""      <div style={secStyles.pbGrid} className="rsp-pb-grid">
        {window.ONLYONEPCS.map(pc => {""", opc_grid_start)

content = content.replace("""        })}
      </div>
    </div>
  );
};

// ─── ONLY ONE PC DETAIL PAGE""", """            })}
          </div>
        </main>
      </div>
    </div>
  );
};

// ─── ONLY ONE PC DETAIL PAGE""")

# 4. Modify PeripheralsPage
peri_states = """  const [activeTab, setActiveTab] = React.useState('mouse');
  const [search, setSearch] = React.useState('');
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [priceRange, setPriceRange] = setPriceRange = React.useState([0, 2000]);
  const [minRating, setMinRating] = React.useState(0);
  const [brands, setBrands] = React.useState([]);

  const currentGroup = PERI_GROUPS.find(g => g.id === activeGroup);
  
  const filtered = React.useMemo(() => {
    let prods = window.PERIPHERALS_DATA[activeTab] || [];
    if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (inStockOnly) prods = prods.filter(p => p.stock !== 'out_of_stock');
    if (brands.length) prods = prods.filter(p => brands.includes(p.brand));
    prods = prods.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) prods = prods.filter(p => (p.rating || 0) >= minRating);
    return prods;
  }, [activeTab, search, inStockOnly, priceRange, minRating, brands]);

  const availableBrands = React.useMemo(() => [...new Set((window.PERIPHERALS_DATA[activeTab]||[]).map(p => p.brand).filter(Boolean))].sort(), [activeTab]);
"""
content = content.replace("""  const [activeTab, setActiveTab] = React.useState('mouse');

  const currentGroup = PERI_GROUPS.find(g => g.id === activeGroup);
  const products = window.PERIPHERALS_DATA[activeTab] || [];""", peri_states)

content = content.replace("setPriceRange = React.useState([0, 2000]);", "React.useState([0, 2000]);")

peri_grid_start = """      <div style={secStyles.layout} className="rsp-catalog">
        <SharedSidebar search={search} setSearch={setSearch} inStockOnly={inStockOnly} setInStockOnly={setInStockOnly} priceRange={priceRange} setPriceRange={setPriceRange} minRating={minRating} setMinRating={setMinRating} brands={brands} setBrands={setBrands} availableBrands={availableBrands} maxPrice={2000} priceStep={50} />
        <main style={{ flex: 1, padding: '28px 48px' }}>
          <div style={periStyles.subTabs}>
            {currentGroup.tabs.map(t => (
              <button key={t.key}
                style={{ ...periStyles.subTab, ...(activeTab === t.key ? periStyles.subTabActive : {}) }}
                onClick={() => { setActiveTab(t.key); setBrands([]); }}>
                {t.label}
                <span style={{ ...periStyles.subTabCount, color: activeTab === t.key ? '#1a1a1a' : '#9f9f9f' }}>
                  {(window.PERIPHERALS_DATA[t.key] || []).length}
                </span>
              </button>
            ))}
          </div>
          <div style={periStyles.grid} className="rsp-grid-3">
            {filtered.length === 0 ? (
              <div style={secStyles.empty}>
                <div style={{ fontSize:40, marginBottom:12, opacity:0.3 }}>🔍</div>
                <div style={{ color:'#a8a8a8' }}>{t('no_products') || 'Aucun produit'}</div>
              </div>
            ) : filtered.map(p => ("""
content = content.replace("""      <div style={{ padding: '0 48px' }}>
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
        <div style={periStyles.grid} className="rsp-grid-3">
          {products.map(p => (""", peri_grid_start)

content = content.replace("""          ))}
        </div>
      </div>
    </div>
  );
};

const PeriProductCard""", """          ))}
          </div>
        </main>
      </div>
    </div>
  );
};

const PeriProductCard""")

# 5. Add sidebar CSS to secStyles
sidebar_styles = """  layout: { display:'flex', gap:0 },
  sidebar: { width:240, flexShrink:0, padding:'28px 24px', borderRight:'1px solid #3c3c3c', minHeight:'100vh', background:'#1a1a1a' },
  filterGroup: { marginBottom:28 },
  filterLabel: { color:'#9f9f9f', fontSize:10, fontWeight:700, letterSpacing:'0.15em', marginBottom:10 },
  filterBtn: { display:'block', width:'100%', textAlign:'left', background:'none', border:'none', padding:'6px 10px', borderRadius:6, color:'#a8a8a8', fontSize:13, cursor:'pointer', transition:'all 0.15s', fontFamily:"'Space Grotesk',sans-serif" },
  checkRow: { display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer' },
  priceInput: { background:'#242424', border:'1px solid #3c3c3c', borderRadius:6, padding:'4px 8px', color:'#c8c8c8', fontSize:12, minWidth:60, textAlign:'center' },
  searchInput: { background:'#242424', border:'1px solid #3c3c3c', outline:'none', color:'#ffffff', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, width:'100%', padding: '8px 12px', borderRadius: 8 },
  main: { flex:1, padding:'28px 32px' },
  empty: { textAlign:'center', padding:'80px 20px', gridColumn:'1 / -1' },
"""
content = content.replace("  pageDesc: { color: '#a8a8a8', fontSize: 15, margin: 0 },", "  pageDesc: { color: '#a8a8a8', fontSize: 15, margin: 0 },\n" + sidebar_styles)

with open('/home/essis/Videos/INSHOP_BUILDER/frontend/src/pages_secondary.jsx', 'w') as f:
    f.write(content)

