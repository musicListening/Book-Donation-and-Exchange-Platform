import React, { useState, useEffect } from 'react';
import '../../styles/delivery.css';

const DriverProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user.id) return;
      try {
        const res = await fetch(`/api/orders/driver/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching orders for profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.id]);

  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalDeliveries = completedOrders.length;
  const totalOrders = orders.length;
  const reliabilityScore = totalOrders > 0 ? Math.round((totalDeliveries / totalOrders) * 100) : 0;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  const getInitials = (name) => {
    if (!name) return 'DR';
    const parts = name.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="page-header">
        <h1 style={{ fontSize: '40px' }}>Driver Profile</h1>
        <p>Manage your professional credentials and delivery performance.</p>
      </div>

      <div className="profile-grid">
        {/* Identity */}
        <section className="col-span-8 identity-card">
          <div className="info">
            <div className="name-title">
              <h3>{user.name || 'Delivery Driver'}</h3>
              <p>{user.role === 'DELIVERY_PERSONNEL' ? 'Delivery Partner' : user.role || 'Logistics Partner'}</p>
            </div>
            <div className="details-grid">
              <div>
                <div className="field-label">Driver ID</div>
                <div className="field-value bold">{user.id ? `DRV-${user.id.slice(0, 8).toUpperCase()}` : 'N/A'}</div>
              </div>
              <div>
                <div className="field-label">Contact</div>
                <div className="field-value">{user.phoneNumber || 'Not set'}</div>
              </div>
              <div>
                <div className="field-label">Email</div>
                <div className="field-value underline">{user.email || 'Not set'}</div>
              </div>
              <div>
                <div className="field-label">Service Region</div>
                <div className="field-value">{user.address || 'Not set'}</div>
              </div>
            </div>
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
                {loading ? '...' : `${reliabilityScore}%`} <span className="trend material-symbols-outlined">trending_up</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Deliveries</div>
              <div className="stat-value">{loading ? '...' : totalDeliveries}</div>
            </div>
          </div>
          <div className="member-since">
            <div className="label">Member Since</div>
            <div className="date">{memberSince}</div>
          </div>
        </section>

        {/* Vehicle */}
        <section className="col-span-5 vehicle-card">
          <div className="vehicle-header">
            <h3>Vehicle Details</h3>
            <span className="status-badge">Active</span>
          </div>
          <div className="vehicle-detail">
            <div className="icon-box">
              <span className="material-symbols-outlined">electric_bike</span>
            </div>
            <div className="info">
              <div className="label">Type</div>
              <div className="name">Eco-Cargo E-Bike v4</div>
              <div className="id">{user.id ? `ARB-${user.id.slice(0, 4).toUpperCase()}-EB` : 'N/A'}</div>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>battery_horiz_075</span>
              <div>
                <div className="stat-label">Battery</div>
                <div className="stat-value">84%</div>
              </div>
            </div>
            <div className="stat-box">
              <span className="material-symbols-outlined" style={{ color: 'var(--on-tertiary-container)' }}>settings_suggest</span>
              <div>
                <div className="stat-label">Service in</div>
                <div className="stat-value">12 days</div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="col-span-7 compliance-card">
          <div className="compliance-header">
            <h3>Compliance & Documents</h3>
            <button className="update-btn">Update All</button>
          </div>
          <div className="doc-list">
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">badge</span></div>
                <div className="doc-info">
                  <div className="doc-name">Driver License</div>
                  <div className="doc-meta">Expires: Dec 2025</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined">chevron_right</span></div>
            </div>
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">verified_user</span></div>
                <div className="doc-info">
                  <div className="doc-name">Insurance Policy</div>
                  <div className="doc-meta">Verified • Auto-renews Mar 2024</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined">chevron_right</span></div>
            </div>
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">description</span></div>
                <div className="doc-info">
                  <div className="doc-name">Tax Forms (FY23)</div>
                  <div className="doc-meta">Ready for download</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined download">download</span></div>
            </div>
          </div>
        </section>

        {/* Courier note */}
        <section className="col-span-12">
          <div className="courier-note">
            <div className="quote-mark">"</div>
            <div className="note-text">
              "{user.name || 'This driver'} is a valued member of the ShareShelf delivery team. Their dedication to eco-friendly logistics and reliable service makes them a key contributor to our community platform."
            </div>
            <div className="note-author">
              <div className="avatar-circle">{getInitials(user.name)}</div>
              <div>
                <div className="author-name">{user.name || 'Driver'}</div>
                <div className="author-title">ShareShelf Delivery Partner</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DriverProfile;