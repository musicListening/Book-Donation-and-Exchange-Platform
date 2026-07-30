import React, { useState, useEffect } from 'react';
import '../../styles/delivery.css';
import { API_BASE } from '../../services/api';

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
        const token = localStorage.getItem('token');
        
        const res = await fetch(`${API_BASE}/orders/driver/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to fetch order history: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('📦 Order history data:', data);
        
        // Extract orders from the response
        let ordersList = [];
        if (Array.isArray(data)) {
          ordersList = data;
        } else if (data.orders && Array.isArray(data.orders)) {
          ordersList = data.orders;
        } else {
          ordersList = [];
        }
        
        setOrders(ordersList);
        setError('');
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.id]);

  // Filter for completed/cancelled
  const historyOrders = orders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'CANCELLED' || o.status === 'DELIVERED'
  );

  // Apply search & status filters
  const filteredOrders = historyOrders.filter((order) => {
    const matchesSearch = searchTerm === ''
      || (order.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      || (order.shippingAddress || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses'
      || order.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Driver per-delivery payout calculation
  const getOrderEarningsLkr = (o) => {
    if (o.cashAmount && o.cashAmount > 0) {
      return o.cashAmount <= 100 ? o.cashAmount * 300 : o.cashAmount;
    }
    return 450;
  };
  
  const completedCount = historyOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
  const totalEarningsLkr = historyOrders.reduce((sum, o) => {
    if (o.status === 'COMPLETED' || o.status === 'DELIVERED') {
      return sum + getOrderEarningsLkr(o);
    }
    return sum;
  }, 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' • '
      + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <>
        <div className="page-header">
          <h1>Order History</h1>
          <p>Loading your order history...</p>
        </div>
        <div className="loading-state">
          <span className="loading-spinner">⏳</span>
          <p>Loading your orders...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Order History</h1>
        <p>Review your completed missions and performance metrics.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="bg-icon material-symbols-outlined">inventory_2</span>
          <div className="stat-label">Total Deliveries</div>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-trend">
            <span className="material-symbols-outlined">trending_up</span>
            From order history
          </div>
        </div>
        <div className="stat-card">
          <span className="bg-icon material-symbols-outlined">payments</span>
          <div className="stat-label">Total Earnings</div>
          <div className="stat-value">Rs. {totalEarningsLkr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="stat-trend">
            <span className="material-symbols-outlined">auto_graph</span>
            Based on order data
          </div>
        </div>
        <div className="stat-card">
          <span className="bg-icon material-symbols-outlined">star</span>
          <div className="stat-label">Total Orders</div>
          <div className="flex items-baseline gap-2">
            <div className="stat-value" style={{ fontSize: '32px', display: 'inline' }}>{historyOrders.length}</div>
          </div>
          <div className="stat-trend">
            <span className="material-symbols-outlined">format_list_numbered</span>
            Completed & Cancelled
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

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
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              {historyOrders.length === 0 ? 'No completed or cancelled orders found.' : 'No orders match your filters.'}
            </div>
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
                    <td>{formatDate(order.deliveredAt || order.updatedAt || order.createdAt)}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>{order.shippingAddress || 'N/A'}</td>
                    <td><span className="earnings">Rs. {(order.status === 'COMPLETED' || order.status === 'DELIVERED' ? getOrderEarningsLkr(order) : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                    <td>
                      <span className={`status-badge ${order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'completed' : 'cancelled'}`}>
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