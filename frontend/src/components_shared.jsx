import React from "react";

export const ProductVisual = ({ category, brand, imageUrl }) => {
  const getCategoryImage = (cat) => {
    switch (cat) {
      case 'cpu': return '/categories/cpu.png';
      case 'gpu': return '/categories/gpu.png';
      case 'motherboard': return '/categories/motherboard.png';
      case 'ram': return '/categories/ram.png';
      case 'storage': return '/categories/storage.png';
      case 'psu': return '/categories/psu.png';
      case 'cooling': return '/categories/cooling.png';
      case 'case': return '/categories/case.png';
      case 'mouse': return '/categories/mouse.png';
      case 'keyboard': return '/categories/keyboard.png';
      case 'headset': return '/categories/headset.png';
      case 'monitor': return '/categories/monitor.png';
      case 'laptop': return '/categories/laptop.png';
      default: return null;
    }
  };

  let finalUrl = imageUrl || getCategoryImage(category);
  // Handle relative media paths from Django
  if (finalUrl && finalUrl.startsWith('/media/')) {
    finalUrl = window.PcApi?.BASE_URL ? window.PcApi.BASE_URL + finalUrl : finalUrl;
  }

  if (finalUrl) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display:'flex', alignItems:'center', justifyContent:'center', padding:12 }}>
        <img src={finalUrl} alt="product" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', position:'relative', zIndex:2 }} />
      </div>
    );
  }

  return (
    <div style={{ fontSize: 64, opacity: 0.15 }}>📦</div>
  );
};

export const ImageCarousel = ({ images, category, height = 240 }) => {
  const [idx, setIdx] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const hasImages = images && images.length > 0;

  React.useEffect(() => {
    if (!hasImages || images.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setIdx(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [hasImages, images, isHovered]);

  if (!hasImages) {
    return (
      <div style={{ width:'100%', height: height, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--gray-50)', borderRadius:12 }}>
        <ProductVisual category={category} />
      </div>
    );
  }

  const go = (e, dir) => {
    e.stopPropagation();
    setIdx(i => (i + dir + images.length) % images.length);
  };

  return (
    <div 
      style={{ width: '100%', height: height, position: 'relative', overflow: 'hidden', borderRadius: 12, background: 'var(--white)', cursor: 'default' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <img 
          src={images[idx]} 
          alt="product" 
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
        />
      </div>

      {images.length > 1 && (
        <>
          <button onClick={e => go(e, -1)} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.7)', border:'1px solid var(--border)', color:'var(--black)', padding:8, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={e => go(e, 1)} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.7)', border:'1px solid var(--border)', color:'var(--black)', padding:8, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6 }}>
            {images.map((_, i) => (
              <div key={i} style={{ width:6, height:6, borderRadius:'50%', background: i === idx ? 'var(--accent)' : 'rgba(0,0,0,0.1)', transition:'all 0.3s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
