// pages/staff/OrderFulfillment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { API_BASE } from '../../services/api';
import '../../styles/OrderFulfillment.css';

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
      
      processedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
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
      
      const driversWithStatus = data.map(driver => ({
        ...driver,
        status: driver.status || 'AVAILABLE',
        activeOrders: driver.activeOrders || 0,
        maxOrders: driver.maxOrders || 5,
        canAcceptMore: driver.canAcceptMore !== undefined ? driver.canAcceptMore : true,
        remainingCapacity: driver.remainingCapacity !== undefined ? driver.remainingCapacity : 5,
        isFull: driver.isFull !== undefined ? driver.isFull : false
      }));
      
      setAvailableDrivers(driversWithStatus);
      
    } catch (error) {
      console.error('❌ Error loading delivery personnel:', error);
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

  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders(true);
      loadAvailableDrivers(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadOrders, loadAvailableDrivers]);

  const handleProcessOrder = async (order) => {
    if (!window.confirm(`Process order ${order.id}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'PROCESSING',
          note: `Order processed by ${currentUser.name}`,
          updatedBy: currentUser.name,
          location: 'Processing',
          statusDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process order');
      }

      await loadOrders();
      alert(`✅ Order ${order.id} updated to Processing`);

    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order: ' + error.message);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Cancel order ${order.id}? This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          note: `Order cancelled by ${currentUser.name}`,
          updatedBy: currentUser.name,
          location: 'Cancelled',
          statusDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      await loadOrders();
      alert(`✅ Order ${order.id} cancelled`);

    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order: ' + error.message);
    }
  };

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
          staffId: currentUser.id,
          status: 'PROCESSING', // Keep as PROCESSING, not COMPLETED
          statusDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign delivery personnel');
      }
      
      await loadOrders();
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

  const handleMarkDelivered = async (order) => {
    if (!window.confirm(`Mark order ${order.id} as delivered?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          note: `Order delivered by ${order.driverName || 'Driver'}`,
          updatedBy: currentUser.name,
          location: 'Delivered',
          statusDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark as delivered');
      }

      await loadOrders();
      alert(`✅ Order ${order.id} marked as Delivered`);

    } catch (error) {
      console.error('Error marking as delivered:', error);
      alert('Failed to mark as delivered: ' + error.message);
    }
  };

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
          location: updateData.location || 'Staff update',
          statusDate: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to update order');
      
      await loadOrders();
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

  const handleReassignDriver = async (order) => {
    if (!window.confirm(`Reassign delivery personnel for order ${order.id}?`)) return;
    await loadAvailableDrivers(true);
    openAssignModal(order);
  };

  const handleViewOrder = (order) => {
    alert(`Order Details:\n\nID: ${order.id}\nUser: ${order.user?.name || 'N/A'}\nStatus: ${order.status || 'PENDING'}\nPoints: ${order.totalPoints || 0}\nAddress: ${order.shippingAddress || 'N/A'}`);
  };

  const openAssignModal = (order) => {
    loadAvailableDrivers(true);
    setSelectedOrder(order);
    setShowAssignModal(true);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'PENDING': { 
        label: 'Pending', 
        step: 1,
        badgeClass: 'draft'
      },
      'PROCESSING': { 
        label: 'Processing', 
        step: 2,
        badgeClass: 'processing'
      },
      'COMPLETED': { 
        label: 'Completed', 
        step: 3,
        badgeClass: 'published'
      },
      'CANCELLED': { 
        label: 'Cancelled', 
        step: 0,
        badgeClass: 'cancelled'
      }
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'All') {
      return o.status === 'PENDING' || o.status === 'PROCESSING';
    }
    return o.status === statusFilter;
  });

  const statusCounts = {
    All: orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length,
    'PENDING': orders.filter(o => o.status === 'PENDING').length,
    'PROCESSING': orders.filter(o => o.status === 'PROCESSING').length,
    'COMPLETED': orders.filter(o => o.status === 'COMPLETED').length,
    'CANCELLED': orders.filter(o => o.status === 'CANCELLED').length,
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;

  const availableDriversCount = availableDrivers.filter(d => d.status === 'AVAILABLE').length;
  const activeDriversCount = availableDrivers.filter(d => d.status === 'ACTIVE').length;

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>Order Fulfillment</h1>
          <p className="page-subtitle">Manage active orders - pending and processing deliveries</p>
        </div>
      </div>

      {/* Stats Cards - All in one row */}
      <div className="order-stats">
        <div className="stat-card">
          <h3>🟡 Pending</h3>
          <div className="stat-value" style={{ color: '#856404' }}>{pendingOrders}</div>
          <div className="stat-trend">Awaiting processing</div>
        </div>
        <div className="stat-card">
          <h3>🟠 Processing</h3>
          <div className="stat-value" style={{ color: '#E65100' }}>{processingOrders}</div>
          <div className="stat-trend">Ready for delivery</div>
        </div>
        <div className="stat-card">
          <h3>✅ Completed</h3>
          <div className="stat-value" style={{ color: '#2E7D32' }}>{completedOrders}</div>
          <div className="stat-trend">Successfully delivered</div>
        </div>
        <div className="stat-card">
          <h3>🚚 Available Drivers</h3>
          <div className="stat-value" style={{ color: '#1A6B68' }}>{availableDriversCount}</div>
          <div className="stat-trend">✅ Ready to assign</div>
        </div>
        <div className="stat-card">
          <h3>📍 Active Drivers</h3>
          <div className="stat-value" style={{ color: '#2196F3' }}>{activeDriversCount}</div>
          <div className="stat-trend">On route</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card-panel">
        <div className="table-header">
          <h3>{statusFilter === 'All' ? 'Active Orders' : statusFilter + ' Orders'}</h3>
          <div className="table-controls">
            <select 
              className="filter-btn" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Active Orders ({statusCounts.All})</option>
              <option value="PENDING">🟡 Pending ({statusCounts['PENDING']})</option>
              <option value="PROCESSING">🟠 Processing ({statusCounts['PROCESSING']})</option>
              <option value="COMPLETED">✅ Completed ({statusCounts['COMPLETED']})</option>
              <option value="CANCELLED">❌ Cancelled ({statusCounts['CANCELLED']})</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3>No orders found</h3>
            <p>No orders match the current filter.</p>
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
                  const orderStatus = order.status || 'PENDING';
                  
                  const isCompleted = orderStatus === 'COMPLETED' || orderStatus === 'CANCELLED';
                  const hasDriver = !!order.driverId;
                  
                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id?.substring(0, 8)}</strong>
                        <div className="meta-text">{formatDate(order.createdAt)}</div>
                      </td>
                      <td>
                        <div><strong>{user.name || 'N/A'}</strong></div>
                        <div className="meta-text">{user.email || ''}</div>
                      </td>
                      <td className="text-center">
                        <strong>{order.totalPoints || 0}</strong>
                      </td>
                      <td>
                        {order.cashAmount ? `Rs. ${order.cashAmount}` : '-'}
                      </td>
                      <td>
                        <div>{order.shippingAddress?.substring(0, 30) || 'N/A'}</div>
                        {order.phoneNumber && (
                          <div className="meta-text">📞 {order.phoneNumber}</div>
                        )}
                      </td>
                      <td>
                        {hasDriver ? (
                          <div>
                            <strong className="driver-name">{driverName || 'Assigned'}</strong>
                            <div className="meta-text">
                              🚚 {driverActiveOrders}/5
                              {driverActiveOrders >= 5 && ' 🔴 FULL'}
                            </div>
                          </div>
                        ) : (
                          <span className="not-assigned">⚠️ Not Assigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                        {orderStatus !== 'CANCELLED' && orderStatus !== 'COMPLETED' && (
                          <div className="order-progress">
                            <div className="order-progress-bar" style={{ width: `${(statusInfo.step / 2) * 100}%` }} />
                          </div>
                        )}
                      </td>
                      <td>
                        {isCompleted ? (
                          <span className="completed-text">
                            {orderStatus === 'COMPLETED' ? '✅ Delivered' : '❌ Cancelled'}
                          </span>
                        ) : (
                          <div className="action-group">
                            {/* ===== PENDING ORDERS: Process + Cancel ===== */}
                            {orderStatus === 'PENDING' && (
                              <>
                                <button 
                                  className="btn-process" 
                                  onClick={() => handleProcessOrder(order)}
                                >
                                  Process
                                </button>
                                <button 
                                  className="btn-cancel-order" 
                                  onClick={() => handleCancelOrder(order)}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            
                            {/* ===== PROCESSING ORDERS ===== */}
                            {orderStatus === 'PROCESSING' && (
                              <>
                                {/* If NO driver assigned: Show Assign + Update */}
                                {!hasDriver ? (
                                  <>
                                    <button 
                                      className="btn-assign" 
                                      onClick={() => openAssignModal(order)}
                                    >
                                      Assign
                                    </button>
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
                                  </>
                                ) : (
                                  /* If driver IS assigned: Show Delivered + Reassign + Update */
                                  <>
                                    <button 
                                      className="btn-deliver" 
                                      onClick={() => handleMarkDelivered(order)}
                                    >
                                      Delivered
                                    </button>
                                    <button 
                                      className="btn-reassign" 
                                      onClick={() => handleReassignDriver(order)}
                                    >
                                      Reassign
                                    </button>
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
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer">
          <span>Showing {filteredOrders.length} {statusFilter === 'All' ? 'active' : statusFilter.toLowerCase()} orders</span>
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

            <div className="order-details-summary">
              <h4>📋 Order Details</h4>
              <div className="order-details-grid">
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
                <div className="loading-container">Loading delivery personnel...</div>
              ) : availableDrivers.length === 0 ? (
                <div className="no-drivers">
                  ⚠️ No delivery personnel registered.
                </div>
              ) : (
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
                    
                    return (
                      <option 
                        key={driver.id} 
                        value={driver.id}
                        disabled={isFull || !driver.canAcceptMore}
                      >
                        {driver.name} - {isFull ? '🔴 FULL' : '✅ Available'} ({activeOrders}/{maxOrders})
                      </option>
                    );
                  })}
                </select>
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
                className="btn-primary"
                onClick={handleAssignDriver}
                disabled={!selectedDriver || assigning || loadingDrivers || availableDrivers.length === 0}
              >
                {assigning ? 'Assigning...' : '🚚 Assign'}
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
                <option value="PENDING">🟡 Pending</option>
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
                placeholder="e.g., Colombo Hub"
              />
            </div>

            <div className="form-group">
              <label>Note (Optional)</label>
              <textarea
                className="form-control"
                value={updateData.note}
                onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                placeholder="Add any notes..."
                rows="2"
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
                className="btn-primary"
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