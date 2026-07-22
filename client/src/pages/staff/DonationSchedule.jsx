// pages/staff/DonationSchedule.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function DonationSchedule() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [donations, setDonations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
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
    estimatedBooks: 0,
    userId: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'LOGISTICS STAFF',
          id: user.id || user.userId || 'staff-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser({
          name: 'Staff User',
          role: 'LOGISTICS STAFF',
          id: 'staff-123'
        });
      }
    }
    fetchAllData();
  }, []);

  // ===== FETCH ALL DATA FROM DATABASE =====
  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all users first
      const usersResponse = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
        console.log('👤 Users loaded:', usersData.length);
      }

      // Fetch donations from database
      const donationsResponse = await fetch('/api/donations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json();
        console.log('📦 Donations loaded:', donationsData.length);
        processDonations(donationsData);
      }

      // Fetch appointments (if you have an appointments endpoint)
      // const appointmentsResponse = await fetch('/api/appointments/today', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // if (appointmentsResponse.ok) {
      //   const appointmentsData = await appointmentsResponse.json();
      //   setAppointments(appointmentsData);
      // }

    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data
      setDonations(getMockDonations());
      setAppointments(getMockAppointments());
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // ===== PROCESS DONATIONS WITH USER DATA =====
  const processDonations = (donationsData) => {
    const processedDonations = donationsData.map(donation => {
      // Find user for this donation
      const user = users.find(u => u.id === donation.userId);
      
      return {
        id: donation.id,
        userId: donation.userId,
        donor: user?.name || donation.donor || 'Unknown Donor',
        email: user?.email || donation.email || 'No email',
        phone: user?.phoneNumber || donation.phone || 'No phone',
        userLevel: user?.level || 0,
        userPoints: user?.points || 0,
        location: user?.address || donation.location || 'Not specified',
        dropOffDate: donation.dropOffDate || donation.createdAt || new Date().toISOString(),
        timeSlot: donation.timeSlot || 'Morning (10:00 AM - 12:00 PM)',
        requestedCount: donation.requestedCount || donation.bookCount || 0,
        books: `${donation.requestedCount || donation.bookCount || 0} Books`,
        category: donation.category || 'General',
        notes: donation.notes || '',
        collectionName: donation.collectionName || null,
        status: donation.status || 'PENDING',
        estimatedPoints: donation.estimatedPoints || (donation.requestedCount || 0) * 10 || 0,
        verifiedCount: donation.verifiedCount || 0,
        pointsAwarded: donation.pointsAwarded || 0,
        staffNotes: donation.staffNotes || '',
        createdAt: donation.createdAt || new Date().toISOString(),
        isCollectionComplete: donation.isCollectionComplete || false,
        awardedMysteryBox: donation.awardedMysteryBox || false
      };
    });

    setDonations(processedDonations);
  };

  // ===== MOCK APPOINTMENTS (Fallback) =====
  const getMockAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return [
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
        createdAt: new Date().toISOString()
      },
      { 
        id: 2, 
        donorName: 'Royal College Colombo', 
        donationType: 'Textbook Drive 300+ units', 
        status: 'IN_TRANSIT',
        appointmentDate: today,
        timeSlot: 'Afternoon (02:00 PM - 04:00 PM)',
        contactInfo: '+94 11 234 5678',
        notes: 'Large collection - need 2 staff members',
        estimatedBooks: 300,
        donationId: 2,
        createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
      }
    ];
  };

  // ===== GET STATUS BADGE =====
  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { class: 'draft', label: 'Pending' },
      'VERIFIED': { class: 'published', label: 'Verified' },
      'REJECTED': { class: 'rejected', label: 'Rejected' },
      'SCHEDULED': { class: 'draft', label: 'Scheduled' },
      'IN_TRANSIT': { class: 'in-transit', label: 'In Transit' },
      'ARRIVED': { class: 'published', label: 'Arrived' }
    };
    return statusMap[status] || { class: 'draft', label: status };
  };

  // ===== GET LEVEL BADGE =====
  const getLevelBadge = (level) => {
    const levelMap = {
      1: { label: 'Book Lover', color: '#4caf50' },
      2: { label: 'Bibliophile', color: '#2196f3' },
      3: { label: 'Grand Librarian', color: '#ff9800' },
      4: { label: 'Literary Elite', color: '#9c27b0' },
      5: { label: 'Legendary Reader', color: '#f44336' }
    };
    return levelMap[level] || levelMap[1];
  };

  // ===== CALCULATE POINTS =====
  const calculatePoints = (actualCount, isCollectionComplete) => {
    const basePoints = actualCount * 10;
    const bonus = isCollectionComplete ? Math.round(basePoints * 0.1) : 0;
    return basePoints + bonus;
  };

  // ===== HANDLE VERIFY DONATION =====
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

  // ===== CONFIRM VERIFICATION - SAVE TO DATABASE =====
  const handleConfirmVerification = async () => {
    if (!selectedDonation) return;

    const { actualCount, isCollectionComplete, staffNotes, status } = verifyForm;
    const pointsAwarded = calculatePoints(actualCount, isCollectionComplete);

    try {
      const token = localStorage.getItem('token');
      
      // Update donation in database
      const response = await fetch(`/api/donations/${selectedDonation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verifiedCount: actualCount,
          isCollectionComplete: isCollectionComplete,
          staffNotes: staffNotes,
          status: status,
          pointsAwarded: pointsAwarded,
          userId: selectedDonation.userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify donation');
      }

      const updatedDonation = await response.json();
      console.log('✅ Donation verified:', updatedDonation);

      // Update user points if donation is verified
      if (selectedDonation.userId && pointsAwarded > 0) {
        const user = users.find(u => u.id === selectedDonation.userId);
        if (user) {
          const newPoints = (user.points || 0) + pointsAwarded;
          await fetch(`/api/users/${selectedDonation.userId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              points: newPoints,
              level: calculateLevel(newPoints)
            })
          });
          console.log(`✅ Updated user ${user.name} points to ${newPoints}`);
        }
      }

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
      
      setVerifyForm({
        actualCount: 0,
        isCollectionComplete: false,
        staffNotes: '',
        status: 'VERIFIED'
      });

      alert(`✅ Donation verified! ${pointsAwarded} points awarded to ${selectedDonation.donor}`);
      fetchAllData();
      
    } catch (error) {
      console.error('Error verifying donation:', error);
      alert('Error verifying donation. Please try again.');
    }
  };

  // ===== CALCULATE LEVEL =====
  const calculateLevel = (points) => {
    if (points >= 1000) return 5;
    if (points >= 500) return 4;
    if (points >= 250) return 3;
    if (points >= 100) return 2;
    return 1;
  };

  // ===== HANDLE REJECT DONATION =====
  const handleRejectDonation = async () => {
    if (!selectedDonation) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/donations/${selectedDonation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'REJECTED',
          staffNotes: verifyForm.staffNotes || 'Rejected during verification'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject donation');
      }

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

      alert('Donation rejected.');
      fetchAllData();
      
    } catch (error) {
      console.error('Error rejecting donation:', error);
      alert('Error rejecting donation. Please try again.');
    }
  };

  // ===== APPOINTMENT CRUD =====
  const handleAddAppointment = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...appointmentForm,
          createdBy: currentUser.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add appointment');
      }

      const newAppointment = await response.json();
      setAppointments([newAppointment, ...appointments]);
      setShowAppointmentModal(false);
      setAppointmentForm({ 
        donorName: '', 
        donationType: '', 
        status: 'SCHEDULED',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: 'Morning (10:00 AM - 12:00 PM)',
        contactInfo: '',
        notes: '',
        estimatedBooks: 0,
        userId: ''
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
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/appointments/${editingAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      const updatedAppointment = await response.json();
      setAppointments(appointments.map(a => 
        a.id === editingAppointment.id ? updatedAppointment : a
      ));
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
        estimatedBooks: 0,
        userId: ''
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
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      setAppointments(appointments.filter(a => a.id !== id));
      alert('Appointment deleted.');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error deleting appointment.');
    }
  };

  // ===== MANUAL REFRESH =====
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

  // ===== STATS =====
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
        <div>
          <h1>Donation Management</h1>
          <p className="page-subtitle">Manage donation submissions and drop-off appointments</p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cards-grid">
        <div className="stat-card accent-warning">
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
        <div className="stat-card accent-success">
          <h3>Verified Donations</h3>
          <div className="stat-value">{verifiedCount}</div>
          <div className="stat-sub">Points awarded: {verifiedCount * 10}+</div>
        </div>
      </div>

      <div className="two-column">
        {/* LEFT COLUMN: User Donation Submissions */}
        <div className="card-panel">
          <div className="panel-header">
            <h3>User Donation Submissions</h3>
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
              const levelInfo = getLevelBadge(d.userLevel || 0);
              
              return (
                <div 
                  key={d.id} 
                  className={`donation-item ${isPending ? 'pending' : ''} ${isVerified ? 'verified' : ''} ${isRejected ? 'rejected' : ''}`}
                >
                  <div className="donation-content">
                    <div className="donation-info">
                      <div className="donation-meta">
                        <span className="donation-date">
                          {d.dropOffDate ? new Date(d.dropOffDate).toLocaleDateString() : 'N/A'} • {d.timeSlot || 'No time slot'}
                        </span>
                        <span className={`status-badge ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                        {/* Level Badge */}
                        <span style={{ 
                          padding: '2px 10px', 
                          borderRadius: '20px', 
                          background: levelInfo.color + '20',
                          color: levelInfo.color,
                          fontSize: '11px',
                          fontWeight: '600',
                          border: `1px solid ${levelInfo.color}40`
                        }}>
                          {levelInfo.label}
                        </span>
                      </div>
                      <h4 className="donor-name">{d.donor}</h4>
                      <p className="donation-details">
                        <strong>{d.category || 'General'}</strong> • {d.books || `${d.requestedCount || 0} Books`}
                        {d.collectionName && (
                          <span className="collection-badge">
                            Collection: {d.collectionName}
                          </span>
                        )}
                      </p>
                      <p className="donation-location">📍 {d.location || 'Not specified'}</p>
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
                        Submitted: {d.createdAt ? new Date(d.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    {isPending && (
                      <div className="donation-action">
                        <button 
                          className="btn-verify" 
                          onClick={() => handleVerifyDonation(d)}
                        >
                          Verify
                        </button>
                      </div>
                    )}
                    {isVerified && (
                      <div className="verified-badge">Verified</div>
                    )}
                    {isRejected && (
                      <div className="rejected-badge">Rejected</div>
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
            <h3>Today's Drop-off Appointments</h3>
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
                    estimatedBooks: 0,
                    userId: ''
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
            {new Date().toLocaleDateString('en-US', { 
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
                    Arrived: {arrivedCount}
                  </span>
                )}
                {inTransitCount > 0 && (
                  <span className="chip in-transit">
                    In Transit: {inTransitCount}
                  </span>
                )}
                {scheduledCount > 0 && (
                  <span className="chip scheduled">
                    Scheduled: {scheduledCount}
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
                            • {a.estimatedBooks} books
                          </span>
                        )}
                      </div>
                      <div className="appointment-details">
                        <span>{a.timeSlot}</span>
                        {a.contactInfo && (
                          <span className="contact-info">{a.contactInfo}</span>
                        )}
                        {a.notes && (
                          <span className="appointment-notes">{a.notes}</span>
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
                        Delete
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
              <h4>User Submitted Information</h4>
              <div className="info-grid">
                <p><strong>Donor:</strong> {selectedDonation.donor}</p>
                <p><strong>Email:</strong> {selectedDonation.email}</p>
                <p><strong>Phone:</strong> {selectedDonation.phone}</p>
                <p><strong>Category:</strong> {selectedDonation.category}</p>
                <p><strong>Submitted Count:</strong> {selectedDonation.requestedCount} books</p>
                <p><strong>Drop-off Date:</strong> {selectedDonation.dropOffDate ? new Date(selectedDonation.dropOffDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Time Slot:</strong> {selectedDonation.timeSlot}</p>
                <p><strong>Current Level:</strong> {getLevelBadge(selectedDonation.userLevel || 0).label}</p>
                <p><strong>Current Points:</strong> {selectedDonation.userPoints || 0}</p>
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
              <h4>Staff Verification</h4>
              
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
                  <h4>Points Awarded</h4>
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
                className="btn-save" 
                onClick={handleConfirmVerification}
              >
                Verify & Award Points
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
                placeholder="e.g., Textbook Drive 300+ units"
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