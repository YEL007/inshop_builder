import React from "react";

const getWizardSteps = (cats) => {
  return (cats || [])
    .filter(c => c.type === 'component')
    .map((c, i) => ({
      key: c.code,
      num: i + 1,
      catalog: c.code,
      label: c.name,
      icon: c.icon
    }));
};

// ── Panneau compatibilité global ─────────────────────────────────────────────
const CompatPanel = ({ build, steps }) => {
  const { issues, warnings } = window.checkCompatibility(build);
  const completedCount = steps.filter(s => build[s.key]).length;
  if (completedCount < 2) return null;

  const allOk = issues.length === 0 && warnings.length === 0;

  return (
    <div style={{
      margin: '0 12px 12px',
      borderRadius: 10,
      border: `1px solid ${issues.length > 0 ? '#cc444440' : warnings.length > 0 ? '#f59e0b40' : '#22c55e40'}`,
      background: issues.length > 0 ? '#cc444410' : warnings.length > 0 ? '#f59e0b10' : '#22c55e10',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: `1px solid ${issues.length > 0 ? '#cc444430' : warnings.length > 0 ? '#f59e0b30' : '#22c55e30'}`,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        color: issues.length > 0 ? '#cc4444' : warnings.length > 0 ? '#f59e0b' : '#22c55e',
      }}>
        {issues.length > 0 ? '✗' : warnings.length > 0 ? '⚠' : '✓'}
        {issues.length > 0 ? `${issues.length} INCOMPATIBILITÉ${issues.length > 1 ? 'S' : ''}` :
         warnings.length > 0 ? `${warnings.length} AVERTISSEMENT${warnings.length > 1 ? 'S' : ''}` :
         'COMPATIBILITÉ OK'}
      </div>

      {/* Issues */}
      {issues.map((issue, i) => (
        <div key={i} style={{ padding: '7px 12px', borderBottom: i < issues.length - 1 ? '1px solid #cc444420' : 'none', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <span style={{ color: '#cc4444', fontSize: 12, flexShrink: 0, marginTop: 1 }}>✗</span>
          <span style={{ color: '#e08080', fontSize: 11, lineHeight: 1.4 }}>{issue.msg}</span>
        </div>
      ))}

      {/* Warnings */}
      {warnings.map((warn, i) => (
        <div key={i} style={{ padding: '7px 12px', borderBottom: i < warnings.length - 1 ? '1px solid #f59e0b20' : 'none', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <span style={{ color: '#f59e0b', fontSize: 12, flexShrink: 0, marginTop: 1 }}>⚠</span>
          <span style={{ color: '#d4aa60', fontSize: 11, lineHeight: 1.4 }}>{warn.msg}</span>
        </div>
      ))}

      {allOk && (
        <div style={{ padding: '7px 12px', color: '#6ee7b7', fontSize: 11 }}>
          Tous les composants sont compatibles entre eux.
        </div>
      )}
    </div>
  );
};

// ── Card produit ──────────────────────────────────────────────────────────────
const ProductWizardCard = ({ product, isSelected, compat, onSelect }) => {
  const { t, formatPrice, toggleFav, favorites } = React.useContext(window.AppContext);
  const [hov, setHov] = React.useState(false);
  const color = (window.CARD_COLORS || {})[product.category] || '#e8001d';
  const label = (window.CARD_LABELS || {})[product.category] || product.category;
  const specEntries = Object.entries(product.specs || {}).slice(0, 4);

  const borderColor = isSelected ? color
    : !compat.ok ? '#cc444450'
    : compat.warning ? '#f59e0b50'
    : hov ? color + '80' : '#3c3c3c';

  const bgColor = isSelected ? color + '12'
    : !compat.ok ? '#cc44440a'
    : compat.warning ? '#f59e0b0a'
    : '#242424';

  return (
    <div
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'all 0.2s', position: 'relative',
        opacity: !compat.ok ? 0.5 : 1,
        cursor: compat.ok ? 'pointer' : 'not-allowed',
      }}
      onClick={compat.ok ? onSelect : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
      )}

      {/* Compat badge */}
      {!isSelected && (!compat.ok || compat.warning) && (
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 3,
          padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700,
          background: !compat.ok ? '#cc444425' : '#f59e0b25',
          color: !compat.ok ? '#cc4444' : '#f59e0b',
          border: `1px solid ${!compat.ok ? '#cc444440' : '#f59e0b40'}`,
        }}>
          {!compat.ok ? '✗ INCOMPAT.' : '⚠ ATTENTION'}
        </div>
      )}


      {/* Image */}
      <div style={{ height: 140, background: `linear-gradient(135deg, ${color}14, #1e1e1e)`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          : <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" opacity="0.4"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        }
      </div>

      {/* Info */}
      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ color, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 3 }}>{label?.toUpperCase()}</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1.3 }}>{product.name}</div>
        </div>

        {specEntries.length > 0 && (
          <div style={{ background: '#1e1e1e', borderRadius: 6, padding: '7px 9px' }}>
            {specEntries.map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', gap: 6, alignItems: 'baseline', ...(i < specEntries.length - 1 ? { marginBottom: 3, borderBottom: '1px solid #2a2a2a', paddingBottom: 3 } : {}) }}>
                <span style={{ color: '#666', fontSize: 10, minWidth: 50 }}>{k}</span>
                <span style={{ color: '#888', fontSize: 11, fontFamily: "'DM Mono',monospace" }}>{Array.isArray(v) ? v.join(', ') : String(v)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: '#e8001d' }}>{formatPrice(product.price)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#e8001d', fontSize: 10 }}>{'★'.repeat(Math.round(product.rating || 0))}</span>
            <span style={{ color: '#666', fontSize: 10 }}>{product.rating}</span>
          </div>
        </div>

        {/* Compat message */}
        {(!compat.ok || compat.warning) && compat.msg && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, padding: '6px 8px', borderRadius: 6, marginTop: 2, background: !compat.ok ? '#cc444415' : '#f59e0b12', border: `1px solid ${!compat.ok ? '#cc444430' : '#f59e0b30'}` }}>
            <span style={{ color: !compat.ok ? '#cc4444' : '#f59e0b', fontSize: 11, flexShrink: 0, marginTop: 1 }}>{!compat.ok ? '✗' : '⚠'}</span>
            <span style={{ color: !compat.ok ? '#e08080' : '#d4aa60', fontSize: 10, lineHeight: 1.4 }}>{compat.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
const BuilderPage = () => {
  const { build, setBuild, addToCart, dataLoaded, t, formatPrice } = React.useContext(window.AppContext);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [sortBy, setSortBy] = React.useState('featured');
  const [filterIncompat, setFilterIncompat] = React.useState(false);
  const [addedAll, setAddedAll] = React.useState(false);

  const steps = React.useMemo(() => getWizardSteps(window.PC_CATEGORIES_DATA), [dataLoaded]);
  const step = steps[currentStep];

  const products = React.useMemo(() => {
    if (!step) return [];
    let p = (window.CATALOG[step.catalog] || []).filter(prod => prod.stock !== 'out_of_stock' || true);
    if (sortBy === 'price_asc')  p = [...p].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') p = [...p].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     p = [...p].sort((a, b) => b.rating - a.rating);
    if (filterIncompat) {
      p = p.filter(prod => {
        const c = window.getCompatNote ? window.getCompatNote(step.key, prod, build) : { ok: true };
        return c.ok;
      });
    }
    return p;
  }, [step, sortBy, filterIncompat, dataLoaded, build]);

  const completedCount = steps.filter(s => build[s.key]).length;
  const total = window.calcBuildTotal(build);
  const { issues, warnings } = window.checkCompatibility(build);
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrev = currentStep > 0;

  const handleSelect = (product) => {
    if (!step) return;
    if (build[step.key]?.id === product.id) {
      setBuild(prev => ({ ...prev, [step.key]: null }));
      return;
    }
    const compat = window.getCompatNote ? window.getCompatNote(step.key, product, build) : { ok: true };
    if (!compat.ok) return;
    setBuild(prev => ({ ...prev, [step.key]: product }));
  };

  const handleAddAll = () => {
    Object.values(build).forEach(p => { if (p) addToCart(p); });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  if (steps.length === 0 && dataLoaded) {
    return (
      <div style={{ paddingTop: 100, textAlign: 'center', color: '#9f9f9f' }}>
        <h2>Aucune catégorie de composant trouvée.</h2>
        <p>Veuillez en créer dans le backend Odoo.</p>
      </div>
    );
  }
  
  if (!step && steps.length > 0) return null;

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
      {/* Banner */}
      <div style={{ position: 'relative', height: 260, overflow: 'hidden', borderBottom: '1px solid #333', background:'#111' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, opacity: 1, zIndex: 1, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px)' }} />
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 600, height: 600, zIndex: 1, background: 'radial-gradient(ellipse at 40% 50%, rgba(232,0,29,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '48px 80px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ color: '#e8001d', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', marginBottom: 12 }}>CONFIGURATION PERSONNALISÉE</div>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 40, color: '#fff', margin: 0, lineHeight: 1.1 }}>{t('builder_title')}</h1>
              <p style={{ color: '#a8a8a8', fontSize: 16, marginTop: 12, maxWidth: 600, lineHeight: 1.6 }}>{t('builder_subtitle')}</p>
            </div>
          </div>
          {/* Compat summary bar */}
          {completedCount >= 2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
              {issues.length > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, background: '#cc444420', border: '1px solid #cc444440', color: '#cc4444', fontSize: 11, fontWeight: 700 }}>
                  ✗ {issues.length} incompatibilité{issues.length > 1 ? 's' : ''}
                </span>
              )}
              {warnings.length > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, background: '#f59e0b20', border: '1px solid #f59e0b40', color: '#f59e0b', fontSize: 11, fontWeight: 700 }}>
                  ⚠ {warnings.length} avertissement{warnings.length > 1 ? 's' : ''}
                </span>
              )}
              {issues.length === 0 && warnings.length === 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, background: '#22c55e20', border: '1px solid #22c55e40', color: '#22c55e', fontSize: 11, fontWeight: 700 }}>
                  ✓ Tous compatibles
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', flex: 1, minHeight: 0 }} className="wizard-body">
        {/* Sidebar */}
        <aside style={{ borderRight: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflowY: 'auto' }}>
          <div style={{ padding: '12px 12px 4px' }}>
            {steps.map((s, i) => {
              const isActive = i === currentStep;
              const isDone = !!build[s.key];
              const stepBuild = { ...build, [s.key]: build[s.key] };
              const stepCompat = window.checkCompatibility(stepBuild);
              const hasIssue = stepCompat.issues.some(iss => iss.pair && iss.pair.includes(s.key));
              const hasWarn  = stepCompat.warnings.some(w => w.pair && w.pair.includes(s.key));

              return (
                <button
                  key={s.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '9px 10px', borderRadius: 8, border: 'none',
                    background: isActive ? '#e8001d' : isDone ? '#252525' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s', marginBottom: 2, textAlign: 'left',
                  }}
                  onClick={() => setCurrentStep(i)}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? '#fff' : isDone ? (hasIssue ? '#cc4444' : hasWarn ? '#f59e0b' : '#444') : '#333',
                    color: isActive ? '#e8001d' : isDone ? (hasIssue ? '#fff' : hasWarn ? '#fff' : '#aaa') : '#666',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                  }}>
                    {isDone && !isActive
                      ? (hasIssue ? '✗' : hasWarn ? '⚠' : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>)
                      : s.num
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#fff' : isDone ? '#ccc' : '#666', fontFamily: "'Space Grotesk',sans-serif" }}>
                      {t('step_label_' + s.key)}
                    </div>
                    {isDone && build[s.key] && (
                      <div style={{ fontSize: 10, color: isActive ? '#ffaaaa' : '#666', marginTop: 1 }}>
                        {build[s.key].name.slice(0, 22)}{build[s.key].name.length > 22 ? '…' : ''}
                      </div>
                    )}
                  </div>
                  {isDone && !isActive && (
                    <span style={{ color: '#9f9f9f', fontSize: 10, fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>{formatPrice(build[s.key].price)}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Compat panel */}
          <CompatPanel build={build} steps={steps} />

          {/* Summary */}
          <div style={{ padding: '14px', borderTop: '1px solid #2a2a2a', background: '#1a1a1a', marginTop: 'auto' }}>
            <div style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>{t('complete_steps', completedCount, steps.length)}</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, color: '#fff', marginBottom: 10 }}>{formatPrice(total)}</div>
            <button
              style={{
                width: '100%', padding: '10px', border: 'none', borderRadius: 8, cursor: completedCount === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                background: addedAll ? '#22c55e' : completedCount === 0 ? '#333' : '#e8001d',
                color: completedCount === 0 ? '#666' : '#fff',
              }}
              disabled={completedCount === 0}
              onClick={handleAddAll}
            >
              {addedAll ? '✓ Ajouté !' : t('add_all_to_cart')}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {/* Step header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: '#fff', margin: '0 0 4px' }}>
                {t('step_label_' + step.key)}
              </h2>
              <p style={{ color: '#9f9f9f', fontSize: 12 }}>
                {build[step.key]
                  ? <><span style={{ color: '#22c55e' }}>✓ Sélectionné : </span>{build[step.key].name}</>
                  : `Choisissez un composant — ${t('step_label_' + step.key)}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: '#888' }}>
                <input type="checkbox" checked={filterIncompat} onChange={e => setFilterIncompat(e.target.checked)}
                  style={{ accentColor: '#e8001d', cursor: 'pointer' }} />
                Masquer incompatibles
              </label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ background: '#222', border: '1px solid #3c3c3c', borderRadius: 7, padding: '7px 12px', color: '#888', fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                <option value="featured">{t('sort_featured')}</option>
                <option value="price_asc">{t('sort_price_asc')}</option>
                <option value="price_desc">{t('sort_price_desc')}</option>
                <option value="rating">{t('sort_rating')}</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="wizard-grid">
            {products.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: '#555' }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14 }}>Aucun produit disponible pour cette catégorie.</div>
              </div>
            ) : products.map(product => {
              const compat = window.getCompatNote ? window.getCompatNote(step.key, product, build) : { ok: true, warning: false };
              return (
                <ProductWizardCard
                  key={product.id}
                  product={product}
                  isSelected={build[step.key]?.id === product.id}
                  compat={compat}
                  onSelect={() => handleSelect(product)}
                />
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <button
              style={{ background: '#222', border: '1px solid #3c3c3c', color: canGoPrev ? '#ccc' : '#444', padding: '10px 24px', borderRadius: 8, cursor: canGoPrev ? 'pointer' : 'not-allowed', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14 }}
              disabled={!canGoPrev} onClick={() => setCurrentStep(i => i - 1)}
            >
              {t('prev')}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {steps.map((_, i) => (
                <div key={i}
                  style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i === currentStep ? '#e8001d' : build[steps[i].key] ? '#555' : '#333',
                  }}
                  onClick={() => setCurrentStep(i)} />
              ))}
            </div>

            <button
              style={{ background: canGoNext ? '#e8001d' : '#555', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 8, cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14 }}
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

Object.assign(window, { BuilderPage });
