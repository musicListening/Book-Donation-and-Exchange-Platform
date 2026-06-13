// pages/staff/DonationSchedule.jsx
import React from 'react';
import StaffLayout from '../../components/StaffLayout';

function DonationSchedule() {
  const pickups = [
    { donor: 'Sarah Jenkins', location: 'Brooklyn, NY', time: '09:30 AM', boxes: '14 Boxes Est.', type: 'Residential Estate Donation' },
    { donor: 'City of NY', location: 'Manhattan, NY', time: '11:45 AM', boxes: 'Bulk Pickup', type: 'Central Library Surplus', driver: 'Marcus R.' },
  ];
  const appointments = [
    { name: 'David Wilson', type: 'Personal Collection (30+ units)', status: 'ARRIVED' },
    { name: 'Harbor High School', type: 'Textbook Drive • 200+ units', status: 'In Transit' },
  ];

  return (
    <StaffLayout>
      <div className="content-header">
        <h1>Donation Schedule</h1>
        <div className="user-info">
          <span className="user-role">ADMIN USER - LOGISTICS LEAD</span>
        </div>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Active Pickups</h3>
          <div className="stat-value">12</div>
          <div className="stat-trend">+2 Today</div>
        </div>
        <div className="stat-card">
          <h3>Calendar</h3>
          <div className="stat-value">08</div>
          <div className="stat-sub">4 Pending</div>
        </div>
        <div className="stat-card">
          <h3>List View</h3>
          <div className="stat-value">85%</div>
          <div className="stat-sub">6/7 Active</div>
        </div>
      </div>

      <div className="two-column">
        <div className="card-panel">
          <h3>Upcoming Pickups</h3>
          {pickups.map((p, idx) => (
            <div key={idx} className="pickup-item">
              <div>
                <span className="pickup-time">{p.time}</span>
                <div className="pickup-details">
                  <h4>{p.type}</h4>
                  <p>{p.donor} • {p.boxes}<br/>{p.location}</p>
                </div>
              </div>
              <div>
                <button className="btn-small">{p.driver ? 'Update Status' : 'Assign Driver'}</button>
                <button className="btn-small" style={{ marginLeft: '8px' }}>Route Details</button>
              </div>
            </div>
          ))}
        </div>
        <div className="card-panel">
          <h3>Drop-off Appointments</h3>
          <div className="search-bar"><input type="text" placeholder="Search donors..." /></div>
          {appointments.map((a, idx) => (
            <div key={idx} className="appointment-item">
              <div>
                <strong>{a.name}</strong><br/>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{a.type}</span>
              </div>
              <div>
                <span className={`status-badge ${a.status === 'ARRIVED' ? 'published' : 'in-transit'}`}>{a.status}</span>
                <button className="btn-small" style={{ marginLeft: '8px' }}>Mark Arrived</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="route-map">
        <h4>Route Map Overview</h4>
        <div className="map-placeholder">🗺️ 4 active vehicles in regional sector B-12</div>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button className="btn-primary">Manage Full Schedule</button>
      </div>
    </StaffLayout>
  );
}

export default DonationSchedule;