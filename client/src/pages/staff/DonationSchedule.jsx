// pages/staff/DonationSchedule.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function DonationSchedule() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [donations, setDonations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  
  // Verification form
  const [verifyForm, setVerifyForm] = useState({
    actualCount: 0,
    isCollectionComplete: false,
    staffNotes: '',
    status: 'VERIFIED'
  });

  // Appointment form
  const [appointmentForm, setAppointmentForm] = useState({ 
    donorName: '', 
    donationType: '', 
    status: 'SCHEDULED',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: 'Morning (10:00 AM - 12:00 PM)',
    contactInfo: '',
    notes: '',
    estimatedBooks: 0
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
    // Fetch all data
    fetchAllData();
    
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch all data from API
  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDonations(),
        fetchTodayAppointments()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Fetch donations from API (submitted by users)
  const fetchDonations = async () => {
    try {
      // Replace with your actual API endpoint
      // const response = await fetch('/api/staff/donations');
      // const data = await response.json();
      
      // Demo data - these come from user submissions
      const mockDonations = [
        { 
          id: 1, 
          userId: 45,
          donor: 'Malini Perera', 
          location: 'Colombo 07', 
          dropOffDate: '2026-07-15',
          timeSlot: 'Morning (10:00 AM - 12:00 PM)',
          requestedCount: 5, 
          books: '5 Books',
          category: 'Academic',
          notes: 'O/L Science past papers collection',
          collectionName: 'O/L Science Past Papers 2018-2024',
          status: 'PENDING',
          estimatedPoints: 50,
          verifiedCount: null,
          pointsAwarded: null,
          createdAt: '2026-07-15T10:30:00Z'
        },
        { 
          id: 2, 
          userId: 78,
          donor: 'University of Peradeniya', 
          location: 'Kandy', 
          dropOffDate: '2026-07-15',
          timeSlot: 'Afternoon (02:00 PM - 04:00 PM)',
          requestedCount: 30, 
          books: 'Bulk Pickup',
          category: 'Academic',
          notes: 'Library surplus - multiple subjects',
          collectionName: 'Engineering Textbooks',
          status: 'PENDING',
          estimatedPoints: 300,
          verifiedCount: null,
          pointsAwarded: null,
          createdAt: '2026-07-15T14:15:00Z'
        },
        { 
          id: 3, 
          userId: 92,
          donor: 'Nuwara Eliya Public Library', 
          location: 'Nuwara Eliya', 
          dropOffDate: '2026-07-15',
          timeSlot: 'Afternoon (02:00 PM - 04:00 PM)',
          requestedCount: 8, 
          books: '8 Books',
          category: 'Fiction',
          notes: 'Community donation drive',
          collectionName: 'Classic Literature Collection',
          status: 'VERIFIED',
          estimatedPoints: 80,
          verifiedCount: 8,
          pointsAwarded: 80,
          createdAt: '2026-07-15T15:30:00Z'
        }
      ];

      setDonations(mockDonations);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  // Fetch ONLY today's drop-off appointments
  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Replace with your actual API endpoint
      // const response = await fetch(`/api/staff/appointments/today`);
      // const data = await response.json();
      
      // Demo data - these are scheduled pickups/drop-offs for today
      const mockAppointments = [
        { 
          id: 1, 
          donorName: 'Dr. Anura Bandaranaike', 
          donationType: 'Personal Collection (50+ units)', 
          status: 'ARRIVED',
          appointmentDate: today,
          timeSlot: 'Morning (10:00 AM - 12:00 PM)',
          contactInfo: '+94 77 123 4567',
          notes: 'Arrived in white van',
          estimatedBooks: 50,
          donationId: null,
          createdAt: '2026-07-15T08:00:00Z'
        },
        { 
          id: 2, 
          donorName: 'Royal College Colombo', 
          donationType: 'Textbook Drive • 300+ units', 
          status: 'IN_TRANSIT',
          appointmentDate: today,
          timeSlot: 'Afternoon (02:00 PM - 04:00 PM)',
          contactInfo: '+94 11 234 5678',
          notes: 'Large collection - need 2 staff members',
          estimatedBooks: 300,
          donationId: 2,
          createdAt: '2026-07-15T09:30:00Z'
        },
        { 
          id: 3, 
          donorName: 'Galle Heritage Foundation', 
          donationType: 'Historical Collection (25+ units)', 
          status: 'SCHEDULED',
          appointmentDate: today,
          timeSlot: 'Evening (04:00 PM - 06:00 PM)',
          contactInfo: '+94 91 345 6789',
          notes: 'Fragile books - handle with care',
          estimatedBooks: 25,
          donationId: null,
          createdAt: '2026-07-15T11:00:00Z'
        }
      ];

      // Sort by time slot
      const timeOrder = { 
        'Morning (10:00 AM - 12:00 PM)': 1,
        'Afternoon (02:00 PM - 04:00 PM)': 2,
        'Evening (04:00 PM - 06:00 PM)': 3
      };
      
      const sortedAppointments = mockAppointments.sort((a, b) => {
        return (timeOrder[a.timeSlot] || 4) - (timeOrder[b.timeSlot] || 4);
      });

      setAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchAllData();
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

  // Calculate points based on verification
  const calculatePoints = (actualCount, isCollectionComplete) => {
    const basePoints = actualCount * 10;
    const bonus = isCollectionComplete ? Math.round(basePoints * 0.1) : 0;
    return basePoints + bonus;
  };

  // Handle verification
  const handleVerifyDonation = (donation) => {
    setSelectedDonation(donation);
    setVerifyForm({
      actualCount: donation.requestedCount || 0,
      isCollectionComplete: !!donation.collectionName,
      staffNotes: '',
      status: 'VERIFIED'
    });
    setShowVerifyModal(true);
  };

  const handleConfirmVerification = async () => {
    if (!selectedDonation) return;

    const { actualCount, isCollectionComplete, staffNotes, status } = verifyForm;
    const pointsAwarded = calculatePoints(actualCount, isCollectionComplete);

    try {
      // API call to save verification
      // await fetch(`/api/staff/donations/${selectedDonation.id}/verify`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     verifiedCount: actualCount,
      //     isCollectionComplete,
      //     staffNotes,
      //     status,
      //     pointsAwarded
      //   })
      // });

      // Update local state
      const updatedDonations = donations.map(d => {
        if (d.id === selectedDonation.id) {
          return {
            ...d,
            verifiedCount: actualCount,
            isCollectionComplete,
            staffNotes,
            status,
            pointsAwarded
          };
        }
        return d;
      });
      setDonations(updatedDonations);
      setShowVerifyModal(false);
      setSelectedDonation(null);
      
      // Reset form
      setVerifyForm({
        actualCount: 0,
        isCollectionComplete: false,
        staffNotes: '',
        status: 'VERIFIED'
      });

      alert(`✅ Donation verified! ${pointsAwarded} points awarded to ${selectedDonation.donor}`);
      
      // Refresh to get latest data
      fetchAllData();
    } catch (error) {
      console.error('Error verifying donation:', error);
      alert('Error verifying donation. Please try again.');
    }
  };

  const handleRejectDonation = async () => {
    if (!selectedDonation) return;

    try {
      // API call to reject donation
      // await fetch(`/api/staff/donations/${selectedDonation.id}/reject`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     status: 'REJECTED',
      //     staffNotes: verifyForm.staffNotes || 'Rejected during verification'
      //   })
      // });

      const updatedDonations = donations.map(d => {
        if (d.id === selectedDonation.id) {
          return {
            ...d,
            status: 'REJECTED',
            staffNotes: verifyForm.staffNotes || 'Rejected during verification'
          };
        }
        return d;
      });
      setDonations(updatedDonations);
      setShowVerifyModal(false);
      setSelectedDonation(null);
      
      setVerifyForm({
        actualCount: 0,
        isCollectionComplete: false,
        staffNotes: '',
        status: 'VERIFIED'
      });

      alert('❌ Donation rejected.');
      fetchAllData();
    } catch (error) {
      console.error('Error rejecting donation:', error);
      alert('Error rejecting donation. Please try again.');
    }
  };

  // Appointment CRUD
  const handleAddAppointment = async () => {
    try {
      // API call to save appointment
      // const response = await fetch('/api/staff/appointments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(appointmentForm)
      // });
      // const data = await response.json();

      const newAppointment = {
        id: Date.now(),
        ...appointmentForm,
        createdAt: new Date().toISOString()
      };
      
      setAppointments([...appointments, newAppointment]);
      setShowAppointmentModal(false);
      setAppointmentForm({ 
        donorName: '', 
        donationType: '', 
        status: 'SCHEDULED',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: 'Morning (10:00 AM - 12:00 PM)',
        contactInfo: '',
        notes: '',
        estimatedBooks: 0
      });
      alert('✅ Appointment added successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error adding appointment:', error);
      alert('Error adding appointment.');
    }
  };

  const handleEditAppointment = (appt) => {
    setEditingAppointment(appt);
    setAppointmentForm(appt);
    setShowAppointmentModal(true);
  };

  const handleUpdateAppointment = async () => {
    try {
      // await fetch(`/api/staff/appointments/${editingAppointment.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(appointmentForm)
      // });

      const updatedAppointments = appointments.map(a => 
        a.id === editingAppointment.id ? { ...a, ...appointmentForm } : a
      );
      setAppointments(updatedAppointments);
      setShowAppointmentModal(false);
      setEditingAppointment(null);
      setAppointmentForm({ 
        donorName: '', 
        donationType: '', 
        status: 'SCHEDULED',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: 'Morning (10:00 AM - 12:00 PM)',
        contactInfo: '',
        notes: '',
        estimatedBooks: 0
      });
      alert('✅ Appointment updated successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error updating appointment.');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      // await fetch(`/api/staff/appointments/${id}`, { method: 'DELETE' });
      setAppointments(appointments.filter(a => a.id !== id));
      alert('Appointment deleted.');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error deleting appointment.');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { class: 'draft', label: '⏳ PENDING' },
      'VERIFIED': { class: 'published', label: '✅ VERIFIED' },
      'REJECTED': { class: 'rejected', label: '❌ REJECTED' },
      'SCHEDULED': { class: 'draft', label: '📅 SCHEDULED' },
      'IN_TRANSIT': { class: 'in-transit', label: '🚚 IN TRANSIT' },
      'ARRIVED': { class: 'published', label: '✅ ARRIVED' }
    };
    return statusMap[status] || { class: 'draft', label: status };
  };

  // Count statistics
  const pendingCount = donations.filter(d => d.status === 'PENDING').length;
  const verifiedCount = donations.filter(d => d.status === 'VERIFIED').length;
  const totalDonations = donations.length;
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointmentDate === today);
  const arrivedCount = todayAppointments.filter(a => a.status === 'ARRIVED').length;
  const inTransitCount = todayAppointments.filter(a => a.status === 'IN_TRANSIT').length;
  const scheduledCount = todayAppointments.filter(a => a.status === 'SCHEDULED').length;

  if (loading) {
    return (
      <StaffLayout>
        <div className="loading-container">
          <h2>Loading donations...</h2>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="content-header">
        <h1>Donation Management</h1>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cards-grid">
        <div className="stat-card">
          <h3>Pending Verification</h3>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-trend">+{totalDonations} Total</div>
          <div className="stat-sub">Donations waiting for staff review</div>
        </div>
        <div className="stat-card today-stats">
          <h3>Today's Drop-offs</h3>
          <div className="stat-value">{todayAppointments.length}</div>
          <div className="stat-trend">
            {arrivedCount} arrived • {inTransitCount} in transit • {scheduledCount} scheduled
          </div>
          <div className="stat-sub">Scheduled for {new Date().toLocaleDateString()}</div>
        </div>
        <div className="stat-card">
          <h3>Verified Donations</h3>
          <div className="stat-value">{verifiedCount}</div>
          <div className="stat-sub">Points awarded: {verifiedCount * 10}+</div>
        </div>
      </div>

      <div className="two-column">
        {/* LEFT COLUMN: User Donation Submissions */}
        <div className="card-panel">
          <div className="panel-header">
            <h3>📥 User Donation Submissions</h3>
            <span className="pending-count">{pendingCount} pending verification</span>
          </div>
          {donations.length === 0 ? (
            <p className="empty-state">No donations submitted yet</p>
          ) : (
            donations.map((d) => {
              const statusInfo = getStatusBadge(d.status);
              const isPending = d.status === 'PENDING';
              const isVerified = d.status === 'VERIFIED';
              const isRejected = d.status === 'REJECTED';
              
              return (
                <div 
                  key={d.id} 
                  className={`donation-item ${isPending ? 'pending' : ''} ${isVerified ? 'verified' : ''} ${isRejected ? 'rejected' : ''}`}
                >
                  <div className="donation-content">
                    <div className="donation-info">
                      <div className="donation-meta">
                        <span className="donation-date">
                          📅 {new Date(d.dropOffDate).toLocaleDateString()} • {d.timeSlot}
                        </span>
                        <span className={`status-badge ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <h4 className="donor-name">{d.donor}</h4>
                      <p className="donation-details">
                        <strong>{d.category}</strong> • {d.books}
                        {d.collectionName && (
                          <span className="collection-badge">
                            📚 Collection: {d.collectionName}
                          </span>
                        )}
                      </p>
                      <p className="donation-location">📍 {d.location}</p>
                      {d.notes && (
                        <p className="donation-notes">📝 {d.notes}</p>
                      )}
                      {isVerified && d.pointsAwarded && (
                        <p className="points-awarded">
                          ⭐ {d.pointsAwarded} points awarded ({d.verifiedCount} books verified)
                        </p>
                      )}
                      {isRejected && (
                        <p className="rejection-notes">
                          {d.staffNotes && `Notes: ${d.staffNotes}`}
                        </p>
                      )}
                      <p className="submitted-time">
                        Submitted: {new Date(d.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {isPending && (
                      <div className="donation-action">
                        <button 
                          className="btn-verify" 
                          onClick={() => handleVerifyDonation(d)}
                        >
                          🔍 Verify
                        </button>
                      </div>
                    )}
                    {isVerified && (
                      <div className="verified-badge">✅ Verified</div>
                    )}
                    {isRejected && (
                      <div className="rejected-badge">❌ Rejected</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: Today's Drop-off Appointments */}
        <div className="card-panel">
          <div className="panel-header">
            <h3>📅 Today's Drop-off Appointments</h3>
            <div className="panel-actions">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="refresh-btn"
                title="Refresh appointments"
              >
                {refreshing ? '⟳' : '↻'}
              </button>
              <button 
                className="btn-add-appointment" 
                onClick={() => { 
                  setEditingAppointment(null); 
                  setAppointmentForm({ 
                    donorName: '', 
                    donationType: '', 
                    status: 'SCHEDULED',
                    appointmentDate: today,
                    timeSlot: 'Morning (10:00 AM - 12:00 PM)',
                    contactInfo: '',
                    notes: '',
                    estimatedBooks: 0
                  }); 
                  setShowAppointmentModal(true); 
                }}
              >
                + Add Drop-off
              </button>
            </div>
          </div>

          {/* Today's date display */}
          <div className="today-date-display">
            📆 {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            {todayAppointments.length > 0 && (
              <span className="appointment-count">
                • {todayAppointments.length} appointment{todayAppointments.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {todayAppointments.length === 0 ? (
            <div className="empty-appointments">
              <p>No drop-offs scheduled for today</p>
              <p className="empty-subtext">Click "Add Drop-off" to schedule a new appointment</p>
            </div>
          ) : (
            <>
              {/* Status summary chips */}
              <div className="status-chips">
                {arrivedCount > 0 && (
                  <span className="chip arrived">
                    ✅ Arrived: {arrivedCount}
                  </span>
                )}
                {inTransitCount > 0 && (
                  <span className="chip in-transit">
                    🚚 In Transit: {inTransitCount}
                  </span>
                )}
                {scheduledCount > 0 && (
                  <span className="chip scheduled">
                    📅 Scheduled: {scheduledCount}
                  </span>
                )}
              </div>

              {todayAppointments.map((a) => {
                const statusInfo = getStatusBadge(a.status);
                
                return (
                  <div 
                    key={a.id} 
                    className={`appointment-item status-${a.status.toLowerCase()}`}
                  >
                    <div className="appointment-info">
                      <div className="appointment-header">
                        <strong className="donor-name">{a.donorName}</strong>
                        {a.donationId && (
                          <span className="donation-id-badge">
                            Donation #{a.donationId}
                          </span>
                        )}
                      </div>
                      <div className="appointment-type">
                        <span>{a.donationType}</span>
                        {a.estimatedBooks > 0 && (
                          <span className="book-count">
                            • 📚 {a.estimatedBooks} books
                          </span>
                        )}
                      </div>
                      <div className="appointment-details">
                        <span>🕐 {a.timeSlot}</span>
                        {a.contactInfo && (
                          <span className="contact-info">📞 {a.contactInfo}</span>
                        )}
                        {a.notes && (
                          <span className="appointment-notes">📝 {a.notes}</span>
                        )}
                      </div>
                    </div>
                    <div className="appointment-actions">
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditAppointment(a)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteAppointment(a.id)} 
                      >
                        Del
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && selectedDonation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Verify Donation</h2>
            <p className="modal-subtitle">
              Review and verify the donation from <strong>{selectedDonation.donor}</strong>
            </p>

            {/* User Submitted Info - Read Only */}
            <div className="user-submitted-info">
              <h4>📋 User Submitted Information</h4>
              <div className="info-grid">
                <p><strong>Category:</strong> {selectedDonation.category}</p>
                <p><strong>Submitted Count:</strong> {selectedDonation.requestedCount} books</p>
                <p><strong>Drop-off Date:</strong> {new Date(selectedDonation.dropOffDate).toLocaleDateString()}</p>
                <p><strong>Time Slot:</strong> {selectedDonation.timeSlot}</p>
                {selectedDonation.collectionName && (
                  <p><strong>Collection:</strong> {selectedDonation.collectionName}</p>
                )}
                {selectedDonation.notes && (
                  <p><strong>Notes:</strong> {selectedDonation.notes}</p>
                )}
                <p><strong>Estimated Points:</strong> ~{selectedDonation.estimatedPoints} pts</p>
              </div>
            </div>

            {/* Staff Verification Fields */}
            <div className="staff-verification">
              <h4>🔍 Staff Verification</h4>
              
              <div className="form-group">
                <label>Actual Count Received</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={verifyForm.actualCount} 
                  onChange={(e) => setVerifyForm({...verifyForm, actualCount: parseInt(e.target.value) || 0})} 
                  min="0"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={verifyForm.isCollectionComplete} 
                    onChange={(e) => setVerifyForm({...verifyForm, isCollectionComplete: e.target.checked})} 
                  />
                  Collection Complete? (10% bonus if complete)
                </label>
              </div>

              <div className="form-group">
                <label>Staff Notes</label>
                <textarea 
                  className="form-control" 
                  value={verifyForm.staffNotes} 
                  onChange={(e) => setVerifyForm({...verifyForm, staffNotes: e.target.value})} 
                  placeholder="Optional notes for audit purposes..."
                />
              </div>

              {/* Points Calculation */}
              {verifyForm.actualCount > 0 && (
                <div className="points-calculation">
                  <h4>⭐ Points Awarded</h4>
                  <div className="points-details">
                    <p>
                      Base: {verifyForm.actualCount} × 10 = {verifyForm.actualCount * 10} pts
                    </p>
                    {verifyForm.isCollectionComplete && (
                      <p className="bonus-points">
                        + Bonus (10%): +{Math.round(verifyForm.actualCount * 10 * 0.1)} pts
                      </p>
                    )}
                    <p className="total-points">
                      Total: {calculatePoints(verifyForm.actualCount, verifyForm.isCollectionComplete)} pts
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => { 
                  setShowVerifyModal(false); 
                  setSelectedDonation(null); 
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-reject" 
                onClick={handleRejectDonation}
              >
                Reject
              </button>
              <button 
                className="btn-verify-confirm" 
                onClick={handleConfirmVerification}
              >
                ✅ Verify & Award Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="modal-overlay">
          <div className="modal-content appointment-modal">
            <h2>
              {editingAppointment ? 'Edit Drop-off Appointment' : 'Add New Drop-off Appointment'}
            </h2>
            
            <div className="form-group">
              <label>Donor Name *</label>
              <input 
                type="text" 
                className="form-control" 
                value={appointmentForm.donorName} 
                onChange={(e) => setAppointmentForm({...appointmentForm, donorName: e.target.value})} 
                required
              />
            </div>

            <div className="form-group">
              <label>Donation Type *</label>
              <input 
                type="text" 
                className="form-control" 
                value={appointmentForm.donationType} 
                onChange={(e) => setAppointmentForm({...appointmentForm, donationType: e.target.value})} 
                placeholder="e.g., Textbook Drive • 300+ units"
              />
            </div>

            <div className="form-group">
              <label>Estimated Books</label>
              <input 
                type="number" 
                className="form-control" 
                value={appointmentForm.estimatedBooks} 
                onChange={(e) => setAppointmentForm({...appointmentForm, estimatedBooks: parseInt(e.target.value) || 0})} 
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input 
                type="date" 
                className="form-control" 
                value={appointmentForm.appointmentDate} 
                onChange={(e) => setAppointmentForm({...appointmentForm, appointmentDate: e.target.value})} 
                required
              />
            </div>

            <div className="form-group">
              <label>Time Slot *</label>
              <select 
                className="form-control" 
                value={appointmentForm.timeSlot} 
                onChange={(e) => setAppointmentForm({...appointmentForm, timeSlot: e.target.value})} 
              >
                <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
                <option value="Afternoon (02:00 PM - 04:00 PM)">Afternoon (02:00 PM - 04:00 PM)</option>
                <option value="Evening (04:00 PM - 06:00 PM)">Evening (04:00 PM - 06:00 PM)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select 
                className="form-control" 
                value={appointmentForm.status} 
                onChange={(e) => setAppointmentForm({...appointmentForm, status: e.target.value})} 
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="ARRIVED">ARRIVED</option>
              </select>
            </div>

            <div className="form-group">
              <label>Contact Info</label>
              <input 
                type="text" 
                className="form-control" 
                value={appointmentForm.contactInfo} 
                onChange={(e) => setAppointmentForm({...appointmentForm, contactInfo: e.target.value})} 
                placeholder="Phone number or email"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea 
                className="form-control" 
                value={appointmentForm.notes} 
                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})} 
                placeholder="Special instructions or notes..."
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => { 
                  setShowAppointmentModal(false); 
                  setEditingAppointment(null); 
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={editingAppointment ? handleUpdateAppointment : handleAddAppointment}
              >
                {editingAppointment ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default DonationSchedule;