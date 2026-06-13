// pages/staff/DonationSchedule.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function DonationSchedule() {
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

  const pickups = [
    { donor: 'Malini Perera', location: 'Colombo 07', time: '09:30 AM', boxes: '14 Boxes Est.', type: 'Residential Estate Donation' },
    { donor: 'University of Peradeniya', location: 'Kandy', time: '11:45 AM', boxes: 'Bulk Pickup', type: 'Academic Library Surplus', driver: 'Kamal Silva' },
    { donor: 'Nuwara Eliya Public Library', location: 'Nuwara Eliya', time: '02:15 PM', boxes: '8 Boxes Est.', type: 'Community Library Donation' },
  ];
  
  const appointments = [
    { name: 'Dr. Anura Bandaranaike', type: 'Personal Collection (50+ units)', status: 'ARRIVED' },
    { name: 'Royal College Colombo', type: 'Textbook Drive • 300+ units', status: 'In Transit' },
    { name: 'Galle Heritage Foundation', type: 'Historical Collection (25+ units)', status: 'SCHEDULED' },
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
    return 'SU';
  };

  return (
    <StaffLayout>
      <div className="content-header">
        <h1>Donation Schedule</h1>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Active Pickups</h3>
          <div className="stat-value">18</div>
          <div className="stat-trend">+5 Today</div>
          <div className="stat-sub">Across Western Province</div>
        </div>
        <div className="stat-card">
          <h3>Calendar</h3>
          <div className="stat-value">12</div>
          <div className="stat-sub">Scheduled Pickups</div>
        </div>
        <div className="stat-card">
          <h3>Completion Rate</h3>
          <div className="stat-value">92%</div>
          <div className="stat-sub">Last 30 days</div>
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
          <div className="search-bar">
            <input type="text" placeholder="Search donors..." />
          </div>
          {appointments.map((a, idx) => (
            <div key={idx} className="appointment-item">
              <div>
                <strong>{a.name}</strong><br/>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{a.type}</span>
              </div>
              <div>
                <span className={`status-badge ${a.status === 'ARRIVED' ? 'published' : a.status === 'In Transit' ? 'in-transit' : 'draft'}`}>
                  {a.status}
                </span>
                <button className="btn-small" style={{ marginLeft: '8px' }}>
                  {a.status === 'ARRIVED' ? 'Complete' : 'Mark Arrived'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="route-map">
        <h4>Route Map Overview - Western & Central Provinces</h4>
        <div className="map-placeholder">
          🗺️ 6 active vehicles operating in Colombo, Kandy, Galle, and Negombo regions
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button className="btn-primary">Manage Full Schedule</button>
        <button className="btn-secondary">Export Route Plan</button>
      </div>
    </StaffLayout>
  );
}

export default DonationSchedule;