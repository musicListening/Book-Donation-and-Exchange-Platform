// pages/staff/OrderFulfillment.jsx (note the .jsx extension and correct path)
import React from 'react';
import StaffLayout from '../../components/StaffLayout';  // Fixed import path

function OrderFulfillment() {
  const shipments = [
    { id: '#RB-92410', recipient: 'Sarah Jenkins', items: '12 Books', status: 'In Transit', lastUpdate: '2 hours ago' },
    { id: '#RB-92408', recipient: 'Austin Community Library', items: '45 Books', status: 'Delayed', lastUpdate: '5 mins ago' },
    { id: '#RB-92405', recipient: 'Brooklyn School District', items: '120 Books', status: 'On Time', lastUpdate: '1 hour ago' },
    { id: '#RB-92400', recipient: 'Harlem Literacy Center', items: '28 Books', status: 'On Time', lastUpdate: '3 hours ago' },
  ];

  return (
    <StaffLayout>  {/* Wrap with StaffLayout instead of using Sidebar directly */}
      <div className="content-header">
        <h1>Order Fulfillment</h1>
        <div className="user-info">
          <span className="user-role">LOGISTICS MANAGER</span>
        </div>
      </div>
      <p style={{ marginBottom: '16px', color: '#64748b' }}>Real-time logistics and shipment management</p>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Active Shipments</h3>
          <div className="stat-value">248</div>
          <div className="stat-sub">View All Active Shipments →</div>
        </div>
        <div className="stat-card">
          <h3>On Time</h3>
          <div className="stat-value">94%</div>
          <div className="stat-trend">▲ +5%</div>
        </div>
        <div className="stat-card">
          <h3>Delivered Today</h3>
          <div className="stat-value">85</div>
          <div className="stat-trend">Target Reached ✓</div>
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
                <th>ITEMS</th>
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
                  <td>{s.items}</td>
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
      </div>

      <div className="two-column">
        <div className="card-panel">
          <h3>Carrier Integration</h3>
          <p>Logistics partners currently operational. API latency is within normal range (42ms).</p>
          <div className="stat-trend" style={{ marginTop: '12px' }}>✓ UPS • FedEx • DHL Connected</div>
        </div>
        <div className="card-panel">
          <h3>Warehouse Status</h3>
          <p>Packing station 4 is currently idle. Volume predicted to increase by 20% in next cycle.</p>
          <div className="stat-trend negative" style={{ marginTop: '12px' }}>⚠️ Staff needed at Station 2</div>
        </div>
      </div>
    </StaffLayout>
  );
}

export default OrderFulfillment;