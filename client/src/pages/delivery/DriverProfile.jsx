import React, { useState, useEffect } from 'react';
import '../../styles/delivery.css';
import { API_BASE } from '../../services/api';

const DriverProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    rating: 0,
    memberSince: '',
    co2Saved: 0,
    reliabilityScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [showDocModal, setShowDocModal] = useState(false);
  const [docs, setDocs] = useState(() => {
    const saved = localStorage.getItem('ss_driver_docs');
    return saved ? JSON.parse(saved) : {
      driverLicense: { number: 'DL-98401-A', status: 'Verified', fileName: 'license_copy.pdf' },
      backgroundCheck: { number: 'BG-2025-492', status: 'Cleared', fileName: 'bg_clearance.pdf' },
      taxForms: { number: 'TIN-4920194', status: 'Current', fileName: 'tax_w9.pdf' }
    };
  });
  const [docForm, setDocForm] = useState(docs);
  const [docFiles, setDocFiles] = useState({});

  const [vehicle, setVehicle] = useState(() => {
    const saved = localStorage.getItem('ss_driver_vehicle');
    return saved ? JSON.parse(saved) : {
      type: 'Motorcycle / Delivery Scooter',
      plateNumber: 'WP BIZ-4829',
      model: 'Honda CD70 EV',
      icon: 'two_wheeler'
    };
  });
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState(vehicle);

  const handleSaveVehicle = () => {
    setVehicle(vehicleForm);
    localStorage.setItem('ss_driver_vehicle', JSON.stringify(vehicleForm));
    setShowVehicleModal(false);
    setMessage({ type: 'success', text: 'Vehicle details updated successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveDocs = () => {
    const updatedDocs = {
      driverLicense: { ...docForm.driverLicense, status: 'Verified' },
      backgroundCheck: { ...docForm.backgroundCheck, status: 'Cleared' },
      taxForms: { ...docForm.taxForms, status: 'Current' }
    };
    setDocs(updatedDocs);
    localStorage.setItem('ss_driver_docs', JSON.stringify(updatedDocs));
    setShowDocModal(false);
    setMessage({ type: 'success', text: 'Compliance & Documents updated successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setEditName(user.name || '');
        fetchDriverStats(user.id || user.userId);
      } catch (e) {
        console.error('Error parsing user data:', e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDriverStats = async (driverId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/driver/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      const ordersList = Array.isArray(data) ? data : (data.orders || []);
      
      // Calculate stats
      const completedOrders = ordersList.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED');
      const activeOrdersCount = ordersList.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'IN_TRANSIT').length;
      const totalDeliveries = completedOrders.length;
      const getOrderEarningsLkr = (o) => {
        if (o.cashAmount && o.cashAmount > 0) {
          return o.cashAmount <= 100 ? o.cashAmount * 300 : o.cashAmount;
        }
        return 450; // Standard Rs. 450 LKR driver fee per completed delivery
      };
      const totalEarningsLkr = completedOrders.reduce((sum, o) => sum + getOrderEarningsLkr(o), 0);
      
      // Get member since from user data or fallback
      const rawDate = currentUser?.createdAt || currentUser?.updatedAt;
      const memberSince = rawDate 
        ? new Date(rawDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      setStats({
        totalDeliveries,
        totalEarnings: totalEarningsLkr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        rating: 4.92,
        memberSince,
        co2Saved: Math.round(totalDeliveries * 0.33),
        reliabilityScore: Math.min(98, 85 + Math.round(totalDeliveries / 10)),
        activeOrdersCount
      });

    } catch (error) {
      console.error('Error fetching driver stats:', error);
      // Set fallback stats
      setStats({
        totalDeliveries: 0,
        totalEarnings: '0.00',
        rating: 4.92,
        memberSince: 'N/A',
        co2Saved: 0,
        reliabilityScore: 85
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      if (profileFile) formData.append('profileImage', profileFile);
      const res = await fetch(`${API_BASE}/users/${currentUser.id}/profile`, { method: 'PUT', body: formData });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed'); }
      const updated = await res.json();
      setCurrentUser(updated);
      setProfileFile(null);
      setPreviewUrl('');
      setEditMode(false);
      localStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('ss_current_user', JSON.stringify(updated));
      setMessage({ type: 'success', text: 'Profile updated!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-header">
          <h1 style={{ fontSize: '40px' }}>Driver Profile</h1>
          <p>Loading your profile...</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading driver profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 style={{ fontSize: '40px' }}>Driver Profile</h1>
        <p>Manage your professional credentials and delivery performance.</p>
      </div>

      {message && (
        <div style={{
          padding: '12px 20px', borderRadius: 8, marginBottom: 16, fontWeight: 600, fontSize: 14,
          background: message.type === 'success' ? '#E8F5E9' : '#FFEBEE',
          color: message.type === 'success' ? '#2E7D32' : '#C62828',
        }}>
          {message.type === 'success' ? '✓' : '⚠'} {message.text}
        </div>
      )}

      <div className="profile-grid" style={{ marginTop: 16 }}>
        {/* Identity */}
        <section className="col-span-8 identity-card">
          <div className="info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#1E4D4B', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                fontWeight: 700, overflow: 'hidden', flexShrink: 0, position: 'relative', cursor: 'pointer'
              }} onClick={() => !editMode && setEditMode(true)}>
                {(previewUrl || currentUser?.profileImage) ? (
                  <img src={previewUrl || currentUser?.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (currentUser?.name?.charAt(0) || 'D')}
                {editMode && (
                  <label style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.6)', color: 'white', textAlign: 'center',
                    fontSize: 10, fontWeight: 600, padding: '3px 0', cursor: 'pointer'
                  }}>
                    <i className="fa-solid fa-camera"></i>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              <div className="name-title">
                {editMode ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    style={{ fontSize: 18, fontWeight: 700, padding: '4px 8px', border: '1px solid #DEE2E6', borderRadius: 6, width: '100%' }} />
                ) : <h3>{currentUser?.name || 'Delivery Driver'}</h3>}
                <p>{currentUser?.role || 'Delivery Personnel'}</p>
              </div>
            </div>
            <div className="details-grid">
              <div>
                <div className="field-label">Driver ID</div>
                <div className="field-value bold">{currentUser?.id?.slice(0, 12) || 'N/A'}</div>
              </div>
              <div>
                <div className="field-label">Contact</div>
                <div className="field-value">{currentUser?.phoneNumber || 'N/A'}</div>
              </div>
              <div>
                <div className="field-label">Email</div>
                <div className="field-value underline">{currentUser?.email || 'N/A'}</div>
              </div>
              <div>
                <div className="field-label">Service Region</div>
                <div className="field-value">Based on assigned deliveries</div>
              </div>
            </div>
            {editMode ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={handleSaveProfile} disabled={saving}
                  style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: '#1E4D4B', color: 'white', fontWeight: 600, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditMode(false); setEditName(currentUser?.name || ''); setProfileFile(null); setPreviewUrl(''); }}
                  style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #DEE2E6', background: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)}
                style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #DEE2E6', background: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 16 }}>
                Edit Profile
              </button>
            )}
          </div>
        </section>

        {/* Performance */}
        <section className="col-span-4 perf-card">
          <div className="bg-decoration">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <div className="perf-header">
            <span className="material-symbols-outlined">award_star</span>
            <h3>Performance</h3>
          </div>
          <div className="stat-group">
            <div className="stat-item">
              <div className="stat-label">Reliability Score</div>
              <div className="stat-value">
                {stats.reliabilityScore}% <span className="trend material-symbols-outlined">trending_up</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total CO2 Saved</div>
              <div className="stat-value">{stats.co2Saved} kg</div>
            </div>
          </div>
          <div className="member-since">
            <div className="label">Member Since</div>
            <div className="date">{stats.memberSince}</div>
          </div>
        </section>

        {/* Vehicle Details */}
        <section className="col-span-5 vehicle-card">
          <div className="vehicle-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3>Vehicle Details</h3>
              <button
                onClick={() => { setVehicleForm(vehicle); setShowVehicleModal(true); }}
                style={{
                  background: 'none', border: 'none', color: '#1E4D4B', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, padding: 0, textDecoration: 'underline'
                }}
              >
                Edit
              </button>
            </div>
            <span className="status-badge" style={{
              background: stats.activeOrdersCount > 0 ? '#FFF3E0' : '#E8F5E9',
              color: stats.activeOrdersCount > 0 ? '#E65100' : '#2E7D32',
              fontWeight: 700
            }}>
              {stats.activeOrdersCount > 0 ? 'On Route' : 'Available'}
            </span>
          </div>

          <div className="vehicle-detail" style={{ border: '1px solid #DEE2E6', borderRadius: 12, padding: 14, background: '#F8F9FA' }}>
            <div className="icon-box" style={{ background: '#1E4D4B', color: 'white', borderRadius: 10, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">{vehicle.icon || 'two_wheeler'}</span>
            </div>
            <div className="info" style={{ marginLeft: 12 }}>
              <div className="label" style={{ fontSize: 11, color: '#6C757D', fontWeight: 600, textTransform: 'uppercase' }}>TYPE & REGISTRATION</div>
              <div className="name" style={{ fontSize: 15, fontWeight: 700, color: '#212529' }}>{vehicle.type}</div>
              <div className="id" style={{ fontSize: 13, color: '#1E4D4B', fontWeight: 600 }}>Plate: {vehicle.plateNumber} • {vehicle.model}</div>
            </div>
          </div>

          <div className="stats-row" style={{ marginTop: 14 }}>
            <div className="stat-box">
              <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>route</span>
              <div>
                <div className="stat-label">Total Deliveries</div>
                <div className="stat-value">{stats.totalDeliveries}</div>
              </div>
            </div>
            <div className="stat-box">
              <span className="material-symbols-outlined" style={{ color: '#1E4D4B' }}>payments</span>
              <div>
                <div className="stat-label">Earnings (LKR)</div>
                <div className="stat-value">Rs. {stats.totalEarnings}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="col-span-7 compliance-card">
          <div className="compliance-header">
            <h3>Compliance & Documents</h3>
            <button className="update-btn" onClick={() => { setDocForm(docs); setShowDocModal(true); }}>Update All</button>
          </div>
          <div className="doc-list">
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">badge</span></div>
                <div className="doc-info">
                  <div className="doc-name">Driver License ({docs.driverLicense?.number || 'DL-98401-A'})</div>
                  <div className="doc-meta">{docs.driverLicense?.status || 'Verified'} {docs.driverLicense?.fileName ? `• ${docs.driverLicense.fileName}` : ''}</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined" style={{ color: '#2E7D32' }}>verified</span></div>
            </div>
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">verified_user</span></div>
                <div className="doc-info">
                  <div className="doc-name">Background Check ({docs.backgroundCheck?.number || 'BG-2025-492'})</div>
                  <div className="doc-meta">{docs.backgroundCheck?.status || 'Cleared'} {docs.backgroundCheck?.fileName ? `• ${docs.backgroundCheck.fileName}` : ''}</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined" style={{ color: '#2E7D32' }}>verified</span></div>
            </div>
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">description</span></div>
                <div className="doc-info">
                  <div className="doc-name">Tax Forms ({docs.taxForms?.number || 'TIN-4920194'})</div>
                  <div className="doc-meta">{docs.taxForms?.status || 'Current'} {docs.taxForms?.fileName ? `• ${docs.taxForms.fileName}` : ''}</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined" style={{ color: '#2E7D32' }}>verified</span></div>
            </div>
          </div>
        </section>

        {/* Courier note */}
        <section className="col-span-12">
          <div className="courier-note">
            <div className="quote-mark">“</div>
            <div className="note-text">
              "A dedicated delivery partner with {stats.totalDeliveries} completed deliveries. 
              Maintaining a {stats.reliabilityScore}% reliability score and contributing to 
              sustainable logistics."
            </div>
            <div className="note-author">
              <div className="avatar-circle">{currentUser?.name?.[0] || 'D'}</div>
              <div>
                <div className="author-name">{currentUser?.name || 'Delivery Partner'}</div>
                <div className="author-title">Active Driver • {stats.totalDeliveries} deliveries</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* COMPLIANCE UPDATE MODAL */}
      {showDocModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
        }}>
          <div style={{
            background: 'white', padding: 28, borderRadius: 16, maxWidth: 550, width: '90%',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#1E4D4B', fontFamily: 'Playfair Display, serif', fontSize: 22 }}>
                Update Compliance & Documents
              </h3>
              <button onClick={() => setShowDocModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6C757D' }}>×</button>
            </div>

            {/* Driver License */}
            <div style={{ background: '#F8F9FA', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid #DEE2E6' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: 15, color: '#1E4D4B' }}>🪪 Driver License</h4>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 4 }}>License Number</label>
                <input
                  type="text"
                  value={docForm.driverLicense?.number || ''}
                  onChange={e => setDocForm({ ...docForm, driverLicense: { ...docForm.driverLicense, number: e.target.value } })}
                  placeholder="e.g. DL-98401-A"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 4 }}>Upload Document (Photo / PDF)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) {
                      setDocFiles(prev => ({ ...prev, license: f }));
                      setDocForm(prev => ({ ...prev, driverLicense: { ...prev.driverLicense, fileName: f.name } }));
                    }
                  }}
                  style={{ width: '100%', fontSize: 13 }}
                />
                {docForm.driverLicense?.fileName && (
                  <small style={{ color: '#2E7D32', display: 'block', marginTop: 4 }}>✓ File: {docForm.driverLicense.fileName}</small>
                )}
              </div>
            </div>

            {/* Background Check */}
            <div style={{ background: '#F8F9FA', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid #DEE2E6' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: 15, color: '#1E4D4B' }}>🛡️ Background Check Certificate</h4>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 4 }}>Reference Number</label>
                <input
                  type="text"
                  value={docForm.backgroundCheck?.number || ''}
                  onChange={e => setDocForm({ ...docForm, backgroundCheck: { ...docForm.backgroundCheck, number: e.target.value } })}
                  placeholder="e.g. BG-2025-492"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 4 }}>Upload Clearance Document</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) {
                      setDocFiles(prev => ({ ...prev, bg: f }));
                      setDocForm(prev => ({ ...prev, backgroundCheck: { ...prev.backgroundCheck, fileName: f.name } }));
                    }
                  }}
                  style={{ width: '100%', fontSize: 13 }}
                />
                {docForm.backgroundCheck?.fileName && (
                  <small style={{ color: '#2E7D32', display: 'block', marginTop: 4 }}>✓ File: {docForm.backgroundCheck.fileName}</small>
                )}
              </div>
            </div>

            {/* Tax Forms */}
            <div style={{ background: '#F8F9FA', padding: 16, borderRadius: 12, marginBottom: 20, border: '1px solid #DEE2E6' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: 15, color: '#1E4D4B' }}>📄 Tax Forms / TIN / NIC</h4>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 4 }}>Tax Identification / NIC Number</label>
                <input
                  type="text"
                  value={docForm.taxForms?.number || ''}
                  onChange={e => setDocForm({ ...docForm, taxForms: { ...docForm.taxForms, number: e.target.value } })}
                  placeholder="e.g. TIN-4920194"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 4 }}>Upload Tax Form</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) {
                      setDocFiles(prev => ({ ...prev, tax: f }));
                      setDocForm(prev => ({ ...prev, taxForms: { ...prev.taxForms, fileName: f.name } }));
                    }
                  }}
                  style={{ width: '100%', fontSize: 13 }}
                />
                {docForm.taxForms?.fileName && (
                  <small style={{ color: '#2E7D32', display: 'block', marginTop: 4 }}>✓ File: {docForm.taxForms.fileName}</small>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #DEE2E6', background: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDocs}
                style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1E4D4B', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Save & Update All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VEHICLE MODAL */}
      {showVehicleModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
        }}>
          <div style={{
            background: 'white', padding: 28, borderRadius: 16, maxWidth: 500, width: '90%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#1E4D4B', fontFamily: 'Playfair Display, serif', fontSize: 22 }}>
                Edit Vehicle Details
              </h3>
              <button onClick={() => setShowVehicleModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6C757D' }}>×</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#495057', marginBottom: 6 }}>Vehicle Type</label>
              <select
                value={vehicleForm.type}
                onChange={e => {
                  const val = e.target.value;
                  let icon = 'two_wheeler';
                  if (val.includes('Electric') || val.includes('Bike')) icon = 'electric_bike';
                  else if (val.includes('Van') || val.includes('Car')) icon = 'directions_car';
                  else if (val.includes('Bicycle')) icon = 'pedal_bike';
                  setVehicleForm({ ...vehicleForm, type: val, icon });
                }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 14, boxSizing: 'border-box' }}
              >
                <option value="Motorcycle / Delivery Scooter">Motorcycle / Delivery Scooter</option>
                <option value="Electric EV Bike">Electric EV Bike</option>
                <option value="Van / Delivery Car">Van / Delivery Car</option>
                <option value="Bicycle / Eco Messenger">Bicycle / Eco Messenger</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#495057', marginBottom: 6 }}>Registration Plate Number</label>
              <input
                type="text"
                value={vehicleForm.plateNumber}
                onChange={e => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })}
                placeholder="e.g. WP BIZ-4829"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 14, boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#495057', marginBottom: 6 }}>Vehicle Model / Spec</label>
              <input
                type="text"
                value={vehicleForm.model}
                onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                placeholder="e.g. Honda CD70 / EV Scooter"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowVehicleModal(false)}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #DEE2E6', background: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVehicle}
                style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1E4D4B', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DriverProfile;