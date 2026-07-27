// pages/staff/OrderFulfillment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { API_BASE } from '../../services/api';

function OrderFulfillment() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Driver assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // Delivery update modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    note: '',
    location: ''
  });

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'OPERATIONS_STAFF',
          id: user.id || user.userId || 'staff-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser({
          name: 'Staff User',
          role: 'OPERATIONS_STAFF',
          id: 'staff-123'
        });
      }
    } else {
      setCurrentUser({
        name: 'Staff User',
        role: 'OPERATIONS_STAFF',
        id: 'staff-123'
      });
    }
  }, []);

  // ===== LOAD ORDERS FROM DATABASE =====
  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load orders');
      const data = await response.json();
      
      const processedOrders = data.map(order => ({
        ...order,
        user: order.user || { name: 'N/A', email: 'N/A' }
      }));
      
      setOrders(processedOrders);
      
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== LOAD DELIVERY PERSONNEL FROM DATABASE =====
  const loadAvailableDrivers = useCallback(async (silent = false) => {
    if (!silent) setLoadingDrivers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/users/delivery-personnel`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Response not OK:', response.status);
        throw new Error('Failed to load delivery personnel');
      }
      
      const data = await response.json();
      console.log('✅ Raw delivery personnel data:', data);
      
      // Ensure each driver has required fields - PRESERVE activeOrders from API
      const driversWithStatus = data.map(driver => ({
        ...driver,
        status: driver.status || 'AVAILABLE',
        activeOrders: driver.activeOrders || 0,
        maxOrders: driver.maxOrders || 5,
        canAcceptMore: driver.canAcceptMore !== undefined ? driver.canAcceptMore : true,
        remainingCapacity: driver.remainingCapacity !== undefined ? driver.remainingCapacity : 5,
        isFull: driver.isFull !== undefined ? driver.isFull : false
      }));
      
      console.log('🔍 DEBUG - Processed drivers with counts:');
      console.table(driversWithStatus.map(d => ({
        name: d.name,
        status: d.status,
        activeOrders: d.activeOrders,
        maxOrders: d.maxOrders,
        isFull: d.isFull
      })));
      
      setAvailableDrivers(driversWithStatus);
      
    } catch (error) {
      console.error('❌ Error loading delivery personnel:', error);
      // Set fallback data for testing
      setAvailableDrivers([
        { 
          id: 'c9eb0b95-d427-4513-8bb6-0513380f9aa5', 
          name: 'Delivery Driver 1', 
          email: 'driver1@projenius.com',
          phoneNumber: null,
          role: 'DELIVERY_PERSONNEL',
          status: 'AVAILABLE',
          activeOrders: 0,
          maxOrders: 5,
          canAcceptMore: true,
          remainingCapacity: 5,
          isFull: false
        },
        { 
          id: '555fad0c-ef01-403d-8224-f59d8dc6d4af', 
          name: 'Delivery Driver 2', 
          email: 'driver2@projenius.com',
          phoneNumber: null,
          role: 'DELIVERY_PERSONNEL',
          status: 'AVAILABLE',
          activeOrders: 0,
          maxOrders: 5,
          canAcceptMore: true,
          remainingCapacity: 5,
          isFull: false
        }
      ]);
    } finally {
      setLoadingDrivers(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadAvailableDrivers();
  }, [loadOrders, loadAvailableDrivers]);

  // ===== POLLING FALLBACK =====
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders(true);
      loadAvailableDrivers(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadOrders, loadAvailableDrivers]);

  // ===== ASSIGN DELIVERY PERSONNEL TO ORDER =====
  const handleAssignDriver = async () => {
    if (!selectedOrder || !selectedDriver) {
      alert('Please select delivery personnel');
      return;
    }

    setAssigning(true);
    try {
      const driver = availableDrivers.find(d => d.id === selectedDriver);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/assign-driver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          driverId: driver.id,
          driverName: driver.name,
          staffId: currentUser.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign delivery personnel');
      }
      
      const updatedOrder = await response.json();
      
      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      
      // CRITICAL: Force refresh drivers list to update active order counts
      await loadAvailableDrivers(true);
      
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedDriver('');
      alert(`✅ ${driver.name} assigned to order ${selectedOrder.id}`);
      
    } catch (error) {
      console.error('Error assigning delivery personnel:', error);
      alert('Failed to assign delivery personnel: ' + error.message);
    } finally {
      setAssigning(false);
    }
  };

  // ===== STAFF MANUALLY UPDATE STATUS =====
  const handleManualUpdate = async () => {
    if (!updatingOrder || !updateData.status) {
      alert('Please select a status');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/${updatingOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: updateData.status,
          note: updateData.note || `Status updated by ${currentUser.name}`,
          updatedBy: currentUser.name,
          location: updateData.location || 'Staff update'
        })
      });

      if (!response.ok) throw new Error('Failed to update order');
      const updatedOrder = await response.json();
      setOrders(orders.map(o => o.id === updatingOrder.id ? updatedOrder : o));

      // CRITICAL: Force refresh drivers to update active order counts
      await loadAvailableDrivers(true);

      setShowUpdateModal(false);
      setUpdatingOrder(null);
      setUpdateData({ status: '', note: '', location: '' });
      alert(`✅ Order ${updatingOrder.id} updated successfully`);
      
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order: ' + error.message);
    }
  };

  // ===== REASSIGN DELIVERY PERSONNEL =====
  const handleReassignDriver = async (order) => {
    if (!window.confirm(`Reassign delivery personnel for order ${order.id}?`)) return;
    await loadAvailableDrivers(true);
    openAssignModal(order);
  };

  // ===== OPEN ASSIGN MODAL =====
  const openAssignModal = (order) => {
    // Force refresh drivers before opening modal
    loadAvailableDrivers(true);
    setSelectedOrder(order);
    setShowAssignModal(true);
  };

  // ===== HANDLE DELETE =====
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete order');
      setOrders(orders.filter(o => o.id !== id));
      
      // Refresh drivers to update active order counts
      await loadAvailableDrivers(true);
      
      alert('Order deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order: ' + error.message);
    }
  };

  // ===== GET STATUS DISPLAY =====
  const getStatusInfo = (status) => {
    const statusMap = {
      'PENDING': { 
        label: '🟡 Pending', 
        step: 1,
        color: '#ff9800'
      },
      'PROCESSING': { 
        label: '🟠 Processing', 
        step: 2,
        color: '#ff6b00'
      },
      'COMPLETED': { 
        label: '✅ Completed', 
        step: 3,
        color: '#4caf50'
      },
      'CANCELLED': { 
        label: '❌ Cancelled', 
        step: 0,
        color: '#dc3545'
      }
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  // ===== FORMAT DATE =====
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ===== FILTER ORDERS =====
  const filteredOrders = orders.filter(o => {
    const statusMatch = statusFilter === 'All' || o.status === statusFilter;
    return statusMatch;
  });

  // ===== CALCULATE STATS =====
  const statusCounts = {
    All: orders.length,
    'PENDING': orders.filter(o => o.status === 'PENDING').length,
    'PROCESSING': orders.filter(o => o.status === 'PROCESSING').length,
    'COMPLETED': orders.filter(o => o.status === 'COMPLETED').length,
    'CANCELLED': orders.filter(o => o.status === 'CANCELLED').length,
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  // Calculate driver stats
  const availableDriversCount = availableDrivers.filter(d => d.status === 'AVAILABLE').length;
  const activeDriversCount = availableDrivers.filter(d => d.status === 'ACTIVE').length;
  const totalActiveOrders = availableDrivers.reduce((sum, d) => sum + (d.activeOrders || 0), 0);

  // ===== Refresh Data =====
  const refreshData = () => {
    loadOrders();
    loadAvailableDrivers();
  };

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
        <div>
          <h1>Order Fulfillment</h1>
          <p className="page-subtitle">Manage order processing, driver assignment, and delivery tracking</p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cards-grid">
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <div className="stat-value">{pendingOrders}</div>
          <div className="stat-trend">Need processing</div>
          <div className="stat-sub">Waiting for assignment</div>
        </div>
        <div className="stat-card">
          <h3>Processing</h3>
          <div className="stat-value">{statusCounts['PROCESSING']}</div>
          <div className="stat-trend">In transit</div>
          <div className="stat-sub">With delivery personnel</div>
        </div>
        <div className="stat-card">
          <h3>Available Drivers</h3>
          <div className="stat-value">{availableDriversCount}</div>
          <div className="stat-trend">✅ Ready to assign</div>
          <div className="stat-sub">Total: {availableDrivers.length} drivers</div>
        </div>
        <div className="stat-card">
          <h3>Active Drivers</h3>
          <div className="stat-value">{activeDriversCount}</div>
          <div className="stat-trend">🚚 On route</div>
          <div className="stat-sub">{totalActiveOrders} orders in progress</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-value">{statusCounts['COMPLETED']}</div>
          <div className="stat-trend">✅ Delivered</div>
          <div className="stat-sub">Total completed orders</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card-panel" style={{ marginBottom: '24px' }}>
        {/* Filters */}
        <div className="filter-bar">
          {['All', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((status) => {
            const labelMap = {
              'All': `All (${statusCounts.All})`,
              'PENDING': `🟡 Pending (${statusCounts['PENDING']})`,
              'PROCESSING': `🟠 Processing (${statusCounts['PROCESSING']})`,
              'COMPLETED': `✅ Completed (${statusCounts['COMPLETED']})`,
              'CANCELLED': `❌ Cancelled (${statusCounts['CANCELLED']})`
            };
            return (
              <span 
                key={status}
                className={`filter-chip ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {labelMap[status]}
              </span>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No orders found.
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Points</th>
                  <th>Amount</th>
                  <th>Address</th>
                  <th>Delivery Personnel</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const user = order.user || {};
                  
                  const driver = availableDrivers.find(d => d.id === order.driverId);
                  const driverName = driver ? driver.name : order.driverName;
                  const driverActiveOrders = order.driverActiveOrders || driver?.activeOrders || 0;
                  
                  return (
                    <tr key={order.id} style={{ 
                      opacity: order.status === 'COMPLETED' || order.status === 'CANCELLED' ? 0.7 : 1,
                      background: order.status === 'COMPLETED' || order.status === 'CANCELLED' ? '#fafafa' : 'white'
                    }}>
                      <td>
                        <strong>{order.id}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div><strong>{user.name || 'N/A'}</strong></div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {user.email || ''}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <strong>{order.totalPoints || 0}</strong>
                      </td>
                      <td>
                        {order.cashAmount ? `$${order.cashAmount}` : '-'}
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        <div>{order.shippingAddress || 'N/A'}</div>
                        {order.phoneNumber && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            📞 {order.phoneNumber}
                          </div>
                        )}
                      </td>
                      <td>
                        {order.driverId ? (
                          <div>
                            <strong style={{ color: '#1E4D4B' }}>{driverName || 'Assigned'}</strong>
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#64748b',
                              fontWeight: '400'
                            }}>
                              🚚 {driverActiveOrders}/5 orders
                              {driverActiveOrders >= 5 && ' 🔴 FULL'}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#ff9800', fontSize: '13px', fontWeight: '500' }}>
                            ⚠️ Not Assigned
                          </span>
                        )}
                      </td>
                      <td>
                        <div>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {statusInfo.label}
                          </span>
                          {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                            <div style={{ 
                              width: '100%', 
                              height: '3px', 
                              background: '#e5e5e5', 
                              borderRadius: '2px',
                              marginTop: '6px'
                            }}>
                              <div style={{ 
                                width: `${(statusInfo.step / 3) * 100}%`, 
                                height: '100%', 
                                background: statusInfo.step === 3 ? '#4caf50' : '#1E4D4B',
                                borderRadius: '2px',
                                transition: 'width 0.5s ease'
                              }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
  <div className="action-group">
    {(!order.driverId || order.driverId === '') && 
     (order.status === 'PENDING' || order.status === 'PROCESSING') && (
      <button 
        className="btn-assign" 
        onClick={() => openAssignModal(order)}
      >
        Assign
      </button>
    )}
    {(order.driverId && order.status !== 'COMPLETED' && order.status !== 'CANCELLED') && (
      <>
        <button 
          className="btn-update" 
          onClick={() => {
            setUpdatingOrder(order);
            setUpdateData({ status: '', note: '', location: '' });
            setShowUpdateModal(true);
          }}
        >
          Update
        </button>
        <button 
          className="btn-reassign" 
          onClick={() => handleReassignDriver(order)}
        >
          Reassign
        </button>
      </>
    )}
    <button 
      className="btn-delete" 
      onClick={() => handleDelete(order.id)}
    >
      Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* ===== ASSIGN DRIVER MODAL ===== */}
      {showAssignModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>👤 Assign Delivery Personnel</h2>
            <p className="modal-subtitle">
              Order: <strong>{selectedOrder.id}</strong>
            </p>

            <div className="user-submitted-info">
              <h4>📋 Order Details</h4>
              <div className="info-grid">
                <p><strong>User:</strong> {selectedOrder.user?.name || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedOrder.shippingAddress || 'N/A'}</p>
                <p><strong>Points:</strong> {selectedOrder.totalPoints || 0}</p>
                {selectedOrder.phoneNumber && (
                  <p><strong>Phone:</strong> {selectedOrder.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Select Delivery Personnel</label>
              {loadingDrivers ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  Loading delivery personnel...
                </div>
              ) : availableDrivers.length === 0 ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#ff9800',
                  background: '#fff3e0',
                  borderRadius: '8px'
                }}>
                  ⚠️ No delivery personnel registered.
                  <br />
                  <small>Please add users with role 'DELIVERY_PERSONNEL' to the database.</small>
                </div>
              ) : (
                <>
                  <select 
                    className="form-control"
                    value={selectedDriver} 
                    onChange={(e) => setSelectedDriver(e.target.value)}
                  >
                    <option value="">Choose delivery personnel...</option>
                    {availableDrivers.map(driver => {
                      const activeOrders = driver.activeOrders || 0;
                      const maxOrders = driver.maxOrders || 5;
                      const isFull = driver.isFull || activeOrders >= maxOrders;
                      
                      // CLEAN STATUS DISPLAY - Only show name and status
                      let statusDisplay = '';
                      if (isFull) {
                        statusDisplay = '🔴 FULL';
                      } else {
                        statusDisplay = '✅ Available';
                      }
                      
                      return (
                        <option 
                          key={driver.id} 
                          value={driver.id}
                          disabled={isFull || !driver.canAcceptMore}
                          style={{
                            color: isFull ? '#dc3545' : '#333',
                            fontWeight: isFull ? 'bold' : 'normal'
                          }}
                        >
                          {driver.name} - {statusDisplay}
                        </option>
                      );
                    })}
                  </select>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    Total: {availableDrivers.length} drivers • 
                    {availableDrivers.filter(d => d.status === 'AVAILABLE').length} available • 
                    {availableDrivers.filter(d => d.isFull).length} full
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => { setShowAssignModal(false); setSelectedOrder(null); setSelectedDriver(''); }}
              >
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={handleAssignDriver}
                disabled={!selectedDriver || assigning || loadingDrivers || availableDrivers.length === 0}
              >
                {assigning ? 'Assigning...' : 'Assign Delivery Personnel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MANUAL UPDATE STATUS MODAL ===== */}
      {showUpdateModal && updatingOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>📍 Update Order Status</h2>
            <p className="modal-subtitle">
              Order: <strong>{updatingOrder.id}</strong>
            </p>

            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
              >
                <option value="">Select status...</option>
                <option value="PROCESSING">🟠 Processing</option>
                <option value="COMPLETED">✅ Completed</option>
                <option value="CANCELLED">❌ Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                className="form-control"
                value={updateData.location}
                onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                placeholder="e.g., Colombo Hub, Kandy Depot"
              />
            </div>

            <div className="form-group">
              <label>Note (Optional)</label>
              <textarea
                className="form-control"
                value={updateData.note}
                onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                placeholder="Add any notes..."
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => { setShowUpdateModal(false); setUpdatingOrder(null); setUpdateData({ status: '', note: '', location: '' }); }}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleManualUpdate}
                disabled={!updateData.status}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default OrderFulfillment;