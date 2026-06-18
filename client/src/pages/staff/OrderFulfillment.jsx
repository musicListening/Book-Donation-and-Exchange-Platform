// pages/staff/OrderFulfillment.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function OrderFulfillment() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [shipments] = useState([
    { id: '#SL-92410', recipient: 'Colombo Public Library', location: 'Colombo 01', items: '45 Books', status: 'In Transit', lastUpdate: '2 hours ago', driver: 'Priyantha Silva' },
    { id: '#SL-92408', recipient: 'University of Peradeniya', location: 'Kandy', items: '120 Books', status: 'Delayed', lastUpdate: '5 mins ago', driver: 'Kamal Perera' },
    { id: '#SL-92405', recipient: 'Galle Heritage Foundation', location: 'Galle', items: '28 Books', status: 'On Time', lastUpdate: '1 hour ago', driver: 'Sunil Jayasinghe' },
    { id: '#SL-92400', recipient: 'Jaffna Public Library', location: 'Jaffna', items: '32 Books', status: 'On Time', lastUpdate: '3 hours ago', driver: 'Ramesh Kumar' },
    { id: '#SL-92395', recipient: 'Kandy Municipal Council', location: 'Kandy', items: '85 Books', status: 'In Transit', lastUpdate: '30 mins ago', driver: 'Nimal Weerasinghe' },
    { id: '#SL-92390', recipient: 'Negombo Community Center', location: 'Negombo', items: '22 Books', status: 'Delivered', lastUpdate: '6 hours ago', driver: 'Chaminda Rathnayake' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [formData, setFormData] = useState({
    recipient: '',
    location: '',
    items: '',
    status: 'In Transit',
    driver: ''
  });

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
    return 'LM';
  };

  // Placeholder CRUD functions
  const handleCreate = () => {
    console.log('Create shipment:', formData);
    setShowModal(false);
  };

  const handleEdit = (shipment) => {
    setEditingShipment(shipment);
    setFormData({
      recipient: shipment.recipient,
      location: shipment.location,
      items: shipment.items,
      status: shipment.status,
      driver: shipment.driver
    });
    setShowModal(true);
  };

  const handleUpdate = () => {
    console.log('Update shipment:', editingShipment, formData);
    setShowModal(false);
    setEditingShipment(null);
  };

  const handleDelete = (id) => {
    console.log('Delete shipment:', id);
  };

  const resetForm = () => {
    setFormData({
      recipient: '',
      location: '',
      items: '',
      status: 'In Transit',
      driver: ''
    });
  };

  const filteredShipments = shipments.filter(s => 
    statusFilter === 'All' || s.status === statusFilter
  );

  const statusCounts = {
    All: shipments.length,
    'In Transit': shipments.filter(s => s.status === 'In Transit').length,
    'On Time': shipments.filter(s => s.status === 'On Time').length,
    'Delayed': shipments.filter(s => s.status === 'Delayed').length,
    'Delivered': shipments.filter(s => s.status === 'Delivered').length,
  };

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>Order Fulfillment</h1>
          <p className="page-subtitle">Real-time logistics and shipment management across Sri Lanka</p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Active Shipments</h3>
          <div className="stat-value">{shipments.length}</div>
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
          {['All', 'In Transit', 'On Time', 'Delayed', 'Delivered'].map(status => (
            <span 
              key={status}
              className={`filter-chip ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status} ({statusCounts[status] || 0})
            </span>
          ))}
          <button className="new-donation-btn" onClick={() => { resetForm(); setEditingShipment(null); setShowModal(true); }} style={{ marginLeft: 'auto' }}>
            + New Shipment
          </button>
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
              {filteredShipments.map(s => (
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
                  <td>
                    <div className="action-group">
                      <button className="btn-small" onClick={() => handleEdit(s)}>Edit</button>
                      <button className="btn-small-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing {filteredShipments.length} of {shipments.length} active shipments</span>
        </div>
      </div>

      {/* Modal - UI only */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#1E4D4B', marginBottom: '20px' }}>{editingShipment ? 'Edit Shipment' : 'New Shipment'}</h2>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Recipient</label>
              <input type="text" className="form-control" value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Location</label>
              <input type="text" className="form-control" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Items</label>
              <input type="text" className="form-control" value={formData.items} onChange={(e) => setFormData({...formData, items: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Driver</label>
              <input type="text" className="form-control" value={formData.driver} onChange={(e) => setFormData({...formData, driver: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Status</label>
              <select className="form-control" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="In Transit">In Transit</option>
                <option value="On Time">On Time</option>
                <option value="Delayed">Delayed</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setShowModal(false); setEditingShipment(null); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={editingShipment ? handleUpdate : handleCreate}>{editingShipment ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

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
