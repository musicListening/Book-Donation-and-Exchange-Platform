import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const Cart = () => {
  const [user, setUser] = useState({ points: 0 });
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || { points: 0 };
    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setUser(storedUser);
    setCart(storedCart);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('ss_cart', JSON.stringify(newCart));
  };

  const checkout = () => {
    if (user.points < subtotal) {
      alert('Not enough points! Donate more books to earn points.');
      return;
    }
    if (!address) {
      alert('Please enter a delivery address');
      return;
    }

    const newUser = { ...user, points: user.points - subtotal };
    setUser(newUser);
    localStorage.setItem('ss_current_user', JSON.stringify(newUser));

    const orders = JSON.parse(localStorage.getItem('ss_orders') || '[]');
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split('T')[0],
      items: cart.map(i => i.title),
      total: subtotal,
      status: 'Placed',
      address: `${address}, ${city}, ${pincode}`
    };
    orders.unshift(newOrder);
    localStorage.setItem('ss_orders', JSON.stringify(orders));

    localStorage.setItem('ss_cart', '[]');
    alert('Order placed successfully!');
    window.location.href = '/orders';
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', color: '#343A40', paddingTop: 72 },
    header: { position: 'fixed', top: 0, left: 0, width: '100%', height: 72, background: 'white', borderBottom: '1px solid #DEE2E6', zIndex: 1000, padding: '0 40px' },
    navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', maxWidth: 1440, margin: '0 auto' },
    logo: { fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 800, color: '#1E4D4B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 },
    pointsBadge: { background: '#E9C46A', padding: '6px 14px', borderRadius: 50, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
    mainContent: { maxWidth: 1200, margin: '60px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 32 },
    cartTitle: { gridColumn: '1 / -1', marginBottom: 20, fontFamily: 'Playfair Display, serif', fontSize: 32 },
    cartCard: { background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    cartItem: { display: 'flex', alignItems: 'center', gap: 20, padding: '20px 0', borderBottom: '1px solid #DEE2E6' },
    itemImage: { width: 80, height: 80, borderRadius: 8, background: '#F1F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 },
    itemDetails: { flex: 1 },
    itemPrice: { fontWeight: 800, fontSize: 18, color: '#1E4D4B' },
    removeBtn: { background: 'none', border: 'none', color: '#E63946', cursor: 'pointer', fontSize: 18 },
    summaryCard: { background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: 'fit-content' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 16 },
    summaryTotal: { borderTop: '2px solid #DEE2E6', paddingTop: 20, marginTop: 20, fontWeight: 800, fontSize: 20, color: '#1E4D4B' },
    formGroup: { marginTop: 24 },
    formGroupLabel: { display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 },
    formControl: { width: '100%', padding: 12, border: '1px solid #DEE2E6', borderRadius: 8, fontFamily: 'Inter, sans-serif' },
    btnCheckout: { width: '100%', padding: 16, background: '#1E4D4B', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, marginTop: 32, cursor: 'pointer' },
    emptyCart: { textAlign: 'center', padding: '60px 0' }
  };

  if (cart.length === 0) {
    return (
      <div style={styles.body}>
        <Navbar variant="user" user={user} cartCount={0} />
        <main style={styles.mainContent}>
          <h1 style={styles.cartTitle}>Your Shopping Cart</h1>
          <div style={styles.cartCard}>
            <div style={styles.emptyCart}>
              <i className="fa-solid fa-cart-shopping" style={{ fontSize: 64, color: '#DEE2E6', marginBottom: 20 }}></i>
              <h3>Your cart is empty</h3>
              <p>Go to the <a href="/marketplace" style={{ color: '#E76F51', fontWeight: 700 }}>Marketplace</a> to find some treasures.</p>
            </div>
          </div>
          <div style={{ ...styles.summaryCard, opacity: 0.5 }}>
            <h3>Order Summary</h3>
            <div style={styles.summaryRow}><span>Subtotal</span><span>0 pts</span></div>
            <div style={styles.summaryRow}><span>Shipping</span><span>FREE</span></div>
            <div style={styles.summaryTotal}><span>Total</span><span>0 pts</span></div>
            <button style={styles.btnCheckout} disabled>Place Order</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cart.length} />

      <main style={styles.mainContent}>
        <h1 style={styles.cartTitle}>Your Shopping Cart</h1>

        <div style={styles.cartCard}>
          {cart.map((item, index) => (
            <div key={index} style={styles.cartItem}>
              <div style={styles.itemImage}>{item.image}</div>
              <div style={styles.itemDetails}>
                <h4>{item.title}</h4>
                <p style={{ color: '#6C757D', fontSize: 14 }}>{item.type === 'bundles' ? 'Curated Bundle' : 'Handmade Craft'}</p>
              </div>
              <div style={styles.itemPrice}><i className="fa-solid fa-coins"></i> {item.price}</div>
              <button style={styles.removeBtn} onClick={() => removeItem(index)}><i className="fa-solid fa-trash-can"></i></button>
            </div>
          ))}
        </div>

        <div style={styles.summaryCard}>
          <h3>Order Summary</h3>
          <div style={{ ...styles.summaryRow, marginTop: 24 }}>
            <span>Subtotal</span>
            <span>{subtotal} pts</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <div style={styles.summaryTotal}>
            <span>Total</span>
            <span>{subtotal} pts</span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formGroupLabel}>Delivery Address</label>
            <input 
              type="text" 
              style={styles.formControl} 
              placeholder="Street Address" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <input 
                type="text" 
                style={styles.formControl} 
                placeholder="City" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <input 
                type="text" 
                style={styles.formControl} 
                placeholder="Pincode" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>

          <button style={styles.btnCheckout} onClick={checkout}>Place Order</button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#6C757D', marginTop: 12 }}>Secure point-based transaction.</p>
        </div>
      </main>
    </div>
  );
};

export default Cart;