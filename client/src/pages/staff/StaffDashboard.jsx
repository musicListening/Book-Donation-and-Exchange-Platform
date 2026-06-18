// pages/staff/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function StaffDashboard() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [tasks] = useState([
    { id: '#SL-88210', donor: 'Malini Perera', location: 'Colombo', volume: '45 Books', date: 'Oct 12, 2023 | 14:30', status: 'In Review' },
    { id: '#SL-88195', donor: 'Dr. Anura Bandaranaike', location: 'Kandy', volume: '112 Books', date: 'Oct 12, 2023 | 11:15', status: 'In Review' },
    { id: '#SL-88188', donor: 'Nimal Weerasinghe', location: 'Galle', volume: '28 Books', date: 'Oct 12, 2023 | 09:45', status: 'In Review' },
    { id: '#SL-88182', donor: 'University of Peradeniya', location: 'Kandy', volume: '250 Books', date: 'Oct 11, 2023 | 15:20', status: 'Pending' },
    { id: '#SL-88178', donor: 'Ramesh Kumar', location: 'Jaffna', volume: '62 Books', date: 'Oct 11, 2023 | 10:30', status: 'In Review' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    donor: '',
    location: '',
    volume: '',
    status: 'Pending'
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'OPERATIONS STAFF'
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
    return 'SD';
  };

  const getFirstName = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      return names[0];
    }
    return 'Staff';
  };

  // Placeholder CRUD functions
  const handleCreate = () => {
    console.log('Create task:', formData);
    setShowModal(false);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      donor: task.donor,
      location: task.location,
      volume: task.volume,
      status: task.status
    });
    setShowModal(true);
  };

  const handleUpdate = () => {
    console.log('Update task:', editingTask, formData);
    setShowModal(false);
    setEditingTask(null);
  };

  const handleDelete = (id) => {
    console.log('Delete task:', id);
  };

  const handleStatusUpdate = (id, newStatus) => {
    console.log('Update status:', id, newStatus);
  };

  const resetForm = () => {
    setFormData({
      donor: '',
      location: '',
      volume: '',
      status: 'Pending'
    });
  };

  return (
    <StaffLayout>
      <div className="content-header">
        <h1>Operations Overview - Sri Lanka</h1>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      <p className="welcome-text">Welcome back, {getFirstName()}! Here is what needs your attention today across Sri Lanka.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>PENDING VERIFICATIONS</h3>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-trend">▲ +15% from yesterday</div>
          <div className="stat-sub">Books awaiting condition assessment</div>
        </div>

        <div className="stat-card">
          <h3>TODAY'S PICKUPS</h3>
          <div className="stat-value">52</div>
          <div className="stat-trend">Target: 60</div>
          <div className="stat-sub">Scheduled • 87% of capacity utilized</div>
        </div>

        <div className="stat-card">
          <h3>ACTIVE ORDERS</h3>
          <div className="stat-value">3,245</div>
          <div className="stat-sub">Books • 24 charity fulfillment in progress</div>
        </div>
      </div>

      <div className="task-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0 }}>Urgent Task Queue</h3>
          <button className="new-donation-btn" onClick={() => { resetForm(); setEditingTask(null); setShowModal(true); }}>
            + Add Task
          </button>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>DONATION ID</th>
                <th>DONOR NAME</th>
                <th>LOCATION</th>
                <th>VOLUME</th>
                <th>SUBMISSION DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.donor}</td>
                  <td>{task.location}</td>
                  <td>{task.volume}</td>
                  <td>{task.date}</td>
                  <td>
                    <select 
                      className={`status-badge ${task.status === 'In Review' ? 'in-review' : 'draft'}`}
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                      style={{ border: 'none', cursor: 'pointer', padding: '4px 12px', borderRadius: '30px', fontSize: '12px', fontWeight: '500' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Review">In Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-group">
                      <button className="btn-small" onClick={() => handleEdit(task)}>Edit</button>
                      <button className="btn-small-danger" onClick={() => handleDelete(task.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Showing {tasks.length} tasks across Sri Lanka
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#1E4D4B', marginBottom: '20px' }}>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Donor Name</label>
              <input type="text" className="form-control" value={formData.donor} onChange={(e) => setFormData({...formData, donor: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Location</label>
              <input type="text" className="form-control" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Volume</label>
              <input type="text" className="form-control" value={formData.volume} onChange={(e) => setFormData({...formData, volume: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Status</label>
              <select className="form-control" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setShowModal(false); setEditingTask(null); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={editingTask ? handleUpdate : handleCreate}>{editingTask ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="inventory-flow">
        <h3>Inventory Flow (Weekly) - National Overview</h3>
        <div className="flow-chart">
          <div className="flow-bar">
            <span className="flow-label">Donations Received</span>
            <div className="flow-progress donations" style={{ width: '72%' }}></div>
            <span className="flow-percent">↑ 28% from last week</span>
          </div>
          <div className="flow-bar">
            <span className="flow-label">Distributions</span>
            <div className="flow-progress distributions" style={{ width: '56%' }}></div>
            <span className="flow-percent">→ 2,150 books delivered</span>
          </div>
          <div className="flow-bar">
            <span className="flow-label">In Processing</span>
            <div className="flow-progress" style={{ width: '34%', background: '#E9C46A' }}></div>
            <span className="flow-percent">→ 1,280 books in queue</span>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}

export default StaffDashboard;
