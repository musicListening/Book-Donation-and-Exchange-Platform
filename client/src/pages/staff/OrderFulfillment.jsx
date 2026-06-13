// pages/staff/OrderFulfillment.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function OrderFulfillment() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });

  useEffect(() => {
    // Get logged-in user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'LOGISTICS STAFF'
      });
    }
  }, []);

  const shipments = [
    { id: '#SL-92410', recipient: 'Colombo Public Library', location: 'Colombo 01', items: '45 Books', status: 'In Transit', lastUpdate: '2 hours ago', driver: 'Priyantha Silva' },
    { id: '#SL-92408', recipient: 'University of Peradeniya', location: 'Kandy', items: '120 Books', status: 'Delayed', lastUpdate: '5 mins ago', driver: 'Kamal Perera' },
    { id: '#SL-92405', recipient: 'Galle Heritage Foundation', location: 'Galle', items: '28 Books', status: 'On Time', lastUpdate: '1 hour ago', driver: 'Sunil Jayasinghe' },
    { id: '#SL-92400', recipient: 'Jaffna Public Library', location: 'Jaffna', items: '32 Books', status: 'On Time', lastUpdate: '3 hours ago', driver: 'Ramesh Kumar' },
    { id: '#SL-92395', recipient: 'Kandy Municipal Council', location: 'Kandy', items: '85 Books', status: 'In Transit', lastUpdate: '30 mins ago', driver: 'Nimal Weerasinghe' },
    { id: '#SL-92390', recipient: 'Negombo Community Center', location: 'Negombo', items: '22 Books', status: 'Delivered', lastUpdate: '6 hours ago', driver: 'Chaminda Rathnayake' },
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return currentUser.name[0].toUpperCase();
    }
    return 'LM';
  };

  return (
    <StaffLayout>
      <div className="content-header">
        <h1>Order Fulfillment - Sri Lanka Logistics</h1>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>
      <p style={{ marginBottom: '16px', color: '#64748b' }}>Real-time logistics and shipment management across Sri Lanka</p>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Active Shipments</h3>
          <div className="stat-value">342</div>
          <div className="stat-sub">View All Active Shipments →</div>
        </div>
        <div className="stat-card">
          <h3>On Time Delivery</h3>
          <div className="stat-value">96%</div>
          <div className="stat-trend">▲ +8% from last month</div>
        </div>
        <div className="stat-card">
          <h3>Delivered Today</h3>
          <div className="stat-value">124</div>
          <div className="stat-trend">Target Reached ✓</div>
        </div>
        <div className="stat-card">
          <h3>Active Drivers</h3>
          <div className="stat-value">28</div>
          <div className="stat-sub">Across 9 provinces</div>
        </div>
      </div>

      <div className="card-panel" style={{ marginBottom: '24px' }}>
        <div className="filter-bar">
          <span className="filter-chip active">All</span>
          <span className="filter-chip">In Transit</span>
          <span className="filter-chip">Delayed</span>
          <span className="filter-chip">On Time</span>
          <span className="filter-chip">Delivered</span>
          <button className="btn-secondary" style={{ marginLeft: 'auto' }}>Export Report 📄</button>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>RECIPIENT</th>
                <th>LOCATION</th>
                <th>ITEMS</th>
                <th>DRIVER</th>
                <th>STATUS</th>
                <th>LAST UPDATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.id}</strong></td>
                  <td>{s.recipient}</td>
                  <td>{s.location}</td>
                  <td>{s.items}</td>
                  <td>{s.driver}</td>
                  <td>
                    <span className={`status-badge ${s.status.toLowerCase().replace(' ', '-')}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>{s.lastUpdate}</td>
                  <td><button className="btn-small">Track</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing 1-6 of 342 active shipments</span>
          <button className="new-donation-btn">+ New Shipment</button>
        </div>
      </div>

      <div className="two-column">
        <div className="card-panel">
          <h3>Carrier Integration</h3>
          <p>Logistics partners currently operational across Sri Lanka. API latency is within normal range (38ms).</p>
          <div className="stat-trend" style={{ marginTop: '12px' }}>✓ Sri Lanka Post • Private Couriers • Regional Hubs Connected</div>
        </div>
        <div className="card-panel">
          <h3>Warehouse Status</h3>
          <p>Colombo main hub at 78% capacity. Kandy regional hub processing high volume.</p>
          <div className="stat-trend" style={{ marginTop: '12px' }}>📦 1,284 books ready for dispatch</div>
          <div className="stat-trend negative" style={{ marginTop: '8px' }}>⚠️ Additional driver needed for Galle route</div>
        </div>
      </div>
    </StaffLayout>
  );
}

export default OrderFulfillment;