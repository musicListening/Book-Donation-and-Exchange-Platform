// pages/staff/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { taskAPI } from '../../services/api';

function StaffDashboard() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    donor: '',
    location: '',
    volume: '',
    status: 'Pending'
  });

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'OPERATIONS STAFF',
          id: user.id || user.userId || 'test-user-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser({ name: 'Test Staff', role: 'OPERATIONS STAFF', id: 'test-user-123' });
      }
    } else {
      setCurrentUser({ name: 'Test Staff', role: 'OPERATIONS STAFF', id: 'test-user-123' });
    }
  }, []);

  // ===== LOAD TASKS FROM DATABASE =====
  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await taskAPI.getAll();
      setTasks(data);
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      alert('Failed to load tasks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
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

  // ===== CREATE Task =====
  const handleCreate = async () => {
    try {
      const newTask = await taskAPI.create({ ...formData, userId: currentUser.id });
      setTasks([newTask, ...tasks]);
      setShowModal(false);
      resetForm();
      alert('Task created successfully!');
    } catch (error) {
      console.error('❌ Error creating task:', error);
      alert('Failed to create task: ' + error.message);
    }
  };

  // ===== EDIT Task (open modal) =====
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

  // ===== UPDATE Task =====
  const handleUpdate = async () => {
    try {
      const updated = await taskAPI.update(editingTask.id, formData);
      setTasks(tasks.map(task => task.id === updated.id ? updated : task));
      setShowModal(false);
      setEditingTask(null);
      resetForm();
      alert('Task updated successfully!');
    } catch (error) {
      console.error('❌ Error updating task:', error);
      alert('Failed to update task: ' + error.message);
    }
  };

  // ===== DELETE Task =====
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskAPI.delete(id);
      setTasks(tasks.filter(task => task.id !== id));
      alert('Task deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      alert('Failed to delete task: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ donor: '', location: '', volume: '', status: 'Pending' });
  };

  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Review').length;
  const completedTasks = tasks.filter(t => t.status === 'Approved' || t.status === 'Rejected').length;

  // ===== GET STATUS BADGE CLASS =====
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending':
        return 'status-pending';
      case 'In Review':
        return 'status-review';
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>Operations Overview </h1>
          
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

    

      {/* ===== STATS CARDS WITH BUNDLE MANAGEMENT COLORS ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>TOTAL TASKS</h3>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-trend">{loading ? 'Loading...' : 'Live from database'}</div>
          <div className="stat-sub">Across all locations</div>
        </div>

        <div className="stat-card">
          <h3>PENDING VERIFICATIONS</h3>
          <div className="stat-value" style={{ color: '#ffc107' }}>{pendingTasks}</div>
          <div className="stat-trend" style={{ color: '#ffc107' }}>▲ Awaiting action</div>
          <div className="stat-sub">Books awaiting condition assessment</div>
        </div>

        <div className="stat-card">
          <h3>COMPLETED</h3>
          <div className="stat-value" style={{ color: '#28a745' }}>{completedTasks}</div>
          <div className="stat-trend" style={{ color: '#28a745' }}>✓ Reviewed</div>
          <div className="stat-sub">Reviewed tasks</div>
        </div>
      </div>

      <div className="task-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0 }}>Urgent Task Queue</h3>
          <button className="new-donation-btn" onClick={() => { resetForm(); setEditingTask(null); setShowModal(true); }}>
            + Add Task
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No tasks yet. Click "Add Task" to create one!
          </div>
        ) : (
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
                    <td>{task.taskId}</td>
                    <td>{task.donor}</td>
                    <td>{task.location}</td>
                    <td>{task.volume}</td>
                    <td>{task.date}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                        {task.status}
                      </span>
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
        )}
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
              <input
                type="text"
                className="form-control"
                value={formData.donor}
                onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Location</label>
              <input
                type="text"
                className="form-control"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Volume</label>
              <input
                type="text"
                className="form-control"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                placeholder="e.g., 45 Books"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              >
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => { setShowModal(false); setEditingTask(null); resetForm(); }}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={editingTask ? handleUpdate : handleCreate}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#1E4D4B', color: 'white' }}
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

    </StaffLayout>
  );
}

export default StaffDashboard;