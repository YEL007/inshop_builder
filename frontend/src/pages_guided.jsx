import React from "react";

// pages_guided.jsx — Guided PC Configurator (step-by-step, uses live Odoo catalog)

const USE_CASES = [
  { id: 'gaming',      label: 'Gaming',       emoji: '🎮', desc: 'Jeux AAA, FPS élevé, haute résolution', color: '#e8001d',
    weights: { gpu:3.5, cpu:2.5, ram:2, storage:1.5, psu:1.2, motherboard:1, cooling:1, case:0.5 } },
  { id: 'workstation', label: 'Workstation',  emoji: '💻', desc: 'Rendu 3D, DAO, compilation, modélisation', color: '#6c5ce7',
    weights: { cpu:3.5, ram:3, storage:2.5, gpu:1.5, psu:1, motherboard:1, cooling:1.2, case:0.5 } },
  { id: 'office',      label: 'Bureau',       emoji: '🖥️', desc: 'Productivité, emails, documents, navigation', color: '#00b894',
    weights: { cpu:2.5, storage:2.5, ram:2, psu:0.8, motherboard:1, gpu:0, cooling:0.5, case:0.5 } },
  { id: 'streaming',   label: 'Streaming',    emoji: '🎬', desc: 'Stream, montage vidéo, création de contenu', color: '#e17055',
    weights: { cpu:3, gpu:2.5, ram:2.5, storage:2, psu:1, motherboard:1, cooling:1, case:0.5 } },
];

const BUDGETS = [
  { id: 'entry', label: 'Entrée de gamme', desc: 'Jusqu\'à 600 USD', maxTotal: 600,  color: '#55efc4' },
  { id: 'mid',   label: 'Milieu de gamme', desc: '600 – 1 200 USD',  maxTotal: 1200, color: '#74b9ff' },
  { id: 'high',  label: 'Haut de gamme',   desc: 'Plus de 1 200 USD', maxTotal: 3000, color: '#e8001d' },
];

const COMPONENT_ORDER = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooling', 'case'];

