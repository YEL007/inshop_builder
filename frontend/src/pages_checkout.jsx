import React from "react";

const ProductVisual = window.ProductVisual;

// pages_checkout.jsx — Full Checkout + Order Confirmation

const CheckoutPage = () => {
  const { cart, setPage, clearCart, t, formatPrice } = React.useContext(window.AppContext);
  const STEPS_CK = [t('step_cart_review'), t('step_shipping'), t('step_payment'), t('step_confirmation')];
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [orderError, setOrderError] = React.useState('');
  const [shipping, setShipping] = React.useState({ firstName:'', lastName:'', email:'', phone:'', address:'', city:'', zip:'', country:'United States', method:'standard' });
  const [payment, setPayment] = React.useState({ cardNumber:'', cardName:'', expiry:'', cvv:'', method:'card' });
  const [orderNum, setOrderNum] = React.useState(() => 'ORD-2026-' + Math.floor(Math.random()*9000+1000));
  const [errors, setErrors] = React.useState({});

  const subtotal = cart.reduce((s,i) => s + i.price*i.qty, 0);
  const shippingCost = shipping.method === 'express' ? 29.99 : shipping.method === 'overnight' ? 59.99 : subtotal > 500 ? 0 : 19.99;
  const total = subtotal + shippingCost;

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!shipping.firstName) e.firstName = t('required');
      if (!shipping.lastName) e.lastName = t('required');
      if (!shipping.email || !shipping.email.includes('@')) e.email = t('valid_email');
      if (!shipping.address) e.address = t('required');
      if (!shipping.city) e.city = t('required');
      if (!shipping.zip) e.zip = t('required');
    }
    if (step === 2) {
      if (payment.method === 'card') {
        if (!payment.cardNumber || payment.cardNumber.replace(/\s/g,'').length < 16) e.cardNumber = t('card_digits');
        if (!payment.cardName) e.cardName = t('required');
        if (!payment.expiry) e.expiry = t('required');
        if (!payment.cvv || payment.cvv.length < 3) e.cvv = t('required');
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    if (step === 2) {
      setLoading(true);
      setOrderError('');
      try {
        // Sync cart with Odoo before confirming
        await window.PcApi.cartSync(cart.map(i => ({ product_id: i.odoo_id || i.id, qty: i.qty })));

        const res = await window.PcApi.confirmOrder({
          name: `${shipping.firstName} ${shipping.lastName}`.trim(),
          email: shipping.email,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          zip: shipping.zip,
          country: shipping.country,
        });
        if (res.order_name) setOrderNum(res.order_name);
        clearCart();
        setStep(3);
      } catch (err) {
        setOrderError('La commande n\'a pas pu être passée. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
      return;
    }
    setStep(s => s + 1);
  };

  if (cart.length === 0 && step < 3) {
    return (
      <div style={{ paddingTop:64, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh', gap:16 }}>
        <div style={{ color:'#606060', fontSize:16 }}>Your cart is empty.</div>
        <button style={ckStyles.btnPrimary} onClick={() => setPage('catalog')}>Browse Products</button>
      </div>
    );
  }

  return (
    <div style={ckStyles.page}>
      {/* Header */}
      <div style={ckStyles.header}>
        <div style={ckStyles.logo} onClick={() => setPage('home')}>
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><rect x="1" y="1" width="20" height="20" rx="3" stroke="#e8e8e8" strokeWidth="1.5"/><rect x="5" y="5" width="5" height="5" fill="#e8e8e8"/><rect x="12" y="5" width="5" height="5" fill="#e8e8e8" opacity="0.5"/><rect x="5" y="12" width="5" height="5" fill="#e8e8e8" opacity="0.5"/><rect x="12" y="12" width="5" height="5" fill="#e8e8e8"/></svg>
          <span style={{ color:'var(--black)', fontWeight:700, fontSize:14, letterSpacing:'0.1em' }}>INSHOP</span>
        </div>
        <div style={ckStyles.stepBar}>
          {STEPS_CK.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ ...ckStyles.stepDot, ...(i <= step ? ckStyles.stepDotActive : {}) }}>
                  {i < step ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
                </div>
                <span style={{ color: i <= step ? 'var(--black)' : '#606060', fontSize:13, fontWeight: i === step ? 600 : 400 }}>{s}</span>
              </div>
              {i < STEPS_CK.length - 1 && <div style={{ ...ckStyles.stepLine, background: i < step ? '#e8e8e8' : '#2a2a2a' }}/>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ width:100 }}/>
      </div>

      <div style={ckStyles.body}>
        {/* Main */}
        <div style={ckStyles.main}>
          {step === 0 && <CartReview cart={cart} setPage={setPage} onNext={handleNext} />}
          {step === 1 && <ShippingForm data={shipping} setData={setShipping} errors={errors} onNext={handleNext} onBack={() => setStep(0)} />}
          {step === 2 && <PaymentForm data={payment} setData={setPayment} errors={errors} onNext={handleNext} onBack={() => setStep(1)} loading={loading} orderError={orderError} />}
          {step === 3 && <OrderConfirmation orderNum={orderNum} cart={cart} total={total} shipping={shipping} setPage={setPage} />}
        </div>

        {/* Order summary sidebar */}
        {step < 3 && (
          <div style={ckStyles.sidebar}>
            <div style={ckStyles.sideTitle}>{t('order_summary')}</div>
            <div style={ckStyles.itemsList}>
              {cart.map(item => (
                <div key={item.cartId} style={ckStyles.itemRow}>
                  <div style={ckStyles.itemImgSm}>
                    <ProductVisual category={item.category} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={ckStyles.itemName}>{item.name}</div>
                    <div style={ckStyles.itemQty}>Qty: {item.qty}</div>
                  </div>
                  <div style={ckStyles.itemPrice}>${(item.price*item.qty).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={ckStyles.divider}/>
            <div style={ckStyles.summRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={ckStyles.summRow}>
              <span>Shipping</span>
              <span style={{ color: shippingCost===0?'#aaaaaa':'var(--black)' }}>{shippingCost===0?'Free':'$'+shippingCost.toFixed(2)}</span>
            </div>
            <div style={ckStyles.divider}/>
            <div style={{ ...ckStyles.summRow, color:'#ffffff', fontWeight:700 }}>
              <span style={{ fontSize:15 }}>Total</span>
              <span style={{ fontSize:22, fontFamily:"'Space Grotesk',sans-serif" }}>${total.toFixed(2)}</span>
            </div>
            <div style={ckStyles.secBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Secure checkout — SSL encrypted
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CartReview = ({ cart, setPage, onNext }) => (
  <div style={ckStyles.section}>
    <h2 style={ckStyles.sectionTitle}>Review Your Order</h2>
    {cart.map(item => (
      <div key={item.cartId} style={ckStyles.reviewItem}>
        <div style={{ ...ckStyles.itemImgMd, background:'#141414' }}>
          <ProductVisual category={item.category} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ color:'#606060', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:2 }}>{item.brand||item.category}</div>
          <div style={{ color:'var(--black)', fontWeight:600, fontSize:14, marginBottom:4 }}>{item.name}</div>
          <div style={{ color:'#606060', fontSize:12 }}>Qty: {item.qty}</div>
        </div>
        <div style={{ color:'var(--black)', fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", fontSize:18 }}>${(item.price*item.qty).toLocaleString()}</div>
      </div>
    ))}
    <div style={ckStyles.btnRow}>
      <button style={ckStyles.btnSecondary} onClick={() => setPage('cart')}>← Back to Cart</button>
      <button style={ckStyles.btnPrimary} onClick={onNext}>Continue to Shipping →</button>
    </div>
  </div>
);

const ShippingForm = ({ data, setData, errors, onNext, onBack }) => {
  const { t, formatPrice } = React.useContext(window.AppContext);
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  return (
    <div style={ckStyles.section}>
      <h2 style={ckStyles.sectionTitle}>Shipping Information</h2>
      <div style={ckStyles.formGrid}>
        <Field label={t("first_name")} value={data.firstName} onChange={v=>set('firstName',v)} error={errors.firstName} />
        <Field label={t("last_name")} value={data.lastName} onChange={v=>set('lastName',v)} error={errors.lastName} />
        <Field label={t("email")} type="email" value={data.email} onChange={v=>set('email',v)} error={errors.email} full />
        <Field label={t("phone")} type="tel" value={data.phone} onChange={v=>set('phone',v)} />
        <Field label={t("address")} value={data.address} onChange={v=>set('address',v)} error={errors.address} full />
        <Field label={t("city")} value={data.city} onChange={v=>set('city',v)} error={errors.city} />
        <Field label={t("zip")} value={data.zip} onChange={v=>set('zip',v)} error={errors.zip} />
        <div>
          <div style={ckStyles.fieldLabel}>Country</div>
          <select value={data.country} onChange={e=>set('country',e.target.value)} style={ckStyles.select}>
            {['United States','Canada','France','Germany','United Kingdom','Australia','Japan'].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={ckStyles.shippingMethods}>
        <div style={ckStyles.fieldLabel}>Shipping Method</div>
        {[
          { key:'standard', get label(){return t('shipping_standard')}, get desc(){return t('shipping_standard_desc')}, price:t('cart_free') },
          { key:'express', get label(){return t('shipping_express')}, get desc(){return t('shipping_express_desc')}, price:formatPrice(29.99) },
          { key:'overnight', get label(){return t('shipping_overnight')}, get desc(){return t('shipping_overnight_desc')}, price:formatPrice(59.99) },
        ].map(m => (
          <div key={m.key} style={{ ...ckStyles.methodCard, ...(data.method===m.key?ckStyles.methodCardActive:{}) }}
            onClick={() => set('method', m.key)}>
            <div style={{ ...ckStyles.radio, ...(data.method===m.key?ckStyles.radioActive:{}) }}>
              {data.method===m.key && <div style={ckStyles.radioDot}/>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:'var(--black)', fontWeight:600, fontSize:14 }}>{m.label}</div>
              <div style={{ color:'#606060', fontSize:12 }}>{m.desc}</div>
            </div>
            <div style={{ color:'#e8e8e8', fontWeight:600, fontSize:13 }}>{m.price}</div>
          </div>
        ))}
      </div>
      <div style={ckStyles.btnRow}>
        <button style={ckStyles.btnSecondary} onClick={onBack}>← Back</button>
        <button style={ckStyles.btnPrimary} onClick={onNext}>Continue to Payment →</button>
      </div>
    </div>
  );
};

const PaymentForm = ({ data, setData, errors, onNext, onBack, loading, orderError }) => {
  const { t } = React.useContext(window.AppContext);
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const fmtCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExp = (v) => v.replace(/\D/g,'').slice(0,4).replace(/^(.{2})(.+)/,'$1/$2');

  return (
    <div style={ckStyles.section}>
      <h2 style={ckStyles.sectionTitle}>Payment</h2>
      <div style={ckStyles.payMethods}>
        {[['card',t('payment_card')],['paypal','PayPal'],['crypto','Crypto']].map(([k,l])=>(
          <button key={k} style={{ ...ckStyles.payMethodBtn, ...(data.method===k?ckStyles.payMethodActive:{}) }}
            onClick={()=>set('method',k)}>{l}</button>
        ))}
      </div>
      {data.method === 'card' && (
        <div style={ckStyles.formGrid}>
          <div style={{ gridColumn:'1/-1' }}>
            <div style={ckStyles.fieldLabel}>Card Number</div>
            <input value={data.cardNumber} onChange={e=>set('cardNumber',fmtCard(e.target.value))}
              placeholder="1234 5678 9012 3456" style={{ ...ckStyles.input, ...(errors.cardNumber?ckStyles.inputError:{}) }}/>
            {errors.cardNumber && <div style={ckStyles.errorMsg}>{errors.cardNumber}</div>}
          </div>
          <Field label={t("card_holder")} value={data.cardName} onChange={v=>set('cardName',v)} error={errors.cardName} full />
          <div>
            <div style={ckStyles.fieldLabel}>Expiry Date</div>
            <input value={data.expiry} onChange={e=>set('expiry',fmtExp(e.target.value))}
              placeholder="MM/YY" style={{ ...ckStyles.input, ...(errors.expiry?ckStyles.inputError:{}) }}/>
            {errors.expiry && <div style={ckStyles.errorMsg}>{errors.expiry}</div>}
          </div>
          <div>
            <div style={ckStyles.fieldLabel}>CVV</div>
            <input value={data.cvv} onChange={e=>set('cvv',e.target.value.replace(/\D/g,'').slice(0,4))}
              placeholder="123" type="password" style={{ ...ckStyles.input, ...(errors.cvv?ckStyles.inputError:{}) }}/>
            {errors.cvv && <div style={ckStyles.errorMsg}>{errors.cvv}</div>}
          </div>
        </div>
      )}
      {data.method === 'paypal' && (
        <div style={ckStyles.altPay}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aaaaaa" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9 12h6M12 9v6"/></svg>
          <div style={{ color:'#606060' }}>You will be redirected to PayPal to complete your payment.</div>
        </div>
      )}
      {data.method === 'crypto' && (
        <div style={ckStyles.altPay}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aaaaaa" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.5 8h3a2 2 0 1 1 0 4h-3M9.5 12h3.5a2 2 0 1 1 0 4H9.5M12 6v2M12 16v2"/></svg>
          <div style={{ color:'#606060' }}>Accepted: BTC, ETH, USDC. QR code shown after confirmation.</div>
        </div>
      )}
      {orderError && (
        <div style={{ color:'#cc4444', background:'#cc444415', border:'1px solid #cc444440', borderRadius:8, padding:'10px 16px', fontSize:13 }}>
          {orderError}
        </div>
      )}
      <div style={ckStyles.btnRow}>
        <button style={ckStyles.btnSecondary} onClick={onBack} disabled={loading}>← Back</button>
        <button style={{ ...ckStyles.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={onNext} disabled={loading}>
          {loading ? (
            <span>Processing...</span>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Place Order
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const OrderConfirmation = ({ orderNum, cart, total, shipping, setPage }) => {
  const { t } = React.useContext(window.AppContext);
  return (
    <div style={ckStyles.confirmPage}>
    <div style={ckStyles.confirmIcon}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h1 style={ckStyles.confirmTitle}>{t('order_confirmed')}</h1>
    <div style={ckStyles.confirmNum}>{orderNum}</div>
    <p style={ckStyles.confirmDesc}>
      A confirmation email has been sent to <strong style={{ color:'var(--black)' }}>{shipping.email || 'your email'}</strong>.
      Your order will be shipped to <strong style={{ color:'var(--black)' }}>{shipping.city || 'your address'}</strong>.
    </p>
    <div style={ckStyles.confirmSummary}>
      {cart.slice(0,3).map(item => (
        <div key={item.cartId} style={ckStyles.confirmItem}>
          <span style={{ color:'#999999' }}>{item.name}</span>
          <span style={{ color:'var(--black)' }}>×{item.qty}</span>
        </div>
      ))}
      {cart.length > 3 && <div style={{ color:'#606060', fontSize:12 }}>+ {cart.length - 3} more items</div>}
      <div style={{ ...ckStyles.confirmItem, borderTop:'1px solid #2a2a2a', paddingTop:12, marginTop:8 }}>
        <span style={{ color:'var(--black)', fontWeight:700 }}>Total Paid</span>
        <span style={{ color:'var(--black)', fontWeight:700, fontSize:20 }}>${total.toFixed(2)}</span>
      </div>
    </div>
    <div style={{ display:'flex', gap:12 }}>
      <button style={ckStyles.btnPrimary} onClick={() => setPage('user', { tab:'orders' })}>View My Orders</button>
      <button style={ckStyles.btnSecondary} onClick={() => setPage('home')}>{t('continue_shopping')}</button>
    </div>
  </div>
  );
};

const Field = ({ label, value, onChange, error, type='text', full }) => (
  <div style={{ ...(full ? { gridColumn:'1/-1' } : {}) }}>
    <div style={ckStyles.fieldLabel}>{label}</div>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={label}
      style={{ ...ckStyles.input, ...(error?ckStyles.inputError:{}) }}/>
    {error && <div style={ckStyles.errorMsg}>{error}</div>}
  </div>
);

const ckStyles = {
  page: { paddingTop:0, minHeight:'100vh', background:'#080808', display:'flex', flexDirection:'column' },
  header: { height:60, borderBottom:'1px solid #1e1e1e', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', position:'sticky', top:64, background:'rgba(8,8,8,0.95)', backdropFilter:'blur(12px)', zIndex:100 },
  logo: { display:'flex', alignItems:'center', gap:8, cursor:'pointer', width:100 },
  stepBar: { display:'flex', alignItems:'center', gap:8 },
  stepDot: { width:24, height:24, borderRadius:'50%', background:'#1e1e1e', color:'#606060', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  stepDotActive: { background:'#e8e8e8', color:'#080808' },
  stepLine: { width:32, height:1 },
  body: { display:'grid', gridTemplateColumns:'1fr 360px', gap:0, flex:1, maxWidth:1100, margin:'0 auto', width:'100%', padding:'40px 20px' },
  main: { paddingRight:40 },
  sidebar: { borderLeft:'1px solid #1e1e1e', paddingLeft:40 },
  sideTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'#ffffff', marginBottom:20 },
  itemsList: { display:'flex', flexDirection:'column', gap:12, maxHeight:320, overflowY:'auto', marginBottom:16 },
  itemRow: { display:'flex', alignItems:'center', gap:10 },
  itemImgSm: { width:40, height:40, background:'#141414', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  itemImgMd: { width:64, height:64, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  itemName: { color:'#ffffff', fontSize:12, fontWeight:500, lineHeight:1.3, marginBottom:2 },
  itemQty: { color:'#606060', fontSize:11 },
  itemPrice: { color:'#ffffff', fontWeight:600, fontSize:13, flexShrink:0 },
  divider: { height:1, background:'#1e1e1e', margin:'14px 0' },
  summRow: { display:'flex', justifyContent:'space-between', color:'#999999', fontSize:13, marginBottom:8 },
  secBadge: { display:'flex', alignItems:'center', gap:6, color:'#606060', fontSize:11, marginTop:16, padding:'10px', background:'#0d0d0d', borderRadius:8 },
  section: { display:'flex', flexDirection:'column', gap:24 },
  sectionTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#ffffff', margin:0 },
  reviewItem: { display:'flex', alignItems:'center', gap:16, padding:'16px', background:'#121212', border:'1px solid #1e1e1e', borderRadius:10 },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  fieldLabel: { color:'#999999', fontSize:11, fontWeight:700, letterSpacing:'0.1em', marginBottom:6 },
  input: { width:'100%', background:'#121212', border:'1px solid #2a2a2a', borderRadius:8, padding:'11px 14px', color:'#ffffff', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' },
  inputError: { borderColor:'#cc4444' },
  errorMsg: { color:'#cc4444', fontSize:11, marginTop:4 },
  select: { width:'100%', background:'#121212', border:'1px solid #2a2a2a', borderRadius:8, padding:'11px 14px', color:'#ffffff', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, outline:'none' },
  shippingMethods: { display:'flex', flexDirection:'column', gap:8 },
  methodCard: { display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'#121212', border:'1px solid #2a2a2a', borderRadius:10, cursor:'pointer', transition:'all 0.15s' },
  methodCardActive: { borderColor:'#e8e8e8' },
  radio: { width:18, height:18, borderRadius:'50%', border:'2px solid #383838', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  radioActive: { borderColor:'#e8e8e8' },
  radioDot: { width:8, height:8, borderRadius:'50%', background:'#e8e8e8' },
  payMethods: { display:'flex', gap:8, marginBottom:16 },
  payMethodBtn: { flex:1, padding:'10px', background:'#121212', border:'1px solid #2a2a2a', borderRadius:8, color:'#999999', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:500, transition:'all 0.15s' },
  payMethodActive: { borderColor:'#e8e8e8', color:'var(--black)', background:'#1e1e1e' },
  altPay: { display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'40px', background:'#121212', border:'1px solid #2a2a2a', borderRadius:12, textAlign:'center' },
  btnRow: { display:'flex', gap:12, justifyContent:'space-between', marginTop:8 },
  btnPrimary: { display:'flex', alignItems:'center', gap:8, background:'#e8e8e8', color:'#080808', border:'none', cursor:'pointer', padding:'12px 28px', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, transition:'background 0.2s' },
  btnSecondary: { background:'transparent', border:'1px solid #2a2a2a', color:'#999999', cursor:'pointer', padding:'12px 24px', borderRadius:8, fontFamily:"'Space Grotesk',sans-serif", fontSize:14, transition:'all 0.15s' },
  confirmPage: { display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'60px 40px', gap:16, gridColumn:'1/-1' },
  confirmIcon: { width:80, height:80, borderRadius:'50%', background:'#e8e8e8', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 },
  confirmTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:32, color:'var(--black)', margin:0 },
  confirmNum: { color:'#606060', fontSize:14, fontFamily:"'DM Mono',monospace", background:'#121212', padding:'6px 16px', borderRadius:6, border:'1px solid #2a2a2a' },
  confirmDesc: { color:'#999999', fontSize:15, lineHeight:1.6, maxWidth:440 },
  confirmSummary: { background:'#121212', border:'1px solid #1e1e1e', borderRadius:12, padding:'20px 24px', width:'100%', maxWidth:400, textAlign:'left' },
  confirmItem: { display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--red)', fontSize:13 },
};

Object.assign(window, { CheckoutPage });
