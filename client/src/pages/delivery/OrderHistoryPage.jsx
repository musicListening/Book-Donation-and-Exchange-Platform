import React, { useState, useEffect } from 'react';
import '../../styles/delivery.css';

const OrderHistoryPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user.id) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/driver/${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch order history.');
        const data = await res.json();
        setOrders(data);
        setError('');
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.id]);

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

  // Stats computed from actual data
  const completedCount = historyOrders.filter(o => o.status === 'COMPLETED').length;
  const totalEarnings = historyOrders.reduce((sum, o) => sum + (o.cashAmount || o.totalPoints * 0.5), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' • '
      + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="page-header">
        <h1 style={{ fontSize: '40px' }}>Order History</h1>
        <p>Review your completed missions and performance metrics.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="bg-icon material-symbols-outlined">inventory_2</span>
          <div className="stat-label">Total Deliveries</div>
          <div className="stat-value">{loading ? '...' : completedCount}</div>
          <div className="stat-trend">
            <span className="material-symbols-outlined">trending_up</span>
            From order history
          </div>
        </div>
        <div className="stat-card">
          <span className="bg-icon material-symbols-outlined">payments</span>
          <div className="stat-label">Total Earnings</div>
          <div className="stat-value">{loading ? '...' : `$${totalEarnings.toFixed(2)}`}</div>
          <div className="stat-trend">
            <span className="material-symbols-outlined">auto_graph</span>
            Based on order data
          </div>
        </div>
        <div className="stat-card">
          <span className="bg-icon material-symbols-outlined">star</span>
          <div className="stat-label">Total Orders</div>
          <div className="flex items-baseline gap-2">
            <div className="stat-value" style={{ fontSize: '32px', display: 'inline' }}>{loading ? '...' : historyOrders.length}</div>
          </div>
          <div className="stat-trend">
            <span className="material-symbols-outlined">format_list_numbered</span>
            Completed & Cancelled
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Search Order ID or Address</label>
          <div className="input-icon">
            <span className="material-symbols-outlined">search</span>
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
                    <td><span className="order-id">#SS-{order.id.slice(0, 8).toUpperCase()}</span></td>
                    <td>{formatDate(order.deliveredAt || order.createdAt)}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>{order.shippingAddress || 'N/A'}</td>
                    <td><span className="earnings">${(order.cashAmount || order.totalPoints * 0.5).toFixed(2)}</span></td>
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