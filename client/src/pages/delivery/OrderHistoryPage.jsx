import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');
  const navigate = useNavigate();

  const orders = [
    { id: '#ORD-10293', date: 'Oct 24, 2023 • 14:20', address: '482 Forest Edge Dr, Willow Creek, WA', earnings: 24.50, status: 'Completed' },
    { id: '#ORD-10288', date: 'Oct 24, 2023 • 11:45', address: '99 Spruce Ave, Apartment 4B, Seattle, WA', earnings: 18.20, status: 'Completed' },
    { id: '#ORD-10255', date: 'Oct 23, 2023 • 09:10', address: '1204 Pineview Dr, Redmond, WA', earnings: 0.00, status: 'Cancelled' },
    { id: '#ORD-10242', date: 'Oct 22, 2023 • 18:30', address: '87 Cedar Ln, Bellevue, WA', earnings: 32.15, status: 'Completed' },
    { id: '#ORD-10239', date: 'Oct 22, 2023 • 15:05', address: '233 Hemlock Way, Seattle, WA', earnings: 15.00, status: 'Completed' },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="history-container page-container">
      {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-headline-lg text-primary mb-2">Order History</h1>
          <p className="font-body-md text-on-surface-variant">Review your completed missions and performance metrics.</p>
        </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="material-symbols-outlined">inventory_2</span>
          <p className="font-label-md text-on-surface-variant mb-1" style={{ textTransform: 'uppercase' }}>Total Deliveries</p>
          <h2 className="font-headline-lg text-primary">1,284</h2>
          <p className="font-label-sm text-on-surface-variant mt-2"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> +12% from last month</p>
        </div>
        <div className="stat-card">
          <span className="material-symbols-outlined">payments</span>
          <p className="font-label-md text-on-surface-variant mb-1" style={{ textTransform: 'uppercase' }}>Total Earnings</p>
          <h2 className="font-headline-lg text-primary">$14,520.50</h2>
          <p className="font-label-sm text-on-surface-variant mt-2"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_graph</span> Top 5% of Drivers</p>
        </div>
        <div className="stat-card">
          <span className="material-symbols-outlined">star</span>
          <p className="font-label-md text-on-surface-variant mb-1" style={{ textTransform: 'uppercase' }}>Average Rating</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 className="font-headline-lg text-primary">4.92</h2>
            <span className="text-on-surface-variant">/ 5.0</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-card">
        <div style={{ flex: '1 1 320px' }}>
          <label>Search Order ID or Address</label>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }}>search</span>
            <input
              className="filters-input"
              placeholder="e.g. #ORD-9921"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>
        <div style={{ width: 180 }}>
          <label>Status</label>
          <select className="filters-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Statuses</option>
            <option>Completed</option>
            <option>Cancelled</option>
            <option>Returned</option>
          </select>
        </div>
        <div style={{ width: 180 }}>
          <label>Time Period</label>
          <select className="filters-select" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
            <option>Last 30 Days</option>
            <option>This Week</option>
            <option>Last Quarter</option>
            <option>Custom Date</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn-primary">Apply Filters</button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Delivery Address</th>
                <th style={{ textAlign: 'right' }}>Earnings</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="order-row-hover">
                  <td><span className="font-headline-md text-primary">{order.id}</span></td>
                  <td className="text-on-surface-variant">{order.date}</td>
                  <td className="max-w-xs" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.address}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>${order.earnings.toFixed(2)}</td>
                  <td>
                    <span className={`order-status-pill ${order.status === 'Completed' ? 'order-status-completed' : 'order-status-cancelled'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="text-primary" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', background: 'var(--surface-container-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--outline-variant)' }}>
          <p className="font-label-sm text-on-surface-variant">Showing 1 to {filteredOrders.length} of {orders.length} orders</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: 8, border: '1px solid var(--outline-variant)', borderRadius: 8 }} disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button style={{ padding: '6px 10px', background: 'var(--primary)', color: 'white', borderRadius: 8 }}>1</button>
            <button style={{ padding: '6px 10px', border: '1px solid var(--outline-variant)', borderRadius: 8 }}>2</button>
            <button style={{ padding: '6px 10px', border: '1px solid var(--outline-variant)', borderRadius: 8 }}>3</button>
            <button style={{ padding: 8, border: '1px solid var(--outline-variant)', borderRadius: 8 }}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
        {/* Back button positioned at bottom-left */}
        <div style={{ maxWidth: '1280px', margin: '20px 12px', paddingBottom: 32 }}>
          <button onClick={() => navigate(-1)} className="btn-back">
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
        </div>
    </div>
  );
};

export default OrderHistoryPage;