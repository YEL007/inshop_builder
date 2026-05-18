// List view + table column definitions per model
const { useState, useEffect, useMemo } = React;
const { Icon, Pill } = window;

const fmtXOF = (v) => Number(v).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 });
const rel = window.rel || ((d) => d || '—');

const STOCK_LABELS = { in_stock: 'En stock', low_stock: 'Stock faible', out_of_stock: 'Rupture' };
const STOCK_TONES  = { in_stock: 'ok',       low_stock: 'warn',        out_of_stock: 'danger'  };

const MODEL_DEF = {
  components: {
    title: 'Composants', singular: 'composant', icon: 'cpu',
    cols: [
      { key: 'id', label: 'ID', mono: true, w: 60, align: 'right' },
      { key: 'name', label: 'Composant', primary: true },
      { key: 'brand', label: 'Marque', muted: true, render: (v) => v || '—' },
      { key: 'category_name', label: 'Catégorie', muted: true, render: (v) => v || '—' },
      { key: 'price', label: 'Prix', align: 'right', mono: true, render: (v) => fmtXOF(v) },
      { key: 'stock_status', label: 'Stock', render: (v) => <Pill tone={STOCK_TONES[v] || 'neutral'}>{STOCK_LABELS[v] || v}</Pill> },
      { key: 'active', label: 'Statut', render: (v) => v ? <Pill tone="ok">Actif</Pill> : <Pill tone="neutral">Inactif</Pill> },
    ],
    filters: [
      { label: 'Par stock', options: ['Tout', 'in_stock', 'low_stock', 'out_of_stock'] },
    ],
  },
  laptops: {
    title: 'PC Portables', singular: 'portable', icon: 'laptop',
    cols: [
      { key: 'id', label: 'ID', mono: true, w: 60, align: 'right' },
      { key: 'name', label: 'Nom', primary: true },
      { key: 'brand', label: 'Marque', muted: true, render: (v) => v || '—' },
      { key: 'price', label: 'Prix', align: 'right', mono: true, render: (v) => fmtXOF(v) },
      { key: 'spec_laptop_cpu', label: 'CPU', muted: true, render: (v) => v || '—' },
      { key: 'spec_laptop_gpu', label: 'GPU', muted: true, render: (v) => v || '—' },
      { key: 'stock_status', label: 'Stock', render: (v) => <Pill tone={STOCK_TONES[v] || 'neutral'}>{STOCK_LABELS[v] || v}</Pill> },
      { key: 'active', label: 'Statut', render: (v) => v ? <Pill tone="ok">Actif</Pill> : <Pill tone="neutral">Inactif</Pill> },
    ],
    filters: [
      { label: 'Par stock', options: ['Tout', 'in_stock', 'low_stock', 'out_of_stock'] },
    ],
  },
  peripherals: {
    title: 'Périphériques', singular: 'périphérique', icon: 'mouse',
    cols: [
      { key: 'id', label: 'ID', mono: true, w: 60, align: 'right' },
      { key: 'name', label: 'Périphérique', primary: true },
      { key: 'brand', label: 'Marque', muted: true, render: (v) => v || '—' },
      { key: 'category_name', label: 'Catégorie', muted: true, render: (v) => v || '—' },
      { key: 'price', label: 'Prix', align: 'right', mono: true, render: (v) => fmtXOF(v) },
      { key: 'stock_status', label: 'Stock', render: (v) => <Pill tone={STOCK_TONES[v] || 'neutral'}>{STOCK_LABELS[v] || v}</Pill> },
      { key: 'active', label: 'Statut', render: (v) => v ? <Pill tone="ok">Actif</Pill> : <Pill tone="neutral">Inactif</Pill> },
    ],
    filters: [
      { label: 'Par stock', options: ['Tout', 'in_stock', 'low_stock', 'out_of_stock'] },
    ],
  },
  categories: {
    title: 'Categories', singular: 'catégorie', icon: 'tag',
    cols: [
      { key: 'sequence', label: 'Seq.', w: 60, align: 'right', mono: true },
      { key: 'name', label: 'Nom', primary: true },
      { key: 'code', label: 'Code', mono: true },
      { key: 'type', label: 'Type', render: (v) => {
        const labels = { component: 'Composant interne', peripheral: 'Périphérique', laptop: 'Portable', other: 'Autre' };
        const tones  = { component: 'info', peripheral: 'accent', laptop: 'ok', other: 'neutral' };
        return <Pill tone={tones[v] || 'neutral'}>{labels[v] || v}</Pill>;
      }},
      { key: 'peri_group', label: 'Groupe péri.', muted: true, render: (v) => {
        const labels = { input: 'Entrée', output: 'Sortie', mixed: 'E/S' };
        return labels[v] || '—';
      }},
      { key: 'active', label: 'Statut', render: (v) => v ? <Pill tone="ok">Active</Pill> : <Pill tone="neutral">Inactive</Pill> },
    ],
    filters: [
      { label: 'Par type', options: ['Tout', 'component', 'peripheral', 'laptop', 'other'] },
      { label: 'Par statut', options: ['Tout', 'Actif', 'Inactif'] },
    ],
  },
  orders: {
    title: 'Orders', singular: 'commande', icon: 'cart',
    cols: [
      { key: 'name', label: 'N°', mono: true, w: 100 },
      { key: 'shipping_name', label: 'Client', primary: true, render: (v, row) => (
        <div>
          <div style={{fontWeight: 500}}>{v || row.user_name || 'Anonyme'}</div>
          <div style={{fontSize: 11.5, color: 'var(--muted)'}}>{row.shipping_email || ''}</div>
        </div>
      )},
      { key: 'items', label: 'Articles', align: 'right', mono: true, render: (v) => Array.isArray(v) ? v.length : 0 },
      { key: 'total', label: 'Total', align: 'right', mono: true, render: (v) => fmtXOF(v) },
      { key: 'state', label: 'Statut', render: (v) => {
        const labels = { draft: 'Panier', sale: 'Confirmée', done: 'Terminée' };
        const tones  = { draft: 'neutral', sale: 'info', done: 'ok' };
        return <Pill tone={tones[v] || 'neutral'}>{labels[v] || v}</Pill>;
      }},
      { key: 'delivery_status', label: 'Livraison', muted: true, render: (v) => {
        const labels = { processing: 'En traitement', preparing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée' };
        return labels[v] || v || '—';
      }},
      { key: 'created_at', label: 'Date', muted: true, render: (v) => rel(v) },
    ],
    filters: [
      { label: 'Par statut', options: ['Tout', 'sale', 'done'] },
      { label: 'Par livraison', options: ['Tout', 'processing', 'preparing', 'shipped', 'delivered'] },
    ],
  },
  prebuilts: {
    title: 'Prebuilts', singular: 'préconfiguré', icon: 'box',
    cols: [
      { key: 'id', label: 'ID', mono: true, w: 60, align: 'right' },
      { key: 'name', label: 'Nom', primary: true },
      { key: 'tier', label: 'Gamme', render: (v) => <Pill tone="neutral">{v || '—'}</Pill> },
      { key: 'cpu', label: 'CPU', muted: true, render: (v) => v || '—' },
      { key: 'gpu', label: 'GPU', muted: true, render: (v) => v || '—' },
      { key: 'price', label: 'Prix', align: 'right', mono: true, render: (v) => fmtXOF(v) },
      { key: 'stock_status', label: 'Stock', render: (v) => <Pill tone={STOCK_TONES[v] || 'neutral'}>{STOCK_LABELS[v] || v}</Pill> },
      { key: 'active', label: 'Statut', render: (v) => v ? <Pill tone="ok">Actif</Pill> : <Pill tone="neutral">Inactif</Pill> },
    ],
    filters: [
      { label: 'Par stock', options: ['Tout', 'in_stock', 'low_stock', 'out_of_stock'] },
    ],
  },
  onlyone: {
    title: 'Only One PCs', singular: 'pièce unique', icon: 'gem',
    cols: [
      { key: 'id', label: 'ID', mono: true, w: 60, align: 'right' },
      { key: 'name', label: 'Pièce unique', primary: true },
      { key: 'cpu', label: 'CPU', muted: true, render: (v) => v || '—' },
      { key: 'gpu', label: 'GPU', muted: true, render: (v) => v || '—' },
      { key: 'price', label: 'Prix', align: 'right', mono: true, render: (v) => fmtXOF(v) },
      { key: 'stock_status', label: 'Disponibilité', render: (v) => {
        const labels = { in_stock: 'Disponible', low_stock: 'Dernier', out_of_stock: 'Vendu' };
        const tones  = { in_stock: 'ok',         low_stock: 'warn',    out_of_stock: 'neutral' };
        return <Pill tone={tones[v] || 'neutral'}>{labels[v] || v}</Pill>;
      }},
      { key: 'active', label: 'Statut', render: (v) => v ? <Pill tone="ok">Actif</Pill> : <Pill tone="neutral">Inactif</Pill> },
    ],
    filters: [
      { label: 'Par dispo.', options: ['Tout', 'in_stock', 'out_of_stock'] },
    ],
  },
  reviews: {
    title: 'Reviews', singular: 'avis', icon: 'star',
    cols: [
      { key: 'product_name', label: 'Produit', primary: true, render: (v) => v || '—' },
      { key: 'user_display_name', label: 'Auteur', muted: true, render: (v) => v || '—' },
      { key: 'rating', label: 'Note', render: (v) => <Stars rating={v} /> },
      { key: 'comment', label: 'Extrait', render: (v) => (
        <span style={{color: 'var(--ink-2)', fontSize: 12.5}}>« {v && v.length > 50 ? v.slice(0, 50) + '…' : (v || '')} »</span>
      )},
      { key: 'date', label: 'Date', muted: true, render: (v) => rel(v) },
    ],
    filters: [
      { label: 'Par note', options: ['Tout', '5', '4', '3', '2', '1'] },
    ],
  },
  contacts: {
    title: 'Contact messages', singular: 'message', icon: 'mail',
    cols: [
      { key: 'name', label: 'Expéditeur', primary: true, render: (v, row) => (
        <div>
          <div style={{fontWeight: row.state === 'new' ? 600 : 400}}>{v}</div>
          <div style={{fontSize: 11.5, color: 'var(--muted)'}}>{row.email}</div>
        </div>
      )},
      { key: 'subject', label: 'Sujet', render: (v, row) => (
        <span style={{fontWeight: row.state === 'new' ? 600 : 400, color: row.state === 'new' ? 'var(--ink)' : 'var(--ink-2)'}}>{v || '(sans sujet)'}</span>
      )},
      { key: 'state', label: 'Statut', render: (v) => {
        const labels = { new: 'Non lu', read: 'Lu', replied: 'Répondu' };
        const tones  = { new: 'info',  read: 'neutral', replied: 'ok' };
        return <Pill tone={tones[v] || 'neutral'}>{labels[v] || v}</Pill>;
      }},
      { key: 'created_at', label: 'Reçu', muted: true, render: (v) => rel(v) },
    ],
    filters: [
      { label: 'Par statut', options: ['Tout', 'new', 'read', 'replied'] },
    ],
  },
  users: {
    title: 'Utilisateurs', singular: 'utilisateur', icon: 'user',
    cols: [
      { key: 'username', label: "Nom d'utilisateur", primary: true, mono: true },
      { key: 'email', label: 'Email', muted: true },
      { key: 'is_staff', label: 'Rôle', render: (v) => <Pill tone={v ? 'accent' : 'neutral'}>{v ? 'Staff / Admin' : 'Utilisateur'}</Pill> },
      { key: 'last_login', label: 'Dernière connexion', muted: true, render: (v) => rel(v) },
      { key: 'is_active', label: 'Statut', render: (v) => v ? <Pill tone="ok">Actif</Pill> : <Pill tone="neutral">Désactivé</Pill> },
    ],
    filters: [
      { label: 'Par statut', options: ['Tout', 'Actif', 'Désactivé'] },
    ],
  },
  groups: {
    title: 'Groupes', singular: 'groupe', icon: 'shield',
    cols: [
      { key: 'name', label: 'Nom du groupe', primary: true },
    ],
    filters: [],
  },
  siteconfig: {
    title: 'Site Configurations', singular: 'configuration', icon: 'gear',
    cols: [
      { key: 'name', label: 'Nom du site', primary: true },
      { key: 'contact_email', label: 'Email', muted: true },
      { key: 'contact_phone', label: 'Téléphone', muted: true },
    ],
    filters: [],
  },
};

const ListView = ({ route, navigate }) => {
  const def = MODEL_DEF[route.model];
  if (!def) return <div className="page"><div className="empty">Modèle inconnu : {route.model}</div></div>;

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [activeFilters, setActiveFilters] = useState({});
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setAllData([]);
      try {
        const data = await window.API.list(route.model);
        setAllData(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load', route.model, e);
      }
      setLoading(false);
    };
    load();
  }, [route.model]);

  const filtered = useMemo(() => {
    let d = allData;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(q)));
    }
    return d;
  }, [allData, search]);

  const toggleSel = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer ${selected.size} élément(s) ?`)) return;
    for (const id of selected) {
      await window.API.delete(route.model, id);
    }
    setSelected(new Set());
    const data = await window.API.list(route.model);
    setAllData(Array.isArray(data) ? data : []);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Sélectionnez l'objet {def.singular} à modifier</h1>
          <div className="page-sub">{filtered.length} {def.singular}{filtered.length > 1 ? 's' : ''}{search && ` · filtré sur "${search}"`}</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => {
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${route.model}-export.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}><Icon name="download" size={14} /> Exporter</button>
          {route.model !== 'siteconfig' && route.model !== 'groups' && (
            <button className="btn btn-primary" onClick={() => navigate({screen: 'add', model: route.model})}>
              <Icon name="plus" size={14} /> Ajouter {def.singular}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-wrap">
            <Icon name="search" size={14} />
            <input className="search" placeholder={`Rechercher dans ${def.title.toLowerCase()}…`}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {def.filters.map((f, i) => (
            <div key={i} className="select-wrap" style={{maxWidth: 200}}>
              <select className="select" value={activeFilters[f.label] || f.options[0]}
                onChange={e => setActiveFilters({...activeFilters, [f.label]: e.target.value})}>
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
              <Icon name="chevD" size={12} />
            </div>
          ))}
          <button className="btn btn-ghost btn-sm"><Icon name="filter" size={13} /> Filtres</button>
          {selected.size > 0 ? (
            <div className="sel-count" style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <strong>{selected.size}</strong> sélectionné{selected.size > 1 ? 's' : ''}
              <button className="btn btn-sm btn-danger" onClick={handleDelete}><Icon name="trash" size={12} /> Supprimer</button>
            </div>
          ) : (
            <div className="sel-count"><strong>{filtered.length}</strong> résultat{filtered.length > 1 ? 's' : ''}</div>
          )}
        </div>

        {loading ? (
          <div className="empty">
            <div className="empty-icon spin"><Icon name="refresh" size={22} /></div>
            <h3>Chargement…</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><Icon name={def.icon} size={22} /></div>
            <h3>Aucun résultat</h3>
            <div>Aucun {def.singular} ne correspond à votre recherche.</div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th className="checkcell">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
                </th>
                {def.cols.map(c => (
                  <th key={c.key} style={{textAlign: c.align || 'left', width: c.w}}>{c.label}</th>
                ))}
                <th style={{width: 80}}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id} data-selected={selected.has(row.id)} onClick={() => navigate({screen: 'edit', model: route.model, id: row.id})}>
                  <td className="checkcell" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSel(row.id)} />
                  </td>
                  {def.cols.map(c => {
                    const v = row[c.key];
                    const rendered = c.render ? c.render(v, row) : (v != null ? String(v) : '—');
                    return (
                      <td key={c.key} style={{
                        textAlign: c.align || 'left',
                        color: c.muted ? 'var(--muted)' : undefined,
                        fontWeight: c.primary ? 500 : undefined,
                        fontFamily: c.mono ? 'var(--font-mono)' : undefined,
                        fontSize: c.mono ? 12.5 : undefined,
                      }}>
                        {rendered}
                      </td>
                    );
                  })}
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="icon-btn" title="Voir" onClick={() => navigate({screen: 'detail', model: route.model, id: row.id})}>
                        <Icon name="eye" size={13} />
                      </button>
                      <button className="icon-btn" title="Modifier" onClick={() => navigate({screen: 'edit', model: route.model, id: row.id})}>
                        <Icon name="pencil" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pager">
          <div>Affichage 1 – {filtered.length} sur {allData.length}</div>
          <div className="pager-nav">
            <button className="btn btn-sm" disabled><Icon name="arrowL" size={11} /></button>
            <button className="btn btn-sm" data-active="true">1</button>
            <button className="btn btn-sm"><Icon name="arrow" size={11} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.ListView = ListView;
window.MODEL_DEF = MODEL_DEF;
