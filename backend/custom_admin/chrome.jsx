// Sidebar + Topbar + chrome
const { useState, useMemo, useEffect, useRef } = React;
const { Icon, Pill, rel } = window;

const Sidebar = ({ route, navigate, collapsed, models }) => {
  const isActive = (key) => route.screen === 'list' && route.model === key
    || (route.screen === 'home' && key === 'home');
  return (
    <aside className="sidebar" data-mini={collapsed}>
      <div className="sidebar-brand">
        <div className="brand-mark">iB</div>
        <div className="brand-name">
          INSHOP BUILDER
          <small>Admin · v2.4</small>
        </div>
      </div>
      <div className="sidebar-search">
        <Icon name="search" size={14} />
        <input placeholder="Rechercher..." />
        <kbd>⌘K</kbd>
      </div>
      <nav className="nav">
        <div className="nav-section">
          <button className="nav-item" data-active={route.screen === 'home'} onClick={() => navigate({screen: 'home'})}>
            <Icon name="home" size={16} />
            <span className="nav-label">Tableau de bord</span>
          </button>
        </div>
        {models.map(group => (
          <div key={group.app} className="nav-section">
            <div className="nav-section-label">{group.app}</div>
            {group.items.map(item => (
              <button key={item.key} className="nav-item"
                data-active={route.screen === 'list' && route.model === item.key}
                onClick={() => navigate({screen: 'list', model: item.key})}>
                <Icon name={item.icon} size={16} />
                <span className="nav-label">{item.label}</span>
                {item.badge && typeof item.badge === 'number' ? <span className="nav-badge"></span> : null}
                <span className="nav-count">{item.count.toLocaleString('fr-FR')}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="avatar">AD</div>
        <div className="foot-info">
          <strong>admin</strong>
          <small>Super-administrateur</small>
        </div>
        <button className="icon-btn" title="Déconnexion" onClick={() => window.API.logout()}>
          <Icon name="logout" size={15} />
        </button>
      </div>
    </aside>
  );
};

const Topbar = ({ route, navigate, models, onToggleSidebar, theme, onToggleTheme, onRefresh, alerts }) => {
  const [spinning, setSpinning] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const totalAlerts = (alerts?.low_stock?.length || 0) + (alerts?.unread_contacts || 0);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    onRefresh();
    setTimeout(() => setSpinning(false), 700);
  };

  const crumbs = useMemo(() => {
    if (route.screen === 'home') return [{label: 'Tableau de bord'}];
    const model = models.flatMap(g => g.items).find(m => m.key === route.model);
    const app = models.find(g => g.items.some(m => m.key === route.model));
    const base = [
      { label: 'Accueil', onClick: () => navigate({screen: 'home'}) },
      { label: app ? app.app : 'API' },
      { label: model ? model.label : route.model, onClick: () => navigate({screen: 'list', model: route.model}) }
    ];
    if (route.screen === 'detail') base.push({ label: route.id ? `${route.id}` : 'Détail' });
    if (route.screen === 'add') base.push({ label: 'Ajouter' });
    if (route.screen === 'edit') base.push({ label: 'Modifier' });
    return base;
  }, [route, models]);

  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onToggleSidebar} title="Replier la barre latérale">
        <Icon name="grid" size={16} />
      </button>
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep"><Icon name="chev" size={11} /></span>}
            {c.onClick ? (
              <button onClick={c.onClick}>{c.label}</button>
            ) : (
              <strong>{c.label}</strong>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => window.open('/', '_blank')}>
          <Icon name="eye" size={14} /> Voir le site
        </button>

        {/* ── Thème clair / sombre ─── */}
        <button className="icon-btn topbar-theme-btn" onClick={onToggleTheme}
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
        </button>

        {/* ── Rafraîchir ─── */}
        <button className="icon-btn" title="Rafraîchir la vue" onClick={handleRefresh}>
          <span className={spinning ? 'spin' : ''} style={{display: 'inline-flex'}}>
            <Icon name="refresh" size={16} />
          </span>
        </button>

        {/* ── Notifications ─── */}
        <div style={{position: 'relative'}} ref={notifRef}>
          <button className="icon-btn notif-btn" title="Alertes" onClick={() => setNotifOpen(o => !o)}
            data-active={notifOpen}>
            <Icon name="bell" size={16} />
            {totalAlerts > 0 && (
              <span className="notif-badge">{totalAlerts > 9 ? '9+' : totalAlerts}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-head">
                <strong>Alertes</strong>
                {totalAlerts > 0 && <span className="notif-count">{totalAlerts}</span>}
              </div>

              {/* Stock faible */}
              {alerts?.low_stock?.length > 0 && (
                <div className="notif-section">
                  <div className="notif-section-label">
                    <Icon name="cube" size={11} /> Stock faible
                  </div>
                  {alerts.low_stock.map((item, i) => (
                    <button key={i} className="notif-item notif-item-warn"
                      onClick={() => { navigate({screen: 'list', model: 'products'}); setNotifOpen(false); }}>
                      <div className="notif-dot warn"></div>
                      <div className="notif-item-body">
                        <div className="notif-item-title">{item.name}</div>
                        <div className="notif-item-sub">{item.stock_status === 'out_of_stock' ? 'Rupture de stock' : 'Stock faible'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Messages non lus */}
              {alerts?.unread_contacts > 0 && (
                <div className="notif-section">
                  <div className="notif-section-label">
                    <Icon name="mail" size={11} /> Messages non lus
                  </div>
                  {(alerts.unread_contact_names || []).map((name, i) => (
                    <button key={i} className="notif-item"
                      onClick={() => { navigate({screen: 'list', model: 'contacts'}); setNotifOpen(false); }}>
                      <div className="notif-dot info"></div>
                      <div className="notif-item-body">
                        <div className="notif-item-title">{name}</div>
                        <div className="notif-item-sub">Message en attente de lecture</div>
                      </div>
                    </button>
                  ))}
                  {alerts.unread_contacts > (alerts.unread_contact_names || []).length && (
                    <button className="notif-item"
                      onClick={() => { navigate({screen: 'list', model: 'contacts'}); setNotifOpen(false); }}>
                      <div className="notif-dot info"></div>
                      <div className="notif-item-body">
                        <div className="notif-item-title">+{alerts.unread_contacts - (alerts.unread_contact_names || []).length} autre(s) message(s)</div>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Commandes récentes */}
              {alerts?.recent_orders?.length > 0 && (
                <div className="notif-section">
                  <div className="notif-section-label">
                    <Icon name="cart" size={11} /> Commandes récentes
                  </div>
                  {alerts.recent_orders.map((order, i) => (
                    <button key={i} className="notif-item"
                      onClick={() => { navigate({screen: 'detail', model: 'orders', id: order.id}); setNotifOpen(false); }}>
                      <div className="notif-dot ok"></div>
                      <div className="notif-item-body">
                        <div className="notif-item-title">{order.name || `Commande #${order.id}`}</div>
                        <div className="notif-item-sub">{order.shipping_name || order.user_name || 'Client'} · {order.total ? Number(order.total).toLocaleString('fr-FR', {style:'currency',currency:'XOF',maximumFractionDigits:0}) : ''}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {totalAlerts === 0 && (!alerts?.recent_orders?.length) && (
                <div className="notif-empty">
                  <Icon name="check" size={18} />
                  <div>Aucune alerte en cours</div>
                </div>
              )}

              <div className="notif-foot">
                <button className="notif-foot-btn"
                  onClick={() => { navigate({screen: 'home'}); setNotifOpen(false); }}>
                  Voir le tableau de bord →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Object.assign(window, { Sidebar, Topbar });
