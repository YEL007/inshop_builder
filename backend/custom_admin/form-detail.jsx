
// form-detail.jsx — forms mapped to actual Django model fields

const { useState, useEffect } = React;
const { Icon, Pill } = window;

// ── Spec fields mapped to exact Django model field names ─────────────────────
const SPEC_FIELDS = {
  cpu: [
    { name: 'spec_cpu_socket',    label: 'Socket',        type: 'select', options: ['AM5','AM4','LGA1700','LGA1200','LGA1151','TR5','TRX40'] },
    { name: 'spec_cpu_cores',     label: 'Cœurs',         type: 'number' },
    { name: 'spec_cpu_threads',   label: 'Threads',       type: 'number' },
    { name: 'spec_cpu_base_ghz',  label: 'Fréq. base',    type: 'text',   placeholder: '3.8GHz' },
    { name: 'spec_cpu_boost_ghz', label: 'Fréq. boost',   type: 'text',   placeholder: '5.6GHz' },
    { name: 'spec_cpu_tdp',       label: 'TDP',           type: 'number', unit: 'W' },
    { name: 'spec_cpu_cache',     label: 'Cache',         type: 'text',   placeholder: '32MB' },
  ],
  gpu: [
    { name: 'spec_gpu_vram',         label: 'VRAM',         type: 'text',   placeholder: '16GB' },
    { name: 'spec_gpu_mem_type',     label: 'Type mémoire', type: 'text',   placeholder: 'GDDR6X' },
    { name: 'spec_gpu_tdp',          label: 'TDP',          type: 'number', unit: 'W' },
    { name: 'spec_gpu_length_mm',    label: 'Longueur',     type: 'number', unit: 'mm' },
    { name: 'spec_gpu_architecture', label: 'Architecture', type: 'select', options: ['Ada Lovelace','Ampere','Turing','RDNA 4','RDNA 3','RDNA 2','Arc Battlemage','Arc Alchemist'] },
    { name: 'spec_gpu_outputs',      label: 'Sorties vidéo',type: 'text',   placeholder: '3x DP 1.4, 1x HDMI 2.1' },
  ],
  ram: [
    { name: 'spec_ram_type',     label: 'Type',     type: 'select', options: ['DDR5','DDR4','DDR3','LPDDR5','LPDDR4'] },
    { name: 'spec_ram_capacity', label: 'Capacité', type: 'text',   placeholder: '32GB' },
    { name: 'spec_ram_speed',    label: 'Vitesse',  type: 'number', unit: 'MHz' },
    { name: 'spec_ram_modules',  label: 'Modules',  type: 'number' },
    { name: 'spec_ram_timing',   label: 'Timing',   type: 'text',   placeholder: 'CL30' },
  ],
  storage: [
    { name: 'spec_stor_type',     label: 'Type',     type: 'select', options: ['NVMe','SATA','HDD','SATA M.2'] },
    { name: 'spec_stor_capacity', label: 'Capacité', type: 'text',   placeholder: '1TB' },
    { name: 'spec_stor_read',     label: 'Lecture',  type: 'text',   placeholder: '7400MB/s' },
    { name: 'spec_stor_write',    label: 'Écriture', type: 'text',   placeholder: '6900MB/s' },
  ],
  motherboard: [
    { name: 'spec_mb_socket',      label: 'Socket',     type: 'select', options: ['AM5','AM4','LGA1700','LGA1200','LGA1151','TR5','TRX40'] },
    { name: 'spec_mb_chipset',     label: 'Chipset',    type: 'text',   placeholder: 'Z790' },
    { name: 'spec_mb_form_factor', label: 'Format',     type: 'select', options: ['ATX','mATX','ITX','E-ATX'] },
    { name: 'spec_mb_ram_type',    label: 'Type RAM',   type: 'select', options: ['DDR5','DDR4','DDR3','LPDDR5','LPDDR4'] },
    { name: 'spec_mb_ram_slots',   label: 'Slots RAM',  type: 'number' },
    { name: 'spec_mb_m2_slots',    label: 'Slots M.2',  type: 'number' },
    { name: 'spec_mb_pcie_slots',  label: 'Slots PCIe', type: 'number' },
  ],
  psu: [
    { name: 'spec_psu_wattage',    label: 'Puissance',    type: 'number', unit: 'W' },
    { name: 'spec_psu_efficiency', label: 'Certification',type: 'select', options: ['80+ Titanium','80+ Platinum','80+ Gold','80+ Silver','80+ Bronze','80+'] },
    { name: 'spec_psu_modular',    label: 'Modulaire',    type: 'select', options: ['Fully Modular','Semi-Modular','Non-Modular'] },
  ],
  case: [
    { name: 'spec_case_atx',           label: 'Supporte ATX',   type: 'switch' },
    { name: 'spec_case_matx',          label: 'Supporte mATX',  type: 'switch' },
    { name: 'spec_case_itx',           label: 'Supporte ITX',   type: 'switch' },
    { name: 'spec_case_eatx',          label: 'Supporte E-ATX', type: 'switch' },
    { name: 'spec_case_max_gpu_mm',    label: 'GPU max',         type: 'number', unit: 'mm' },
    { name: 'spec_case_max_cooler_mm', label: 'Ventirad max',    type: 'number', unit: 'mm' },
    { name: 'spec_case_drive_bays',    label: 'Baies 3.5"',      type: 'number' },
    { name: 'spec_case_fans_included', label: 'Ventilateurs',    type: 'number' },
  ],
  cooling: [
    { name: 'spec_cool_type',        label: 'Type',          type: 'select', options: ['Air','AIO 120','AIO 240','AIO 280','AIO 360','Custom'] },
    { name: 'spec_cool_tdp_rating',  label: 'TDP supporté',  type: 'number', unit: 'W' },
    { name: 'spec_cool_height_mm',   label: 'Hauteur',       type: 'number', unit: 'mm' },
    { name: 'spec_cool_radiator_mm', label: 'Radiateur',     type: 'number', unit: 'mm' },
    { name: 'spec_cool_sock_am5',    label: 'AM5',           type: 'switch' },
    { name: 'spec_cool_sock_am4',    label: 'AM4',           type: 'switch' },
    { name: 'spec_cool_sock_lga1700',label: 'LGA1700',       type: 'switch' },
    { name: 'spec_cool_sock_lga1200',label: 'LGA1200',       type: 'switch' },
  ],
  laptop: [
    { name: 'spec_laptop_cpu',     label: 'Processeur', type: 'text', placeholder: 'Intel Core i7-13700H' },
    { name: 'spec_laptop_gpu',     label: 'GPU',        type: 'text', placeholder: 'RTX 4060 Laptop' },
    { name: 'spec_laptop_ram',     label: 'RAM',        type: 'text', placeholder: '16GB DDR5' },
    { name: 'spec_laptop_storage', label: 'Stockage',   type: 'text', placeholder: '512GB NVMe SSD' },
    { name: 'spec_laptop_display', label: 'Écran',      type: 'text', placeholder: '15.6" FHD 144Hz' },
    { name: 'spec_laptop_battery', label: 'Batterie',   type: 'text', placeholder: '72Wh' },
    { name: 'spec_laptop_os',      label: 'OS',         type: 'text', placeholder: 'Windows 11' },
    { name: 'spec_laptop_weight',  label: 'Poids',      type: 'text', placeholder: '2.1 kg' },
  ],
};
SPEC_FIELDS.proc = SPEC_FIELDS.cpu;

