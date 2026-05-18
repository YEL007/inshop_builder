// Icons and small UI bits for INSHOP admin
const Icon = ({ name, size = 16, stroke = 1.6 }) => {
  const paths = {
    home: <><path d="M3 11L12 3l9 8"/><path d="M5 10v10h14V10"/></>,
    tag: <><path d="M3 12V4h8l9 9-8 8-9-9z"/><circle cx="7.5" cy="7.5" r="1.2"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 7l9 6 9-6"/></>,
    gem: <><path d="M6 3h12l3 6-9 12L3 9z"/><path d="M6 3l3 6h6l3-6M3 9h18"/></>,
    cart: <><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.4 11.2A2 2 0 009.4 17H17l2-9H6"/></>,
    box: <><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></>,
    cube: <><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></>,
    star: <><path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 17.9 6.1 21l1.2-6.6L2.5 9.9 9.1 9z"/></>,
    gear: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
    shield: <><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    pencil: <><path d="M4 20h4L20 8l-4-4L4 16z"/><path d="M14 6l4 4"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    arrow: <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    arrowL: <><path d="M19 12H5M11 19l-7-7 7-7"/></>,
    chev: <><path d="M9 6l6 6-6 6"/></>,
    chevD: <><path d="M6 9l6 6 6-6"/></>,
    check: <><path d="M5 12l5 5L20 7"/></>,
    x: <><path d="M6 6l12 12M18 6L6 18"/></>,
    dot: <><circle cx="12" cy="12" r="4"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    bell: <><path d="M18 16V11a6 6 0 10-12 0v5l-2 3h16z"/><path d="M10 20a2 2 0 004 0"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon: <><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></>,
    filter: <><path d="M3 5h18M6 12h12M10 19h4"/></>,
    download: <><path d="M12 4v12M6 12l6 6 6-6M4 20h16"/></>,
    cpu: <><rect x="6" y="6" width="12" height="12" rx="1"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></>,
    gpu: <><rect x="2" y="8" width="20" height="9" rx="1"/><circle cx="8" cy="13" r="2"/><circle cx="16" cy="13" r="2"/></>,
    memory: <><rect x="3" y="7" width="18" height="10" rx="1"/><path d="M7 7v10M11 7v10M15 7v10"/></>,
    ssd: <><rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="17" cy="15" r="1.2"/><path d="M7 9h6"/></>,
    board: <><rect x="3" y="3" width="18" height="18" rx="1"/><rect x="7" y="7" width="6" height="6"/><circle cx="17" cy="8" r="1"/><circle cx="17" cy="14" r="1"/><path d="M7 17h10"/></>,
    psu: <><rect x="3" y="6" width="18" height="12" rx="1"/><circle cx="9" cy="12" r="2.5"/><path d="M16 10h3M16 14h3"/></>,
    case: <><rect x="6" y="3" width="12" height="18" rx="1"/><circle cx="12" cy="8" r="1.2"/><path d="M9 13h6M9 16h6"/></>,
    fan: <><circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 2-6 4-6 0 4-2 6-4 6zM12 14c0 4-2 6-4 6 0-4 2-6 4-6zM14 12c4 0 6 2 6 4-4 0-6-2-6-4zM10 12c-4 0-6-2-6-4 4 0 6 2 6 4z"/></>,
    monitor: <><rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/></>,
    keyboard: <><rect x="3" y="6" width="18" height="12" rx="1"/><path d="M7 14h10M7 10h.01M11 10h.01M15 10h.01"/></>,
    mouse: <><rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 7v4"/></>,
    head: <><path d="M4 14a8 8 0 0116 0v4a2 2 0 01-2 2h-2v-7h4M4 14v4a2 2 0 002 2h2v-7H4"/></>,
    laptop: <><rect x="4" y="5" width="16" height="10" rx="1"/><path d="M2 19h20"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>,
    activity: <><path d="M3 12h4l3-9 4 18 3-9h4"/></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6"/><path d="M5 7l1 13a2 2 0 002 2h8a2 2 0 002-2l1-13M9 7V4h6v3"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></>,
    moon: <path d="M12 3a6 6 0 009 9 9 9 0 11-9-9z"/>,
    refresh: <path d="M21 12a9 9 0 11-9-9c2.5 0 4.7 1 6.3 2.7L21 8m0-5v5h-5"/>,
    bell: <><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 003.4 0"/></>,
    check: <path d="M20 6 9 17l-5-5"/>,
    x: <path d="M18 6 6 18M6 6l12 12"/>,
    dot: <circle cx="12" cy="12" r="1"/>,
    eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    grid: <><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></>,
    truck: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  };
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={stroke} 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={`feather feather-${name}`}
    >
      {paths[name] || paths.dot}
    </svg>
  );
};
window.Icon = Icon;

// Compact toast / pill
const Pill = ({ tone = 'neutral', children }) => (
  <span className={`pill pill-${tone}`}>{children}</span>
);
window.Pill = Pill;

// Stars renderer for reviews
const Stars = ({ rating }) => (
  <div className="stars">
    {[...Array(5)].map((_, i) => (
      <Icon key={i} name="gem" size={12} stroke={i < rating ? 2 : 1} style={{ opacity: i < rating ? 1 : 0.2 }} />
    ))}
  </div>
);
window.Stars = Stars;

// Relative time — accepts Date objects or ISO strings
const rel = (d) => {
  if (!d) return '—';
  const diff = (new Date() - new Date(d)) / 1000 / 60;
  if (diff < 1) return 'à l\'instant';
  if (diff < 60) return `il y a ${Math.round(diff)} min`;
  if (diff < 60 * 24) return `il y a ${Math.round(diff / 60)} h`;
  if (diff < 60 * 24 * 30) return `il y a ${Math.round(diff / 60 / 24)} j`;
  return `il y a ${Math.round(diff / 60 / 24 / 30)} mois`;
};
window.rel = rel;

Object.assign(window, { Icon, Pill, Stars, rel });
