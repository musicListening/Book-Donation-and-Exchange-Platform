// pages/staff/BundleManagement.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function BundleManagement() {
  const [bundles] = useState([
    { 
      id: '#BND-9012', 
      name: 'Colombo Literary Collection', 
      includes: 'Includes: Martin Wickramasinghe, Ediriweera Sarachchandra, Gunadasa Amarasekara', 
      items: 12, 
      value: 45000.00, 
      status: 'PUBLISHED', 
      date: 'Oct 24, 2023' 
    },
    { 
      id: '#BND-9014', 
      name: 'Ancient Ceylon History Series', 
      includes: 'Includes: Anuradhapura Kingdom, Polonnaruwa Era, Kandyan Period', 
      items: 8, 
      value: 32500.50, 
      status: 'DRAFT', 
      date: 'Nov 02, 2023' 
    },
    { 
      id: '#BND-8892', 
      name: 'Sri Lankan Wildlife Collection', 
      includes: 'Includes: Yala National Park, Sinharaja Rainforest, Elephant Conservation', 
      items: 15, 
      value: 52800.00, 
      status: 'SOLD', 
      date: 'Oct 15, 2023' 
    },
    { 
      id: '#BND-9101', 
      name: 'Buddhist Philosophy Series', 
      includes: 'Includes: Dhamma Teachings, Jataka Stories, Meditation Guide', 
      items: 25, 
      value: 87500.00, 
      status: 'PUBLISHED', 
      date: 'Nov 10, 2023' 
    },
    { 
      id: '#BND-9123', 
      name: 'Tea Estate Stories of Nuwara Eliya', 
      includes: 'Includes: Plantation Life, British Era Tales, Hill Country Memoirs', 
      items: 10, 
      value: 42300.00, 
      status: 'PUBLISHED', 
      date: 'Dec 01, 2023' 
    },
    { 
      id: '#BND-9145', 
      name: 'Galle Fort Heritage Collection', 
      includes: 'Includes: Dutch Colonial Era, Maritime History, Fort Architecture', 
      items: 7, 
      value: 28900.00, 
      status: 'DRAFT', 
      date: 'Dec 12, 2023' 
    },
  ]);

  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });

  useEffect(() => {
    // Get logged-in user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'OPERATIONS_STAFF'
      });
    }
  }, []);

  // Get user initials for avatar
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
          <h1>Bundle Management</h1>
          <p className="page-subtitle">Curate, monitor, and publish book collections for the marketplace.</p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Active Bundles</h3>
          <div className="stat-value">156</div>
          <div className="stat-trend">▲ 6.8% from last month</div>
        </div>
        <div className="stat-card">
          <h3>Pending Publication</h3>
          <div className="stat-value">23</div>
          <div className="stat-sub">Requires curator approval</div>
        </div>
        <div className="stat-card">
          <h3>Marketplace Revenue</h3>
          <div className="stat-value">Rs. 1,245,000</div>
          <div className="stat-sub">Current fiscal quarter</div>
        </div>
        <div className="stat-card">
          <h3>Average Bundle Value</h3>
          <div className="stat-value">Rs. 45,200</div>
          <div className="stat-sub">Based on 156 items avg.</div>
        </div>
      </div>

      <div className="bundle-table-section">
        <div className="table-header">
          <h3>Bundle Inventory</h3>
          <div className="table-controls">
            <button className="filter-btn">All Statuses ▼</button>
            <button className="filter-btn">Sort by: Date Created ▼</button>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>BUNDLE ID</th>
                <th>BUNDLE NAME</th>
                <th>ITEMS</th>
                <th>VALUE (Rs.)</th>
                <th>STATUS</th>
                <th>DATE CREATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {bundles.map((bundle) => (
                <tr key={bundle.id}>
                  <td className="bundle-id">{bundle.id}</td>
                  <td>
                    <div className="bundle-name">{bundle.name}</div>
                    <div className="bundle-includes">{bundle.includes}</div>
                  </td>
                  <td>{bundle.items}</td>
                  <td>Rs. {bundle.value.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status-badge ${bundle.status.toLowerCase()}`}>
                      {bundle.status}
                    </span>
                  </td>
                  <td>{bundle.date}</td>
                  <td>
                    <button className="action-btn">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing 1-6 of 156 bundles</span>
          <button className="new-donation-btn">+ New Donation</button>
        </div>
      </div>
    </StaffLayout>
  );
}

export default BundleManagement;