const STOCK_OPTIONS = [
  { value: 'in_stock',     label: 'En stock' },
  { value: 'low_stock',    label: 'Stock limité' },
  { value: 'out_of_stock', label: 'Rupture de stock' },
];

// ── Shared helpers ────────────────────────────────────────────────────────────
const SelectWrap = ({ value, onChange, children, className = '' }) => (
  <div className="select-wrap">
    <select className={`select ${className}`} value={value} onChange={onChange}>{children}</select>
    <Icon name="chevD" size={12} />
  </div>
);

const UploadBtn = ({ label, multiple, onChange }) => (
  <label className="upload-btn" style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',padding:'6px 12px',borderRadius:6,border:'1px dashed var(--border)',fontSize:13,color:'var(--muted)',width:'100%',justifyContent:'center',marginTop:4}}>
    <Icon name="plus" size={13} /> {label}
    <input type="file" accept="image/*" multiple={multiple} style={{display:'none'}} onChange={onChange} />
  </label>
);

const ExtraImgGrid = ({ images, onDelete }) => (
  images && images.length > 0 ? (
    <div className="multi-img-grid" style={{marginBottom:10}}>
      {images.map(img => (
        <div key={img.id} className="multi-img-item" style={{position:'relative',display:'inline-block',margin:3}}>
          <img src={img.image} alt="" style={{width:60,height:60,objectFit:'cover',borderRadius:6,display:'block'}} />
          <button type="button" className="multi-img-del" style={{position:'absolute',top:-4,right:-4,width:16,height:16,borderRadius:'50%',background:'#ef4444',color:'#fff',border:'none',fontSize:10,lineHeight:'16px',cursor:'pointer',padding:0}} onClick={() => onDelete(img.id)}>×</button>
        </div>
      ))}
    </div>
  ) : null
);

const Spinner = () => (
  <div className="page"><div className="empty">
    <div className="empty-icon spin"><Icon name="refresh" size={22}/></div>
    <h3>Chargement…</h3>
  </div></div>
);

