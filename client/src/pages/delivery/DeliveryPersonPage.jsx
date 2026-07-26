import React, { useState, useEffect } from 'react';
import '../../styles/delivery.css';
import { API_BASE } from '../../services/api';

const DeliveryPersonPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [queueOrders, setQueueOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        fetchAssignedOrders(user.id || user.userId);
      } catch (e) {
        console.error('Error parsing user data:', e);
        setError('Failed to load user data');
        setLoading(false);
      }
    } else {
      setError('No user data found. Please login again.');
      setLoading(false);
    }
  }, []);

  // Fetch assigned orders for this driver
  const fetchAssignedOrders = async (driverId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE}/orders/driver/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Orders for driver:', data);

      // Safe extraction of orders whether it's an array or an object containing 'orders'
      const ordersList = Array.isArray(data) ? data : (data.orders || []);

      // Find all active orders (PENDING or PROCESSING)
      const activeOrders = ordersList.filter(
        order => order.status === 'PENDING' || order.status === 'PROCESSING'
      );
      
      const activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;
      const queuedActiveOrders = activeOrders.slice(1);

      setCurrentOrder(activeOrder);
      setQueueOrders(queuedActiveOrders);
      
    } catch (error) {
      console.error('❌ Error fetching assigned orders:', error);
      setError(error.message || 'Failed to load your assigned orders');
    } finally {
      setLoading(false);
    }
  };

  // Confirm delivery
  const handleConfirmDelivery = async (orderId) => {
    if (!orderId) {
      alert('No order to confirm');
      return;
    }

    if (!window.confirm('Confirm delivery for this order?')) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          note: 'Delivered successfully by delivery personnel',
          updatedBy: currentUser?.name || 'Delivery Personnel',
          location: 'Delivered to customer'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to confirm delivery');
      }

      const updatedOrder = await response.json();
      console.log('✅ Delivery confirmed:', updatedOrder);

      alert('✅ Order delivered successfully!');
      
      // Refresh the orders
      fetchAssignedOrders(currentUser.id || currentUser.userId);
      
    } catch (error) {
      console.error('❌ Error confirming delivery:', error);
      alert('Failed to confirm delivery: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    if (currentUser) {
      fetchAssignedOrders(currentUser.id || currentUser.userId);
    }
  };

  const handleQueueItemClick = (clickedOrder) => {
    const newQueue = queueOrders.filter(o => o.id !== clickedOrder.id);
    if (currentOrder) {
      newQueue.push(currentOrder);
    }
    setQueueOrders(newQueue);
    setCurrentOrder(clickedOrder);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': { bg: '#fff3e0', color: '#e65100', label: '🟡 Pending' },
      'PROCESSING': { bg: '#e3f2fd', color: '#0d47a1', label: '🟠 Processing' },
      'COMPLETED': { bg: '#e8f5e9', color: '#2e7d32', label: '✅ Completed' },
      'CANCELLED': { bg: '#fce4ec', color: '#c62828', label: '❌ Cancelled' }
    };
    return styles[status] || styles['PENDING'];
  };

  if (loading) {
    return (
      <>
        <div className="page-header">
          <h1>Delivery Details</h1>
          <p>Loading your assigned orders...</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#64748b' }}>Loading delivery information...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="page-header">
          <h1>Delivery Details</h1>
          <p style={{ color: '#dc3545' }}>❌ {error}</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={refreshData}
            style={{ padding: '10px 24px' }}
          >
            🔄 Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Delivery Details</h1>
        <p>
          Welcome back {currentUser?.name || 'Delivery Person'}! 
          {currentOrder ? ' Manage your active route below.' : ' No active deliveries at the moment.'}
        </p>
      </div>

      <div className="delivery-grid">
        {/* Current Task */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--primary)' }}>
              {currentOrder ? 'Current Task' : 'No Active Delivery'}
            </h2>
            <button 
              className="flex items-center gap-1" 
              onClick={refreshData}
              style={{ 
                color: 'var(--primary)', 
                fontSize: '14px', 
                fontWeight: 600, 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              Refresh
            </button>
          </div>

          {currentOrder ? (
            <div className="white-card">
              {/* Delivery Map Wallpaper with Navigation Controls */}
              <div className="map-container" style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '360px',
                backgroundColor: '#e5e3df',
                borderRadius: '16px 16px 0 0'
              }}>
                {/* Google Map Iframe */}
                <iframe
                  title="Google Maps Location"
                  width="100%"
                  height="100%"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                    zIndex: 0,
                    filter: 'contrast(1.05) saturate(1.1)'
                  }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(currentOrder.shippingAddress || 'Kandy, Sri Lanka')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                ></iframe>

                {/* Left & Right visual side overlays matching design screenshot */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: '60px',
                  background: 'linear-gradient(to right, rgba(15, 61, 62, 0.75), rgba(15, 61, 62, 0))',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}></div>

                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '60px',
                  background: 'linear-gradient(to left, rgba(15, 61, 62, 0.75), rgba(15, 61, 62, 0))',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}></div>

                {/* Top Right Controls (Target, Plus, Minus) */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#ffffff',
                  borderRadius: '10px',
                  padding: '2px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)'
                }}>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentOrder.shippingAddress || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3C34', textDecoration: 'none' }}
                    title="Open Navigation in Google Maps"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>my_location</span>
                  </a>
                  <div style={{ height: '1px', background: '#E5E7EB', margin: '0 6px' }}></div>
                  <button 
                    style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3C34' }}
                    title="Zoom in"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 'bold' }}>add</span>
                  </button>
                  <div style={{ height: '1px', background: '#E5E7EB', margin: '0 6px' }}></div>
                  <button 
                    style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3C34' }}
                    title="Zoom out"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 'bold' }}>remove</span>
                  </button>
                </div>

                {/* Bottom Floating Navigation Banner */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  zIndex: 2,
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '14px 20px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#1A3C34',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1", transform: 'rotate(-45deg)' }}>navigation</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827', marginBottom: '2px' }}>
                        Next turn in 400m
                      </div>
                      <div style={{ fontSize: '13px', color: '#6B7280' }}>
                        Turn right onto {currentOrder.shippingAddress || 'Bloomsbury Way'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '17px', color: '#1A3C34', marginBottom: '2px' }}>
                      8 min
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                      1.2 km left
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="order-details">
                <div className="order-header">
                  <div>
                    <div className="order-id">Order #{currentOrder.id?.slice(0, 8) || 'N/A'}</div>
                    <h3>
                      {currentOrder.items?.length || 0} items • {currentOrder.totalPoints || 0} points
                      {currentOrder.cashAmount && ` • $${currentOrder.cashAmount}`}
                    </h3>
                  </div>
                  <div className="badge" style={{
                    background: getStatusBadge(currentOrder.status).bg,
                    color: getStatusBadge(currentOrder.status).color,
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid transparent'
                  }}>
                    {getStatusBadge(currentOrder.status).label}
                  </div>
                </div>

                <div className="order-address-grid">
                  <div className="space-y-6">
                    <div className="address-item">
                      <div className="icon-box" style={{ color: 'var(--primary)' }}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                      </div>
                      <div>
                        <div className="address-label">Delivery To</div>
                        <div className="address-name">{currentOrder.user?.name || 'Customer'}</div>
                        <div className="address-detail">
                          {currentOrder.shippingAddress || 'No address provided'}
                          {currentOrder.phoneNumber && (
                            <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                              📞 {currentOrder.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {currentOrder.note && (
                    <div className="delivery-notes">
                      <div className="notes-label">Delivery Notes</div>
                      <p>"{currentOrder.note}"</p>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  <button 
                    className="btn-primary" 
                    onClick={() => handleConfirmDelivery(currentOrder.id)}
                    disabled={updating}
                    style={{ 
                      opacity: updating ? 0.6 : 1,
                      cursor: updating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {updating ? '⏳ Confirming...' : 'Confirm Delivery'}
                  </button>
                  {currentOrder.shippingAddress && (
                    <a 
                      className="btn-secondary"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentOrder.shippingAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span className="material-symbols-outlined">map</span>
                      Open in Maps
                    </a>
                  )}
                  {currentOrder.phoneNumber && (
                    <button 
                      className="btn-secondary"
                      onClick={() => window.location.href = `tel:${currentOrder.phoneNumber}`}
                    >
                      <span className="material-symbols-outlined">call</span>
                      Contact Customer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="white-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '72px', marginBottom: '16px' }}>🚚</div>
              <h3 style={{ color: '#1E4D4B', marginBottom: '8px' }}>No active deliveries</h3>
              <p style={{ color: '#64748b' }}>You'll see your assigned orders here once they're dispatched.</p>
              {queueOrders.length > 0 && (
                <p style={{ fontSize: '13px', marginTop: '8px', color: '#e65100' }}>
                  ⏳ {queueOrders.length} orders waiting in queue
                </p>
              )}
            </div>
          )}
        </section>

        {/* Queue */}
        <section className="queue-section">
          <div className="queue-header">
            <h2>Queue</h2>
            <span className="badge-count">{queueOrders.length} Waiting</span>
          </div>

          {queueOrders.length === 0 ? (
            <div className="queue-item" style={{ textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
              <p>No orders in queue</p>
              <p style={{ fontSize: '12px', opacity: '0.7' }}>Assigned orders waiting to be delivered will appear here</p>
            </div>
          ) : (
            queueOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              return (
              <div key={order.id} className="queue-item" onClick={() => handleQueueItemClick(order)} style={{ cursor: 'pointer' }}>
                <div className="item-header">
                  <div>
                    <div className="order-id-sm">Order #{order.id?.slice(0, 8)}</div>
                    <h4>{order.items?.length || 0} items • {order.totalPoints || 0} pts</h4>
                  </div>
                  <span className="time" style={{ fontSize: '12px', color: badge.color, backgroundColor: badge.bg, padding: '4px 8px', borderRadius: '12px', fontWeight: '600' }}>
                    {badge.label}
                  </span>
                </div>
                <div className="item-meta">
                  <span className="meta-chip">
                    <span className="material-symbols-outlined">location_on</span>
                    {order.shippingAddress?.slice(0, 25) || 'N/A'}
                  </span>
                  <span className="meta-chip">
                    <span className="material-symbols-outlined">schedule</span>
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="item-footer">
                  <span className="item-info">
                    <span className="material-symbols-outlined">pending_actions</span>
                    Waiting
                  </span>
                  <span className="arrow-icon material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            )})
          )}
        </section>
      </div>
    </>
  );
};

export default DeliveryPersonPage;