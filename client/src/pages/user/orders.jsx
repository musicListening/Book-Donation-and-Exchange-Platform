import React, { useState, useEffect } from 'react';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('ss_orders') || '[]');
    setOrders(storedOrders);
  }, []);

  const getStatusIndex = (status) => {
    const statuses = ['Placed', 'Packed', 'Shipped', 'Delivered'];
    return statuses.indexOf(status);
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', color: '#343A40', paddingTop: 72, margin: 0 },
    header: { position: 'fixed', top: 0, left: 0, width: '100%', height: 72, background: 'white', borderBottom: '1px solid #DEE2E6', zIndex: 1000, padding: '0 40px' },
    navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', maxWidth: 1440, margin: '0 auto' },
    logo: { fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 800, color: '#1E4D4B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 },
    navLinks: { display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0 },
    navLink: { textDecoration: 'none', color: '#343A40', fontWeight: 500 },
    navLinkActive: { color: '#1E4D4B' },
    mainContent: { maxWidth: 1000, margin: '60px auto', padding: '0 20px' },
    pageHeader: { marginBottom: 40 },
    pageHeaderH1: { fontFamily: 'Playfair Display, serif', fontSize: 32 },
    orderCard: { background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 24, border: '1px solid #DEE2E6' },
    orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #DEE2E6', paddingBottom: 20, marginBottom: 24 },
    orderId: { fontWeight: 800, fontSize: 18, color: '#1E4D4B' },
    orderDate: { color: '#6C757D', fontSize: 14 },
    orderTotal: { fontWeight: 700, color: '#343A40' },
    orderItems: { marginBottom: 32 },
    orderItemText: { fontSize: 15, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
    stepper: { display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: 20 },
    stepperBefore: { content: '""', position: 'absolute', top: 15, left: 0, width: '100%', height: 2, background: '#DEE2E6', zIndex: 1 },
    step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2, position: 'relative', flex: 1 },
    stepCircle: { width: 32, height: 32, borderRadius: '50%', background: 'white', border: '2px solid #DEE2E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#6C757D' },
    stepCircleActive: { background: '#2A9D8F', borderColor: '#2A9D8F', color: 'white' },
    stepLabel: { fontSize: 12, fontWeight: 600, color: '#6C757D', textAlign: 'center' },
    stepLabelActive: { color: '#2A9D8F', fontWeight: 700 },
    emptyOrders: { textAlign: 'center', padding: '80px 0' }
  };

  if (orders.length === 0) {
    return (
      <div style={styles.body}>
        <header style={styles.header}>
          <nav style={styles.navbar}>
            <a href="/" style={styles.logo}><i className="fa-solid fa-book-open"></i> ShareShelf</a>
            <ul style={styles.navLinks}>
              <li><a href="/user-dashboard" style={styles.navLink}>Dashboard</a></li>
              <li><a href="/marketplace" style={styles.navLink}>Marketplace</a></li>
              <li><a href="/orders" style={{ ...styles.navLink, ...styles.navLinkActive }}>My Orders</a></li>
              <li><a href="/donate" style={styles.navLink}>Donate</a></li>
            </ul>
          </nav>
        </header>
        <main style={styles.mainContent}>
          <div style={styles.pageHeader}><h1 style={styles.pageHeaderH1}>My Orders</h1><p>Track your book bundles and craft deliveries.</p></div>
          <div style={styles.emptyOrders}><i className="fa-solid fa-box-open" style={{ fontSize: 64, color: '#DEE2E6', marginBottom: 20 }}></i><h3>No orders yet</h3><p>Items you redeem in the marketplace will appear here.</p></div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <nav style={styles.navbar}>
          <Link to="/" style={styles.logo}><i className="fa-solid fa-book-open"></i> ShareShelf</Link>
          <ul style={styles.navLinks}>
            <li><Link to="/user-dashboard" style={{ ...styles.navLink, ...styles.navLinkActive }}>Dashboard</Link></li>
            <li><Link to="/marketplace" style={styles.navLink}>Marketplace</Link></li>
            <li><Link to="/orders" style={{ ...styles.navLink, ...styles.navLinkActive }}>My Orders</Link></li>
            <li><Link to="/donate" style={styles.navLink}>Donate</Link></li>
          </ul>
        </nav>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.pageHeader}><h1 style={styles.pageHeaderH1}>My Orders</h1><p>Track your book bundles and craft deliveries.</p></div>

        <div>
          {orders.map(order => {
            const currentStatusIndex = getStatusIndex(order.status);
            const statuses = ['Placed', 'Packed', 'Shipped', 'Delivered'];
            return (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div><span style={styles.orderId}>{order.id}</span><div style={styles.orderDate}>Ordered on {order.date}</div></div>
                  <div style={styles.orderTotal}><i className="fa-solid fa-coins" style={{ color: '#E9C46A' }}></i> {order.total} Points</div>
                </div>
                <div style={styles.orderItems}>{order.items.map((item, idx) => <p key={idx} style={styles.orderItemText}><i className="fa-solid fa-book"></i> {item}</p>)}</div>
                <div style={styles.stepper}>
                  {statuses.map((status, idx) => (
                    <div key={status} style={styles.step}>
                      <div style={{ ...styles.stepCircle, ...(currentStatusIndex >= idx ? styles.stepCircleActive : {}) }}>
                        {idx === 0 && <i className="fa-solid fa-file-invoice"></i>}
                        {idx === 1 && <i className="fa-solid fa-box"></i>}
                        {idx === 2 && <i className="fa-solid fa-truck-fast"></i>}
                        {idx === 3 && <i className="fa-solid fa-house-chimney"></i>}
                      </div>
                      <div style={{ ...styles.stepLabel, ...(currentStatusIndex >= idx ? styles.stepLabelActive : {}) }}>{status}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Orders;