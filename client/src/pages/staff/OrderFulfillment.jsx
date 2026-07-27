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
      
      // Show ALL orders including COMPLETED and CANCELLED for staff visibility
      const processedOrders = data.map(order => ({
        ...order,
        user: order.user || { name: 'N/A', email: 'N/A' }
      }));
      
      // Sort by createdAt descending (newest first)
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
      console.log('✅ Raw delivery personnel data:', data);
      
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

  // ===== STAFF PROCESS ORDER (PENDING → PROCESSING) =====
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
          staffId: currentUser.id,
          status: 'COMPLETED',
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
      alert(`✅ ${driver.name} assigned - Order Delivered`);
      
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

  // ===== REASSIGN DELIVERY PERSONNEL =====
  const handleReassignDriver = async (order) => {
    if (!window.confirm(`Reassign delivery personnel for order ${order.id}?`)) return;
    await loadAvailableDrivers(true);
    openAssignModal(order);
  };

  // ===== OPEN ASSIGN MODAL =====
  const openAssignModal = (order) => {
    loadAvailableDrivers(true);
    setSelectedOrder(order);
    setShowAssignModal(true);
  };

  // ===== GET STATUS DISPLAY WITH COLORS =====
  const getStatusInfo = (status) => {
    const statusMap = {
      'PENDING': { 
        label: 'Pending', 
        step: 1,
        bgColor: '#FFF3CD',
        textColor: '#856404',
        badgeClass: 'draft'
      },
      'PROCESSING': { 
        label: 'Processing', 
        step: 2,
        bgColor: '#FFE0B2',
        textColor: '#E65100',
        badgeClass: 'processing'
      },
      'COMPLETED': { 
        label: 'Completed', 
        step: 3,
        bgColor: '#D4EDDA',
        textColor: '#155724',
        badgeClass: 'published'
      },
      'CANCELLED': { 
        label: 'Cancelled', 
        step: 0,
        bgColor: '#F8D7DA',
        textColor: '#721C24',
        badgeClass: 'rejected'
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
    if (statusFilter === 'All') {
      // In "All" view, only show PENDING and PROCESSING (active orders)
      return o.status === 'PENDING' || o.status === 'PROCESSING';
    }
    return o.status === statusFilter;
  });

  // ===== CALCULATE STATS =====
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
          <p className="page-subtitle">Manage active orders - pending and processing deliveries</p>
        </div>
        {/* REMOVED: user-info div with avatar - profile is already in StaffLayout */}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
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
          <h3>Available Drivers</h3>
          <div className="stat-value" style={{ color: '#1E4D4B' }}>{availableDriversCount}</div>
          <div className="stat-trend">✅ Ready to assign</div>
        </div>
        <div className="stat-card">
          <h3>Active Drivers</h3>
          <div className="stat-value" style={{ color: '#2196F3' }}>{activeDriversCount}</div>
          <div className="stat-trend">🚚 On route</div>
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
              style={{ 
                padding: '8px 16px', 
                border: '1px solid #e5e5e5', 
                borderRadius: '8px', 
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
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
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3>No orders found</h3>
            <p>No orders match the current filter.</p>
          </div>
        ) : (
          <div className="data-table" style={{ overflowX: 'auto' }}>
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
                  
                  // Check if order is completed or cancelled - hide action buttons
                  const isCompleted = orderStatus === 'COMPLETED' || orderStatus === 'CANCELLED';
                  
                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id?.substring(0, 8)}</strong>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div><strong>{user.name || 'N/A'}</strong></div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{user.email || ''}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <strong>{order.totalPoints || 0}</strong>
                      </td>
                      <td>
                        {order.cashAmount ? `Rs. ${order.cashAmount}` : '-'}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        <div>{order.shippingAddress?.substring(0, 30) || 'N/A'}</div>
                        {order.phoneNumber && (
                          <div style={{ fontSize: '10px', color: '#64748b' }}>📞 {order.phoneNumber}</div>
                        )}
                      </td>
                      <td>
                        {order.driverId ? (
                          <div>
                            <strong style={{ color: '#1E4D4B' }}>{driverName || 'Assigned'}</strong>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>
                              🚚 {driverActiveOrders}/5
                              {driverActiveOrders >= 5 && ' 🔴 FULL'}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#ff9800', fontSize: '12px', fontWeight: '500' }}>
                            ⚠️ Not Assigned
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                        {orderStatus !== 'CANCELLED' && orderStatus !== 'COMPLETED' && (
                          <div style={{ 
                            width: '100%', 
                            height: '3px', 
                            background: '#e5e5e5', 
                            borderRadius: '2px',
                            marginTop: '4px'
                          }}>
                            <div style={{ 
                              width: `${(statusInfo.step / 2) * 100}%`, 
                              height: '100%', 
                              background: '#1E4D4B',
                              borderRadius: '2px',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        )}
                      </td>
                      <td>
                        {isCompleted ? (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {orderStatus === 'COMPLETED' ? '✅ Delivered' : '❌ Cancelled'}
                          </span>
                        ) : (
                          <div className="action-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '80px' }}>
                            {orderStatus === 'PENDING' && (
                              <button 
                                className="btn-small" 
                                onClick={() => handleProcessOrder(order)}
                                style={{ 
                                  background: '#FF9800', 
                                  color: 'white', 
                                  border: 'none',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  width: '100%'
                                }}
                              >
                                Process
                              </button>
                            )}
                            
                            {orderStatus === 'PROCESSING' && !order.driverId && (
                              <button 
                                className="btn-small" 
                                onClick={() => openAssignModal(order)}
                                style={{ 
                                  background: '#2196F3', 
                                  color: 'white', 
                                  border: 'none',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  width: '100%'
                                }}
                              >
                                Assign
                              </button>
                            )}
                            
                            {orderStatus === 'PROCESSING' && order.driverId && (
                              <>
                                <button 
                                  className="btn-small" 
                                  onClick={() => handleReassignDriver(order)}
                                  style={{ 
                                    background: '#FF9800', 
                                    color: 'white', 
                                    border: 'none',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    width: '100%'
                                  }}
                                >
                                  Reassign
                                </button>
                                <button 
                                  className="btn-small" 
                                  onClick={() => {
                                    setUpdatingOrder(order);
                                    setUpdateData({ status: 'COMPLETED', note: 'Delivered by driver', location: 'Delivered' });
                                    setShowUpdateModal(true);
                                  }}
                                  style={{ 
                                    background: '#4CAF50', 
                                    color: 'white', 
                                    border: 'none',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    width: '100%'
                                  }}
                                >
                                  Delivered
                                </button>
                              </>
                            )}
                            
                            <button 
                              className="btn-small" 
                              onClick={() => {
                                setUpdatingOrder(order);
                                setUpdateData({ status: '', note: '', location: '' });
                                setShowUpdateModal(true);
                              }}
                              style={{ 
                                background: '#6C757D', 
                                color: 'white', 
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                width: '100%'
                              }}
                            >
                              Edit
                            </button>
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
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <h2 style={{ color: '#1E4D4B', marginBottom: '8px' }}>👤 Assign Delivery Personnel</h2>
            <p className="modal-subtitle" style={{ color: '#64748b', marginBottom: '20px' }}>
              Order: <strong>{selectedOrder.id}</strong>
            </p>

            <div style={{ 
              background: '#f8fafc', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <h4 style={{ color: '#1E4D4B', marginBottom: '12px' }}>📋 Order Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <p><strong>User:</strong> {selectedOrder.user?.name || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedOrder.shippingAddress || 'N/A'}</p>
                <p><strong>Points:</strong> {selectedOrder.totalPoints || 0}</p>
                {selectedOrder.phoneNumber && (
                  <p><strong>Phone:</strong> {selectedOrder.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Select Delivery Personnel</label>
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
                </div>
              ) : (
                <select 
                  className="form-control"
                  value={selectedDriver} 
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
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
                        style={{
                          color: isFull ? '#dc3545' : '#333',
                          fontWeight: isFull ? 'bold' : 'normal'
                        }}
                      >
                        {driver.name} - {isFull ? '🔴 FULL' : '✅ Available'} ({activeOrders}/{maxOrders})
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => { setShowAssignModal(false); setSelectedOrder(null); setSelectedDriver(''); }}
                style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #e5e5e5', cursor: 'pointer', background: 'white' }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleAssignDriver}
                disabled={!selectedDriver || assigning || loadingDrivers || availableDrivers.length === 0}
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  cursor: (!selectedDriver || assigning || loadingDrivers || availableDrivers.length === 0) ? 'not-allowed' : 'pointer', 
                  background: '#1E4D4B', 
                  color: 'white',
                  opacity: (!selectedDriver || assigning || loadingDrivers || availableDrivers.length === 0) ? 0.6 : 1
                }}
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
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2 style={{ color: '#1E4D4B', marginBottom: '8px' }}>📍 Update Order Status</h2>
            <p className="modal-subtitle" style={{ color: '#64748b', marginBottom: '20px' }}>
              Order: <strong>{updatingOrder.id}</strong>
            </p>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Status</label>
              <select
                className="form-control"
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
              >
                <option value="">Select status...</option>
                <option value="PENDING">🟡 Pending</option>
                <option value="PROCESSING">🟠 Processing</option>
                <option value="COMPLETED">✅ Completed</option>
                <option value="CANCELLED">❌ Cancelled</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Location</label>
              <input
                type="text"
                className="form-control"
                value={updateData.location}
                onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                placeholder="e.g., Colombo Hub"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Note (Optional)</label>
              <textarea
                className="form-control"
                value={updateData.note}
                onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                placeholder="Add any notes..."
                rows="2"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => { setShowUpdateModal(false); setUpdatingOrder(null); setUpdateData({ status: '', note: '', location: '' }); }}
                style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #e5e5e5', cursor: 'pointer', background: 'white' }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleManualUpdate}
                disabled={!updateData.status}
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  cursor: !updateData.status ? 'not-allowed' : 'pointer', 
                  background: '#1E4D4B', 
                  color: 'white',
                  opacity: !updateData.status ? 0.6 : 1
                }}
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