// Root app — routing + tweaks integration
const { useState, useEffect, useCallback } = React;
const useS = useState;
const useE = useEffect;
const useCB = useCallback;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "#0d7f76",
  "density": "comfortable",
  "sidebarCollapsed": false
}/*EDITMODE-END*/;

const ACCENTS = {
  '#0d7f76': { soft: '#d8efed', strong: '#0a5f59' }, // teal
  '#5b4cdb': { soft: '#e3dffb', strong: '#4537b8' }, // indigo
  '#c75a3a': { soft: '#fbe6df', strong: '#a04428' }, // terracotta
  '#0f766e': { soft: '#cfece9', strong: '#0a5651' }, // emerald-teal
  '#1f6feb': { soft: '#dde9f6', strong: '#155bbf' }, // blue
};

function App() {
  const [route, setRoute] = useState({ screen: 'home' });
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);
  const [models, setModels] = useState(() => window.MOCK?.models || []);
  const [refreshKey, setRefreshKey] = useState(0);
  const [alerts, setAlerts] = useS({ low_stock: [], unread_contacts: 0, unread_contact_names: [], recent_orders: [] });

  // Navigation listener for global events (from Dashboard, etc)
  useE(() => {
    const onNav = (e) => setRoute(e.detail);
    window.addEventListener('navigate', onNav);
    return () => window.removeEventListener('navigate', onNav);
  }, []);

  // Apply tweaks to DOM
  useE(() => {
    document.documentElement.setAttribute('data-theme', t.theme);
    document.documentElement.setAttribute('data-density', t.density);
    const accent = ACCENTS[t.accent] || ACCENTS['#0d7f76'];
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--accent-soft', accent.soft);
    document.documentElement.style.setProperty('--accent-strong', accent.strong);
  }, [t]);

  // Load real counts + alerts
  useE(() => {
    const loadCounts = async () => {
      if (!window.MOCK?.models) return;
      const nextModels = JSON.parse(JSON.stringify(window.MOCK.models));
      for (const group of nextModels) {
        for (const item of group.items) {
          try {
            const data = await window.API.list(item.key);
            item.count = data.count !== undefined ? data.count : (Array.isArray(data) ? data.length : 0);
          } catch (e) {
            console.error('Failed to load count for', item.key, e);
          }
        }
      }
      setModels(nextModels);
    };
    const loadAlerts = async () => {
      try {
        const data = await window.API.dashboard();
        setAlerts({
          low_stock: data.low_stock || [],
          unread_contacts: data.unread_contacts || 0,
          unread_contact_names: data.unread_contact_names || [],
          recent_orders: (data.recent_orders || []).slice(0, 3),
        });
      } catch (e) {
        console.error('Failed to load alerts', e);
      }
    };
    if (window.API.token) { loadCounts(); loadAlerts(); }
  }, [refreshKey]);

  const navigate = (next) => {
    setRoute(next);
    window.scrollTo({top: 0, behavior: 'instant'});
  };

  const onRefresh = useCB(() => setRefreshKey(k => k + 1), []);
  const onToggleTheme = useCB(() => setT('theme', t.theme === 'dark' ? 'light' : 'dark'), [t.theme, setT]);

  return (
    <div className="shell" data-collapsed={t.sidebarCollapsed}>
      <Sidebar route={route} navigate={navigate} collapsed={t.sidebarCollapsed} models={models} />
      <div className="main">
        <Topbar route={route} navigate={navigate} models={models}
          theme={t.theme}
          onToggleSidebar={() => setT('sidebarCollapsed', !t.sidebarCollapsed)}
          onToggleTheme={onToggleTheme}
          onRefresh={onRefresh}
          alerts={alerts} />
        {route.screen === 'home' && <window.Dashboard key={refreshKey} navigate={navigate} models={models} onRefresh={onRefresh} />}
        {route.screen === 'list' && <window.ListView key={refreshKey} route={route} navigate={navigate} />}
        {route.screen === 'add' && <window.FormView route={route} navigate={navigate} />}
        {route.screen === 'edit' && <window.FormView key={route.id} route={route} navigate={navigate} />}
        {route.screen === 'detail' && <window.DetailView key={refreshKey + '-' + route.id} route={route} navigate={navigate} />}
      </div>

      <TweaksPanel title="Tweaks" defaultPosition={{right: 20, bottom: 20}}>
        <TweakSection title="Apparence">
          <TweakRadio label="Thème" value={t.theme} options={[{value:'light',label:'Clair'},{value:'dark',label:'Sombre'}]}
            onChange={(v) => setT('theme', v)} />
          <TweakColor label="Couleur d'accent" value={t.accent}
            options={Object.keys(ACCENTS)} onChange={(v) => setT('accent', v)} />
        </TweakSection>
        <TweakSection title="Mise en page">
          <TweakRadio label="Densité" value={t.density}
            options={[{value:'comfortable',label:'Confort'},{value:'compact',label:'Compact'}]}
            onChange={(v) => setT('density', v)} />
          <TweakToggle label="Barre latérale repliée" value={t.sidebarCollapsed}
            onChange={(v) => setT('sidebarCollapsed', v)} />
        </TweakSection>
        <TweakSection title="Navigation rapide">
          <TweakButton label="→ Dashboard" onClick={() => navigate({screen: 'home'})} />
          <TweakButton label="→ Liste Products" onClick={() => navigate({screen: 'list', model: 'products'})} />
          <TweakButton label="→ Ajouter category" onClick={() => navigate({screen: 'add', model: 'categories'})} />
          <TweakButton label="→ Produits" onClick={() => navigate({screen: 'list', model: 'products'})} />
          <TweakButton label="→ Commandes" onClick={() => navigate({screen: 'list', model: 'orders'})} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// App is rendered by the inline script in index.html via AdminRoot
window.App = App;
