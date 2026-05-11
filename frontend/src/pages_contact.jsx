import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// pages_contact.jsx — Contact page with Leaflet + CartoDB Dark map
// Coordinates come from Odoo config (map_lat / map_lng).
// If not set, Nominatim geocodes the address automatically.

// ── Map widget ────────────────────────────────────────────────────────────────
const ContactMap = ({ lat, lng, label }) => {
  const containerRef = React.useRef(null);
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    if (!lat || !lng || !containerRef.current) return;

    // Destroy previous instance (hot-reload / coord change)
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    // CartoDB Dark Matter tiles — natively dark, no CSS hack
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#666">OpenStreetMap</a>' +
          ' &copy; <a href="https://carto.com/attributions" style="color:#666">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    // Custom SVG pin — brand color #e8001d
    const pinIcon = L.divIcon({
      html: `
        <svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 24 14 24S28 24.5 28 14C28 6.27 21.73 0 14 0z"
            fill="#e8001d" stroke="#fff" stroke-width="1.5"/>
          <circle cx="14" cy="14" r="5" fill="#fff"/>
        </svg>`,
      iconSize: [28, 38],
      iconAnchor: [14, 38],
      popupAnchor: [0, -40],
      className: "",
    });

    L.marker([lat, lng], { icon: pinIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:'Space Grotesk',sans-serif;font-size:13px;color:#fff;
          background:#1e1e1e;padding:8px 12px;border-radius:6px;min-width:160px;">
          <strong style="color:#e8001d;">INSHOP BUILDER</strong><br/>
          <span style="color:#aaa;">${label || ""}</span>
        </div>`,
        { className: "inshop-popup" }
      )
      .openPopup();

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", background: "#0d1117" }}
    />
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
const ContactPage = () => {
  const { dataLoaded } = React.useContext(window.AppContext);
  const config = window.SITE_CONFIG || {};

  const [formSent, setFormSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "Assistance Technique",
    message: "",
  });

  // Resolved map coordinates
  const [mapCoords, setMapCoords] = React.useState(null);

  React.useEffect(() => {
    const lat = config.lat ? parseFloat(config.lat) : 0;
    const lng = config.lng ? parseFloat(config.lng) : 0;

    // Admin set explicit coordinates → use directly
    if (lat && lng) {
      setMapCoords({ lat, lng });
      return;
    }

    // Fallback: geocode the address via Nominatim
    const address = config.address || "Dakar, Sénégal";
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { "Accept-Language": "fr" } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data && data[0]) {
          setMapCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        }
      })
      .catch(() => {});
  }, [dataLoaded, config.lat, config.lng, config.address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await window.PcApi.submitContact(formData);
      if (res.ok) setFormSent(true);
    } catch {
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormSent(false);
    setFormData({ name: "", email: "", subject: "Assistance Technique", message: "" });
  };

  const infoCards = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: "ADRESSE",
      value: config.address || "Dakar, Sénégal",
      sub: config.opening_hours || "Lun–Ven : 9h–19h · Sam : 10h–17h",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
        </svg>
      ),
      label: "EMAIL",
      value: config.email || "experts@inshopbuilder.com",
      sub: "Réponse sous 24h ouvrées",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      label: "TÉLÉPHONE",
      value: config.phone || "+221 00 000 00 00",
      sub: "Lun–Ven · 09h – 19h",
    },
  ];

  return (
    <div style={S.page}>
      {/* ── Hero ── */}
      <div style={S.heroBanner} className="rsp-banner">
        <video autoPlay loop muted playsInline style={S.heroBannerImg}>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div style={S.heroBannerGrid} />
        <div style={S.heroBannerGlow} />
        <div style={S.heroBannerOverlay} />
        <div style={S.heroBannerContent} className="rsp-banner-content">
          <div style={S.heroEye}>CONTACTEZ-NOUS</div>
          <h1 style={S.heroTitle}>Parlons Hardware.</h1>
          <p style={S.heroSub}>
            Besoin d'une configuration extrême ou d'un conseil d'expert ?<br />
            Notre équipe est prête à concevoir votre prochain setup.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={S.container} className="rsp-container">
        <div style={S.grid}>

          {/* Left — info */}
          <div style={S.leftCol}>
            <h2 style={S.colTitle}>Nos Coordonnées</h2>
            <div style={S.titleBar} />
            <div style={S.cards}>
              {infoCards.map((c, i) => (
                <div key={i} style={S.card}>
                  <div style={S.cardIcon}>{c.icon}</div>
                  <div>
                    <div style={S.cardLabel}>{c.label}</div>
                    <div style={S.cardValue}>{c.value}</div>
                    <div style={S.cardSub}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={S.formBox}>
            <div style={S.formHeader}>
              <div style={S.formEye}>Envoyez un message</div>
              <p style={S.formIntro}>
                Complétez le formulaire et l'un de nos builders vous répondra rapidement.
              </p>
            </div>

            {formSent ? (
              <div style={S.sentView}>
                <div style={S.sentCheck}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8001d" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ color: "#fff", margin: "0 0 8px" }}>Message transmis !</h3>
                <p style={{ color: "#9f9f9f", fontSize: 14 }}>
                  Votre demande a été enregistrée. Nos experts vous recontactent sous peu.
                </p>
                <button onClick={resetForm} style={S.resendBtn}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={S.form}>
                <div style={S.formRow}>
                  <div style={S.formGroup}>
                    <label style={S.label}>NOM COMPLET</label>
                    <input name="name" value={formData.name} onChange={handleChange}
                      required style={S.input} placeholder="Jean Dupont" />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>EMAIL</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      required style={S.input} placeholder="jean@exemple.com" />
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>SUJET</label>
                  <div style={{ position: "relative" }}>
                    <select name="subject" value={formData.subject} onChange={handleChange}
                      required style={S.select}>
                      <option>Assistance Technique</option>
                      <option>Ventes &amp; Devis</option>
                      <option>Partenariat</option>
                      <option>Autre demande</option>
                    </select>
                    <span style={S.selectArrow}>▾</span>
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>MESSAGE</label>
                  <textarea name="message" value={formData.message} onChange={handleChange}
                    required style={S.textarea}
                    placeholder="Détaillez votre projet ou votre question ici…" />
                </div>

                <div style={S.checkRow}>
                  <input type="checkbox" id="consent" required style={{ accentColor: "#e8001d", marginTop: 3 }} />
                  <label htmlFor="consent" style={S.checkLabel}>
                    J'accepte que mes données soient traitées pour répondre à ma demande.
                  </label>
                </div>

                <button type="submit" style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? "ENVOI EN COURS…" : "TRANSMETTRE MA DEMANDE"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Map ── */}
        <div style={S.mapSection}>
          <h2 style={S.colTitle}>Retrouvez-nous en magasin</h2>
          <div style={S.titleBar} />
          <div style={S.mapWrapper}>
            {mapCoords ? (
              <ContactMap
                lat={mapCoords.lat}
                lng={mapCoords.lng}
                label={config.address || ""}
              />
            ) : (
              <div style={S.mapLoading}>
                <p style={{ color: "#555", fontFamily: "'Space Grotesk',sans-serif" }}>
                  Chargement de la carte…
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup CSS override — dark background */}
      <style>{`
        .inshop-popup .leaflet-popup-content-wrapper {
          background: #1e1e1e;
          border: 1px solid #3c3c3c;
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .inshop-popup .leaflet-popup-content { margin: 0; }
        .inshop-popup .leaflet-popup-tip { background: #1e1e1e; }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution a { color: #555 !important; }
        .leaflet-control-attribution { background: rgba(0,0,0,0.5) !important; color: #555 !important; }
      `}</style>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    background: "#0d0d0d",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "'Space Grotesk', sans-serif",
    paddingBottom: 100,
  },

  // Hero — video banner (same pattern as other pages)
  heroBanner: { position: "relative", height: 360, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", background: "#111" },
  heroBannerImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%", opacity: 0.4 },
  heroBannerGrid: {
    position: "absolute", inset: 0, opacity: 1, zIndex: 1,
    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px)",
  },
  heroBannerGlow: {
    position: "absolute", top: "20%", left: "10%", width: 600, height: 600, zIndex: 1,
    background: "radial-gradient(ellipse at 40% 50%, rgba(232,0,29,0.15) 0%, transparent 65%)",
    pointerEvents: "none",
  },
  heroBannerOverlay: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8) 100%)", zIndex: 1 },
  heroBannerContent: { position: "relative", zIndex: 2, width: "100%", padding: "0 80px" },
  heroEye: { color: "#e8001d", fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", marginBottom: 12 },
  heroTitle: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 48, color: "#fff", margin: "0 0 12px", lineHeight: 1.1 },
  heroSub: { fontSize: 16, color: "#9f9f9f", lineHeight: 1.7, margin: 0 },

  // Layout
  container: { padding: "60px 80px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 64, alignItems: "start", marginBottom: 80 },

  // Left
  leftCol: {},
  colTitle: { fontSize: 28, fontWeight: 800, margin: "0 0 12px" },
  titleBar: { width: 48, height: 3, background: "#e8001d", marginBottom: 40 },
  cards: { display: "flex", flexDirection: "column", gap: 16 },
  card: {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: "20px 24px",
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
    transition: "border-color 0.2s",
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 10,
    background: "rgba(232,0,29,0.1)",
    border: "1px solid rgba(232,0,29,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#e8001d", flexShrink: 0,
  },
  cardLabel: { fontSize: 10, fontWeight: 700, color: "#e8001d", letterSpacing: "0.15em", marginBottom: 4 },
  cardValue: { fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 3 },
  cardSub: { fontSize: 12, color: "#666" },

  // Form
  formBox: {
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 20,
    padding: "48px 56px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
  },
  formHeader: { marginBottom: 40 },
  formEye: { fontSize: 11, fontWeight: 700, color: "#e8001d", letterSpacing: "0.2em", marginBottom: 10 },
  formIntro: { fontSize: 14, color: "#666", lineHeight: 1.6, margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: 28 },
  formRow: { display: "flex", gap: 20 },
  formGroup: { display: "flex", flexDirection: "column", gap: 10, flex: 1 },
  label: { fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.12em" },
  input: {
    background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8,
    padding: "14px 16px", color: "#fff", fontSize: 14, outline: "none",
    transition: "border-color 0.2s", fontFamily: "inherit",
  },
  select: {
    width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a",
    borderRadius: 8, padding: "14px 40px 14px 16px", color: "#fff",
    fontSize: 14, appearance: "none", outline: "none", fontFamily: "inherit",
  },
  selectArrow: {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
    fontSize: 11, color: "#555", pointerEvents: "none",
  },
  textarea: {
    background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8,
    padding: "14px 16px", color: "#fff", fontSize: 14, minHeight: 160,
    resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.6,
  },
  checkRow: { display: "flex", gap: 12, alignItems: "flex-start" },
  checkLabel: { fontSize: 12, color: "#666", lineHeight: 1.5 },
  submitBtn: {
    padding: "18px", borderRadius: 8, border: "none",
    background: "#e8001d", color: "#fff", fontSize: 13, fontWeight: 700,
    cursor: "pointer", letterSpacing: "0.06em", fontFamily: "inherit",
    transition: "opacity 0.2s, transform 0.1s",
  },

  // Sent state
  sentView: { textAlign: "center", padding: "32px 0" },
  sentCheck: {
    width: 60, height: 60, borderRadius: "50%",
    background: "rgba(232,0,29,0.1)", border: "1px solid rgba(232,0,29,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 24px",
  },
  resendBtn: {
    marginTop: 24, background: "none", border: "1px solid #2a2a2a",
    color: "#666", padding: "10px 24px", borderRadius: 6,
    cursor: "pointer", fontFamily: "inherit", fontSize: 13,
    transition: "border-color 0.2s, color 0.2s",
  },

  // Map
  mapSection: {},
  mapWrapper: {
    height: 520, borderRadius: 16, overflow: "hidden",
    border: "1px solid #2a2a2a",
    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
  },
  mapLoading: {
    height: "100%", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#0d1117",
  },
};

Object.assign(window, { ContactPage });