// ── FORM_DEF for simple models ────────────────────────────────────────────────
const FORM_DEF = {
  categories: {
    title: 'catégorie', icon: 'tag',
    sections: [
      { title: 'Général', fields: [
        { name: 'sequence', label: 'Séquence', type: 'number', default: 10 },
        { name: 'name',     label: 'Nom',      type: 'text',   required: true },
        { name: 'code',     label: 'Code',     type: 'text',   required: true, mono: true, placeholder: 'cpu, gpu, ram…' },
      ]},
      { title: 'Classification', fields: [
        { name: 'type',       label: 'Type',         type: 'select', options: ['component','peripheral','laptop','other'], default: 'component' },
        { name: 'peri_group', label: 'Groupe péri.', type: 'select', options: ['','input','output','mixed'] },
        { name: 'icon',       label: 'Icône',        type: 'text',   mono: true, placeholder: 'cpu, gpu, memory…' },
      ]},
      { title: 'Visibilité', fields: [
        { name: 'active', label: 'Active', type: 'switch', default: true },
      ]},
    ],
  },
  orders: {
    title: 'commande', icon: 'cart',
    sections: [
      { title: 'Statut', fields: [
        { name: 'state',           label: 'État',      type: 'select', options: ['draft','sale','done'] },
        { name: 'delivery_status', label: 'Livraison', type: 'select', options: ['processing','preparing','shipped','delivered'] },
      ]},
      { title: 'Client', fields: [
        { name: 'shipping_name',    label: 'Nom',       type: 'text' },
        { name: 'shipping_email',   label: 'Email',     type: 'text' },
        { name: 'shipping_phone',   label: 'Téléphone', type: 'text' },
        { name: 'shipping_address', label: 'Adresse',   type: 'text' },
      ]},
    ],
  },
  reviews: {
    title: 'avis', icon: 'star',
    sections: [
      { title: 'Contenu', fields: [
        { name: 'rating',  label: 'Note (1–5)',    type: 'number' },
        { name: 'comment', label: 'Commentaire',   type: 'textarea' },
      ]},
    ],
  },
  contacts: {
    title: 'message', icon: 'mail',
    sections: [
      { title: 'Statut', fields: [
        { name: 'state', label: 'État', type: 'select', options: ['new','read','replied'], default: 'new' },
      ]},
      { title: 'Expéditeur', fields: [
        { name: 'name',    label: 'Nom',     type: 'text' },
        { name: 'email',   label: 'Email',   type: 'text' },
        { name: 'subject', label: 'Sujet',   type: 'text' },
        { name: 'message', label: 'Message', type: 'textarea' },
      ]},
    ],
  },
  users: {
    title: 'utilisateur', icon: 'user',
    sections: [
      { title: 'Compte', fields: [
        { name: 'username', label: 'Username',     type: 'text', required: true },
        { name: 'email',    label: 'Email',        type: 'text' },
        { name: 'password', label: 'Mot de passe', type: 'text', placeholder: 'Laisser vide pour inchangé' },
      ]},
      { title: 'Droits', fields: [
        { name: 'is_staff',  label: 'Staff / Admin', type: 'switch' },
        { name: 'is_active', label: 'Actif',         type: 'switch', default: true },
      ]},
    ],
  },
  siteconfig: {
    title: 'configuration', icon: 'gear',
    sections: [
      { title: 'Site', fields: [
        { name: 'name',                   label: 'Nom du site',  type: 'text' },
        { name: 'contact_email',          label: 'Email',        type: 'text' },
        { name: 'contact_phone',          label: 'Téléphone',    type: 'text' },
        { name: 'contact_address',        label: 'Adresse',      type: 'textarea' },
        { name: 'contact_opening_hours',  label: 'Horaires',     type: 'textarea' },
      ]},
      { title: 'Réseaux sociaux', fields: [
        { name: 'social_facebook',  label: 'Facebook',    type: 'text' },
        { name: 'social_twitter',   label: 'Twitter / X', type: 'text' },
        { name: 'social_instagram', label: 'Instagram',   type: 'text' },
        { name: 'social_linkedin',  label: 'LinkedIn',    type: 'text' },
      ]},
      { title: 'Bannière Hero', fields: [
        { name: 'hero_title',    label: 'Titre',      type: 'text' },
        { name: 'hero_subtitle', label: 'Sous-titre', type: 'textarea' },
      ]},
      { title: 'Carte', fields: [
        { name: 'map_lat', label: 'Latitude',  type: 'number' },
        { name: 'map_lng', label: 'Longitude', type: 'number' },
      ]},
    ],
  },
};

