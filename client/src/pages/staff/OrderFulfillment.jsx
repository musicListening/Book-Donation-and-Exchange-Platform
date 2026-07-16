// pages/staff/OrderFulfillment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import StaffLayout from '../../components/StaffLayout';

function OrderFulfillment() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [orderTypeFilter, setOrderTypeFilter] = useState('All');
  
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
          role: user.role || 'LOGISTICS STAFF',
          id: user.id || user.userId || 'test-staff-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // ===== LOAD ORDERS FROM DATABASE =====
  const loadOrders = async () => {
    setLoading(true);
    try {
      // REAL API CALL - Get orders from your database
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load orders');
      const data = await response.json();
      setOrders(data);
      
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      
      // If API fails, show empty state
      setOrders([]);
      // alert('Failed to load orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== LOAD DRIVERS FROM DATABASE (Only users with role='DRIVER') =====
  const loadAvailableDrivers = async () => {
    setLoadingDrivers(true);
    try {
      // REAL API CALL - Get all users with role='DRIVER'
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/drivers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load drivers');
      const data = await response.json();
      
      // Filter only AVAILABLE drivers (you can add logic to check if they're online)
      // For now, show all drivers with role='DRIVER'
      setAvailableDrivers(data);
      
    } catch (error) {
      console.error('❌ Error loading drivers:', error);
      setAvailableDrivers([]);
      // alert('Failed to load drivers: ' + error.message);
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadAvailableDrivers();
  }, []);

  // ===== SETUP WEBSOCKET FOR REAL-TIME UPDATES =====
  useEffect(() => {
    // Connect to WebSocket for real-time driver updates
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:3001?role=staff&userId=${currentUser.id}&token=${token}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'DELIVERY_UPDATE') {
          // Update order status in real-time
          handleDriverStatusUpdate(data.orderId, data.status, data.note);
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [currentUser.id]);

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

  // ===== ASSIGN DRIVER TO ORDER =====
  const handleAssignDriver = async () => {
    if (!selectedOrder || !selectedDriver) {
      alert('Please select a driver');
      return;
    }

    setAssigning(true);
    try {
      const driver = availableDrivers.find(d => d.id === selectedDriver);
      
      // REAL API CALL - Assign driver to order
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/assign-driver', {
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

      if (!response.ok) throw new Error('Failed to assign driver');
      const updatedOrder = await response.json();

      // Update local state
      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      
      // Send notification to driver via WebSocket
      await notifyDriver(driver.id, selectedOrder);
      
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedDriver('');
      
      alert(`✅ Driver ${driver.name} assigned to order ${selectedOrder.orderId}`);
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Failed to assign driver: ' + error.message);
    } finally {
      setAssigning(false);
    }
  };

  // ===== NOTIFY DRIVER =====
  const notifyDriver = async (driverId, order) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/driver', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          driverId, 
          orderId: order.id,
          message: `New delivery assigned: ${order.orderId}`,
          orderDetails: {
            recipient: order.recipient,
            location: order.location,
            items: order.items
          }
        })
      });
    } catch (error) {
      console.error('Error notifying driver:', error);
    }
  };

  // ===== HANDLE DRIVER STATUS UPDATE (Real-time) =====
  const handleDriverStatusUpdate = useCallback(async (orderId, newStatus, note = '') => {
    try {
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...(order.timeline || []),
              { 
                status: newStatus, 
                timestamp: new Date().toISOString(), 
                note: note || `Status updated to ${newStatus}`
              }
            ]
          };
        }
        return order;
      });

      setOrders(updatedOrders);
      
      // Show notification
      const order = orders.find(o => o.id === orderId);
      if (order && newStatus === 'ARRIVED') {
        alert(`✅ Order ${order.orderId} has been delivered successfully!`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }, [orders]);

  // ===== STAFF MANUALLY UPDATE STATUS =====
  const handleManualUpdate = async () => {
    if (!updatingOrder || !updateData.status) {
      alert('Please select a status');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${updatingOrder.id}/status`, {
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
      setShowUpdateModal(false);
      setUpdatingOrder(null);
      setUpdateData({ status: '', note: '', location: '' });
      
      alert(`✅ Order ${updatingOrder.orderId} updated successfully`);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order: ' + error.message);
    }
  };

  // ===== REASSIGN DRIVER =====
  const handleReassignDriver = async (order) => {
    if (!window.confirm(`Reassign driver for order ${order.orderId}?`)) return;
    
    // Load fresh drivers list
    await loadAvailableDrivers();
    openAssignModal(order);
  };

  // ===== OPEN ASSIGN MODAL =====
  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
  };

  // ===== HANDLE DELETE =====
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete order');
      
      setOrders(orders.filter(o => o.id !== id));
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order: ' + error.message);
    }
  };

  // ===== GET STATUS DISPLAY =====
  const getStatusInfo = (status) => {
    const statusMap = {
      'ORDER_CONFIRMED': { 
        label: '🟡 Order Confirmed', 
        class: 'order-confirmed',
        next: 'PROCESSED',
        step: 1,
        color: '#ff9800'
      },
      'PROCESSED': { 
        label: '🟠 Processing', 
        class: 'processed',
        next: 'AT_AIRPORT',
        step: 2,
        color: '#ff6b00'
      },
      'AT_AIRPORT': { 
        label: '✈️ At Airport', 
        class: 'at-airport',
        next: 'ARRIVED',
        step: 3,
        color: '#2196f3'
      },
      'ARRIVED': { 
        label: '✅ Delivered', 
        class: 'arrived',
        next: null,
        step: 4,
        color: '#4caf50'
      }
    };
    return statusMap[status] || statusMap['ORDER_CONFIRMED'];
  };

  // ===== GET TYPE LABEL =====
  const getTypeLabel = (type) => {
    return type === 'BOOK' ? '📚 Books' : '🎨 Crafts';
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
    const typeMatch = orderTypeFilter === 'All' || o.type === orderTypeFilter;
    return statusMatch && typeMatch;
  });

  // ===== CALCULATE STATS =====
  const statusCounts = {
    All: orders.length,
    'ORDER_CONFIRMED': orders.filter(o => o.status === 'ORDER_CONFIRMED').length,
    'PROCESSED': orders.filter(o => o.status === 'PROCESSED').length,
    'AT_AIRPORT': orders.filter(o => o.status === 'AT_AIRPORT').length,
    'ARRIVED': orders.filter(o => o.status === 'ARRIVED').length,
  };

  const pendingOrders = orders.filter(o => !o.driverId && o.status !== 'ARRIVED').length;

  // ===== Refresh Data =====
  const refreshData = () => {
    loadOrders();
    loadAvailableDrivers();
  };

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>Order Fulfillment</h1>
          <p className="page-subtitle" style={{ color: '#64748b', margin: '4px 0 0 0' }}>
            Manage order processing, driver assignment, and real-time delivery tracking
          </p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
          <button 
            onClick={refreshData}
            style={{
              marginLeft: '12px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              background: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cards-grid">
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <div className="stat-value">{pendingOrders}</div>
          <div className="stat-trend">Need driver assignment</div>
          <div className="stat-sub">{statusCounts['ORDER_CONFIRMED']} confirmed</div>
        </div>
        <div className="stat-card">
          <h3>In Transit</h3>
          <div className="stat-value">{statusCounts['AT_AIRPORT']}</div>
          <div className="stat-trend">✈️ With drivers</div>
          <div className="stat-sub">{statusCounts['PROCESSED']} processing</div>
        </div>
        <div className="stat-card">
          <h3>Available Drivers</h3>
          <div className="stat-value">{availableDrivers.filter(d => d.status === 'AVAILABLE').length}</div>
          <div className="stat-trend">✅ Ready to assign</div>
          <div className="stat-sub">Total: {availableDrivers.length} drivers</div>
        </div>
        <div className="stat-card">
          <h3>Delivered Today</h3>
          <div className="stat-value">
            {orders.filter(o => {
              const today = new Date().toISOString().split('T')[0];
              const updated = new Date(o.updatedAt).toISOString().split('T')[0];
              return o.status === 'ARRIVED' && updated === today;
            }).length}
          </div>
          <div className="stat-trend">✅ Completed</div>
          <div className="stat-sub">Total delivered: {statusCounts['ARRIVED']}</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card-panel" style={{ marginBottom: '24px' }}>
        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          marginBottom: '16px',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'ORDER_CONFIRMED', 'PROCESSED', 'AT_AIRPORT', 'ARRIVED'].map((status) => {
              const labelMap = {
                'All': `All (${statusCounts.All})`,
                'ORDER_CONFIRMED': `🟡 Confirmed (${statusCounts['ORDER_CONFIRMED']})`,
                'PROCESSED': `🟠 Processing (${statusCounts['PROCESSED']})`,
                'AT_AIRPORT': `✈️ At Airport (${statusCounts['AT_AIRPORT']})`,
                'ARRIVED': `✅ Delivered (${statusCounts['ARRIVED']})`
              };
              return (
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
                    fontSize: '13px',
                    fontWeight: statusFilter === status ? '600' : '400',
                    transition: 'all 0.2s'
                  }}
                >
                  {labelMap[status]}
                </span>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '8px', 
                border: '1px solid #e5e5e5',
                background: 'white',
                fontSize: '13px'
              }}
            >
              <option value="All">All Types</option>
              <option value="BOOK">📚 Books</option>
              <option value="CRAFT">🎨 Crafts</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No orders found. Orders will appear here when users place them.
          </div>
        ) : (
          <div className="data-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e5e5e5' }}>
                  <th style={{ padding: '12px' }}>Order ID</th>
                  <th style={{ padding: '12px' }}>Recipient</th>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Items</th>
                  <th style={{ padding: '12px' }}>Driver</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <tr key={order.id} style={{ 
                      borderBottom: '1px solid #f0f0f0',
                      opacity: order.status === 'ARRIVED' ? 0.7 : 1,
                      background: order.status === 'ARRIVED' ? '#fafafa' : 'white'
                    }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{order.orderId}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div><strong>{order.recipient}</strong></div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          📍 {order.location}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '2px 10px', 
                          borderRadius: '12px',
                          background: order.type === 'BOOK' ? '#e3f2fd' : '#f3e5f5',
                          color: order.type === 'BOOK' ? '#0d47a1' : '#4a148c',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {getTypeLabel(order.type)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>
                        <div>{order.items}</div>
                        {order.trackingNumber && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            📦 {order.trackingNumber}
                          </div>
                        )}
                        {order.notes && (
                          <div style={{ fontSize: '11px', color: '#ff9800', marginTop: '2px' }}>
                            📝 {order.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {order.driverId ? (
                          <div>
                            <strong style={{ color: '#1E4D4B' }}>{order.driverName}</strong>
                            <div style={{ 
                              fontSize: '11px', 
                              color: order.status === 'ARRIVED' ? '#4caf50' : '#2196f3',
                              fontWeight: '500'
                            }}>
                              {order.status === 'ARRIVED' ? '✅ Completed' : '🚚 In Transit'}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#ff9800', fontSize: '13px', fontWeight: '500' }}>
                            ⚠️ Not Assigned
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                          <div style={{ 
                            width: '100%', 
                            height: '3px', 
                            background: '#e5e5e5', 
                            borderRadius: '2px',
                            marginTop: '6px'
                          }}>
                            <div style={{ 
                              width: `${(statusInfo.step / 4) * 100}%`, 
                              height: '100%', 
                              background: statusInfo.step === 4 ? '#4caf50' : '#1E4D4B',
                              borderRadius: '2px',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                            Step {statusInfo.step}/4
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {!order.driverId && order.status !== 'ARRIVED' && (
                            <button 
                              className="btn-small" 
                              onClick={() => openAssignModal(order)}
                              style={{ 
                                background: '#1E4D4B', 
                                color: 'white',
                                fontSize: '11px',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              👤 Assign
                            </button>
                          )}
                          {order.driverId && order.status !== 'ARRIVED' && (
                            <>
                              <button 
                                className="btn-small" 
                                onClick={() => {
                                  setUpdatingOrder(order);
                                  setUpdateData({ status: '', note: '', location: '' });
                                  setShowUpdateModal(true);
                                }}
                                style={{ 
                                  background: '#2196f3', 
                                  color: 'white',
                                  fontSize: '11px',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                📍 Update
                              </button>
                              <button 
                                className="btn-small" 
                                onClick={() => handleReassignDriver(order)}
                                style={{ 
                                  background: '#ff9800', 
                                  color: 'white',
                                  fontSize: '11px',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                🔄 Reassign
                              </button>
                            </>
                          )}
                          <button 
                            className="btn-small" 
                            onClick={() => handleDelete(order.id)}
                            style={{ 
                              background: '#dc3545', 
                              color: 'white',
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
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
        <div className="table-footer" style={{ 
          padding: '12px', 
          color: '#64748b', 
          fontSize: '14px',
          borderTop: '1px solid #e5e5e5',
          marginTop: '12px'
        }}>
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* ===== ASSIGN DRIVER MODAL ===== */}
      {showAssignModal && selectedOrder && (
        <div className="modal-overlay" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999 
        }}>
          <div className="modal-content" style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '32px', 
            maxWidth: '550px', 
            width: '100%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ color: '#1E4D4B', marginBottom: '4px' }}>👤 Assign Driver</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Order: <strong>{selectedOrder.orderId}</strong> - {selectedOrder.items}
            </p>

            {/* Order Details */}
            <div style={{ 
              background: '#f8fafc', 
              padding: '12px', 
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <span style={{ color: '#64748b' }}>Recipient:</span>
                <span><strong>{selectedOrder.recipient}</strong></span>
                <span style={{ color: '#64748b' }}>Location:</span>
                <span><strong>{selectedOrder.location}</strong></span>
                <span style={{ color: '#64748b' }}>Items:</span>
                <span><strong>{selectedOrder.items}</strong></span>
                {selectedOrder.notes && (
                  <>
                    <span style={{ color: '#64748b' }}>Notes:</span>
                    <span style={{ color: '#ff9800' }}>{selectedOrder.notes}</span>
                  </>
                )}
              </div>
            </div>

            {/* Driver Selection - REAL DATA from database */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Select Driver
              </label>
              {loadingDrivers ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  Loading drivers...
                </div>
              ) : availableDrivers.length === 0 ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#ff9800',
                  background: '#fff3e0',
                  borderRadius: '8px'
                }}>
                  ⚠️ No drivers registered. Please ask users to register as drivers.
                </div>
              ) : (
                <select 
                  className="form-control" 
                  value={selectedDriver} 
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    border: '1px solid #e5e5e5', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Choose a driver...</option>
                  {availableDrivers.map(driver => (
                    <option 
                      key={driver.id} 
                      value={driver.id}
                      disabled={driver.status === 'OFFLINE'}
                    >
                      {driver.name} 
                      {driver.phone && ` (${driver.phone})`}
                      {driver.status === 'AVAILABLE' ? ' ✅ Available' : 
                       driver.status === 'ON_DELIVERY' ? ' 🚚 On Delivery' : ' ⏸️ Offline'}
                    </option>
                  ))}
                </select>
              )}
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Showing {availableDrivers.filter(d => d.status === 'AVAILABLE').length} available drivers
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e5e5e5', paddingTop: '20px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => { setShowAssignModal(false); setSelectedOrder(null); setSelectedDriver(''); }}
                style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', background: 'white' }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleAssignDriver}
                disabled={!selectedDriver || assigning || loadingDrivers}
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  cursor: (!selectedDriver || assigning || loadingDrivers) ? 'not-allowed' : 'pointer',
                  background: (!selectedDriver || assigning || loadingDrivers) ? '#ccc' : '#1E4D4B',
                  color: (!selectedDriver || assigning || loadingDrivers) ? '#666' : 'white'
                }}
              >
                {assigning ? 'Assigning...' : 'Assign Driver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MANUAL UPDATE STATUS MODAL ===== */}
      {showUpdateModal && updatingOrder && (
        <div className="modal-overlay" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999 
        }}>
          <div className="modal-content" style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '32px', 
            maxWidth: '500px', 
            width: '100%' 
          }}>
            <h2 style={{ color: '#1E4D4B', marginBottom: '4px' }}>📍 Update Delivery Status</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Order: <strong>{updatingOrder.orderId}</strong>
            </p>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Status
              </label>
              <select
                className="form-control"
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select status...</option>
                <option value="PROCESSED">🟠 Processing</option>
                <option value="AT_AIRPORT">✈️ At Airport</option>
                <option value="ARRIVED">✅ Delivered</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Location
              </label>
              <input
                type="text"
                className="form-control"
                value={updateData.location}
                onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                placeholder="e.g., Colombo Airport Hub, Kandy Depot"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Note (Optional)
              </label>
              <textarea
                className="form-control"
                value={updateData.note}
                onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                placeholder="Add any delivery notes..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minHeight: '60px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => { setShowUpdateModal(false); setUpdatingOrder(null); setUpdateData({ status: '', note: '', location: '' }); }}
                style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', background: 'white' }}
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
                  cursor: updateData.status ? 'pointer' : 'not-allowed',
                  background: updateData.status ? '#1E4D4B' : '#ccc',
                  color: updateData.status ? 'white' : '#666'
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="two-column">
        <div className="card-panel">
          <h3>📦 Order Status Overview</h3>
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>🟡 Order Confirmed</span>
              <span><strong>{statusCounts['ORDER_CONFIRMED']}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>🟠 Processing</span>
              <span><strong>{statusCounts['PROCESSED']}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>✈️ At Airport</span>
              <span><strong>{statusCounts['AT_AIRPORT']}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>✅ Delivered</span>
              <span><strong>{statusCounts['ARRIVED']}</strong></span>
            </div>
          </div>
        </div>

        <div className="card-panel">
          <h3>🚚 Driver Summary</h3>
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>✅ Available</span>
              <span style={{ color: '#4caf50' }}><strong>{availableDrivers.filter(d => d.status === 'AVAILABLE').length}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>🚚 On Delivery</span>
              <span style={{ color: '#ff9800' }}><strong>{availableDrivers.filter(d => d.status === 'ON_DELIVERY').length}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>⏸️ Offline</span>
              <span style={{ color: '#dc3545' }}><strong>{availableDrivers.filter(d => d.status === 'OFFLINE').length}</strong></span>
            </div>
            <div style={{ 
              marginTop: '12px', 
              padding: '8px 12px', 
              background: '#f8fafc', 
              borderRadius: '8px',
              fontSize: '12px',
              color: '#64748b'
            }}>
              Total Registered Drivers: <strong>{availableDrivers.length}</strong>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}

export default OrderFulfillment;