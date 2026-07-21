import React, { useState, useEffect } from 'react';
import '../../styles/delivery.css';

const DeliveryPersonPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Retrieve logged in user
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchOrders = async () => {
    if (!user.id) {
      setError('User not logged in or driver ID missing.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/driver/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders for the driver.');
      }
      const data = await response.json();
      setOrders(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user.id]);

  // Filter for active orders (PENDING or PROCESSING) assigned to this driver
  const activeOrders = orders.filter(
    (order) => order.status === 'PROCESSING' || order.status === 'PENDING'
  );

  // Determine current active order (Current Task)
  const currentOrder = activeOrders.find(o => o.id === selectedOrderId) || activeOrders[0];

  // The Queue contains the remaining active orders
  const queueOrders = activeOrders.filter(o => o.id !== (currentOrder?.id));

  // Helper to format order item names nicely
  const getOrderTitle = (order) => {
    if (!order.items || order.items.length === 0) return 'Delivery Items';
    const titles = order.items.map(
      (i) => i.bookItem?.title || i.collection?.title || i.craftListing?.title || 'Items'
    );
    if (titles.length === 1) return titles[0];
    return `${titles[0]} & ${titles.length - 1} other item${titles.length > 2 ? 's' : ''}`;
  };

  // Helper to calculate consistent distance and duration based on order UUID
  const getDistanceInfo = (id) => {
    if (!id) return { km: '2.0', mins: 15 };
    const charCodeSum = id.split('').slice(0, 5).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const km = ((charCodeSum % 70) / 10 + 1.5).toFixed(1);
    const mins = Math.round(km * 4 + 5);
    return { km, mins };
  };

  const handleConfirmDelivery = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          note: 'Delivered successfully by driver',
          updatedBy: user.name || 'Driver',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      // Reload orders
      await fetchOrders();
      setSelectedOrderId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '16px' }}>
        <div style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', borderWidth: '4px', borderStyle: 'solid', borderRadius: '50%', width: '48px', height: '48px', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>Loading assigned routes...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="white-card" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px', margin: '48px auto' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#dc3545', marginBottom: '16px' }}>error</span>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>Error Loading Data</h3>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '24px' }}>{error}</p>
        <button className="btn-primary" onClick={fetchOrders}>Try Again</button>
      </div>
    );
  }

  const { km, mins } = getDistanceInfo(currentOrder?.id);

  return (
    <>
      <div className="page-header">
        <h1>Delivery Details</h1>
        <p>Welcome back, {user.name || 'Driver'}! Manage your active route and upcoming tasks below.</p>
      </div>

      <div className="delivery-grid">
        {/* Current Task */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--primary)' }}>Current Task</h2>
            <button className="flex items-center gap-1" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help_outline</span>
              Need help?
            </button>
          </div>

          {currentOrder ? (
            <div className="white-card">
              {/* Map */}
              <div className="map-container">
                <img
                  alt="Route Map"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwzBuqdVMr68u9rhvoCMRzxdDadcGKE0jdpZz8Hew1MBbrWAvHKW59g6WN9m-Snb51ogd7KOMXELb6wFYOCYJ138dcHfp5cXdRvdxeaxqLf9UvzKDnNoExEnsdrcdp3cEeA1TagpnS74GHTCpejgI28s3f4R1PNhSYhO63IYOvCl2qgfQOKydfjtGav7Lz2sBkkA0E2Jn2mUDDAz0FP9-FF9EvU-KHfngnFBjW5uexISRTIa-gSYP7wb8fZPFyO6XjoN22IT0Ktrk"
                />
                <div className="map-overlay"></div>
                <div className="map-controls">
                  <button><span className="material-symbols-outlined">my_location</span></button>
                  <button><span className="material-symbols-outlined">add</span></button>
                  <button><span className="material-symbols-outlined">remove</span></button>
                </div>
                <div className="map-bottom-info">
                  <div className="info-box">
                    <div className="info-left">
                      <div className="icon-circle">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>navigation</span>
                      </div>
                      <div className="info-text">
                        <p>Active route in progress</p>
                        <p>Route to {currentOrder.shippingAddress || 'customer address'}</p>
                      </div>
                    </div>
                    <div className="info-right">
                      <div className="time">{mins} min</div>
                      <div className="dist">{km} km left</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="order-details">
                <div className="order-header">
                  <div>
                    <div className="order-id">Order #SS-{currentOrder.id.slice(0, 8).toUpperCase()}</div>
                    <h3>{getOrderTitle(currentOrder)}</h3>
                  </div>
                  <div className="badge">{currentOrder.status}</div>
                </div>

                <div className="order-address-grid">
                  <div className="space-y-6">
                    <div className="address-item">
                      <div className="icon-box" style={{ color: 'var(--on-surface-variant)' }}>
                        <span className="material-symbols-outlined">storefront</span>
                      </div>
                      <div>
                        <div className="address-label">Pick-up From</div>
                        <div className="address-name">ShareShelf Flagship Store</div>
                        <div className="address-detail">24 Literary Grove, Bloomsbury</div>
                      </div>
                    </div>
                    <div className="address-item">
                      <div className="icon-box" style={{ color: 'var(--primary)' }}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                      </div>
                      <div>
                        <div className="address-label">Delivery To</div>
                        <div className="address-name">{currentOrder.user?.name || 'Valued Customer'}</div>
                        <div className="address-detail">{currentOrder.shippingAddress || 'Address details not provided'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="delivery-notes">
                    <div className="notes-label">Delivery Notes & Contact</div>
                    <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>
                      {currentOrder.phoneNumber ? `Please call the customer upon arrival at: ${currentOrder.phoneNumber}` : 'No special delivery notes. Please verify matching ID on hand-off.'}
                    </p>
                  </div>
                </div>

                <div className="order-actions">
                  <button className="btn-primary" onClick={() => handleConfirmDelivery(currentOrder.id)}>Confirm Delivery</button>
                  {currentOrder.phoneNumber && (
                    <a href={`tel:${currentOrder.phoneNumber}`} className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined">call</span>
                      Contact Customer
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="white-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '48px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--primary)', opacity: 0.5, marginBottom: '16px' }}>local_shipping</span>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>No Active Deliveries</h3>
              <p style={{ color: 'var(--on-surface-variant)', maxWidth: '300px', margin: '0 auto' }}>You have no orders currently processing. Check back when operations staff assigns you a route!</p>
            </div>
          )}
        </section>

        {/* Queue */}
        <section className="queue-section">
          <div className="queue-header">
            <h2>Queue</h2>
            <span className="badge-count">{queueOrders.length} Pending</span>
          </div>

          {queueOrders.length > 0 ? (
            queueOrders.map((order) => {
              const { km: qKm, mins: qMins } = getDistanceInfo(order.id);
              const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
              return (
                <div 
                  key={order.id} 
                  className="queue-item" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <div className="item-header">
                    <div>
                      <div className="order-id-sm">Order #SS-{order.id.slice(0, 8).toUpperCase()}</div>
                      <h4>{getOrderTitle(order)}</h4>
                    </div>
                    <span className="time">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="item-meta">
                    <span className="meta-chip"><span className="material-symbols-outlined">near_me</span> {qKm} km</span>
                    <span className="meta-chip"><span className="material-symbols-outlined">timer</span> {qMins} min</span>
                  </div>
                  <div className="item-footer">
                    <span className="item-info"><span className="material-symbols-outlined">package</span> {itemCount} Item{itemCount !== 1 ? 's' : ''} • {(itemCount * 0.4).toFixed(1)} kg</span>
                    <span className="arrow-icon material-symbols-outlined">arrow_forward_ios</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ border: '2px dashed var(--outline)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '150px', padding: '32px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--on-surface-variant)', opacity: 0.7, marginBottom: '8px' }}>list_alt</span>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', margin: 0 }}>Queue is empty.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default DeliveryPersonPage;