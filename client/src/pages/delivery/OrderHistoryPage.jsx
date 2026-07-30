import React, { useState, useEffect } from 'react';
import '../../styles/delivery.css';
import { API_BASE } from '../../services/api';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const getUserId = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.id || u.userId || u._id) return u.id || u.userId || u._id;
      const ss = JSON.parse(localStorage.getItem('ss_current_user') || '{}');
      return ss.id || ss.userId || ss._id;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = getUserId();
      if (!userId) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/orders/driver/${userId}`, { headers });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch order history.');
        }
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : (data.orders || []));
        setError('');
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError(err.message || 'Failed to fetch order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter for completed/cancelled
  const historyOrders = orders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'CANCELLED'
  );

  // Apply search & status filters
  const filteredOrders = historyOrders.filter((order) => {
    const matchesSearch = searchTerm === ''
      || order.id.toLowerCase().includes(searchTerm.toLowerCase())
      || (order.shippingAddress || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses'
      || order.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Driver per-delivery payout calculation (Rs. 450 LKR standard payout per delivery)
  const getOrderEarningsLkr = (o) => {
    if (o.cashAmount && o.cashAmount > 0) {
      return o.cashAmount <= 100 ? o.cashAmount * 300 : o.cashAmount;
    }
    return 450; // Standard Rs. 450 LKR driver fee per completed delivery
  };
  const completedCount = historyOrders.filter(o => o.status === 'COMPLETED').length;
  const totalEarningsLkr = historyOrders.reduce((sum, o) => sum + (o.status === 'COMPLETED' ? getOrderEarningsLkr(o) : 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' • '
      + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatOrderId = (id) => {
    if (!id) return '#SS-00000000';
    if (id.startsWith('ORD-')) return `#SS-${id.toUpperCase()}`;
    return `#SS-${id.slice(0, 8).toUpperCase()}`;
  };

  return (
    <>
      <div className="page-header">
        <h1 style={{ fontSize: '28px' }}>Order History</h1>
        <p>Review your completed missions and performance metrics.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 20, top: 16, opacity: 0.15, color: '#1A3C34' }}>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            <path d="m3.3 7 8.7 5 8.7-5"/>
            <path d="M12 22V12"/>
          </svg>
          <div className="stat-label">TOTAL DELIVERIES</div>
          <div className="stat-value">{loading ? '...' : completedCount}</div>
          <div className="stat-trend">
            <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: 4 }}></i>
            From order history
          </div>
        </div>

        <div className="stat-card">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 20, top: 16, opacity: 0.15, color: '#1A3C34' }}>
            <rect width="20" height="12" x="2" y="6" rx="2"/>
            <circle cx="12" cy="12" r="2"/>
            <path d="M6 12h.01M18 12h.01"/>
          </svg>
          <div className="stat-label">TOTAL EARNINGS</div>
          <div className="stat-value">{loading ? '...' : `Rs. ${totalEarningsLkr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
          <div className="stat-trend">
            <i className="fa-solid fa-chart-line" style={{ marginRight: 4 }}></i>
            Based on order data
          </div>
        </div>

        <div className="stat-card">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 20, top: 16, opacity: 0.15, color: '#1A3C34' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <div className="stat-label">TOTAL ORDERS</div>
          <div className="stat-value">{loading ? '...' : historyOrders.length}</div>
          <div className="stat-trend">
            <i className="fa-solid fa-list-check" style={{ marginRight: 4 }}></i>
            Completed & Cancelled
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Search Order ID or Address</label>
          <div className="input-icon">
            <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}></i>
            <input
              type="text"
              placeholder="e.g. #SS-8291"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group w-56">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Statuses</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-scroll no-scrollbar">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>Loading order history...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>No orders found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Delivery Address</th>
                  <th>Earnings</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td><span className="order-id">{formatOrderId(order.id)}</span></td>
                    <td>{formatDate(order.deliveredAt || order.createdAt)}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>{order.shippingAddress || 'N/A'}</td>
                    <td><span className="earnings">Rs. {(order.status === 'COMPLETED' ? getOrderEarningsLkr(order) : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                    <td>
                      <span className={`status-badge ${order.status === 'COMPLETED' ? 'completed' : 'cancelled'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="pagination">
          <span className="info">Showing {filteredOrders.length} of {historyOrders.length} orders</span>
        </div>
      </div>
    </>
  );
};

export default OrderHistoryPage;