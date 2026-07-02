// pages/staff/OrderFulfillment.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { shipmentAPI } from '../../services/api';


function OrderFulfillment() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [formData, setFormData] = useState({
    recipient: '',
    location: '',
    items: '',
    status: 'In Transit',
    driver: ''
  });

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'LOGISTICS STAFF',
          id: user.id || user.userId || 'test-user-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser({ name: 'Test Staff', role: 'LOGISTICS STAFF', id: 'test-user-123' });
      }
    } else {
      setCurrentUser({ name: 'Test Staff', role: 'LOGISTICS STAFF', id: 'test-user-123' });
    }
  }, []);

  // ===== LOAD SHIPMENTS FROM DATABASE =====
  const loadShipments = async () => {
    setLoading(true);
    try {
      const data = await shipmentAPI.getAll();
      setShipments(data);
    } catch (error) {
      console.error('❌ Error loading shipments:', error);
      alert('Failed to load shipments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
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

  // ===== CREATE Shipment =====
  const handleCreate = async () => {
    try {
      const newShipment = await shipmentAPI.create({
        ...formData,
        userId: currentUser.id
      });
      setShipments([newShipment, ...shipments]);
      setShowModal(false);
      resetForm();
      alert('Shipment created successfully!');
    } catch (error) {
      console.error('❌ Error creating shipment:', error);
      alert('Failed to create shipment: ' + error.message);
    }
  };

  // ===== EDIT Shipment (open modal) =====
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

  // ===== UPDATE Shipment =====
  const handleUpdate = async () => {
    try {
      const updated = await shipmentAPI.update(editingShipment.id, formData);
      setShipments(shipments.map(s => s.id === updated.id ? updated : s));
      setShowModal(false);
      setEditingShipment(null);
      resetForm();
      alert('Shipment updated successfully!');
    } catch (error) {
      console.error('❌ Error updating shipment:', error);
      alert('Failed to update shipment: ' + error.message);
    }
  };

  // ===== DELETE Shipment =====
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) return;
    try {
      await shipmentAPI.delete(id);
      setShipments(shipments.filter(s => s.id !== id));
      alert('Shipment deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting shipment:', error);
      alert('Failed to delete shipment: ' + error.message);
    }
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

  // Filter shipments by status
  const filteredShipments = shipments.filter(s => 
    statusFilter === 'All' || s.status === statusFilter
  );

  // Calculate status counts
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
          <div className="stat-trend">{loading ? 'Loading...' : 'Live from database'}</div>
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
              style={{ 
                cursor: 'pointer', 
                padding: '6px 16px', 
                borderRadius: '20px',
                background: statusFilter === status ? '#1E4D4B' : '#f0f0f0',
                color: statusFilter === status ? 'white' : '#333',
                fontSize: '14px',
                fontWeight: statusFilter === status ? '600' : '400'
              }}
            >
              {status} ({statusCounts[status] || 0})
            </span>
          ))}
          <button className="new-donation-btn" onClick={() => { resetForm(); setEditingShipment(null); setShowModal(true); }} style={{ marginLeft: 'auto' }}>
            + New Shipment
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading shipments...</div>
        ) : filteredShipments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            {statusFilter === 'All' 
              ? 'No shipments yet. Click "New Shipment" to create one!' 
              : `No shipments with status "${statusFilter}"`}
          </div>
        ) : (
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
                    <td><strong>{s.orderId}</strong></td>
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
        )}
        <div className="table-footer">
          <span>Showing {filteredShipments.length} of {shipments.length} active shipments</span>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#1E4D4B', marginBottom: '20px' }}>{editingShipment ? 'Edit Shipment' : 'New Shipment'}</h2>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Recipient</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.recipient} 
                onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Location</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Items</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.items} 
                onChange={(e) => setFormData({...formData, items: e.target.value})}
                placeholder="e.g., 45 Books"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Driver</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.driver} 
                onChange={(e) => setFormData({...formData, driver: e.target.value})}
                placeholder="Enter driver name"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Status</label>
              <select 
                className="form-control" 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              >
                <option value="In Transit">In Transit</option>
                <option value="On Time">On Time</option>
                <option value="Delayed">Delayed</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn-secondary" 
                onClick={() => { setShowModal(false); setEditingShipment(null); resetForm(); }}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={editingShipment ? handleUpdate : handleCreate}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#1E4D4B', color: 'white' }}
              >
                {editingShipment ? 'Update Shipment' : 'Create Shipment'}
              </button>
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