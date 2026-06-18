// pages/staff/DonationSchedule.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function DonationSchedule() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [pickups] = useState([
    { id: 1, donor: 'Malini Perera', location: 'Colombo 07', time: '09:30 AM', boxes: '14 Boxes Est.', type: 'Residential Estate Donation', driver: '' },
    { id: 2, donor: 'University of Peradeniya', location: 'Kandy', time: '11:45 AM', boxes: 'Bulk Pickup', type: 'Academic Library Surplus', driver: 'Kamal Silva' },
    { id: 3, donor: 'Nuwara Eliya Public Library', location: 'Nuwara Eliya', time: '02:15 PM', boxes: '8 Boxes Est.', type: 'Community Library Donation', driver: '' },
  ]);
  
  const [appointments] = useState([
    { id: 1, name: 'Dr. Anura Bandaranaike', type: 'Personal Collection (50+ units)', status: 'ARRIVED' },
    { id: 2, name: 'Royal College Colombo', type: 'Textbook Drive • 300+ units', status: 'In Transit' },
    { id: 3, name: 'Galle Heritage Foundation', type: 'Historical Collection (25+ units)', status: 'SCHEDULED' },
  ]);

  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingPickup, setEditingPickup] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [pickupForm, setPickupForm] = useState({ donor: '', location: '', time: '', boxes: '', type: '', driver: '' });
  const [appointmentForm, setAppointmentForm] = useState({ name: '', type: '', status: 'SCHEDULED' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'LOGISTICS STAFF'
      });
    }
  }, []);

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

  // Placeholder CRUD functions
  const handleAddPickup = () => {
    console.log('Add pickup:', pickupForm);
    setShowPickupModal(false);
  };

  const handleEditPickup = (pickup) => {
    setEditingPickup(pickup);
    setPickupForm(pickup);
    setShowPickupModal(true);
  };

  const handleUpdatePickup = () => {
    console.log('Update pickup:', editingPickup, pickupForm);
    setShowPickupModal(false);
    setEditingPickup(null);
  };

  const handleDeletePickup = (id) => {
    console.log('Delete pickup:', id);
  };

  const handleAddAppointment = () => {
    console.log('Add appointment:', appointmentForm);
    setShowAppointmentModal(false);
  };

  const handleEditAppointment = (appt) => {
    setEditingAppointment(appt);
    setAppointmentForm(appt);
    setShowAppointmentModal(true);
  };

  const handleUpdateAppointment = () => {
    console.log('Update appointment:', editingAppointment, appointmentForm);
    setShowAppointmentModal(false);
    setEditingAppointment(null);
  };

  const handleDeleteAppointment = (id) => {
    console.log('Delete appointment:', id);
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
          <div className="stat-value">{pickups.length}</div>
          <div className="stat-trend">+5 Today</div>
          <div className="stat-sub">Across Western Province</div>
        </div>
        <div className="stat-card">
          <h3>Calendar</h3>
          <div className="stat-value">{appointments.length}</div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Upcoming Pickups</h3>
            <button className="new-donation-btn" onClick={() => { setEditingPickup(null); setPickupForm({ donor: '', location: '', time: '', boxes: '', type: '', driver: '' }); setShowPickupModal(true); }}>
              + Add Pickup
            </button>
          </div>
          {pickups.map((p) => (
            <div key={p.id} className="pickup-item">
              <div>
                <span className="pickup-time">{p.time}</span>
                <div className="pickup-details">
                  <h4>{p.type}</h4>
                  <p>{p.donor} • {p.boxes}<br/>{p.location}</p>
                  {p.driver && <p style={{ fontSize: '12px', color: '#1E4D4B', marginTop: '4px' }}>Driver: {p.driver}</p>}
                </div>
              </div>
              <div>
                <button className="btn-small" onClick={() => handleEditPickup(p)}>Edit</button>
                <button className="btn-small" onClick={() => handleDeletePickup(p.id)} style={{ marginLeft: '8px', background: '#dc3545', color: 'white' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Drop-off Appointments</h3>
            <button className="new-donation-btn" onClick={() => { setEditingAppointment(null); setAppointmentForm({ name: '', type: '', status: 'SCHEDULED' }); setShowAppointmentModal(true); }}>
              + Add Appointment
            </button>
          </div>
          {appointments.map((a) => (
            <div key={a.id} className="appointment-item">
              <div>
                <strong>{a.name}</strong><br/>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{a.type}</span>
              </div>
              <div>
                <span className={`status-badge ${a.status === 'ARRIVED' ? 'published' : a.status === 'In Transit' ? 'in-transit' : 'draft'}`}>
                  {a.status}
                </span>
                <button className="btn-small" onClick={() => handleEditAppointment(a)} style={{ marginLeft: '8px' }}>Edit</button>
                <button className="btn-small" onClick={() => handleDeleteAppointment(a.id)} style={{ marginLeft: '8px', background: '#dc3545', color: 'white' }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pickup Modal - UI only */}
      {showPickupModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%' }}>
            <h2 style={{ color: '#1E4D4B', marginBottom: '20px' }}>{editingPickup ? 'Edit Pickup' : 'Add New Pickup'}</h2>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Donor Name</label>
              <input type="text" className="form-control" value={pickupForm.donor} onChange={(e) => setPickupForm({...pickupForm, donor: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Location</label>
              <input type="text" className="form-control" value={pickupForm.location} onChange={(e) => setPickupForm({...pickupForm, location: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Time</label>
              <input type="text" className="form-control" value={pickupForm.time} onChange={(e) => setPickupForm({...pickupForm, time: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Boxes</label>
              <input type="text" className="form-control" value={pickupForm.boxes} onChange={(e) => setPickupForm({...pickupForm, boxes: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Type</label>
              <input type="text" className="form-control" value={pickupForm.type} onChange={(e) => setPickupForm({...pickupForm, type: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Driver (optional)</label>
              <input type="text" className="form-control" value={pickupForm.driver} onChange={(e) => setPickupForm({...pickupForm, driver: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setShowPickupModal(false); setEditingPickup(null); }} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button className="btn-primary" onClick={editingPickup ? handleUpdatePickup : handleAddPickup} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>{editingPickup ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal - UI only */}
      {showAppointmentModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%' }}>
            <h2 style={{ color: '#1E4D4B', marginBottom: '20px' }}>{editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}</h2>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Name</label>
              <input type="text" className="form-control" value={appointmentForm.name} onChange={(e) => setAppointmentForm({...appointmentForm, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Type</label>
              <input type="text" className="form-control" value={appointmentForm.type} onChange={(e) => setAppointmentForm({...appointmentForm, type: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Status</label>
              <select className="form-control" value={appointmentForm.status} onChange={(e) => setAppointmentForm({...appointmentForm, status: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
                <option value="SCHEDULED">Scheduled</option>
                <option value="In Transit">In Transit</option>
                <option value="ARRIVED">Arrived</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setShowAppointmentModal(false); setEditingAppointment(null); }} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button className="btn-primary" onClick={editingAppointment ? handleUpdateAppointment : handleAddAppointment} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>{editingAppointment ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
        <button className="btn-primary">Manage Full Schedule</button>
        <button className="btn-secondary">Export Route Plan</button>
      </div>
    </StaffLayout>
  );
}

export default DonationSchedule;