const GuidedPage = () => {
  const { setPage, addToCart, addToBuild, dataLoaded, t, formatPrice } = React.useContext(window.AppContext);
  const [step, setStep] = React.useState(0);
  const [useCase, setUseCase] = React.useState(null);
  const [budget, setBudget] = React.useState(null);
  const [recommendation, setRecommendation] = React.useState(null);
  const [addedAll, setAddedAll] = React.useState(false);

  const computeRecommendation = (uc, bud) => {
    const totalWeight = COMPONENT_ORDER.reduce((s, c) => s + (uc.weights[c] || 0), 0);
    const components = {};
    let totalCost = 0;

    for (const cat of COMPONENT_ORDER) {
      const weight = uc.weights[cat] || 0;
      if (weight === 0) continue;
      const catBudget = (weight / totalWeight) * bud.maxTotal * 0.92;
      const prods = window.CATALOG[cat] || [];
      if (!prods.length) continue;

      const affordable = prods.filter(p => p.price <= catBudget);
      const pool = affordable.length > 0 ? affordable : [...prods].sort((a, b) => a.price - b.price).slice(0, 3);
      const best = [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      if (best) {
        components[cat] = best;
        totalCost += best.price;
      }
    }
    return { components, totalCost };
  };

  const handleAddAll = () => {
    if (!recommendation) return;
    Object.values(recommendation.components).forEach(p => {
      addToCart(p);
      addToBuild(p);
    });
    setAddedAll(true);
  };

  const selectedUC = USE_CASES.find(u => u.id === useCase?.id);
  const selectedBud = BUDGETS.find(b => b.id === budget?.id);

  return (
    <div style={{ paddingTop: 64 }}>
      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg,#1a1a1a,#242424)', borderBottom: '1px solid #3c3c3c', padding: '40px 80px 32px' }}>
        <div style={{ color: '#e8001d', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', marginBottom: 8 }}>CONFIGURATEUR GUIDÉ</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 36, color: '#ffffff', margin: 0 }}>
          Build ta config idéale
        </h1>
        <p style={{ color: '#a8a8a8', fontSize: 15, margin: '8px 0 0' }}>
          Réponds à deux questions — on te propose une configuration optimisée depuis notre catalogue live.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 80px', borderBottom: '1px solid #3c3c3c', background: '#1a1a1a', gap: 0 }}>
        {[{ n:1, label:"Cas d'utilisation" },{ n:2, label:"Budget" },{ n:3, label:"Résultat" }].map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:'50%',
                background: step > i ? '#55efc4' : step === i ? '#e8001d' : '#2a2a2a',
                border: `2px solid ${step > i ? '#55efc4' : step === i ? '#e8001d' : '#3c3c3c'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                color: step > i ? '#1a1a1a' : step === i ? '#ffffff' : '#666666',
                fontWeight: 700, fontSize: 12, transition: 'all 0.2s' }}>
                {step > i ? '✓' : s.n}
              </div>
              <span style={{ color: step >= i ? '#ffffff' : '#666666', fontSize: 13, fontWeight: step >= i ? 600 : 400 }}>{s.label}</span>
            </div>
            {i < 2 && <div style={{ flex:1, height:2, background: step > i ? '#55efc4' : '#2a2a2a', margin: '0 16px', transition:'background 0.3s' }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ padding: '48px 80px', maxWidth: 1200 }}>

        {/* Step 0 — Use case */}
        {step === 0 && (
          <div>
            <h2 style={guidedStyles.stepTitle}>Quel est ton usage principal ?</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
              {USE_CASES.map(uc => (
                <div key={uc.id}
                  onClick={() => { setUseCase(uc); setStep(1); }}
                  style={{ background:'#242424', border:`2px solid #3c3c3c`, borderRadius:16, padding:'32px 24px', cursor:'pointer', transition:'all 0.2s', textAlign:'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = uc.color; e.currentTarget.style.background = uc.color + '18'; e.currentTarget.style.transform='translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#3c3c3c'; e.currentTarget.style.background = '#242424'; e.currentTarget.style.transform='none'; }}>
                  <div style={{ fontSize:44, marginBottom:16, lineHeight:1 }}>{uc.emoji}</div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'#ffffff', marginBottom:8 }}>{uc.label}</div>
                  <div style={{ color:'#a8a8a8', fontSize:13, lineHeight:1.5 }}>{uc.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Budget */}
        {step === 1 && (
          <div>
            <button onClick={() => setStep(0)} style={guidedStyles.backBtn}>← Retour</button>
            <h2 style={guidedStyles.stepTitle}>Quel est ton budget ?</h2>
            <p style={{ color:'#a8a8a8', fontSize:14, marginBottom:32, marginTop:-8 }}>
              Usage sélectionné : <span style={{ color: selectedUC?.color, fontWeight:600 }}>{selectedUC?.emoji} {selectedUC?.label}</span>
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, maxWidth:720 }}>
              {BUDGETS.map(bud => (
                <div key={bud.id}
                  onClick={() => {
                    setBudget(bud);
                    const rec = computeRecommendation(useCase, bud);
                    setRecommendation(rec);
                    setStep(2);
                    setAddedAll(false);
                  }}
                  style={{ background:'#242424', border:`2px solid #3c3c3c`, borderRadius:16, padding:'28px 24px', cursor:'pointer', transition:'all 0.2s', textAlign:'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = bud.color; e.currentTarget.style.background = bud.color + '18'; e.currentTarget.style.transform='translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#3c3c3c'; e.currentTarget.style.background = '#242424'; e.currentTarget.style.transform='none'; }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color: bud.color, marginBottom:8 }}>{bud.label}</div>
                  <div style={{ color:'#a8a8a8', fontSize:14 }}>{bud.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Result */}
        {step === 2 && recommendation && (
          <div>
            <button onClick={() => setStep(1)} style={guidedStyles.backBtn}>← Modifier</button>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
              <div>
                <h2 style={{ ...guidedStyles.stepTitle, margin:'0 0 8px' }}>Configuration recommandée</h2>
                <p style={{ color:'#a8a8a8', fontSize:14, margin:0 }}>
                  {selectedUC?.emoji} {selectedUC?.label} · {selectedBud?.desc}
                </p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0, marginLeft:32 }}>
                <div style={{ color:'#9f9f9f', fontSize:11, fontWeight:700, letterSpacing:'0.15em', marginBottom:4 }}>COÛT TOTAL ESTIMÉ</div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:32, color:'#e8001d' }}>
                  {formatPrice(recommendation.totalCost)}
                </div>
                {selectedBud && (
                  <div style={{ fontSize:12, color: recommendation.totalCost <= selectedBud.maxTotal ? '#55efc4' : '#e8a020', marginTop:4 }}>
                    {recommendation.totalCost <= selectedBud.maxTotal ? '✓ Dans le budget' : '⚠ Légèrement au-dessus'}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:32 }}>
              {Object.entries(recommendation.components).map(([cat, product]) => (
                <div key={cat}
                  style={{ background:'#242424', border:'1px solid #3c3c3c', borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', transition:'border-color 0.15s' }}
                  onClick={() => setPage('product', { product })}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#e8001d'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#3c3c3c'}>
                  <div style={{ width:52, height:52, borderRadius:8, background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'contain', padding:4 }} onError={e=>e.target.style.display='none'} />
                      : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3c3c3c" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="3"/></svg>
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:'#e8001d', fontSize:10, fontWeight:700, letterSpacing:'0.15em', marginBottom:2 }}>{cat.toUpperCase()}</div>
                    <div style={{ color:'#ffffff', fontWeight:600, fontSize:13, lineHeight:1.3 }} title={product.name}>
                      {product.name.length > 44 ? product.name.slice(0, 44) + '…' : product.name}
                    </div>
                    <div style={{ color:'#9f9f9f', fontSize:11, marginTop:2 }}>
                      {product.brand} · <span style={{ color:'#e8001d', fontSize:11 }}>{'★'.repeat(Math.round(product.rating||0))}</span>
                    </div>
                  </div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'#ffffff', flexShrink:0 }}>
                    {formatPrice(product.price)}
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(recommendation.components).length === 0 && (
              <div style={{ background:'#cc444420', border:'1px solid #cc4444', borderRadius:10, padding:'16px 20px', marginBottom:24, color:'#e8a8a8', fontSize:14 }}>
                Catalogue non disponible. Vérifie ta connexion au serveur Odoo.
              </div>
            )}

            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button
                onClick={handleAddAll}
                disabled={addedAll || !Object.keys(recommendation.components).length}
                style={{ background: addedAll ? '#4caf50' : '#e8001d', color:'#fff', border:'none', borderRadius:10, padding:'14px 32px', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, cursor: addedAll ? 'default' : 'pointer', transition:'background 0.2s', display:'flex', alignItems:'center', gap:8, opacity: !Object.keys(recommendation.components).length ? 0.5 : 1 }}
                onMouseEnter={e => { if (!addedAll) e.currentTarget.style.background = '#a80015'; }}
                onMouseLeave={e => { if (!addedAll) e.currentTarget.style.background = '#e8001d'; }}>
                {addedAll ? '✓ Tout ajouté au panier' : '🛒 Ajouter tout au panier'}
              </button>
              <button
                onClick={() => setPage('builder')}
                style={{ background:'transparent', color:'#e8001d', border:'1px solid #e8001d', borderRadius:10, padding:'14px 24px', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e8001d20'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                Affiner dans le Builder →
              </button>
              <button
                onClick={() => { setStep(0); setUseCase(null); setBudget(null); setRecommendation(null); setAddedAll(false); }}
                style={{ background:'transparent', color:'#9f9f9f', border:'1px solid #3c3c3c', borderRadius:10, padding:'14px 20px', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#666666'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#3c3c3c'}>
                Recommencer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const guidedStyles = {
  stepTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:24, color:'#ffffff', marginBottom:32, marginTop:0 },
  backBtn: { background:'none', border:'none', color:'#9f9f9f', cursor:'pointer', fontSize:13, marginBottom:20, display:'flex', alignItems:'center', gap:4, padding:0, fontFamily:"'Space Grotesk',sans-serif", transition:'color 0.15s' },
};

Object.assign(window, { GuidedPage });
