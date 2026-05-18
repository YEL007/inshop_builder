// Dashboard screen
const { useState, useEffect, useMemo } = React;
const { Icon, Pill, rel } = window;
const Sparkline = ({ data, width = 80, height = 28 }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`);
  const line = `M ${points.join(' L ')}`;
  const area = `${line} L ${width},${height} L 0,${height} Z`;
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path className="area" d={area} />
      <path className="line" d={line} />
      <circle cx={points[points.length-1].split(',')[0]} cy={points[points.length-1].split(',')[1]} r="2" />
    </svg>
  );
};

const Bars = ({ data, todayIdx }) => {
  const max = Math.max(...data) || 1;
  return (
    <>
      <div className="bars">
        {data.map((v, i) => (
          <div key={i} className={`bar ${i === todayIdx ? 'today' : ''}`} style={{height: `${(v/max)*100}%`}} title={`${Number(v).toLocaleString('fr-FR')} €`}></div>
        ))}
      </div>
      <div className="bars-labels">
        {data.map((_, i) => (
          <span key={i}>{i % 2 === 0 ? `J-${data.length - 1 - i}` : ''}</span>
        ))}
      </div>
    </>
  );
};

const StatCard = ({ stat, series, fmt }) => (
  <div className="stat-card">
    <div className="stat-label">{stat.label}</div>
    <div className="stat-value">
      <span>{fmt ? fmt(stat.value) : Number(stat.value).toLocaleString('fr-FR')}</span>
      {fmt ? null : <span className="unit"></span>}
    </div>
    <span className={`stat-delta ${(stat.delta || 0) < 0 ? 'neg' : ''}`}>
      {(stat.delta || 0) >= 0 ? '↑' : '↓'} {Math.abs(stat.delta || 0)}%
    </span>
    {series && series.length > 1 ? <div className="stat-spark"><Sparkline data={series} /></div> : null}
  </div>
);

const Dashboard = ({ navigate, models, onRefresh }) => {
  const [dashData, setDashData] = React.useState(null);
  const rel = window.rel || ((d) => d || '—');
  const fmtXOF = (v) => Number(v).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 });
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  React.useEffect(() => {
    window.API.dashboard().then(data => {
      if (!data.error) setDashData(data);
    }).catch(e => console.error('Dashboard load error', e));
  }, []);

  const stats = dashData?.stats || window.MOCK?.stats || {
    revenue: { label: 'Revenu', value: 0, delta: 0 },
    orders: { label: 'Commandes', value: 0, delta: 0 },
    products: { label: 'Produits', value: 0, delta: 0 },
    users: { label: 'Utilisateurs', value: 0, delta: 0 }
  };
  const revenueSeries = dashData?.revenue_series || window.MOCK?.revenueSeries || [0,0,0,0,0,0,0];
  const low_stock = dashData?.low_stock || [];
  const unreadContacts = dashData?.unread_contacts || 0;
  const unreadContactNames = (dashData?.unread_contact_names || []).map(m => {
    if (typeof m === 'string') return m;
    if (m && m.name) return m.name;
    return 'Message';
  });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Gestion INSHOP BUILDER</h1>
          <div className="page-sub">Bienvenue, admin. Voici l'activité du jour — {today}.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onRefresh}><Icon name="refresh" size={14} /> Actualiser</button>
          <button className="btn btn-primary" onClick={() => navigate({screen: 'add', model: 'products'})}>
            <Icon name="plus" size={14} /> Nouveau produit
          </button>
        </div>
      </div>

      <div className="stats-row">
        <StatCard stat={stats.revenue} series={revenueSeries} fmt={fmtXOF} />
        <StatCard stat={stats.orders} />
        <StatCard stat={stats.products} />
        <StatCard stat={stats.users} />
      </div>

      <div className="dash-grid">
        <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Revenu sur 14 jours</h3>
                <div className="card-sub">{fmtXOF(revenueSeries.reduce((a,b)=>a+b,0))} cumulé</div>
              </div>
            </div>
            <div className="card-body">
              <Bars data={revenueSeries} todayIdx={revenueSeries.length - 1} />
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Modèles de données</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate({screen: 'list', model: 'products'})}>Tout afficher <Icon name="arrow" size={12} /></button>
            </div>
            <div className="card-body flush">
              <div className="models-list">
                {models.map(group => (
                  <React.Fragment key={group.app}>
                    <div className="section-label">{group.app}</div>
                    {group.items.map(item => (
                      <div key={item.key} className="model-row" onClick={() => navigate({screen: 'list', model: item.key})}>
                        <div className="m-icon"><Icon name={item.icon} size={15} /></div>
                        <div>
                          <div className="m-name">{item.label}</div>
                          <div className="m-meta">{item.count.toLocaleString('fr-FR')} entrée{item.count > 1 ? 's' : ''}{item.badge && typeof item.badge === 'number' ? ` · ${item.badge} en attente` : ''}</div>
                        </div>
                        <div className="m-count">{item.count.toLocaleString('fr-FR')}</div>
                        <div className="m-actions" onClick={(e) => e.stopPropagation()}>
                          {item.addable && (
                            <button className="btn btn-sm" onClick={() => navigate({screen: 'add', model: item.key})}>
                              <Icon name="plus" size={11} /> Ajouter
                            </button>
                          )}
                          <button className="btn btn-sm" onClick={() => navigate({screen: 'list', model: item.key})}>
                            <Icon name="pencil" size={11} /> Gérer
                          </button>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
          <div className="card">
            <div className="card-head">
              <h3>Alertes & Notifications</h3>
            </div>
            <div className="card-body" style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              {low_stock.length > 0 && (
                <div className="alert-item" style={{cursor: 'pointer'}} onClick={() => navigate({screen: 'list', model: 'products'})}>
                  <div className="alert-icon warn"><Icon name="box" size={14}/></div>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 600, fontSize: 13}}>Produits en stock faible ({low_stock.length})</div>
                    <div style={{color: 'var(--muted)', fontSize: 12}}>{low_stock.map(p => p.name).slice(0,3).join(', ')}{low_stock.length > 3 ? '...' : ''}</div>
                  </div>
                </div>
              )}
              {unreadContacts > 0 && (
                <div className="alert-item" style={{cursor: 'pointer'}} onClick={() => navigate({screen: 'list', model: 'contacts'})}>
                  <div className="alert-icon info"><Icon name="mail" size={14}/></div>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 600, fontSize: 13}}>Messages non lus ({unreadContacts})</div>
                    <div style={{color: 'var(--muted)', fontSize: 12}}>{unreadContactNames.slice(0,3).join(', ')}</div>
                  </div>
                </div>
              )}
              {low_stock.length === 0 && unreadContacts === 0 && (
                <div className="empty-state" style={{padding: '10px 0'}}>
                   <Icon name="check" size={16} color="var(--accent)"/>
                   <span style={{marginLeft: 8, color: 'var(--muted)', fontSize: 13}}>Tout est en ordre.</span>
                </div>
              )}
            </div>
          </div>

          {dashData?.recent_orders?.length > 0 && (
            <div className="card">
              <div className="card-head">
                <h3>Commandes récentes</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate({screen: 'list', model: 'orders'})}>
                  Voir tout <Icon name="arrow" size={12} />
                </button>
              </div>
              <div className="card-body flush">
                <div className="activity">
                  {dashData.recent_orders.map((o, i) => (
                    <div key={i} className="activity-item clickable" onClick={() => navigate({screen: 'detail', model: 'orders', id: o.id})}>
                      <div className="act-dot" style={{background: o.state === 'sale' ? 'var(--accent)' : 'var(--muted)'}}></div>
                      <div className="act-body">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                           <strong>{o.customer}</strong>
                           <span className="mono" style={{fontSize:11, color:'var(--muted)'}}>{o.name}</span>
                        </div>
                        <div className="act-time">{fmtXOF(o.total)} · {rel(o.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
window.Dashboard = Dashboard;