// ── ProductFormView — components / laptops / peripherals / products ───────────
const ProductFormView = ({ id, model, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [row, setRow] = useState({});
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const typeFilter = { components: 'component', laptops: 'laptop', peripherals: 'peripheral' }[model];
    const init = async () => {
      setLoading(true);
      const [cats, data] = await Promise.all([
        window.API.list('categories'),
        id ? window.API.get(model, id) : Promise.resolve({}),
      ]);
      setCategories(typeFilter ? cats.filter(c => c.type === typeFilter) : cats);
      setRow(data || {});
      setLoading(false);
    };
    init();
  }, [id, model]);

  const set = (k, v) => setRow(r => ({ ...r, [k]: v }));

  const selectedCat = categories.find(c => String(c.id) === String(row.category)) || {};
  const specFields = SPEC_FIELDS[selectedCat.code] || SPEC_FIELDS[selectedCat.code?.toLowerCase()] || [];

  const TITLES = { components: 'composant', laptops: 'portable', peripherals: 'périphérique', products: 'produit' };
  const title = TITLES[model] || 'produit';

  const onSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!row.name?.trim()) errs.name = 'Nom requis';
    if (!row.category)     errs.category = 'Catégorie requise';
    if (!row.price && row.price !== 0) errs.price = 'Prix requis';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const result = await window.API.saveForm(model, id, row, imageFile, extraFiles);
      if (result?.id) {
        navigate({ screen: 'list', model });
      } else {
        const msg = Object.entries(result || {}).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
        alert('Erreur:\n' + (msg || JSON.stringify(result)));
      }
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <form onSubmit={onSave}>
        <div className="page-head">
          <div>
            <h1 className="page-title">{id ? `Modifier ${title}` : `Nouveau ${title}`}</h1>
            {id && <div className="page-sub">ID #{id}</div>}
          </div>
          <div className="page-actions">
            <button type="button" className="btn" onClick={() => navigate({ screen: 'list', model })}>
              <Icon name="arrowL" size={14} /> Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Icon name="check" size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-main">
            {/* Général */}
            <div className="card">
              <div className="card-head"><h3>Général</h3></div>
              <div className="card-body">
                <div className="field">
                  <label>Nom <span style={{color:'#ef4444'}}>*</span></label>
                  <input className={`input${errors.name?' input-error':''}`} value={row.name||''} onChange={e=>set('name', e.target.value)} placeholder="Nom du produit…" />
                  {errors.name && <span style={{color:'#ef4444',fontSize:12}}>{errors.name}</span>}
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>Marque</label>
                    <input className="input" value={row.brand||''} onChange={e=>set('brand', e.target.value)} placeholder="Intel, AMD, ASUS…" />
                  </div>
                  <div className="field">
                    <label>Catégorie <span style={{color:'#ef4444'}}>*</span></label>
                    <SelectWrap value={row.category||''} onChange={e=>set('category', e.target.value)} className={errors.category?'input-error':''}>
                      <option value="">Sélectionner…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>)}
                    </SelectWrap>
                    {errors.category && <span style={{color:'#ef4444',fontSize:12}}>{errors.category}</span>}
                  </div>
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea className="input" rows={4} value={row.description||''} onChange={e=>set('description', e.target.value)} placeholder="Description détaillée…" />
                </div>
                <div className="field">
                  <label>Tags <span style={{color:'var(--muted)',fontWeight:400,fontSize:11}}>(séparés par des virgules)</span></label>
                  <input className="input" value={row.tags||''} onChange={e=>set('tags', e.target.value)} placeholder="gaming, bestseller, nouveau…" />
                </div>
              </div>
            </div>

            {/* Spécifications dynamiques */}
            {specFields.length > 0 && (
              <div className="card">
                <div className="card-head"><h3>Spécifications — {selectedCat.name}</h3></div>
                <div className="card-body">
                  <div className="form-row" style={{flexWrap:'wrap',gap:12}}>
                    {specFields.map(f => (
                      <div className="field" key={f.name} style={{minWidth: f.type==='switch' ? 160 : 'calc(50% - 8px)', flex: f.type==='switch' ? 'none' : undefined}}>
                        <label>{f.label}{f.unit ? ` (${f.unit})` : ''}</label>
                        {f.type === 'select' ? (
                          <SelectWrap value={row[f.name]||''} onChange={e=>set(f.name, e.target.value)}>
                            <option value="">—</option>
                            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </SelectWrap>
                        ) : f.type === 'switch' ? (
                          <label className="switch-label" style={{marginTop:4}}>
                            <input type="checkbox" checked={row[f.name]??false} onChange={e=>set(f.name, e.target.checked)} />
                            <span>{row[f.name] ? 'Oui' : 'Non'}</span>
                          </label>
                        ) : (
                          <input type={f.type} className="input" value={row[f.name]||''} onChange={e=>set(f.name, e.target.value)} placeholder={f.placeholder} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-aside">
            <div className="card">
              <div className="card-head"><h3>Prix &amp; Stock</h3></div>
              <div className="card-body">
                <div className="field">
                  <label>Prix (XOF) <span style={{color:'#ef4444'}}>*</span></label>
                  <input type="number" step="0.01" className={`input${errors.price?' input-error':''}`} value={row.price||''} onChange={e=>set('price', e.target.value)} placeholder="0.00" />
                  {errors.price && <span style={{color:'#ef4444',fontSize:12}}>{errors.price}</span>}
                </div>
                <div className="field">
                  <label>Disponibilité</label>
                  <SelectWrap value={row.stock_status||'in_stock'} onChange={e=>set('stock_status', e.target.value)}>
                    {STOCK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </SelectWrap>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Image principale</h3></div>
              <div className="card-body">
                {(imageFile || row.image) && (
                  <img src={imageFile ? URL.createObjectURL(imageFile) : row.image} alt="" style={{width:'100%',borderRadius:8,marginBottom:10,objectFit:'cover',maxHeight:200}} />
                )}
                <UploadBtn label={imageFile ? imageFile.name : 'Choisir une image'} onChange={e=>setImageFile(e.target.files[0])} />
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Galerie</h3></div>
              <div className="card-body">
                <ExtraImgGrid images={row.extra_images} onDelete={async (imgId) => {
                  if (!confirm('Supprimer cette image ?')) return;
                  await window.API.deleteExtraImage(model, imgId);
                  set('extra_images', (row.extra_images||[]).filter(i => i.id !== imgId));
                }} />
                <UploadBtn label={`Ajouter des images${extraFiles.length ? ` (${extraFiles.length})` : ''}`} multiple onChange={e=>setExtraFiles([...e.target.files])} />
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <label className="switch-label">
                  <input type="checkbox" checked={row.active??true} onChange={e=>set('active', e.target.checked)} />
                  <span>Produit actif</span>
                </label>
                {(model === 'components' || model === 'products') && (
                  <label className="switch-label" style={{marginTop:12}}>
                    <input type="checkbox" checked={row.is_only_one??false} onChange={e=>set('is_only_one', e.target.checked)} />
                    <span>Only One PC</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// ── PrebuiltFormView ──────────────────────────────────────────────────────────
const PrebuiltFormView = ({ id, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [row, setRow] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = id ? await window.API.get('prebuilts', id) : {};
      setRow(data || {});
      setLoading(false);
    };
    init();
  }, [id]);

  const set = (k, v) => setRow(r => ({ ...r, [k]: v }));

  const onSave = async (e) => {
    e.preventDefault();
    if (!row.name?.trim()) { alert('Nom requis'); return; }
    if (!row.price && row.price !== 0) { alert('Prix requis'); return; }
    setSaving(true);
    try {
      const result = await window.API.saveForm('prebuilts', id, row, imageFile, extraFiles);
      if (result?.id) navigate({ screen: 'list', model: 'prebuilts' });
      else alert('Erreur:\n' + JSON.stringify(result));
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const TIERS = ['', 'Budget', 'Mid-Range', 'High-End', 'Flagship'];
  const SOCKETS = ['', 'AM5', 'AM4', 'LGA1700', 'LGA1200', 'LGA1151', 'TR5', 'TRX40'];
  const RAM_TYPES = ['', 'DDR5', 'DDR4', 'DDR3', 'LPDDR5', 'LPDDR4'];
  const STOR_TYPES = ['', 'NVMe', 'SATA', 'HDD', 'SATA M.2'];
  const EFFICIENCIES = ['', '80+ Titanium', '80+ Platinum', '80+ Gold', '80+ Silver', '80+ Bronze', '80+'];

  if (loading) return <Spinner />;

  const SField = ({ label, fname, placeholder }) => (
    <div className="field" style={{minWidth:'calc(50% - 8px)'}}>
      <label>{label}</label>
      <input className="input" value={row[fname]||''} onChange={e=>set(fname, e.target.value)} placeholder={placeholder} />
    </div>
  );
  const NField = ({ label, fname, placeholder, unit }) => (
    <div className="field" style={{minWidth:'calc(50% - 8px)'}}>
      <label>{label}{unit ? ` (${unit})` : ''}</label>
      <input type="number" className="input" value={row[fname]||''} onChange={e=>set(fname, e.target.value)} placeholder={placeholder} />
    </div>
  );
  const SelField = ({ label, fname, opts }) => (
    <div className="field" style={{minWidth:'calc(50% - 8px)'}}>
      <label>{label}</label>
      <SelectWrap value={row[fname]||''} onChange={e=>set(fname, e.target.value)}>
        {opts.map(o => <option key={o} value={o}>{o || '—'}</option>)}
      </SelectWrap>
    </div>
  );

  return (
    <div className="page">
      <form onSubmit={onSave}>
        <div className="page-head">
          <div><h1 className="page-title">{id ? 'Modifier Pre-built PC' : 'Nouveau Pre-built PC'}</h1></div>
          <div className="page-actions">
            <button type="button" className="btn" onClick={() => navigate({ screen: 'list', model: 'prebuilts' })}>
              <Icon name="arrowL" size={14} /> Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Icon name="check" size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-main">
            <div className="card">
              <div className="card-head"><h3>Identité</h3></div>
              <div className="card-body">
                <div className="field">
                  <label>Nom de la configuration *</label>
                  <input className="input" value={row.name||''} onChange={e=>set('name', e.target.value)} required placeholder="INSHOP GAMER PRO X…" />
                </div>
                <div className="form-row" style={{flexWrap:'wrap',gap:12}}>
                  <SField label="Marque" fname="brand" placeholder="INSHOP" />
                  <SelField label="Gamme (Tier)" fname="tier" opts={TIERS} />
                  <SField label="Badge" fname="badge" placeholder="Best Seller, Nouveau…" />
                  <SField label="Slogan" fname="tag_line" placeholder="Le meilleur rapport qualité-prix" />
                  <SField label="Performances gaming" fname="gaming_perf" placeholder="1440p Ultra" />
                  <SField label="Usage préconisé" fname="workflow" placeholder="Montage vidéo & streaming" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Composants</h3></div>
              <div className="card-body">
                <div className="form-row" style={{flexWrap:'wrap',gap:12}}>
                  <SField label="Processeur (CPU)" fname="cpu" placeholder="Ryzen 7 7700X" />
                  <SField label="Carte graphique (GPU)" fname="gpu" placeholder="RTX 4070 Super" />
                  <SField label="RAM" fname="ram" placeholder="32GB DDR5 6000MHz" />
                  <SField label="Stockage" fname="storage" placeholder="1TB NVMe SSD" />
                  <SField label="Alimentation (PSU)" fname="psu" placeholder="750W 80+ Gold" />
                  <SField label="Boîtier" fname="case_name" placeholder="Fractal North" />
                  <SField label="Refroidissement" fname="cooling" placeholder="Noctua NH-D15" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Spécifications techniques</h3></div>
              <div className="card-body">
                <div className="form-row" style={{flexWrap:'wrap',gap:12}}>
                  <SelField label="Socket CPU" fname="tech_cpu_socket" opts={SOCKETS} />
                  <SelField label="Type RAM" fname="tech_ram_type" opts={RAM_TYPES} />
                  <SField label="Capacité RAM" fname="tech_ram_capacity" placeholder="32GB (2×16GB)" />
                  <NField label="Vitesse RAM" fname="tech_ram_speed" placeholder="6000" unit="MHz" />
                  <SelField label="Type stockage" fname="tech_storage_type" opts={STOR_TYPES} />
                  <SField label="Capacité stockage" fname="tech_storage_capacity" placeholder="1TB NVMe" />
                  <SField label="VRAM GPU" fname="tech_gpu_vram" placeholder="12GB GDDR6X" />
                  <NField label="Puissance PSU" fname="tech_psu_wattage" placeholder="750" unit="W" />
                  <SelField label="Certification PSU" fname="tech_psu_efficiency" opts={EFFICIENCIES} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-aside">
            <div className="card">
              <div className="card-head"><h3>Prix &amp; Stock</h3></div>
              <div className="card-body">
                <div className="field">
                  <label>Prix (XOF) *</label>
                  <input type="number" step="0.01" className="input" value={row.price||''} onChange={e=>set('price', e.target.value)} required placeholder="0.00" />
                </div>
                <div className="field">
                  <label>Disponibilité</label>
                  <SelectWrap value={row.stock_status||'in_stock'} onChange={e=>set('stock_status', e.target.value)}>
                    {STOCK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </SelectWrap>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Image</h3></div>
              <div className="card-body">
                {(imageFile || row.image) && (
                  <img src={imageFile ? URL.createObjectURL(imageFile) : row.image} alt="" style={{width:'100%',borderRadius:8,marginBottom:10,objectFit:'cover',maxHeight:200}} />
                )}
                <UploadBtn label={imageFile ? imageFile.name : 'Choisir une image'} onChange={e=>setImageFile(e.target.files[0])} />
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Galerie</h3></div>
              <div className="card-body">
                <ExtraImgGrid images={row.extra_images} onDelete={async (imgId) => {
                  if (!confirm('Supprimer cette image ?')) return;
                  await window.API.deleteExtraImage('prebuilts', imgId);
                  set('extra_images', (row.extra_images||[]).filter(i => i.id !== imgId));
                }} />
                <UploadBtn label={`Ajouter des images${extraFiles.length ? ` (${extraFiles.length})` : ''}`} multiple onChange={e=>setExtraFiles([...e.target.files])} />
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <label className="switch-label">
                  <input type="checkbox" checked={row.active??true} onChange={e=>set('active', e.target.checked)} />
                  <span>Actif</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// ── OnlyOneFormView ───────────────────────────────────────────────────────────
const OnlyOneFormView = ({ id, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [row, setRow] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = id ? await window.API.get('onlyone', id) : {};
      setRow(data || {});
      setLoading(false);
    };
    init();
  }, [id]);

  const set = (k, v) => setRow(r => ({ ...r, [k]: v }));

  const onSave = async (e) => {
    e.preventDefault();
    if (!row.name?.trim()) { alert('Nom requis'); return; }
    if (!row.price && row.price !== 0) { alert('Prix requis'); return; }
    setSaving(true);
    try {
      const result = await window.API.saveForm('onlyone', id, row, imageFile, extraFiles);
      if (result?.id) navigate({ screen: 'list', model: 'onlyone' });
      else alert('Erreur:\n' + JSON.stringify(result));
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const SOCKETS = ['', 'AM5', 'AM4', 'LGA1700', 'LGA1200', 'LGA1151', 'TR5', 'TRX40'];
  const RAM_TYPES = ['', 'DDR5', 'DDR4', 'DDR3', 'LPDDR5', 'LPDDR4'];
  const STOR_TYPES = ['', 'NVMe', 'SATA', 'HDD', 'SATA M.2'];
  const EFFICIENCIES = ['', '80+ Titanium', '80+ Platinum', '80+ Gold', '80+ Silver', '80+ Bronze', '80+'];

  if (loading) return <Spinner />;

  const SField = ({ label, fname, placeholder }) => (
    <div className="field" style={{minWidth:'calc(50% - 8px)'}}>
      <label>{label}</label>
      <input className="input" value={row[fname]||''} onChange={e=>set(fname, e.target.value)} placeholder={placeholder} />
    </div>
  );
  const NField = ({ label, fname, placeholder, unit }) => (
    <div className="field" style={{minWidth:'calc(50% - 8px)'}}>
      <label>{label}{unit ? ` (${unit})` : ''}</label>
      <input type="number" className="input" value={row[fname]||''} onChange={e=>set(fname, e.target.value)} placeholder={placeholder} />
    </div>
  );
  const SelField = ({ label, fname, opts }) => (
    <div className="field" style={{minWidth:'calc(50% - 8px)'}}>
      <label>{label}</label>
      <SelectWrap value={row[fname]||''} onChange={e=>set(fname, e.target.value)}>
        {opts.map(o => <option key={o} value={o}>{o || '—'}</option>)}
      </SelectWrap>
    </div>
  );

  return (
    <div className="page">
      <form onSubmit={onSave}>
        <div className="page-head">
          <div><h1 className="page-title">{id ? 'Modifier Only One PC' : 'Nouveau Only One PC'}</h1></div>
          <div className="page-actions">
            <button type="button" className="btn" onClick={() => navigate({ screen: 'list', model: 'onlyone' })}>
              <Icon name="arrowL" size={14} /> Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Icon name="check" size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-main">
            <div className="card">
              <div className="card-head"><h3>Identité</h3></div>
              <div className="card-body">
                <div className="field">
                  <label>Nom de l'offre *</label>
                  <input className="input" value={row.name||''} onChange={e=>set('name', e.target.value)} required placeholder="THE BEAST — Pièce unique…" />
                </div>
                <div className="form-row" style={{flexWrap:'wrap',gap:12}}>
                  <SField label="Badge" fname="badge" placeholder="EXCLUSIF, Édition limitée…" />
                  <SField label="Slogan" fname="tag_line" placeholder="La configuration ultime" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Composants</h3></div>
              <div className="card-body">
                <div className="form-row" style={{flexWrap:'wrap',gap:12}}>
                  <SField label="Processeur (CPU)" fname="cpu" placeholder="Ryzen 9 7950X" />
                  <SField label="Carte graphique (GPU)" fname="gpu" placeholder="RTX 4090" />
                  <SField label="RAM" fname="ram" placeholder="64GB DDR5 6000MHz" />
                  <SField label="Stockage" fname="storage" placeholder="2TB NVMe SSD" />
                  <SField label="Alimentation (PSU)" fname="psu" placeholder="1000W 80+ Titanium" />
                  <SField label="Boîtier" fname="case_name" placeholder="Lian Li O11D EVO" />
                  <SField label="Refroidissement" fname="cooling" placeholder="Custom Loop 360mm" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Spécifications techniques</h3></div>
              <div className="card-body">
                <div className="form-row" style={{flexWrap:'wrap',gap:12}}>
                  <SelField label="Socket CPU" fname="tech_cpu_socket" opts={SOCKETS} />
                  <SelField label="Type RAM" fname="tech_ram_type" opts={RAM_TYPES} />
                  <SField label="Capacité RAM" fname="tech_ram_capacity" placeholder="64GB (4×16GB)" />
                  <NField label="Vitesse RAM" fname="tech_ram_speed" placeholder="6000" unit="MHz" />
                  <SelField label="Type stockage" fname="tech_storage_type" opts={STOR_TYPES} />
                  <SField label="Capacité stockage" fname="tech_storage_capacity" placeholder="2TB NVMe" />
                  <SField label="VRAM GPU" fname="tech_gpu_vram" placeholder="24GB GDDR6X" />
                  <NField label="Puissance PSU" fname="tech_psu_wattage" placeholder="1000" unit="W" />
                  <SelField label="Certification PSU" fname="tech_psu_efficiency" opts={EFFICIENCIES} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-aside">
            <div className="card">
              <div className="card-head"><h3>Prix &amp; Dispo</h3></div>
              <div className="card-body">
                <div className="field">
                  <label>Prix (XOF) *</label>
                  <input type="number" step="0.01" className="input" value={row.price||''} onChange={e=>set('price', e.target.value)} required placeholder="0.00" />
                </div>
                <div className="field">
                  <label>Disponibilité</label>
                  <SelectWrap value={row.stock_status||'in_stock'} onChange={e=>set('stock_status', e.target.value)}>
                    {[
                      { value: 'in_stock',     label: 'Disponible' },
                      { value: 'low_stock',    label: 'Dernier exemplaire' },
                      { value: 'out_of_stock', label: 'Vendu' },
                    ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </SelectWrap>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Image</h3></div>
              <div className="card-body">
                {(imageFile || row.image) && (
                  <img src={imageFile ? URL.createObjectURL(imageFile) : row.image} alt="" style={{width:'100%',borderRadius:8,marginBottom:10,objectFit:'cover',maxHeight:200}} />
                )}
                <UploadBtn label={imageFile ? imageFile.name : 'Choisir une image'} onChange={e=>setImageFile(e.target.files[0])} />
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Galerie</h3></div>
              <div className="card-body">
                <ExtraImgGrid images={row.extra_images} onDelete={async (imgId) => {
                  if (!confirm('Supprimer cette image ?')) return;
                  await window.API.deleteExtraImage('onlyone', imgId);
                  set('extra_images', (row.extra_images||[]).filter(i => i.id !== imgId));
                }} />
                <UploadBtn label={`Ajouter des images${extraFiles.length ? ` (${extraFiles.length})` : ''}`} multiple onChange={e=>setExtraFiles([...e.target.files])} />
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <label className="switch-label">
                  <input type="checkbox" checked={row.active??true} onChange={e=>set('active', e.target.checked)} />
                  <span>Actif</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// ── FormView — routeur principal ──────────────────────────────────────────────
const FormView = ({ route, navigate }) => {
  if (route.model === 'components' || route.model === 'laptops' ||
      route.model === 'peripherals' || route.model === 'products') {
    return <ProductFormView id={route.id} model={route.model} navigate={navigate} />;
  }
  if (route.model === 'prebuilts') return <PrebuiltFormView id={route.id} navigate={navigate} />;
  if (route.model === 'onlyone')   return <OnlyOneFormView  id={route.id} navigate={navigate} />;

  // Generic form for categories, orders, reviews, contacts, users, siteconfig
  const def = FORM_DEF[route.model];
  if (!def) return <div className="page"><div className="empty">Modèle non géré : {route.model}</div></div>;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [row, setRow] = useState({});

  useEffect(() => {
    if (route.id) {
      setLoading(true);
      window.API.get(route.model, route.id).then(d => { setRow(d || {}); setLoading(false); });
    }
  }, [route.id, route.model]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await window.API.save(route.model, route.id, row);
      navigate({ screen: 'list', model: route.model });
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <form onSubmit={onSave}>
        <div className="page-head">
          <div><h1 className="page-title">{route.id ? `Modifier ${def.title}` : `Nouveau ${def.title}`}</h1></div>
          <div className="page-actions">
            <button type="button" className="btn" onClick={() => navigate({ screen: 'list', model: route.model })}>
              <Icon name="arrowL" size={14} /> Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Icon name="check" size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
        <div className="form-main" style={{maxWidth:780, margin:'0 auto'}}>
          {def.sections.map((s, si) => (
            <div className="card" key={si}>
              <div className="card-head"><h3>{s.title}</h3></div>
              <div className="card-body">
                {s.fields.map(f => (
                  <div className="field" key={f.name}>
                    <label>{f.label}{f.required ? <span style={{color:'#ef4444'}}> *</span> : null}</label>
                    {f.type === 'select' ? (
                      <SelectWrap value={row[f.name]??f.default??''} onChange={e=>setRow({...row,[f.name]:e.target.value})}>
                        <option value="">—</option>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </SelectWrap>
                    ) : f.type === 'switch' ? (
                      <label className="switch-label">
                        <input type="checkbox" checked={row[f.name]??f.default??false} onChange={e=>setRow({...row,[f.name]:e.target.checked})} />
                        <span>{row[f.name] ? 'Oui' : 'Non'}</span>
                      </label>
                    ) : f.type === 'textarea' ? (
                      <textarea className="input" rows={4} value={row[f.name]||''} onChange={e=>setRow({...row,[f.name]:e.target.value})} required={f.required} />
                    ) : (
                      <input type={f.type||'text'} className="input" value={row[f.name]||''} onChange={e=>setRow({...row,[f.name]:e.target.value})} required={f.required} placeholder={f.placeholder} style={f.mono?{fontFamily:'var(--font-mono)'}:{}} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

// ── DetailView ────────────────────────────────────────────────────────────────
const DetailView = ({ route, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState(null);
  const [tab, setTab] = useState('overview');
  const def = FORM_DEF[route.model];

  const load = async () => {
    setLoading(true);
    try { setRow(await window.API.get(route.model, route.id)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [route.id, route.model]);

  if (loading && !row) return <Spinner />;
  if (!row) return <div className="page"><div className="empty">Élément introuvable</div></div>;

  const title = row.name || row.shipping_name || row.username || row.subject || row.product_name || `#${row.id}`;

  const displayVal = (k, v) => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'boolean') return <Pill tone={v ? 'ok' : 'neutral'}>{v ? 'Oui' : 'Non'}</Pill>;
    if (Array.isArray(v)) {
      if (!v.length) return '(vide)';
      if (typeof v[0] === 'object') return null;
      return v.join(', ');
    }
    if (typeof v === 'object') return null;
    if (typeof v === 'string' && (k.endsWith('_at') || k === 'date' || k === 'date_joined' || k === 'last_login')) {
      const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleString('fr-FR');
    }
    if (k === 'price' || k === 'total') return <strong>{Number(v).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })}</strong>;
    return String(v);
  };

  return (
    <div className="page">
      <div className="detail-hero">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,color:'var(--muted)',fontSize:12,marginBottom:8}}>
              <Icon name={def?.icon||'dot'} size={13} /><span>{def?.title||route.model}</span><span>·</span><span className="mono">{row.id}</span>
            </div>
            <h1 style={{margin:0}}>{title}</h1>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn" onClick={() => navigate({ screen: 'list', model: route.model })}><Icon name="arrowL" size={14} /> Retour</button>
            <button className="btn btn-primary" onClick={() => navigate({ screen: 'edit', model: route.model, id: route.id })}><Icon name="pencil" size={14} /> Modifier</button>
          </div>
        </div>
      </div>

      <div className="detail-tabs">
        <button className="tab" data-active={tab==='overview'} onClick={() => setTab('overview')}>Aperçu</button>
        <button className="tab" data-active={tab==='json'} onClick={() => setTab('json')}>JSON brut</button>
      </div>

      <div className="form-grid">
        <div className="form-main">
          <div className="card">
            <div className="card-body">
              {tab === 'overview' ? (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:20}}>
                  {Object.entries(row).map(([k, v]) => {
                    const val = displayVal(k, v);
                    if (val === null || ['image','extra_images','password','items','specs'].includes(k)) return null;
                    return (
                      <div key={k} className="kv">
                        <span style={{textTransform:'capitalize',opacity:0.6,fontSize:11,fontWeight:600,letterSpacing:'0.03em'}}>{k.replace(/_/g,' ')}</span>
                        <span style={{wordBreak:'break-word'}}>{val}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <pre style={{padding:18,margin:0,fontFamily:'var(--font-mono)',fontSize:12,lineHeight:1.7,overflow:'auto'}}>{JSON.stringify(row, null, 2)}</pre>
              )}
            </div>
          </div>

          {route.model === 'orders' && Array.isArray(row.items) && row.items.length > 0 && (
            <div className="card">
              <div className="card-head"><h3>Articles</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr>
                    <th>Article</th>
                    <th style={{textAlign:'right'}}>Qté</th>
                    <th style={{textAlign:'right'}}>Prix unit.</th>
                    <th style={{textAlign:'right'}}>Total</th>
                  </tr></thead>
                  <tbody>
                    {row.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{fontWeight:500}}>{item.product_name || item.name || '—'}</td>
                        <td style={{textAlign:'right'}}>× {item.qty ?? item.quantity}</td>
                        <td style={{textAlign:'right'}}>{Number(item.price ?? item.price_unit ?? 0).toLocaleString('fr-FR',{style:'currency',currency:'XOF',maximumFractionDigits:0})}</td>
                        <td style={{textAlign:'right',fontWeight:600}}>{Number(item.subtotal ?? (item.qty * item.price) ?? 0).toLocaleString('fr-FR',{style:'currency',currency:'XOF',maximumFractionDigits:0})}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{textAlign:'right',fontWeight:600,color:'var(--muted)',padding:'10px 16px'}}>TOTAL</td>
                      <td style={{textAlign:'right',fontWeight:700,fontSize:16,color:'var(--accent)',padding:'10px 16px'}}>{Number(row.total||0).toLocaleString('fr-FR',{style:'currency',currency:'XOF',maximumFractionDigits:0})}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="form-aside">
          {row.image && (
            <div className="card">
              <div className="card-body" style={{padding:0}}>
                <img src={row.image} alt="" style={{width:'100%',borderRadius:12,display:'block'}} />
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-head"><h3>Actions</h3></div>
            <div className="card-body">
              {route.model === 'orders' && (
                <div style={{marginBottom:16}}>
                  <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginBottom:10}}
                    onClick={async () => {
                      if (row.delivery_status === 'delivered') { alert('Commande déjà livrée'); return; }
                      if (!confirm('Passer à l\'étape suivante ?')) return;
                      const ok = await window.API.advanceDelivery(row.id);
                      if (ok) load(); else alert('Erreur lors du changement d\'état');
                    }}>
                    <Icon name="truck" size={15} /> Avancer la livraison
                  </button>
                  <div className="kv"><span>État commande</span><Pill tone={row.state==='sale'?'ok':'neutral'}>{row.state}</Pill></div>
                  <div className="kv" style={{marginTop:6}}>
                    <span>Livraison</span>
                    <Pill tone={row.delivery_status==='delivered'?'ok':row.delivery_status==='shipped'?'info':'neutral'}>
                      {{'processing':'En traitement','preparing':'En préparation','shipped':'Expédiée','delivered':'Livrée'}[row.delivery_status]||row.delivery_status}
                    </Pill>
                  </div>
                </div>
              )}
              <div className="kv"><span>Créé le</span><span>{new Date(row.created_at||row.date_joined||row.date||Date.now()).toLocaleDateString('fr-FR')}</span></div>
              <button className="btn btn-danger" style={{width:'100%',marginTop:16,justifyContent:'center'}}
                onClick={async () => {
                  if (!confirm('Supprimer définitivement ?')) return;
                  const ok = await window.API.delete(route.model, row.id);
                  if (ok) navigate({ screen: 'list', model: route.model });
                }}>
                <Icon name="trash" size={14} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.FormView = FormView;
window.DetailView = DetailView;
