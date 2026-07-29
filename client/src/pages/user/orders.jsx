import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { API_BASE } from '../../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'User', points: 0, id: '' });
  const [cartCount, setCartCount] = useState(0);

  const getStatusIndex = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING' || s === 'PLACED') return 0;
    if (s === 'PROCESSING') return 1;
    if (s === 'DELIVERED' || s === 'COMPLETED') return 2;
    return -1;
  };

  const getStatusDisplay = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING' || s === 'PLACED') return 'Placed';
    if (s === 'PROCESSING') return 'Processing';
    if (s === 'DELIVERED' || s === 'COMPLETED') return 'Completed';
    if (s === 'CANCELLED') return 'Cancelled';
    return status;
  };

  const getStatusColor = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING' || s === 'PLACED') return { bg: '#E0F2FE', text: '#0284C7' };
    if (s === 'PROCESSING') return { bg: '#FEF3C7', text: '#D97706' };
    if (s === 'DELIVERED' || s === 'COMPLETED') return { bg: '#D1FAE5', text: '#059669' };
    if (s === 'CANCELLED') return { bg: '#FEE2E2', text: '#EF4444' };
    return { bg: '#F3F4F6', text: '#374151' };
  };

  const formatOrderId = (id) => {
    if (!id) return '';
    return 'ORDER-' + id.substring(0, 8).toUpperCase();
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || { name: 'User', points: 0, id: '' };
    setUser(storedUser);
    
    if (storedUser.id) {
      fetchOrders(storedUser.id);
    }

    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setCartCount(storedCart.length);
  }, []);

  // ===== FETCH ORDERS FOR SPECIFIC USER =====
  const fetchOrders = async (userId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      // Fetch only orders for this specific user
      const response = await fetch(`${API_BASE}/orders?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      
      // Format orders for display
      const formattedOrders = data.map(order => ({
        id: order.id.substring(0, 8).toUpperCase(),
        fullId: order.id,
        status: order.status || 'PENDING',
        date: new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        total: order.cashAmount || 0,
        totalPoints: order.totalPoints || 0,
        items: order.items?.map(i => {
          if (i.bookItem) return i.bookItem.title;
          if (i.collection) return i.collection.title;
          if (i.craftListing) return i.craftListing.title;
          return 'Unknown Item';
        }) || [],
        discount: 0
      }));

      setOrders(formattedOrders);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Your points will be refunded.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      if (res.ok) {
        // Update local state to reflect cancellation immediately
        const newOrders = [...orders];
        const orderIndex = newOrders.findIndex(o => o.fullId === orderId);
        if (orderIndex !== -1) {
          const order = newOrders[orderIndex];
          order.status = 'Cancelled';
          setOrders(newOrders);
          
          // Note: Full refund logic should ideally be on backend, but we update frontend points here
          const newUser = { ...user, points: user.points + (order.totalPoints || 0) };
          setUser(newUser);
          localStorage.setItem('ss_current_user', JSON.stringify(newUser));
        }
      }
    } catch (err) {
      console.error('Failed to cancel order', err);
    }
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', color: '#343A40', paddingTop: 72, margin: 0, minHeight: '100vh' },
    mainContent: { maxWidth: 1000, margin: '60px auto', padding: '0 20px' },
    pageHeader: { marginBottom: 40 },
    pageHeaderH1: { fontFamily: 'Playfair Display, serif', fontSize: 32, color: '#1E4D4B' },
    pageSubtitle: { color: '#6C757D', marginTop: 4 },
    orderCard: { background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 24, border: '1px solid #DEE2E6' },
    orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #DEE2E6', paddingBottom: 20, marginBottom: 24 },
    orderId: { fontWeight: 800, fontSize: 18, color: '#1E4D4B' },
    orderDate: { color: '#6C757D', fontSize: 14, marginTop: 4 },
    orderTotal: { fontWeight: 700, color: '#343A40', fontSize: 18 },
    orderItems: { marginBottom: 32 },
    orderItemText: { fontSize: 15, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
    stepper: { display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: 20, padding: '0 20px' },
    stepperLine: { position: 'absolute', top: 15, left: '10%', width: '80%', height: 2, background: '#DEE2E6', zIndex: 1 },
    step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2, position: 'relative', flex: 1 },
    stepCircle: { width: 32, height: 32, borderRadius: '50%', background: 'white', border: '2px solid #DEE2E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6C757D' },
    stepCircleActive: { background: '#2A9D8F', borderColor: '#2A9D8F', color: 'white' },
    stepLabel: { fontSize: 12, fontWeight: 600, color: '#6C757D', textAlign: 'center' },
    stepLabelActive: { color: '#2A9D8F', fontWeight: 700 },
    emptyOrders: { textAlign: 'center', padding: '80px 0' },
    loadingState: { textAlign: 'center', padding: '60px 0', color: '#6C757D' },
    statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }
  };

  try {
    if (loading) {
    return (
      <div style={styles.body}>
        <Navbar variant="user" user={user} cartCount={cartCount} />
        <main style={styles.mainContent}>
          <div style={styles.loadingState}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: '#1E4D4B' }}></i>
            <p style={{ marginTop: 12 }}>Loading your orders...</p>
          </div>
        </main>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={styles.body}>
        <Navbar variant="user" user={user} cartCount={cartCount} />
        <main style={styles.mainContent}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageHeaderH1}>My Orders</h1>
            <p style={styles.pageSubtitle}>Track your book bundles and craft deliveries.</p>
          </div>
          <div style={styles.emptyOrders}>
            <i className="fa-solid fa-box-open" style={{ fontSize: 64, color: '#DEE2E6', marginBottom: 20 }}></i>
            <h3>No orders yet</h3>
            <p style={{ color: '#6C757D' }}>Items you redeem in the marketplace will appear here.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cartCount} />

      <main className="orders-main" style={styles.mainContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageHeaderH1}>My Orders</h1>
          <p style={styles.pageSubtitle}>Track your book bundles and craft deliveries.</p>
        </div>

        <div>
          {orders.map(order => {
            const currentStatusIndex = getStatusIndex(order.status);
            const statusDisplay = getStatusDisplay(order.status);
            const statusColor = getStatusColor(order.status);
            const isCancelled = order.status === 'CANCELLED';
            
            // Steps for the stepper
            const steps = ['Placed', 'Processing', 'Delivered'];
            
            return (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <span style={styles.orderId}>{formatOrderId(order.id)}</span>
                    <span style={{ 
                      ...styles.statusBadge,
                      background: statusColor.bg,
                      color: statusColor.text,
                      marginLeft: 12
                    }}>
                      {statusDisplay}
                    </span>
                    <div style={styles.orderDate}>Ordered on {order.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={styles.orderTotal}>
                      {order.total > 0 && `LKR ${order.total}`}
                      {order.total > 0 && order.totalPoints > 0 && ' + '}
                      {order.totalPoints > 0 && <><i className="fa-solid fa-coins" style={{ color: '#E9C46A' }}></i> {order.totalPoints}</>}
                      {order.total === 0 && (order.totalPoints === 0 || !order.totalPoints) && 'LKR 0'}
                    </div>
                    {order.discount > 0 && <div style={{ fontSize: 12, color: '#E76F51', fontWeight: 600, marginTop: 4 }}>Saved LKR {order.discount} with points</div>}
                    {order.status === 'Placed' && (
                      <button onClick={() => handleCancelOrder(order.fullId)} style={{ marginTop: 8, background: 'none', border: 'none', color: '#E63946', cursor: 'pointer', fontSize: 14, fontWeight: 600, textDecoration: 'underline' }}>Cancel Order</button>
                    )}
                  </div>
                </div>

                <div style={styles.orderItems}>
                  {order.items.map((item, idx) => (
                    <p key={idx} style={styles.orderItemText}>
                      <i className="fa-solid fa-book" style={{ color: '#1E4D4B' }}></i> {item}
                    </p>
                  ))}
                </div>
                
                {!isCancelled ? (
                  <div style={styles.stepper}>
                    <div style={styles.stepperLine} />
                    {steps.map((step, idx) => {
                      const isActive = currentStatusIndex >= idx;
                      
                      // Icons for each step
                      const icons = [
                        <i className="fa-solid fa-file-invoice"></i>,
                        <i className="fa-solid fa-box"></i>,
                        <i className="fa-solid fa-house-chimney"></i>
                      ];
                      
                      return (
                        <div key={step} style={styles.step}>
                          <div style={{ 
                            ...styles.stepCircle, 
                            ...(isActive ? styles.stepCircleActive : {})
                          }}>
                            {icons[idx]}
                          </div>
                          <div style={{ 
                            ...styles.stepLabel, 
                            ...(isActive ? styles.stepLabelActive : {})
                          }}>
                            {step}
                          </div>
                          {isActive && idx < steps.length - 1 && (
                            <div style={{ 
                              position: 'absolute', 
                              top: 15, 
                              right: '-50%', 
                              width: '100%', 
                              height: 2, 
                              background: '#2A9D8F', 
                              zIndex: 0 
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ 
                    color: '#721C24', 
                    fontWeight: 600, 
                    textAlign: 'center', 
                    padding: '20px 0', 
                    background: '#F8D7DA', 
                    borderRadius: 8 
                  }}>
                    <i className="fa-solid fa-circle-xmark" style={{ marginRight: 8 }}></i>
                    This order was cancelled and points were refunded.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
    );
  } catch (err) {
    console.error('Render crash:', err);
    return (
      <div style={{ padding: 40, color: 'red', background: '#FFF3CD', border: '1px solid #FFEBAA', borderRadius: 8, margin: 40 }}>
        <h3>Render Error (Please report this error message):</h3>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{err.message}</pre>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>{err.stack}</pre>
      </div>
    );
  }
};

export default Orders;